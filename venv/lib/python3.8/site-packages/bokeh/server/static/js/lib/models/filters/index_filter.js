import { Filter } from "./filter";
import * as p from "../../core/properties";
import { logger } from "../../core/logging";
import { isInteger } from "../../core/util/types";
import { every } from "../../core/util/array";
export class IndexFilter extends Filter {
    constructor(attrs) {
        super(attrs);
    }
    static init_IndexFilter() {
        this.define({
            indices: [p.Array, null],
        });
    }
    compute_indices(_source) {
        if (this.indices != null) {
            if (every(this.indices, isInteger))
                return this.indices;
            else {
                logger.warn(`${this}: indices should be array of integers, defaulting to no filtering`);
                return null;
            }
        }
        else {
            logger.warn(`${this}: indices was not set, defaulting to no filtering`);
            return null;
        }
    }
}
IndexFilter.__name__ = "IndexFilter";
IndexFilter.init_IndexFilter();
//# sourceMappingURL=index_filter.js.map