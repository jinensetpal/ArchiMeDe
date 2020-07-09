import * as p from "@bokehjs/core/properties";
import { div } from "@bokehjs/core/dom";
import { clone } from "@bokehjs/core/util/object";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView, set_size } from "../layout";
import { vtkns, majorAxis } from "./vtk_utils";
export class AbstractVTKView extends PanelHTMLBoxView {
    constructor() {
        super(...arguments);
        this._setting_camera = false;
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.properties.data.change, () => {
            this.invalidate_render();
        });
        this.connect(this.model.properties.orientation_widget.change, () => {
            this._orientation_widget_visibility(this.model.orientation_widget);
        });
        this.connect(this.model.properties.camera.change, () => this._set_camera_state());
    }
    _orientation_widget_visibility(visibility) {
        this._orientationWidget.setEnabled(visibility);
        if (visibility)
            this._widgetManager.enablePicking();
        else
            this._widgetManager.disablePicking();
        this._orientationWidget.updateMarkerOrientation();
        this._vtk_renwin.getRenderWindow().render();
    }
    _create_orientation_widget() {
        const axes = vtkns.AxesActor.newInstance();
        // add orientation widget
        const orientationWidget = vtkns.OrientationMarkerWidget.newInstance({
            actor: axes,
            interactor: this._vtk_renwin.getInteractor(),
        });
        orientationWidget.setEnabled(true);
        orientationWidget.setViewportCorner(vtkns.OrientationMarkerWidget.Corners.BOTTOM_RIGHT);
        orientationWidget.setViewportSize(0.15);
        orientationWidget.setMinPixelSize(100);
        orientationWidget.setMaxPixelSize(300);
        this._orientationWidget = orientationWidget;
        const widgetManager = vtkns.WidgetManager.newInstance();
        widgetManager.setRenderer(orientationWidget.getRenderer());
        const widget = vtkns.InteractiveOrientationWidget.newInstance();
        widget.placeWidget(axes.getBounds());
        widget.setBounds(axes.getBounds());
        widget.setPlaceFactor(1);
        const vw = widgetManager.addWidget(widget);
        this._widgetManager = widgetManager;
        // Manage user interaction
        vw.onOrientationChange(({ direction }) => {
            const camera = this._vtk_renwin.getRenderer().getActiveCamera();
            const focalPoint = camera.getFocalPoint();
            const position = camera.getPosition();
            const viewUp = camera.getViewUp();
            const distance = Math.sqrt(Math.pow(position[0] - focalPoint[0], 2) +
                Math.pow(position[1] - focalPoint[1], 2) +
                Math.pow(position[2] - focalPoint[2], 2));
            camera.setPosition(focalPoint[0] + direction[0] * distance, focalPoint[1] + direction[1] * distance, focalPoint[2] + direction[2] * distance);
            if (direction[0])
                camera.setViewUp(majorAxis(viewUp, 1, 2));
            if (direction[1])
                camera.setViewUp(majorAxis(viewUp, 0, 2));
            if (direction[2])
                camera.setViewUp(majorAxis(viewUp, 0, 1));
            this._orientationWidget.updateMarkerOrientation();
            this._vtk_renwin.getRenderer().resetCameraClippingRange();
            this._vtk_renwin.getRenderWindow().render();
        });
        this._orientation_widget_visibility(this.model.orientation_widget);
    }
    _get_camera_state() {
        if (!this._setting_camera) {
            this._setting_camera = true;
            const state = clone(this._vtk_renwin.getRenderer().getActiveCamera().get());
            delete state.classHierarchy;
            delete state.vtkObject;
            delete state.vtkCamera;
            delete state.viewPlaneNormal;
            this.model.camera = state;
            this._setting_camera = false;
        }
    }
    _set_camera_state() {
        if (!this._setting_camera) {
            this._setting_camera = true;
            try {
                if (this.model.camera)
                    this._vtk_renwin.getRenderer().getActiveCamera().set(this.model.camera);
            }
            finally {
                this._setting_camera = false;
            }
            this._orientationWidget.updateMarkerOrientation();
            this._vtk_renwin.getRenderer().resetCameraClippingRange();
            this._vtk_renwin.getRenderWindow().render();
        }
    }
    render() {
        super.render();
        this._orientationWidget = null;
        this._vtk_container = div();
        set_size(this._vtk_container, this.model);
        this.el.appendChild(this._vtk_container);
        this._vtk_renwin = vtkns.FullScreenRenderWindow.newInstance({
            rootContainer: this.el,
            container: this._vtk_container
        });
        this._remove_default_key_binding();
        this._create_orientation_widget();
        this._vtk_renwin.getRenderer().getActiveCamera().onModified(() => this._get_camera_state());
        this._set_camera_state();
        this.model.renderer_el = this._vtk_renwin;
    }
    after_layout() {
        super.after_layout();
        this._vtk_renwin.resize();
    }
    _remove_default_key_binding() {
        const interactor = this._vtk_renwin.getInteractor();
        document.querySelector('body').removeEventListener('keypress', interactor.handleKeyPress);
        document.querySelector('body').removeEventListener('keydown', interactor.handleKeyDown);
        document.querySelector('body').removeEventListener('keyup', interactor.handleKeyUp);
    }
}
AbstractVTKView.__name__ = "AbstractVTKView";
export class AbstractVTKPlot extends HTMLBox {
    constructor(attrs) {
        super(attrs);
    }
    getActors() {
        return this.renderer_el.getRenderer().getActors();
    }
    static init_AbstractVTKPlot() {
        this.define({
            orientation_widget: [p.Boolean, false],
            camera: [p.Instance],
        });
        this.override({
            height: 300,
            width: 300
        });
    }
}
AbstractVTKPlot.__name__ = "AbstractVTKPlot";
AbstractVTKPlot.__module__ = "panel.models.vtk";
AbstractVTKPlot.init_AbstractVTKPlot();
//# sourceMappingURL=vtk_layout.js.map