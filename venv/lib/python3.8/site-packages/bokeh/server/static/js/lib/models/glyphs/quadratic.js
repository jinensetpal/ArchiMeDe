import { LineVector } from "../../core/property_mixins";
import { SpatialIndex } from "../../core/util/spatial";
import { Glyph, GlyphView } from "./glyph";
import { generic_line_legend } from "./utils";
// Formula from: http://pomax.nihongoresources.com/pages/bezier/
//
// if segment is quadratic bezier do:
//   for both directions do:
//     if control between start and end, compute linear bounding box
//     otherwise, compute
//       bound = u(1-t)^2 + 2v(1-t)t + wt^2
//         (with t = ((u-v) / (u-2v+w)), with {u = start, v = control, w = end})
//       if control precedes start, min = bound, otherwise max = bound
function _qbb(u, v, w) {
    if (v == (u + w) / 2)
        return [u, w];
    else {
        const t = (u - v) / ((u - (2 * v)) + w);
        const bd = (u * (1 - t) ** 2) + (2 * v * (1 - t) * t) + (w * t ** 2);
        return [Math.min(u, w, bd), Math.max(u, w, bd)];
    }
}
export class QuadraticView extends GlyphView {
    _index_data() {
        const points = [];
        for (let i = 0, end = this._x0.length; i < end; i++) {
            if (isNaN(this._x0[i] + this._x1[i] + this._y0[i] + this._y1[i] + this._cx[i] + this._cy[i]))
                continue;
            const [x0, x1] = _qbb(this._x0[i], this._cx[i], this._x1[i]);
            const [y0, y1] = _qbb(this._y0[i], this._cy[i], this._y1[i]);
            points.push({ x0, y0, x1, y1, i });
        }
        return new SpatialIndex(points);
    }
    _render(ctx, indices, { sx0, sy0, sx1, sy1, scx, scy }) {
        if (this.visuals.line.doit) {
            for (const i of indices) {
                if (isNaN(sx0[i] + sy0[i] + sx1[i] + sy1[i] + scx[i] + scy[i]))
                    continue;
                ctx.beginPath();
                ctx.moveTo(sx0[i], sy0[i]);
                ctx.quadraticCurveTo(scx[i], scy[i], sx1[i], sy1[i]);
                this.visuals.line.set_vectorize(ctx, i);
                ctx.stroke();
            }
        }
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
QuadraticView.__name__ = "QuadraticView";
export class Quadratic extends Glyph {
    constructor(attrs) {
        super(attrs);
    }
    static init_Quadratic() {
        this.prototype.default_view = QuadraticView;
        this.coords([['x0', 'y0'], ['x1', 'y1'], ['cx', 'cy']]);
        this.mixins(LineVector);
    }
}
Quadratic.__name__ = "Quadratic";
Quadratic.init_Quadratic();
//# sourceMappingURL=quadratic.js.map