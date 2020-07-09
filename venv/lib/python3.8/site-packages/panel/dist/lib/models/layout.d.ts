import { VariadicBox } from "@bokehjs/core/layout/html";
import { Size, SizeHint } from "@bokehjs/core/layout/types";
import { MarkupView } from "@bokehjs/models/widgets/markup";
import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box";
export declare function set_size(el: HTMLElement, model: HTMLBox): void;
export declare class CachedVariadicBox extends VariadicBox {
    readonly el: HTMLElement;
    readonly sizing_mode: string | null;
    readonly changed: boolean;
    private readonly _cache;
    private readonly _cache_count;
    constructor(el: HTMLElement, sizing_mode: string | null, changed: boolean);
    protected _measure(viewport: Size): SizeHint;
    invalidate_cache(): void;
}
export declare class PanelMarkupView extends MarkupView {
    _prev_sizing_mode: string | null;
    _update_layout(): void;
    render(): void;
}
export declare class PanelHTMLBoxView extends HTMLBoxView {
    _prev_sizing_mode: string | null;
    _update_layout(): void;
    render(): void;
}
