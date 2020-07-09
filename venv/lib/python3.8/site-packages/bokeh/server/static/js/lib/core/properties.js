import { Signal0 } from "./signaling";
import * as enums from "./enums";
import { includes, repeat } from "./util/array";
import { map } from "./util/arrayable";
import { is_color } from "./util/color";
import { isBoolean, isNumber, isString, isArray, isPlainObject } from "./util/types";
import { settings } from "./settings";
function valueToString(value) {
    try {
        return JSON.stringify(value);
    }
    catch (_a) {
        return value.toString();
    }
}
export function isSpec(obj) {
    return isPlainObject(obj) &&
        ((obj.value === undefined ? 0 : 1) +
            (obj.field === undefined ? 0 : 1) +
            (obj.expr === undefined ? 0 : 1) == 1); // garbage JS XOR
}
export class Property {
    constructor(obj, attr, default_value, initial_value, options = {}) {
        var _a, _b;
        this.obj = obj;
        this.attr = attr;
        this.default_value = default_value;
        this._dirty = false;
        this.change = new Signal0(this.obj, "change");
        this.internal = (_a = options.internal) !== null && _a !== void 0 ? _a : false;
        this.optional = (_b = options.optional) !== null && _b !== void 0 ? _b : false;
        let attr_value;
        if (initial_value !== undefined) {
            attr_value = initial_value;
            this._dirty = true;
        }
        else {
            const value = this._default_override();
            if (value !== undefined)
                attr_value = value;
            else if (default_value !== undefined)
                attr_value = default_value(obj);
            else {
                //throw new Error("no default")
                attr_value = null; // XXX: nullable properties
            }
        }
        this._update(attr_value);
    }
    get syncable() {
        return !this.internal;
    }
    get_value() {
        return this.spec.value;
    }
    set_value(val) {
        this._update(val);
        this._dirty = true;
    }
    // abstract _intrinsic_default(): T
    _default_override() {
        return undefined;
    }
    get dirty() {
        return this._dirty;
    }
    //protected abstract _update(attr_value: T): void
    _update(attr_value) {
        if (attr_value != null) // XXX: non-nullalble types
            this.validate(attr_value);
        this.spec = { value: attr_value };
    }
    toString() {
        /*${this.name}*/
        return `Prop(${this.obj}.${this.attr}, spec: ${valueToString(this.spec)})`;
    }
    // ----- customizable policies
    normalize(values) {
        return values;
    }
    validate(value) {
        if (!this.valid(value))
            throw new Error(`${this.obj.type}.${this.attr} given invalid value: ${valueToString(value)}`);
    }
    valid(_value) {
        return true;
    }
    // ----- property accessors
    value(do_spec_transform = true) {
        if (this.spec.value === undefined)
            throw new Error("attempted to retrieve property value for property without value specification");
        let ret = this.normalize([this.spec.value])[0];
        if (this.spec.transform != null && do_spec_transform)
            ret = this.spec.transform.compute(ret);
        return ret;
    }
}
Property.__name__ = "Property";
//
// Primitive Properties
//
export class Any extends Property {
}
Any.__name__ = "Any";
export class Array extends Property {
    valid(value) {
        return isArray(value) || value instanceof Float64Array;
    }
}
Array.__name__ = "Array";
export class Boolean extends Property {
    valid(value) {
        return isBoolean(value);
    }
}
Boolean.__name__ = "Boolean";
export class Color extends Property {
    valid(value) {
        return isString(value) && is_color(value);
    }
}
Color.__name__ = "Color";
export class Instance extends Property {
}
Instance.__name__ = "Instance";
export class Number extends Property {
    valid(value) {
        return isNumber(value);
    }
}
Number.__name__ = "Number";
export class Int extends Number {
    valid(value) {
        return isNumber(value) && (value | 0) == value;
    }
}
Int.__name__ = "Int";
export class Angle extends Number {
}
Angle.__name__ = "Angle";
export class Percent extends Number {
    valid(value) {
        return isNumber(value) && 0 <= value && value <= 1.0;
    }
}
Percent.__name__ = "Percent";
export class String extends Property {
    valid(value) {
        return isString(value);
    }
}
String.__name__ = "String";
export class NullString extends Property {
    valid(value) {
        return value === null || isString(value);
    }
}
NullString.__name__ = "NullString";
export class FontSize extends String {
}
FontSize.__name__ = "FontSize";
export class Font extends String {
    _default_override() {
        return settings.dev ? "Bokeh" : undefined;
    }
}
Font.__name__ = "Font";
//
// Enum properties
//
export class EnumProperty extends Property {
    valid(value) {
        return isString(value) && includes(this.enum_values, value);
    }
}
EnumProperty.__name__ = "EnumProperty";
export function Enum(values) {
    return class extends EnumProperty {
        get enum_values() {
            return values;
        }
    };
}
export class Direction extends EnumProperty {
    get enum_values() {
        return enums.Direction;
    }
    normalize(values) {
        const result = new Uint8Array(values.length);
        for (let i = 0; i < values.length; i++) {
            switch (values[i]) {
                case "clock":
                    result[i] = 0;
                    break;
                case "anticlock":
                    result[i] = 1;
                    break;
            }
        }
        return result;
    }
}
Direction.__name__ = "Direction";
export const Anchor = Enum(enums.Anchor);
export const AngleUnits = Enum(enums.AngleUnits);
export const BoxOrigin = Enum(enums.BoxOrigin);
export const ButtonType = Enum(enums.ButtonType);
export const CalendarPosition = Enum(enums.CalendarPosition);
export const Dimension = Enum(enums.Dimension);
export const Dimensions = Enum(enums.Dimensions);
export const Distribution = Enum(enums.Distribution);
export const FontStyle = Enum(enums.FontStyle);
export const HatchPatternType = Enum(enums.HatchPatternType);
export const HTTPMethod = Enum(enums.HTTPMethod);
export const HexTileOrientation = Enum(enums.HexTileOrientation);
export const HoverMode = Enum(enums.HoverMode);
export const LatLon = Enum(enums.LatLon);
export const LegendClickPolicy = Enum(enums.LegendClickPolicy);
export const LegendLocation = Enum(enums.LegendLocation);
export const LineCap = Enum(enums.LineCap);
export const LineJoin = Enum(enums.LineJoin);
export const LinePolicy = Enum(enums.LinePolicy);
export const Location = Enum(enums.Location);
export const Logo = Enum(enums.Logo);
export const MarkerType = Enum(enums.MarkerType);
export const MutedPolicy = Enum(enums.MutedPolicy);
export const Orientation = Enum(enums.Orientation);
export const OutputBackend = Enum(enums.OutputBackend);
export const PaddingUnits = Enum(enums.PaddingUnits);
export const Place = Enum(enums.Place);
export const PointPolicy = Enum(enums.PointPolicy);
export const RadiusDimension = Enum(enums.RadiusDimension);
export const RenderLevel = Enum(enums.RenderLevel);
export const RenderMode = Enum(enums.RenderMode);
export const ResetPolicy = Enum(enums.ResetPolicy);
export const RoundingFunction = Enum(enums.RoundingFunction);
export const Side = Enum(enums.Side);
export const SizingMode = Enum(enums.SizingMode);
export const Sort = Enum(enums.Sort);
export const SpatialUnits = Enum(enums.SpatialUnits);
export const StartEnd = Enum(enums.StartEnd);
export const StepMode = Enum(enums.StepMode);
export const TapBehavior = Enum(enums.TapBehavior);
export const TextAlign = Enum(enums.TextAlign);
export const TextBaseline = Enum(enums.TextBaseline);
export const TextureRepetition = Enum(enums.TextureRepetition);
export const TickLabelOrientation = Enum(enums.TickLabelOrientation);
export const TooltipAttachment = Enum(enums.TooltipAttachment);
export const UpdateMode = Enum(enums.UpdateMode);
export const VerticalAlign = Enum(enums.VerticalAlign);
//
// DataSpec properties
//
export class ScalarSpec extends Property {
    get_value() {
        // XXX: allow obj.x = null; obj.x == null
        return this.spec.value === null ? null : this.spec;
    }
    _update(attr_value) {
        if (isSpec(attr_value))
            this.spec = attr_value;
        else
            this.spec = { value: attr_value };
        if (this.spec.value != null)
            this.validate(this.spec.value);
    }
}
ScalarSpec.__name__ = "ScalarSpec";
export class AnyScalar extends ScalarSpec {
}
AnyScalar.__name__ = "AnyScalar";
export class ColorScalar extends ScalarSpec {
}
ColorScalar.__name__ = "ColorScalar";
export class NumberScalar extends ScalarSpec {
}
NumberScalar.__name__ = "NumberScalar";
export class StringScalar extends ScalarSpec {
}
StringScalar.__name__ = "StringScalar";
export class NullStringScalar extends ScalarSpec {
}
NullStringScalar.__name__ = "NullStringScalar";
export class ArrayScalar extends ScalarSpec {
}
ArrayScalar.__name__ = "ArrayScalar";
export class LineJoinScalar extends ScalarSpec {
}
LineJoinScalar.__name__ = "LineJoinScalar";
export class LineCapScalar extends ScalarSpec {
}
LineCapScalar.__name__ = "LineCapScalar";
export class FontSizeScalar extends ScalarSpec {
}
FontSizeScalar.__name__ = "FontSizeScalar";
export class FontStyleScalar extends ScalarSpec {
}
FontStyleScalar.__name__ = "FontStyleScalar";
export class TextAlignScalar extends ScalarSpec {
}
TextAlignScalar.__name__ = "TextAlignScalar";
export class TextBaselineScalar extends ScalarSpec {
}
TextBaselineScalar.__name__ = "TextBaselineScalar";
export class VectorSpec extends Property {
    get_value() {
        // XXX: allow obj.x = null; obj.x == null
        return this.spec.value === null ? null : this.spec;
    }
    _update(attr_value) {
        if (isSpec(attr_value))
            this.spec = attr_value;
        else
            this.spec = { value: attr_value };
        if (this.spec.value != null)
            this.validate(this.spec.value);
    }
    array(source) {
        let ret;
        if (this.spec.field != null) {
            ret = this.normalize(source.get_column(this.spec.field));
            if (ret == null)
                throw new Error(`attempted to retrieve property array for nonexistent field '${this.spec.field}'`);
        }
        else if (this.spec.expr != null) {
            ret = this.normalize(this.spec.expr.v_compute(source));
        }
        else {
            let length = source.get_length();
            if (length == null)
                length = 1;
            const value = this.value(false); // don't apply any spec transform
            ret = repeat(value, length);
        }
        if (this.spec.transform != null)
            ret = this.spec.transform.v_compute(ret);
        return ret;
    }
}
VectorSpec.__name__ = "VectorSpec";
export class DataSpec extends VectorSpec {
}
DataSpec.__name__ = "DataSpec";
export class UnitsSpec extends VectorSpec {
    _update(attr_value) {
        super._update(attr_value);
        if (this.spec.units == null)
            this.spec.units = this.default_units;
        const units = this.spec.units;
        if (!includes(this.valid_units, units))
            throw new Error(`units must be one of ${this.valid_units.join(", ")}; got: ${units}`);
    }
    get units() {
        return this.spec.units;
    }
    set units(units) {
        this.spec.units = units;
    }
}
UnitsSpec.__name__ = "UnitsSpec";
export class AngleSpec extends UnitsSpec {
    get default_units() { return "rad"; }
    get valid_units() { return enums.AngleUnits; }
    normalize(values) {
        if (this.spec.units == "deg")
            values = map(values, (x) => x * Math.PI / 180.0);
        values = map(values, (x) => -x);
        return super.normalize(values);
    }
}
AngleSpec.__name__ = "AngleSpec";
export class BooleanSpec extends DataSpec {
}
BooleanSpec.__name__ = "BooleanSpec";
export class ColorSpec extends DataSpec {
}
ColorSpec.__name__ = "ColorSpec";
export class CoordinateSpec extends DataSpec {
}
CoordinateSpec.__name__ = "CoordinateSpec";
export class CoordinateSeqSpec extends DataSpec {
}
CoordinateSeqSpec.__name__ = "CoordinateSeqSpec";
export class DistanceSpec extends UnitsSpec {
    get default_units() { return "data"; }
    get valid_units() { return enums.SpatialUnits; }
}
DistanceSpec.__name__ = "DistanceSpec";
export class FontSizeSpec extends DataSpec {
}
FontSizeSpec.__name__ = "FontSizeSpec";
export class MarkerSpec extends DataSpec {
}
MarkerSpec.__name__ = "MarkerSpec";
export class NumberSpec extends DataSpec {
}
NumberSpec.__name__ = "NumberSpec";
export class StringSpec extends DataSpec {
}
StringSpec.__name__ = "StringSpec";
export class NullStringSpec extends DataSpec {
}
NullStringSpec.__name__ = "NullStringSpec";
//# sourceMappingURL=properties.js.map