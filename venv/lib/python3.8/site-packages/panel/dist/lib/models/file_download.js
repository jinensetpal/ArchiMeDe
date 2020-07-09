import { InputWidget, InputWidgetView } from "@bokehjs/models/widgets/input_widget";
import { bk_btn, bk_btn_type } from "@bokehjs/styles/buttons";
import * as p from "@bokehjs/core/properties";
function dataURItoBlob(dataURI) {
    // convert base64 to raw binary data held in a string
    const byteString = atob(dataURI.split(',')[1]);
    // separate out the mime component
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to an ArrayBuffer
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    // write the ArrayBuffer to a blob, and you're done
    var bb = new Blob([ab], { type: mimeString });
    return bb;
}
export class FileDownloadView extends InputWidgetView {
    constructor() {
        super(...arguments);
        this._downloadable = false;
        this._embed = false;
        this._prev_href = "";
        this._prev_download = "";
    }
    initialize() {
        super.initialize();
        if (this.model.data && this.model.filename) {
            this._embed = true;
        }
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.button_type.change, () => this._update_button_style());
        this.connect(this.model.properties.filename.change, () => this._update_download());
        this.connect(this.model.properties._transfers.change, () => this._handle_click());
        this.connect(this.model.properties.label.change, () => this._update_label());
    }
    render() {
        super.render();
        this.group_el.style.display = "flex";
        this.group_el.style.alignItems = "stretch";
        // Create an anchor HTML element that is styled as a bokeh button.
        // When its 'href' and 'download' attributes are set, it's a downloadable link:
        // * A click triggers a download
        // * A right click allows to "Save as" the file
        // There are three main cases:
        // 1. embed=True: The widget is a download link
        // 2. auto=False: The widget is first a button and becomes a download link after the first click
        // 3. auto=True: The widget is a button, i.e right click to "Save as..." won't work
        this.anchor_el = document.createElement('a');
        this._update_button_style();
        this._update_label();
        // Changing the disabled property calls render() so it needs to be handled here.
        // This callback is inherited from ControlView in bokehjs.
        if (this.model.disabled) {
            this.anchor_el.setAttribute("disabled", "");
            this._downloadable = false;
        }
        else {
            this.anchor_el.removeAttribute("disabled");
            // auto=False + toggle Disabled ==> Needs to reset the link as it was.
            if (this._prev_download) {
                this.anchor_el.download = this._prev_download;
            }
            if (this._prev_href) {
                this.anchor_el.href = this._prev_href;
            }
            if (this.anchor_el.download && this.anchor_el.download) {
                this._downloadable = true;
            }
        }
        // If embedded the button is just a download link.
        // Otherwise clicks will be handled by the code itself, allowing for more interactivity.
        if (this._embed) {
            this._make_link_downloadable();
        }
        else {
            // Add a "click" listener, note that it's not going to
            // handle right clicks (they won't increment 'clicks')
            this._click_listener = this._increment_clicks.bind(this);
            this.anchor_el.addEventListener("click", this._click_listener);
        }
        this.group_el.appendChild(this.anchor_el);
    }
    _increment_clicks() {
        this.model.clicks = this.model.clicks + 1;
    }
    _handle_click() {
        // When auto=False the button becomes a link which no longer
        // requires being updated.
        if (!this.model.auto && this._downloadable) {
            return;
        }
        this._make_link_downloadable();
        if (!this._embed && this.model.auto) {
            // Temporarily removing the event listener to emulate a click
            // event on the anchor link which will trigger a download.
            this.anchor_el.removeEventListener("click", this._click_listener);
            this.anchor_el.click();
            // In this case #3 the widget is not a link so these attributes are removed.
            this.anchor_el.removeAttribute("href");
            this.anchor_el.removeAttribute("download");
            this.anchor_el.addEventListener("click", this._click_listener);
        }
        // Store the current state for handling changes of the disabled property.
        this._prev_href = this.anchor_el.getAttribute("href");
        this._prev_download = this.anchor_el.getAttribute("download");
    }
    _make_link_downloadable() {
        this._update_href();
        this._update_download();
        if (this.anchor_el.download && this.anchor_el.href) {
            this._downloadable = true;
        }
    }
    _update_href() {
        if (this.model.data) {
            const blob = dataURItoBlob(this.model.data);
            this.anchor_el.href = URL.createObjectURL(blob);
        }
    }
    _update_download() {
        if (this.model.filename) {
            this.anchor_el.download = this.model.filename;
        }
    }
    _update_label() {
        this.anchor_el.textContent = this.model.label;
    }
    _update_button_style() {
        if (!this.anchor_el.hasAttribute("class")) { // When the widget is rendered.
            this.anchor_el.classList.add(bk_btn);
            this.anchor_el.classList.add(bk_btn_type(this.model.button_type));
        }
        else { // When the button type is changed.
            const prev_button_type = this.anchor_el.classList.item(1);
            if (prev_button_type) {
                this.anchor_el.classList.replace(prev_button_type, bk_btn_type(this.model.button_type));
            }
        }
    }
}
FileDownloadView.__name__ = "FileDownloadView";
export class FileDownload extends InputWidget {
    constructor(attrs) {
        super(attrs);
    }
    static init_FileDownload() {
        this.prototype.default_view = FileDownloadView;
        this.define({
            auto: [p.Boolean, false],
            clicks: [p.Number, 0],
            data: [p.String, null],
            label: [p.String, "Download"],
            filename: [p.String, null],
            button_type: [p.ButtonType, "default"],
            _transfers: [p.Number, 0],
        });
        this.override({
            title: "",
        });
    }
}
FileDownload.__name__ = "FileDownload";
FileDownload.__module__ = "panel.models.widgets";
FileDownload.init_FileDownload();
//# sourceMappingURL=file_download.js.map