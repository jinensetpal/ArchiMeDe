import * as p from "@bokehjs/core/properties";
import { Markup } from "@bokehjs/models/widgets/markup";
import { PanelMarkupView } from "./layout";
export declare function htmlDecode(input: string): string | null;
export declare class HTMLView extends PanelMarkupView {
    model: HTML;
    render(): void;
}
export declare namespace HTML {
    type Attrs = p.AttrsOf<Props>;
    type Props = Markup.Props;
}
export interface HTML extends HTML.Attrs {
}
export declare class HTML extends Markup {
    properties: HTML.Props;
    constructor(attrs?: Partial<HTML.Attrs>);
    static __module__: string;
    static init_HTML(): void;
}
