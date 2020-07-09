import * as p from "@bokehjs/core/properties";
import { VTKAxes } from "./vtkaxes";
import { AbstractVTKView, AbstractVTKPlot } from "./vtk_layout";
export declare class VTKPlotView extends AbstractVTKView {
    model: VTKPlot;
    protected _axes: any;
    protected _axes_initialized: boolean;
    connect_signals(): void;
    render(): void;
    after_layout(): void;
    _render_axes_canvas(): void;
    _delete_axes(): void;
    _set_axes(): void;
    _plot(): void;
}
export declare namespace VTKPlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = AbstractVTKPlot.Props & {
        axes: p.Property<VTKAxes>;
        enable_keybindings: p.Property<boolean>;
    };
}
export interface VTKPlot extends VTKPlot.Attrs {
}
export declare class VTKPlot extends AbstractVTKPlot {
    properties: VTKPlot.Props;
    renderer_el: any;
    outline: any;
    outline_actor: any;
    constructor(attrs?: Partial<VTKPlot.Attrs>);
    static init_VTKPlot(): void;
}
