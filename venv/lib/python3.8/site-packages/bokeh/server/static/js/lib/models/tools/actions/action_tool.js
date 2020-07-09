import { ButtonTool, ButtonToolView, ButtonToolButtonView } from "../button_tool";
import { Signal0 } from "../../../core/signaling";
export class ActionToolButtonView extends ButtonToolButtonView {
    _clicked() {
        this.model.do.emit();
    }
}
ActionToolButtonView.__name__ = "ActionToolButtonView";
export class ActionToolView extends ButtonToolView {
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.do, () => this.doit());
    }
}
ActionToolView.__name__ = "ActionToolView";
export class ActionTool extends ButtonTool {
    constructor(attrs) {
        super(attrs);
        this.button_view = ActionToolButtonView;
        this.do = new Signal0(this, "do");
    }
}
ActionTool.__name__ = "ActionTool";
//# sourceMappingURL=action_tool.js.map