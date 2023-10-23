import { quat } from "gl-matrix";

export interface SceneCamera {
    name: string;
    horizontalFov: number;
    nearClipPlane: number;
    farClipPlane: number;
    rotation: quat;
}