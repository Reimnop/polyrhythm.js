import { vec2 } from "gl-matrix";
import { TypedKey } from "./Key";

export interface AnimatedRightTriangle {
    positionKeys: TypedKey<vec2>[];
    scaleKeys: TypedKey<vec2>[];
    rotationKeys: TypedKey<number>[];
    colorKeys: TypedKey<number>[];
    startTime: number;
    killTime: number;
    renderDepth: number;
}