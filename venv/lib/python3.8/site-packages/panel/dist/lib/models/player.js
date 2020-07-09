import * as p from "@bokehjs/core/properties";
import { div } from "@bokehjs/core/dom";
import { Widget, WidgetView } from "@bokehjs/models/widgets/widget";
function press(btn_list) {
    btn_list.forEach((btn) => btn.style.borderStyle = 'inset');
}
function unpress(btn_list) {
    btn_list.forEach((btn) => btn.style.borderStyle = 'outset');
}
export class PlayerView extends WidgetView {
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.change, () => this.render());
        this.connect(this.model.properties.value.change, () => this.render());
        this.connect(this.model.properties.loop_policy.change, () => this.set_loop_state(this.model.loop_policy));
        this.connect(this.model.properties.show_loop_controls.change, () => {
            if (this.model.show_loop_controls && this.loop_state.parentNode != this.groupEl)
                this.groupEl.appendChild(this.loop_state);
            else if (!this.model.show_loop_controls && this.loop_state.parentNode == this.groupEl)
                this.el.removeChild(this.loop_state);
        });
    }
    get_height() {
        return 250;
    }
    render() {
        if (this.sliderEl == null) {
            super.render();
        }
        else {
            this.sliderEl.min = String(this.model.start);
            this.sliderEl.max = String(this.model.end);
            this.sliderEl.value = String(this.model.value);
            return;
        }
        // Layout to group the elements
        this.groupEl = div();
        this.groupEl.style.display = "flex";
        this.groupEl.style.flexDirection = "column";
        this.groupEl.style.alignItems = "center";
        // Slider
        this.sliderEl = document.createElement('input');
        this.sliderEl.style.width = "100%";
        this.sliderEl.setAttribute("type", "range");
        this.sliderEl.value = String(this.model.value);
        this.sliderEl.min = String(this.model.start);
        this.sliderEl.max = String(this.model.end);
        this.sliderEl.onchange = (ev) => this.set_frame(parseInt(ev.target.value));
        // Buttons
        const button_div = div();
        button_div.style.cssText = "margin: 0 auto; display: flex; padding: 5px; align-items: stretch; width: 100%;";
        const button_style_small = "text-align: center; min-width: 20px; flex-grow: 1; margin: 2px";
        const button_style = "text-align: center; min-width: 40px; flex-grow: 2; margin: 2px";
        const slower = document.createElement('button');
        slower.style.cssText = button_style_small;
        slower.appendChild(document.createTextNode('–'));
        slower.onclick = () => this.slower();
        button_div.appendChild(slower);
        const first = document.createElement('button');
        first.style.cssText = button_style;
        first.appendChild(document.createTextNode('\u275a\u25c0\u25c0'));
        first.onclick = () => this.first_frame();
        button_div.appendChild(first);
        const previous = document.createElement('button');
        previous.style.cssText = button_style;
        previous.appendChild(document.createTextNode('\u275a\u25c0'));
        previous.onclick = () => this.previous_frame();
        button_div.appendChild(previous);
        const reverse = document.createElement('button');
        reverse.style.cssText = button_style;
        reverse.appendChild(document.createTextNode('\u25c0'));
        reverse.onclick = () => this.reverse_animation();
        button_div.appendChild(reverse);
        const pause = document.createElement('button');
        pause.style.cssText = button_style;
        pause.appendChild(document.createTextNode('\u275a\u275a'));
        pause.onclick = () => this.pause_animation();
        button_div.appendChild(pause);
        const play = document.createElement('button');
        play.style.cssText = button_style;
        play.appendChild(document.createTextNode('\u25b6'));
        play.onclick = () => this.play_animation();
        button_div.appendChild(play);
        const next = document.createElement('button');
        next.style.cssText = button_style;
        next.appendChild(document.createTextNode('\u25b6\u275a'));
        next.onclick = () => this.next_frame();
        button_div.appendChild(next);
        const last = document.createElement('button');
        last.style.cssText = button_style;
        last.appendChild(document.createTextNode('\u25b6\u25b6\u275a'));
        last.onclick = () => this.last_frame();
        button_div.appendChild(last);
        const faster = document.createElement('button');
        faster.style.cssText = button_style_small;
        faster.appendChild(document.createTextNode('+'));
        faster.onclick = () => this.faster();
        button_div.appendChild(faster);
        // toggle
        this._toggle_reverse = () => {
            unpress([pause, play]);
            press([reverse]);
        };
        this._toogle_pause = () => {
            unpress([reverse, play]);
            press([pause]);
        };
        this._toggle_play = () => {
            unpress([reverse, pause]);
            press([play]);
        };
        // Loop control
        this.loop_state = document.createElement('form');
        this.loop_state.style.cssText = "margin: 0 auto; display: table";
        const once = document.createElement('input');
        once.type = "radio";
        once.value = "once";
        once.name = "state";
        const once_label = document.createElement('label');
        once_label.innerHTML = "Once";
        once_label.style.cssText = "padding: 0 10px 0 5px; user-select:none;";
        const loop = document.createElement('input');
        loop.setAttribute("type", "radio");
        loop.setAttribute("value", "loop");
        loop.setAttribute("name", "state");
        const loop_label = document.createElement('label');
        loop_label.innerHTML = "Loop";
        loop_label.style.cssText = "padding: 0 10px 0 5px; user-select:none;";
        const reflect = document.createElement('input');
        reflect.setAttribute("type", "radio");
        reflect.setAttribute("value", "reflect");
        reflect.setAttribute("name", "state");
        const reflect_label = document.createElement('label');
        reflect_label.innerHTML = "Reflect";
        reflect_label.style.cssText = "padding: 0 10px 0 5px; user-select:none;";
        if (this.model.loop_policy == "once")
            once.checked = true;
        else if (this.model.loop_policy == "loop")
            loop.checked = true;
        else
            reflect.checked = true;
        // Compose everything
        this.loop_state.appendChild(once);
        this.loop_state.appendChild(once_label);
        this.loop_state.appendChild(loop);
        this.loop_state.appendChild(loop_label);
        this.loop_state.appendChild(reflect);
        this.loop_state.appendChild(reflect_label);
        this.groupEl.appendChild(this.sliderEl);
        this.groupEl.appendChild(button_div);
        if (this.model.show_loop_controls)
            this.groupEl.appendChild(this.loop_state);
        this.el.appendChild(this.groupEl);
    }
    set_frame(frame) {
        if (this.model.value != frame)
            this.model.value = frame;
        if (this.sliderEl.value != String(frame))
            this.sliderEl.value = String(frame);
    }
    get_loop_state() {
        var button_group = this.loop_state.state;
        for (var i = 0; i < button_group.length; i++) {
            var button = button_group[i];
            if (button.checked)
                return button.value;
        }
        return "once";
    }
    set_loop_state(state) {
        var button_group = this.loop_state.state;
        for (var i = 0; i < button_group.length; i++) {
            var button = button_group[i];
            if (button.value == state)
                button.checked = true;
        }
    }
    next_frame() {
        this.set_frame(Math.min(this.model.end, this.model.value + this.model.step));
    }
    previous_frame() {
        this.set_frame(Math.max(this.model.start, this.model.value - this.model.step));
    }
    first_frame() {
        this.set_frame(this.model.start);
    }
    last_frame() {
        this.set_frame(this.model.end);
    }
    slower() {
        this.model.interval = Math.round(this.model.interval / 0.7);
        if (this.model.direction > 0)
            this.play_animation();
        else if (this.model.direction < 0)
            this.reverse_animation();
    }
    faster() {
        this.model.interval = Math.round(this.model.interval * 0.7);
        if (this.model.direction > 0)
            this.play_animation();
        else if (this.model.direction < 0)
            this.reverse_animation();
    }
    anim_step_forward() {
        if (this.model.value < this.model.end) {
            this.next_frame();
        }
        else {
            var loop_state = this.get_loop_state();
            if (loop_state == "loop") {
                this.first_frame();
            }
            else if (loop_state == "reflect") {
                this.last_frame();
                this.reverse_animation();
            }
            else {
                this.pause_animation();
                this.last_frame();
            }
        }
    }
    anim_step_reverse() {
        if (this.model.value > this.model.start) {
            this.previous_frame();
        }
        else {
            var loop_state = this.get_loop_state();
            if (loop_state == "loop") {
                this.last_frame();
            }
            else if (loop_state == "reflect") {
                this.first_frame();
                this.play_animation();
            }
            else {
                this.pause_animation();
                this.first_frame();
            }
        }
    }
    pause_animation() {
        this._toogle_pause();
        this.model.direction = 0;
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    play_animation() {
        this.pause_animation();
        this._toggle_play();
        this.model.direction = 1;
        if (!this.timer)
            this.timer = setInterval(() => this.anim_step_forward(), this.model.interval);
    }
    reverse_animation() {
        this.pause_animation();
        this._toggle_reverse();
        this.model.direction = -1;
        if (!this.timer)
            this.timer = setInterval(() => this.anim_step_reverse(), this.model.interval);
    }
}
PlayerView.__name__ = "PlayerView";
export class Player extends Widget {
    constructor(attrs) {
        super(attrs);
    }
    static init_Player() {
        this.prototype.default_view = PlayerView;
        this.define({
            direction: [p.Number, 0],
            interval: [p.Number, 500],
            start: [p.Number,],
            end: [p.Number,],
            step: [p.Number, 1],
            loop_policy: [p.Any, "once"],
            value: [p.Any, 0],
            show_loop_controls: [p.Boolean, true],
        });
        this.override({ width: 400 });
    }
}
Player.__name__ = "Player";
Player.__module__ = "panel.models.widgets";
Player.init_Player();
//# sourceMappingURL=player.js.map