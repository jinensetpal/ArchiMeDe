import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "./layout";
export class VideoStreamView extends PanelHTMLBoxView {
    constructor() {
        super(...arguments);
        this.constraints = {
            'audio': false,
            'video': true
        };
    }
    initialize() {
        super.initialize();
        if (this.model.timeout !== null)
            this.set_timeout();
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.timeout.change, () => this.set_timeout());
        this.connect(this.model.properties.snapshot.change, () => this.snapshot());
        this.connect(this.model.properties.paused.change, () => this.pause());
    }
    pause() {
        if (this.model.paused) {
            if (this.timer != null) {
                clearInterval(this.timer);
                this.timer = null;
            }
            this.videoEl.pause();
        }
        this.set_timeout();
    }
    set_timeout() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (this.model.timeout > 0)
            this.timer = setInterval(() => this.snapshot(), this.model.timeout);
    }
    snapshot() {
        this.canvasEl.width = this.videoEl.videoWidth;
        this.canvasEl.height = this.videoEl.videoHeight;
        const context = this.canvasEl.getContext('2d');
        if (context)
            context.drawImage(this.videoEl, 0, 0, this.canvasEl.width, this.canvasEl.height);
        this.model.value = this.canvasEl.toDataURL("image/" + this.model.format, 0.95);
    }
    remove() {
        super.remove();
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    render() {
        super.render();
        if (this.videoEl)
            return;
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
        this.canvasEl = document.createElement('canvas');
        this.el.appendChild(this.videoEl);
        if (navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(this.constraints)
                .then(stream => {
                this.videoEl.srcObject = stream;
                if (!this.model.paused) {
                    this.videoEl.play();
                }
            })
                .catch(console.error);
        }
    }
}
VideoStreamView.__name__ = "VideoStreamView";
export class VideoStream extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    static init_VideoStream() {
        this.prototype.default_view = VideoStreamView;
        this.define({
            format: [p.String, 'png'],
            paused: [p.Boolean, false],
            snapshot: [p.Boolean, false],
            timeout: [p.Number, 0],
            value: [p.Any,]
        });
        this.override({
            height: 240,
            width: 320
        });
    }
}
VideoStream.__name__ = "VideoStream";
VideoStream.__module__ = "panel.models.widgets";
VideoStream.init_VideoStream();
//# sourceMappingURL=videostream.js.map