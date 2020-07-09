import { DOMView } from "../../core/dom_view";
import * as visuals from "../../core/visuals";
import * as p from "../../core/properties";
import { Model } from "../../model";
// This shouldn't be a DOMView, but annotations create a mess.
export class RendererView extends DOMView {
    initialize() {
        super.initialize();
        this.visuals = new visuals.Visuals(this.model);
        this._has_finished = true; // XXX: should be in render() but subclasses don't respect super()
    }
    get plot_view() {
        return this.parent;
    }
    get plot_model() {
        return this.parent.model;
    }
    get layer() {
        const { canvas_view } = this.plot_view;
        return this.model.level == "overlay" ? canvas_view.overlays : canvas_view.primary;
    }
    request_render() {
        this.plot_view.request_render();
    }
    map_to_screen(x, y) {
        return this.plot_view.map_to_screen(x, y, this.model.x_range_name, this.model.y_range_name);
    }
    get needs_clip() {
        return false;
    }
    notify_finished() {
        this.plot_view.notify_finished();
    }
    get has_webgl() {
        return false;
    }
}
RendererView.__name__ = "RendererView";
export class Renderer extends Model {
    constructor(attrs) {
        super(attrs);
    }
    static init_Renderer() {
        this.define({
            level: [p.RenderLevel],
            visible: [p.Boolean, true],
        });
    }
}
Renderer.__name__ = "Renderer";
Renderer.init_Renderer();
//# sourceMappingURL=renderer.js.map