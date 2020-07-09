import { ColorMapper } from "./color_mapper";
import * as p from "../../core/properties";
export class ContinuousColorMapper extends ColorMapper {
    constructor(attrs) {
        super(attrs);
    }
    static init_ContinuousColorMapper() {
        this.define({
            high: [p.Number],
            low: [p.Number],
            high_color: [p.Color],
            low_color: [p.Color],
        });
    }
    _colors(conv) {
        return Object.assign(Object.assign({}, super._colors(conv)), { low_color: this.low_color != null ? conv(this.low_color) : undefined, high_color: this.high_color != null ? conv(this.high_color) : undefined });
    }
}
ContinuousColorMapper.__name__ = "ContinuousColorMapper";
ContinuousColorMapper.init_ContinuousColorMapper();
//# sourceMappingURL=continuous_color_mapper.js.map