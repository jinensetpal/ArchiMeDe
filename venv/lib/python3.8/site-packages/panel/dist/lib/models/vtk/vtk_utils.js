import { linspace } from "@bokehjs/core/util/array";
export const ARRAY_TYPES = {
    uint8: Uint8Array,
    int8: Int8Array,
    uint16: Uint16Array,
    int16: Int16Array,
    uint32: Uint32Array,
    int32: Int32Array,
    float32: Float32Array,
    float64: Float64Array,
};
export const vtk = window.vtk;
export const vtkns = {};
if (vtk) {
    vtkns['DataArray'] = vtk.Common.Core.vtkDataArray;
    vtkns['ImageData'] = vtk.Common.DataModel.vtkImageData;
    vtkns['OutlineFilter'] = vtk.Filters.General.vtkOutlineFilter;
    vtkns['CubeSource'] = vtk.Filters.Sources.vtkCubeSource;
    vtkns['LineSource'] = vtk.Filters.Sources.vtkLineSource;
    vtkns['PlaneSource'] = vtk.Filters.Sources.vtkPlaneSource;
    vtkns['PointSource'] = vtk.Filters.Sources.vtkPointSource;
    vtkns['OrientationMarkerWidget'] = vtk.Interaction.Widgets.vtkOrientationMarkerWidget;
    vtkns['DataAccessHelper'] = vtk.IO.Core.DataAccessHelper;
    vtkns['HttpSceneLoader'] = vtk.IO.Core.vtkHttpSceneLoader;
    vtkns['ImageSlice'] = vtk.Rendering.Core.vtkImageSlice;
    vtkns['Actor'] = vtk.Rendering.Core.vtkActor;
    vtkns['AxesActor'] = vtk.Rendering.Core.vtkAxesActor;
    vtkns['Mapper'] = vtk.Rendering.Core.vtkMapper;
    vtkns['ImageMapper'] = vtk.Rendering.Core.vtkImageMapper;
    vtkns['SphereMapper'] = vtk.Rendering.Core.vtkSphereMapper;
    vtkns['WidgetManager'] = vtk.Widgets.Core.vtkWidgetManager;
    vtkns['InteractiveOrientationWidget'] = vtk.Widgets.Widgets3D.vtkInteractiveOrientationWidget;
    vtkns['PixelSpaceCallbackMapper'] = vtk.Rendering.Core.vtkPixelSpaceCallbackMapper;
    vtkns['FullScreenRenderWindow'] = vtk.Rendering.Misc.vtkFullScreenRenderWindow;
    vtkns['VolumeController'] = vtk.Interaction.UI.vtkVolumeController;
    vtkns['Volume'] = vtk.Rendering.Core.vtkVolume;
    vtkns['VolumeMapper'] = vtk.Rendering.Core.vtkVolumeMapper;
    vtkns['ColorTransferFunction'] = vtk.Rendering.Core.vtkColorTransferFunction;
    vtkns['PiecewiseFunction'] = vtk.Common.DataModel.vtkPiecewiseFunction;
    vtkns['BoundingBox'] = vtk.Common.DataModel.vtkBoundingBox;
}
export function hexToRGB(color) {
    return [parseInt(color.slice(1, 3), 16) / 255,
        parseInt(color.slice(3, 5), 16) / 255,
        parseInt(color.slice(5, 7), 16) / 255];
}
function valToHex(val) {
    const hex = Math.min(Math.max(Math.round(val), 0), 255).toString(16);
    return hex.length == 2 ? hex : "0" + hex;
}
export function rgbToHex(r, g, b) {
    return '#' + valToHex(r) + valToHex(g) + valToHex(b);
}
export function vtkLutToMapper(vtk_lut) {
    //For the moment only linear colormapper are handle
    const { scale, nodes } = vtk_lut.get('scale', 'nodes');
    if (scale !== vtkns.ColorTransferFunction.Scale.LINEAR)
        throw ('Error transfer function scale not handle');
    const x = nodes.map((a) => a.x);
    const low = Math.min(...x);
    const high = Math.max(...x);
    const vals = linspace(low, high, 255);
    const rgb = [0, 0, 0];
    const palette = (vals).map((val) => {
        vtk_lut.getColor(val, rgb);
        return rgbToHex((rgb[0] * 255), (rgb[1] * 255), (rgb[2] * 255));
    });
    return { low, high, palette };
}
function utf8ToAB(utf8_str) {
    var buf = new ArrayBuffer(utf8_str.length); // 2 bytes for each char
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen = utf8_str.length; i < strLen; i++) {
        bufView[i] = utf8_str.charCodeAt(i);
    }
    return buf;
}
export function data2VTKImageData(data) {
    const source = vtkns.ImageData.newInstance({
        spacing: data.spacing
    });
    source.setDimensions(data.dims);
    source.setOrigin(data.origin != null ? data.origin : data.dims.map((v) => v / 2));
    const dataArray = vtkns.DataArray.newInstance({
        name: "scalars",
        numberOfComponents: 1,
        values: new ARRAY_TYPES[data.dtype](utf8ToAB(atob(data.buffer)))
    });
    source.getPointData().setScalars(dataArray);
    return source;
}
export function majorAxis(vec3, idxA, idxB) {
    const axis = [0, 0, 0];
    const idx = Math.abs(vec3[idxA]) > Math.abs(vec3[idxB]) ? idxA : idxB;
    const value = vec3[idx] > 0 ? 1 : -1;
    axis[idx] = value;
    return axis;
}
export function cartesian_product(...arrays) {
    return arrays.reduce((acc, curr) => acc.flatMap((c) => curr.map((n) => [].concat(c, n))));
}
//# sourceMappingURL=vtk_utils.js.map