import { Triangle } from "../data";

export function* assembleVertices<T>(vertices: T[], indices: number[]): Iterable<Triangle<T>> {
    const vertexQueue: T[] = [];
    for (const index of indices) {
        vertexQueue.push(vertices[index]);
        if (vertexQueue.length === 3) {
            yield {
                a: vertexQueue[0],
                b: vertexQueue[1],
                c: vertexQueue[2]
            };
            vertexQueue.length = 0;
        }
    }
}