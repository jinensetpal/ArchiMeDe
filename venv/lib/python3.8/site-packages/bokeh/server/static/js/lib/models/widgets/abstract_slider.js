import * as noUiSlider from "nouislider";
import * as p from "../../core/properties";
import { div, span, empty } from "../../core/dom";
import { repeat } from "../../core/util/array";
import { Control, ControlView } from "./control";
import { bk_slider_value, bk_slider_title } from "../../styles/widgets/sliders";
import { bk_input_group } from "../../styles/widgets/inputs";
import nouislider_css from "../../styles/widgets/nouislider.css";
import sliders_css from "../../styles/widgets/sliders.css";
class AbstractBaseSliderView extends ControlView {
    *controls() {
        yield this.slider_el;
    }
    get noUiSlider() {
        return this.slider_el.noUiSlider;
    }
    connect_signals() {
        super.connect_signals();
        const { direction, orientation, tooltips } = this.model.properties;
        this.on_change([direction, orientation, tooltips], () => this.render());
        const { start, end, value, step, title } = this.model.properties;
        this.on_change([start, end, value, step], () => {
            const { start, end, value, step } = this._calc_to();
            this.noUiSlider.updateOptions({
                range: { min: start, max: end },
                start: value,
                step,
            });
        });
        const { bar_color } = this.model.properties;
        this.on_change(bar_color, () => {
            this._set_bar_color();
        });
        const { show_value } = this.model.properties;
        this.on_change([value, title, show_value], () => this._update_title());
    }
    styles() {
        return [...super.styles(), nouislider_css, sliders_css];
    }
    _update_title() {
        empty(this.title_el);
        const hide_header = this.model.title == null || (this.model.title.length == 0 && !this.model.show_value);
        this.title_el.style.display = hide_header ? "none" : "";
        if (!hide_header) {
            if (this.model.title.length != 0)
                this.title_el.textContent = `${this.model.title}: `;
            if (this.model.show_value) {
                const { value } = this._calc_to();
                const pretty = value.map((v) => this.model.pretty(v)).join(" .. ");
                this.title_el.appendChild(span({ class: bk_slider_value }, pretty));
            }
        }
    }
    _set_bar_color() {
        if (!this.model.disabled) {
            const connect_el = this.slider_el.querySelector(".noUi-connect");
            connect_el.style.backgroundColor = this.model.bar_color;
        }
    }
    _keypress_handle(e, idx = 0) {
        const { start, value, end, step } = this._calc_to();
        const is_range = value.length == 2;
        let low = start;
        let high = end;
        if (is_range && idx == 0) {
            high = value[1];
        }
        else if (is_range && idx == 1) {
            low = value[0];
        }
        switch (e.which) {
            case 37: {
                value[idx] = Math.max(value[idx] - step, low);
                break;
            }
            case 39: {
                value[idx] = Math.min(value[idx] + step, high);
                break;
            }
            default:
                return;
        }
        if (is_range) {
            this.model.value = value;
        }
        else {
            this.model.value = value[0];
        }
        this.model.properties.value.change.emit();
        this.model.value_throttled = this.model.value;
        this.noUiSlider.set(value);
    }
    render() {
        super.render();
        const { start, end, value, step } = this._calc_to();
        let tooltips; // XXX
        if (this.model.tooltips) {
            const formatter = {
                to: (value) => this.model.pretty(value),
            };
            tooltips = repeat(formatter, value.length);
        }
        else
            tooltips = false;
        if (this.slider_el == null) {
            this.slider_el = div();
            noUiSlider.create(this.slider_el, {
                range: { min: start, max: end },
                start: value,
                step,
                behaviour: this.model.behaviour,
                connect: this.model.connected,
                tooltips,
                orientation: this.model.orientation,
                direction: this.model.direction,
            });
            this.noUiSlider.on('slide', (_, __, values) => this._slide(values));
            this.noUiSlider.on('change', (_, __, values) => this._change(values));
            this._set_keypress_handles();
            const toggleTooltip = (i, show) => {
                if (!tooltips)
                    return;
                const handle = this.slider_el.querySelectorAll(".noUi-handle")[i];
                const tooltip = handle.querySelector(".noUi-tooltip");
                tooltip.style.display = show ? 'block' : '';
            };
            this.noUiSlider.on('start', (_, i) => toggleTooltip(i, true));
            this.noUiSlider.on('end', (_, i) => toggleTooltip(i, false));
        }
        else {
            this.noUiSlider.updateOptions({
                range: { min: start, max: end },
                start: value,
                step,
            });
        }
        this._set_bar_color();
        if (this.model.disabled)
            this.slider_el.setAttribute('disabled', 'true');
        else
            this.slider_el.removeAttribute('disabled');
        this.title_el = div({ class: bk_slider_title });
        this._update_title();
        this.group_el = div({ class: bk_input_group }, this.title_el, this.slider_el);
        this.el.appendChild(this.group_el);
    }
    _slide(values) {
        this.model.value = this._calc_from(values);
    }
    _change(values) {
        this.model.value = this._calc_from(values);
        this.model.value_throttled = this.model.value;
    }
}
AbstractBaseSliderView.__name__ = "AbstractBaseSliderView";
export class AbstractSliderView extends AbstractBaseSliderView {
    _calc_to() {
        return {
            start: this.model.start,
            end: this.model.end,
            value: [this.model.value],
            step: this.model.step,
        };
    }
    _calc_from([value]) {
        if (Number.isInteger(this.model.start) && Number.isInteger(this.model.end) && Number.isInteger(this.model.step))
            return Math.round(value);
        else
            return value;
    }
    _set_keypress_handles() {
        // Add single cursor event
        const handle = this.slider_el.querySelector(".noUi-handle");
        handle.setAttribute('tabindex', '0');
        handle.addEventListener('keydown', (e) => this._keypress_handle(e));
    }
}
AbstractSliderView.__name__ = "AbstractSliderView";
export class AbstractRangeSliderView extends AbstractBaseSliderView {
    _calc_to() {
        return {
            start: this.model.start,
            end: this.model.end,
            value: this.model.value,
            step: this.model.step,
        };
    }
    _calc_from(values) {
        return values;
    }
    _set_keypress_handles() {
        const handle_lower = this.slider_el.querySelector(".noUi-handle-lower");
        const handle_upper = this.slider_el.querySelector(".noUi-handle-upper");
        handle_lower.setAttribute('tabindex', '0');
        handle_lower.addEventListener('keydown', (e) => this._keypress_handle(e, 0));
        handle_upper.setAttribute('tabindex', '1');
        handle_upper.addEventListener('keydown', (e) => this._keypress_handle(e, 1));
    }
}
AbstractRangeSliderView.__name__ = "AbstractRangeSliderView";
export class AbstractSlider extends Control {
    // TODO: __view_type__: AbstractSliderView
    constructor(attrs) {
        super(attrs);
        this.connected = false;
    }
    static init_AbstractSlider() {
        this.define({
            title: [p.String, ""],
            show_value: [p.Boolean, true],
            start: [p.Any],
            end: [p.Any],
            value: [p.Any],
            value_throttled: [p.Any],
            step: [p.Number, 1],
            format: [p.Any],
            direction: [p.Any, "ltr"],
            tooltips: [p.Boolean, true],
            bar_color: [p.Color, "#e6e6e6"],
        });
    }
    _formatter(value, _format) {
        return `${value}`;
    }
    pretty(value) {
        return this._formatter(value, this.format);
    }
}
AbstractSlider.__name__ = "AbstractSlider";
AbstractSlider.init_AbstractSlider();
//# sourceMappingURL=abstract_slider.js.map