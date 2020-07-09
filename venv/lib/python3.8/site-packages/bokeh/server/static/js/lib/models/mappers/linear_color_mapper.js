import { ContinuousColorMapper } from "./continuous_color_mapper";
import { min, max } from "../../core/util/arrayable";
export class LinearColorMapper extends ContinuousColorMapper {
    constructor(attrs) {
        super(attrs);
    }
    _v_compute(data, values, palette, colors) {
        const { nan_color, low_color, high_color } = colors;
        const low = this.low != null ? this.low : min(data);
        const high = this.high != null ? this.high : max(data);
        const max_key = palette.length - 1;
        const norm_factor = 1 / (high - low);
        const normed_interval = 1 / palette.length;
        for (let i = 0, end = data.length; i < end; i++) {
            const d = data[i];
            if (isNaN(d)) {
                values[i] = nan_color;
                continue;
            }
            // This handles the edge case where d == high, since the code below maps
            // values exactly equal to high to palette.length, which is greater than
            // max_key
            if (d == high) {
                values[i] = palette[max_key];
                continue;
            }
            const normed_d = (d - low) * norm_factor;
            const key = Math.floor(normed_d / normed_interval);
            if (key < 0)
                values[i] = low_color != null ? low_color : palette[0];
            else if (key > max_key)
                values[i] = high_color != null ? high_color : palette[max_key];
            else
                values[i] = palette[key];
        }
    }
}
LinearColorMapper.__name__ = "LinearColorMapper";
//# sourceMappingURL=linear_color_mapper.js.map