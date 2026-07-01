var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { LoomiElement, accentVars, isLoomiColor, loomiStyles, loomiT } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
import { detectCardBrand, LOOMI_CARD_BRAND_CVC_LENGTH, LOOMI_CARD_BRAND_GROUPS, LOOMI_CARD_BRAND_ICONS, LOOMI_CARD_BRAND_LENGTH, } from "./brand-icons.js";
const CONTACTLESS = svg `
  <circle cx="5" cy="19" r="1.4" fill="currentColor" />
  <path d="M5 15a4 4 0 0 1 4 4" stroke-linecap="round" />
  <path d="M5 11a8 8 0 0 1 8 8" stroke-linecap="round" />
  <path d="M5 7a12 12 0 0 1 12 12" stroke-linecap="round" />
`;
const FLIP_ICON = svg `
  <path stroke-linecap="round" stroke-linejoin="round" d="M4 9a8 8 0 0 1 14-4M20 4v5h-5" />
  <path stroke-linecap="round" stroke-linejoin="round" d="M20 15a8 8 0 0 1-14 4M4 20v-5h5" />
`;
function digitsOnly(raw) {
    return raw.replace(/\D/g, "");
}
function formatCardNumber(digits, brand) {
    const groups = LOOMI_CARD_BRAND_GROUPS[brand];
    const max = LOOMI_CARD_BRAND_LENGTH[brand];
    const clipped = digits.slice(0, max);
    const parts = [];
    let i = 0;
    for (const size of groups) {
        if (i >= clipped.length)
            break;
        parts.push(clipped.slice(i, i + size));
        i += size;
    }
    return parts.join(" ");
}
/** Parses a live "MM/YY"-ish input string into clamped month/year digit pairs. Single-digit
 * months of 2–9 auto-pad to `"0X"` immediately (typing "7" jumps to "07/") — the same UX
 * every major checkout form's expiry field uses, since no valid month's first digit is >1. */
function normalizeExpiryDigits(raw) {
    let digits = digitsOnly(raw).slice(0, 4);
    if (digits.length === 1 && Number(digits) > 1)
        digits = `0${digits}`;
    let month = digits.slice(0, 2);
    const year = digits.slice(2, 4);
    if (month.length === 2) {
        let n = Number(month);
        if (n < 1)
            n = 1;
        if (n > 12)
            n = 12;
        month = String(n).padStart(2, "0");
    }
    return { month, year };
}
function formatExpiryDisplay(month, year) {
    if (!month)
        return "";
    return month.length === 2 ? `${month}/${year}` : month;
}
/**
 * `<loomi-creditcard>` — a flippable credit-card input. The front face holds the number,
 * cardholder name, and expiry; click (or tap) the edge button to flip to the back and enter
 * the CVC. The network logo (Visa, Mastercard, Amex, Discover, Diners Club, JCB, UnionPay,
 * Maestro) is detected live from the number's IIN/BIN prefix and shown on both faces; a
 * contactless-payment glyph sits in the front's top-right corner.
 *
 * Not form-associated by design — card data is sensitive and typically handed to a
 * tokenization SDK rather than posted via a plain HTML form. Read the current state from
 * the `value` getter, or listen for `input`/`change`.
 *
 * @csspart front - The front face.
 * @csspart back - The back face.
 * @csspart number - The card-number `<input>`.
 * @csspart name - The cardholder-name `<input>`.
 * @csspart expiry - The expiry `<input>`.
 * @csspart cvc - The CVC `<input>`.
 * @csspart flip-button - The button that flips the card.
 * @fires input - Fired on every keystroke in any field. `detail` is the current `value`.
 * @fires change - Fired on blur/commit of any field. `detail` is the current `value`.
 * @fires flip - `detail: { flipped }` when the card flips.
 */
