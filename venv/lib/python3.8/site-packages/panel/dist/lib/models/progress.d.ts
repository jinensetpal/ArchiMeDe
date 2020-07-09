import * as p from "@bokehjs/core/properties";
import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box";
export declare class ProgressView extends HTMLBoxView {
    model: Progress;
    _prev_sizing_mode: string | null;
    protected progressEl: HTMLProgressElement;
    connect_signals(): void;
    render(): void;
    setCSS(): void;
    setValue(): void;
    setMax(): void;
    _update_layout(): void;
}
export declare namespace Progress {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        active: p.Property<boolean>;
        bar_color: p.Property<string>;
        style: p.Property<{
            [key: string]: string;
        }>;
        max: p.Property<number | null>;
        value: p.Property<number | null>;
    };
}
export interface Progress extends Progress.Attrs {
}
export declare class Progress extends HTMLBox {
    properties: Progress.Props;
    constructor(attrs?: Partial<Progress.Attrs>);
    static __module__: string;
    static init_Progress(): void;
}
