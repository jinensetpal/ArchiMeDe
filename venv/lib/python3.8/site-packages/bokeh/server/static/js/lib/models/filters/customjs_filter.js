import { Filter } from "./filter";
import * as p from "../../core/properties";
import { keys, values } from "../../core/util/object";
import { use_strict } from "../../core/util/string";
export class CustomJSFilter extends Filter {
    constructor(attrs) {
        super(attrs);
    }
    static init_CustomJSFilter() {
        this.define({
            args: [p.Any, {}],
            code: [p.String, ''],
        });
    }
    get names() {
        return keys(this.args);
    }
    get values() {
        return values(this.args);
    }
    get func() {
        const code = use_strict(this.code);
        return new Function(...this.names, "source", code);
    }
    compute_indices(source) {
        this.filter = this.func(...this.values, source);
        return super.compute_indices(source);
    }
}
CustomJSFilter.__name__ = "CustomJSFilter";
CustomJSFilter.init_CustomJSFilter();
//# sourceMappingURL=customjs_filter.js.map