import { quat, vec3 } from "gl-matrix";
import { TypedKey } from "./Key";

export interface NodeAnimation {
    name: string;
    positionKeys: TypedKey<vec3>[];
    scaleKeys: TypedKey<vec3>[];
    rotationKeys: TypedKey<quat>[];
}