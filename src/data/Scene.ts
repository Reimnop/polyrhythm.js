import { SceneAnimation } from "./SceneAnimation";
import { SceneCamera } from "./SceneCamera";
import { SceneLight } from "./SceneLight";
import { SceneMaterial } from "./SceneMaterial";
import { SceneMesh } from "./SceneMesh";
import { SceneNode } from "./SceneNode";

export interface Scene {
    rootNode: SceneNode;
    cameras: SceneCamera[];
    lights: SceneLight[];
    meshes: SceneMesh[];
    materials: SceneMaterial[];
    animations: SceneAnimation[];
}