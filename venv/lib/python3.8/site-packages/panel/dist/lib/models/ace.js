import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { div } from "@bokehjs/core/dom";
import { PanelHTMLBoxView } from "./layout";
function ID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}
export class AcePlotView extends PanelHTMLBoxView {
    initialize() {
        super.initialize();
        this._ace = window.ace;
        this._container = div({
            id: ID(),
            style: {
                width: "100%",
                height: "100%"
            }
        });
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.code.change, () => this._update_code_from_model());
        this.connect(this.model.properties.theme.change, () => this._update_theme());
        this.connect(this.model.properties.language.change, () => this._update_language());
        this.connect(this.model.properties.annotations.change, () => this._add_annotations());
        this.connect(this.model.properties.readonly.change, () => {
            this._editor.setReadOnly(this.model.readonly);
        });
    }
    render() {
        super.render();
        if (!(this._container === this.el.childNodes[0]))
            this.el.appendChild(this._container);
        this._container.textContent = this.model.code;
        this._editor = this._ace.edit(this._container.id);
        this._editor.setTheme("ace/theme/" + `${this.model.theme}`);
        this._editor.session.setMode("ace/mode/" + `${this.model.language}`);
        this._editor.setReadOnly(this.model.readonly);
        this._langTools = this._ace.require('ace/ext/language_tools');
        this._editor.setOptions({
            enableBasicAutocompletion: true,
            enableSnippets: true,
            fontFamily: "monospace",
        });
        this._editor.on('change', () => this._update_code_from_editor());
    }
    _update_code_from_model() {
        if (this._editor && this._editor.getValue() != this.model.code)
            this._editor.setValue(this.model.code);
    }
    _update_code_from_editor() {
        if (this._editor.getValue() != this.model.code) {
            this.model.code = this._editor.getValue();
        }
    }
    _update_theme() {
        this._editor.setTheme("ace/theme/" + `${this.model.theme}`);
    }
    _update_language() {
        this._editor.session.setMode("ace/mode/" + `${this.model.language}`);
    }
    _add_annotations() {
        this._editor.session.setAnnotations(this.model.annotations);
    }
    after_layout() {
        super.after_layout();
        this._editor.resize();
    }
}
AcePlotView.__name__ = "AcePlotView";
export class AcePlot extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_AcePlot() {
        this.prototype.default_view = AcePlotView;
        this.define({
            code: [p.String],
            language: [p.String, 'python'],
            theme: [p.String, 'chrome'],
            annotations: [p.Array, []],
            readonly: [p.Boolean, false]
        });
        this.override({
            height: 300,
            width: 300
        });
    }
}
AcePlot.__name__ = "AcePlot";
AcePlot.__module__ = "panel.models.ace";
AcePlot.init_AcePlot();
//# sourceMappingURL=ace.js.map