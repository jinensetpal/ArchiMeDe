import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export class VideoView extends PanelHTMLBoxView {
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
        this.videoEl = document.createElement('video');
        if (!this.model.sizing_mode || this.model.sizing_mode === 'fixed') {
            if (this.model.height)
                this.videoEl.height = this.model.height;
            if (this.model.width)
                this.videoEl.width = this.model.width;
        }
        this.videoEl.style.objectFit = 'fill';
        this.videoEl.style.minWidth = '100%';
        this.videoEl.style.minHeight = '100%';
        this.videoEl.controls = true;
        this.videoEl.src = this.model.value;
        this.videoEl.currentTime = this.model.time;
        this.videoEl.loop = this.model.loop;
        if (this.model.volume != null)
            this.videoEl.volume = this.model.volume / 100;
        else
            this.model.volume = this.videoEl.volume * 100;
        this.videoEl.onpause = () => this.model.paused = true;
        this.videoEl.onplay = () => this.model.paused = false;
        this.videoEl.ontimeupdate = () => this.update_time(this);
        this.videoEl.onvolumechange = () => this.update_volume(this);
        this.el.appendChild(this.videoEl);
        if (!this.model.paused)
            this.videoEl.play();
    }
    update_time(view) {
        if (view._setting) {
            view._setting = false;
            return;
        }
        if ((Date.now() - view._time) < view.model.throttle)
            return;
        view._blocked = true;
        view.model.time = view.videoEl.currentTime;
        view._time = Date.now();
    }
    update_volume(view) {
        if (view._setting) {
            view._setting = false;
            return;
        }
        view._blocked = true;
        view.model.volume = view.videoEl.volume * 100;
    }
    set_loop() {
        this.videoEl.loop = this.model.loop;
    }
    set_paused() {
        if (!this.videoEl.paused && this.model.paused)
            this.videoEl.pause();
        if (this.videoEl.paused && !this.model.paused)
            this.videoEl.play();
    }
    set_volume() {
        if (this._blocked) {
            this._blocked = false;
            return;
        }
        this._setting = true;
        if (this.model.volume != null)
            this.videoEl.volume = this.model.volume / 100;
    }
    set_time() {
        if (this._blocked) {
            this._blocked = false;
            return;
        }
        this._setting = true;
        this.videoEl.currentTime = this.model.time;
    }
    set_value() {
        this.videoEl.src = this.model.value;
    }
}
VideoView.__name__ = "VideoView";
export class Video extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_Video() {
        this.prototype.default_view = VideoView;
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
Video.__name__ = "Video";
Video.__module__ = "panel.models.widgets";
Video.init_Video();
//# sourceMappingURL=video.js.map