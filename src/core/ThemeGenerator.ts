import { vec3 } from "gl-matrix";
import { Scene } from "../data";
import fluent from "fluent-iterable";

export function generateColorPalette(scene: Scene, shadingDepth: number, colorResolution: number): vec3[] {
    const modelColors = getSceneColors(scene, colorResolution);
    const palette: vec3[] = [];
    const colorDistance = 1.0 / shadingDepth * Math.sqrt(3.0); // Will be positive inf if shadingDepth is 0

    const colorIterable = fluent(modelColors)
        .flatten(color => getShades(color, colorDistance));

    for (const color of colorIterable) {
        if (getMinDistance(color, palette) < colorResolution)
            continue;
        palette.push(color);
    }

    return palette;
}

function *getShades(color: vec3, colorDistance: number): Iterable<vec3> {
    yield color;

    if (colorDistance > Math.sqrt(3.0))
        return;

    let shade = color;
    while (vec3.length(shade) > 0.0) {
        const shadeLength = vec3.length(shade);
        const newShadeLength = Math.max(shadeLength - colorDistance, 0.0);
        shade = vec3.scale(vec3.create(), vec3.normalize(vec3.create(), shade), newShadeLength);
        yield shade;
    }
}

function getSceneColors(scene: Scene, colorResolution: number): vec3[] {
    const colors: vec3[] = [];
    for (const material of scene.materials) {
        const color = material.albedo;
        if (getMinDistance(color, colors) < colorResolution)
            continue;
        colors.push(color);
    }
    return colors;
}

function getMinDistance(value: vec3, values: vec3[]): number {
    if (values.length === 0)
        return Number.POSITIVE_INFINITY;

    const result = fluent(values)
        .map(other => vec3.distance(value, other))
        .min()!;

    return result;
}