import typescript from "@rollup/plugin-typescript";
import nodeResolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

export default [
    {
        input: "src/index.ts",
        output: {
            dir: "build",
            format: "umd",
            name: "polyrhythmjs",
            sourcemap: true,
            globals: {
                "gl-matrix": "glMatrix",
                "fluent-iterable": "fluent"
            }
        },
        plugins: [
            typescript(),
            commonjs(),
            nodeResolve(),
            terser()
        ]
    }
];