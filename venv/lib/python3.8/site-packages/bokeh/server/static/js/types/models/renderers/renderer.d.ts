import { DOMView } from "../../core/dom_view";
import * as visuals from "../../core/visuals";
import { RenderLevel } from "../../core/enums";
import { Arrayable } from "../../core/types";
import * as p from "../../core/properties";
import { Model } from "../../model";
import { BBox } from "../../core/util/bbox";
import { Plot, PlotView } from "../plots/plot";
import { CanvasLayer } from "../canvas/canvas";
export declare abstract class RendererView extends DOMView {
    model: Renderer;
    visuals: Renderer.Visuals;
    parent: PlotView;
    initialize(): void;
    get plot_view(): PlotView;
    get plot_model(): Plot;
    get layer(): CanvasLayer;
    request_render(): void;
    map_to_screen(x: Arrayable<number>, y: Arrayable<number>): [Arrayable<number>, Arrayable<number>];
    interactive_bbox?(sx: number, sy: number): BBox;
    interactive_hit?(sx: number, sy: number): boolean;
    get needs_clip(): boolean;
    notify_finished(): void;
    get has_webgl(): boolean;
}
export declare namespace Renderer {
    type Attrs = p.AttrsOf<Props>;
    type Props = Model.Props & {
        level: p.Property<RenderLevel>;
        visible: p.Property<boolean>;
    };
    type Visuals = visuals.Visuals;
}
export interface Renderer extends Renderer.Attrs {
}
export declare abstract class Renderer extends Model {
    properties: Renderer.Props;
    __view_type__: RendererView;
    constructor(attrs?: Partial<Renderer.Attrs>);
    static init_Renderer(): void;
}
