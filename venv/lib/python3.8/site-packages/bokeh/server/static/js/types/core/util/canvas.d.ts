export declare type Context2d = {
    setLineDashOffset(offset: number): void;
    getLineDashOffset(): number;
    setImageSmoothingEnabled(value: boolean): void;
    getImageSmoothingEnabled(): boolean;
    measureText(text: string): TextMetrics & {
        ascent: number;
    };
} & CanvasRenderingContext2D;
export declare function fixup_ctx(ctx: any): void;
