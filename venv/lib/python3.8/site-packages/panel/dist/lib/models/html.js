import { Markup } from "@bokehjs/models/widgets/markup";
import { PanelMarkupView } from "./layout";
export function htmlDecode(input) {
    var doc = new DOMParser().parseFromString(input, "text/html");
    return doc.documentElement.textContent;
}
export class HTMLView extends PanelMarkupView {
    render() {
        super.render();
        const decoded = htmlDecode(this.model.text);
        const html = decoded || this.model.text;
        if (!html) {
            this.markup_el.innerHTML = '';
            return;
        }
        this.markup_el.innerHTML = html;
        Array.from(this.markup_el.querySelectorAll("script")).forEach(oldScript => {
            const newScript = document.createElement("script");
            Array.from(oldScript.attributes)
                .forEach(attr => newScript.setAttribute(attr.name, attr.value));
            newScript.appendChild(document.createTextNode(oldScript.innerHTML));
            if (oldScript.parentNode)
                oldScript.parentNode.replaceChild(newScript, oldScript);
        });
    }
}
HTMLView.__name__ = "HTMLView";
export class HTML extends Markup {
    constructor(attrs) {
        super(attrs);
    }
    static init_HTML() {
        this.prototype.default_view = HTMLView;
    }
}
HTML.__name__ = "HTML";
HTML.__module__ = "panel.models.markup";
HTML.init_HTML();
//# sourceMappingURL=html.js.map