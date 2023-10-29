import { vec2 } from "gl-matrix";
import { Scene } from "./Scene";
import { SceneTransformer } from "../core";

export interface Configuration {
    scene: Scene;
    sceneTransformer: SceneTransformer | null;
    shadingDepth: number;
    colorResolution: number;
    duration: number;
    aspectRatio: number;
    frameRate: number;
}