import { ActionTool, ActionToolView } from "./action_tool";
import { bk_tool_icon_save } from "../../../styles/icons";
export class SaveToolView extends ActionToolView {
    doit() {
        this.plot_view.save("bokeh_plot");
    }
}
SaveToolView.__name__ = "SaveToolView";
export class SaveTool extends ActionTool {
    constructor(attrs) {
        super(attrs);
        this.tool_name = "Save";
        this.icon = bk_tool_icon_save;
    }
    static init_SaveTool() {
        this.prototype.default_view = SaveToolView;
        this.register_alias("save", () => new SaveTool());
    }
}
SaveTool.__name__ = "SaveTool";
SaveTool.init_SaveTool();
//# sourceMappingURL=save_tool.js.map