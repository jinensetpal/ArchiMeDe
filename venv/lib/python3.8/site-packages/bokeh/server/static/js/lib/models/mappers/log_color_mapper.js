import { ContinuousColorMapper } from "./continuous_color_mapper";
import { min, max } from "../../core/util/arrayable";
export class LogColorMapper extends ContinuousColorMapper {
    constructor(attrs) {
        super(attrs);
    }
    _v_compute(data, values, palette, colors) {
        const { nan_color, low_color, high_color } = colors;
        const n = palette.length;
        const low = this.low != null ? this.low : min(data);
        const high = this.high != null ? this.high : max(data);
        const scale = n / (Math.log(high) - Math.log(low)); // subtract the low offset
        const max_key = palette.length - 1;
        for (let i = 0, end = data.length; i < end; i++) {
            const d = data[i];
            // Check NaN
            if (isNaN(d)) {
                values[i] = nan_color;
                continue;
            }
            if (d > high) {
                values[i] = high_color != null ? high_color : palette[max_key];
                continue;
            }
            // This handles the edge case where d == high, since the code below maps
            // values exactly equal to high to palette.length, which is greater than
            // max_key
            if (d == high) {
                values[i] = palette[max_key];
                continue;
            }
            if (d < low) {
                values[i] = low_color != null ? low_color : palette[0];
                continue;
            }
            // Get the key
            const log = Math.log(d) - Math.log(low); // subtract the low offset
            let key = Math.floor(log * scale);
            // Deal with upper bound
            if (key > max_key)
                key = max_key;
            values[i] = palette[key];
        }
    }
}
LogColorMapper.__name__ = "LogColorMapper";
//# sourceMappingURL=log_color_mapper.js.map