var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { themeStyles } from "@loomi/theme";
import { componentStyles } from "./generated/styles.css.js";
const CHEVRON = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />`;
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />`;
/**
 * `<loomi-select>` — a themeable custom select. Supports a `data` array (or JSON),
 * manual `<option>` children, search, multiple selection and a floating label.
 * Form-associated: submits the selected value(s) (comma-joined when multiple).
 *
 * @slot - Manual options as light-DOM `<option value="...">Label</option>` elements.
 * @csspart trigger - The clickable trigger.
 * @csspart panel - The dropdown panel.
 * @fires select - `detail: { value, label, values }` when an item is chosen.
 * @fires change - Fired when the selection changes (composed).
 */
let LoomiSelect = class LoomiSelect extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.placeholder = "Select One";
        this.label = "";
        this.data = [];
        this.labelKey = "label";
        this.valueKey = "value";
        this.imageKey = "";
        this.selectedValue = "";
        this.searchable = false;
        this.multiple = false;
        this.maxSelectable = -1;
        this.disabled = false;
        this.readonly = false;
        this.required = false;
        this.size = "medium";
        this.emptyPlaceholder = "No options available";
        this.invalid = false;
        this.open = false;
        this.search = "";
        this.selected = [];
        /** Index of the keyboard-highlighted option within `this.filtered`, while open. */
        this.activeIndex = -1;
        this.onDocClick = (e) => {
            if (this.open && !e.composedPath().includes(this))
                this.close(true);
        };
        this.onKeydown = (e) => {
            if (e.key === "Escape") {
                this.close(true);
                return;
            }
            if (!this.open) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault();
                    this.toggleOpen();
                }
                return;
            }
            const opts = this.filtered;
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    this.activeIndex = Math.min(this.activeIndex + 1, opts.length - 1);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                    break;
                case "Home":
                    e.preventDefault();
                    this.activeIndex = 0;
                    break;
                case "End":
                    e.preventDefault();
                    this.activeIndex = opts.length - 1;
                    break;
                case "Enter":
                case " ":
                    if (this.activeIndex >= 0 && opts[this.activeIndex]) {
                        e.preventDefault();
                        this.choose(opts[this.activeIndex]);
                    }
                    break;
            }
        };
    }
    static { this.styles = [themeStyles, componentStyles]; }
    static { this.formAssociated = true; }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("click", this.onDocClick, true);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocClick, true);
    }
    willUpdate(changed) {
        // Re-sync `selected` from `selectedValue` on first render AND whenever it's set
        // again afterwards (e.g. swapping which record a select reflects) — but never when
        // `selected` itself just changed from a user pick, since that doesn't touch
        // `selectedValue` at all.
        if (changed.has("selectedValue")) {
            this.selected = this.selectedValue
                ? this.selectedValue
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean)
                : [];
        }
        this.internals.setFormValue(this.selected.join(","));
        this.syncValidity();
    }
    /** Reset the selection. */
    reset() {
        this.selected = [];
        this.emitChange();
    }
    get options() {
        if (Array.isArray(this.data) && this.data.length) {
            return this.data.map((row) => ({
                label: String(row[this.labelKey] ?? ""),
                value: String(row[this.valueKey] ?? ""),
                image: this.imageKey ? row[this.imageKey] : undefined,
            }));
        }
        return Array.from(this.querySelectorAll("option")).map((o) => ({
            label: (o.textContent ?? "").trim(),
            value: o.getAttribute("value") ?? (o.textContent ?? "").trim(),
            image: o.dataset.image,
        }));
    }
    get filtered() {
        if (!this.search)
            return this.options;
        const q = this.search.toLowerCase();
        return this.options.filter((o) => o.label.toLowerCase().includes(q));
    }
    labelFor(value) {
        return this.options.find((o) => o.value === value)?.label ?? value;
    }
    toggleOpen() {
        if (this.disabled || this.readonly)
            return;
        if (this.open) {
            this.close(true);
            return;
        }
        this.open = !this.open;
        if (this.open) {
            const firstSelected = this.filtered.findIndex((o) => this.selected.includes(o.value));
            this.activeIndex = firstSelected >= 0 ? firstSelected : this.filtered.length ? 0 : -1;
            if (this.searchable)
                this.updateComplete.then(() => this.searchEl?.focus());
        }
    }
    close(showValidation = false) {
        this.open = false;
        this.search = "";
        this.activeIndex = -1;
        if (showValidation)
            this.showValidation();
    }
    emitChange() {
        this.internals.setFormValue(this.selected.join(","));
        this.syncValidity();
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    choose(opt) {
        if (this.multiple) {
            const has = this.selected.includes(opt.value);
            if (!has && this.maxSelectable > 0 && this.selected.length >= this.maxSelectable) {
                return;
            }
            this.selected = has
                ? this.selected.filter((v) => v !== opt.value)
                : [...this.selected, opt.value];
        }
        else {
            this.selected = [opt.value];
            this.close();
        }
        this.dispatchEvent(new CustomEvent("select", {
            bubbles: true,
            composed: true,
            detail: { value: opt.value, label: opt.label, values: [...this.selected] },
        }));
        this.emitChange();
    }
    validate() {
        this.validationVisible = true;
        return this.syncValidity(true);
    }
    checkValidity() {
        this.syncValidity();
        return this.internals.checkValidity();
    }
    reportValidity() {
        this.validationVisible = true;
        this.syncValidity(true);
        return this.internals.reportValidity();
    }
    syncValidity(showInvalid = this.validationVisible) {
        const empty = this.required && !this.disabled && !this.readonly && this.selected.length === 0;
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? "Please select an option." : "";
        if (this.triggerEl)
            this.internals.setValidity(validity, message, this.triggerEl);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    render() {
        const hasLabel = !!this.label;
        const hasSelection = this.selected.length > 0;
        const float = hasLabel && (this.open || hasSelection);
        const reserveLabelSpace = hasLabel && !hasSelection && !this.open;
        const displayText = hasSelection
            ? this.selected.map((v) => this.labelFor(v)).join(", ")
            : reserveLabelSpace
                ? `${this.label}${this.required ? " *" : ""}`
                : this.placeholder;
        const opts = this.filtered;
        const activeId = this.open && this.activeIndex >= 0 && opts[this.activeIndex] ? `loomi-opt-${this.activeIndex}` : nothing;
        return html `
      <div
        class="loomi-select size-${this.size} ${this.open ? "open" : ""} ${float ? "float" : ""}"
        @keydown=${this.onKeydown}
      >
        <button
          type="button"
          class="loomi-trigger"
          part="trigger"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? "true" : "false"}
          aria-activedescendant=${activeId}
          ?disabled=${this.disabled}
          @click=${this.toggleOpen}
          @blur=${this.showValidation}
        >
          <span class="loomi-value ${hasSelection ? "" : "placeholder"} ${reserveLabelSpace ? "sizer" : ""}">${displayText}</span>
          <svg class="loomi-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${CHEVRON}</svg>
        </button>
        ${hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
        ${this.open
            ? html `<div class="loomi-panel" part="panel" role="listbox" aria-multiselectable=${this.multiple ? "true" : nothing}>
              ${this.searchable && this.options.length
                ? html `<div class="loomi-searchbox">
                    <input
                      class="loomi-search"
                      type="text"
                      placeholder="Search…"
                      .value=${this.search}
                      @input=${(e) => {
                    this.search = e.target.value;
                    this.activeIndex = this.filtered.length ? 0 : -1;
                }}
                    />
                  </div>`
                : nothing}
              <div class="loomi-list">
                ${opts.length
                ? opts.map((o, i) => {
                    const sel = this.selected.includes(o.value);
                    return html `<div
                        id="loomi-opt-${i}"
                        class="loomi-option ${sel ? "selected" : ""} ${i === this.activeIndex ? "active" : ""}"
                        role="option"
                        aria-selected=${sel ? "true" : "false"}
                        @mouseenter=${() => (this.activeIndex = i)}
                        @click=${() => this.choose(o)}
                      >
                        ${o.image ? html `<img src=${o.image} alt="" />` : nothing}
                        <span>${o.label}</span>
                        ${sel
                        ? html `<svg class="loomi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${CHECK}</svg>`
                        : nothing}
                      </div>`;
                })
                : html `<div class="loomi-empty">${this.emptyPlaceholder}</div>`}
              </div>
            </div>`
            : nothing}
        <slot @slotchange=${() => this.requestUpdate()} hidden></slot>
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiSelect.prototype, "name", void 0);
__decorate([
    property()
], LoomiSelect.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiSelect.prototype, "label", void 0);
__decorate([
    property({ type: Array })
], LoomiSelect.prototype, "data", void 0);
__decorate([
    property({ attribute: "label-key" })
], LoomiSelect.prototype, "labelKey", void 0);
__decorate([
    property({ attribute: "value-key" })
], LoomiSelect.prototype, "valueKey", void 0);
__decorate([
    property({ attribute: "image-key" })
], LoomiSelect.prototype, "imageKey", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiSelect.prototype, "selectedValue", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSelect.prototype, "searchable", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSelect.prototype, "multiple", void 0);
__decorate([
    property({ type: Number, attribute: "max-selectable" })
], LoomiSelect.prototype, "maxSelectable", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSelect.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSelect.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSelect.prototype, "required", void 0);
__decorate([
    property()
], LoomiSelect.prototype, "size", void 0);
__decorate([
    property({ attribute: "empty-placeholder" })
], LoomiSelect.prototype, "emptyPlaceholder", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSelect.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiSelect.prototype, "open", void 0);
__decorate([
    state()
], LoomiSelect.prototype, "search", void 0);
__decorate([
    state()
], LoomiSelect.prototype, "selected", void 0);
__decorate([
    state()
], LoomiSelect.prototype, "activeIndex", void 0);
__decorate([
    query(".loomi-search")
], LoomiSelect.prototype, "searchEl", void 0);
__decorate([
    query(".loomi-trigger")
], LoomiSelect.prototype, "triggerEl", void 0);
LoomiSelect = __decorate([
    customElement("loomi-select")
], LoomiSelect);
export { LoomiSelect };
//# sourceMappingURL=loomi-select.js.map