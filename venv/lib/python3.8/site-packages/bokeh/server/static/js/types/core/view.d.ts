import type { HasProps } from "./has_props";
import { Property } from "./properties";
import { Signal0, Signal, Slot, ISignalable } from "./signaling";
export declare type ViewOf<T extends HasProps> = T["__view_type__"];
export declare namespace View {
    type Options = {
        model: HasProps;
        parent: View | null;
    };
}
export declare class View implements ISignalable {
    readonly removed: Signal0<this>;
    readonly model: HasProps;
    private _parent;
    protected _ready: Promise<void>;
    get ready(): Promise<void>;
    connect<Args, Sender extends object>(signal: Signal<Args, Sender>, slot: Slot<Args, Sender>): boolean;
    disconnect<Args, Sender extends object>(signal: Signal<Args, Sender>, slot: Slot<Args, Sender>): boolean;
    constructor(options: View.Options);
    initialize(): void;
    lazy_initialize(): Promise<void>;
    remove(): void;
    toString(): string;
    serializable_state(): {
        [key: string]: unknown;
    };
    get parent(): View | null;
    get is_root(): boolean;
    get root(): View;
    assert_root(): void;
    connect_signals(): void;
    disconnect_signals(): void;
    on_change(properties: Property<unknown> | Property<unknown>[], fn: () => void): void;
}
