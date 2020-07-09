import { ContinuousScale } from "./continuous_scale";
export class LinearScale extends ContinuousScale {
    constructor(attrs) {
        super(attrs);
    }
    compute(x) {
        return this._linear_compute(x);
    }
    v_compute(xs) {
        return this._linear_v_compute(xs);
    }
    invert(xprime) {
        return this._linear_invert(xprime);
    }
    v_invert(xprimes) {
        return this._linear_v_invert(xprimes);
    }
}
LinearScale.__name__ = "LinearScale";
//# sourceMappingURL=linear_scale.js.map