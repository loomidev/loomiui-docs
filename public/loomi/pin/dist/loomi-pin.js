var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state, queryAll } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const DEFAULT_ERROR_MESSAGE = "Verification code is invalid";
/**
 * `<loomi-pin>` — a verification-code (PIN) input of N boxes. Form-associated: submits
 * the joined PIN under `name`.
 *
 * @fires verify - `detail: { pin, code }` when the last box is filled.
 */
let LoomiPin = class LoomiPin extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.totalDigits = 4;
        this.size = "small";
        this.separator = false;
        this.hideDigits = false;
        this.mask = false;
        this.errorMessage = DEFAULT_ERROR_MESSAGE;
        this.locale = "";
        this.invalid = false;
        this.digits = [];
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    connectedCallback() {
        super.connectedCallback();
        this.digits = Array(this.totalDigits).fill("");
    }
    /** The current PIN. */
    get pin() {
        return this.digits.join("");
    }
    /** @deprecated Use `pin` instead. */
    get code() {
        return this.pin;
    }
    /** Clear all boxes and focus the first. */
    clear() {
        this.digits = Array(this.totalDigits).fill("");
        this.internals.setFormValue("");
        this.invalid = false;
        this.updateComplete.then(() => this.boxes[0]?.focus());
    }
    /** Show the error state. */
    showError() {
        this.invalid = true;
    }
    commit() {
        this.internals.setFormValue(this.pin);
        if (this.pin.length === this.totalDigits) {
            this.dispatchEvent(new CustomEvent("verify", { bubbles: true, composed: true, detail: { pin: this.pin, code: this.pin } }));
        }
    }
    get masked() {
        return this.mask || this.hideDigits;
    }
    get separatorIndex() {
        return Math.floor(this.totalDigits / 2);
    }
    renderBox(i) {
        const value = this.digits[i] ?? "";
        return html `<span class="loomi-box-wrap">
      <input
        class="loomi-box ${this.masked && value ? "is-masked" : ""}"
        type="text"
        inputmode="numeric"
        maxlength="1"
        aria-label=${loomiT("pin.digitLabel", { number: i + 1 }, this.locale)}
        .value=${value}
        @input=${(e) => this.onInput(i, e)}
        @keydown=${(e) => this.onKeydown(i, e)}
      />
      ${this.masked && value ? html `<span class="loomi-dot" aria-hidden="true"></span>` : nothing}
    </span>`;
    }
    onInput(i, e) {
        const input = e.target;
        const ch = input.value.replace(/\D/g, "").slice(-1);
        const next = [...this.digits];
        next[i] = ch;
        this.digits = next;
        if (this.invalid)
            this.invalid = false;
        if (ch && i < this.totalDigits - 1)
            this.boxes[i + 1]?.focus();
        this.commit();
    }
    onKeydown(i, e) {
        if (e.key === "Backspace" && !this.digits[i] && i > 0)
            this.boxes[i - 1]?.focus();
    }
    onPaste(e) {
        e.preventDefault();
        const text = (e.clipboardData?.getData("text") ?? "").replace(/\D/g, "").slice(0, this.totalDigits);
        if (!text)
            return;
        const next = Array(this.totalDigits).fill("");
        for (let i = 0; i < text.length; i++)
            next[i] = text[i];
        this.digits = next;
        this.commit();
        this.updateComplete.then(() => this.boxes[Math.min(text.length, this.totalDigits - 1)]?.focus());
    }
    render() {
        return html `<div class="loomi-pin size-${this.size}" @paste=${(e) => this.onPaste(e)}>
      ${Array.from({ length: this.totalDigits }, (_, i) => html `
        ${this.renderBox(i)}
        ${this.separator && this.totalDigits > 1 && i === this.separatorIndex - 1 ? html `<span class="loomi-separator" aria-hidden="true">-</span>` : nothing}
      `)}
    </div>
    ${this.invalid ? html `<p class="loomi-error">${loomiDefaultText(this.errorMessage, DEFAULT_ERROR_MESSAGE, "pin.errorMessage", this.locale)}</p>` : nothing}`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiPin.prototype, "name", void 0);
__decorate([
    property({ type: Number, attribute: "total-digits" })
], LoomiPin.prototype, "totalDigits", void 0);
__decorate([
    property()
], LoomiPin.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPin.prototype, "separator", void 0);
__decorate([
    property({ type: Boolean, attribute: "hide-digits" })
], LoomiPin.prototype, "hideDigits", void 0);
__decorate([
    property({ type: Boolean })
], LoomiPin.prototype, "mask", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiPin.prototype, "errorMessage", void 0);
__decorate([
    property()
], LoomiPin.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPin.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiPin.prototype, "digits", void 0);
__decorate([
    queryAll("input")
], LoomiPin.prototype, "boxes", void 0);
LoomiPin = __decorate([
    customElement("loomi-pin")
], LoomiPin);
export { LoomiPin };
//# sourceMappingURL=loomi-pin.js.map