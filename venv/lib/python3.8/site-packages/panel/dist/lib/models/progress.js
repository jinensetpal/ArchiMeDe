import * as p from "@bokehjs/core/properties";
import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box";
import { CachedVariadicBox, set_size } from "./layout";
export class ProgressView extends HTMLBoxView {
    connect_signals() {
        super.connect_signals();
        const resize = () => {
            this.render();
            this.root.compute_layout(); // XXX: invalidate_layout?
        };
        this.connect(this.model.properties.height.change, resize);
        this.connect(this.model.properties.width.change, resize);
        this.connect(this.model.properties.height_policy.change, resize);
        this.connect(this.model.properties.width_policy.change, resize);
        this.connect(this.model.properties.sizing_mode.change, resize);
        this.connect(this.model.properties.active.change, () => this.setCSS());
        this.connect(this.model.properties.bar_color.change, () => this.setCSS());
        this.connect(this.model.properties.css_classes.change, () => this.setCSS());
        this.connect(this.model.properties.value.change, () => this.setValue());
        this.connect(this.model.properties.max.change, () => this.setMax());
    }
    render() {
        super.render();
        const style = Object.assign(Object.assign({}, this.model.style), { display: "inline-block" });
        this.progressEl = document.createElement('progress');
        this.setValue();
        this.setMax();
        set_size(this.progressEl, this.model);
        // Set styling
        this.setCSS();
        for (const prop in style)
            this.progressEl.style.setProperty(prop, style[prop]);
        this.el.appendChild(this.progressEl);
    }
    setCSS() {
        let css = this.model.css_classes.join(" ") + " " + this.model.bar_color;
        if (this.model.active)
            css = css + " active";
        this.progressEl.className = css;
    }
    setValue() {
        if (this.model.value != null)
            this.progressEl.value = this.model.value;
    }
    setMax() {
        if (this.model.max != null)
            this.progressEl.max = this.model.max;
    }
    _update_layout() {
        let changed = ((this._prev_sizing_mode !== undefined) &&
            (this._prev_sizing_mode !== this.model.sizing_mode));
        this._prev_sizing_mode = this.model.sizing_mode;
        this.layout = new CachedVariadicBox(this.el, this.model.sizing_mode, changed);
        this.layout.set_sizing(this.box_sizing());
    }
}
ProgressView.__name__ = "ProgressView";
export class Progress extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_Progress() {
        this.prototype.default_view = ProgressView;
        this.define({
            active: [p.Boolean, true],
            bar_color: [p.String, 'primary'],
            style: [p.Any, {}],
            max: [p.Number, 100],
            value: [p.Number, null],
        });
    }
}
Progress.__name__ = "Progress";
Progress.__module__ = "panel.models.widgets";
Progress.init_Progress();
//# sourceMappingURL=progress.js.map