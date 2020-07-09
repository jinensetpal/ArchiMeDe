import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export declare class DeckGLPlotView extends PanelHTMLBoxView {
    model: DeckGLPlot;
    jsonConverter: any;
    deckGL: any;
    _connected: any[];
    _layer_map: any;
    connect_signals(): void;
    _update_layers(): void;
    _connect_sources(render?: boolean): void;
    initialize(): void;
    _update_data(render?: boolean): void;
    _on_click_event(event: any): void;
    _on_hover_event(event: any): void;
    _on_viewState_event(event: any): void;
    getData(): any;
    updateDeck(): void;
    createDeck({ mapboxApiKey, container, jsonInput, tooltip }: any): void;
    render(): void;
}
export declare namespace DeckGLPlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        data: p.Property<any>;
        data_sources: p.Property<any[]>;
        initialViewState: p.Property<any>;
        layers: p.Property<any[]>;
        mapbox_api_key: p.Property<string>;
        tooltip: p.Property<any>;
        clickState: p.Property<any>;
        hoverState: p.Property<any>;
        viewState: p.Property<any>;
    };
}
export interface DeckGLPlot extends DeckGLPlot.Attrs {
}
export declare class DeckGLPlot extends HTMLBox {
    properties: DeckGLPlot.Props;
    constructor(attrs?: Partial<DeckGLPlot.Attrs>);
    static __module__: string;
    static init_DeckGLPlot(): void;
}
