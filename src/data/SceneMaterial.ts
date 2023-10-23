import { vec3 } from "gl-matrix";

export interface SceneMaterial {
    name: string;
    albedo: vec3;
    metallic: number;
    roughness: number;
}