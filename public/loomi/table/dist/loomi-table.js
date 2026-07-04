var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, render as litRender, svg } from "lit";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, accentVars, loomiDefaultText, loomiStyles, cssColor } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import "@loomidev/checkbox/loomi-checkbox.js";
import "@loomidev/input/loomi-input.js";
import "@loomidev/pagination/loomi-pagination.js";
import { componentStyles } from "./generated/styles.css.js";
const SORT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />`;
const DEFAULT_SEARCH_PLACEHOLDER = "Search table below...";
const DEFAULT_ACTIONS_TITLE = "actions";
const DEFAULT_NO_DATA_MESSAGE = "No records to display";
const DEFAULT_TOTAL_LABEL = "Showing :a to :b of :c records";
const booleanConverter = {
    fromAttribute(value) {
        return value !== null && value !== "false" && value !== "0";
    },
    toAttribute(value) {
        return value ? "true" : "false";
    },
};
function csv(value) {
    return value.split(",").map((s) => s.trim()).filter(Boolean);
}
function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}
function fillTemplate(template, row) {
    return template.replace(/\{([\w.-]+)\}/g, (_, key) => escapeHtml(row[key]));
}
/**
 * `<loomi-table>` — a BladewindUI-inspired data table with manual slots, dynamic
 * rows, search, sorting, grouping, selection, checkboxes, pagination, empty states,
 * custom row templates and action icons.
 *
 * @slot header - Manual `<th>` cells, or a `<template>` for custom layout headings.
 * @slot row - Optional `<template>` used when `layout="custom"` and `data` is set.
 * @slot - Manual `<tr>` rows when not using `data`.
 * @fires row-click - `detail: { row, id }` when a row is clicked.
 * @fires action - `detail: { name, row, action, click }` when an action icon is clicked.
 * @fires action-call - `detail: { name, row, action, click, resolvedClick }` for Bladewind-style click strings.
 * @fires selection-change - `detail: { ids, rows, selectedValue }` when selected rows change.
 * @fires empty-action - `detail: { action }` when the empty-state button is clicked.
 * @fires page-change - `detail: { page }` when the page changes.
 */
let LoomiTable = class LoomiTable extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.data = [];
        this.columns = [];
        this.excludeColumns = "";
        this.excludeColumnsAlias = "";
        this.includeColumns = "";
        this.includeColumnsAlias = "";
        this.columnAliases = {};
        this.layout = "auto";
        this.rowTemplate = "";
        this.rowTemplateAlias = "";
        this.striped = false;
        this.divided = true;
        this.divider = "regular";
        this.hasHover = false;
        this.hasShadow = true;
        this.hasBorder = false;
        this.compact = false;
        this.celled = false;
        this.transparent = false;
        this.uppercasing = true;
        this.searchable = false;
        this.searchContainer = "";
        this.searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER;
        this.searchPlaceholderAlias = "";
        this.locale = "";
        this.sortable = false;
        this.sortableColumns = "";
        this.sortableColumnsAlias = "";
        this.paginated = false;
        this.pageSize = 25;
        this.paginationStyle = "arrows";
        this.paginationStyleAlias = "";
        this.showRowNumbers = false;
        this.showTotal = true;
        this.showPageNumber = true;
        this.showTotalPages = false;
        this.defaultPage = 1;
        this.limit = 0;
        this.totalLabel = DEFAULT_TOTAL_LABEL;
        this.totalLabelAlias = "";
        this.selectable = false;
        this.checkable = false;
        this.idKey = "id";
        this.idKeyAlias = "";
        this.selectedValue = "";
        this.selectedValueAlias = "";
        this.actionIcons = [];
        this.actionsTitle = DEFAULT_ACTIONS_TITLE;
        this.actionsTitleAlias = "";
        this.noDataMessage = DEFAULT_NO_DATA_MESSAGE;
        this.noDataMessageAlias = "";
        this.messageAsEmptyState = false;
        this.image = "empty-state.svg";
        this.heading = "";
        this.buttonLabel = "";
        this.buttonLabelAlias = "";
        this.showImage = true;
        this.emptyOnclick = "";
        this.groupBy = "";
        this.groupByAlias = "";
        this.clickable = false;
        this.nonce = "";
        this.query = "";
        this.sortKey = "";
        this.sortDir = "asc";
        this.page = 1;
        this.checked = new Set();
        this.initialized = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    willUpdate() {
        if (!this.initialized) {
            const selected = this.selectedValueAlias || this.selectedValue;
            if (selected)
                this.checked = new Set(csv(selected));
            this.page = this.effectiveDefaultPage;
            this.initialized = true;
        }
    }
    /** Currently selected row ids. */
    get selectedIds() {
        return [...this.checked];
    }
    /** Currently selected row objects. */
    get selectedRows() {
        return this.sourceRows.filter((row, i) => this.checked.has(this.rowId(row, i)));
    }
    get effectiveColumns() {
        let cols = this.columns.length
            ? this.columns
            : this.data.length
                ? Object.keys(this.data[0])
                : Object.keys(this.effectiveColumnAliases);
        const include = this.includeColumnsAlias || this.includeColumns;
        const exclude = this.excludeColumnsAlias || this.excludeColumns;
        if (include) {
            const inc = csv(include);
            cols = inc.filter((c) => cols.includes(c) || this.effectiveColumnAliases[c]);
        }
        else if (exclude) {
            const exc = csv(exclude);
            cols = cols.filter((c) => !exc.includes(c));
        }
        return cols;
    }
    get effectiveColumnAliases() {
        return this.columnAliasesAlias ?? this.columnAliases ?? {};
    }
    get effectiveActions() {
        return this.actionIconsAlias ?? this.actionIcons ?? [];
    }
    get effectivePageSize() {
        return Math.max(1, Number(this.pageSizeAlias ?? this.pageSize) || 25);
    }
    get effectiveDefaultPage() {
        return Math.max(1, Number(this.defaultPageAlias ?? this.defaultPage) || 1);
    }
    get effectiveIdKey() {
        return this.idKeyAlias || this.idKey;
    }
    get sourceRows() {
        const limit = Number(this.limit) || 0;
        return limit > 0 ? this.data.slice(0, limit) : this.data;
    }
    headingText(col) {
        return this.effectiveColumnAliases[col] ?? col.replace(/_/g, " ");
    }
    isSortable(col) {
        if (!this.sortable)
            return false;
        const sortableColumns = this.sortableColumnsAlias || this.sortableColumns;
        if (!sortableColumns)
            return true;
        return csv(sortableColumns).includes(col);
    }
    rowId(row, i) {
        return String(row[this.effectiveIdKey] ?? i);
    }
    get processed() {
        let rows = [...this.sourceRows];
        if (this.query) {
            const q = this.query.toLowerCase();
            rows = rows.filter((r) => this.effectiveColumns.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
        }
        if (this.sortKey) {
            const k = this.sortKey;
            rows.sort((a, b) => {
                const av = a[k], bv = b[k];
                const an = Number(av), bn = Number(bv);
                let cmp;
                if (!Number.isNaN(an) && !Number.isNaN(bn))
                    cmp = an - bn;
                else
                    cmp = String(av ?? "").localeCompare(String(bv ?? ""));
                return this.sortDir === "asc" ? cmp : -cmp;
            });
        }
        return rows;
    }
    get pageRows() {
        const rows = this.processed;
        if (!this.paginated)
            return rows;
        const start = (this.page - 1) * this.effectivePageSize;
        return rows.slice(start, start + this.effectivePageSize);
    }
    get rowTemplateHtml() {
        const template = this.querySelector('template[slot="row"]');
        return template?.innerHTML || this.rowTemplateAlias || this.rowTemplate;
    }
    get headerTemplateHtml() {
        const template = this.querySelector('template[slot="header"]');
        return template?.innerHTML || "";
    }
    get hasManualRows() {
        return [...this.children].some((child) => {
            if (child instanceof HTMLTemplateElement)
                return false;
            const slot = child.getAttribute("slot") || "";
            return slot !== "header" && slot !== "row";
        });
    }
    toggleSort(col) {
        if (this.sortKey === col)
            this.sortDir = this.sortDir === "asc" ? "desc" : "asc";
        else {
            this.sortKey = col;
            this.sortDir = "asc";
        }
    }
    emitSelection() {
        this.selectedValue = [...this.checked].join(",");
        this.dispatchEvent(new CustomEvent("selection-change", {
            bubbles: true,
            composed: true,
            detail: { ids: this.selectedIds, rows: this.selectedRows, selectedValue: this.selectedValue },
        }));
    }
    toggleRow(id, on) {
        const next = new Set(this.checked);
        if (on)
            next.add(id);
        else
            next.delete(id);
        this.checked = next;
        this.emitSelection();
    }
    toggleAll(on) {
        const next = new Set(this.checked);
        this.processed.forEach((r, i) => {
            const id = this.rowId(r, i);
            if (on)
                next.add(id);
            else
                next.delete(id);
        });
        this.checked = next;
        this.emitSelection();
    }
    get allChecked() {
        const rows = this.processed;
        return rows.length > 0 && rows.every((r, i) => this.checked.has(this.rowId(r, i)));
    }
    resolveClick(click, row) {
        return click.replace(/\{([\w.-]+)\}/g, (_, key) => String(row[key] ?? ""));
    }
    callNamedAction(action, detail) {
        this.dispatchEvent(new CustomEvent("action-call", { bubbles: true, composed: true, detail }));
        const match = action.match(/^([A-Za-z_$][\w$]*)\(\)$/);
        if (!match)
            return;
        const fn = globalThis[match[1]];
        if (typeof fn === "function")
            fn();
    }
    renderActionIcon(item, row) {
        const variant = item.iconType ?? item.icon_type ?? "outline";
        const path = getLoomiIcon(item.icon, variant);
        const filled = (item.buttonOutline ?? item.button_outline) === false;
        const style = `${accentVars(item.color || "secondary")}--_loomi-accent-bg:${cssColor(item.color || "secondary", 600)}`;
        return html `<button
      class="loomi-action ${filled ? "filled" : ""}"
      title=${item.tip ?? nothing}
      aria-label=${item.tip ?? item.icon}
      style=${style}
      @click=${(e) => {
            e.stopPropagation();
            const name = item.name ?? item.icon;
            const resolvedClick = item.click ? this.resolveClick(item.click, row) : "";
            this.dispatchEvent(new CustomEvent("action", { bubbles: true, composed: true, detail: { name, row, action: item, click: item.click, resolvedClick } }));
            if (resolvedClick)
                this.callNamedAction(resolvedClick, { name, row, action: item, click: item.click, resolvedClick });
        }}
    >
      ${path
            ? html `<svg viewBox="0 0 24 24" fill=${variant === "solid" ? "currentColor" : "none"} stroke=${variant === "solid" ? "none" : "currentColor"} stroke-width="1.6" aria-hidden="true">${path}</svg>`
            : item.icon}
    </button>`;
    }
    onRowClick(row, id) {
        if (this.selectable)
            this.toggleRow(id, !this.checked.has(id));
        this.dispatchEvent(new CustomEvent("row-click", { bubbles: true, composed: true, detail: { row, id } }));
    }
    updated(changed) {
        if (changed.has("searchContainer"))
            this.removeExternalSearch();
        this.renderExternalSearch();
    }
    disconnectedCallback() {
        this.removeExternalSearch();
        super.disconnectedCallback();
    }
    get searchField() {
        const searchPlaceholder = loomiDefaultText(this.searchPlaceholderAlias || this.searchPlaceholder, DEFAULT_SEARCH_PLACEHOLDER, "table.searchPlaceholder", this.locale);
        return html `<loomi-input
      class="loomi-search-input"
      type="search"
      size="small"
      no-clearing
      clearable
      prefix-icon="magnifying-glass"
      .placeholder=${searchPlaceholder}
      .value=${this.query}
      .locale=${this.locale}
      @input=${(e) => {
            this.query = e.target.value;
            this.page = 1;
        }}
    ></loomi-input>`;
    }
    removeExternalSearch() {
        if (!this.externalSearchMount)
            return;
        litRender(nothing, this.externalSearchMount);
        this.externalSearchMount.remove();
        this.externalSearchMount = undefined;
    }
    renderExternalSearch() {
        if (!this.searchable || !this.searchContainer) {
            this.removeExternalSearch();
            return;
        }
        const container = document.querySelector(this.searchContainer);
        if (!container) {
            this.removeExternalSearch();
            return;
        }
        if (!this.externalSearchMount || this.externalSearchMount.parentElement !== container) {
            this.removeExternalSearch();
            this.externalSearchMount = document.createElement("div");
            this.externalSearchMount.className = "loomi-table-search-container";
            container.append(this.externalSearchMount);
        }
        litRender(this.searchField, this.externalSearchMount);
    }
    renderEmpty(colSpan, noDataMessage) {
        const messageAsEmptyState = this.messageAsEmptyStateAlias ?? this.messageAsEmptyState;
        if (!messageAsEmptyState)
            return html `<tr><td class="loomi-empty" colspan=${colSpan}>${noDataMessage}</td></tr>`;
        const showImage = this.showImageAlias ?? this.showImage;
        const buttonLabel = this.buttonLabelAlias || this.buttonLabel;
        return html `<tr><td class="loomi-empty" colspan=${colSpan}>
      <div class="loomi-empty-state">
        ${showImage ? html `<img src=${this.image} alt="" />` : nothing}
        ${this.heading ? html `<div class="loomi-empty-heading">${this.heading}</div>` : nothing}
        <div>${noDataMessage}</div>
        ${buttonLabel
            ? html `<button class="loomi-empty-button" type="button" @click=${() => {
                const action = this.emptyOnclick;
                this.dispatchEvent(new CustomEvent("empty-action", { bubbles: true, composed: true, detail: { action } }));
                if (action)
                    this.callNamedAction(action, { action });
            }}>${buttonLabel}</button>`
            : nothing}
      </div>
    </td></tr>`;
    }
    renderHeadingCell(col) {
        const sortable = this.isSortable(col);
        const active = this.sortKey === col;
        return html `<th
      class="${this.uppercasing ? "uppercasing" : ""} ${sortable ? "sortable" : ""}"
      @click=${sortable ? () => this.toggleSort(col) : nothing}
    >
      <span class="loomi-th-inner">
        ${this.headingText(col)}
        ${sortable ? html `<svg class="loomi-sort-ico ${active ? "active" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${SORT}</svg>` : nothing}
      </span>
    </th>`;
    }
    renderAutoRow(row, id, index, selected) {
        const cols = this.effectiveColumns;
        const offset = this.paginated ? (this.page - 1) * this.effectivePageSize : 0;
        return html `<tr class=${selected ? "selected" : ""} data-id=${id} @click=${() => this.onRowClick(row, id)}>
      ${this.checkable
            ? html `<td class="loomi-check-col"><loomi-checkbox no-clearing .checked=${selected} @click=${(e) => e.stopPropagation()} @change=${(e) => this.toggleRow(id, e.target.checked)}></loomi-checkbox></td>`
            : nothing}
      ${(this.showRowNumbersAlias ?? this.showRowNumbers) ? html `<td class="loomi-num-col">${offset + index + 1}</td>` : nothing}
      ${cols.map((c) => html `<td data-row-id=${id} data-column=${c}>${row[c]}</td>`)}
      ${this.effectiveActions.length
            ? html `<td class="loomi-actions-col"><span class="loomi-actions" @click=${(e) => e.stopPropagation()}>${this.effectiveActions.map((a) => this.renderActionIcon(a, row))}</span></td>`
            : nothing}
    </tr>`;
    }
    renderCustomRows() {
        const template = this.rowTemplateHtml;
        if (!template)
            return html `<slot></slot>`;
        return html `${this.pageRows.map((row) => unsafeHTML(fillTemplate(template, row)))}`;
    }
    renderBody(colSpan, noDataMessage) {
        if (this.data.length === 0 && this.hasManualRows)
            return html `<slot></slot>`;
        if (this.layout === "custom") {
            if (this.pageRows.length === 0 && this.data.length > 0)
                return this.renderEmpty(colSpan, noDataMessage);
            if (this.data.length === 0 && this.rowTemplateHtml)
                return this.renderEmpty(colSpan, noDataMessage);
            return this.renderCustomRows();
        }
        const rows = this.pageRows;
        if (rows.length === 0)
            return this.renderEmpty(colSpan, noDataMessage);
        const groupBy = this.groupByAlias || this.groupBy;
        const out = [];
        const offset = this.paginated ? (this.page - 1) * this.effectivePageSize : 0;
        const indexedRows = rows.map((row, i) => ({ row, pageIndex: i, absoluteIndex: offset + i }));
        if (groupBy) {
            const groups = new Map();
            indexedRows.forEach((entry) => {
                const key = entry.row[groupBy] ?? "";
                groups.set(key, [...(groups.get(key) ?? []), entry]);
            });
            groups.forEach((entries, groupValue) => {
                out.push(html `<tr class="loomi-group-row"><td colspan=${colSpan}>${groupValue}</td></tr>`);
                entries.forEach(({ row, pageIndex, absoluteIndex }) => {
                    const id = this.rowId(row, absoluteIndex);
                    out.push(this.renderAutoRow(row, id, pageIndex, this.checked.has(id)));
                });
            });
            return out;
        }
        indexedRows.forEach(({ row, pageIndex, absoluteIndex }) => {
            const id = this.rowId(row, absoluteIndex);
            out.push(this.renderAutoRow(row, id, pageIndex, this.checked.has(id)));
        });
        return out;
    }
    render() {
        const cols = this.effectiveColumns;
        const actionsTitle = loomiDefaultText(this.actionsTitleAlias || this.actionsTitle, DEFAULT_ACTIONS_TITLE, "table.actionsTitle", this.locale);
        const noDataMessage = loomiDefaultText(this.noDataMessageAlias || this.noDataMessage, DEFAULT_NO_DATA_MESSAGE, "table.noDataMessage", this.locale);
        const colSpan = Math.max(1, cols.length + (this.checkable ? 1 : 0) + ((this.showRowNumbersAlias ?? this.showRowNumbers) ? 1 : 0) + (this.effectiveActions.length ? 1 : 0));
        const tableCls = [
            this.striped ? "striped" : "",
            this.divided ? "divided" : "",
            this.divider === "thin" ? "thin" : "",
            (this.hasHoverAlias ?? this.hasHover) ? "hoverable" : "",
            this.compact ? "compact" : "",
            this.celled ? "celled" : "",
            (this.selectable || this.clickable) ? "clickable" : "",
            this.transparent ? "transparent" : "",
        ].join(" ");
        const hasData = this.data.length > 0;
        const hasTemplateHeader = !!this.headerTemplateHtml;
        const shellCls = [
            (this.hasBorderAlias ?? this.hasBorder) ? "bordered" : "",
            (this.hasShadowAlias ?? this.hasShadow) ? "shadow" : "",
        ].join(" ");
        return html `<div class="loomi-wrap">
      <div class="loomi-shell ${shellCls}">
        ${this.searchable
            ? this.searchContainer
                ? nothing
                : html `<div class="loomi-toolbar">${this.searchField}</div>`
            : nothing}

        <div class="loomi-scroll">
          <table class=${tableCls} data-current-page=${this.page}>
            <thead>
              <tr>
                ${this.checkable && hasData
            ? html `<th class="loomi-check-col"><loomi-checkbox no-clearing .checked=${this.allChecked} @change=${(e) => this.toggleAll(e.target.checked)}></loomi-checkbox></th>`
            : nothing}
                ${(this.showRowNumbersAlias ?? this.showRowNumbers) && hasData ? html `<th class="loomi-num-col ${this.uppercasing ? "uppercasing" : ""}">#</th>` : nothing}
                ${hasTemplateHeader
            ? unsafeHTML(this.headerTemplateHtml)
            : cols.length
                ? cols.map((c) => this.renderHeadingCell(c))
                : html `<slot name="header"></slot>`}
                ${this.effectiveActions.length && hasData ? html `<th class="loomi-actions-col ${this.uppercasing ? "uppercasing" : ""}">${actionsTitle}</th>` : nothing}
              </tr>
            </thead>
            <tbody>
              ${this.renderBody(colSpan, noDataMessage)}
            </tbody>
          </table>
        </div>

        ${this.paginated && this.processed.length > this.effectivePageSize
            ? html `<div class="loomi-footer">
              <loomi-pagination
                .total=${this.processed.length}
                .pageSize=${this.effectivePageSize}
                .page=${this.page}
                .locale=${this.locale}
                .paginationStyle=${this.paginationStyleAlias || this.paginationStyle}
                .showTotal=${this.showTotalAlias ?? this.showTotal}
                .showPageNumber=${this.showPageNumberAlias ?? this.showPageNumber}
                .showTotalPages=${this.showTotalPagesAlias ?? this.showTotalPages}
                .totalLabel=${this.totalLabelAlias || this.totalLabel}
                @page-change=${(e) => { this.page = e.detail.page; this.dispatchEvent(new CustomEvent("page-change", { bubbles: true, composed: true, detail: e.detail })); }}
              ></loomi-pagination>
            </div>`
            : nothing}
      </div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiTable.prototype, "name", void 0);
