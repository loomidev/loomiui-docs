var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LoomiElement, loomiT, themeStyles } from "@loomidev/core";
import { componentStyles, quillStyles } from "./generated/styles.css.js";
/**
 * `<loomi-text-editor>` — a themeable rich-text editor with a floating label and
 * inline validation, powered by Quill (bold/italic/lists/links). `value` holds HTML.
 * Form-associated: its value submits with the form.
 *
 * @csspart field - The bordered container.
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 */
let LoomiTextEditor = class LoomiTextEditor extends LoomiElement {
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
    }
    static { this.styles = [themeStyles, componentStyles, quillStyles]; }
    static { this.formAssociated = true; }
    willUpdate(changed) {
        this.internals.setFormValue(this.value);
        this.syncValidity();
        if (this.quill && (changed.has("disabled") || changed.has("readonly"))) {
            this.quill.enable(!this.disabled && !this.readonly);
        }
    }
    firstUpdated() {
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
        this.quill?.focus();
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
        const text = this.quill?.getText() ?? "";
        const empty = this.required && !this.disabled && !this.readonly && text.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
        if (this.quillRootEl)
            this.internals.setValidity(validity, message, this.quillRootEl);
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
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
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
};
__decorate([
    property({ reflect: true })
], LoomiTextEditor.prototype, "name", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "label", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "value", void 0);
__decorate([
    property({ type: Number })
], LoomiTextEditor.prototype, "rows", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "readonly", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiTextEditor.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiTextEditor.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "invalid", void 0);
__decorate([
    query(".loomi-quill-root")
], LoomiTextEditor.prototype, "quillRootEl", void 0);
LoomiTextEditor = __decorate([
    customElement("loomi-text-editor")
], LoomiTextEditor);
export { LoomiTextEditor };
//# sourceMappingURL=loomi-text-editor.js.map