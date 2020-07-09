export declare type DataType = "uint8" | "int8" | "uint16" | "int16" | "uint32" | "int32" | "float32" | "float64";
export declare class Uint8NDArray extends Uint8Array {
    readonly __ndarray__: symbol;
    readonly dtype: "uint8";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Int8NDArray extends Int8Array {
    readonly __ndarray__: symbol;
    readonly dtype: "int8";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Uint16NDArray extends Uint16Array {
    readonly __ndarray__: symbol;
    readonly dtype: "uint16";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Int16NDArray extends Int16Array {
    readonly __ndarray__: symbol;
    readonly dtype: "int16";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Uint32NDArray extends Uint32Array {
    readonly __ndarray__: symbol;
    readonly dtype: "uint32";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Int32NDArray extends Int32Array {
    readonly __ndarray__: symbol;
    readonly dtype: "int32";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Float32NDArray extends Float32Array {
    readonly __ndarray__: symbol;
    readonly dtype: "float32";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare class Float64NDArray extends Float64Array {
    readonly __ndarray__: symbol;
    readonly dtype: "float64";
    readonly shape: number[];
    constructor(seq: ArrayLike<number> | ArrayBufferLike, shape?: number[]);
}
export declare type TypedArray = Uint8Array | Int8Array | Uint16Array | Int16Array | Uint32Array | Int32Array | Float32Array | Float64Array;
export declare type NDArray = Uint8NDArray | Int8NDArray | Uint16NDArray | Int16NDArray | Uint32NDArray | Int32NDArray | Float32NDArray | Float64NDArray;
export declare function is_NDArray(v: unknown): v is NDArray;
export declare type NDArrayTypes = {
    "uint8": {
        typed: Uint8Array;
        ndarray: Uint8NDArray;
    };
    "int8": {
        typed: Int8Array;
        ndarray: Int8NDArray;
    };
    "uint16": {
        typed: Uint16Array;
        ndarray: Uint16NDArray;
    };
    "int16": {
        typed: Int16Array;
        ndarray: Int16NDArray;
    };
    "uint32": {
        typed: Uint32Array;
        ndarray: Uint32NDArray;
    };
    "int32": {
        typed: Int32Array;
        ndarray: Int32NDArray;
    };
    "float32": {
        typed: Float32Array;
        ndarray: Float32NDArray;
    };
    "float64": {
        typed: Float64Array;
        ndarray: Float64NDArray;
    };
};
export declare function ndarray<K extends DataType = "float64">(array: ArrayBuffer | number[], options?: {
    dtype?: K;
    shape?: number[];
}): NDArrayTypes[K]["ndarray"];
export declare function ndarray<K extends DataType>(array: NDArrayTypes[K]["typed"], options?: {
    dtype?: K;
    shape?: number[];
}): NDArrayTypes[K]["ndarray"];
