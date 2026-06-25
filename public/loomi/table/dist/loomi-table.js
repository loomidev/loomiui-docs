var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loomiStyles, cssColor } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import "@loomi/checkbox/loomi-checkbox.js";
import "@loomi/pagination/loomi-pagination.js";
import { componentStyles } from "./generated/styles.css.js";
const SORT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />`;
const SEARCH = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />`;
/**
 * `<loomi-table>` — a data-driven table with search, sorting, pagination, checkable
 * rows (via `<loomi-checkbox>`) and action icons.
 *
 * @fires row-click - `detail: { row }` when a row is clicked.
 * @fires action - `detail: { name, row }` when an action icon is clicked.
 * @fires selection-change - `detail: { ids }` when checkable selection changes.
 * @fires page-change - `detail: { page }` when the page changes.
 */
let LoomiTable = class LoomiTable extends LitElement {
    constructor() {
        super(...arguments);
        this.data = [];
        this.columns = [];
        this.excludeColumns = "";
        this.includeColumns = "";
        this.columnAliases = {};
        this.striped = false;
        this.divided = true;
        this.divider = "regular";
        this.hasHover = false;
        this.hasShadow = true;
        this.hasBorder = false;
        this.compact = false;
        this.celled = false;
        this.uppercasing = true;
        this.searchable = false;
        this.searchPlaceholder = "Search…";
        this.sortable = false;
        this.sortableColumns = "";
        this.paginated = false;
        this.pageSize = 10;
        this.paginationStyle = "arrows";
        this.showRowNumbers = false;
        this.checkable = false;
        this.idKey = "id";
        this.selectedValue = "";
        this.actionIcons = [];
        this.actionsTitle = "actions";
        this.noDataMessage = "No records to display";
        this.clickable = false;
        this.query = "";
        this.sortKey = "";
        this.sortDir = "asc";
        this.page = 1;
        this.checked = new Set();
        this.initialized = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    willUpdate() {
        if (!this.initialized && this.selectedValue) {
            this.checked = new Set(this.selectedValue.split(",").map((s) => s.trim()).filter(Boolean));
            this.initialized = true;
        }
    }
    /** Currently selected row ids (when `checkable`). */
    get selectedIds() {
        return [...this.checked];
    }
    get cols() {
        let cols = this.columns.length
            ? this.columns
            : this.data.length
                ? Object.keys(this.data[0])
                : [];
        if (this.includeColumns) {
            const inc = this.includeColumns.split(",").map((s) => s.trim());
            cols = inc.filter((c) => cols.includes(c));
        }
        else if (this.excludeColumns) {
            const exc = this.excludeColumns.split(",").map((s) => s.trim());
            cols = cols.filter((c) => !exc.includes(c));
        }
        return cols;
    }
    heading(col) {
        return this.columnAliases[col] ?? col.replace(/_/g, " ");
    }
    isSortable(col) {
        if (!this.sortable)
            return false;
        if (!this.sortableColumns)
            return true;
        return this.sortableColumns.split(",").map((s) => s.trim()).includes(col);
    }
    rowId(row, i) {
        return String(row[this.idKey] ?? i);
    }
    get processed() {
        let rows = [...this.data];
        if (this.query) {
            const q = this.query.toLowerCase();
            rows = rows.filter((r) => this.cols.some((c) => String(r[c] ?? "").toLowerCase().includes(q)));
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
        const start = (this.page - 1) * this.pageSize;
        return rows.slice(start, start + this.pageSize);
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
        this.dispatchEvent(new CustomEvent("selection-change", { bubbles: true, composed: true, detail: { ids: [...this.checked] } }));
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
    renderActionIcon(item, row) {
        const path = getLoomiIcon(item.icon);
        const style = item.color ? `--_loomi-accent:${cssColor(item.color, 600)}` : nothing;
        return html `<button
      class="loomi-action"
      title=${item.tip ?? nothing}
      aria-label=${item.tip ?? item.icon}
      style=${style}
      @click=${(e) => {
            e.stopPropagation();
            this.dispatchEvent(new CustomEvent("action", { bubbles: true, composed: true, detail: { name: item.name ?? item.icon, row } }));
        }}
    >
      ${path ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>` : item.icon}
    </button>`;
    }
    render() {
        const cols = this.cols;
        const rows = this.pageRows;
        const colSpan = cols.length + (this.checkable ? 1 : 0) + (this.showRowNumbers ? 1 : 0) + (this.actionIcons.length ? 1 : 0);
        const tableCls = [
            this.striped ? "striped" : "",
            this.divided ? "divided" : "",
            this.divider === "thin" ? "thin" : "",
            this.hasHover ? "hoverable" : "",
            this.compact ? "compact" : "",
            this.celled ? "celled" : "",
            this.clickable ? "clickable" : "",
        ].join(" ");
        return html `<div class="loomi-wrap">
      ${this.searchable
            ? html `<div class="loomi-searchbar">
            <svg class="loomi-search-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${SEARCH}</svg>
            <input class="loomi-search" type="text" placeholder=${this.searchPlaceholder}
              .value=${this.query}
              @input=${(e) => { this.query = e.target.value; this.page = 1; }} />
          </div>`
            : nothing}

      <div class="loomi-scroll ${this.hasBorder ? "bordered" : ""} ${this.hasShadow ? "shadow" : ""}">
        <table class=${tableCls}>
          <thead>
            <tr>
              ${this.checkable
            ? html `<th class="loomi-check-col"><loomi-checkbox .checked=${this.allChecked} @change=${(e) => this.toggleAll(e.target.checked)}></loomi-checkbox></th>`
            : nothing}
              ${this.showRowNumbers ? html `<th class="loomi-num-col ${this.uppercasing ? "uppercasing" : ""}">#</th>` : nothing}
              ${cols.map((c) => {
            const sortable = this.isSortable(c);
            const active = this.sortKey === c;
            return html `<th
                  class="${this.uppercasing ? "uppercasing" : ""} ${sortable ? "sortable" : ""}"
                  @click=${sortable ? () => this.toggleSort(c) : nothing}
                >
                  <span class="loomi-th-inner">
                    ${this.heading(c)}
                    ${sortable ? html `<svg class="loomi-sort-ico ${active ? "active" : ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${SORT}</svg>` : nothing}
                  </span>
                </th>`;
        })}
              ${this.actionIcons.length ? html `<th class="${this.uppercasing ? "uppercasing" : ""}">${this.actionsTitle}</th>` : nothing}
            </tr>
          </thead>
          <tbody>
            ${rows.length === 0
            ? html `<tr><td class="loomi-empty" colspan=${colSpan}>${this.noDataMessage}</td></tr>`
            : rows.map((row, i) => {
                const id = this.rowId(row, (this.paginated ? (this.page - 1) * this.pageSize : 0) + i);
                return html `<tr @click=${() => this.dispatchEvent(new CustomEvent("row-click", { bubbles: true, composed: true, detail: { row } }))}>
                    ${this.checkable
                    ? html `<td class="loomi-check-col"><loomi-checkbox no-clearing .checked=${this.checked.has(id)} @click=${(e) => e.stopPropagation()} @change=${(e) => this.toggleRow(id, e.target.checked)}></loomi-checkbox></td>`
                    : nothing}
                    ${this.showRowNumbers ? html `<td class="loomi-num-col">${(this.paginated ? (this.page - 1) * this.pageSize : 0) + i + 1}</td>` : nothing}
                    ${cols.map((c) => html `<td>${row[c]}</td>`)}
                    ${this.actionIcons.length
                    ? html `<td><span class="loomi-actions" @click=${(e) => e.stopPropagation()}>${this.actionIcons.map((a) => this.renderActionIcon(a, row))}</span></td>`
                    : nothing}
                  </tr>`;
            })}
          </tbody>
        </table>
      </div>

      ${this.paginated && this.processed.length > this.pageSize
            ? html `<loomi-pagination
            .total=${this.processed.length}
            .pageSize=${this.pageSize}
            .page=${this.page}
            pagination-style=${this.paginationStyle}
            @page-change=${(e) => { this.page = e.detail.page; this.dispatchEvent(new CustomEvent("page-change", { bubbles: true, composed: true, detail: e.detail })); }}
          ></loomi-pagination>`
            : nothing}
    </div>`;
    }
};
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
    property({ attribute: "include-columns" })
], LoomiTable.prototype, "includeColumns", void 0);
__decorate([
    property({ type: Object, attribute: "column-aliases" })
], LoomiTable.prototype, "columnAliases", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "striped", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "divided", void 0);
__decorate([
    property()
], LoomiTable.prototype, "divider", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-hover" })
], LoomiTable.prototype, "hasHover", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-shadow" })
], LoomiTable.prototype, "hasShadow", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-border" })
], LoomiTable.prototype, "hasBorder", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "compact", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "celled", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "uppercasing", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "searchable", void 0);
__decorate([
    property({ attribute: "search-placeholder" })
], LoomiTable.prototype, "searchPlaceholder", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "sortable", void 0);
__decorate([
    property({ attribute: "sortable-columns" })
], LoomiTable.prototype, "sortableColumns", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "paginated", void 0);
__decorate([
    property({ type: Number, attribute: "page-size" })
], LoomiTable.prototype, "pageSize", void 0);
__decorate([
    property({ attribute: "pagination-style" })
], LoomiTable.prototype, "paginationStyle", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-row-numbers" })
], LoomiTable.prototype, "showRowNumbers", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "checkable", void 0);
__decorate([
    property({ attribute: "id-key" })
], LoomiTable.prototype, "idKey", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiTable.prototype, "selectedValue", void 0);
__decorate([
    property({ type: Array, attribute: "action-icons" })
], LoomiTable.prototype, "actionIcons", void 0);
__decorate([
    property({ attribute: "actions-title" })
], LoomiTable.prototype, "actionsTitle", void 0);
__decorate([
    property({ attribute: "no-data-message" })
], LoomiTable.prototype, "noDataMessage", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTable.prototype, "clickable", void 0);
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