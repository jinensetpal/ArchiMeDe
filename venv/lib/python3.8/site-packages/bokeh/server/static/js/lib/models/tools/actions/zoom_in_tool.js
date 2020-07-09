import { ActionTool, ActionToolView } from "./action_tool";
import { scale_range } from "../../../core/util/zoom";
import * as p from "../../../core/properties";
import { bk_tool_icon_zoom_in } from "../../../styles/icons";
export class ZoomInToolView extends ActionToolView {
    doit() {
        const frame = this.plot_view.frame;
        const dims = this.model.dimensions;
        // restrict to axis configured in tool's dimensions property
        const h_axis = dims == 'width' || dims == 'both';
        const v_axis = dims == 'height' || dims == 'both';
        const zoom_info = scale_range(frame, this.model.factor, h_axis, v_axis);
        this.plot_view.push_state('zoom_out', { range: zoom_info });
        this.plot_view.update_range(zoom_info, false, true);
        if (this.model.document)
            this.model.document.interactive_start(this.plot_model);
    }
}
ZoomInToolView.__name__ = "ZoomInToolView";
export class ZoomInTool extends ActionTool {
    constructor(attrs) {
        super(attrs);
        this.tool_name = "Zoom In";
        this.icon = bk_tool_icon_zoom_in;
    }
    static init_ZoomInTool() {
        this.prototype.default_view = ZoomInToolView;
        this.define({
            factor: [p.Percent, 0.1],
            dimensions: [p.Dimensions, "both"],
        });
        this.register_alias("zoom_in", () => new ZoomInTool({ dimensions: 'both' }));
        this.register_alias("xzoom_in", () => new ZoomInTool({ dimensions: 'width' }));
        this.register_alias("yzoom_in", () => new ZoomInTool({ dimensions: 'height' }));
    }
    get tooltip() {
        return this._get_dim_tooltip(this.tool_name, this.dimensions);
    }
}
ZoomInTool.__name__ = "ZoomInTool";
ZoomInTool.init_ZoomInTool();
//# sourceMappingURL=zoom_in_tool.js.map