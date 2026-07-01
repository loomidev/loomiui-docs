var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, findMentionTrigger, loomiT, onClickOutside, themeStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-textarea>` — a themeable multi-line text input with a floating label
 * and inline validation. Form-associated: its value submits with the form.
 *
 * Set `mention-triggers` (e.g. `["@", "#", "/"]`) and `mentionData` (a map of
 * trigger -> `LoomiMentionItem[]`) to enable an inline mention/autocomplete picker
 * that opens as the user types a trigger character.
 *
 * @csspart field - The bordered container.
 * @csspart textarea - The native `<textarea>`.
 * @csspart mention-panel - The mention picker dropdown.
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 * @fires mention-search - `detail: { trigger, query }` as the user types after a trigger char.
 * @fires mention-select - `detail: { trigger, item }` when a mention item is chosen.
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
        /** Characters that open the mention picker, e.g. `["@", "#", "/"]`. Empty disables it. */
        this.mentionTriggers = [];
        /** Items per trigger character, e.g. `{ "@": [{ label: "Jane" }] }`. */
        this.mentionData = {};
        this.mentionOpen = false;
        this.mentionTrigger = "";
        this.mentionStart = -1;
        this.mentionQuery = "";
        this.mentionActiveIndex = -1;
        this.mentionPos = { top: 0, left: 0 };
        this.onInput = (e) => {
            const target = e.target;
            this.value = target.value;
            if (this.invalid)
                this.validate();
            if (this.mentionTriggers.length)
                this.detectMention(target.selectionStart);
            this.emit("input");
        };
        this.onKeydown = (e) => {
            if (!this.mentionOpen)
                return;
            const items = this.mentionItems;
            switch (e.key) {
                case "Escape":
                    e.preventDefault();
                    this.closeMention();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    this.mentionActiveIndex = items.length ? (this.mentionActiveIndex + 1) % items.length : -1;
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this.mentionActiveIndex = items.length ? (this.mentionActiveIndex - 1 + items.length) % items.length : -1;
                    break;
                case "Enter":
                case "Tab":
                    if (this.mentionActiveIndex >= 0 && items[this.mentionActiveIndex]) {
                        e.preventDefault();
                        this.chooseMention(items[this.mentionActiveIndex]);
                    }
                    break;
            }
        };
        this.onKeyup = (e) => {
            if (!this.mentionTriggers.length)
                return;
            if (e.key === "ArrowLeft" || e.key === "ArrowRight" || e.key === "Home" || e.key === "End") {
                this.detectMention(e.target.selectionStart);
            }
        };
    }
    static { this.styles = [themeStyles, componentStyles]; }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanupMentionOutside?.();
    }
    focus() {
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
        const empty = this.required && !this.disabled && !this.readonly && this.value.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
        if (this.textareaEl)
            this.internals.setValidity(validity, message, this.textareaEl);
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
    get mentionItems() {
        const items = this.mentionData[this.mentionTrigger] ?? [];
        if (!this.mentionQuery)
            return items;
        const q = this.mentionQuery.toLowerCase();
        return items.filter((item) => item.label.toLowerCase().includes(q));
    }
    detectMention(caret) {
        if (!this.mentionTriggers.length)
            return;
        const match = findMentionTrigger(this.value, caret, this.mentionTriggers);
        if (!match) {
            this.closeMention();
            return;
        }
        this.mentionTrigger = match.trigger;
        this.mentionStart = match.start;
        this.mentionQuery = match.query;
        this.mentionActiveIndex = 0;
        if (!this.mentionOpen) {
            this.mentionOpen = true;
            const cleanupOutside = onClickOutside(this, () => this.closeMention());
            const onScroll = () => this.closeMention();
            window.addEventListener("scroll", onScroll, { capture: true, passive: true });
            this.cleanupMentionOutside = () => {
                cleanupOutside();
                window.removeEventListener("scroll", onScroll, { capture: true });
            };
        }
        this.dispatchEvent(new CustomEvent("mention-search", {
            bubbles: true,
            composed: true,
            detail: { trigger: match.trigger, query: match.query },
        }));
        void this.updateComplete.then(() => this.positionMentionPanel());
    }
    closeMention() {
        if (!this.mentionOpen)
            return;
        this.mentionOpen = false;
        this.mentionStart = -1;
        this.mentionQuery = "";
        this.mentionActiveIndex = -1;
        this.cleanupMentionOutside?.();
        this.cleanupMentionOutside = undefined;
    }
    positionMentionPanel() {
        if (!this.mentionOpen || !this.mirrorEl || !this.textareaEl)
            return;
        const caret = this.mentionStart + this.mentionTrigger.length + this.mentionQuery.length;
        const mirror = this.mirrorEl;
        mirror.textContent = this.value.slice(0, caret);
        const marker = document.createElement("span");
        marker.textContent = this.value.slice(caret) || ".";
        mirror.appendChild(marker);
        const taRect = this.textareaEl.getBoundingClientRect();
        const lineHeight = parseFloat(getComputedStyle(this.textareaEl).lineHeight) || 20;
        const top = taRect.top + marker.offsetTop - this.textareaEl.scrollTop + lineHeight;
        const vw = window.innerWidth || document.documentElement.clientWidth || 800;
        const rawLeft = taRect.left + marker.offsetLeft - this.textareaEl.scrollLeft;
        const left = Math.min(rawLeft, Math.max(0, vw - 220));
        mirror.textContent = "";
        this.mentionPos = { top, left };
    }
    chooseMention(item) {
        const trigger = this.mentionTrigger;
        const start = this.mentionStart;
        const caret = start + trigger.length + this.mentionQuery.length;
        const insertText = `${trigger}${item.label} `;
        this.value = this.value.slice(0, start) + insertText + this.value.slice(caret);
        const newCaret = start + insertText.length;
        this.closeMention();
        this.dispatchEvent(new CustomEvent("mention-select", { bubbles: true, composed: true, detail: { trigger, item } }));
        this.emit("input");
        void this.updateComplete.then(() => {
            this.textareaEl.focus();
            this.textareaEl.setSelectionRange(newCaret, newCaret);
        });
    }
    renderMentionPanel() {
        const items = this.mentionItems;
        return html `
      <div
        class="loomi-mention-panel"
        part="mention-panel"
        role="listbox"
        style="top:${this.mentionPos.top}px;left:${this.mentionPos.left}px"
      >
        ${items.length
            ? items.map((item, i) => html `
                <div
                  class="loomi-mention-item ${i === this.mentionActiveIndex ? "active" : ""}"
                  role="option"
                  aria-selected=${i === this.mentionActiveIndex ? "true" : "false"}
                  @mousedown=${(e) => e.preventDefault()}
                  @mouseenter=${() => (this.mentionActiveIndex = i)}
                  @click=${() => this.chooseMention(item)}
                >
                  ${item.image ? html `<img src=${item.image} alt="" />` : nothing}
                  <span class="loomi-mention-label">${item.label}</span>
                  ${item.description ? html `<span class="loomi-mention-desc">${item.description}</span>` : nothing}
                </div>
              `)
            : html `<div class="loomi-mention-empty">${loomiT("mention.emptyPlaceholder", {}, this.locale)}</div>`}
      </div>
    `;
    }
    render() {
        const hasLabel = !!this.label;
        const placeholderAttr = hasLabel ? " " : this.placeholder || " ";
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
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
          @keydown=${this.onKeydown}
          @keyup=${this.onKeyup}
          @click=${() => this.detectMention(this.textareaEl.selectionStart)}
          @change=${() => this.emit("change")}
          @blur=${this.showValidation}
        ></textarea>
        ${hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
        ${this.mentionTriggers.length ? html `<div class="loomi-textarea loomi-mention-mirror" aria-hidden="true"></div>` : nothing}
        ${this.mentionOpen ? this.renderMentionPanel() : nothing}
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
    property({ type: Array, attribute: "mention-triggers" })
], LoomiTextarea.prototype, "mentionTriggers", void 0);
__decorate([
    property({ type: Object, attribute: "mention-data" })
], LoomiTextarea.prototype, "mentionData", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionOpen", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionTrigger", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionStart", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionQuery", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionActiveIndex", void 0);
__decorate([
    state()
], LoomiTextarea.prototype, "mentionPos", void 0);
__decorate([
    query("textarea")
], LoomiTextarea.prototype, "textareaEl", void 0);
__decorate([
    query(".loomi-mention-mirror")
], LoomiTextarea.prototype, "mirrorEl", void 0);
LoomiTextarea = __decorate([
    customElement("loomi-textarea")
], LoomiTextarea);
export { LoomiTextarea };
//# sourceMappingURL=loomi-textarea.js.map