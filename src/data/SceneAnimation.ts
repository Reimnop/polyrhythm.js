import { NodeAnimation } from "./NodeAnimation";

export interface SceneAnimation {
    name: string;
    durationInTicks: number;
    ticksPerSecond: number;
    nodeAnimations: NodeAnimation[];

    getNodeAnimation(name: string): NodeAnimation | null;
}