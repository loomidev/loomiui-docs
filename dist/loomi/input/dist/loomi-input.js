var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LoomiElement, loomiT, themeStyles } from "@loomi/core";
import { getLoomiIcon } from "./icons.js";
import { componentStyles } from "./generated/styles.css.js";
const MASK_TOKEN_TESTS = {
    "9": (char) => /[0-9]/.test(char),
    a: (char) => /[A-Za-z]/.test(char),
    "*": () => true,
};
const CREDIT_CARD_MASK = "9999 9999 9999 9999";
const AMEX_CARD_MASK = "9999 999999 99999";
/**
 * `<loomi-input>` — a themeable text input with a floating label, text/icon
 * prefixes & suffixes, password reveal, clearable field, numeric filtering and
 * inline validation. Form-associated: its value submits with the surrounding form.
 *
 * @slot prefix - Custom prefix content (overrides the `prefix`/`prefix-icon` attributes).
 * @slot suffix - Custom suffix content.
 * @csspart field - The bordered field container.
 * @csspart input - The native `<input>`.
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 */
let LoomiInput = class LoomiInput extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.type = "text";
        this.label = "";
        this.locale = "";
        this.placeholder = "";
        this.value = "";
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.numeric = false;
        this.withDots = true;
        this.mask = "";
        this.dynamicMask = "";
        this.min = "";
        this.max = "";
        this.size = "medium";
        this.prefix = "";
        this.suffix = "";
        this.prefixIcon = "";
        this.suffixIcon = "";
        this.transparentPrefix = true;
        this.transparentSuffix = true;
        this.viewable = false;
        this.clearable = false;
        this.errorMessage = "";
        this.showErrorInline = false;
        this.showPlaceholderAlways = false;
        this.invalid = false;
        this.revealed = false;
        this.onInput = (e) => {
            const el = e.target;
            const clean = this.normalizeValue(el.value);
            if (clean !== el.value)
                el.value = clean;
            this.value = el.value;
            if (this.invalid)
                this.validate();
            this.emit("input");
        };
        this.onChange = () => {
            if (this.numeric && this.value !== "") {
                let n = parseFloat(this.value);
                if (!Number.isNaN(n)) {
                    if (this.min !== "" && n < parseFloat(this.min))
                        n = parseFloat(this.min);
                    if (this.max !== "" && n > parseFloat(this.max))
                        n = parseFloat(this.max);
                    this.value = String(n);
                }
            }
            this.emit("change");
        };
    }
    static { this.styles = [themeStyles, componentStyles]; }
    static { this.formAssociated = true; }
    willUpdate(changed) {
        if (changed.has("value") ||
            changed.has("numeric") ||
            changed.has("withDots") ||
            changed.has("mask") ||
            changed.has("dynamicMask")) {
            this.value = this.normalizeValue(this.value);
        }
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    /** Focus the underlying input. */
    focus() {
        this.inputEl?.focus();
    }
    /** Clear the field. */
    clear() {
        this.value = "";
        this.internals.setFormValue("");
        this.emit("input");
        this.emit("change");
        this.focus();
    }
    /** Validate required state; toggles `invalid`. Returns true when valid. */
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
        const empty = this.required && !this.disabled && !this.readonly && this.value.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
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
    emit(type) {
        this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
    }
    sanitizeNumeric(raw) {
        if (!this.numeric)
            return raw;
        let v = raw.replace(this.withDots ? /[^0-9.]/g : /[^0-9]/g, "");
        if (this.withDots) {
            const i = v.indexOf(".");
            if (i !== -1)
                v = v.slice(0, i + 1) + v.slice(i + 1).replace(/\./g, "");
        }
        return v;
    }
    normalizeValue(raw) {
        const clean = this.sanitizeNumeric(raw);
        const mask = this.resolveMask(clean);
        return mask ? this.applyMask(clean, mask) : clean;
    }
    resolveMask(input) {
        if (typeof this.dynamicMask === "function")
            return this.dynamicMask(input);
        if (this.isCreditCardMask(this.dynamicMask) || this.isCreditCardMask(this.mask)) {
            const digits = input.replace(/\D/g, "");
            return digits.startsWith("34") || digits.startsWith("37") ? AMEX_CARD_MASK : CREDIT_CARD_MASK;
        }
        return this.mask;
    }
    isCreditCardMask(mask) {
        return typeof mask === "string" && (mask === "creditcard" || mask === "credit-card");
    }
    applyMask(raw, mask) {
        let result = "";
        let rawIndex = 0;
        for (const maskChar of mask) {
            const tokenTest = MASK_TOKEN_TESTS[maskChar];
            if (!tokenTest) {
                if (raw[rawIndex] === maskChar)
                    rawIndex += 1;
                if (this.hasRemainingTokenInput(raw, rawIndex, mask))
                    result += maskChar;
                continue;
            }
            while (rawIndex < raw.length) {
                const rawChar = raw[rawIndex++];
                if (tokenTest(rawChar)) {
                    result += rawChar;
                    break;
                }
            }
            if (rawIndex >= raw.length)
                break;
        }
        return result;
    }
    hasRemainingTokenInput(raw, startIndex, mask) {
        const tokenTests = Array.from(new Set(mask.split("").map((char) => MASK_TOKEN_TESTS[char]).filter(Boolean)));
        return raw
            .slice(startIndex)
            .split("")
            .some((char) => tokenTests.some((tokenTest) => tokenTest(char)));
    }
    renderIcon(name, cls = "loomi-icon") {
        const path = getLoomiIcon(name);
        if (!path)
            return nothing;
        return html `<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${path}</svg>`;
    }
    renderPrefix() {
        const hasPrefix = this.prefix || this.prefixIcon;
        if (!hasPrefix)
            return nothing;
        const cls = `loomi-prefix${this.transparentPrefix ? "" : " loomi-affix-solid"}`;
        return html `<span class=${cls}>
      <slot name="prefix">${this.prefixIcon ? this.renderIcon(this.prefixIcon) : this.prefix}</slot>
    </span>`;
    }
    renderSuffix() {
        const isPassword = this.type === "password";
        const showReveal = isPassword && this.viewable;
        const showClear = this.clearable && this.value !== "" && !this.disabled && !this.readonly;
        const hasSuffix = this.suffix || this.suffixIcon || showReveal || showClear;
        if (!hasSuffix)
            return nothing;
        const cls = `loomi-suffix${this.transparentSuffix ? "" : " loomi-affix-solid"}`;
        return html `<span class=${cls}>
      ${showClear
            ? html `<button type="button" class="loomi-iconbtn" aria-label=${loomiT("common.clear", {}, this.locale)} @click=${this.clear}>${this.renderIcon("x-circle")}</button>`
            : nothing}
      ${showReveal
            ? html `<button type="button" class="loomi-iconbtn" aria-label=${loomiT("input.togglePassword", {}, this.locale)} @click=${() => (this.revealed = !this.revealed)}>${this.renderIcon(this.revealed ? "eye-slash" : "eye")}</button>`
            : nothing}
      <slot name="suffix">${this.suffixIcon ? this.renderIcon(this.suffixIcon) : this.suffix}</slot>
    </span>`;
    }
    render() {
        const hasLabel = !!this.label;
        const forceFloat = hasLabel && this.showPlaceholderAlways;
        const placeholderAttr = hasLabel && !this.showPlaceholderAlways ? " " : this.placeholder || " ";
        const effType = this.type === "password" && this.revealed ? "text" : this.type;
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        return html `
      <div class="loomi-field size-${this.size} ${forceFloat ? "force-float" : ""}" part="field">
        ${this.renderPrefix()}
        <span class="loomi-inputwrap">
          <input
            class="loomi-input"
            part="input"
            .value=${this.value}
            type=${effType}
            name=${this.name || nothing}
            placeholder=${placeholderAttr}
            inputmode=${this.numeric ? "decimal" : nothing}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
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
        ${this.renderSuffix()}
      </div>
      ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiInput.prototype, "name", void 0);
__decorate([
    property()
], LoomiInput.prototype, "type", void 0);
__decorate([
    property()
], LoomiInput.prototype, "label", void 0);
__decorate([
    property()
], LoomiInput.prototype, "locale", void 0);
__decorate([
    property()
], LoomiInput.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiInput.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiInput.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiInput.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiInput.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean })
], LoomiInput.prototype, "numeric", void 0);
__decorate([
    property({ type: Boolean, attribute: "with-dots" })
], LoomiInput.prototype, "withDots", void 0);
__decorate([
    property()
], LoomiInput.prototype, "mask", void 0);
__decorate([
    property({ attribute: "dynamic-mask" })
], LoomiInput.prototype, "dynamicMask", void 0);
__decorate([
    property()
], LoomiInput.prototype, "min", void 0);
__decorate([
    property()
], LoomiInput.prototype, "max", void 0);
__decorate([
    property()
], LoomiInput.prototype, "size", void 0);
__decorate([
    property()
], LoomiInput.prototype, "prefix", void 0);
__decorate([
    property()
], LoomiInput.prototype, "suffix", void 0);
__decorate([
    property({ attribute: "prefix-icon" })
], LoomiInput.prototype, "prefixIcon", void 0);
__decorate([
    property({ attribute: "suffix-icon" })
], LoomiInput.prototype, "suffixIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "transparent-prefix" })
], LoomiInput.prototype, "transparentPrefix", void 0);
__decorate([
    property({ type: Boolean, attribute: "transparent-suffix" })
], LoomiInput.prototype, "transparentSuffix", void 0);
__decorate([
    property({ type: Boolean })
], LoomiInput.prototype, "viewable", void 0);
__decorate([
    property({ type: Boolean })
], LoomiInput.prototype, "clearable", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiInput.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiInput.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-placeholder-always" })
], LoomiInput.prototype, "showPlaceholderAlways", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiInput.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiInput.prototype, "revealed", void 0);
__decorate([
    query("input")
], LoomiInput.prototype, "inputEl", void 0);
LoomiInput = __decorate([
    customElement("loomi-input")
], LoomiInput);
export { LoomiInput };
//# sourceMappingURL=loomi-input.js.map