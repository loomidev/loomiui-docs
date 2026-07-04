var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state, queryAll } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import { showLoomiNotification } from "@loomidev/notification";
import { componentStyles } from "./generated/styles.css.js";
const DEFAULT_ERROR_MESSAGE = "Verification code is invalid";
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />`;
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
        /** Falls back to a stable per-instance id when `name` is blank, so a `loomi-notification` toast (see `showError`) re-renders in place across repeated validation failures instead of stacking. */
        this.instanceId = Math.random().toString(36).slice(2, 8);
        this.name = "";
        this.label = "";
        this.totalDigits = 4;
        this.size = "small";
        this.separator = false;
        this.hideDigits = false;
        this.mask = false;
        this.errorMessage = DEFAULT_ERROR_MESSAGE;
        this.showErrorInline = false;
        this.locale = "";
        this.invalid = false;
        /** Show a spinner in place of the (empty) status slot while an async check is in flight. */
        this.validating = false;
        /** Show a green checkmark once an async check has passed. */
        this.valid = false;
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
        this.resetValidationState();
        this.updateComplete.then(() => this.boxes[0]?.focus());
    }
    /** Show a spinner in the status slot while an async validation call is in flight. */
    startValidating() {
        this.invalid = false;
        this.valid = false;
        this.validating = true;
    }
    /** Show a green checkmark in the status slot once an async validation call passed. */
    showSuccess() {
        this.invalid = false;
        this.validating = false;
        this.valid = true;
    }
    /**
     * Show the error state: every box border turns red (regardless of `error-message`) and,
     * on the valid→invalid transition, `error-message` (or `message`, if passed) surfaces —
     * inline below the boxes when `show-error-inline` is set, otherwise as a
     * `loomi-notification` toast. Pass `message` to override `error-message` for this call.
     */
    showError(message) {
        if (message !== undefined)
            this.errorMessage = message;
        const wasInvalid = this.invalid;
        this.validating = false;
        this.valid = false;
        this.invalid = true;
        if (!wasInvalid && !this.showErrorInline && this.errorMessage) {
            showLoomiNotification(this.label, this.resolvedErrorMessage(), "error", undefined, `loomi-pin-validation-${this.name || this.instanceId}`);
        }
    }
    resetValidationState() {
        this.invalid = false;
        this.valid = false;
        this.validating = false;
    }
    resolvedErrorMessage() {
        return loomiDefaultText(this.errorMessage, DEFAULT_ERROR_MESSAGE, "pin.errorMessage", this.locale);
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
        aria-invalid=${this.invalid ? "true" : "false"}
        ?disabled=${this.validating}
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
        if (this.invalid || this.valid || this.validating)
            this.resetValidationState();
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
    renderStatus() {
        if (this.validating) {
            return html `<span class="loomi-status is-validating" role="status" aria-label=${loomiT("pin.validating", {}, this.locale)}>
        <svg class="loomi-status-icon loomi-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25"></circle>
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
        </svg>
      </span>`;
        }
        if (this.valid) {
            return html `<span class="loomi-status is-valid" role="status" aria-label=${loomiT("pin.valid", {}, this.locale)}>
        <svg class="loomi-status-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">${CHECK}</svg>
      </span>`;
        }
        return nothing;
    }
    render() {
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        return html `<div class="loomi-pin size-${this.size}" @paste=${(e) => this.onPaste(e)}>
      ${Array.from({ length: this.totalDigits }, (_, i) => html `
        ${this.renderBox(i)}
        ${this.separator && this.totalDigits > 1 && i === this.separatorIndex - 1 ? html `<span class="loomi-separator" aria-hidden="true">-</span>` : nothing}
      `)}
      ${this.renderStatus()}
    </div>
    ${showError ? html `<p class="loomi-error">${this.resolvedErrorMessage()}</p>` : nothing}`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiPin.prototype, "name", void 0);
__decorate([
    property()
], LoomiPin.prototype, "label", void 0);
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
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiPin.prototype, "showErrorInline", void 0);
__decorate([
    property()
], LoomiPin.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPin.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPin.prototype, "validating", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPin.prototype, "valid", void 0);
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