var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { dataGridStyles } from "./data-grid-styles.js";
import { formatCellValue, getRowMeta, resolveRowKey, orderPinnedColumns, computeColumnPinLayout, SELECTION_COLUMN_WIDTH_PX } from "./grid-utils.js";
const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_MIN_COLUMN_WIDTH = 60;
let LoomiDataGrid = class LoomiDataGrid extends LoomiElement {
    constructor() {
        super(...arguments);
        this.columns = [];
        this.data = [];
        /** Opt-in feature modules — filtering, row grouping, tree data, export, and more. See `@loomidev/data-grid/modules/*`. */
        this.modules = [];
        this.selectedKeys = [];
        this.rowKey = "id";
        this.density = "comfortable";
        this.emptyTitle = "No rows found";
        this.emptyDescription = "Try changing the filters or search term.";
        /** CSS max-height for the scroll container, e.g. `"420px"`. Pairs with `sticky-header` and virtual scrolling. */
        this.maxHeight = "";
        this.page = 1;
        this.pageSize = DEFAULT_PAGE_SIZE;
        this.totalRows = 0;
        this.selectable = false;
        this.loading = false;
        this.pagination = true;
        this.serverSide = false;
        this.stickyHeader = true;
        /** Current sort. Settable up front for an initial sort, or externally for a controlled grid. */
        this.sort = null;
        /** Per-column widths (px strings), keyed by column key. Populated by drag-resize; settable to restore saved widths. */
        this.columnWidths = {};
        this._activeCell = null;
        this._resizingKey = null;
        /** Modules currently attached (`attach()` called); reconciled against `modules` on every update. */
        this.attachedModules = [];
        /** Snapshot of the rows/columns from the most recent render, for handlers outside the template. */
        this.renderedRows = [];
        this.renderedColumns = [];
        /** Full processed row set (post filter + sort + shape), exposed to modules via `ctx.rows`. */
        this.processedRowsSnapshot = [];
        this.focusPending = false;
        this.startResize = (event, column) => {
            event.preventDefault();
            event.stopPropagation();
            const handle = event.currentTarget;
            const headerCell = handle.closest("th");
            const startX = event.clientX;
            const startWidth = headerCell?.getBoundingClientRect().width ?? DEFAULT_MIN_COLUMN_WIDTH;
            const minWidth = column.minWidth ? parseFloat(column.minWidth) : DEFAULT_MIN_COLUMN_WIDTH;
            this._resizingKey = column.key;
            handle.setPointerCapture(event.pointerId);
            const onMove = (moveEvent) => {
                const nextWidth = Math.max(minWidth, startWidth + (moveEvent.clientX - startX));
                this.columnWidths = { ...this.columnWidths, [column.key]: `${nextWidth}px` };
            };
            const onUp = () => {
                handle.removeEventListener("pointermove", onMove);
                handle.removeEventListener("pointerup", onUp);
                this._resizingKey = null;
                const width = parseFloat(this.columnWidths[column.key] ?? String(startWidth));
                this.dispatchGridEvent("loomi-column-resize", { key: column.key, width });
            };
            handle.addEventListener("pointermove", onMove);
            handle.addEventListener("pointerup", onUp);
        };
        // ---- Keyboard navigation -------------------------------------------------
        this.handleGridKeydown = (event) => {
            if (!this._activeCell) {
                return;
            }
            const { rowIndex, columnIndex } = this._activeCell;
            const row = this.renderedRows[rowIndex];
            const column = this.renderedColumns[columnIndex];
            if (!row || !column) {
                return;
            }
            const cell = { row, rowIndex, columnIndex, column };
            for (const module of this.attachedModules) {
                if (module.onCellKeydown?.(event, cell, this.moduleContext)) {
                    event.preventDefault();
                    return;
                }
            }
            switch (event.key) {
                case "ArrowUp":
                    event.preventDefault();
                    this.moveActiveCell(-1, 0);
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    this.moveActiveCell(1, 0);
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    this.moveActiveCell(0, -1);
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    this.moveActiveCell(0, 1);
                    break;
                case "Home":
                    event.preventDefault();
                    this.setActiveCell(rowIndex, 0);
                    break;
                case "End":
                    event.preventDefault();
                    this.setActiveCell(rowIndex, this.renderedColumns.length - 1);
                    break;
                case "PageUp":
                    event.preventDefault();
                    this.setPage(this.page - 1);
                    break;
                case "PageDown":
                    event.preventDefault();
                    this.setPage(this.page + 1);
                    break;
                case " ":
                    if (this.selectable) {
                        event.preventDefault();
                        this.toggleRowSelection(row);
                    }
                    break;
                case "Enter":
                    event.preventDefault();
                    this.emitRowAction(row, this.getRowKey(row));
                    break;
                default:
                    break;
            }
        };
        this.handlePageSizeChange = (event) => {
            this.pageSize = Number(event.target.value);
            this.page = 1;
            this.emitPageChange();
        };
    }
    static { this.properties = {
        ...LoomiElement.properties,
        columns: { attribute: false },
        data: { attribute: false },
        modules: { attribute: false },
        selectedKeys: { attribute: false },
        rowKey: { attribute: "row-key" },
        density: { reflect: true },
        emptyTitle: { attribute: "empty-title" },
        emptyDescription: { attribute: "empty-description" },
        maxHeight: { attribute: "max-height" },
        page: { type: Number },
        pageSize: { attribute: "page-size", type: Number },
        totalRows: { attribute: "total-rows", type: Number },
        selectable: { type: Boolean, reflect: true },
        loading: { type: Boolean, reflect: true },
        pagination: { type: Boolean, reflect: true },
        serverSide: { attribute: "server-side", type: Boolean, reflect: true },
        stickyHeader: { attribute: "sticky-header", type: Boolean, reflect: true },
        sort: { attribute: false },
        columnWidths: { attribute: false },
        _activeCell: { state: true },
        _resizingKey: { state: true }
    }; }
    static { this.styles = loomiStyles(dataGridStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute("role", "table");
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        for (const module of this.attachedModules) {
            module.detach?.(this.moduleContext);
        }
        this.attachedModules = [];
    }
    willUpdate(changed) {
        super.willUpdate(changed);
        this.reconcileModules();
    }
    updated(changed) {
        super.updated(changed);
        if (this.focusPending) {
            this.focusPending = false;
            this.focusActiveCell();
        }
    }
    reconcileModules() {
        if (this.modules === this.attachedModules) {
            return;
        }
        for (const module of this.attachedModules) {
            module.detach?.(this.moduleContext);
        }
        this.attachedModules = this.modules;
        for (const module of this.attachedModules) {
            module.attach?.(this.moduleContext);
        }
    }
    get moduleContext() {
        return {
            grid: this,
            columns: this.renderedColumns.length > 0 ? this.renderedColumns : this.columns,
            rows: this.processedRowsSnapshot,
            requestUpdate: () => this.requestUpdate(),
            dispatch: (name, detail) => this.dispatchGridEvent(name, detail),
            getRowKey: (row) => this.getRowKey(row)
        };
    }
    render() {
        const processedRows = this.getProcessedRows(this.moduleContext);
        this.processedRowsSnapshot = processedRows;
        const columns = this.getVisibleColumns(this.moduleContext);
        this.renderedColumns = columns;
        // Rebuild after the snapshots above are current, so toolbar/cell/body hooks see final rows+columns.
        const ctx = this.moduleContext;
        const bodyModule = this.attachedModules.find((module) => module.renderBody);
        const rows = bodyModule ? processedRows : this.getPageRows(processedRows);
        this.renderedRows = rows;
        const totalRows = this.getTotalRows(processedRows);
        const totalPages = this.getTotalPages(totalRows);
        const selectedCount = this.selectedKeys.length;
        const showPagination = this.pagination && !bodyModule;
        const belowTable = this.attachedModules
            .map((module) => module.renderBelowTable?.(processedRows, ctx))
            .filter((content) => content !== undefined);
        const pinLayout = computeColumnPinLayout(columns, this.columnWidths, this.selectable ? SELECTION_COLUMN_WIDTH_PX : 0);
        return html `
      <section class="shell" aria-busy=${this.loading ? "true" : "false"}>
        ${this.renderToolbar(selectedCount, ctx)}
        <div class="grid-wrap" style=${this.maxHeight ? `max-height:${this.maxHeight}` : ""}>
          ${this.loading
            ? this.renderLoading()
            : processedRows.length === 0
                ? this.renderEmpty()
                : this.renderTable(columns, rows, bodyModule, ctx, pinLayout)}
        </div>
        ${belowTable.length > 0 ? html `<div class="below-table">${belowTable}</div>` : nothing}
        ${showPagination ? this.renderFooter(totalRows, totalPages) : nothing}
      </section>
    `;
    }
    renderToolbar(selectedCount, ctx) {
        const startExtras = this.attachedModules
            .map((module) => module.renderToolbarStart?.(ctx))
            .filter((content) => content !== undefined);
        const endExtras = this.attachedModules
            .map((module) => module.renderToolbarEnd?.(ctx))
            .filter((content) => content !== undefined);
        if (startExtras.length === 0 && endExtras.length === 0 && selectedCount === 0) {
            return nothing;
        }
        return html `
      <div class="toolbar">
        <div class="toolbar-group">${startExtras}</div>
        <div class="toolbar-group">
          ${selectedCount > 0 ? html `<span class="selection-count">${selectedCount} selected</span>` : nothing}
          ${endExtras}
        </div>
      </div>
    `;
    }
    renderLoading() {
        return html `
      <div class="loading" role="status">
        <strong>Loading rows</strong>
        <span>Fetching the latest grid data.</span>
      </div>
    `;
    }
    renderEmpty() {
        return html `
      <div class="empty">
        <strong>${this.emptyTitle}</strong>
        <span>${this.emptyDescription}</span>
      </div>
    `;
    }
    renderTable(columns, rows, bodyModule, ctx, pinLayout) {
        const renderRow = (row, rowIndex) => this.renderRow(columns, row, rowIndex, pinLayout);
        return html `
      <table @keydown=${this.handleGridKeydown}>
        <colgroup>
          ${this.selectable ? html `<col style="width: ${SELECTION_COLUMN_WIDTH_PX}px" />` : nothing}
          ${columns.map((column) => html `<col style=${this.getColumnWidthStyle(column)} />`)}
        </colgroup>
        <thead>
          <tr>
            ${this.selectable
            ? html `
                  <th class="pin-select-column">
                    <input
                      type="checkbox"
                      aria-label="Select all rows"
                      .checked=${this.areAllVisibleRowsSelected(rows)}
                      @change=${(event) => this.handleSelectAll(event, rows)}
                    />
                  </th>
                `
            : nothing}
            ${columns.map((column) => this.renderHeaderCell(column, pinLayout))}
          </tr>
        </thead>
        <tbody>
          ${bodyModule ? bodyModule.renderBody(rows, columns, renderRow, ctx) : rows.map(renderRow)}
        </tbody>
      </table>
    `;
    }
    renderHeaderCell(column, pinLayout) {
        const sortIndicator = this.sort?.key === column.key ? (this.sort.direction === "asc" ? "▲" : "▼") : "";
        const className = [this.getAlignClass(column), this.getPinCellClass(column, pinLayout)].filter(Boolean).join(" ");
        const pinStyle = this.getPinCellStyle(column, pinLayout);
        const resizable = column.resizable !== false;
        const extra = this.attachedModules
            .map((module) => module.renderHeaderExtra?.(column, this.moduleContext))
            .filter((content) => content !== undefined);
        return html `
      <th
        class=${className || nothing}
        style=${[this.getColumnWidthStyle(column), pinStyle].filter(Boolean).join("; ")}
        title=${column.description ?? nothing}
      >
        <div class="th-content">
          ${column.sortable
            ? html `
                <button type="button" class="sort-button" @click=${() => this.handleSort(column)}>
                  <span>${column.label}</span>
                  <span class="sort-indicator">${sortIndicator}</span>
                </button>
              `
            : html `<span>${column.label}</span>`}
        </div>
        ${extra}
        ${resizable
            ? html `
              <div
                class=${`resize-handle${this._resizingKey === column.key ? " resizing" : ""}`}
                @pointerdown=${(event) => this.startResize(event, column)}
              ></div>
            `
            : nothing}
      </th>
    `;
    }
    renderRow(columns, row, rowIndex, pinLayout) {
        const meta = getRowMeta(row);
        if (meta?.type === "group" || meta?.type === "pivot-header") {
            return this.renderGroupRow(row, columns.length + (this.selectable ? 1 : 0));
        }
        const rowKeyValue = this.getRowKey(row);
        const selected = this.selectedKeys.includes(rowKeyValue);
        const extraRowClass = this.attachedModules
            .map((module) => module.getRowClass?.(row, rowIndex, this.moduleContext))
            .filter((value) => Boolean(value))
            .join(" ");
        return html `
      <tr
        class=${extraRowClass || nothing}
        data-selected=${selected ? "true" : "false"}
        @click=${() => this.emitRowAction(row, rowKeyValue)}
      >
        ${this.selectable
            ? html `
              <td class="pin-select-column">
                <input
                  type="checkbox"
                  aria-label=${`Select row ${rowKeyValue}`}
                  .checked=${selected}
                  @click=${(event) => event.stopPropagation()}
                  @change=${(event) => this.handleRowSelect(event, row)}
                />
              </td>
            `
            : nothing}
        ${columns.map((column, columnIndex) => this.renderDataCell(column, row, rowIndex, columnIndex, pinLayout))}
      </tr>
    `;
    }
    renderGroupRow(row, columnCount) {
        const meta = getRowMeta(row);
        const aggregateEntries = meta.aggregates ? Object.entries(meta.aggregates) : [];
        return html `
      <tr class="loomi-grid-row-group">
        <td colspan=${columnCount} style=${`padding-left: ${12 + (meta.depth ?? 0) * 16}px`}>
          ${meta.hasChildren !== false
            ? html `
                <button
                  type="button"
                  class="group-toggle"
                  aria-expanded=${meta.expanded ? "true" : "false"}
                  @click=${() => this.toggleRow(row)}
                >
                  ${meta.expanded ? "▾" : "▸"}
                </button>
              `
            : nothing}
          <strong>${meta.groupLabel}</strong>
          ${meta.count != null ? html `<span class="row-count">(${meta.count})</span>` : nothing}
          ${aggregateEntries.map(([key, value]) => html `<span class="row-count">&nbsp;· ${key}: ${formatCellValue(value)}</span>`)}
        </td>
      </tr>
    `;
    }
    renderDataCell(column, row, rowIndex, columnIndex, pinLayout) {
        const cell = { row, rowIndex, columnIndex, column };
        const activeCell = this._activeCell ?? { rowIndex: 0, columnIndex: 0 };
        const isActive = activeCell.rowIndex === rowIndex && activeCell.columnIndex === columnIndex;
        const extraCellClass = this.attachedModules
            .map((module) => module.getCellClass?.(cell, this.moduleContext))
            .filter((value) => Boolean(value))
            .join(" ");
        const className = [this.getAlignClass(column), extraCellClass, this.getPinCellClass(column, pinLayout)]
            .filter(Boolean)
            .join(" ");
        const pinStyle = this.getPinCellStyle(column, pinLayout);
        return html `
      <td
        class=${className || nothing}
        style=${pinStyle || nothing}
        tabindex=${isActive ? 0 : -1}
        data-row-index=${rowIndex}
        data-col-index=${columnIndex}
        data-active-cell=${isActive ? "true" : "false"}
        @focus=${() => this.setActiveCell(rowIndex, columnIndex)}
        @pointerdown=${(event) => this.handleCellPointerDown(cell, event)}
        @pointerenter=${(event) => this.handleCellPointerEnter(cell, event)}
        @dblclick=${(event) => {
            for (const module of this.attachedModules) {
                module.onCellDblClick?.(cell, event, this.moduleContext);
            }
        }}
      >
        ${columnIndex === 0 ? this.renderFirstCellContent(column, row, rowIndex) : this.renderCellContent(column, cell)}
      </td>
    `;
    }
    renderFirstCellContent(column, row, rowIndex) {
        const meta = getRowMeta(row);
        const content = this.renderCellContent(column, { row, rowIndex, columnIndex: 0, column });
        if (!meta || meta.depth == null) {
            return content;
        }
        return html `
      <span class="tree-indent" style=${`width: ${meta.depth * 16}px`}></span>
      ${meta.hasChildren
            ? html `
            <button
              type="button"
              class="group-toggle"
              aria-expanded=${meta.expanded ? "true" : "false"}
              @click=${(event) => {
                event.stopPropagation();
                this.toggleRow(row);
            }}
            >
              ${meta.expanded ? "▾" : "▸"}
            </button>
          `
            : nothing}
      ${content}
    `;
    }
    renderCellContent(column, cell) {
        for (const module of this.attachedModules) {
            const rendered = module.renderCell?.(cell.row[column.key], cell, this.moduleContext);
            if (rendered !== undefined) {
                return rendered;
            }
        }
        if (column.cellRenderer) {
            return column.cellRenderer({ value: cell.row[column.key], row: cell.row, rowIndex: cell.rowIndex, column });
        }
        if (column.formatter) {
            return column.formatter(cell.row[column.key], cell.row);
        }
        return formatCellValue(cell.row[column.key]);
    }
    renderFooter(totalRows, totalPages) {
        return html `
      <div class="footer">
        <span class="row-count">${totalRows} rows</span>
        <div class="pagination">
          <button type="button" ?disabled=${this.page <= 1} @click=${() => this.setPage(this.page - 1)}>
            Previous
          </button>
          <span>Page ${this.page} of ${totalPages}</span>
          <button type="button" ?disabled=${this.page >= totalPages} @click=${() => this.setPage(this.page + 1)}>
            Next
          </button>
          <select aria-label="Rows per page" .value=${String(this.pageSize)} @change=${this.handlePageSizeChange}>
            ${[10, 25, 50, 100].map((size) => html `<option value=${size}>${size} rows</option>`)}
          </select>
        </div>
      </div>
    `;
    }
    // ---- Column resizing ----------------------------------------------------
    getColumnWidthStyle(column) {
        const width = this.columnWidths[column.key] ?? column.width;
        const styles = [];
        if (width) {
            styles.push(`width: ${width}`);
        }
        if (column.minWidth) {
            styles.push(`min-width: ${column.minWidth}`);
        }
        if (column.maxWidth) {
            styles.push(`max-width: ${column.maxWidth}`);
        }
        return styles.join("; ");
    }
    moveActiveCell(rowDelta, columnDelta) {
        const current = this._activeCell ?? { rowIndex: 0, columnIndex: 0 };
        const nextRow = Math.max(0, Math.min(this.renderedRows.length - 1, current.rowIndex + rowDelta));
        const nextColumn = Math.max(0, Math.min(this.renderedColumns.length - 1, current.columnIndex + columnDelta));
        this.setActiveCell(nextRow, nextColumn);
    }
    setActiveCell(rowIndex, columnIndex) {
        this._activeCell = { rowIndex, columnIndex };
        this.focusPending = true;
    }
    focusActiveCell() {
        if (!this._activeCell) {
            return;
        }
        const selector = `td[data-row-index="${this._activeCell.rowIndex}"][data-col-index="${this._activeCell.columnIndex}"]`;
        const cell = this.shadowRoot?.querySelector(selector);
        cell?.focus();
    }
    // ---- Pointer hooks (spreadsheet range selection etc.) --------------------
    handleCellPointerDown(cell, event) {
        this.setActiveCell(cell.rowIndex, cell.columnIndex);
        for (const module of this.attachedModules) {
            module.onCellPointerDown?.(cell, event, this.moduleContext);
        }
    }
    handleCellPointerEnter(cell, event) {
        for (const module of this.attachedModules) {
            module.onCellPointerEnter?.(cell, event, this.moduleContext);
        }
    }
    // ---- Sorting --------------------------------------------------------------
    handleSort(column) {
        if (!column.sortable) {
            return;
        }
        if (this.sort?.key !== column.key) {
            this.sort = { key: column.key, direction: "asc" };
        }
        else if (this.sort.direction === "asc") {
            this.sort = { key: column.key, direction: "desc" };
        }
        else {
            this.sort = null;
        }
        this.page = 1;
        this.dispatchGridEvent("loomi-sort-change", { sort: this.sort });
    }
    // ---- Selection --------------------------------------------------------------
    handleRowSelect(event, row) {
        const checked = event.target.checked;
        this.setRowSelected(row, checked);
    }
    toggleRowSelection(row) {
        const rowKeyValue = this.getRowKey(row);
        this.setRowSelected(row, !this.selectedKeys.includes(rowKeyValue));
    }
    setRowSelected(row, isSelected) {
        const rowKeyValue = this.getRowKey(row);
        const selected = new Set(this.selectedKeys);
        if (isSelected) {
            selected.add(rowKeyValue);
        }
        else {
            selected.delete(rowKeyValue);
        }
        this.selectedKeys = [...selected];
        this.emitSelectionChange();
    }
    handleSelectAll(event, rows) {
        const checked = event.target.checked;
        const selected = new Set(this.selectedKeys);
        for (const row of rows) {
            const rowKeyValue = this.getRowKey(row);
            if (checked) {
                selected.add(rowKeyValue);
            }
            else {
                selected.delete(rowKeyValue);
            }
        }
        this.selectedKeys = [...selected];
        this.emitSelectionChange();
    }
    areAllVisibleRowsSelected(rows) {
        const selectableRows = rows.filter((row) => getRowMeta(row)?.type == null || getRowMeta(row)?.type === "data");
        return selectableRows.length > 0 && selectableRows.every((row) => this.selectedKeys.includes(this.getRowKey(row)));
    }
    // ---- Pagination --------------------------------------------------------------
    setPage(page) {
        const totalPages = this.getTotalPages(this.getTotalRows(this.getProcessedRows(this.moduleContext)));
        this.page = Math.max(1, Math.min(page, totalPages));
        this.emitPageChange();
    }
    emitPageChange() {
        this.dispatchGridEvent("loomi-page-change", { page: this.page, pageSize: this.pageSize });
    }
    // ---- Row grouping / tree toggling (generic; modules react via onGridEvent) --
    toggleRow(row) {
        const meta = getRowMeta(row);
        this.dispatchGridEvent("loomi-grid-toggle-row", {
            rowKey: this.getRowKey(row),
            row,
            expanded: !(meta?.expanded ?? false)
        });
    }
    emitRowAction(row, rowKeyValue) {
        if (getRowMeta(row)) {
            return;
        }
        this.dispatchGridEvent("loomi-row-action", { row, rowKey: rowKeyValue });
    }
    // ---- Row processing pipeline --------------------------------------------
    getVisibleColumns(ctx) {
        let columns = this.columns.filter((column) => !column.hidden);
        for (const module of this.attachedModules) {
            if (module.transformColumns) {
                columns = module.transformColumns(columns, ctx);
            }
        }
        return orderPinnedColumns(columns);
    }
    getProcessedRows(ctx) {
        if (this.serverSide) {
            return this.data;
        }
        let rows = this.data;
        for (const module of this.attachedModules) {
            if ((module.stage ?? "filter") === "filter" && module.transformRows) {
                rows = module.transformRows(rows, ctx);
            }
        }
        rows = this.sortRows(rows);
        for (const module of this.attachedModules) {
            if (module.stage === "shape" && module.transformRows) {
                rows = module.transformRows(rows, ctx);
            }
        }
        return rows;
    }
    sortRows(rows) {
        if (!this.sort) {
            return rows;
        }
        const direction = this.sort.direction === "asc" ? 1 : -1;
        const sortKey = this.sort.key;
        return [...rows].sort((first, second) => {
            const firstValue = first[sortKey];
            const secondValue = second[sortKey];
            if (typeof firstValue === "number" && typeof secondValue === "number") {
                return (firstValue - secondValue) * direction;
            }
            return formatCellValue(firstValue).localeCompare(formatCellValue(secondValue)) * direction;
        });
    }
    getPageRows(rows) {
        if (this.serverSide || !this.pagination) {
            return rows;
        }
        const start = (this.page - 1) * this.pageSize;
        return rows.slice(start, start + this.pageSize);
    }
    getTotalRows(processedRows) {
        return this.serverSide ? this.totalRows || this.data.length : processedRows.length;
    }
    getTotalPages(totalRows) {
        return Math.max(1, Math.ceil(totalRows / this.pageSize));
    }
    getAlignClass(column) {
        if (column.align === "center") {
            return "align-center";
        }
        if (column.align === "end") {
            return "align-end";
        }
        return "";
    }
    getPinCellClass(column, pinLayout) {
        const classes = [];
        if (column.pinned === "start") {
            classes.push("pinned-start");
            if (column.key === pinLayout.lastStartKey) {
                classes.push("pin-edge-start");
            }
        }
        if (column.pinned === "end") {
            classes.push("pinned-end");
            if (column.key === pinLayout.firstEndKey) {
                classes.push("pin-edge-end");
            }
        }
        return classes.join(" ");
    }
    getPinCellStyle(column, pinLayout) {
        const start = pinLayout.startOffsets.get(column.key);
        if (start != null) {
            return `left: ${start}px`;
        }
        const end = pinLayout.endOffsets.get(column.key);
        if (end != null) {
            return `right: ${end}px`;
        }
        return "";
    }
    // ---- DataGridHost surface (used by modules) ------------------------------
    getRowKey(row) {
        return resolveRowKey(row, this.rowKey);
    }
    dispatchGridEvent(name, detail) {
        this.dispatchEvent(new CustomEvent(name, { bubbles: true, composed: true, detail }));
        for (const module of this.attachedModules) {
            module.onGridEvent?.(name, detail, this.moduleContext);
        }
    }
    updateCellValue(rowKeyValue, columnKey, value) {
        const index = this.data.findIndex((row) => this.getRowKey(row) === rowKeyValue);
        if (index === -1) {
            return;
        }
        const previousValue = this.data[index][columnKey];
        const nextRow = { ...this.data[index], [columnKey]: value };
        const nextData = [...this.data];
        nextData[index] = nextRow;
        this.data = nextData;
        this.dispatchGridEvent("loomi-cell-edit", {
            row: nextRow,
            rowKey: rowKeyValue,
            columnKey,
            previousValue,
            value
        });
    }
    emitSelectionChange() {
        const selectedRows = this.data.filter((row) => this.selectedKeys.includes(this.getRowKey(row)));
        this.dispatchGridEvent("loomi-selection-change", {
            selectedKeys: this.selectedKeys,
            selectedRows
        });
    }
};
LoomiDataGrid = __decorate([
    customElement("loomi-data-grid")
], LoomiDataGrid);
export { LoomiDataGrid };
//# sourceMappingURL=loomi-data-grid.js.map