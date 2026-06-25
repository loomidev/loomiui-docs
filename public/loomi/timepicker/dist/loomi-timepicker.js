var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loomiStyles, onClickOutside } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const CLOCK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />`;
const pad = (n) => String(n).padStart(2, "0");
/**
 * `<loomi-timepicker>` — pick a time. `popup` (input + panel) or `inline`. 12/24-hour.
 * Form-associated: submits a formatted time (e.g. `3:25PM` or `03:25`) under `name`.
 *
 * @fires change - `detail: { value }` when the time changes.
 */
let LoomiTimepicker = class LoomiTimepicker extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        /** `popup` (input + panel) or `inline`. Attribute is `tp-style` (`style` is reserved). */
        this.tpStyle = "popup";
        this.format = "12";
        this.selectedValue = "";
        this.label = "";
        this.placeholder = "HH:MM";
        this.size = "medium";
        this.required = false;
        this.invalid = false;
        this.hour = null;
        this.minute = null;
        this.ampm = "AM";
        this.open = false;
        this.parsed = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        if (!this.parsed && this.selectedValue) {
            this.parse(this.selectedValue);
            this.parsed = true;
        }
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanup?.();
    }
    parse(v) {
        const m = v.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);
        if (!m)
            return;
        this.hour = parseInt(m[1], 10);
        this.minute = parseInt(m[2], 10);
        if (m[3])
            this.ampm = m[3].toUpperCase();
    }
    /** The formatted time, or "" if incomplete. */
    get value() {
        if (this.hour === null || this.minute === null)
            return "";
        return this.format === "24"
            ? `${pad(this.hour)}:${pad(this.minute)}`
            : `${this.hour}:${pad(this.minute)}${this.ampm}`;
    }
    commit() {
        this.internals.setFormValue(this.value);
        this.syncValidity();
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { value: this.value } }));
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
        const empty = this.required && this.value === "";
        this.invalid = empty && showInvalid;
        this.internals.setValidity(empty ? { valueMissing: true } : {}, empty ? "Please select a time." : "");
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    toggle() {
        if (this.open) {
            this.open = false;
            this.cleanup?.();
            this.showValidation();
            return;
        }
        this.open = true;
        this.cleanup = onClickOutside(this, () => {
            this.open = false;
            this.showValidation();
        });
    }
    renderSelects() {
        const hours = this.format === "24"
            ? Array.from({ length: 24 }, (_, i) => i)
            : Array.from({ length: 12 }, (_, i) => i + 1);
        return html `<div class="loomi-selects">
      <select aria-label="Hour" @blur=${this.showValidation} @change=${(e) => {
            const value = e.target.value;
            this.hour = value === "" ? null : Number(value);
            this.commit();
        }}>
        <option value="" ?selected=${this.hour === null}>HH</option>
        ${hours.map((h) => html `<option value=${h} ?selected=${this.hour === h}>${this.format === "24" ? pad(h) : h}</option>`)}
      </select>
      <span class="loomi-colon">:</span>
      <select aria-label="Minute" @blur=${this.showValidation} @change=${(e) => {
            const value = e.target.value;
            this.minute = value === "" ? null : Number(value);
            this.commit();
        }}>
        <option value="" ?selected=${this.minute === null}>MM</option>
        ${Array.from({ length: 60 }, (_, i) => i).map((m) => html `<option value=${m} ?selected=${this.minute === m}>${pad(m)}</option>`)}
      </select>
      ${this.format === "12"
            ? html `<select aria-label="AM/PM" @blur=${this.showValidation} @change=${(e) => { this.ampm = e.target.value; this.commit(); }}>
            <option value="AM" ?selected=${this.ampm === "AM"}>AM</option>
            <option value="PM" ?selected=${this.ampm === "PM"}>PM</option>
          </select>`
            : nothing}
    </div>`;
    }
    render() {
        if (this.tpStyle === "inline") {
            return html `${this.label ? html `<span class="loomi-label">${this.label}</span>` : nothing}${this.renderSelects()}`;
        }
        return html `<div class="loomi-tp size-${this.size} ${this.open ? "open" : ""}">
      ${this.label ? html `<span class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>` : nothing}
      <div class="loomi-field" tabindex="0" @blur=${this.showValidation} @click=${() => this.toggle()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${CLOCK}</svg>
        <span class="loomi-text ${this.value ? "" : "placeholder"}">${this.value || this.placeholder}${!this.value && this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>
      </div>
      ${this.open ? html `<div class="loomi-panel" @click=${(e) => e.stopPropagation()}>${this.renderSelects()}</div>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTimepicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "tp-style" })
], LoomiTimepicker.prototype, "tpStyle", void 0);
__decorate([
    property()
], LoomiTimepicker.prototype, "format", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiTimepicker.prototype, "selectedValue", void 0);
__decorate([
    property()
], LoomiTimepicker.prototype, "label", void 0);
__decorate([
    property()
], LoomiTimepicker.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTimepicker.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimepicker.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimepicker.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiTimepicker.prototype, "hour", void 0);
__decorate([
    state()
], LoomiTimepicker.prototype, "minute", void 0);
__decorate([
    state()
], LoomiTimepicker.prototype, "ampm", void 0);
__decorate([
    state()
], LoomiTimepicker.prototype, "open", void 0);
__decorate([
    state()
], LoomiTimepicker.prototype, "parsed", void 0);
LoomiTimepicker = __decorate([
    customElement("loomi-timepicker")
], LoomiTimepicker);
export { LoomiTimepicker };
//# sourceMappingURL=loomi-timepicker.js.map