import { Markup } from "@bokehjs/models/widgets/markup";
import { PanelMarkupView } from "./layout";
export class MathJaxView extends PanelMarkupView {
    initialize() {
        super.initialize();
        this._hub = window.MathJax.Hub;
        this._hub.Config({
            tex2jax: { inlineMath: [['$', '$'], ['\\(', '\\)']] }
        });
    }
    render() {
        super.render();
        if (!this._hub) {
            return;
        }
        this.markup_el.innerHTML = this.model.text;
        this._hub.Queue(["Typeset", this._hub, this.markup_el]);
    }
}
MathJaxView.__name__ = "MathJaxView";
export class MathJax extends Markup {
    constructor(attrs) {
        super(attrs);
    }
    static init_MathJax() {
        this.prototype.default_view = MathJaxView;
    }
}
MathJax.__name__ = "MathJax";
MathJax.__module__ = "panel.models.mathjax";
MathJax.init_MathJax();
//# sourceMappingURL=mathjax.js.map