__decorate([
    property({ type: Array })
], LoomiTable.prototype, "data", void 0);
__decorate([
    property({ type: Array })
], LoomiTable.prototype, "columns", void 0);
__decorate([
    property({ attribute: "exclude-columns" })
], LoomiTable.prototype, "excludeColumns", void 0);
__decorate([
    property({ attribute: "exclude_columns" })
], LoomiTable.prototype, "excludeColumnsAlias", void 0);
__decorate([
    property({ attribute: "include-columns" })
], LoomiTable.prototype, "includeColumns", void 0);
__decorate([
    property({ attribute: "include_columns" })
], LoomiTable.prototype, "includeColumnsAlias", void 0);
__decorate([
    property({ type: Object, attribute: "column-aliases" })
], LoomiTable.prototype, "columnAliases", void 0);
__decorate([
    property({ type: Object, attribute: "column_aliases" })
], LoomiTable.prototype, "columnAliasesAlias", void 0);
__decorate([
    property()
], LoomiTable.prototype, "layout", void 0);
__decorate([
    property({ attribute: "row-template" })
], LoomiTable.prototype, "rowTemplate", void 0);
__decorate([
    property({ attribute: "row_template" })
], LoomiTable.prototype, "rowTemplateAlias", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "striped", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "divided", void 0);
__decorate([
    property()
], LoomiTable.prototype, "divider", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has-hover" })
], LoomiTable.prototype, "hasHover", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has_hover" })
], LoomiTable.prototype, "hasHoverAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has-shadow" })
], LoomiTable.prototype, "hasShadow", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has_shadow" })
], LoomiTable.prototype, "hasShadowAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has-border" })
], LoomiTable.prototype, "hasBorder", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "has_border" })
], LoomiTable.prototype, "hasBorderAlias", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "compact", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "celled", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "transparent", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "uppercasing", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "searchable", void 0);
__decorate([
    property({ attribute: "search-container" })
], LoomiTable.prototype, "searchContainer", void 0);
__decorate([
    property({ attribute: "search-placeholder" })
], LoomiTable.prototype, "searchPlaceholder", void 0);
__decorate([
    property({ attribute: "search_placeholder" })
], LoomiTable.prototype, "searchPlaceholderAlias", void 0);
__decorate([
    property()
], LoomiTable.prototype, "locale", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "sortable", void 0);
__decorate([
    property({ attribute: "sortable-columns" })
], LoomiTable.prototype, "sortableColumns", void 0);
__decorate([
    property({ attribute: "sortable_columns" })
], LoomiTable.prototype, "sortableColumnsAlias", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "paginated", void 0);
__decorate([
    property({ type: Number, attribute: "page-size" })
], LoomiTable.prototype, "pageSize", void 0);
__decorate([
    property({ type: Number, attribute: "page_size" })
], LoomiTable.prototype, "pageSizeAlias", void 0);
__decorate([
    property({ attribute: "pagination-style" })
], LoomiTable.prototype, "paginationStyle", void 0);
__decorate([
    property({ attribute: "pagination_style" })
], LoomiTable.prototype, "paginationStyleAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-row-numbers" })
], LoomiTable.prototype, "showRowNumbers", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_row_numbers" })
], LoomiTable.prototype, "showRowNumbersAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-total" })
], LoomiTable.prototype, "showTotal", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_total" })
], LoomiTable.prototype, "showTotalAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-page-number" })
], LoomiTable.prototype, "showPageNumber", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_page_number" })
], LoomiTable.prototype, "showPageNumberAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-total-pages" })
], LoomiTable.prototype, "showTotalPages", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_total_pages" })
], LoomiTable.prototype, "showTotalPagesAlias", void 0);
__decorate([
    property({ type: Number, attribute: "default-page" })
], LoomiTable.prototype, "defaultPage", void 0);
__decorate([
    property({ type: Number, attribute: "default_page" })
], LoomiTable.prototype, "defaultPageAlias", void 0);
__decorate([
    property({ type: Number })
], LoomiTable.prototype, "limit", void 0);
__decorate([
    property({ attribute: "total-label" })
], LoomiTable.prototype, "totalLabel", void 0);
__decorate([
    property({ attribute: "total_label" })
], LoomiTable.prototype, "totalLabelAlias", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "selectable", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "checkable", void 0);
__decorate([
    property({ attribute: "id-key" })
], LoomiTable.prototype, "idKey", void 0);
__decorate([
    property({ attribute: "id_key" })
], LoomiTable.prototype, "idKeyAlias", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiTable.prototype, "selectedValue", void 0);
__decorate([
    property({ attribute: "selected_value" })
], LoomiTable.prototype, "selectedValueAlias", void 0);
__decorate([
    property({ type: Array, attribute: "action-icons" })
], LoomiTable.prototype, "actionIcons", void 0);
__decorate([
    property({ type: Array, attribute: "action_icons" })
], LoomiTable.prototype, "actionIconsAlias", void 0);
__decorate([
    property({ attribute: "actions-title" })
], LoomiTable.prototype, "actionsTitle", void 0);
__decorate([
    property({ attribute: "actions_title" })
], LoomiTable.prototype, "actionsTitleAlias", void 0);
__decorate([
    property({ attribute: "no-data-message" })
], LoomiTable.prototype, "noDataMessage", void 0);
__decorate([
    property({ attribute: "no_data_message" })
], LoomiTable.prototype, "noDataMessageAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "message-as-empty-state" })
], LoomiTable.prototype, "messageAsEmptyState", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "message_as_empty_state" })
], LoomiTable.prototype, "messageAsEmptyStateAlias", void 0);
__decorate([
    property()
], LoomiTable.prototype, "image", void 0);
__decorate([
    property()
], LoomiTable.prototype, "heading", void 0);
__decorate([
    property({ attribute: "button-label" })
], LoomiTable.prototype, "buttonLabel", void 0);
__decorate([
    property({ attribute: "button_label" })
], LoomiTable.prototype, "buttonLabelAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-image" })
], LoomiTable.prototype, "showImage", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_image" })
], LoomiTable.prototype, "showImageAlias", void 0);
__decorate([
    property({ attribute: "onclick" })
], LoomiTable.prototype, "emptyOnclick", void 0);
__decorate([
    property({ attribute: "groupby" })
], LoomiTable.prototype, "groupBy", void 0);
__decorate([
    property({ attribute: "group-by" })
], LoomiTable.prototype, "groupByAlias", void 0);
__decorate([
    property({ converter: booleanConverter })
], LoomiTable.prototype, "clickable", void 0);
__decorate([
    property()
], LoomiTable.prototype, "nonce", void 0);
__decorate([
    state()
], LoomiTable.prototype, "query", void 0);
__decorate([
    state()
], LoomiTable.prototype, "sortKey", void 0);
__decorate([
    state()
], LoomiTable.prototype, "sortDir", void 0);
__decorate([
    state()
], LoomiTable.prototype, "page", void 0);
__decorate([
    state()
], LoomiTable.prototype, "checked", void 0);
__decorate([
    state()
], LoomiTable.prototype, "initialized", void 0);
LoomiTable = __decorate([
    customElement("loomi-table")
], LoomiTable);
export { LoomiTable };
//# sourceMappingURL=loomi-table.js.map