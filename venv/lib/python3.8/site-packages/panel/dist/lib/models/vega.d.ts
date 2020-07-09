import * as p from "@bokehjs/core/properties";
import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box";
export declare class VegaPlotView extends HTMLBoxView {
    model: VegaPlot;
    _connected: string[];
    connect_signals(): void;
    _connect_sources(): void;
    _fetch_datasets(): any;
    render(): void;
    _plot(): void;
}
export declare namespace VegaPlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        data: p.Property<any>;
        data_sources: p.Property<any>;
    };
}
export interface VegaPlot extends VegaPlot.Attrs {
}
export declare class VegaPlot extends HTMLBox {
    properties: VegaPlot.Props;
    constructor(attrs?: Partial<VegaPlot.Attrs>);
    static __module__: string;
    static init_VegaPlot(): void;
}
