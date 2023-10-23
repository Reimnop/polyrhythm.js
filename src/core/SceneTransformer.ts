import { mat4 } from "gl-matrix";
import { SceneNode } from "../data";

export interface SceneTransformer {
    getNodeTransform(node: SceneNode): mat4;
}