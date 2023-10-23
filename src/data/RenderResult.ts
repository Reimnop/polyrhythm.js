import { vec3 } from "gl-matrix";
import { AnimatedRightTriangle } from "./AnimatedRightTriangle";

export interface RenderResult {
    animatedRightTriangles: AnimatedRightTriangle[];
    colorPalette: vec3[];
    totalTriangleCount: number;
    totalFrameCount: number;
}