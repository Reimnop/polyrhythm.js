import fluent from "fluent-iterable";
import { Pipeline, PrefabObjectPool, TriangleShader, TriangleShaderSolidColor, VertexShader, computeRightTriangleTransform, computeRightTriangles, generateColorPalette } from "./core";
import { Configuration, RenderResult, RightTriangle, ShadedTriangle, Triangle } from "./data";
import { vec2, vec3 } from "gl-matrix";

type RenderedFrame = {
    triangles: ShadedTriangle[];
}

export type InitializeCallback = () => void;
export type UpdateCallback = (time: number) => void;

export class Converter {
    private readonly configuration: Configuration;
    private readonly initializeCallback: InitializeCallback | null;
    private readonly updateCallback: UpdateCallback | null;

    public constructor(
            configuration: Configuration, 
            initializeCallback: InitializeCallback | null = null, 
            updateCallback: UpdateCallback | null = null
        ) {
        this.configuration = configuration;
        this.initializeCallback = initializeCallback;
        this.updateCallback = updateCallback;
    }

    render(): RenderResult {
        const scene = this.configuration.scene;
        const sceneTransformer = this.configuration.sceneTransformer;
        const frameDuration = 1.0 / this.configuration.frameRate;

        // Generate color palette
        const palette = generateColorPalette(scene, this.configuration.shadingDepth, this.configuration.colorResolution);

        // Initialize pipeline
        const pipeline = new Pipeline(
            scene, 
            sceneTransformer,
            (model, view, projection) => new VertexShader(model, view, projection),
            this.configuration.shadingDepth === 0
                ? () => new TriangleShaderSolidColor()
                : (ambientColor, lightDirection) => new TriangleShader(ambientColor, lightDirection));

        // Render all frames
        const frames: RenderedFrame[] = [];
        for (var t = 0.0; t < this.configuration.duration; t += frameDuration) {
            this.updateCallback?.(t);
            const triangles = pipeline.render(this.configuration.frameSize[0] / this.configuration.frameSize[1]);
            const frame: RenderedFrame = {
                triangles: [...triangles]
            }
            frames.push(frame);
        }

        // Pool all prefab objects
        const maxTrianglesCount = fluent(frames)
            .map(frame => frame.triangles.length * 2)
            .max()!;
        const pool = new PrefabObjectPool(maxTrianglesCount);
        for (let i = 0; i < frames.length; i++) {
            pool.addFrame(i * frameDuration, [...Converter.getRightTriangles(frames[i], palette)]);
        }

        // Return render result
        return {
            animatedRightTriangles: [...pool.buildPrefabTriangles()],
            colorPalette: palette,
            totalTriangleCount: maxTrianglesCount,
            totalFrameCount: frames.length
        };
    }

    private static *getRightTriangles(frame: RenderedFrame, colors: vec3[]): Iterable<RightTriangle> {
        for (const shadedTriangle of frame.triangles) {
            const triangle = shadedTriangle.triangle;
            const depth = (triangle.a[2] + triangle.b[2] + triangle.c[2]) / 3.0;

            // Cull triangles outside clipping range
            if (depth < 0.0 || depth > 1.0)
                continue;

            // Cull back-facing triangles
            if (Converter.computeWinding(triangle) < 0.0)
                continue;

            // Get 2D triangle
            const triangle2d: Triangle<vec2> = {
                a: vec2.fromValues(triangle.a[0], triangle.a[1]),
                b: vec2.fromValues(triangle.b[0], triangle.b[1]),
                c: vec2.fromValues(triangle.c[0], triangle.c[1])
            };

            const rightTriangles = computeRightTriangles(triangle2d);
            const transform0 = computeRightTriangleTransform(rightTriangles[0]);
            const transform1 = computeRightTriangleTransform(rightTriangles[1]);

            // Get color
            const themeColor = Converter.getThemeColor(shadedTriangle.color, colors);

            yield {
                position: transform0.position,
                scale: transform0.scale,
                rotation: transform0.rotation,
                depth: depth,
                themeColor: themeColor
            };

            yield {
                position: transform1.position,
                scale: transform1.scale,
                rotation: transform1.rotation,
                depth: depth,
                themeColor: themeColor
            };
        }
    }

    private static getThemeColor(color: vec3, colors: vec3[]): number {
        let minIndex = 0;
        let minDistance = Number.POSITIVE_INFINITY;
        for (let i = 0; i < colors.length; i++) {
            const other = colors[i];
            const distance = vec3.distance(color, other);
            if (distance < minDistance) {
                minDistance = distance;
                minIndex = i;
            }
        }
        return minIndex;
    }

    private static computeWinding(triangle: Triangle<vec3>): number {
        const ab = vec3.subtract(vec3.create(), triangle.b, triangle.a);
        const ac = vec3.subtract(vec3.create(), triangle.c, triangle.a);
        const cross = vec3.cross(vec3.create(), ab, ac);
        return cross[2];
    }
}