import { vec3, vec4 } from "gl-matrix";

export interface StagingVertex {
    position: vec4;
    normal: vec3;
    color: vec3;
}