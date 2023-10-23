export interface Shader<TIn, TOut> {
    process(input: TIn): TOut;
}