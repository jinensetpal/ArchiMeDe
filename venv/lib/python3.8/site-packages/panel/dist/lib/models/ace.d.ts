import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export declare class AcePlotView extends PanelHTMLBoxView {
    model: AcePlot;
    protected _ace: any;
    protected _editor: any;
    protected _langTools: any;
    protected _container: HTMLDivElement;
    initialize(): void;
    connect_signals(): void;
    render(): void;
    _update_code_from_model(): void;
    _update_code_from_editor(): void;
    _update_theme(): void;
    _update_language(): void;
    _add_annotations(): void;
    after_layout(): void;
}
export declare namespace AcePlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        code: p.Property<string>;
        language: p.Property<string>;
        theme: p.Property<string>;
        annotations: p.Property<any[]>;
        readonly: p.Property<boolean>;
    };
}
export interface AcePlot extends AcePlot.Attrs {
}
export declare class AcePlot extends HTMLBox {
    properties: AcePlot.Props;
    constructor(attrs?: Partial<AcePlot.Attrs>);
    static __module__: string;
    static init_AcePlot(): void;
}
