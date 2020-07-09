import { div } from "@bokehjs/core/dom";
import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView, set_size } from "./layout";
import { makeTooltip } from "./tooltips";
import GL from '@luma.gl/constants';
function extractClasses() {
    // Get classes for registration from standalone deck.gl
    const classesDict = {};
    const deck = window.deck;
    const classes = Object.keys(deck).filter(x => x.charAt(0) === x.charAt(0).toUpperCase());
    for (const cls of classes) {
        classesDict[cls] = deck[cls];
    }
    return classesDict;
}
export class DeckGLPlotView extends PanelHTMLBoxView {
    connect_signals() {
        super.connect_signals();
        const { data, mapbox_api_key, tooltip, layers, initialViewState, data_sources } = this.model.properties;
        this.on_change([mapbox_api_key, tooltip], () => this.render());
        this.on_change([data, initialViewState], () => this.updateDeck());
        this.on_change([layers], () => this._update_layers());
        this.on_change([data_sources], () => this._connect_sources(true));
        this._layer_map = {};
        this._connected = [];
        this._connect_sources();
    }
    _update_layers() {
        this._layer_map = {};
        this._update_data(true);
    }
    _connect_sources(render = false) {
        for (const cds of this.model.data_sources) {
            if (this._connected.indexOf(cds) < 0) {
                this.connect(cds.properties.data.change, () => this._update_data(true));
                this._connected.push(cds);
            }
        }
        this._update_data(render);
    }
    initialize() {
        super.initialize();
        if (window.deck.JSONConverter) {
            const { CSVLoader, Tile3DLoader } = window.loaders;
            window.loaders.registerLoaders([Tile3DLoader, CSVLoader]);
            const jsonConverterConfiguration = {
                classes: extractClasses(),
                // Will be resolved as `<enum-name>.<enum-value>`
                enumerations: {
                    COORDINATE_SYSTEM: window.deck.COORDINATE_SYSTEM,
                    GL
                },
                // Constants that should be resolved with the provided values by JSON converter
                constants: {
                    Tile3DLoader
                }
            };
            this.jsonConverter = new window.deck.JSONConverter({
                configuration: jsonConverterConfiguration
            });
        }
    }
    _update_data(render = true) {
        let n = 0;
        for (const layer of this.model.layers) {
            let cds;
            n += 1;
            if ((n - 1) in this._layer_map) {
                cds = this.model.data_sources[this._layer_map[n - 1]];
            }
            else if (typeof layer.data != "number")
                continue;
            else {
                this._layer_map[n - 1] = layer.data;
                cds = this.model.data_sources[layer.data];
            }
            const data = [];
            const columns = cds.columns();
            for (let i = 0; i < cds.get_length(); i++) {
                const item = {};
                for (const column of columns) {
                    let array = cds.get_array(column);
                    const shape = array[0].shape == null ? null : array[0].shape;
                    if ((shape != null) && (shape.length > 1) && (typeof shape[0] == "number"))
                        item[column] = array.slice(i * shape[1], i * shape[1] + shape[1]);
                    else
                        item[column] = array[i];
                }
                data.push(item);
            }
            layer.data = data;
        }
        if (render)
            this.updateDeck();
    }
    _on_click_event(event) {
        const clickState = {
            coordinate: event.coordinate,
            lngLat: event.lngLat,
            index: event.index
        };
        this.model.clickState = clickState;
    }
    _on_hover_event(event) {
        const hoverState = {
            coordinate: event.coordinate,
            lngLat: event.lngLat,
            index: event.index
        };
        this.model.hoverState = hoverState;
    }
    _on_viewState_event(event) {
        this.model.viewState = event.viewState;
    }
    getData() {
        const data = Object.assign(Object.assign({}, this.model.data), { layers: this.model.layers, initialViewState: this.model.initialViewState, onViewStateChange: (event) => this._on_viewState_event(event), onClick: (event) => this._on_click_event(event), onHover: (event) => this._on_hover_event(event) });
        return data;
    }
    updateDeck() {
        if (!this.deckGL) {
            this.render();
            return;
        }
        const data = this.getData();
        if (window.deck.updateDeck) {
            window.deck.updateDeck(data, this.deckGL);
        }
        else {
            const results = this.jsonConverter.convert(data);
            this.deckGL.setProps(results);
        }
    }
    createDeck({ mapboxApiKey, container, jsonInput, tooltip }) {
        let deckgl;
        try {
            const props = this.jsonConverter.convert(jsonInput);
            const getTooltip = makeTooltip(tooltip);
            deckgl = new window.deck.DeckGL(Object.assign(Object.assign({}, props), { map: window.mapboxgl, mapboxApiAccessToken: mapboxApiKey, container,
                getTooltip }));
        }
        catch (err) {
            console.error(err);
        }
        return deckgl;
    }
    render() {
        super.render();
        const container = div({ class: "deckgl" });
        set_size(container, this.model);
        const MAPBOX_API_KEY = this.model.mapbox_api_key;
        const tooltip = this.model.tooltip;
        const data = this.getData();
        if (window.deck.createDeck) {
            this.deckGL = window.deck.createDeck({
                mapboxApiKey: MAPBOX_API_KEY,
                container: container,
                jsonInput: data,
                tooltip
            });
        }
        else {
            this.deckGL = this.createDeck({
                mapboxApiKey: MAPBOX_API_KEY,
                container: container,
                jsonInput: data,
                tooltip
            });
        }
        this.el.appendChild(container);
    }
}
DeckGLPlotView.__name__ = "DeckGLPlotView";
export class DeckGLPlot extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_DeckGLPlot() {
        this.prototype.default_view = DeckGLPlotView;
        this.define({
            data: [p.Any],
            data_sources: [p.Array, []],
            clickState: [p.Any],
            hoverState: [p.Any],
            initialViewState: [p.Any],
            layers: [p.Array, []],
            mapbox_api_key: [p.String],
            tooltip: [p.Any],
            viewState: [p.Any],
        });
        this.override({
            height: 400,
            width: 600
        });
    }
}
DeckGLPlot.__name__ = "DeckGLPlot";
DeckGLPlot.__module__ = "panel.models.deckgl";
DeckGLPlot.init_DeckGLPlot();
//# sourceMappingURL=deckgl.js.map