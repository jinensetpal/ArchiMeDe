import * as p from "@bokehjs/core/properties";
import { ModelChangedEvent } from "@bokehjs/document";
import { View } from "@bokehjs/core/view";
import { Model } from "@bokehjs/model";
import { Message } from "@bokehjs/protocol/message";
import { Receiver } from "@bokehjs/protocol/receiver";
export class CommManagerView extends View {
    renderTo() {
    }
}
CommManagerView.__name__ = "CommManagerView";
export class CommManager extends Model {
    constructor(attrs) {
        super(attrs);
        this._document_listener = (event) => this._document_changed(event);
        this._receiver = new Receiver();
        this._event_buffer = [];
        this._blocked = false;
        this._timeout = Date.now();
        if ((window.PyViz == undefined) || (!window.PyViz.comm_manager))
            console.log("Could not find comm manager on window.PyViz, ensure the extension is loaded.");
        else {
            this.ns = window.PyViz;
            this.ns.comm_manager.register_target(this.plot_id, this.comm_id, (msg) => this.msg_handler(msg));
            this._client_comm = this.ns.comm_manager.get_client_comm(this.plot_id, this.client_comm_id, (msg) => this.on_ack(msg));
        }
    }
    _doc_attached() {
        super._doc_attached();
        if (this.document != null)
            this.document.on_change(this._document_listener);
    }
    _document_changed(event) {
        // Filter out events that were initiated by the ClientSession itself
        if (event.setter_id === this.id) // XXX: not all document events define this
            return;
        // Filter out changes to attributes that aren't server-visible
        if (event instanceof ModelChangedEvent && !(event.attr in event.model.serializable_attributes()))
            return;
        this._event_buffer.unshift(event);
        if ((!this._blocked || (Date.now() > this._timeout))) {
            setTimeout(() => this.process_events(), this.debounce);
            this._blocked = true;
            this._timeout = Date.now() + this.timeout;
        }
    }
    process_events() {
        // Iterates over event queue and sends events via Comm
        if ((this.document == null) || (this._client_comm == null))
            return;
        const message = Message.create('PATCH-DOC', {}, this.document.create_json_patch(this._event_buffer));
        this._client_comm.send(message);
        this._event_buffer = [];
    }
    on_ack(msg) {
        // Receives acknowledgement from Python, processing event
        // and unblocking Comm if event queue empty
        const metadata = msg.metadata;
        if (this._event_buffer.length) {
            this.process_events();
            this._blocked = true;
            this._timeout = Date.now() + this.timeout;
        }
        else
            this._blocked = false;
        this._event_buffer = [];
        if ((metadata.msg_type == "Ready") && metadata.content)
            console.log("Python callback returned following output:", metadata.content);
        else if (metadata.msg_type == "Error")
            console.log("Python failed with the following traceback:", metadata.traceback);
    }
    msg_handler(msg) {
        const metadata = msg.metadata;
        const buffers = msg.buffers;
        const content = msg.content.data;
        const plot_id = this.plot_id;
        if ((metadata.msg_type == "Ready")) {
            if (metadata.content)
                console.log("Python callback returned following output:", metadata.content);
            else if (metadata.msg_type == "Error")
                console.log("Python failed with the following traceback:", metadata.traceback);
        }
        else if (plot_id != null) {
            let plot = null;
            if ((plot_id in this.ns.plot_index) && (this.ns.plot_index[plot_id] != null))
                plot = this.ns.plot_index[plot_id];
            else if ((window.Bokeh !== undefined) && (plot_id in window.Bokeh.index))
                plot = window.Bokeh.index[plot_id];
            if (plot == null)
                return;
            if ((buffers != undefined) && (buffers.length > 0))
                this._receiver.consume(buffers[0].buffer);
            else
                this._receiver.consume(content);
            const comm_msg = this._receiver.message;
            if ((comm_msg != null) && (Object.keys(comm_msg.content).length > 0) && this.document != null)
                this.document.apply_json_patch(comm_msg.content, comm_msg.buffers, this.id);
        }
    }
    static init_CommManager() {
        this.prototype.default_view = CommManagerView;
        this.define({
            plot_id: [p.String, null],
            comm_id: [p.String, null],
            client_comm_id: [p.String, null],
            timeout: [p.Number, 5000],
            debounce: [p.Number, 50],
        });
    }
}
CommManager.__name__ = "CommManager";
CommManager.__module__ = "panel.models.comm_manager";
CommManager.init_CommManager();
//# sourceMappingURL=comm_manager.js.map