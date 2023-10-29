import { vec3 } from "gl-matrix";
import { ShadedTriangle, StagingVertex, Triangle } from "../../data";
import { Shader } from "./Shader";

export class TriangleShaderSolidColor implements Shader<Triangle<StagingVertex>, ShadedTriangle> {
    process(input: Triangle<StagingVertex>): ShadedTriangle {
        const a = this.processVertex(input.a);
        const b = this.processVertex(input.b);
        const c = this.processVertex(input.c);
        const triangle: Triangle<vec3> = {
            a: a.position,
            b: b.position,
            c: c.position
        };
        const color = vec3.fromValues(
            (a.color[0] + b.color[0] + c.color[0]) / 3.0,
            (a.color[1] + b.color[1] + c.color[1]) / 3.0,
            (a.color[2] + b.color[2] + c.color[2]) / 3.0
        );
        return {
            triangle,
            color
        };
    }

    processVertex(vertex: StagingVertex): { position: vec3, color: vec3 } {
        const color = vertex.color;
        return {
            position: 
                vec3.fromValues(
                    vertex.position[0] / vertex.position[3], 
                    vertex.position[1] / vertex.position[3], 
                    vertex.position[2] / vertex.position[3]
                ),
            color: color
        };
    }
}