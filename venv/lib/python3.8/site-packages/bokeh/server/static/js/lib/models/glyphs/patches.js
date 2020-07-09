import { SpatialIndex } from "../../core/util/spatial";
import { Glyph, GlyphView } from "./glyph";
import { generic_area_legend } from "./utils";
import { min, max, copy, find_last_index } from "../../core/util/array";
import { sum } from "../../core/util/arrayable";
import { LineVector, FillVector, HatchVector } from "../../core/property_mixins";
import * as hittest from "../../core/hittest";
import { Selection } from "../selections/selection";
import { unreachable } from "../../core/util/assert";
export class PatchesView extends GlyphView {
    _build_discontinuous_object(nanned_qs) {
        // _s is this.xs, this.ys, this.sxs, this.sys
        // an object of n 1-d arrays in either data or screen units
        //
        // Each 1-d array gets broken to an array of arrays split
        // on any NaNs
        //
        // So:
        // { 0: [x11, x12],
        //   1: [x21, x22, x23],
        //   2: [x31, NaN, x32]
        // }
        // becomes
        // { 0: [[x11, x12]],
        //   1: [[x21, x22, x23]],
        //   2: [[x31],[x32]]
        // }
        const ds = [];
        for (let i = 0, end = nanned_qs.length; i < end; i++) {
            ds[i] = [];
            let qs = copy(nanned_qs[i]);
            while (qs.length > 0) {
                const nan_index = find_last_index(qs, (q) => isNaN(q));
                let qs_part;
                if (nan_index >= 0)
                    qs_part = qs.splice(nan_index);
                else {
                    qs_part = qs;
                    qs = [];
                }
                const denanned = qs_part.filter((q) => !isNaN(q));
                ds[i].push(denanned);
            }
        }
        return ds;
    }
    _index_data() {
        const xss = this._build_discontinuous_object(this._xs); // XXX
        const yss = this._build_discontinuous_object(this._ys); // XXX
        const points = [];
        for (let i = 0, end = this._xs.length; i < end; i++) {
            for (let j = 0, endj = xss[i].length; j < endj; j++) {
                const xs = xss[i][j];
                const ys = yss[i][j];
                if (xs.length == 0)
                    continue;
                points.push({ x0: min(xs), y0: min(ys), x1: max(xs), y1: max(ys), i });
            }
        }
        return new SpatialIndex(points);
    }
    _mask_data() {
        const xr = this.renderer.plot_view.frame.x_ranges.default;
        const [x0, x1] = [xr.min, xr.max];
        const yr = this.renderer.plot_view.frame.y_ranges.default;
        const [y0, y1] = [yr.min, yr.max];
        const indices = this.index.indices({ x0, x1, y0, y1 });
        // TODO (bev) this should be under test
        return indices.sort((a, b) => a - b);
    }
    _inner_loop(ctx, sx, sy, func) {
        for (let j = 0, end = sx.length; j < end; j++) {
            if (j == 0) {
                ctx.beginPath();
                ctx.moveTo(sx[j], sy[j]);
                continue;
            }
            else if (isNaN(sx[j] + sy[j])) {
                ctx.closePath();
                func.apply(ctx);
                ctx.beginPath();
                continue;
            }
            else
                ctx.lineTo(sx[j], sy[j]);
        }
        ctx.closePath();
        func.call(ctx);
    }
    _render(ctx, indices, { sxs, sys }) {
        // this.sxss and this.syss are used by _hit_point and sxc, syc
        // This is the earliest we can build them, and only build them once
        this.sxss = this._build_discontinuous_object(sxs); // XXX
        this.syss = this._build_discontinuous_object(sys); // XXX
        for (const i of indices) {
            const [sx, sy] = [sxs[i], sys[i]];
            if (this.visuals.fill.doit) {
                this.visuals.fill.set_vectorize(ctx, i);
                this._inner_loop(ctx, sx, sy, ctx.fill);
            }
            this.visuals.hatch.doit2(ctx, i, () => this._inner_loop(ctx, sx, sy, ctx.fill), () => this.renderer.request_render());
            if (this.visuals.line.doit) {
                this.visuals.line.set_vectorize(ctx, i);
                this._inner_loop(ctx, sx, sy, ctx.stroke);
            }
        }
    }
    _hit_rect(geometry) {
        const { sx0, sx1, sy0, sy1 } = geometry;
        const xs = [sx0, sx1, sx1, sx0];
        const ys = [sy0, sy0, sy1, sy1];
        const [x0, x1] = this.renderer.xscale.r_invert(sx0, sx1);
        const [y0, y1] = this.renderer.yscale.r_invert(sy0, sy1);
        const candidates = this.index.indices({ x0, x1, y0, y1 });
        const indices = [];
        for (let i = 0, end = candidates.length; i < end; i++) {
            const index = candidates[i];
            const sxss = this.sxs[index];
            const syss = this.sys[index];
            let hit = true;
            for (let j = 0, endj = sxss.length; j < endj; j++) {
                const sx = sxss[j];
                const sy = syss[j];
                if (!hittest.point_in_poly(sx, sy, xs, ys)) {
                    hit = false;
                    break;
                }
            }
            if (hit) {
                indices.push(index);
            }
        }
        return new Selection({ indices });
    }
    _hit_point(geometry) {
        const { sx, sy } = geometry;
        const x = this.renderer.xscale.invert(sx);
        const y = this.renderer.yscale.invert(sy);
        const candidates = this.index.indices({ x0: x, y0: y, x1: x, y1: y });
        const indices = [];
        for (let i = 0, end = candidates.length; i < end; i++) {
            const index = candidates[i];
            const sxs = this.sxss[index];
            const sys = this.syss[index];
            for (let j = 0, endj = sxs.length; j < endj; j++) {
                if (hittest.point_in_poly(sx, sy, sxs[j], sys[j])) {
                    indices.push(index);
                }
            }
        }
        return new Selection({ indices });
    }
    _get_snap_coord(array) {
        return sum(array) / array.length;
    }
    scenterx(i, sx, sy) {
        if (this.sxss[i].length == 1) {
            // We don't have discontinuous objects so we're ok
            return this._get_snap_coord(this.sxs[i]);
        }
        else {
            // We have discontinuous objects, so we need to find which
            // one we're in, we can use point_in_poly again
            const sxs = this.sxss[i];
            const sys = this.syss[i];
            for (let j = 0, end = sxs.length; j < end; j++) {
                if (hittest.point_in_poly(sx, sy, sxs[j], sys[j]))
                    return this._get_snap_coord(sxs[j]);
            }
        }
        unreachable();
    }
    scentery(i, sx, sy) {
        if (this.syss[i].length == 1) {
            // We don't have discontinuous objects so we're ok
            return this._get_snap_coord(this.sys[i]);
        }
        else {
            // We have discontinuous objects, so we need to find which
            // one we're in, we can use point_in_poly again
            const sxs = this.sxss[i];
            const sys = this.syss[i];
            for (let j = 0, end = sxs.length; j < end; j++) {
                if (hittest.point_in_poly(sx, sy, sxs[j], sys[j]))
                    return this._get_snap_coord(sys[j]);
            }
        }
        unreachable();
    }
    draw_legend_for_index(ctx, bbox, index) {
        generic_area_legend(this.visuals, ctx, bbox, index);
    }
}
PatchesView.__name__ = "PatchesView";
export class Patches extends Glyph {
    constructor(attrs) {
        super(attrs);
    }
    static init_Patches() {
        this.prototype.default_view = PatchesView;
        this.coords([['xs', 'ys']]);
        this.mixins([LineVector, FillVector, HatchVector]);
    }
}
Patches.__name__ = "Patches";
Patches.init_Patches();
//# sourceMappingURL=patches.js.map