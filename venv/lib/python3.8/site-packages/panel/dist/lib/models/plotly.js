import * as p from "@bokehjs/core/properties";
import { clone } from "@bokehjs/core/util/object";
import { isEqual } from "@bokehjs/core/util/eq";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { debounce } from "debounce";
import { deepCopy, isPlainObject, get, throttle } from "./util";
import { PanelHTMLBoxView } from "./layout";
const filterEventData = (gd, eventData, event) => {
    // Ported from dash-core-components/src/components/Graph.react.js
    let filteredEventData = Array.isArray(eventData) ? [] : {};
    if (event === "click" || event === "hover" || event === "selected") {
        const points = [];
        if (eventData === undefined || eventData === null) {
            return null;
        }
        /*
         * remove `data`, `layout`, `xaxis`, etc
         * objects from the event data since they're so big
         * and cause JSON stringify ciricular structure errors.
         *
         * also, pull down the `customdata` point from the data array
         * into the event object
         */
        const data = gd.data;
        for (let i = 0; i < eventData.points.length; i++) {
            const fullPoint = eventData.points[i];
            let pointData = {};
            for (let property in fullPoint) {
                const val = fullPoint[property];
                if (fullPoint.hasOwnProperty(property) &&
                    !Array.isArray(val) && !isPlainObject(val)) {
                    pointData[property] = val;
                }
            }
            if (fullPoint !== undefined && fullPoint !== null) {
                if (fullPoint.hasOwnProperty("curveNumber") &&
                    fullPoint.hasOwnProperty("pointNumber") &&
                    data[fullPoint["curveNumber"]].hasOwnProperty("customdata")) {
                    pointData["customdata"] =
                        data[fullPoint["curveNumber"]].customdata[fullPoint["pointNumber"]];
                }
                // specific to histogram. see https://github.com/plotly/plotly.js/pull/2113/
                if (fullPoint.hasOwnProperty('pointNumbers')) {
                    pointData["pointNumbers"] = fullPoint.pointNumbers;
                }
            }
            points[i] = pointData;
        }
        filteredEventData["points"] = points;
    }
    else if (event === 'relayout' || event === 'restyle') {
        /*
         * relayout shouldn't include any big objects
         * it will usually just contain the ranges of the axes like
         * "xaxis.range[0]": 0.7715822247381828,
         * "xaxis.range[1]": 3.0095292008680063`
         */
        for (let property in eventData) {
            if (eventData.hasOwnProperty(property)) {
                filteredEventData[property] = eventData[property];
            }
        }
    }
    if (eventData.hasOwnProperty('range')) {
        filteredEventData["range"] = eventData["range"];
    }
    if (eventData.hasOwnProperty('lassoPoints')) {
        filteredEventData["lassoPoints"] = eventData["lassoPoints"];
    }
    return filteredEventData;
};
export class PlotlyPlotView extends PanelHTMLBoxView {
    constructor() {
        super(...arguments);
        this._settingViewport = false;
        this._plotInitialized = false;
        this._reacting = false;
        this._relayouting = false;
        this._end_relayouting = debounce(() => {
            this._relayouting = false;
        }, 2000, false);
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.viewport_update_policy.change, this._updateSetViewportFunction);
        this.connect(this.model.properties.viewport_update_throttle.change, this._updateSetViewportFunction);
        this.connect(this.model.properties._render_count.change, this.plot);
        this.connect(this.model.properties.viewport.change, this._updateViewportFromProperty);
    }
    render() {
        super.render();
        if (!window.Plotly) {
            return;
        }
        this.plot();
    }
    plot() {
        if (!window.Plotly) {
            return;
        }
        const data = [];
        for (let i = 0; i < this.model.data.length; i++) {
            data.push(this._get_trace(i, false));
        }
        let newLayout = deepCopy(this.model.layout);
        if (this._relayouting) {
            const layout = this.el.layout;
            // For each xaxis* and yaxis* property of layout, if the value has a 'range'
            // property then use this in newLayout
            Object.keys(layout).reduce((value, key) => {
                if (key.slice(1, 5) === "axis" && 'range' in value) {
                    newLayout[key].range = value.range;
                }
            }, {});
        }
        this._reacting = true;
        window.Plotly.react(this.el, data, newLayout, this.model.config).then(() => {
            this._updateSetViewportFunction();
            this._updateViewportProperty();
            if (!this._plotInitialized) {
                // Install callbacks
                //  - plotly_relayout
                (this.el).on('plotly_relayout', (eventData) => {
                    if (eventData['_update_from_property'] !== true) {
                        this.model.relayout_data = filterEventData(this.el, eventData, 'relayout');
                        this._updateViewportProperty();
                        this._end_relayouting();
                    }
                });
                //  - plotly_relayouting
                (this.el).on('plotly_relayouting', () => {
                    if (this.model.viewport_update_policy !== 'mouseup') {
                        this._relayouting = true;
                        this._updateViewportProperty();
                    }
                });
                //  - plotly_restyle
                (this.el).on('plotly_restyle', (eventData) => {
                    this.model.restyle_data = filterEventData(this.el, eventData, 'restyle');
                    this._updateViewportProperty();
                });
                //  - plotly_click
                (this.el).on('plotly_click', (eventData) => {
                    this.model.click_data = filterEventData(this.el, eventData, 'click');
                });
                //  - plotly_hover
                (this.el).on('plotly_hover', (eventData) => {
                    this.model.hover_data = filterEventData(this.el, eventData, 'hover');
                });
                //  - plotly_selected
                (this.el).on('plotly_selected', (eventData) => {
                    this.model.selected_data = filterEventData(this.el, eventData, 'selected');
                });
                //  - plotly_clickannotation
                (this.el).on('plotly_clickannotation', (eventData) => {
                    delete eventData["event"];
                    delete eventData["fullAnnotation"];
                    this.model.clickannotation_data = eventData;
                });
                //  - plotly_deselect
                (this.el).on('plotly_deselect', () => {
                    this.model.selected_data = null;
                });
                //  - plotly_unhover
                (this.el).on('plotly_unhover', () => {
                    this.model.hover_data = null;
                });
            }
            this._plotInitialized = true;
            this._reacting = false;
        });
    }
    _get_trace(index, update) {
        const trace = clone(this.model.data[index]);
        const cds = this.model.data_sources[index];
        for (const column of cds.columns()) {
            let array = cds.get_array(column)[0];
            if (array.shape != null && array.shape.length > 1) {
                const arrays = [];
                const shape = array.shape;
                for (let s = 0; s < shape[0]; s++) {
                    arrays.push(array.slice(s * shape[1], (s + 1) * shape[1]));
                }
                array = arrays;
            }
            let prop_path = column.split(".");
            let prop = prop_path[prop_path.length - 1];
            let prop_parent = trace;
            for (let k of prop_path.slice(0, -1)) {
                prop_parent = prop_parent[k];
            }
            if (update && prop_path.length == 1) {
                prop_parent[prop] = [array];
            }
            else {
                prop_parent[prop] = array;
            }
        }
        return trace;
    }
    _updateViewportFromProperty() {
        if (!window.Plotly || this._settingViewport || this._reacting || !this.model.viewport) {
            return;
        }
        const fullLayout = this.el._fullLayout;
        // Call relayout if viewport differs from fullLayout
        Object.keys(this.model.viewport).reduce((value, key) => {
            if (!isEqual(get(fullLayout, key), value)) {
                let clonedViewport = deepCopy(this.model.viewport);
                clonedViewport['_update_from_property'] = true;
                window.Plotly.relayout(this.el, clonedViewport);
                return false;
            }
            else {
                return true;
            }
        }, {});
    }
    _updateViewportProperty() {
        const fullLayout = this.el._fullLayout;
        let viewport = {};
        // Get range for all xaxis and yaxis properties
        for (let prop in fullLayout) {
            if (!fullLayout.hasOwnProperty(prop)) {
                continue;
            }
            let maybe_axis = prop.slice(0, 5);
            if (maybe_axis === 'xaxis' || maybe_axis === 'yaxis') {
                viewport[prop + '.range'] = deepCopy(fullLayout[prop].range);
            }
        }
        if (!isEqual(viewport, this.model.viewport)) {
            this._setViewport(viewport);
        }
    }
    _updateSetViewportFunction() {
        if (this.model.viewport_update_policy === "continuous" ||
            this.model.viewport_update_policy === "mouseup") {
            this._setViewport = (viewport) => {
                if (!this._settingViewport) {
                    this._settingViewport = true;
                    this.model.viewport = viewport;
                    this._settingViewport = false;
                }
            };
        }
        else {
            this._setViewport = throttle((viewport) => {
                if (!this._settingViewport) {
                    this._settingViewport = true;
                    this.model.viewport = viewport;
                    this._settingViewport = false;
                }
            }, this.model.viewport_update_throttle);
        }
    }
}
PlotlyPlotView.__name__ = "PlotlyPlotView";
export class PlotlyPlot extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_PlotlyPlot() {
        this.prototype.default_view = PlotlyPlotView;
        this.define({
            data: [p.Array, []],
            layout: [p.Any, {}],
            config: [p.Any, {}],
            data_sources: [p.Array, []],
            relayout_data: [p.Any, {}],
            restyle_data: [p.Array, []],
            click_data: [p.Any, {}],
            hover_data: [p.Any, {}],
            clickannotation_data: [p.Any, {}],
            selected_data: [p.Any, {}],
            viewport: [p.Any, {}],
            viewport_update_policy: [p.String, "mouseup"],
            viewport_update_throttle: [p.Number, 200],
            _render_count: [p.Number, 0],
        });
    }
}
PlotlyPlot.__name__ = "PlotlyPlot";
PlotlyPlot.__module__ = "panel.models.plotly";
PlotlyPlot.init_PlotlyPlot();
//# sourceMappingURL=plotly.js.map