import { RowSelectionModel } from "@bokeh/slickgrid/plugins/slick.rowselectionmodel";
import { CheckboxSelectColumn } from "@bokeh/slickgrid/plugins/slick.checkboxselectcolumn";
import { CellExternalCopyManager } from "@bokeh/slickgrid/plugins/slick.cellexternalcopymanager";
import { Grid as SlickGrid } from "@bokeh/slickgrid";
import * as p from "../../../core/properties";
import { uniqueId } from "../../../core/util/string";
import { isString } from "../../../core/util/types";
import { some, range } from "../../../core/util/array";
import { keys } from "../../../core/util/object";
import { logger } from "../../../core/logging";
import { LayoutItem } from "../../../core/layout";
import { TableWidget } from "./table_widget";
import { WidgetView } from "../widget";
import { bk_data_table, bk_cell_index, bk_header_index, bk_cell_select } from "../../../styles/widgets/tables";
import slickgrid_css from "../../../styles/widgets/slickgrid.css";
import tables_css from "../../../styles/widgets/tables.css";
export const DTINDEX_NAME = "__bkdt_internal_index__";
export class TableDataProvider {
    constructor(source, view) {
        this.init(source, view);
    }
    init(source, view) {
        if (DTINDEX_NAME in source.data)
            throw new Error(`special name ${DTINDEX_NAME} cannot be used as a data table column`);
        this.source = source;
        this.view = view;
        this.index = this.view.indices;
    }
    getLength() {
        return this.index.length;
    }
    getItem(offset) {
        const item = {};
        for (const field of keys(this.source.data)) {
            item[field] = this.source.data[field][this.index[offset]];
        }
        item[DTINDEX_NAME] = this.index[offset];
        return item;
    }
    getField(offset, field) {
        // offset is the
        if (field == DTINDEX_NAME) {
            return this.index[offset];
        }
        return this.source.data[field][this.index[offset]];
    }
    setField(offset, field, value) {
        // field assumed never to be internal index name (ctor would throw)
        const index = this.index[offset];
        this.source.patch({ [field]: [[index, value]] });
    }
    getItemMetadata(_index) {
        return null;
    }
    getRecords() {
        return range(0, this.getLength()).map((i) => this.getItem(i));
    }
    sort(columns) {
        let cols = columns.map((column) => [column.sortCol.field, column.sortAsc ? 1 : -1]);
        if (cols.length == 0) {
            cols = [[DTINDEX_NAME, 1]];
        }
        const records = this.getRecords();
        const old_index = this.index.slice();
        this.index.sort(function (i1, i2) {
            for (const [field, sign] of cols) {
                const value1 = records[old_index.indexOf(i1)][field];
                const value2 = records[old_index.indexOf(i2)][field];
                const result = value1 == value2 ? 0 : value1 > value2 ? sign : -sign;
                if (result != 0)
                    return result;
            }
            return 0;
        });
    }
}
TableDataProvider.__name__ = "TableDataProvider";
export class DataTableView extends WidgetView {
    constructor() {
        super(...arguments);
        this._in_selection_update = false;
        this._warned_not_reorderable = false;
    }
    connect_signals() {
        super.connect_signals();
        this.connect(this.model.change, () => this.render());
        this.connect(this.model.source.streaming, () => this.updateGrid());
        this.connect(this.model.source.patching, () => this.updateGrid());
        this.connect(this.model.source.change, () => this.updateGrid());
        this.connect(this.model.source.properties.data.change, () => this.updateGrid());
        this.connect(this.model.source.selected.change, () => this.updateSelection());
        this.connect(this.model.source.selected.properties.indices.change, () => this.updateSelection());
    }
    remove() {
        var _a;
        (_a = this.grid) === null || _a === void 0 ? void 0 : _a.destroy();
        super.remove();
    }
    styles() {
        return [...super.styles(), slickgrid_css, tables_css];
    }
    _update_layout() {
        this.layout = new LayoutItem();
        this.layout.set_sizing(this.box_sizing());
    }
    update_position() {
        super.update_position();
        this.grid.resizeCanvas();
    }
    updateGrid() {
        // TODO (bev) This is to ensure that CDSView indices are properly computed
        // before passing to the DataProvider. This will result in extra calls to
        // compute_indices. This "over execution" will be addressed in a more
        // general look at events
        this.model.view.compute_indices();
        this.data.init(this.model.source, this.model.view);
        // This is obnoxious but there is no better way to programmatically force
        // a re-sort on the existing sorted columns until/if we start using DataView
        if (this.model.sortable) {
            const columns = this.grid.getColumns();
            const sorters = this.grid.getSortColumns().map((x) => ({
                sortCol: {
                    field: columns[this.grid.getColumnIndex(x.columnId)].field,
                },
                sortAsc: x.sortAsc,
            }));
            this.data.sort(sorters);
        }
        this.grid.invalidate();
        this.grid.render();
    }
    updateSelection() {
        if (this._in_selection_update)
            return;
        const { selected } = this.model.source;
        const permuted_indices = selected.indices.map((x) => this.data.index.indexOf(x)).sort();
        this._in_selection_update = true;
        this.grid.setSelectedRows(permuted_indices);
        this._in_selection_update = false;
        // If the selection is not in the current slickgrid viewport, scroll the
        // datatable to start at the row before the first selected row, so that
        // the selection is immediately brought into view. We don't scroll when
        // the selection is already in the viewport so that selecting from the
        // datatable itself does not re-scroll.
        const cur_grid_range = this.grid.getViewport();
        const scroll_index = this.model.get_scroll_index(cur_grid_range, permuted_indices);
        if (scroll_index != null)
            this.grid.scrollRowToTop(scroll_index);
    }
    newIndexColumn() {
        return {
            id: uniqueId(),
            name: this.model.index_header,
            field: DTINDEX_NAME,
            width: this.model.index_width,
            behavior: "select",
            cannotTriggerInsert: true,
            resizable: false,
            selectable: false,
            sortable: true,
            cssClass: bk_cell_index,
            headerCssClass: bk_header_index,
        };
    }
    css_classes() {
        return super.css_classes().concat(bk_data_table);
    }
    render() {
        let checkboxSelector;
        let columns = this.model.columns.map((column) => {
            return Object.assign(Object.assign({}, column.toColumn()), { parent: this });
        });
        if (this.model.selectable == "checkbox") {
            checkboxSelector = new CheckboxSelectColumn({ cssClass: bk_cell_select });
            columns.unshift(checkboxSelector.getColumnDefinition());
        }
        if (this.model.index_position != null) {
            const index_position = this.model.index_position;
            const index = this.newIndexColumn();
            // This is to be able to provide negative index behaviour that
            // matches what python users will expect
            if (index_position == -1)
                columns.push(index);
            else if (index_position < -1)
                columns.splice(index_position + 1, 0, index);
            else
                columns.splice(index_position, 0, index);
        }
        let { reorderable } = this.model;
        if (reorderable && !(typeof $ !== "undefined" && $.fn != null && $.fn.sortable != null)) {
            if (!this._warned_not_reorderable) {
                logger.warn("jquery-ui is required to enable DataTable.reorderable");
                this._warned_not_reorderable = true;
            }
            reorderable = false;
        }
        const options = {
            enableCellNavigation: this.model.selectable !== false,
            enableColumnReorder: reorderable,
            forceFitColumns: this.model.fit_columns,
            multiColumnSort: this.model.sortable,
            editable: this.model.editable,
            autoEdit: false,
            rowHeight: this.model.row_height,
        };
        this.data = new TableDataProvider(this.model.source, this.model.view);
        this.grid = new SlickGrid(this.el, this.data, columns, options);
        this.grid.onSort.subscribe((_event, args) => {
            if (!this.model.sortable)
                return;
            columns = args.sortCols;
            this.data.sort(columns);
            this.grid.invalidate();
            this.updateSelection();
            this.grid.render();
            if (!this.model.header_row) {
                this._hide_header();
            }
            this.model.update_sort_columns(columns);
        });
        if (this.model.selectable !== false) {
            this.grid.setSelectionModel(new RowSelectionModel({ selectActiveRow: checkboxSelector == null }));
            if (checkboxSelector != null)
                this.grid.registerPlugin(checkboxSelector);
            const pluginOptions = {
                dataItemColumnValueExtractor(val, col) {
                    // As defined in this file, Item can contain any type values
                    let value = val[col.field];
                    if (isString(value)) {
                        value = value.replace(/\n/g, "\\n");
                    }
                    return value;
                },
                includeHeaderWhenCopying: false,
            };
            this.grid.registerPlugin(new CellExternalCopyManager(pluginOptions));
            this.grid.onSelectedRowsChanged.subscribe((_event, args) => {
                if (this._in_selection_update) {
                    return;
                }
                this.model.source.selected.indices = args.rows.map((i) => this.data.index[i]);
            });
            this.updateSelection();
            if (!this.model.header_row) {
                this._hide_header();
            }
        }
    }
    _hide_header() {
        for (const el of Array.from(this.el.querySelectorAll('.slick-header-columns'))) {
            el.style.height = "0px";
        }
        this.grid.resizeCanvas();
    }
}
DataTableView.__name__ = "DataTableView";
export class DataTable extends TableWidget {
    constructor(attrs) {
        super(attrs);
        this._sort_columns = [];
    }
    get sort_columns() { return this._sort_columns; }
    static init_DataTable() {
        this.prototype.default_view = DataTableView;
        this.define({
            columns: [p.Array, []],
            fit_columns: [p.Boolean, true],
            sortable: [p.Boolean, true],
            reorderable: [p.Boolean, true],
            editable: [p.Boolean, false],
            selectable: [p.Any, true],
            index_position: [p.Int, 0],
            index_header: [p.String, "#"],
            index_width: [p.Int, 40],
            scroll_to_selection: [p.Boolean, true],
            header_row: [p.Boolean, true],
            row_height: [p.Int, 25],
        });
        this.override({
            width: 600,
            height: 400,
        });
    }
    update_sort_columns(sortCols) {
        this._sort_columns = sortCols.map((x) => ({ field: x.sortCol.field, sortAsc: x.sortAsc }));
        return null;
    }
    get_scroll_index(grid_range, selected_indices) {
        if (!this.scroll_to_selection || (selected_indices.length == 0))
            return null;
        if (!some(selected_indices, i => grid_range.top <= i && i <= grid_range.bottom)) {
            return Math.max(0, Math.min(...selected_indices) - 1);
        }
        return null;
    }
}
DataTable.__name__ = "DataTable";
DataTable.init_DataTable();
//# sourceMappingURL=data_table.js.map