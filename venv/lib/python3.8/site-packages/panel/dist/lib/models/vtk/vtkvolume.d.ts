import * as p from "@bokehjs/core/properties";
import { AbstractVTKPlot, AbstractVTKView } from "./vtk_layout";
import { Mapper } from "./vtk_utils";
declare type InterpolationType = 'fast_linear' | 'linear' | 'nearest';
export declare class VTKVolumePlotView extends AbstractVTKView {
    model: VTKVolumePlot;
    protected _controllerWidget: any;
    protected _vtk_image_data: any;
    connect_signals(): void;
    get volume(): any;
    get image_actor_i(): any;
    get image_actor_j(): any;
    get image_actor_k(): any;
    get shadow_selector(): HTMLSelectElement;
    get edge_gradient_slider(): HTMLInputElement;
    get sampling_slider(): HTMLInputElement;
    get colormap_slector(): HTMLSelectElement;
    _set_interpolation(interpolation: InterpolationType): void;
    render(): void;
    _connect_controls(): void;
    _plot_volume(): void;
    _plot_slices(): void;
    _set_volume_visibility(visibility: boolean): void;
    _set_slices_visibility(visibility: boolean): void;
}
export declare namespace VTKVolumePlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = AbstractVTKPlot.Props & {
        shadow: p.Property<boolean>;
        sampling: p.Property<number>;
        edge_gradient: p.Property<number>;
        colormap: p.Property<string>;
        rescale: p.Property<boolean>;
        ambient: p.Property<number>;
        diffuse: p.Property<number>;
        specular: p.Property<number>;
        specular_power: p.Property<number>;
        slice_i: p.Property<number>;
        slice_j: p.Property<number>;
        slice_k: p.Property<number>;
        display_volume: p.Property<boolean>;
        display_slices: p.Property<boolean>;
        render_background: p.Property<string>;
        interpolation: p.Property<InterpolationType>;
        mapper: p.Property<Mapper>;
    };
}
export interface VTKVolumePlot extends VTKVolumePlot.Attrs {
}
export declare class VTKVolumePlot extends AbstractVTKPlot {
    properties: VTKVolumePlot.Props;
    constructor(attrs?: Partial<VTKVolumePlot.Attrs>);
    static init_VTKVolumePlot(): void;
}
export {};
