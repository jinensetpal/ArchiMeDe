import { SpatialIndex } from "../../core/util/spatial";
import { LineVector } from "../../core/property_mixins";
import * as hittest from "../../core/hittest";
import { min, max } from "../../core/util/array";
import { to_object } from "../../core/util/object";
import { Glyph, GlyphView } from "./glyph";
import { generic_line_legend, line_interpolation } from "./utils";
import { Selection } from "../selections/selection";
export class MultiLineView extends GlyphView {
    _index_data() {
        const points = [];
        for (let i = 0, end = this._xs.length; i < end; i++) {
            if (this._xs[i] == null || this._xs[i].length === 0)
                continue;
            const _xsi = this._xs[i];
            const xs = [];
            for (let j = 0, n = _xsi.length; j < n; j++) {
                const x = _xsi[j];
                if (!isNaN(x))
                    xs.push(x);
            }
            const _ysi = this._ys[i];
            const ys = [];
            for (let j = 0, n = _ysi.length; j < n; j++) {
                const y = _ysi[j];
                if (!isNaN(y))
                    ys.push(y);
            }
            const [x0, x1] = [min(xs), max(xs)];
            const [y0, y1] = [min(ys), max(ys)];
            points.push({ x0, y0, x1, y1, i });
        }
        return new SpatialIndex(points);
    }
    _render(ctx, indices, { sxs, sys }) {
        for (const i of indices) {
            const [sx, sy] = [sxs[i], sys[i]];
            this.visuals.line.set_vectorize(ctx, i);
            for (let j = 0, end = sx.length; j < end; j++) {
                if (j == 0) {
                    ctx.beginPath();
                    ctx.moveTo(sx[j], sy[j]);
                    continue;
                }
                else if (isNaN(sx[j]) || isNaN(sy[j])) {
                    ctx.stroke();
                    ctx.beginPath();
                    continue;
                }
                else
                    ctx.lineTo(sx[j], sy[j]);
            }
            ctx.stroke();
        }
    }
    _hit_point(geometry) {
        const point = { x: geometry.sx, y: geometry.sy };
        let shortest = 9999;
        const hits = new Map();
        for (let i = 0, end = this.sxs.length; i < end; i++) {
            const threshold = Math.max(2, this.visuals.line.cache_select('line_width', i) / 2);
            let points = null;
            for (let j = 0, endj = this.sxs[i].length - 1; j < endj; j++) {
                const p0 = { x: this.sxs[i][j], y: this.sys[i][j] };
                const p1 = { x: this.sxs[i][j + 1], y: this.sys[i][j + 1] };
                const dist = hittest.dist_to_segment(point, p0, p1);
                if (dist < threshold && dist < shortest) {
                    shortest = dist;
                    points = [j];
                }
            }
            if (points != null) {
                hits.set(i, points);
            }
        }
        return new Selection({
            indices: [...hits.keys()],
            multiline_indices: to_object(hits),
        });
    }
    _hit_span(geometry) {
        const { sx, sy } = geometry;
        let val;
        let values;
        if (geometry.direction === 'v') {
            val = this.renderer.yscale.invert(sy);
            values = this._ys;
        }
        else {
            val = this.renderer.xscale.invert(sx);
            values = this._xs;
        }
        const hits = new Map();
        for (let i = 0, end = values.length; i < end; i++) {
            const points = [];
            for (let j = 0, endj = values[i].length - 1; j < endj; j++) {
                if (values[i][j] <= val && val <= values[i][j + 1])
                    points.push(j);
            }
            if (points.length > 0) {
                hits.set(i, points);
            }
        }
        return new Selection({
            indices: [...hits.keys()],
            multiline_indices: to_object(hits),
        });
    }
    get_interpolation_hit(i, point_i, geometry) {
        const [x2, y2, x3, y3] = [this._xs[i][point_i], this._ys[i][point_i], this._xs[i][point_i + 1], this._ys[i][point_i + 1]];
        return line_interpolation(this.renderer, geometry, x2, y2, x3, y3);
    }
    draw_legend_for_index(ctx, bbox, index) {
        generic_line_legend(this.visuals, ctx, bbox, index);
    }
    scenterx() {
        throw new Error("not implemented");
    }
    scentery() {
        throw new Error("not implemented");
    }
}
MultiLineView.__name__ = "MultiLineView";
export class MultiLine extends Glyph {
    constructor(attrs) {
        super(attrs);
    }
    static init_MultiLine() {
        this.prototype.default_view = MultiLineView;
        this.coords([['xs', 'ys']]);
        this.mixins(LineVector);
    }
}
MultiLine.__name__ = "MultiLine";
MultiLine.init_MultiLine();
//# sourceMappingURL=multi_line.js.map