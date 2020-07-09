import { SpatialIndex } from "../../core/util/spatial";
import { Glyph, GlyphView } from "./glyph";
export class XYGlyphView extends GlyphView {
    _index_data() {
        const points = [];
        for (let i = 0, end = this._x.length; i < end; i++) {
            const x = this._x[i];
            const y = this._y[i];
            if (isNaN(x + y) || !isFinite(x + y))
                continue;
            points.push({ x0: x, y0: y, x1: x, y1: y, i });
        }
        return new SpatialIndex(points);
    }
    scenterx(i) {
        return this.sx[i];
    }
    scentery(i) {
        return this.sy[i];
    }
}
XYGlyphView.__name__ = "XYGlyphView";
export class XYGlyph extends Glyph {
    constructor(attrs) {
        super(attrs);
    }
    static init_XYGlyph() {
        this.coords([['x', 'y']]);
    }
}
XYGlyph.__name__ = "XYGlyph";
XYGlyph.init_XYGlyph();
//# sourceMappingURL=xy_glyph.js.map