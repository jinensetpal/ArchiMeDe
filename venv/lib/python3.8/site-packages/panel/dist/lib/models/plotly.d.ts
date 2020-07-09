import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export declare class PlotlyPlotView extends PanelHTMLBoxView {
    model: PlotlyPlot;
    _setViewport: Function;
    _settingViewport: boolean;
    _plotInitialized: boolean;
    _reacting: boolean;
    _relayouting: boolean;
    _end_relayouting: (() => void) & {
        clear(): void;
    } & {
        flush(): void;
    };
    connect_signals(): void;
    render(): void;
    plot(): void;
    _get_trace(index: number, update: boolean): any;
    _updateViewportFromProperty(): void;
    _updateViewportProperty(): void;
    _updateSetViewportFunction(): void;
}
export declare namespace PlotlyPlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        data: p.Property<any[]>;
        layout: p.Property<any>;
        config: p.Property<any>;
        data_sources: p.Property<any[]>;
        relayout_data: p.Property<any>;
        restyle_data: p.Property<any>;
        click_data: p.Property<any>;
        hover_data: p.Property<any>;
        clickannotation_data: p.Property<any>;
        selected_data: p.Property<any>;
        viewport: p.Property<any>;
        viewport_update_policy: p.Property<string>;
        viewport_update_throttle: p.Property<number>;
        _render_count: p.Property<number>;
    };
}
export interface PlotlyPlot extends PlotlyPlot.Attrs {
}
export declare class PlotlyPlot extends HTMLBox {
    properties: PlotlyPlot.Props;
    constructor(attrs?: Partial<PlotlyPlot.Attrs>);
    static __module__: string;
    static init_PlotlyPlot(): void;
}
