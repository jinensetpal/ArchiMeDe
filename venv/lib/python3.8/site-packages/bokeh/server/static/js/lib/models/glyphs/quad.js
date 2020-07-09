import { Box, BoxView } from "./box";
export class QuadView extends BoxView {
    scenterx(i) {
        return (this.sleft[i] + this.sright[i]) / 2;
    }
    scentery(i) {
        return (this.stop[i] + this.sbottom[i]) / 2;
    }
    _index_data() {
        return this._index_box(this._right.length);
    }
    _lrtb(i) {
        const l = this._left[i];
        const r = this._right[i];
        const t = this._top[i];
        const b = this._bottom[i];
        return [l, r, t, b];
    }
}
QuadView.__name__ = "QuadView";
export class Quad extends Box {
    constructor(attrs) {
        super(attrs);
    }
    static init_Quad() {
        this.prototype.default_view = QuadView;
        this.coords([['right', 'bottom'], ['left', 'top']]);
    }
}
Quad.__name__ = "Quad";
Quad.init_Quad();
//# sourceMappingURL=quad.js.map