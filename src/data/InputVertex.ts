import { vec3 } from "gl-matrix";

export interface InputVertex {
    position: vec3;
    normal: vec3;
    color: vec3;
    albedo: vec3;
}