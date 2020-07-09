export declare const ARRAY_TYPES: {
    uint8: Uint8ArrayConstructor;
    int8: Int8ArrayConstructor;
    uint16: Uint16ArrayConstructor;
    int16: Int16ArrayConstructor;
    uint32: Uint32ArrayConstructor;
    int32: Int32ArrayConstructor;
    float32: Float32ArrayConstructor;
    float64: Float64ArrayConstructor;
};
export declare type DType = keyof typeof ARRAY_TYPES;
export declare const vtk: any;
export declare const vtkns: any;
export declare type VolumeType = {
    buffer: string;
    dims: number[];
    dtype: DType;
    spacing: number[];
    origin: number[] | null;
    extent: number[] | null;
};
export declare function hexToRGB(color: string): number[];
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare type Mapper = {
    palette: string[];
    low: number;
    high: number;
};
export declare function vtkLutToMapper(vtk_lut: any): Mapper;
export declare function data2VTKImageData(data: VolumeType): any;
export declare function majorAxis(vec3: number[], idxA: number, idxB: number): number[];
export declare function cartesian_product(...arrays: any): any;
