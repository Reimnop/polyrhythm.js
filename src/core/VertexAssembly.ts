import { Triangle } from "../data";

export function* assembleVertices<T>(vertices: Iterable<T>): Iterable<Triangle<T>> {
    const vertexQueue: T[] = [];
    for (const vertex of vertices) {
        vertexQueue.push(vertex);
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