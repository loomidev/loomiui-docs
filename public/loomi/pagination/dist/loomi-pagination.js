var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const PREV = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />`;
const NEXT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />`;
const DEFAULT_TOTAL_LABEL = "Showing :a to :b of :c";
const booleanConverter = {
    fromAttribute(value) {
        return value !== null && value !== "false" && value !== "0";
    },
    toAttribute(value) {
        return value ? "true" : "false";
    },
};
/**
 * `<loomi-pagination>` — page controls driven by `total`, `page-size` and `page`.
 * Emits `page-change` (`detail: { page }`). Styles: `arrows`, `numbers`, `dropdown`.
 */
let LoomiPagination = class LoomiPagination extends LoomiElement {
    constructor() {
        super(...arguments);
        this.total = 0;
        this.pageSize = 10;
        this.page = 1;
        this.paginationStyle = "arrows";
        this.paginationStyleAlias = "";
        this.showTotal = true;
        this.showPageNumber = true;
        this.showTotalPages = true;
        this.totalLabel = DEFAULT_TOTAL_LABEL;
        this.totalLabelAlias = "";
        this.locale = "";
        this.color = "primary";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get pageCount() {
        return Math.max(1, Math.ceil(this.total / this.pageSize));
    }
    go(page) {
        const clamped = Math.min(this.pageCount, Math.max(1, page));
        if (clamped === this.page)
            return;
        this.page = clamped;
        this.dispatchEvent(new CustomEvent("page-change", { bubbles: true, composed: true, detail: { page: clamped } }));
    }
    totalText() {
        if (this.total === 0)
            return loomiT("pagination.noRecords", {}, this.locale);
        const a = (this.page - 1) * this.pageSize + 1;
        const b = Math.min(this.total, this.page * this.pageSize);
        return loomiDefaultText(this.totalLabelAlias || this.totalLabel, DEFAULT_TOTAL_LABEL, "pagination.totalLabel", this.locale)
            .replace(":a", String(a))
            .replace(":b", String(b))
            .replace(":c", String(this.total));
    }
    /** Page numbers with ellipses, e.g. [1, '…', 4, 5, 6, '…', 20]. */
    numbers() {
        const n = this.pageCount;
        const cur = this.page;
        if (n <= 7)
            return Array.from({ length: n }, (_, i) => i + 1);
        const out = [1];
        const start = Math.max(2, cur - 1);
        const end = Math.min(n - 1, cur + 1);
        if (start > 2)
            out.push("…");
        for (let i = start; i <= end; i++)
            out.push(i);
        if (end < n - 1)
            out.push("…");
        out.push(n);
        return out;
    }
    btn(content, opts) {
        return html `<button
      class="loomi-page ${opts.active ? "active" : ""}"
      ?disabled=${opts.disabled}
      @click=${opts.onClick}
    >${content}</button>`;
    }
    renderControls() {
        const prev = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${PREV}</svg>`;
        const next = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${NEXT}</svg>`;
        const paginationStyle = this.paginationStyleAlias || this.paginationStyle;
        const showPageNumber = this.showPageNumberAlias ?? this.showPageNumber;
        const showTotalPages = this.showTotalPagesAlias ?? this.showTotalPages;
        if (paginationStyle === "dropdown") {
            return html `<span class="loomi-controls">
        ${this.btn(prev, { disabled: this.page <= 1, onClick: () => this.go(this.page - 1) })}
        <select class="loomi-select" .value=${String(this.page)} @change=${(e) => this.go(Number(e.target.value))}>
          ${Array.from({ length: this.pageCount }, (_, i) => i + 1).map((p) => html `<option value=${p} ?selected=${p === this.page}>${loomiT("pagination.pageOf", { page: p, pages: this.pageCount }, this.locale)}</option>`)}
        </select>
        ${this.btn(next, { disabled: this.page >= this.pageCount, onClick: () => this.go(this.page + 1) })}
      </span>`;
        }
        if (paginationStyle === "numbers") {
            return html `<span class="loomi-controls">
        ${this.btn(prev, { disabled: this.page <= 1, onClick: () => this.go(this.page - 1) })}
        ${this.numbers().map((p) => p === "…"
                ? html `<span class="loomi-ellipsis">…</span>`
                : this.btn(String(p), { active: p === this.page, onClick: () => this.go(p) }))}
        ${this.btn(next, { disabled: this.page >= this.pageCount, onClick: () => this.go(this.page + 1) })}
      </span>`;
        }
        // arrows
        return html `<span class="loomi-controls">
      ${this.btn(prev, { disabled: this.page <= 1, onClick: () => this.go(this.page - 1) })}
      ${showPageNumber
            ? html `<span class="loomi-total">${showTotalPages ? `${this.page} / ${this.pageCount}` : this.page}</span>`
            : nothing}
      ${this.btn(next, { disabled: this.page >= this.pageCount, onClick: () => this.go(this.page + 1) })}
    </span>`;
    }
    render() {
        return html `<div class="loomi-pagination" style=${accentVars(this.color)}>
      ${(this.showTotalAlias ?? this.showTotal) ? html `<span class="loomi-total">${this.totalText()}</span>` : nothing}
      ${this.renderControls()}
    </div>`;
    }
};
__decorate([
    property({ type: Number })
], LoomiPagination.prototype, "total", void 0);
__decorate([
    property({ type: Number, attribute: "page-size" })
], LoomiPagination.prototype, "pageSize", void 0);
__decorate([
    property({ type: Number })
], LoomiPagination.prototype, "page", void 0);
__decorate([
    property({ attribute: "pagination-style" })
], LoomiPagination.prototype, "paginationStyle", void 0);
__decorate([
    property({ attribute: "pagination_style" })
], LoomiPagination.prototype, "paginationStyleAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-total" })
], LoomiPagination.prototype, "showTotal", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_total" })
], LoomiPagination.prototype, "showTotalAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-page-number" })
], LoomiPagination.prototype, "showPageNumber", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_page_number" })
], LoomiPagination.prototype, "showPageNumberAlias", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show-total-pages" })
], LoomiPagination.prototype, "showTotalPages", void 0);
__decorate([
    property({ converter: booleanConverter, attribute: "show_total_pages" })
], LoomiPagination.prototype, "showTotalPagesAlias", void 0);
__decorate([
    property({ attribute: "total-label" })
], LoomiPagination.prototype, "totalLabel", void 0);
__decorate([
    property({ attribute: "total_label" })
], LoomiPagination.prototype, "totalLabelAlias", void 0);
__decorate([
    property()
], LoomiPagination.prototype, "locale", void 0);
__decorate([
    property()
], LoomiPagination.prototype, "color", void 0);
LoomiPagination = __decorate([
    customElement("loomi-pagination")
], LoomiPagination);
export { LoomiPagination };
//# sourceMappingURL=loomi-pagination.js.map