import { mat4, vec3, vec4 } from "gl-matrix";
import { InputVertex, StagingVertex } from "../../data";
import { Shader } from "./Shader";

export class VertexShader implements Shader<InputVertex, StagingVertex> {
    private readonly model: mat4;
    private readonly modelViewProjection: mat4;

    constructor(model: mat4, view: mat4, projection: mat4) {
        this.model = model;
        this.modelViewProjection = mat4.multiply(mat4.create(), projection, mat4.multiply(mat4.create(), view, model));
    }

    process(input: InputVertex): StagingVertex {
        const position: vec4 = vec4.transformMat4(
            vec4.create(), 
            vec4.fromValues(input.position[0], input.position[1], input.position[2], 1.0),
            this.modelViewProjection);
        const normalMatrix: mat4 = mat4.invert(mat4.create(), mat4.transpose(mat4.create(), this.model));
        const normal: vec4 = vec4.transformMat4(
            vec4.create(), 
            vec4.fromValues(input.normal[0], input.normal[1], input.normal[2], 0.0),
            normalMatrix);
        return {
            position,
            normal: vec3.fromValues(normal[0], normal[1], normal[2]),
            color: input.color
        };
    }
}