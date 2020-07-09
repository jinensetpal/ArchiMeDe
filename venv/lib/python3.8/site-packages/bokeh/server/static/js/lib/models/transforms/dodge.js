import { Transform } from "./transform";
import { FactorRange } from "../ranges/factor_range";
import * as p from "../../core/properties";
import { isNumber, isArrayableOf } from "../../core/util/types";
export class Dodge extends Transform {
    constructor(attrs) {
        super(attrs);
    }
    static init_Dodge() {
        this.define({
            value: [p.Number, 0],
            range: [p.Instance],
        });
    }
    // XXX: this is repeated in ./jitter.ts
    v_compute(xs0) {
        let xs;
        if (this.range instanceof FactorRange)
            xs = this.range.v_synthetic(xs0);
        else if (isArrayableOf(xs0, isNumber))
            xs = xs0;
        else
            throw new Error("unexpected");
        const result = new Float64Array(xs.length);
        for (let i = 0; i < xs.length; i++) {
            const x = xs[i];
            result[i] = this._compute(x);
        }
        return result;
    }
    compute(x) {
        if (this.range instanceof FactorRange)
            return this._compute(this.range.synthetic(x));
        else if (isNumber(x))
            return this._compute(x);
        else
            throw new Error("unexpected");
    }
    _compute(x) {
        return x + this.value;
    }
}
Dodge.__name__ = "Dodge";
Dodge.init_Dodge();
//# sourceMappingURL=dodge.js.map