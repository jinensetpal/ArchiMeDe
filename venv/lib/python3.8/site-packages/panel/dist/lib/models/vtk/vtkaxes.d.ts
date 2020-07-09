import { Model } from "@bokehjs/model";
import * as p from "@bokehjs/core/properties";
declare type VTKTicker = {
    ticks: number[];
    labels: string[];
};
export declare namespace VTKAxes {
    type Attrs = p.AttrsOf<Props>;
    type Props = Model.Props & {
        origin: p.Property<number[]>;
        xticker: p.Property<VTKTicker>;
        yticker: p.Property<VTKTicker>;
        zticker: p.Property<VTKTicker>;
        digits: p.Property<number>;
        show_grid: p.Property<boolean>;
        grid_opacity: p.Property<number>;
        axes_opacity: p.Property<number>;
        fontsize: p.Property<number>;
    };
}
export interface VTKAxes extends VTKAxes.Attrs {
}
export declare class VTKAxes extends Model {
    properties: VTKAxes.Props;
    constructor(attrs?: Partial<VTKAxes.Attrs>);
    static __module__: string;
    static init_VTKAxes(): void;
    get xticks(): number[];
    get yticks(): number[];
    get zticks(): number[];
    get xlabels(): string[];
    get ylabels(): string[];
    get zlabels(): string[];
    _make_grid_lines(n: number, m: number, offset: number): number[][];
    _create_grid_axes(): any;
    create_axes(canvas: HTMLCanvasElement): any;
}
export {};
