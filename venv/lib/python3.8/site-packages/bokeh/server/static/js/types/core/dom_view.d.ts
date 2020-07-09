import { View } from "./view";
import { StyleSheet } from "./dom";
export declare class DOMView extends View {
    tagName: keyof HTMLElementTagNameMap;
    protected _has_finished: boolean;
    el: HTMLElement;
    /** @override */
    root: DOMView;
    initialize(): void;
    remove(): void;
    css_classes(): string[];
    styles(): string[];
    cursor(_sx: number, _sy: number): string | null;
    render(): void;
    renderTo(element: HTMLElement): void;
    on_hit?(sx: number, sy: number): boolean;
    has_finished(): boolean;
    get is_idle(): boolean;
    private _stylesheet;
    get stylesheet(): StyleSheet;
    protected _inject_styles(): void;
    protected _createElement(): HTMLElement;
}
