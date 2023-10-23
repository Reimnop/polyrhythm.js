import { mat4 } from "gl-matrix";
import { NodeMesh } from "./NodeMesh";

export interface SceneNode {
    name: string;
    transform: mat4;
    meshes: NodeMesh[];
    children: SceneNode[];
}