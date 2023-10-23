import typescript from "@rollup/plugin-typescript";

export default [
    {
        input: "src/index.ts",
        output: {
            dir: "build",
            format: "umd",
            name: "polyrhythmjs",
            globals: {
                "gl-matrix": "glMatrix",
                "fluent-iterable": "fluent"
            }
        },
        external: [
            "gl-matrix",
            "fluent-iterable"
        ],
        plugins: [
            typescript()
        ]
    }
];