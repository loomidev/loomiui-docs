var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const UPLOAD = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 7.5 7.5 12M12 7.5v9" />`;
const FILE = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />`;
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
const DEFAULT_PLACEHOLDER_LINE1 = "Choose files or drag and drop to upload";
const DEFAULT_PLACEHOLDER_LINE2 = "%s up to %s";
function parseSize(s) {
    const m = s.trim().toLowerCase().match(/^([\d.]+)\s*(kb|mb|gb)?$/);
    if (!m)
        return Infinity;
    const n = parseFloat(m[1]);
    return n * { kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, "": 1 }[m[2] ?? ""];
}
function human(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 ** 2)
        return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
/**
 * `<loomi-filepicker>` — a drag-and-drop file picker with previews. Keeps a real
 * `<input type="file">` in sync (set `name` and submit inside a `<form>` with
 * `enctype="multipart/form-data"`). A lightweight, dependency-free take on BladewindUI's
 * Filepond wrapper.
 *
 * @fires change - `detail: { files }` whenever the selection changes.
 */
let LoomiFilepicker = class LoomiFilepicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.acceptedFileTypes = "image/*,application/pdf";
        this.placeholderLine1 = DEFAULT_PLACEHOLDER_LINE1;
        this.placeholderLine2 = DEFAULT_PLACEHOLDER_LINE2;
        this.locale = "";
        this.maxFiles = 1;
        this.maxFileSize = "5mb";
        this.canBrowse = true;
        this.canDrop = true;
        this.disabled = false;
        this.showImagePreview = true;
        this.required = false;
        this.invalid = false;
        this.files = [];
        this.over = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    /** Currently selected files. */
    get selectedFiles() {
        return this.files;
    }
    willUpdate(changed) {
        if (changed.has("files") ||
            changed.has("required") ||
            changed.has("disabled") ||
            changed.has("name")) {
            this.syncFormValue();
            this.syncValidity();
        }
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
    syncFormValue() {
        if (!this.name || this.files.length === 0) {
            this.internals.setFormValue(null);
            return;
        }
        const data = new FormData();
        const name = this.maxFiles > 1 ? `${this.name}[]` : this.name;
        for (const file of this.files)
            data.append(name, file);
        this.internals.setFormValue(data);
    }
    syncValidity(showInvalid = this.validationVisible) {
        const empty = this.required && !this.disabled && this.files.length === 0;
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? loomiT("validation.selectFile", {}, this.locale) : "";
        if (this.input)
            this.internals.setValidity(validity, message, this.input);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    syncInput() {
        const dt = new DataTransfer();
        for (const f of this.files)
            dt.items.add(f);
        if (this.input)
            this.input.files = dt.files;
        this.syncFormValue();
        this.syncValidity();
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { files: this.files } }));
    }
    add(list) {
        if (!list || this.disabled)
            return;
        const limit = parseSize(this.maxFileSize);
        const next = [...this.files];
        for (const f of Array.from(list)) {
            if (f.size > limit)
                continue;
            if (next.length >= this.maxFiles)
                break;
            next.push(f);
        }
        this.files = next;
        this.syncInput();
    }
    removeFile(i) {
        this.files = this.files.filter((_, idx) => idx !== i);
        this.syncInput();
    }
    onDrop(e) {
        e.preventDefault();
        this.over = false;
        if (this.canDrop)
            this.add(e.dataTransfer?.files ?? null);
    }
    placeholder2() {
        return loomiDefaultText(this.placeholderLine2, DEFAULT_PLACEHOLDER_LINE2, "filepicker.placeholderLine2", this.locale).replace("%s", this.acceptedFileTypes).replace("%s", this.maxFileSize);
    }
    isImage(f) {
        return this.showImagePreview && f.type.startsWith("image/");
    }
    render() {
        const placeholderLine1 = loomiDefaultText(this.placeholderLine1, DEFAULT_PLACEHOLDER_LINE1, "filepicker.placeholderLine1", this.locale);
        return html `<div class="loomi-fp">
      <div
        class="loomi-drop ${this.over ? "over" : ""} ${this.disabled ? "disabled" : ""}"
        @click=${() => this.canBrowse && !this.disabled && this.input.click()}
        @dragover=${(e) => { if (this.canDrop && !this.disabled) {
            e.preventDefault();
            this.over = true;
        } }}
        @dragleave=${() => (this.over = false)}
        @drop=${(e) => this.onDrop(e)}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${UPLOAD}</svg>
        <div class="loomi-l1">${placeholderLine1}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</div>
        <div class="loomi-l2">${this.placeholder2()}</div>
        <input
          class="loomi-native"
          type="file"
          name=${(this.name ? (this.maxFiles > 1 ? this.name + "[]" : this.name) : "") || nothing}
          accept=${this.acceptedFileTypes}
          ?multiple=${this.maxFiles > 1}
          ?disabled=${this.disabled}
          @blur=${this.showValidation}
          @change=${(e) => this.add(e.target.files)}
        />
      </div>
      ${this.files.length
            ? html `<div class="loomi-files">
            ${this.files.map((f, i) => html `<div class="loomi-file">
              <span class="loomi-thumb">
                ${this.isImage(f)
                ? html `<img class="loomi-thumb" src=${URL.createObjectURL(f)} alt="" />`
                : html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${FILE}</svg>`}
              </span>
              <span class="loomi-meta">
                <div class="loomi-fname">${f.name}</div>
                <div class="loomi-fsize">${human(f.size)}</div>
              </span>
              <button class="loomi-remove" aria-label=${loomiT("common.remove", {}, this.locale)} @click=${() => this.removeFile(i)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${X}</svg>
              </button>
            </div>`)}
          </div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiFilepicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "accepted-file-types" })
], LoomiFilepicker.prototype, "acceptedFileTypes", void 0);
__decorate([
    property({ attribute: "placeholder-line1" })
], LoomiFilepicker.prototype, "placeholderLine1", void 0);
__decorate([
    property({ attribute: "placeholder-line2" })
], LoomiFilepicker.prototype, "placeholderLine2", void 0);
__decorate([
    property()
], LoomiFilepicker.prototype, "locale", void 0);
__decorate([
    property({ type: Number, attribute: "max-files" })
], LoomiFilepicker.prototype, "maxFiles", void 0);
__decorate([
    property({ attribute: "max-file-size" })
], LoomiFilepicker.prototype, "maxFileSize", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-browse" })
], LoomiFilepicker.prototype, "canBrowse", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-drop" })
], LoomiFilepicker.prototype, "canDrop", void 0);
__decorate([
    property({ type: Boolean })
], LoomiFilepicker.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-image-preview" })
], LoomiFilepicker.prototype, "showImagePreview", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFilepicker.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFilepicker.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "files", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "over", void 0);
__decorate([
    query("input")
], LoomiFilepicker.prototype, "input", void 0);
LoomiFilepicker = __decorate([
    customElement("loomi-filepicker")
], LoomiFilepicker);
export { LoomiFilepicker };
//# sourceMappingURL=loomi-filepicker.js.map