import { Key, TypedKey } from "../data";

export type Interpolator<T> = (a: T, b: T, t: number) => T;

export function interpolate<T>(time: number, keys: TypedKey<T>[], interpolator: Interpolator<T>): T {
    if (keys.length === 0)
        throw new Error("No keys to interpolate on!");

    if (keys.length === 1)
        return keys[0].value;

    if (time < keys[0].time)
        return keys[0].value;

    if (time >= keys[keys.length - 1].time)
        return keys[keys.length - 1].value;

    const index = searchForKeyPair(time, keys);
    const a = keys[index];
    const b = keys[index + 1];
    const t = inverseLerp(a.time, b.time, time);
    return interpolator(a.value, b.value, t);
}

function searchForKeyPair(time: number, keys: Key[]): number {
    let low = 0;
    let high = keys.length - 1;

    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const midTime = keys[mid].time;

        if (time < midTime)
            high = mid - 1;
        else if (time > midTime)
            low = mid + 1;
        else
            return mid;
    }

    return low - 1;
}

function inverseLerp(a: number, b: number, t: number): number {
    return a != b ? (t - a) / (b - a) : 0.0;
}