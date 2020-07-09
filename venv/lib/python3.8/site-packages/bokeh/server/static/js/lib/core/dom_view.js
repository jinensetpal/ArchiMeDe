import { View } from "./view";
import { stylesheet } from "./dom";
import * as DOM from "./dom";
import root_css from "../styles/root.css";
export class DOMView extends View {
    initialize() {
        super.initialize();
        this._has_finished = false;
        if (this.is_root) {
            this._stylesheet = stylesheet;
        }
        this._inject_styles();
        this.el = this._createElement();
    }
    remove() {
        DOM.removeElement(this.el);
        super.remove();
    }
    css_classes() {
        return [];
    }
    styles() {
        return [root_css];
    }
    cursor(_sx, _sy) {
        return null;
    }
    render() { }
    renderTo(element) {
        element.appendChild(this.el);
        this.render();
    }
    has_finished() {
        return this._has_finished;
    }
    get is_idle() {
        return this.has_finished();
    }
    get stylesheet() {
        if (this.is_root)
            return this._stylesheet;
        else
            return this.root.stylesheet;
    }
    _inject_styles() {
        const { stylesheet } = this;
        for (const style of this.styles()) {
            stylesheet.append(style);
        }
    }
    _createElement() {
        return DOM.createElement(this.tagName, { class: this.css_classes() });
    }
}
DOMView.__name__ = "DOMView";
DOMView.prototype.tagName = "div";
//# sourceMappingURL=dom_view.js.map