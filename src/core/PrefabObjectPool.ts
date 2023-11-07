import { vec2 } from "gl-matrix";
import { RightTriangle, AnimatedRightTriangle, TypedKey } from "../data";

class StagingPrefabObject {
    public readonly positionKeys: TypedKey<vec2>[] = [];
    public readonly scaleKeys: TypedKey<vec2>[] = [];
    public readonly rotationKeys: TypedKey<number>[] = [];
    public readonly colorKeys: TypedKey<number>[] = [];
    public startTime: number = Number.POSITIVE_INFINITY;
    public killTime: number = Number.NEGATIVE_INFINITY;

    ensureAlive(time: number) {
        this.startTime = Math.min(this.startTime, time);
        this.killTime = Math.max(this.killTime, time);
    }

    pushKeys(time: number, position: vec2, scale: vec2, rotation: number, color: number) {
        if (this.positionKeys.length === 0 || this.positionKeys[this.positionKeys.length - 1].value !== position)
            this.positionKeys.push({ time, value: position });
        if (this.scaleKeys.length === 0 || this.scaleKeys[this.scaleKeys.length - 1].value !== scale)
            this.scaleKeys.push({ time, value: scale });
        if (this.rotationKeys.length === 0 || this.rotationKeys[this.rotationKeys.length - 1].value !== rotation)
            this.rotationKeys.push({ time, value: rotation });
        if (this.colorKeys.length === 0 || this.colorKeys[this.colorKeys.length - 1].value !== color)
            this.colorKeys.push({ time, value: color });
    }
}

export class PrefabObjectPool {
    private readonly capacity: number;
    private readonly stagingObjects: StagingPrefabObject[];

    constructor(capacity: number) {
        this.capacity = capacity;
        this.stagingObjects = new Array<StagingPrefabObject>(capacity);
        for (let i = 0; i < capacity; i++)
            this.stagingObjects[i] = new StagingPrefabObject();
    }

    addFrame(time: number, triangles: RightTriangle[]) {
        // Sort by render depth
        triangles.sort((a, b) => a.depth - b.depth);

        // Check if it exceeds capacity
        if (triangles.length > this.capacity)
            throw new Error("Prefab object pool capacity exceeded!");

        // Add triangles to staging objects
        for (let i = 0; i < triangles.length; i++) {
            const triangle = triangles[i];
            const position = triangle.position;
            const scale = triangle.scale;
            const rotation = triangle.rotation;
            const color = triangle.themeColor;
            const stagingObject = this.stagingObjects[i];
            stagingObject.pushKeys(time, position, scale, rotation, color);
            stagingObject.ensureAlive(time);
        }
        for (let i = triangles.length; i < this.capacity; i++) {
            const position = vec2.fromValues(0.0, 0.0);
            const scale = vec2.fromValues(0.0, 0.0);
            const rotation = 0.0;
            const color = 0;
            this.stagingObjects[i].pushKeys(time, position, scale, rotation, color);
            // We don't ensureAlive here because we are not sure if it is alive or not
        }
    }

    *buildPrefabTriangles(): Iterable<AnimatedRightTriangle> {
        const depthStart = -80.0;
        const depthEnd = 80.0;
        const depthStep = (depthEnd - depthStart) / this.capacity;
        for (const [i, stagingObject] of this.stagingObjects.entries()) {
            if (stagingObject.startTime > stagingObject.killTime)
                continue;
            const depth = Math.round(depthEnd - i * depthStep);
            yield {
                positionKeys: stagingObject.positionKeys,
                scaleKeys: stagingObject.scaleKeys,
                rotationKeys: stagingObject.rotationKeys,
                colorKeys: stagingObject.colorKeys,
                startTime: stagingObject.startTime,
                killTime: stagingObject.killTime,
                renderDepth: depth
            }
        }
    }
}