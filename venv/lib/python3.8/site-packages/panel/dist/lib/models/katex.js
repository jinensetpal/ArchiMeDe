import { Markup } from "@bokehjs/models/widgets/markup";
import { PanelMarkupView } from "./layout";
export class KaTeXView extends PanelMarkupView {
    render() {
        super.render();
        this.markup_el.innerHTML = this.model.text;
        if (!window.renderMathInElement) {
            return;
        }
        window.renderMathInElement(this.el, {
            delimiters: [
                { left: "$$", right: "$$", display: true },
                { left: "\\[", right: "\\]", display: true },
                { left: "$", right: "$", display: false },
                { left: "\\(", right: "\\)", display: false }
            ]
        });
    }
}
KaTeXView.__name__ = "KaTeXView";
export class KaTeX extends Markup {
    constructor(attrs) {
        super(attrs);
    }
    static init_KaTeX() {
        this.prototype.default_view = KaTeXView;
    }
}
KaTeX.__name__ = "KaTeX";
KaTeX.__module__ = "panel.models.katex";
KaTeX.init_KaTeX();
//# sourceMappingURL=katex.js.map