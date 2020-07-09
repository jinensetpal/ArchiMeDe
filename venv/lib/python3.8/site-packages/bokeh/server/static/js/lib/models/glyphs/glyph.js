import * as p from "../../core/properties";
import * as bbox from "../../core/util/bbox";
import * as proj from "../../core/util/projections";
import * as visuals from "../../core/visuals";
import { View } from "../../core/view";
import { Model } from "../../model";
import { logger } from "../../core/logging";
import { map } from "../../core/util/arrayable";
import { extend } from "../../core/util/object";
import { isArray, isTypedArray } from "../../core/util/types";
import { LineView } from "./line";
import { FactorRange } from "../ranges/factor_range";
import { Selection } from "../selections/selection";
export class GlyphView extends View {
    constructor() {
        super(...arguments);
        this._nohit_warned = new Set();
    }
    get renderer() {
        return this.parent;
    }
    get has_webgl() {
        return this.glglyph != null;
    }
    initialize() {
        super.initialize();
        this.visuals = new visuals.Visuals(this.model);
    }
    async lazy_initialize() {
        await super.lazy_initialize();
        const { webgl } = this.renderer.plot_view.canvas_view;
        if (webgl != null) {
            let webgl_module = null;
            try {
                webgl_module = await import("./webgl/index");
            }
            catch (e) {
                // TODO: this exposes the underyling module system
                if (e.code === 'MODULE_NOT_FOUND')
                    logger.warn('WebGL was requested and is supported, but bokeh-gl(.min).js is not available, falling back to 2D rendering.');
                else
                    throw e;
            }
            if (webgl_module != null) {
                const Cls = webgl_module[this.model.type + 'GLGlyph'];
                if (Cls != null)
                    this.glglyph = new Cls(webgl.gl, this);
            }
        }
    }
    set_visuals(source, indices) {
        this.visuals.set_all_indices(indices);
        this.visuals.warm_cache(source);
        if (this.glglyph != null)
            this.glglyph.set_visuals_changed();
    }
    render(ctx, indices, data) {
        ctx.beginPath();
        if (this.glglyph != null) {
            if (this.glglyph.render(ctx, indices, data))
                return;
        }
        this._render(ctx, indices, data);
    }
    has_finished() {
        return true;
    }
    notify_finished() {
        this.renderer.notify_finished();
    }
    _bounds(bounds) {
        return bounds;
    }
    bounds() {
        return this._bounds(this.index.bbox);
    }
    log_bounds() {
        const bb = bbox.empty();
        const positive_x_bbs = this.index.search(bbox.positive_x());
        for (const x of positive_x_bbs) {
            if (x.x0 < bb.x0)
                bb.x0 = x.x0;
            if (x.x1 > bb.x1)
                bb.x1 = x.x1;
        }
        const positive_y_bbs = this.index.search(bbox.positive_y());
        for (const y of positive_y_bbs) {
            if (y.y0 < bb.y0)
                bb.y0 = y.y0;
            if (y.y1 > bb.y1)
                bb.y1 = y.y1;
        }
        return this._bounds(bb);
    }
    get_anchor_point(anchor, i, [sx, sy]) {
        switch (anchor) {
            case "center": return { x: this.scenterx(i, sx, sy), y: this.scentery(i, sx, sy) };
            default: return null;
        }
    }
    sdist(scale, pts, spans, pts_location = "edge", dilate = false) {
        let pt0;
        let pt1;
        const n = pts.length;
        if (pts_location == 'center') {
            const halfspan = map(spans, (d) => d / 2);
            pt0 = new Float64Array(n);
            for (let i = 0; i < n; i++) {
                pt0[i] = pts[i] - halfspan[i];
            }
            pt1 = new Float64Array(n);
            for (let i = 0; i < n; i++) {
                pt1[i] = pts[i] + halfspan[i];
            }
        }
        else {
            pt0 = pts;
            pt1 = new Float64Array(n);
            for (let i = 0; i < n; i++) {
                pt1[i] = pt0[i] + spans[i];
            }
        }
        const spt0 = scale.v_compute(pt0);
        const spt1 = scale.v_compute(pt1);
        if (dilate)
            return map(spt0, (_, i) => Math.ceil(Math.abs(spt1[i] - spt0[i])));
        else
            return map(spt0, (_, i) => Math.abs(spt1[i] - spt0[i]));
    }
    draw_legend_for_index(_ctx, _bbox, _index) { }
    hit_test(geometry) {
        switch (geometry.type) {
            case "point":
                if (this._hit_point != null)
                    return this._hit_point(geometry);
                break;
            case "span":
                if (this._hit_span != null)
                    return this._hit_span(geometry);
                break;
            case "rect":
                if (this._hit_rect != null)
                    return this._hit_rect(geometry);
                break;
            case "poly":
                if (this._hit_poly != null)
                    return this._hit_poly(geometry);
                break;
        }
        if (!this._nohit_warned.has(geometry.type)) {
            logger.debug(`'${geometry.type}' selection not available for ${this.model.type}`);
            this._nohit_warned.add(geometry.type);
        }
        return null;
    }
    _hit_rect_against_index(geometry) {
        const { sx0, sx1, sy0, sy1 } = geometry;
        const [x0, x1] = this.renderer.xscale.r_invert(sx0, sx1);
        const [y0, y1] = this.renderer.yscale.r_invert(sy0, sy1);
        const indices = this.index.indices({ x0, x1, y0, y1 });
        return new Selection({ indices });
    }
    set_data(source, indices, indices_to_update) {
        let data = this.model.materialize_dataspecs(source);
        if (indices && !(this instanceof LineView)) {
            const data_subset = {};
            for (const k in data) {
                const v = data[k];
                if (k.charAt(0) === '_')
                    data_subset[k] = indices.map((i) => v[i]);
                else
                    data_subset[k] = v;
            }
            data = data_subset;
        }
        const self = this;
        extend(self, data);
        // TODO (bev) Should really probably delegate computing projected
        // coordinates to glyphs, instead of centralizing here in one place.
        if (this.renderer.plot_view.model.use_map) {
            if (self._x != null)
                [self._x, self._y] = proj.project_xy(self._x, self._y);
            if (self._xs != null)
                [self._xs, self._ys] = proj.project_xsys(self._xs, self._ys);
            if (self._x0 != null)
                [self._x0, self._y0] = proj.project_xy(self._x0, self._y0);
            if (self._x1 != null)
                [self._x1, self._y1] = proj.project_xy(self._x1, self._y1);
        }
        // if we have any coordinates that are categorical, convert them to
        // synthetic coords here
        if (this.renderer.plot_view.frame.x_ranges != null) { // XXXX JUST TEMP FOR TESTS TO PASS
            const xr = this.renderer.plot_view.frame.x_ranges[this.model.x_range_name];
            const yr = this.renderer.plot_view.frame.y_ranges[this.model.y_range_name];
            for (let [xname, yname] of this.model._coords) {
                xname = `_${xname}`;
                yname = `_${yname}`;
                // TODO (bev) more robust detection of multi-glyph case
                // hand multi glyph case
                if (self._xs != null) {
                    if (xr instanceof FactorRange) {
                        self[xname] = map(self[xname], (arr) => xr.v_synthetic(arr));
                    }
                    if (yr instanceof FactorRange) {
                        self[yname] = map(self[yname], (arr) => yr.v_synthetic(arr));
                    }
                }
                else {
                    // hand standard glyph case
                    if (xr instanceof FactorRange) {
                        self[xname] = xr.v_synthetic(self[xname]);
                    }
                    if (yr instanceof FactorRange) {
                        self[yname] = yr.v_synthetic(self[yname]);
                    }
                }
            }
        }
        if (this.glglyph != null)
            this.glglyph.set_data_changed(self._x.length);
        this._set_data(indices_to_update); //TODO doesn't take subset indices into account
        this.index_data();
    }
    _set_data(_indices) { }
    index_data() {
        this.index = this._index_data();
    }
    mask_data(indices) {
        // WebGL can do the clipping much more efficiently
        if (this.glglyph != null || this._mask_data == null)
            return indices;
        else
            return this._mask_data();
    }
    map_data() {
        // TODO: if using gl, skip this (when is this called?)
        // map all the coordinate fields
        const self = this;
        for (let [xname, yname] of this.model._coords) {
            const sxname = `s${xname}`;
            const syname = `s${yname}`;
            xname = `_${xname}`;
            yname = `_${yname}`;
            if (self[xname] != null && (isArray(self[xname][0]) || isTypedArray(self[xname][0]))) {
                const n = self[xname].length;
                self[sxname] = new Array(n);
                self[syname] = new Array(n);
                for (let i = 0; i < n; i++) {
                    const [sx, sy] = this.map_to_screen(self[xname][i], self[yname][i]);
                    self[sxname][i] = sx;
                    self[syname][i] = sy;
                }
            }
            else
                [self[sxname], self[syname]] = this.map_to_screen(self[xname], self[yname]);
        }
        this._map_data();
    }
    // This is where specs not included in coords are computed, e.g. radius.
    _map_data() { }
    map_to_screen(x, y) {
        return this.renderer.plot_view.map_to_screen(x, y, this.model.x_range_name, this.model.y_range_name);
    }
}
GlyphView.__name__ = "GlyphView";
export class Glyph extends Model {
    constructor(attrs) {
        super(attrs);
    }
    static init_Glyph() {
        this.prototype._coords = [];
        this.internal({
            x_range_name: [p.String, 'default'],
            y_range_name: [p.String, 'default'],
        });
    }
    static coords(coords) {
        const _coords = this.prototype._coords.concat(coords);
        this.prototype._coords = _coords;
        const result = {};
        for (const [x, y] of coords) {
            result[x] = [p.CoordinateSpec];
            result[y] = [p.CoordinateSpec];
        }
        this.define(result);
    }
}
Glyph.__name__ = "Glyph";
Glyph.init_Glyph();
//# sourceMappingURL=glyph.js.map