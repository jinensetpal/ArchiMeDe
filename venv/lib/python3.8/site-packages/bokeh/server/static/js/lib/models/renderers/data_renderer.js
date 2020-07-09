import { Renderer, RendererView } from "./renderer";
import * as p from "../../core/properties";
export class DataRendererView extends RendererView {
}
DataRendererView.__name__ = "DataRendererView";
export class DataRenderer extends Renderer {
    constructor(attrs) {
        super(attrs);
    }
    static init_DataRenderer() {
        this.define({
            x_range_name: [p.String, 'default'],
            y_range_name: [p.String, 'default'],
        });
        this.override({
            level: 'glyph',
        });
    }
}
DataRenderer.__name__ = "DataRenderer";
DataRenderer.init_DataRenderer();
//# sourceMappingURL=data_renderer.js.map