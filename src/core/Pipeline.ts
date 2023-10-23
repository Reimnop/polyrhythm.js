import { mat4, quat, vec3 } from "gl-matrix";
import { InputVertex, Scene, SceneLightType, SceneNode, ShadedTriangle, StagingVertex, Triangle, Vertex } from "../data";
import { SceneTransformer } from "./SceneTransformer";
import { Shader } from "./shader";
import { assembleVertices } from "./VertexAssembly";
import fluent, { FluentIterable } from "fluent-iterable";

export type VertexShaderFactory<TIn, TOut> = (model: mat4, view: mat4, projection: mat4) => Shader<TIn, TOut>;
export type TriangleShaderFactory<TIn, TOut> = (ambientColor: vec3, lightDirection: vec3) => Shader<TIn, TOut>;

type RenderData = {
    vertices: FluentIterable<InputVertex>,
    model: mat4
}

export class Pipeline {
    private readonly scene: Scene;
    private readonly sceneTransformer: SceneTransformer | null;
    private readonly vertexShaderFactory: VertexShaderFactory<InputVertex, StagingVertex>;
    private readonly triangleShaderFactory: TriangleShaderFactory<Triangle<StagingVertex>, ShadedTriangle>;

    constructor(
        scene: Scene,
        sceneTransformer: SceneTransformer | null,
        vertexShaderFactory: VertexShaderFactory<InputVertex, StagingVertex>,
        triangleShaderFactory: TriangleShaderFactory<Triangle<StagingVertex>, ShadedTriangle>
    ) {
        this.scene = scene;
        this.sceneTransformer = sceneTransformer;
        this.vertexShaderFactory = vertexShaderFactory;
        this.triangleShaderFactory = triangleShaderFactory;
    }
    
    render(aspectRatio: number): Iterable<ShadedTriangle> {
        // Collect render data
        const renderDatas = fluent(this.collectRenderData(this.scene.rootNode, mat4.identity(mat4.create())));

        // Get camera data
        if (this.scene.cameras.length === 0)
            throw new Error("No camera found in scene!");

        const camera = this.scene.cameras[0];

        // Get node associated with camera
        const cameraNode = this.findNode(this.scene.rootNode, camera.name);
        if (cameraNode === null)
            throw new Error(`Camera node ${camera.name} not found!`);

        // Get camera transform
        const cameraTransform = this.getNodeTransform(cameraNode);

        // Calculate view and projection matrices
        const view = mat4.invert(mat4.create(), cameraTransform);
        const projection = mat4.perspective(mat4.create(), camera.horizontalFov / aspectRatio, aspectRatio, camera.nearClipPlane, camera.farClipPlane);

        // Process render data
        const stagingVertices = this.processRenderData(renderDatas, view, projection);

        // Assemble staging vertices into triangles
        const triangles = fluent(assembleVertices(stagingVertices));

        // Return shaded triangles
        return this.processTriangles(triangles);
    }

    private processTriangles(triangles: FluentIterable<Triangle<StagingVertex>>): FluentIterable<ShadedTriangle> {
        const ambientColor = vec3.fromValues(0.1, 0.1, 0.1);
        const directionalLight = this.scene.lights.find(light => light.type === SceneLightType.Directional);
        if (!directionalLight)
            throw new Error("No directional light found in scene!");
        const node = this.findNode(this.scene.rootNode, directionalLight.name);
        if (!node)
            throw new Error(`Node ${directionalLight.name} not found!`);
        const lightTransform = this.getNodeTransform(node);
        const lightRotation = quat.multiply(quat.create(), directionalLight.rotation, mat4.getRotation(quat.create(), lightTransform));
        const lightDirection = vec3.transformQuat(vec3.create(), vec3.fromValues(0.0, 0.0, -1.0), lightRotation);
        const triangleShader = this.triangleShaderFactory(ambientColor, lightDirection);
        return triangles.map(triangle => triangleShader.process(triangle));
    }

    private processRenderData(renderDatas: FluentIterable<RenderData>, view: mat4, projection: mat4): FluentIterable<StagingVertex> {
        return renderDatas.flatten(renderData => {
            const vertexShader = this.vertexShaderFactory(renderData.model, view, projection);
            return renderData.vertices.map(vertex => vertexShader.process(vertex));
        });
    }

    private *collectRenderData(node: SceneNode, transform: mat4): Iterable<RenderData> {
        const model = mat4.multiply(mat4.create(), transform, this.getNodeTransform(node));

        // Create and yield render data from meshes
        for (const nodeMesh of node.meshes) {
            const mesh = this.scene.meshes[nodeMesh.meshIndex];
            const material = this.scene.materials[nodeMesh.materialIndex];
            const vertices = fluent(mesh.vertices).map((vertex): InputVertex => {
                return {
                    position: vertex.position,
                    normal: vertex.normal,
                    color: vertex.color,
                    albedo: material.albedo
                };
            });
            const renderData: RenderData = {
                vertices,
                model
            }
            yield renderData;
        }

        // Recursively collect render data from child nodes
        for (const child of node.children)
            yield* this.collectRenderData(child, model);
    }

    private getNodeTransform(node: SceneNode): mat4 {
        return this.sceneTransformer?.getNodeTransform(node) ?? node.transform;
    }

    private findNode(node: SceneNode, name: string): SceneNode | null {
        if (node.name === name)
            return node;
        for (const child of node.children) {
            const found = this.findNode(child, name);
            if (found !== null)
                return found;
        }
        return null;
    }
}