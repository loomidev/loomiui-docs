var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { themeStyles } from "@loomi/theme";
import { componentStyles } from "./generated/styles.css.js";
const MINUS = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14" />`;
const PLUS = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M5 12h14" />`;
/**
 * `<loomi-number>` — a themeable number stepper with increment/decrement buttons,
 * min/max/step enforcement and a floating label. Form-associated.
 *
 * @csspart field - The bordered container.
 * @csspart input - The native number `<input>`.
 * @fires input - Fired as the value changes (composed).
 * @fires change - Fired on commit (composed).
 */
let LoomiNumber = class LoomiNumber extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.label = "";
        this.value = "";
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.size = "medium";
        this.transparentIcons = true;
        this.withDots = true;
        this.required = false;
        this.disabled = false;
        this.invalid = false;
        this.onInput = (e) => {
            const raw = e.target.value;
            let v = raw.replace(this.withDots ? /[^0-9.\-]/g : /[^0-9\-]/g, "");
            this.value = v;
            this.syncValidity();
            this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        };
        this.onChange = () => {
            if (this.value.trim() === "") {
                this.syncValidity();
                return;
            }
            this.setValue(this.current);
        };
    }
    static { this.styles = [themeStyles, componentStyles]; }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    focus() {
        this.inputEl?.focus();
    }
    get current() {
        const n = parseFloat(this.value);
        return Number.isNaN(n) ? this.min : n;
    }
    clamp(n) {
        return Math.min(this.max, Math.max(this.min, n));
    }
    setValue(n, emitChange = true) {
        const clamped = this.clamp(this.withDots ? n : Math.round(n));
        this.value = String(clamped);
        this.syncValidity();
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        if (emitChange)
            this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    bump(dir) {
        if (this.disabled)
            return;
        this.setValue(this.current + dir * this.step);
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
        const empty = this.required && !this.disabled && this.value.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? "Please enter a number." : "";
        if (this.inputEl)
            this.internals.setValidity(validity, message, this.inputEl);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    renderStep(dir) {
        const atLimit = this.value !== "" &&
            (dir === 1 ? this.current >= this.max : this.current <= this.min);
        const cls = `loomi-step ${dir === 1 ? "inc" : "dec"}${this.transparentIcons ? "" : " solid"}`;
        return html `<button
      type="button"
      class=${cls}
      aria-label=${dir === 1 ? "Increment" : "Decrement"}
      ?disabled=${this.disabled || atLimit}
      @click=${() => this.bump(dir)}
    >
      <svg class="loomi-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        ${dir === 1 ? PLUS : MINUS}
      </svg>
    </button>`;
    }
    render() {
        const hasLabel = !!this.label;
        const placeholderAttr = hasLabel ? " " : nothing;
        return html `
      <div class="loomi-field size-${this.size}" part="field">
        ${this.renderStep(-1)}
        <span class="loomi-inputwrap">
          <input
            class="loomi-input"
            part="input"
            type="number"
            inputmode=${this.withDots ? "decimal" : "numeric"}
            .value=${this.value}
            name=${this.name || nothing}
            min=${this.min}
            max=${this.max}
            step=${this.step}
            placeholder=${placeholderAttr}
            ?disabled=${this.disabled}
            ?required=${this.required}
            aria-label=${hasLabel ? this.label : nothing}
            aria-invalid=${this.invalid ? "true" : "false"}
            @input=${this.onInput}
            @change=${this.onChange}
            @blur=${this.showValidation}
          />
          ${hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
        </span>
        ${this.renderStep(1)}
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiNumber.prototype, "name", void 0);
__decorate([
    property()
], LoomiNumber.prototype, "label", void 0);
__decorate([
    property()
], LoomiNumber.prototype, "value", void 0);
__decorate([
    property({ type: Number })
], LoomiNumber.prototype, "min", void 0);
__decorate([
    property({ type: Number })
], LoomiNumber.prototype, "max", void 0);
__decorate([
    property({ type: Number })
], LoomiNumber.prototype, "step", void 0);
__decorate([
    property()
], LoomiNumber.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, attribute: "transparent-icons" })
], LoomiNumber.prototype, "transparentIcons", void 0);
__decorate([
    property({ type: Boolean, attribute: "with-dots" })
], LoomiNumber.prototype, "withDots", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiNumber.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiNumber.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiNumber.prototype, "invalid", void 0);
__decorate([
    query("input")
], LoomiNumber.prototype, "inputEl", void 0);
LoomiNumber = __decorate([
    customElement("loomi-number")
], LoomiNumber);
export { LoomiNumber };
//# sourceMappingURL=loomi-number.js.map