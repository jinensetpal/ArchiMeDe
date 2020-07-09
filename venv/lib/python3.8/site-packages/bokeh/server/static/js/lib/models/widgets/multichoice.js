import Choices from "choices.js";
import { select, option } from "../../core/dom";
import { isString } from "../../core/util/types";
import * as p from "../../core/properties";
import { bk_input } from "../../styles/widgets/inputs";
import choices_css from "../../styles/widgets/choices.css";
import { InputWidget, InputWidgetView } from "./input_widget";
export class MultiChoiceView extends InputWidgetView {
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.value.change, () => this.render_selection());
        this.connect(this.model.properties.disabled.change, () => this.set_disabled());
        this.connect(this.model.properties.max_items.change, () => this.render());
        this.connect(this.model.properties.option_limit.change, () => this.render());
        this.connect(this.model.properties.delete_button.change, () => this.render());
        this.connect(this.model.properties.placeholder.change, () => this.render());
        this.connect(this.model.properties.options.change, () => this.render());
        this.connect(this.model.properties.name.change, () => this.render());
        this.connect(this.model.properties.title.change, () => this.render());
    }
    styles() {
        return [...super.styles(), choices_css];
    }
    render() {
        super.render();
        const options = this.model.options.map((opt) => {
            let value, _label;
            if (isString(opt))
                value = _label = opt;
            else
                [value, _label] = opt;
            return option({ value }, _label);
        });
        this.select_el = select({
            multiple: true,
            class: bk_input,
            name: this.model.name,
            disabled: this.model.disabled,
        }, options);
        this.group_el.appendChild(this.select_el);
        this.render_selection();
        let item = "choices__item";
        let button = "choices__button";
        if (this.model.solid) {
            item = item + " solid";
            button = button + " solid";
        }
        else {
            item = item + " light";
            button = button + " light";
        }
        const opts = {
            removeItemButton: this.model.delete_button,
            classNames: { item, button },
        };
        if (this.model.placeholder !== null)
            opts.placeholderValue = this.model.placeholder;
        if (this.model.max_items !== null)
            opts.maxItemCount = this.model.max_items;
        if (this.model.option_limit !== null)
            opts.renderChoiceLimit = this.model.option_limit;
        this.choice_el = new Choices(this.select_el, opts);
        this.select_el.addEventListener("change", () => this.change_input());
    }
    render_selection() {
        const selected = new Set(this.model.value);
        for (const el of Array.from(this.el.querySelectorAll('option')))
            el.selected = selected.has(el.value);
    }
    set_disabled() {
        if (this.model.disabled)
            this.choice_el.disable();
        else
            this.choice_el.enable();
    }
    change_input() {
        const is_focused = this.el.querySelector('select:focus') != null;
        const values = [];
        for (const el of Array.from(this.el.querySelectorAll('option'))) {
            if (el.selected)
                values.push(el.value);
        }
        this.model.value = values;
        super.change_input();
        // Restore focus back to the <select> afterwards,
        // so that even if python on_change callback is invoked,
        // focus remains on <select> and one can seamlessly scroll
        // up/down.
        if (is_focused)
            this.select_el.focus();
    }
}
MultiChoiceView.__name__ = "MultiChoiceView";
export class MultiChoice extends InputWidget {
    constructor(attrs) {
        super(attrs);
    }
    static init_MultiChoice() {
        this.prototype.default_view = MultiChoiceView;
        this.define({
            value: [p.Array, []],
            options: [p.Array, []],
            max_items: [p.Number, null],
            delete_button: [p.Boolean, true],
            placeholder: [p.String, null],
            option_limit: [p.Number, null],
            solid: [p.Boolean, true],
        });
    }
}
MultiChoice.__name__ = "MultiChoice";
MultiChoice.init_MultiChoice();
//# sourceMappingURL=multichoice.js.map