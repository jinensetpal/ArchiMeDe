import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export class AudioView extends PanelHTMLBoxView {
    initialize() {
        super.initialize();
        this._blocked = false;
        this._setting = false;
        this._time = Date.now();
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.loop.change, () => this.set_loop());
        this.connect(this.model.properties.paused.change, () => this.set_paused());
        this.connect(this.model.properties.time.change, () => this.set_time());
        this.connect(this.model.properties.value.change, () => this.set_value());
        this.connect(this.model.properties.volume.change, () => this.set_volume());
    }
    render() {
        super.render();
        this.audioEl = document.createElement('audio');
        this.audioEl.controls = true;
        this.audioEl.src = this.model.value;
        this.audioEl.currentTime = this.model.time;
        this.audioEl.loop = this.model.loop;
        if (this.model.volume != null)
            this.audioEl.volume = this.model.volume / 100;
        else
            this.model.volume = this.audioEl.volume * 100;
        this.audioEl.onpause = () => this.model.paused = true;
        this.audioEl.onplay = () => this.model.paused = false;
        this.audioEl.ontimeupdate = () => this.update_time(this);
        this.audioEl.onvolumechange = () => this.update_volume(this);
        this.el.appendChild(this.audioEl);
        if (!this.model.paused)
            this.audioEl.play();
    }
    update_time(view) {
        if (view._setting) {
            view._setting = false;
            return;
        }
        if ((Date.now() - view._time) < view.model.throttle)
            return;
        view._blocked = true;
        view.model.time = view.audioEl.currentTime;
        view._time = Date.now();
    }
    update_volume(view) {
        if (view._setting) {
            view._setting = false;
            return;
        }
        view._blocked = true;
        view.model.volume = view.audioEl.volume * 100;
    }
    set_loop() {
        this.audioEl.loop = this.model.loop;
    }
    set_paused() {
        if (!this.audioEl.paused && this.model.paused)
            this.audioEl.pause();
        if (this.audioEl.paused && !this.model.paused)
            this.audioEl.play();
    }
    set_volume() {
        if (this._blocked) {
            this._blocked = false;
            return;
        }
        this._setting = true;
        if (this.model.volume != null) {
            this.audioEl.volume = this.model.volume / 100;
        }
    }
    set_time() {
        if (this._blocked) {
            this._blocked = false;
            return;
        }
        this._setting = true;
        this.audioEl.currentTime = this.model.time;
    }
    set_value() {
        this.audioEl.src = this.model.value;
    }
}
AudioView.__name__ = "AudioView";
export class Audio extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_Audio() {
        this.prototype.default_view = AudioView;
        this.define({
            loop: [p.Boolean, false],
            paused: [p.Boolean, true],
            time: [p.Number, 0],
            throttle: [p.Number, 250],
            value: [p.Any, ''],
            volume: [p.Number, null],
        });
    }
}
Audio.__name__ = "Audio";
Audio.__module__ = "panel.models.widgets";
Audio.init_Audio();
//# sourceMappingURL=audio.js.map