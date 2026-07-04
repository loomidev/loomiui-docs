var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { live } from "lit/directives/live.js";
import { LoomiElement, accentVars, loomiT, themeStyles } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/**
 * `<loomi-tag-input>` — a form-associated tag entry control styled like
 * `<loomi-input>`. Press Enter to turn the current draft text into a removable
 * gray outline tag.
 *
 * @csspart field - The bordered field container.
 * @csspart input - The native draft `<input>`.
 * @csspart tags - The tag list.
 * @csspart tag - An individual tag chip.
 * @fires input - Fired when draft text changes or tags are added/removed.
 * @fires change - Fired when tags are added/removed.
 */
let LoomiTagInput = class LoomiTagInput extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.label = "";
        this.locale = "";
        this.placeholder = "";
        this.value = "";
        this.size = "medium";
        this.color = "primary";
        this.shade = "light";
        this.mode = "inside";
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.suffixIcon = "";
        this.suffix = "";
        this.errorMessage = "";
        this.showErrorInline = false;
        this.invalid = false;
        this.showFocusRing = true;
        this.autocompleteData = [];
        this.autocompleteLabelKey = "label";
        this.autocompleteValueKey = "value";
        this.autocompleteDescriptionKey = "description";
        this.autocompleteImageKey = "image";
        this.draft = "";
        this.tagValues = [];
        this.autocompleteOpen = false;
        this.autocompleteActiveIndex = -1;
        this.onInput = (e) => {
            this.draft = e.target.value;
            const options = this.autocompleteOptions;
            this.autocompleteOpen = options.length > 0;
            this.autocompleteActiveIndex = options.length ? 0 : -1;
            this.emit("input");
        };
        this.onKeydown = (e) => {
            const options = this.autocompleteOptions;
            if (this.autocompleteOpen && options.length) {
                if (e.key === "ArrowDown") {
                    e.preventDefault();
                    this.autocompleteActiveIndex = (this.autocompleteActiveIndex + 1) % options.length;
                    return;
                }
                if (e.key === "ArrowUp") {
                    e.preventDefault();
                    this.autocompleteActiveIndex = (this.autocompleteActiveIndex - 1 + options.length) % options.length;
                    return;
                }
                if (e.key === "Escape") {
                    this.autocompleteOpen = false;
                    return;
                }
                if (e.key === "Enter" && options[this.autocompleteActiveIndex]) {
                    e.preventDefault();
                    this.chooseAutocomplete(options[this.autocompleteActiveIndex]);
                    return;
                }
            }
            if (e.key === "Enter" && !e.isComposing) {
                e.preventDefault();
                this.commitDraft();
                return;
            }
            if (e.key === "Backspace" && this.draft === "" && this.tagValues.length > 0 && !this.readonly) {
                e.preventDefault();
                this.removeTag(this.tagValues.length - 1);
            }
        };
    }
    static { this.styles = [themeStyles, componentStyles]; }
    static { this.formAssociated = true; }
    willUpdate(changed) {
        if (changed.has("value")) {
            const parsed = this.parseValue(this.value);
            if (!this.sameTags(parsed, this.tagValues)) {
                this.tagValues = parsed;
            }
        }
        const serialized = this.serializeTags(this.tagValues);
        if (this.value !== serialized) {
            this.value = serialized;
        }
        this.internals.setFormValue(serialized);
        this.syncValidity();
    }
    focus() {
        this.inputEl?.focus();
    }
    get tags() {
        return [...this.tagValues];
    }
    set tags(values) {
        this.setTags(values, false);
    }
    clear() {
        if (this.disabled || this.readonly)
            return;
        this.draft = "";
        this.setTags([], true);
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
    parseValue(value) {
        return value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean);
    }
    serializeTags(tags) {
        return tags.join(",");
    }
    sameTags(a, b) {
        return a.length === b.length && a.every((tag, index) => tag === b[index]);
    }
    setTags(tags, emitEvents) {
        const next = tags.map((tag) => tag.trim()).filter(Boolean);
        if (this.sameTags(next, this.tagValues))
            return;
        this.tagValues = next;
        this.value = this.serializeTags(next);
        this.internals.setFormValue(this.value);
        if (this.invalid)
            this.validate();
        if (emitEvents) {
            this.emit("input");
            this.emit("change");
        }
    }
    syncValidity(showInvalid = this.validationVisible) {
        const empty = this.required && !this.disabled && !this.readonly && this.tagValues.length === 0;
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
    commitDraft() {
        const tag = this.draft.trim().replace(/\s+/g, " ");
        if (!tag || this.disabled || this.readonly)
            return;
        this.draft = "";
        this.autocompleteOpen = false;
        this.setTags([...this.tagValues, tag], true);
    }
    get autocompleteOptions() {
        const q = this.draft.trim().toLowerCase();
        if (!q)
            return [];
        return this.autocompleteData
            .map((row) => ({
            label: String(row[this.autocompleteLabelKey] ?? ""),
            value: String(row[this.autocompleteValueKey] ?? row[this.autocompleteLabelKey] ?? ""),
            description: this.autocompleteDescriptionKey ? String(row[this.autocompleteDescriptionKey] ?? "") : "",
            image: this.autocompleteImageKey ? String(row[this.autocompleteImageKey] ?? "") : "",
        }))
            .filter((item) => item.label && !this.tagValues.includes(item.value || item.label))
            .filter((item) => item.label.toLowerCase().includes(q) || (item.value ?? "").toLowerCase().includes(q));
    }
    chooseAutocomplete(item) {
        if (this.disabled || this.readonly)
            return;
        this.draft = "";
        this.autocompleteOpen = false;
        this.setTags([...this.tagValues, item.value || item.label], true);
        this.dispatchEvent(new CustomEvent("autocomplete-select", { bubbles: true, composed: true, detail: { item } }));
    }
    removeTag(index) {
        if (this.disabled || this.readonly)
            return;
        this.setTags(this.tagValues.filter((_, i) => i !== index), true);
        this.focus();
    }
    renderIcon(name, cls = "loomi-icon") {
        const path = getLoomiIcon(name);
        if (!path)
            return nothing;
        return html `<svg class=${cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${path}</svg>`;
    }
    renderTag(tag, index) {
        return html `<span class=${`loomi-tag ${this.shade}`} part="tag">
      <span class="loomi-tag-label">${tag}</span>
      ${this.disabled || this.readonly
            ? nothing
            : html `<button
            type="button"
            class="loomi-tag-remove"
            aria-label=${loomiT("common.remove", {}, this.locale)}
            @click=${() => this.removeTag(index)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${X}</svg>
          </button>`}
    </span>`;
    }
    renderTags() {
        if (this.tagValues.length === 0)
            return nothing;
        return html `<div class="loomi-tags" part="tags">${this.tagValues.map((tag, index) => this.renderTag(tag, index))}</div>`;
    }
    renderSuffix() {
        const hasSuffix = this.suffix || this.suffixIcon;
        if (!hasSuffix)
            return nothing;
        return html `<span class="loomi-suffix">
      <slot name="suffix">${this.suffixIcon ? this.renderIcon(this.suffixIcon) : this.suffix}</slot>
    </span>`;
    }
    renderAutocomplete() {
        const options = this.autocompleteOptions;
        if (!this.autocompleteOpen || !options.length)
            return nothing;
        return html `<div class="loomi-autocomplete-panel" role="listbox">
      ${options.map((item, index) => html `<div
        class="loomi-autocomplete-option ${index === this.autocompleteActiveIndex ? "active" : ""}"
        role="option"
        aria-selected=${index === this.autocompleteActiveIndex ? "true" : "false"}
        @mouseenter=${() => (this.autocompleteActiveIndex = index)}
        @mousedown=${(event) => event.preventDefault()}
        @click=${() => this.chooseAutocomplete(item)}
      >
        ${item.image ? html `<img src=${item.image} alt="" />` : nothing}
        <span class="loomi-autocomplete-copy">
          <span class="loomi-autocomplete-label">${item.label}</span>
          ${item.description ? html `<span class="loomi-autocomplete-desc">${item.description}</span>` : nothing}
        </span>
      </div>`)}
    </div>`;
    }
    render() {
        const hasLabel = !!this.label;
        const placeholderAttr = hasLabel ? " " : this.placeholder || " ";
        const belowMode = this.mode === "below";
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        const fieldClasses = [
            "loomi-field",
            `size-${this.size}`,
            belowMode ? "mode-below" : "mode-inside",
            this.tagValues.length > 0 ? "has-tags" : "",
            this.draft ? "has-draft" : "",
            this.showFocusRing ? "" : "no-focus-ring",
        ]
            .filter(Boolean)
            .join(" ");
        const labelEl = hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing;
        return html `
      <div class=${fieldClasses} part="field" style=${accentVars(this.color)} @click=${() => this.focus()}>
        ${belowMode ? nothing : labelEl}
        ${belowMode ? nothing : this.renderTags()}
        <span class="loomi-inputwrap">
          <input
            class="loomi-input"
            part="input"
            .value=${live(this.draft)}
            name=${this.name || nothing}
            placeholder=${placeholderAttr}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            aria-label=${hasLabel ? this.label : nothing}
            aria-invalid=${this.invalid ? "true" : "false"}
            @input=${this.onInput}
            @keydown=${this.onKeydown}
            @blur=${this.showValidation}
          />
          ${belowMode ? labelEl : nothing}
        </span>
        ${this.renderSuffix()}
      </div>
      ${this.renderAutocomplete()}
      ${belowMode ? this.renderTags() : nothing}
      ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTagInput.prototype, "name", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "label", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "value", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "size", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "color", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "shade", void 0);
__decorate([
    property({ reflect: true })
], LoomiTagInput.prototype, "mode", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTagInput.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTagInput.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTagInput.prototype, "readonly", void 0);
__decorate([
    property({ attribute: "suffix-icon" })
], LoomiTagInput.prototype, "suffixIcon", void 0);
__decorate([
    property()
], LoomiTagInput.prototype, "suffix", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiTagInput.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiTagInput.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTagInput.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-focus-ring", converter: booleanAttribute })
], LoomiTagInput.prototype, "showFocusRing", void 0);
__decorate([
    property({ type: Array, attribute: "autocomplete-data" })
], LoomiTagInput.prototype, "autocompleteData", void 0);
__decorate([
    property({ attribute: "autocomplete-label-key" })
], LoomiTagInput.prototype, "autocompleteLabelKey", void 0);
__decorate([
    property({ attribute: "autocomplete-value-key" })
], LoomiTagInput.prototype, "autocompleteValueKey", void 0);
__decorate([
    property({ attribute: "autocomplete-description-key" })
], LoomiTagInput.prototype, "autocompleteDescriptionKey", void 0);
__decorate([
    property({ attribute: "autocomplete-image-key" })
], LoomiTagInput.prototype, "autocompleteImageKey", void 0);
__decorate([
    state()
], LoomiTagInput.prototype, "draft", void 0);
__decorate([
    state()
], LoomiTagInput.prototype, "tagValues", void 0);
__decorate([
    state()
], LoomiTagInput.prototype, "autocompleteOpen", void 0);
__decorate([
    state()
], LoomiTagInput.prototype, "autocompleteActiveIndex", void 0);
__decorate([
    query("input")
], LoomiTagInput.prototype, "inputEl", void 0);
LoomiTagInput = __decorate([
    customElement("loomi-tag-input")
], LoomiTagInput);
export { LoomiTagInput };
//# sourceMappingURL=loomi-tag-input.js.map