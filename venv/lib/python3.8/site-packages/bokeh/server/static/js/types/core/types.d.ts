export declare type ID = string;
export declare type Color = string;
export { TypedArray } from "./util/ndarray";
export declare type Arrayable<T = any> = {
    readonly length: number;
    [n: number]: T;
    [Symbol.iterator](): IterableIterator<T>;
};
export declare type ArrayableNew = {
    new <T>(n: number): Arrayable<T>;
};
export declare type ArrayableOf<T> = T extends unknown ? Arrayable<T> : never;
export declare type Data = {
    [key: string]: Arrayable<unknown>;
};
export declare type Attrs = {
    [key: string]: unknown;
};
export declare type PlainObject<T = unknown> = {
    [key: string]: T;
};
export declare type Size = {
    width: number;
    height: number;
};
export declare type Box = {
    x: number;
    y: number;
    width: number;
    height: number;
};
export declare type Rect = {
    x0: number;
    y0: number;
    x1: number;
    y1: number;
};
export declare type Extents = {
    left: number;
    top: number;
    right: number;
    bottom: number;
};
export declare type Interval = {
    start: number;
    end: number;
};
