var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiT, themeStyles } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { showLoomiNotification } from "@loomidev/notification";
import { componentStyles } from "./generated/styles.css.js";
const STRENGTH_ORDER = ["A", "a", "1", "#"];
/**
 * `<loomi-password>` — a form-associated password input with reveal, prefixes,
 * inline validation and neutral strength requirements.
 *
 * @slot prefix - Custom prefix content (overrides the `prefix`/`prefix-icon` attributes).
 * @csspart field - The bordered field container.
 * @csspart input - The native `<input>`.
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 */
let LoomiPassword = class LoomiPassword extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.instanceId = Math.random().toString(36).slice(2, 8);
        this.name = "";
        this.label = "";
        this.locale = "";
        this.placeholder = "";
        this.value = "";
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.size = "medium";
        this.prefix = "";
        this.prefixOptions = "";
        this.prefixValue = "";
        this.prefixIcon = "";
        this.transparentPrefix = true;
        this.viewable = true;
        this.clearable = false;
        this.strength = "";
        this.errorMessage = "";
        this.showErrorInline = false;
        this.showPlaceholderAlways = false;
        this.invalid = false;
        this.revealed = false;
        this.prefixOpen = false;
        this.onDocClick = (e) => {
            if (this.prefixOpen && !e.composedPath().includes(this))
                this.prefixOpen = false;
        };
        this.onInput = (e) => {
            this.value = e.target.value;
            if (this.invalid)
                this.validate();
            this.emit("input");
        };
        this.onChange = () => {
            this.emit("change");
        };
        this.onPrefixTriggerKeydown = (e) => {
            if (e.key === "Escape")
                this.prefixOpen = false;
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
    willUpdate(_changed) {
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    focus() {
        this.inputEl?.focus();
    }
    clear() {
        this.value = "";
        this.internals.setFormValue("");
        this.emit("input");
        this.emit("change");
        this.focus();
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
        const empty = this.required && !this.disabled && !this.readonly && this.value.trim() === "";
        const weak = !empty && !this.disabled && !this.readonly && this.strengthRequirements().some((requirement) => !requirement.met);
        const wasInvalid = this.invalid;
        this.invalid = (empty || weak) && showInvalid;
        const validity = empty ? { valueMissing: true } : weak ? { customError: true } : {};
        const message = empty
            ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale)
            : weak
                ? this.errorMessage || "Password does not meet the strength requirements."
                : "";
        if (this.inputEl)
            this.internals.setValidity(validity, message, this.inputEl);
        else
            this.internals.setValidity(validity, message);
        if (this.invalid && !wasInvalid && !this.showErrorInline && message) {
            showLoomiNotification(this.label, message, "error", undefined, `loomi-password-validation-${this.name || this.instanceId}`);
        }
        return !empty && !weak;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    emit(type) {
        this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
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
    selectedPrefix(options) {
        return this.prefixValue || this.prefix || options[0] || "";
    }
    togglePrefixOpen() {
        if (this.disabled || this.readonly)
            return;
        this.prefixOpen = !this.prefixOpen;
    }
    choosePrefix(value) {
        this.prefixValue = value;
        this.prefix = value;
        this.prefixOpen = false;
        this.dispatchEvent(new CustomEvent("prefix-change", { detail: { value }, bubbles: true, composed: true }));
    }
    renderPrefixDropdown(options) {
        const value = this.selectedPrefix(options);
        return html `<span class="loomi-affix-dropdown ${this.prefixOpen ? "open" : ""}">
      <button
        type="button"
        class="loomi-affix-trigger"
        aria-haspopup="listbox"
        aria-expanded=${this.prefixOpen ? "true" : "false"}
        aria-label="prefix"
        ?disabled=${this.disabled || this.readonly}
        @click=${() => this.togglePrefixOpen()}
        @keydown=${this.onPrefixTriggerKeydown}
      >
        <span class="loomi-affix-value">${value}</span>
        ${this.renderIcon("chevron-down", "loomi-affix-chevron")}
      </button>
      ${this.prefixOpen
            ? html `<div class="loomi-affix-panel" role="listbox">
            ${options.map((option) => html `<div
                class="loomi-affix-option ${option === value ? "selected" : ""}"
                role="option"
                aria-selected=${option === value ? "true" : "false"}
                @click=${() => this.choosePrefix(option)}
              >
                <span>${option}</span>
                ${option === value ? this.renderIcon("check", "loomi-affix-check") : nothing}
              </div>`)}
          </div>`
            : nothing}
    </span>`;
    }
    renderPrefix() {
        const options = this.parseOptions(this.prefixOptions);
        const hasPrefix = this.prefix || this.prefixIcon || options.length > 0;
        if (!hasPrefix)
            return nothing;
        const cls = `loomi-prefix${this.transparentPrefix ? "" : " loomi-affix-solid"}`;
        return html `<span class=${cls}>
      <slot name="prefix">${options.length > 0 ? this.renderPrefixDropdown(options) : this.prefixIcon ? this.renderIcon(this.prefixIcon) : this.prefix}</slot>
    </span>`;
    }
    renderSuffix() {
        const showClear = this.clearable && this.value !== "" && !this.disabled && !this.readonly;
        const showReveal = this.viewable;
        if (!showClear && !showReveal)
            return nothing;
        return html `<span class="loomi-suffix">
      ${showClear
            ? html `<button type="button" class="loomi-iconbtn" aria-label=${loomiT("common.clear", {}, this.locale)} @click=${this.clear}>${this.renderIcon("x-circle")}</button>`
            : nothing}
      ${showReveal
            ? html `<button type="button" class="loomi-iconbtn" aria-label=${loomiT("input.togglePassword", {}, this.locale)} @click=${() => (this.revealed = !this.revealed)}>${this.renderIcon(this.revealed ? "eye-slash" : "eye")}</button>`
            : nothing}
    </span>`;
    }
    strengthRequirements() {
        const tokens = STRENGTH_ORDER.filter((token) => this.strength.includes(token));
        return tokens.map((token) => {
            if (token === "A")
                return { token, label: "One uppercase letter", met: /[A-Z]/.test(this.value) };
            if (token === "a")
                return { token, label: "One lowercase letter", met: /[a-z]/.test(this.value) };
            if (token === "1")
                return { token, label: "One number", met: /[0-9]/.test(this.value) };
            return { token, label: "One special character", met: /[^A-Za-z0-9]/.test(this.value) };
        });
    }
    renderStrength() {
        const requirements = this.strengthRequirements();
        if (requirements.length === 0)
            return nothing;
        return html `<ul class="loomi-strength" aria-label="Password requirements">
      ${requirements.map((requirement) => html `<li class="loomi-strength-item ${requirement.met ? "met" : ""}">
          <span class="loomi-strength-check">${this.renderIcon("check-circle")}</span>
          <span>${requirement.label}</span>
        </li>`)}
    </ul>`;
    }
    render() {
        const hasLabel = !!this.label;
        const forceFloat = hasLabel && this.showPlaceholderAlways;
        const placeholderAttr = hasLabel && !this.showPlaceholderAlways ? " " : this.placeholder || " ";
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        return html `
      <div class="loomi-field size-${this.size} ${forceFloat ? "force-float" : ""}" part="field">
        ${this.renderPrefix()}
        <span class="loomi-inputwrap">
          <input
            class="loomi-input"
            part="input"
            .value=${this.value}
            type=${this.revealed ? "text" : "password"}
            name=${this.name || nothing}
            placeholder=${placeholderAttr}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            aria-label=${hasLabel ? this.label : nothing}
            aria-invalid=${this.invalid ? "true" : "false"}
            @input=${this.onInput}
            @change=${this.onChange}
            @blur=${this.showValidation}
          />
          ${hasLabel ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>` : nothing}
        </span>
        ${this.renderSuffix()}
      </div>
      ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
      ${this.renderStrength()}
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiPassword.prototype, "name", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "label", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "locale", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPassword.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPassword.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPassword.prototype, "readonly", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "size", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "prefix", void 0);
__decorate([
    property({ attribute: "prefix-options" })
], LoomiPassword.prototype, "prefixOptions", void 0);
__decorate([
    property({ attribute: "prefix-value" })
], LoomiPassword.prototype, "prefixValue", void 0);
__decorate([
    property({ attribute: "prefix-icon" })
], LoomiPassword.prototype, "prefixIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "transparent-prefix" })
], LoomiPassword.prototype, "transparentPrefix", void 0);
__decorate([
    property({ type: Boolean })
], LoomiPassword.prototype, "viewable", void 0);
__decorate([
    property({ type: Boolean })
], LoomiPassword.prototype, "clearable", void 0);
__decorate([
    property()
], LoomiPassword.prototype, "strength", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiPassword.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiPassword.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-placeholder-always" })
], LoomiPassword.prototype, "showPlaceholderAlways", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiPassword.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiPassword.prototype, "revealed", void 0);
__decorate([
    state()
], LoomiPassword.prototype, "prefixOpen", void 0);
__decorate([
    query("input")
], LoomiPassword.prototype, "inputEl", void 0);
LoomiPassword = __decorate([
    customElement("loomi-password")
], LoomiPassword);
export { LoomiPassword };
//# sourceMappingURL=loomi-password.js.map