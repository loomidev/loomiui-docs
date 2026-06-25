var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property, state, queryAll } from "lit/decorators.js";
import { loomiStyles } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-code>` — a verification-code (PIN) input of N boxes. Form-associated: submits
 * the joined code under `name`.
 *
 * @fires verify - `detail: { code }` when the last box is filled.
 */
let LoomiCode = class LoomiCode extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.totalDigits = 4;
        this.size = "small";
        this.mask = false;
        this.errorMessage = "Verification code is invalid";
        this.invalid = false;
        this.digits = [];
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    connectedCallback() {
        super.connectedCallback();
        this.digits = Array(this.totalDigits).fill("");
    }
    /** The current code. */
    get code() {
        return this.digits.join("");
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
        this.internals.setFormValue(this.code);
        if (this.code.length === this.totalDigits) {
            this.dispatchEvent(new CustomEvent("verify", { bubbles: true, composed: true, detail: { code: this.code } }));
        }
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
        return html `<div class="loomi-code size-${this.size}" @paste=${(e) => this.onPaste(e)}>
      ${Array.from({ length: this.totalDigits }, (_, i) => html `<input
        class="loomi-box"
        type=${this.mask ? "password" : "text"}
        inputmode="numeric"
        maxlength="1"
        aria-label="Digit ${i + 1}"
        .value=${this.digits[i] ?? ""}
        @input=${(e) => this.onInput(i, e)}
        @keydown=${(e) => this.onKeydown(i, e)}
      />`)}
    </div>
    ${this.invalid ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiCode.prototype, "name", void 0);
__decorate([
    property({ type: Number, attribute: "total-digits" })
], LoomiCode.prototype, "totalDigits", void 0);
__decorate([
    property()
], LoomiCode.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], LoomiCode.prototype, "mask", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiCode.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCode.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiCode.prototype, "digits", void 0);
__decorate([
    queryAll("input")
], LoomiCode.prototype, "boxes", void 0);
LoomiCode = __decorate([
    customElement("loomi-code")
], LoomiCode);
export { LoomiCode };
//# sourceMappingURL=loomi-code.js.map