import { Signal0 } from "./signaling";
import type { HasProps } from "./has_props";
import * as enums from "./enums";
import { Arrayable } from "./types";
import * as types from "./types";
import { Factor } from "../models/ranges/factor_range";
import { ColumnarDataSource } from "../models/sources/columnar_data_source";
import { Scalar, Vector, Dimensional } from "./vectorization";
export declare function isSpec(obj: any): boolean;
export declare type AttrsOf<P> = {
    [K in keyof P]: P[K] extends Property<infer T> ? T : never;
};
export declare type DefineOf<P> = {
    [K in keyof P]: P[K] extends Property<infer T> ? [PropertyConstructor<T>, (T | (() => T))?, PropertyOptions?] : never;
};
export declare type PropertyOptions = {
    internal?: boolean;
    optional?: boolean;
};
export interface PropertyConstructor<T> {
    new (obj: HasProps, attr: string, default_value?: (obj: HasProps) => T, initial_value?: T, options?: PropertyOptions): Property<T>;
    readonly prototype: Property<T>;
}
export declare abstract class Property<T = unknown> {
    readonly obj: HasProps;
    readonly attr: string;
    readonly default_value?: ((obj: HasProps) => T) | undefined;
    __value__: T;
    get syncable(): boolean;
    spec: {
        readonly value?: any;
        readonly field?: string;
        readonly expr?: any;
        readonly transform?: any;
        units?: any;
    };
    get_value(): T;
    set_value(val: T): void;
    _default_override(): T | undefined;
    private _dirty;
    get dirty(): boolean;
    readonly change: Signal0<HasProps>;
    readonly internal: boolean;
    readonly optional: boolean;
    constructor(obj: HasProps, attr: string, default_value?: ((obj: HasProps) => T) | undefined, initial_value?: T, options?: PropertyOptions);
    protected _update(attr_value: T): void;
    toString(): string;
    normalize(values: any): any;
    validate(value: any): void;
    valid(_value: unknown): boolean;
    value(do_spec_transform?: boolean): any;
}
export declare class Any extends Property<any> {
}
export declare class Array extends Property<any[]> {
    valid(value: unknown): boolean;
}
export declare class Boolean extends Property<boolean> {
    valid(value: unknown): boolean;
}
export declare class Color extends Property<types.Color> {
    valid(value: unknown): boolean;
}
export declare class Instance extends Property<any> {
}
export declare class Number extends Property<number> {
    valid(value: unknown): boolean;
}
export declare class Int extends Number {
    valid(value: unknown): boolean;
}
export declare class Angle extends Number {
}
export declare class Percent extends Number {
    valid(value: unknown): boolean;
}
export declare class String extends Property<string> {
    valid(value: unknown): boolean;
}
export declare class NullString extends Property<string | null> {
    valid(value: unknown): boolean;
}
export declare class FontSize extends String {
}
export declare class Font extends String {
    _default_override(): string | undefined;
}
export declare abstract class EnumProperty<T extends string> extends Property<T> {
    readonly enum_values: T[];
    valid(value: unknown): boolean;
}
export declare function Enum<T extends string>(values: T[]): PropertyConstructor<T>;
export declare class Direction extends EnumProperty<enums.Direction> {
    get enum_values(): enums.Direction[];
    normalize(values: any): any;
}
export declare const Anchor: PropertyConstructor<enums.Anchor>;
export declare const AngleUnits: PropertyConstructor<enums.AngleUnits>;
export declare const BoxOrigin: PropertyConstructor<enums.BoxOrigin>;
export declare const ButtonType: PropertyConstructor<enums.ButtonType>;
export declare const CalendarPosition: PropertyConstructor<enums.CalendarPosition>;
export declare const Dimension: PropertyConstructor<enums.Dimension>;
export declare const Dimensions: PropertyConstructor<enums.Dimensions>;
export declare const Distribution: PropertyConstructor<enums.Distribution>;
export declare const FontStyle: PropertyConstructor<enums.FontStyle>;
export declare const HatchPatternType: PropertyConstructor<enums.HatchPatternType>;
export declare const HTTPMethod: PropertyConstructor<enums.HTTPMethod>;
export declare const HexTileOrientation: PropertyConstructor<enums.HexTileOrientation>;
export declare const HoverMode: PropertyConstructor<enums.HoverMode>;
export declare const LatLon: PropertyConstructor<enums.LatLon>;
export declare const LegendClickPolicy: PropertyConstructor<enums.LegendClickPolicy>;
export declare const LegendLocation: PropertyConstructor<enums.Anchor>;
export declare const LineCap: PropertyConstructor<enums.LineCap>;
export declare const LineJoin: PropertyConstructor<enums.LineJoin>;
export declare const LinePolicy: PropertyConstructor<enums.LinePolicy>;
export declare const Location: PropertyConstructor<enums.Location>;
export declare const Logo: PropertyConstructor<enums.Logo>;
export declare const MarkerType: PropertyConstructor<enums.MarkerType>;
export declare const MutedPolicy: PropertyConstructor<enums.MutedPolicy>;
export declare const Orientation: PropertyConstructor<enums.Orientation>;
export declare const OutputBackend: PropertyConstructor<enums.OutputBackend>;
export declare const PaddingUnits: PropertyConstructor<enums.PaddingUnits>;
export declare const Place: PropertyConstructor<enums.Place>;
export declare const PointPolicy: PropertyConstructor<enums.PointPolicy>;
export declare const RadiusDimension: PropertyConstructor<enums.RadiusDimension>;
export declare const RenderLevel: PropertyConstructor<enums.RenderLevel>;
export declare const RenderMode: PropertyConstructor<enums.RenderMode>;
export declare const ResetPolicy: PropertyConstructor<enums.ResetPolicy>;
export declare const RoundingFunction: PropertyConstructor<enums.RoundingFunction>;
export declare const Side: PropertyConstructor<enums.Location>;
export declare const SizingMode: PropertyConstructor<enums.SizingMode>;
export declare const Sort: PropertyConstructor<enums.Sort>;
export declare const SpatialUnits: PropertyConstructor<enums.SpatialUnits>;
export declare const StartEnd: PropertyConstructor<enums.StartEnd>;
export declare const StepMode: PropertyConstructor<enums.StepMode>;
export declare const TapBehavior: PropertyConstructor<enums.TapBehavior>;
export declare const TextAlign: PropertyConstructor<enums.TextAlign>;
export declare const TextBaseline: PropertyConstructor<enums.TextBaseline>;
export declare const TextureRepetition: PropertyConstructor<enums.TextureRepetition>;
export declare const TickLabelOrientation: PropertyConstructor<enums.TickLabelOrientation>;
export declare const TooltipAttachment: PropertyConstructor<enums.TooltipAttachment>;
export declare const UpdateMode: PropertyConstructor<enums.UpdateMode>;
export declare const VerticalAlign: PropertyConstructor<enums.VerticalAlign>;
export declare class ScalarSpec<T, S extends Scalar<T> = Scalar<T>> extends Property<T | S> {
    __value__: T;
    __scalar__: S;
    get_value(): S;
    protected _update(attr_value: S | T): void;
}
export declare class AnyScalar extends ScalarSpec<any> {
}
export declare class ColorScalar extends ScalarSpec<types.Color | null> {
}
export declare class NumberScalar extends ScalarSpec<number> {
}
export declare class StringScalar extends ScalarSpec<string> {
}
export declare class NullStringScalar extends ScalarSpec<string | null> {
}
export declare class ArrayScalar extends ScalarSpec<any[]> {
}
export declare class LineJoinScalar extends ScalarSpec<enums.LineJoin> {
}
export declare class LineCapScalar extends ScalarSpec<enums.LineCap> {
}
export declare class FontSizeScalar extends ScalarSpec<string> {
}
export declare class FontStyleScalar extends ScalarSpec<enums.FontStyle> {
}
export declare class TextAlignScalar extends ScalarSpec<enums.TextAlign> {
}
export declare class TextBaselineScalar extends ScalarSpec<enums.TextBaseline> {
}
export declare abstract class VectorSpec<T, V extends Vector<T> = Vector<T>> extends Property<T | V> {
    __value__: T;
    __vector__: V;
    get_value(): V;
    protected _update(attr_value: V | T): void;
    array(source: ColumnarDataSource): any[];
}
export declare abstract class DataSpec<T> extends VectorSpec<T> {
}
export declare abstract class UnitsSpec<T, Units> extends VectorSpec<T, Dimensional<Vector<T>, Units>> {
    readonly default_units: Units;
    readonly valid_units: Units[];
    _update(attr_value: any): void;
    get units(): Units;
    set units(units: Units);
}
export declare class AngleSpec extends UnitsSpec<number, enums.AngleUnits> {
    get default_units(): enums.AngleUnits;
    get valid_units(): enums.AngleUnits[];
    normalize(values: Arrayable): Arrayable;
}
export declare class BooleanSpec extends DataSpec<boolean> {
}
export declare class ColorSpec extends DataSpec<types.Color | null> {
}
export declare class CoordinateSpec extends DataSpec<number | Factor> {
}
export declare class CoordinateSeqSpec extends DataSpec<number[] | Factor[]> {
}
export declare class DistanceSpec extends UnitsSpec<number, enums.SpatialUnits> {
    get default_units(): enums.SpatialUnits;
    get valid_units(): enums.SpatialUnits[];
}
export declare class FontSizeSpec extends DataSpec<string> {
}
export declare class MarkerSpec extends DataSpec<string> {
}
export declare class NumberSpec extends DataSpec<number> {
}
export declare class StringSpec extends DataSpec<string> {
}
export declare class NullStringSpec extends DataSpec<string | null> {
}
