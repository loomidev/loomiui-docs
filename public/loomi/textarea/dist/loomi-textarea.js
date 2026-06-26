var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LoomiElement, loomiT, themeStyles } from "@loomi/core";
import { componentStyles, quillStyles } from "./generated/styles.css.js";
/**
 * `<loomi-textarea>` — a themeable multi-line text input with a floating label
 * and inline validation. Set `toolbar` for a rich-text editor (powered by Quill)
 * with bold/italic/lists/links instead of a plain `<textarea>` — `value` then holds
 * HTML. Form-associated: its value submits with the form.
 *
 * @csspart field - The bordered container.
 * @csspart textarea - The native `<textarea>` (plain mode only).
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 */
let LoomiTextarea = class LoomiTextarea extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.label = "";
        this.locale = "";
        this.placeholder = "";
        this.value = "";
        this.rows = 3;
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.errorMessage = "";
        this.showErrorInline = false;
        this.invalid = false;
        /** Rich-text mode with a Quill toolbar (bold/italic/lists/links). `value` then holds HTML. */
        this.toolbar = false;
        this.onInput = (e) => {
            this.value = e.target.value;
            if (this.invalid)
                this.validate();
            this.emit("input");
        };
    }
    static { this.styles = [themeStyles, componentStyles, quillStyles]; }
    static { this.formAssociated = true; }
    willUpdate(changed) {
        this.internals.setFormValue(this.value);
        this.syncValidity();
        if (this.quill) {
            if (changed.has("disabled") || changed.has("readonly")) {
                this.quill.enable(!this.disabled && !this.readonly);
            }
        }
    }
    firstUpdated() {
        if (this.toolbar)
            this.initQuill();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.quill = undefined;
    }
    async initQuill() {
        if (!this.quillRootEl)
            return;
        const { default: QuillEditor } = await import("quill");
        if (!this.quillRootEl)
            return;
        this.quill = new QuillEditor(this.quillRootEl, {
            theme: "snow",
            placeholder: this.placeholder,
            readOnly: this.disabled || this.readonly,
        });
        if (this.value)
            this.quill.clipboard.dangerouslyPasteHTML(this.value);
        this.quill.root.style.minHeight = `${this.rows * 1.5}em`;
        this.quill.on("text-change", () => {
            this.value = this.quill.getSemanticHTML();
            if (this.invalid)
                this.validate();
            this.emit("input");
        });
        this.quill.on("selection-change", (range) => {
            if (!range) {
                this.showValidation();
                this.emit("change");
            }
        });
    }
    focus() {
        if (this.toolbar)
            this.quill?.focus();
        else
            this.textareaEl?.focus();
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
        const text = this.toolbar ? (this.quill?.getText() ?? "") : this.value;
        const empty = this.required && !this.disabled && !this.readonly && text.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
        const anchor = (this.toolbar ? this.quillRootEl : this.textareaEl);
        if (anchor)
            this.internals.setValidity(validity, message, anchor);
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
    render() {
        const hasLabel = !!this.label;
        const placeholderAttr = hasLabel ? " " : this.placeholder || " ";
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        if (this.toolbar) {
            return html `
        ${hasLabel
                ? html `<label class="loomi-label loomi-label-static"
              >${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label
            >`
                : nothing}
        <div class="loomi-field loomi-field-quill" part="field">
          <div class="loomi-quill-root"></div>
        </div>
        ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
      `;
        }
        return html `
      <div class="loomi-field" part="field">
        <textarea
          class="loomi-textarea"
          part="textarea"
          .value=${this.value}
          name=${this.name || nothing}
          rows=${this.rows}
          placeholder=${placeholderAttr}
          ?disabled=${this.disabled}
          ?readonly=${this.readonly}
          ?required=${this.required}
          aria-label=${hasLabel ? this.label : nothing}
          aria-invalid=${this.invalid ? "true" : "false"}
          @input=${this.onInput}
          @change=${() => this.emit("change")}
          @blur=${this.showValidation}
        ></textarea>
        ${hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
      </div>
      ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTextarea.prototype, "name", void 0);
__decorate([
    property()
], LoomiTextarea.prototype, "label", void 0);
__decorate([
    property()
], LoomiTextarea.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTextarea.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTextarea.prototype, "value", void 0);
__decorate([
    property({ type: Number })
], LoomiTextarea.prototype, "rows", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextarea.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextarea.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextarea.prototype, "readonly", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiTextarea.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiTextarea.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextarea.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextarea.prototype, "toolbar", void 0);
__decorate([
    query("textarea")
], LoomiTextarea.prototype, "textareaEl", void 0);
__decorate([
    query(".loomi-quill-root")
], LoomiTextarea.prototype, "quillRootEl", void 0);
LoomiTextarea = __decorate([
    customElement("loomi-textarea")
], LoomiTextarea);
export { LoomiTextarea };
//# sourceMappingURL=loomi-textarea.js.map