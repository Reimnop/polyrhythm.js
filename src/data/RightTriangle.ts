import { vec2 } from "gl-matrix";

export interface RightTriangle {
    position: vec2;
    scale: vec2;
    rotation: number;
    depth: number;
    themeColor: number;
}