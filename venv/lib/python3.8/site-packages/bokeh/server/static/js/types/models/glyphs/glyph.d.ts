import { HitTestResult } from "../../core/hittest";
import * as p from "../../core/properties";
import * as visuals from "../../core/visuals";
import * as geometry from "../../core/geometry";
import { Context2d } from "../../core/util/canvas";
import { View } from "../../core/view";
import { Model } from "../../model";
import { Anchor } from "../../core/enums";
import { Arrayable, Rect } from "../../core/types";
import { SpatialIndex } from "../../core/util/spatial";
import { Scale } from "../scales/scale";
import { Selection } from "../selections/selection";
import { GlyphRendererView } from "../renderers/glyph_renderer";
import { ColumnarDataSource } from "../sources/columnar_data_source";
export interface GlyphData {
}
export interface GlyphView extends GlyphData {
}
export declare abstract class GlyphView extends View {
    model: Glyph;
    visuals: Glyph.Visuals;
    parent: GlyphRendererView;
    get renderer(): GlyphRendererView;
    get has_webgl(): boolean;
    index: SpatialIndex;
    protected _nohit_warned: Set<geometry.Geometry["type"]>;
    initialize(): void;
    lazy_initialize(): Promise<void>;
    set_visuals(source: ColumnarDataSource, indices: number[]): void;
    render(ctx: Context2d, indices: number[], data: any): void;
    protected abstract _render(ctx: Context2d, indices: number[], data: any): void;
    has_finished(): boolean;
    notify_finished(): void;
    protected _bounds(bounds: Rect): Rect;
    bounds(): Rect;
    log_bounds(): Rect;
    get_anchor_point(anchor: Anchor, i: number, [sx, sy]: [number, number]): {
        x: number;
        y: number;
    } | null;
    abstract scenterx(i: number, _sx: number, _sy: number): number;
    abstract scentery(i: number, _sx: number, _sy: number): number;
    sdist(scale: Scale, pts: Arrayable<number>, spans: Arrayable<number>, pts_location?: "center" | "edge", dilate?: boolean): Arrayable<number>;
    draw_legend_for_index(_ctx: Context2d, _bbox: Rect, _index: number): void;
    protected _hit_point?(geometry: geometry.PointGeometry): Selection;
    protected _hit_span?(geometry: geometry.SpanGeometry): Selection;
    protected _hit_rect?(geometry: geometry.RectGeometry): Selection;
    protected _hit_poly?(geometry: geometry.PolyGeometry): Selection;
    hit_test(geometry: geometry.Geometry): HitTestResult;
    protected _hit_rect_against_index(geometry: geometry.RectGeometry): Selection;
    set_data(source: ColumnarDataSource, indices: number[], indices_to_update: number[] | null): void;
    protected _set_data(_indices: number[] | null): void;
    protected abstract _index_data(): SpatialIndex;
    index_data(): void;
    mask_data(indices: number[]): number[];
    protected _mask_data?(): number[];
    map_data(): void;
    protected _map_data(): void;
    map_to_screen(x: Arrayable<number>, y: Arrayable<number>): [Arrayable<number>, Arrayable<number>];
}
export declare namespace Glyph {
    type Attrs = p.AttrsOf<Props>;
    type Props = Model.Props & {
        x_range_name: p.Property<string>;
        y_range_name: p.Property<string>;
    };
    type Visuals = visuals.Visuals;
}
export interface Glyph extends Glyph.Attrs {
}
export declare abstract class Glyph extends Model {
    properties: Glyph.Props;
    __view_type__: GlyphView;
    _coords: [string, string][];
    constructor(attrs?: Partial<Glyph.Attrs>);
    static init_Glyph(): void;
    static coords(coords: [string, string][]): void;
}
