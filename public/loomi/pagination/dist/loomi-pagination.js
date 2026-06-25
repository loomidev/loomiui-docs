var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const PREV = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />`;
const NEXT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />`;
/**
 * `<loomi-pagination>` — page controls driven by `total`, `page-size` and `page`.
 * Emits `page-change` (`detail: { page }`). Styles: `arrows`, `numbers`, `dropdown`.
 */
let LoomiPagination = class LoomiPagination extends LitElement {
    constructor() {
        super(...arguments);
        this.total = 0;
        this.pageSize = 10;
        this.page = 1;
        this.paginationStyle = "arrows";
        this.showTotal = true;
        this.totalLabel = "Showing :a to :b of :c";
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
            return "No records";
        const a = (this.page - 1) * this.pageSize + 1;
        const b = Math.min(this.total, this.page * this.pageSize);
        return this.totalLabel
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
        if (this.paginationStyle === "dropdown") {
            return html `<span class="loomi-controls">
        ${this.btn(prev, { disabled: this.page <= 1, onClick: () => this.go(this.page - 1) })}
        <select class="loomi-select" .value=${String(this.page)} @change=${(e) => this.go(Number(e.target.value))}>
          ${Array.from({ length: this.pageCount }, (_, i) => i + 1).map((p) => html `<option value=${p} ?selected=${p === this.page}>Page ${p} of ${this.pageCount}</option>`)}
        </select>
        ${this.btn(next, { disabled: this.page >= this.pageCount, onClick: () => this.go(this.page + 1) })}
      </span>`;
        }
        if (this.paginationStyle === "numbers") {
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
      <span class="loomi-total">${this.page} / ${this.pageCount}</span>
      ${this.btn(next, { disabled: this.page >= this.pageCount, onClick: () => this.go(this.page + 1) })}
    </span>`;
    }
    render() {
        return html `<div class="loomi-pagination" style=${accentVars(this.color)}>
      ${this.showTotal ? html `<span class="loomi-total">${this.totalText()}</span>` : nothing}
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
    property({ type: Boolean, attribute: "show-total" })
], LoomiPagination.prototype, "showTotal", void 0);
__decorate([
    property({ attribute: "total-label" })
], LoomiPagination.prototype, "totalLabel", void 0);
__decorate([
    property()
], LoomiPagination.prototype, "color", void 0);
LoomiPagination = __decorate([
    customElement("loomi-pagination")
], LoomiPagination);
export { LoomiPagination };
//# sourceMappingURL=loomi-pagination.js.map