import { Filter } from "./filter";
import * as p from "../../core/properties";
import { logger } from "../../core/logging";
import { range, every } from "../../core/util/array";
import { isBoolean } from "../../core/util/types";
export class BooleanFilter extends Filter {
    constructor(attrs) {
        super(attrs);
    }
    static init_BooleanFilter() {
        this.define({
            booleans: [p.Array, null],
        });
    }
    compute_indices(source) {
        const booleans = this.booleans;
        if (booleans != null && booleans.length > 0) {
            if (every(booleans, isBoolean)) {
                if (booleans.length !== source.get_length()) {
                    logger.warn(`${this}: length of booleans doesn't match data source`);
                }
                return range(0, booleans.length).filter((i) => booleans[i] === true);
            }
            else {
                logger.warn(`${this}: booleans should be array of booleans, defaulting to no filtering`);
                return null;
            }
        }
        else {
            if (booleans != null && booleans.length == 0)
                logger.warn(`${this}: booleans is empty, defaulting to no filtering`);
            else
                logger.warn(`${this}: booleans was not set, defaulting to no filtering`);
            return null;
        }
    }
}
BooleanFilter.__name__ = "BooleanFilter";
BooleanFilter.init_BooleanFilter();
//# sourceMappingURL=boolean_filter.js.map