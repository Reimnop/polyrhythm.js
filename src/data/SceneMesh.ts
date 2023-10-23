import { Vertex } from "./Vertex";

export interface SceneMesh {
    name: string;
    vertices: Vertex[];
    indices: number[];
}