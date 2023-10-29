import { vec2 } from "gl-matrix";
import { Triangle } from "../data";

type AnglePointPair = {
    position: vec2;
    angle: number;
}

export function computeRightTriangles(triangle: Triangle<vec2>): Triangle<vec2>[] {
    const anglePointPairs: AnglePointPair[] = [
        { 
            position: triangle.a, 
            angle: angleBetween(
                vec2.subtract(vec2.create(), triangle.b, triangle.a), 
                vec2.subtract(vec2.create(), triangle.c, triangle.a)
            ) 
        },
        { 
            position: triangle.b, 
            angle: angleBetween(
                vec2.subtract(vec2.create(), triangle.c, triangle.b), 
                vec2.subtract(vec2.create(), triangle.a, triangle.b)
            ) 
        },
        { 
            position: triangle.c, 
            angle: angleBetween(
                vec2.subtract(vec2.create(), triangle.b, triangle.c), 
                vec2.subtract(vec2.create(), triangle.a, triangle.c)
            ) 
        }
    ];
    // Sort by angle (descending)
    anglePointPairs.sort((a, b) => b.angle - a.angle);

    const tanB = Math.tan(anglePointPairs[1].angle);
    const vecBC = vec2.subtract(vec2.create(), anglePointPairs[2].position, anglePointPairs[1].position);
    const BC = vec2.length(vecBC);
    const AH = 2.0 * triangleArea(triangle) / BC;
    const BH = AH / tanB;
    const H = vec2.lerp(vec2.create(), anglePointPairs[1].position, anglePointPairs[2].position, BH / BC);
    return [
        {
            a: H,
            b: anglePointPairs[0].position,
            c: anglePointPairs[1].position
        },
        {
            a: H,
            b: anglePointPairs[0].position,
            c: anglePointPairs[2].position
        }
    ];
}

export function computeRightTriangleTransform(triangle: Triangle<vec2>): { position: vec2, scale: vec2, rotation: number } {
    const AB = vec2.subtract(vec2.create(), triangle.b, triangle.a);
    const AC = vec2.subtract(vec2.create(), triangle.c, triangle.a);
    const ABDir = vec2.normalize(vec2.create(), AB);
    const ACDir = vec2.normalize(vec2.create(), AC);

    const position = triangle.a;
    const rotation = Math.atan2(ABDir[1], ABDir[0]);
    const rotatedACDir = rotateVec2(ACDir, -rotation);
    const scale = vec2.fromValues(vec2.length(AB), rotatedACDir[1] < 0.0 ? -vec2.length(AC) : vec2.length(AC));
    return { position, scale, rotation };
}

function rotateVec2(vec: vec2, angle: number): vec2 {
    return vec2.fromValues(
        vec[0] * Math.cos(angle) - vec[1] * Math.sin(angle),
        vec[0] * Math.sin(angle) + vec[1] * Math.cos(angle)
    );
}

function triangleArea(triangle: Triangle<vec2>): number {
    return Math.abs((triangle.a[0] * (triangle.b[1] - triangle.c[1]) + triangle.b[0] * (triangle.c[1] - triangle.a[1]) + triangle.c[0] * (triangle.a[1] - triangle.b[1])) / 2.0);
}

function angleBetween(vec0: vec2, vec1: vec2): number {
    return Math.acos(vec2.dot(vec0, vec1) / (vec2.length(vec0) * vec2.length(vec1)));
}