import { mat4, quat, vec3 } from "gl-matrix";
import { Scene, SceneAnimation, SceneNode } from "../data";
import { SceneTransformer } from "./SceneTransformer";
import { interpolate } from "./Interpolation";

class TransformableNode {
    public position: vec3;
    public scale: vec3;
    public rotation: quat;

    private readonly node: SceneNode;

    constructor(node: SceneNode) {
        this.node = node;
        this.position = mat4.getTranslation(vec3.create(), this.node.transform);
        this.scale = mat4.getScaling(vec3.create(), this.node.transform);
        this.rotation = mat4.getRotation(quat.create(), this.node.transform);
    }

    reset() {
        this.position = mat4.getTranslation(vec3.create(), this.node.transform);
        this.scale = mat4.getScaling(vec3.create(), this.node.transform);
        this.rotation = mat4.getRotation(quat.create(), this.node.transform);
    }
}

export class AnimationHandler implements SceneTransformer {
    private readonly nodes: Map<string, TransformableNode>;
    private animation: SceneAnimation | null = null;

    constructor(scene: Scene) {
        this.nodes = this.buildNodeMap(scene.rootNode);
    }

    private buildNodeMap(node: SceneNode): Map<string, TransformableNode> {
        const map = new Map<string, TransformableNode>();
        this.buildNodeMapRecursive(node, map);
        return map;
    }

    private buildNodeMapRecursive(node: SceneNode, map: Map<string, TransformableNode>) {
        map.set(node.name, new TransformableNode(node));
        for (const child of node.children)
            this.buildNodeMapRecursive(child, map);
    }

    setAnimation(animation: SceneAnimation) {
        this.animation = animation;

        // Reset all nodes if animation is null
        if (!this.animation)
            for (const node of this.nodes.values())
                node.reset();
    }

    update(time: number) {
        if (!this.animation)
            return;

        const ticks = (time * this.animation.ticksPerSecond) % this.animation.durationInTicks;
        for (const [name, node] of this.nodes) {
            const nodeAnimation = this.animation.getNodeAnimation(name);
            if (!nodeAnimation)
                continue;

            const vec3Interpolator = (a: vec3, b: vec3, t: number) => vec3.lerp(vec3.create(), a, b, t);
            const quatInterpolator = (a: quat, b: quat, t: number) => quat.slerp(quat.create(), a, b, t);

            node.position = interpolate(ticks, nodeAnimation.positionKeys, vec3Interpolator);
            node.scale = interpolate(ticks, nodeAnimation.scaleKeys, vec3Interpolator);
            node.rotation = interpolate(ticks, nodeAnimation.rotationKeys, quatInterpolator);
        }
    }

    getNodeTransform(node: SceneNode): mat4 {
        const transformableNode = this.nodes.get(node.name);
        if (!transformableNode)
            return node.transform;
        return mat4.fromRotationTranslationScale(mat4.create(), transformableNode.rotation, transformableNode.position, transformableNode.scale);
    }
}