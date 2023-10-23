export interface Key {
    time: number;
}

export interface TypedKey<T> extends Key {
    value: T;
}