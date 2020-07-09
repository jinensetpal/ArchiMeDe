import * as p from "@bokehjs/core/properties";
import { isArray } from "@bokehjs/core/util/types";
import { HTMLBox, HTMLBoxView } from "@bokehjs/models/layouts/html_box";
export class VegaPlotView extends HTMLBoxView {
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.data.change, this._plot);
        this.connect(this.model.properties.data_sources.change, () => this._connect_sources());
        this._connected = [];
        this._connect_sources();
    }
    _connect_sources() {
        for (const ds in this.model.data_sources) {
            const cds = this.model.data_sources[ds];
            if (this._connected.indexOf(ds) < 0) {
                this.connect(cds.properties.data.change, this._plot);
                this._connected.push(ds);
            }
        }
    }
    _fetch_datasets() {
        const datasets = {};
        for (const ds in this.model.data_sources) {
            const cds = this.model.data_sources[ds];
            const data = [];
            const columns = cds.columns();
            for (let i = 0; i < cds.get_length(); i++) {
                const item = {};
                for (const column of columns) {
                    item[column] = cds.data[column][i];
                }
                data.push(item);
            }
            datasets[ds] = data;
        }
        return datasets;
    }
    render() {
        super.render();
        this._plot();
    }
    _plot() {
        const data = this.model.data;
        if ((data == null) || !window.vegaEmbed)
            return;
        if (this.model.data_sources && (Object.keys(this.model.data_sources).length > 0)) {
            const datasets = this._fetch_datasets();
            if ('data' in datasets) {
                data.data['values'] = datasets['data'];
                delete datasets['data'];
            }
            if (data.data != null) {
                const data_objs = isArray(data.data) ? data.data : [data.data];
                for (const d of data_objs) {
                    if (d.name in datasets) {
                        d['values'] = datasets[d.name];
                        delete datasets[d.name];
                    }
                }
            }
            this.model.data['datasets'] = datasets;
        }
        window.vegaEmbed(this.el, this.model.data, { actions: false });
    }
}
VegaPlotView.__name__ = "VegaPlotView";
export class VegaPlot extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_VegaPlot() {
        this.prototype.default_view = VegaPlotView;
        this.define({
            data: [p.Any],
            data_sources: [p.Any],
        });
    }
}
VegaPlot.__name__ = "VegaPlot";
VegaPlot.__module__ = "panel.models.vega";
VegaPlot.init_VegaPlot();
//# sourceMappingURL=vega.js.map