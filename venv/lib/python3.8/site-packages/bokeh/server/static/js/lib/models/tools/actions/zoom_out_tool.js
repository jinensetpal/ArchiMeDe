import { ActionTool, ActionToolView } from "./action_tool";
import { scale_range } from "../../../core/util/zoom";
import * as p from "../../../core/properties";
import { bk_tool_icon_zoom_out } from "../../../styles/icons";
export class ZoomOutToolView extends ActionToolView {
    doit() {
        const frame = this.plot_view.frame;
        const dims = this.model.dimensions;
        // restrict to axis configured in tool's dimensions property
        const h_axis = dims == 'width' || dims == 'both';
        const v_axis = dims == 'height' || dims == 'both';
        // zooming out requires a negative factor to scale_range
        const zoom_info = scale_range(frame, -this.model.factor, h_axis, v_axis);
        this.plot_view.push_state('zoom_out', { range: zoom_info });
        this.plot_view.update_range(zoom_info, false, true);
        if (this.model.document)
            this.model.document.interactive_start(this.plot_model);
    }
}
ZoomOutToolView.__name__ = "ZoomOutToolView";
export class ZoomOutTool extends ActionTool {
    constructor(attrs) {
        super(attrs);
        this.tool_name = "Zoom Out";
        this.icon = bk_tool_icon_zoom_out;
    }
    static init_ZoomOutTool() {
        this.prototype.default_view = ZoomOutToolView;
        this.define({
            factor: [p.Percent, 0.1],
            dimensions: [p.Dimensions, "both"],
        });
        this.register_alias("zoom_out", () => new ZoomOutTool({ dimensions: 'both' }));
        this.register_alias("xzoom_out", () => new ZoomOutTool({ dimensions: 'width' }));
        this.register_alias("yzoom_out", () => new ZoomOutTool({ dimensions: 'height' }));
    }
    get tooltip() {
        return this._get_dim_tooltip(this.tool_name, this.dimensions);
    }
}
ZoomOutTool.__name__ = "ZoomOutTool";
ZoomOutTool.init_ZoomOutTool();
//# sourceMappingURL=zoom_out_tool.js.map