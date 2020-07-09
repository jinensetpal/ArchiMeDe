import { Marker, MarkerView } from "./marker";
import { marker_funcs } from "./defs";
import * as p from "../../core/properties";
export class ScatterView extends MarkerView {
    _render(ctx, indices, { sx, sy, _size, _angle, _marker }) {
        for (const i of indices) {
            if (isNaN(sx[i] + sy[i] + _size[i] + _angle[i]) || _marker[i] == null)
                continue;
            const r = _size[i] / 2;
            ctx.beginPath();
            ctx.translate(sx[i], sy[i]);
            if (_angle[i])
                ctx.rotate(_angle[i]);
            marker_funcs[_marker[i]](ctx, i, r, this.visuals.line, this.visuals.fill);
            if (_angle[i])
                ctx.rotate(-_angle[i]);
            ctx.translate(-sx[i], -sy[i]);
        }
    }
    draw_legend_for_index(ctx, { x0, x1, y0, y1 }, index) {
        // using objects like this seems a little wonky, since the keys are coerced to
        // stings, but it works
        const len = index + 1;
        const sx = new Array(len);
        sx[index] = (x0 + x1) / 2;
        const sy = new Array(len);
        sy[index] = (y0 + y1) / 2;
        const size = new Array(len);
        size[index] = Math.min(Math.abs(x1 - x0), Math.abs(y1 - y0)) * 0.4;
        const angle = new Array(len);
        angle[index] = 0; // don't attempt to match glyph angle
        const marker = new Array(len);
        marker[index] = this._marker[index];
        this._render(ctx, [index], { sx, sy, _size: size, _angle: angle, _marker: marker }); // XXX
    }
}
ScatterView.__name__ = "ScatterView";
export class Scatter extends Marker {
    constructor(attrs) {
        super(attrs);
    }
    static init_Scatter() {
        this.prototype.default_view = ScatterView;
        this.define({
            marker: [p.MarkerSpec, { value: "circle" }],
        });
    }
}
Scatter.__name__ = "Scatter";
Scatter.init_Scatter();
//# sourceMappingURL=scatter.js.map