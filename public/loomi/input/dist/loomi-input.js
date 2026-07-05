var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { unsafeHTML } from "lit/directives/unsafe-html.js";
import { LoomiElement, loomiT, themeStyles } from "@loomidev/core";
import { showLoomiNotification } from "@loomidev/notification";
import "@loomidev/popover";
import { getLoomiIcon } from "./icons.js";
import { componentStyles } from "./generated/styles.css.js";
const MASK_TOKEN_TESTS = {
    "9": (char) => /[0-9]/.test(char),
    a: (char) => /[A-Za-z]/.test(char),
    "*": () => true,
};
const CREDIT_CARD_MASK = "9999 9999 9999 9999";
const AMEX_CARD_MASK = "9999 999999 99999";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/**
 * `<loomi-input>` — a themeable text input with a floating label, text/icon
 * prefixes & suffixes, contextual hints, clearable field, numeric filtering and
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
        /** Falls back to a stable per-instance id when `name` is blank, so a `loomi-notification` toast (see `syncValidity`) re-renders in place across repeated validation failures instead of stacking. */
        this.instanceId = Math.random().toString(36).slice(2, 8);
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
        this.variant = "default";
        this.prefix = "";
        this.suffix = "";
        this.prefixOptions = "";
        this.suffixOptions = "";
        this.prefixValue = "";
        this.suffixValue = "";
        this.prefixIcon = "";
        this.suffixIcon = "";
        this.transparentPrefix = true;
        this.transparentSuffix = true;
        this.viewable = false;
        this.clearable = false;
        this.hint = "";
        this.errorMessage = "";
        this.showErrorInline = false;
        this.showPlaceholderAlways = false;
        this.showFocusRing = true;
        this.invalid = false;
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
    /**
     * Run the required-field check right now, independent of blur. Sets the reflected
     * `invalid` attribute to match — which drives the red field border in CSS regardless of
     * whether `error-message` is set — and, when it just became invalid, surfaces
     * `error-message` (if any): inline below the field when `show-error-inline` is set,
     * otherwise as a `loomi-notification` toast. Returns `true` when the field passes (or
     * isn't `required`), `false` otherwise. Call this yourself before a manual submit or API
     * call; a `blur` on the field already triggers the same check automatically.
     */
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
        const wasInvalid = this.invalid;
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
        if (this.inputEl)
            this.internals.setValidity(validity, message, this.inputEl);
        else
            this.internals.setValidity(validity, message);
        // Inline display (`.loomi-error`, in render()) only covers `show-error-inline`. When
        // it's off, surface the same message as a toast instead of silently dropping it — only
        // on the valid→invalid transition, so re-validating while already invalid (e.g. typing
        // into an empty required field) doesn't spam a new toast on every keystroke.
        if (this.invalid && !wasInvalid && !this.showErrorInline && this.errorMessage) {
            showLoomiNotification(this.label, this.errorMessage, "error", undefined, `loomi-input-validation-${this.name || this.instanceId}`);
        }
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
    parseOptions(options) {
        const trimmed = options.trim();
        if (!trimmed)
            return [];
        if (trimmed.startsWith("[")) {
            try {
                const parsed = JSON.parse(trimmed);
                if (Array.isArray(parsed))
                    return parsed.map((option) => String(option).trim()).filter(Boolean);
            }
            catch {
                // Fall through to simple delimited parsing.
            }
        }
        return trimmed
            .split(/[|,]/)
            .map((option) => option.trim())
            .filter(Boolean);
    }
    selectedAffix(kind, options) {
        const explicit = kind === "prefix" ? this.prefixValue : this.suffixValue;
        const text = kind === "prefix" ? this.prefix : this.suffix;
        return explicit || text || options[0] || "";
    }
    onAffixChange(kind, e) {
        const value = e.target.value;
        if (kind === "prefix") {
            this.prefixValue = value;
            this.prefix = value;
        }
        else {
            this.suffixValue = value;
            this.suffix = value;
        }
        this.dispatchEvent(new CustomEvent(`${kind}-change`, {
            detail: { value },
            bubbles: true,
            composed: true,
        }));
    }
    renderAffixSelect(kind, options) {
        const value = this.selectedAffix(kind, options);
        return html `<select class="loomi-affix-select" .value=${value} aria-label=${kind} @change=${(e) => this.onAffixChange(kind, e)}>
      ${options.map((option) => html `<option value=${option} ?selected=${option === value}>${option}</option>`)}
    </select>`;
    }
    hintKey() {
        const value = this.hint.trim();
        return value.endsWith(".html") ? value.slice(0, -5) : value.replace(/^#/, "");
    }
    escapeSelector(value) {
        return globalThis.CSS?.escape ? globalThis.CSS.escape(value) : value.replace(/["\\]/g, "\\$&");
    }
    hintSourceHtml() {
        const key = this.hintKey();
        if (!key)
            return undefined;
        const source = document.querySelector(`[data-hint="${this.escapeSelector(key)}"]`);
        return source?.innerHTML;
    }
    renderHint() {
        if (!this.hint.trim())
            return nothing;
        const helpIcon = this.renderIcon("help-circle");
        const sourceHtml = this.hintSourceHtml();
        return html `<loomi-popover class="loomi-hint-popover" placement="top" .width=${280}>
      <button type="button" slot="trigger" class="loomi-iconbtn" aria-label="Show hint">
        ${helpIcon === nothing ? this.renderIcon("information-circle") : helpIcon}
      </button>
      <span class="loomi-hint-content">${sourceHtml === undefined ? this.hint : unsafeHTML(sourceHtml)}</span>
    </loomi-popover>`;
    }
    renderPrefix() {
        const options = this.parseOptions(this.prefixOptions);
        const hasPrefix = this.prefix || this.prefixIcon || options.length > 0;
        if (!hasPrefix)
            return nothing;
        const cls = `loomi-prefix${this.transparentPrefix ? "" : " loomi-affix-solid"}`;
        return html `<span class=${cls}>
      <slot name="prefix">${options.length > 0 ? this.renderAffixSelect("prefix", options) : this.prefixIcon ? this.renderIcon(this.prefixIcon) : this.prefix}</slot>
    </span>`;
    }
    renderSuffix() {
        const options = this.parseOptions(this.suffixOptions);
        const showClear = this.clearable && this.value !== "" && !this.disabled && !this.readonly;
        const hasSuffix = this.suffix || this.suffixIcon || options.length > 0 || showClear || this.hint;
        if (!hasSuffix)
            return nothing;
        const cls = `loomi-suffix${this.transparentSuffix ? "" : " loomi-affix-solid"}`;
        return html `<span class=${cls}>
      ${showClear
            ? html `<button type="button" class="loomi-iconbtn" aria-label=${loomiT("common.clear", {}, this.locale)} @click=${this.clear}>${this.renderIcon("x-circle")}</button>`
            : nothing}
      <slot name="suffix">${options.length > 0 ? this.renderAffixSelect("suffix", options) : this.suffixIcon ? this.renderIcon(this.suffixIcon) : this.suffix}</slot>
      ${this.renderHint()}
    </span>`;
    }
    render() {
        const hasLabel = !!this.label;
        const hasPrefix = !!(this.prefix || this.prefixIcon || this.parseOptions(this.prefixOptions).length > 0);
        const forceFloat = hasLabel && this.showPlaceholderAlways;
        const placeholderAttr = hasLabel && !this.showPlaceholderAlways ? " " : this.placeholder || " ";
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        return html `
      <div class="loomi-field size-${this.size} variant-${this.variant} ${forceFloat ? "force-float" : ""} ${this.showFocusRing ? "" : "no-focus-ring"}" part="field">
        ${hasLabel && hasPrefix
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
        ${this.renderPrefix()}
        <span class="loomi-inputwrap">
          <input
            class="loomi-input"
            part="input"
            .value=${this.value}
            type=${this.type}
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
          ${hasLabel && !hasPrefix
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
], LoomiInput.prototype, "variant", void 0);
__decorate([
    property()
], LoomiInput.prototype, "prefix", void 0);
__decorate([
    property()
], LoomiInput.prototype, "suffix", void 0);
__decorate([
    property({ attribute: "prefix-options" })
], LoomiInput.prototype, "prefixOptions", void 0);
__decorate([
    property({ attribute: "suffix-options" })
], LoomiInput.prototype, "suffixOptions", void 0);
__decorate([
    property({ attribute: "prefix-value" })
], LoomiInput.prototype, "prefixValue", void 0);
__decorate([
    property({ attribute: "suffix-value" })
], LoomiInput.prototype, "suffixValue", void 0);
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
    property()
], LoomiInput.prototype, "hint", void 0);
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
    property({ type: Boolean, attribute: "show-focus-ring", converter: booleanAttribute })
], LoomiInput.prototype, "showFocusRing", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiInput.prototype, "invalid", void 0);
__decorate([
    query("input")
], LoomiInput.prototype, "inputEl", void 0);
LoomiInput = __decorate([
    customElement("loomi-input")
], LoomiInput);
export { LoomiInput };
//# sourceMappingURL=loomi-input.js.map