import { vec3 } from "gl-matrix";

export enum SceneLightType {
    Directional,
    Point,
    Spot
}

export interface SceneLight {
    name: string;
    type: SceneLightType;
    color: vec3;
    intensity: number;
    innerConeAngle: number;
    outerConeAngle: number;
    range: number;
    falloff: number;
}