let LoomiCreditcard = class LoomiCreditcard extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.cardholderName = "";
        this.number = "";
        this.expiryMonth = "";
        this.expiryYear = "";
        this.cvc = "";
        /** Force a specific network logo instead of auto-detecting it from `number`. Leave unset to auto-detect. */
        this.brand = "";
        this.color = "primary";
        this.locale = "";
        this.flipped = false;
        this.disabled = false;
        this.readonly = false;
        this.required = false;
        this.errorMessage = "";
        this.showErrorInline = false;
        this.invalid = false;
        this.validationVisible = false;
        this.onKeydown = (e) => {
            if (e.key === "Escape" && this.flipped)
                this.toggleFlip();
        };
        this.onNumberInput = (e) => {
            const el = e.target;
            const digits = digitsOnly(el.value);
            const brand = this.brand || detectCardBrand(digits);
            const formatted = formatCardNumber(digits, brand);
            this.number = formatted;
            if (el.value !== formatted)
                el.value = formatted;
            if (this.invalid)
                this.syncValidity();
            this.emit("input");
        };
        this.onNameInput = (e) => {
            this.cardholderName = e.target.value;
            if (this.invalid)
                this.syncValidity();
            this.emit("input");
        };
        this.onExpiryInput = (e) => {
            const el = e.target;
            const { month, year } = normalizeExpiryDigits(el.value);
            this.expiryMonth = month;
            this.expiryYear = year;
            const display = formatExpiryDisplay(month, year);
            if (el.value !== display)
                el.value = display;
            if (this.invalid)
                this.syncValidity();
            this.emit("input");
        };
        this.onCvcInput = (e) => {
            const el = e.target;
            const max = LOOMI_CARD_BRAND_CVC_LENGTH[this.activeBrand];
            const digits = digitsOnly(el.value).slice(0, max);
            this.cvc = digits;
            if (el.value !== digits)
                el.value = digits;
            if (this.invalid)
                this.syncValidity();
            this.emit("input");
        };
        this.onFieldBlur = () => {
            this.showValidation();
            this.emit("change");
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    /** Keeps `number` in its grouped display form even when set via attribute/property
     * (not just while typing) — e.g. `<loomi-creditcard number="4242...">` renders grouped. */
    willUpdate(changed) {
        if (changed.has("number") || changed.has("brand")) {
            const brand = this.brand || detectCardBrand(digitsOnly(this.number));
            this.number = formatCardNumber(digitsOnly(this.number), brand);
        }
    }
    get accentColor() {
        return isLoomiColor(this.color) ? this.color : "primary";
    }
    /** The currently displayed network — `brand` if explicitly set, otherwise auto-detected from `number`. */
    get activeBrand() {
        if (this.brand)
            return this.brand;
        return detectCardBrand(digitsOnly(this.number));
    }
    get value() {
        return {
            number: this.number,
            numberDigits: digitsOnly(this.number),
            cardholderName: this.cardholderName,
            expiryMonth: this.expiryMonth,
            expiryYear: this.expiryYear,
            cvc: this.cvc,
            brand: this.activeBrand,
        };
    }
    get expired() {
        if (this.expiryMonth.length !== 2 || this.expiryYear.length !== 2)
            return false;
        return !this.isExpiryValid();
    }
    isExpiryValid() {
        if (this.expiryMonth.length !== 2 || this.expiryYear.length !== 2)
            return false;
        const month = Number(this.expiryMonth);
        if (month < 1 || month > 12)
            return false;
        const year = 2000 + Number(this.expiryYear);
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        if (year < currentYear)
            return false;
        if (year === currentYear && month < currentMonth)
            return false;
        return true;
    }
    /** Re-validates and, if invalid, switches the inline error on. Returns whether the current value is complete and valid. */
    validate() {
        this.validationVisible = true;
        return this.syncValidity(true);
    }
    syncValidity(showInvalid = this.validationVisible) {
        if (!this.required) {
            this.invalid = false;
            return true;
        }
        const numberComplete = digitsOnly(this.number).length === LOOMI_CARD_BRAND_LENGTH[this.activeBrand]
            || (this.activeBrand === "unknown" && digitsOnly(this.number).length >= 12);
        const cvcComplete = this.cvc.length === LOOMI_CARD_BRAND_CVC_LENGTH[this.activeBrand];
        const valid = numberComplete && this.cardholderName.trim() !== "" && this.isExpiryValid() && cvcComplete;
        this.invalid = !valid && showInvalid;
        return valid;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    emit(type) {
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true, detail: this.value }));
    }
    toggleFlip() {
        if (this.disabled)
            return;
        this.flipped = !this.flipped;
        this.dispatchEvent(new CustomEvent("flip", { bubbles: true, composed: true, detail: { flipped: this.flipped } }));
        void this.updateComplete.then(() => {
            if (this.flipped)
                this.cvcInputEl?.focus();
            else
                this.numberInputEl?.focus();
        });
    }
    renderBrand(extraClass) {
        const brand = this.activeBrand;
        if (brand === "unknown")
            return nothing;
        return html `<span class="loomi-cc-brand ${extraClass}" aria-hidden="true">${unsafeSVG(LOOMI_CARD_BRAND_ICONS[brand])}</span>`;
    }
    renderFront() {
        return html `
      <div class="loomi-cc-face loomi-cc-front" part="front" ?inert=${this.flipped}>
        <div class="loomi-cc-top">
          <svg class="loomi-cc-contactless" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${CONTACTLESS}</svg>
        </div>
        <div class="loomi-cc-chip" aria-hidden="true"></div>
        <input
          class="loomi-cc-number"
          part="number"
          type="text"
          inputmode="numeric"
          autocomplete="cc-number"
          aria-label=${loomiT("creditcard.numberLabel", {}, this.locale)}
          placeholder="•••• •••• •••• ••••"
          .value=${this.number}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          @input=${this.onNumberInput}
          @blur=${this.onFieldBlur}
        />
        <div class="loomi-cc-bottom">
          <label class="loomi-cc-field loomi-cc-name-field">
            <span class="loomi-cc-field-label">${loomiT("creditcard.cardholderLabel", {}, this.locale)}</span>
            <input
              class="loomi-cc-name"
              part="name"
              type="text"
              autocomplete="cc-name"
              placeholder=${loomiT("creditcard.namePlaceholder", {}, this.locale)}
              .value=${this.cardholderName}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @input=${this.onNameInput}
              @blur=${this.onFieldBlur}
            />
          </label>
          <label class="loomi-cc-field loomi-cc-expiry-field">
            <span class="loomi-cc-field-label">${loomiT("creditcard.expiresLabel", {}, this.locale)}</span>
            <input
              class="loomi-cc-expiry ${this.expired ? "expired" : ""}"
              part="expiry"
              type="text"
              inputmode="numeric"
              autocomplete="cc-exp"
              placeholder="MM/YY"
              maxlength="5"
              .value=${formatExpiryDisplay(this.expiryMonth, this.expiryYear)}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @input=${this.onExpiryInput}
              @blur=${this.onFieldBlur}
            />
          </label>
        </div>
        ${this.renderBrand("front-brand")}
      </div>
    `;
    }
    renderBack() {
        return html `
      <div class="loomi-cc-face loomi-cc-back" part="back" ?inert=${!this.flipped}>
        <div class="loomi-cc-stripe" aria-hidden="true"></div>
        <div class="loomi-cc-signature-row">
          <div class="loomi-cc-signature" aria-hidden="true"></div>
          <div class="loomi-cc-cvc-box">
            <input
              class="loomi-cc-cvc"
              part="cvc"
              type="password"
              inputmode="numeric"
              autocomplete="cc-csc"
              aria-label=${loomiT("creditcard.cvcLabel", {}, this.locale)}
              placeholder="•••"
              maxlength=${LOOMI_CARD_BRAND_CVC_LENGTH[this.activeBrand]}
              .value=${this.cvc}
              ?disabled=${this.disabled}
              ?readonly=${this.readonly}
              @input=${this.onCvcInput}
              @blur=${this.onFieldBlur}
            />
          </div>
        </div>
        ${this.renderBrand("back-brand")}
      </div>
    `;
    }
    render() {
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        const flipLabel = loomiT(this.flipped ? "creditcard.flipToFront" : "creditcard.flipToBack", {}, this.locale);
        return html `
      <div class="loomi-creditcard" style=${accentVars(this.accentColor)} @keydown=${this.onKeydown}>
        <div class="loomi-cc-scene">
          <div class="loomi-cc-inner ${this.flipped ? "flipped" : ""}">
            ${this.renderFront()}
            ${this.renderBack()}
          </div>
          <button
            type="button"
            class="loomi-cc-flip-btn"
            part="flip-button"
            aria-label=${flipLabel}
            ?disabled=${this.disabled}
            @click=${() => this.toggleFlip()}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${FLIP_ICON}</svg>
          </button>
        </div>
        ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiCreditcard.prototype, "name", void 0);
__decorate([
    property({ attribute: "cardholder-name" })
], LoomiCreditcard.prototype, "cardholderName", void 0);
__decorate([
    property()
], LoomiCreditcard.prototype, "number", void 0);
__decorate([
    property({ attribute: "expiry-month" })
], LoomiCreditcard.prototype, "expiryMonth", void 0);
__decorate([
    property({ attribute: "expiry-year" })
], LoomiCreditcard.prototype, "expiryYear", void 0);
__decorate([
    property()
], LoomiCreditcard.prototype, "cvc", void 0);
__decorate([
    property()
], LoomiCreditcard.prototype, "brand", void 0);
__decorate([
    property()
], LoomiCreditcard.prototype, "color", void 0);
__decorate([
    property()
], LoomiCreditcard.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCreditcard.prototype, "flipped", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCreditcard.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCreditcard.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCreditcard.prototype, "required", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiCreditcard.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiCreditcard.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCreditcard.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiCreditcard.prototype, "validationVisible", void 0);
__decorate([
    query(".loomi-cc-number")
], LoomiCreditcard.prototype, "numberInputEl", void 0);
__decorate([
    query(".loomi-cc-cvc")
], LoomiCreditcard.prototype, "cvcInputEl", void 0);
LoomiCreditcard = __decorate([
    customElement("loomi-creditcard")
], LoomiCreditcard);
export { LoomiCreditcard };
//# sourceMappingURL=loomi-creditcard.js.map