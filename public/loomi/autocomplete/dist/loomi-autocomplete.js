var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiT, onClickOutside, themeStyles } from "@loomidev/core";
const DEFAULT_PLACEHOLDER = "Search...";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
let LoomiAutocomplete = class LoomiAutocomplete extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.label = "";
        this.placeholder = DEFAULT_PLACEHOLDER;
        this.value = "";
        this.selectedValue = "";
        this.locale = "";
        this.size = "medium";
        this.variant = "default";
        this.data = [];
        this.labelKey = "label";
        this.valueKey = "value";
        this.descriptionKey = "description";
        this.imageKey = "image";
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.invalid = false;
        this.showFocusRing = true;
        this.open = false;
        this.activeIndex = -1;
    }
    static { this.styles = [
        themeStyles,
        css `
      :host {
        display: block;
        margin-bottom: 1rem;
        --loomi-control-height: 2.75rem;
        --loomi-control-pad-x: 1rem;
        --loomi-control-font-size: 1rem;
      }
      :host([hidden]) { display: none; }
      .loomi-ac { position: relative; width: 100%; }
      .size-tiny { --loomi-control-height: 2rem; --loomi-control-pad-x: 0.625rem; --loomi-control-font-size: 0.75rem; }
      .size-small { --loomi-control-height: 2.25rem; --loomi-control-pad-x: 0.75rem; --loomi-control-font-size: 0.875rem; }
      .size-regular { --loomi-control-height: 2.5rem; --loomi-control-pad-x: 0.875rem; --loomi-control-font-size: 0.875rem; }
      .size-medium { --loomi-control-height: 2.75rem; --loomi-control-pad-x: 1rem; --loomi-control-font-size: 1rem; }
      .size-big { --loomi-control-height: 3rem; --loomi-control-pad-x: 1.25rem; --loomi-control-font-size: 1.125rem; }
      .loomi-field {
        position: relative;
        display: flex;
        align-items: center;
        min-height: var(--loomi-control-height);
        border: 2px solid var(--loomi-surface-border);
        border-radius: 0.5rem;
        background: var(--loomi-surface);
        transition: border-color 0.15s ease, box-shadow 0.15s ease;
      }
      .loomi-field:focus-within,
      .open .loomi-field {
        border-color: var(--loomi-primary-600);
        box-shadow: 0 0 0 3px var(--loomi-primary-100);
      }
      .no-focus-ring .loomi-field:focus-within,
      .no-focus-ring.open .loomi-field {
        box-shadow: none;
      }
      :host([invalid]) .loomi-field { border-color: var(--loomi-error-400); }
      .loomi-field.variant-minimal {
        border: 0;
        border-bottom: 2px solid var(--loomi-surface-border);
        background: transparent;
        border-radius: 0;
      }
      .loomi-field.variant-minimal:focus-within,
      .open .loomi-field.variant-minimal {
        box-shadow: none;
        border-bottom-color: var(--loomi-primary-600);
      }
      :host([invalid]) .loomi-field.variant-minimal { border-bottom-color: var(--loomi-error-400); }
      input {
        flex: 1 1 auto;
        width: 100%;
        min-width: 0;
        border: 0;
        outline: 0;
        background: transparent;
        color: var(--loomi-text);
        font: inherit;
        font-size: var(--loomi-control-font-size);
        padding: 0 var(--loomi-control-pad-x);
      }
      input::placeholder { color: var(--loomi-text-faint); }
      .loomi-label {
        position: absolute;
        left: var(--loomi-control-pad-x);
        top: 50%;
        transform: translateY(-50%);
        transform-origin: left center;
        pointer-events: none;
        color: var(--loomi-text-faint);
        background: var(--loomi-surface);
        padding: 0 0.25rem;
        transition: all 0.15s ease;
      }
      input:focus + .loomi-label,
      input:not(:placeholder-shown) + .loomi-label,
      .open .loomi-label {
        top: 0;
        transform: translateY(-50%) scale(0.85);
        color: var(--loomi-primary-600);
      }
      .loomi-req { color: var(--loomi-error-500); margin-left: 0.15rem; }
      .loomi-panel {
        position: absolute;
        z-index: var(--loomi-autocomplete-panel-z-index, 500);
        top: calc(100% + 0.35rem);
        left: 0;
        right: 0;
        max-height: 14rem;
        overflow: auto;
        border: 1px solid var(--loomi-surface-border);
        border-radius: 0.5rem;
        background: var(--loomi-surface);
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
        padding: 0.25rem;
      }
      .loomi-option {
        display: flex;
        align-items: center;
        gap: 0.55rem;
        border-radius: 0.375rem;
        color: var(--loomi-text);
        cursor: pointer;
        padding: 0.5rem 0.6rem;
      }
      .loomi-option:hover,
      .loomi-option.active { background: var(--loomi-surface-hover); }
      .loomi-option img {
        width: 1.5rem;
        height: 1.5rem;
        border-radius: 9999px;
        object-fit: cover;
        flex: none;
      }
      .loomi-option-copy { min-width: 0; display: grid; gap: 0.05rem; }
      .loomi-option-label { font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .loomi-option-desc { color: var(--loomi-text-faint); font-size: 0.8rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
      .loomi-empty { color: var(--loomi-text-faint); padding: 0.75rem; text-align: center; font-size: 0.875rem; }
    `,
    ]; }
    static { this.formAssociated = true; }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanup?.();
    }
    willUpdate(changed) {
        if (changed.has("selectedValue") && this.value !== this.selectedValue) {
            this.value = this.selectedValue;
        }
        this.internals.setFormValue(this.value);
        this.invalid = this.required && !this.value.trim();
    }
    focus() {
        this.inputEl?.focus();
    }
    get options() {
        return this.data.map((row) => ({
            label: String(row[this.labelKey] ?? ""),
            value: String(row[this.valueKey] ?? row[this.labelKey] ?? ""),
            description: this.descriptionKey ? String(row[this.descriptionKey] ?? "") : "",
            image: this.imageKey ? String(row[this.imageKey] ?? "") : "",
        })).filter((item) => item.label);
    }
    get filtered() {
        const q = this.value.trim().toLowerCase();
        return q ? this.options.filter((item) => item.label.toLowerCase().includes(q) || (item.value ?? "").toLowerCase().includes(q)) : this.options;
    }
    show() {
        if (this.disabled || this.readonly)
            return;
        this.open = true;
        this.activeIndex = this.filtered.length ? 0 : -1;
        this.cleanup = onClickOutside(this, () => this.hide());
    }
    hide() {
        this.open = false;
        this.activeIndex = -1;
        this.cleanup?.();
        this.cleanup = undefined;
    }
    choose(item) {
        this.value = item.value || item.label;
        this.hide();
        this.dispatchEvent(new CustomEvent("select", { bubbles: true, composed: true, detail: { item, value: this.value, label: item.label } }));
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    onInput(event) {
        this.value = event.target.value;
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        this.show();
    }
    onKeydown(event) {
        if (!this.open && (event.key === "ArrowDown" || event.key === "Enter")) {
            this.show();
            return;
        }
        const options = this.filtered;
        if (event.key === "Escape")
            this.hide();
        else if (event.key === "ArrowDown") {
            event.preventDefault();
            this.activeIndex = options.length ? (this.activeIndex + 1) % options.length : -1;
        }
        else if (event.key === "ArrowUp") {
            event.preventDefault();
            this.activeIndex = options.length ? (this.activeIndex - 1 + options.length) % options.length : -1;
        }
        else if (event.key === "Enter" && this.activeIndex >= 0 && options[this.activeIndex]) {
            event.preventDefault();
            this.choose(options[this.activeIndex]);
        }
    }
    render() {
        const hasLabel = !!this.label;
        const placeholder = hasLabel ? " " : loomiDefaultText(this.placeholder, DEFAULT_PLACEHOLDER, "autocomplete.placeholder", this.locale);
        const options = this.filtered;
        return html `<div class="loomi-ac size-${this.size} ${this.open ? "open" : ""} ${this.showFocusRing ? "" : "no-focus-ring"}">
      <div class="loomi-field variant-${this.variant}">
        <input
          .value=${this.value}
          name=${this.name || nothing}
          placeholder=${placeholder}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-autocomplete="list"
          aria-expanded=${this.open ? "true" : "false"}
          aria-label=${hasLabel ? this.label : nothing}
          @focus=${this.show}
          @input=${this.onInput}
          @keydown=${this.onKeydown}
        />
        ${hasLabel ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>` : nothing}
      </div>
      ${this.open ? html `<div class="loomi-panel" role="listbox">
        ${options.length
            ? options.map((item, index) => html `<div
              class="loomi-option ${index === this.activeIndex ? "active" : ""}"
              role="option"
              aria-selected=${index === this.activeIndex ? "true" : "false"}
              @mouseenter=${() => (this.activeIndex = index)}
              @mousedown=${(event) => event.preventDefault()}
              @click=${() => this.choose(item)}
            >
              ${item.image ? html `<img src=${item.image} alt="" />` : nothing}
              <span class="loomi-option-copy">
                <span class="loomi-option-label">${item.label}</span>
                ${item.description ? html `<span class="loomi-option-desc">${item.description}</span>` : nothing}
              </span>
            </div>`)
            : html `<div class="loomi-empty">${loomiT("select.emptyPlaceholder", {}, this.locale)}</div>`}
      </div>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiAutocomplete.prototype, "name", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "label", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "value", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiAutocomplete.prototype, "selectedValue", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "locale", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "size", void 0);
__decorate([
    property()
], LoomiAutocomplete.prototype, "variant", void 0);
__decorate([
    property({ type: Array })
], LoomiAutocomplete.prototype, "data", void 0);
__decorate([
    property({ attribute: "label-key" })
], LoomiAutocomplete.prototype, "labelKey", void 0);
__decorate([
    property({ attribute: "value-key" })
], LoomiAutocomplete.prototype, "valueKey", void 0);
__decorate([
    property({ attribute: "description-key" })
], LoomiAutocomplete.prototype, "descriptionKey", void 0);
__decorate([
    property({ attribute: "image-key" })
], LoomiAutocomplete.prototype, "imageKey", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAutocomplete.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAutocomplete.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAutocomplete.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAutocomplete.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-focus-ring", converter: booleanAttribute })
], LoomiAutocomplete.prototype, "showFocusRing", void 0);
__decorate([
    state()
], LoomiAutocomplete.prototype, "open", void 0);
__decorate([
    state()
], LoomiAutocomplete.prototype, "activeIndex", void 0);
__decorate([
    query("input")
], LoomiAutocomplete.prototype, "inputEl", void 0);
LoomiAutocomplete = __decorate([
    customElement("loomi-autocomplete")
], LoomiAutocomplete);
export { LoomiAutocomplete };
//# sourceMappingURL=loomi-autocomplete.js.map