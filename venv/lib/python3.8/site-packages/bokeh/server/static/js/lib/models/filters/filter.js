import { Model } from "../../model";
import * as p from "../../core/properties";
import { isBoolean, isInteger, isArrayOf } from "../../core/util/types";
import { range } from "../../core/util/array";
import { logger } from "../../core/logging";
export class Filter extends Model {
    constructor(attrs) {
        super(attrs);
    }
    static init_Filter() {
        this.define({
            filter: [p.Array, null],
        });
    }
    compute_indices(_source) {
        const filter = this.filter;
        if (filter != null) {
            if (isArrayOf(filter, isBoolean)) {
                return range(0, filter.length).filter((i) => filter[i] === true);
            }
            if (isArrayOf(filter, isInteger)) {
                return filter;
            }
            logger.warn(`${this}: filter should either be array of only booleans or only integers, defaulting to no filtering`);
            return null;
        }
        else {
            logger.warn(`${this}: filter was not set to be an array, defaulting to no filtering`);
            return null;
        }
    }
}
Filter.__name__ = "Filter";
Filter.init_Filter();
//# sourceMappingURL=filter.js.map