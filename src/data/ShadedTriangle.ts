import { vec3 } from "gl-matrix";
import { Triangle } from "./Triangle";

export interface ShadedTriangle {
    triangle: Triangle<vec3>;
    color: vec3;
}