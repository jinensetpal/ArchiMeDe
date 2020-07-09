import * as p from "@bokehjs/core/properties";
import { Markup } from "@bokehjs/models/widgets/markup";
import JSONFormatter from "json-formatter-js";
import { PanelMarkupView } from "./layout";
export class JSONView extends PanelMarkupView {
    connect_signals() {
        super.connect_signals();
        const { depth, hover_preview, theme } = this.model.properties;
        this.on_change([depth, hover_preview, theme], () => this.render());
    }
    render() {
        super.render();
        const text = this.model.text.replace(/(\r\n|\n|\r)/gm, "").replace("'", '"');
        let json;
        try {
            json = window.JSON.parse(text);
        }
        catch (err) {
            this.markup_el.innerHTML = "<b>Invalid JSON:</b> " + err.toString();
            return;
        }
        const config = { hoverPreviewEnabled: this.model.hover_preview, theme: this.model.theme };
        const depth = this.model.depth == null ? Infinity : this.model.depth;
        const formatter = new JSONFormatter(json, depth, config);
        const rendered = formatter.render();
        let style = "border-radius: 5px; padding: 10px;";
        if (this.model.theme == "dark")
            rendered.style.cssText = "background-color: rgb(30, 30, 30);" + style;
        else
            rendered.style.cssText = style;
        this.markup_el.append(rendered);
    }
}
JSONView.__name__ = "JSONView";
const Theme = ["dark", "light"];
export class JSON extends Markup {
    constructor(attrs) {
        super(attrs);
    }
    static init_JSON() {
        this.prototype.default_view = JSONView;
        this.define({
            depth: [p.Number, 1],
            hover_preview: [p.Boolean, false],
            theme: [p.Enum(Theme), "dark"],
        });
    }
}
JSON.__name__ = "JSON";
JSON.__module__ = "panel.models.markup";
JSON.init_JSON();
//# sourceMappingURL=json.js.map