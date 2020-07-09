import * as p from "@bokehjs/core/properties";
import { HTMLBox } from "@bokehjs/models/layouts/html_box";
import { PanelHTMLBoxView } from "../layout";
import { VolumeType } from "./vtk_utils";
export declare abstract class AbstractVTKView extends PanelHTMLBoxView {
    model: AbstractVTKPlot;
    protected _vtk_container: HTMLDivElement;
    protected _vtk_renwin: any;
    protected _orientationWidget: any;
    protected _widgetManager: any;
    protected _setting_camera: boolean;
    connect_signals(): void;
    _orientation_widget_visibility(visibility: boolean): void;
    _create_orientation_widget(): void;
    _get_camera_state(): void;
    _set_camera_state(): void;
    render(): void;
    after_layout(): void;
    _remove_default_key_binding(): void;
}
export declare namespace AbstractVTKPlot {
    type Attrs = p.AttrsOf<Props>;
    type Props = HTMLBox.Props & {
        data: p.Property<string | VolumeType>;
        camera: p.Property<any>;
        orientation_widget: p.Property<boolean>;
    };
}
export interface AbstractVTKPlot extends AbstractVTKPlot.Attrs {
}
export declare abstract class AbstractVTKPlot extends HTMLBox {
    properties: AbstractVTKPlot.Props;
    renderer_el: any;
    static __module__: string;
    constructor(attrs?: Partial<AbstractVTKPlot.Attrs>);
    getActors(): any[];
    static init_AbstractVTKPlot(): void;
}
