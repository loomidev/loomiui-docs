var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import "@loomidev/popover";
import { componentStyles } from "./generated/styles.css.js";
import { GENERATED_EMOJIS } from "./emoji-data.gen.js";
const PANEL_WIDTH_PX = {
    small: 320,
    regular: 352,
    medium: 352,
    big: 400,
};
const DEFAULT_PLACEHOLDER = "Pick an emoji";
const DEFAULT_EMPTY_TEXT = "No emoji found";
const DEFAULT_SEARCH_PLACEHOLDER = "Search emoji";
const CATEGORY_ICONS = {
    all: "⌕",
    smileys: "😀",
    people: "👋",
    nature: "🌿",
    food: "🍕",
    activity: "⚽",
    travel: "✈️",
    objects: "💡",
    symbols: "❤️",
    flags: "🏳️",
};
const CATEGORY_LABELS = {
    all: "All",
    smileys: "Smileys",
    people: "People",
    nature: "Nature",
    food: "Food and drink",
    activity: "Activities",
    travel: "Travel and places",
    objects: "Objects",
    symbols: "Symbols",
    flags: "Flags",
};
const DEFAULT_EMOJIS = GENERATED_EMOJIS.map(([emoji, name, category, keywords]) => ({
    emoji,
    name,
    value: emoji,
    category,
    keywords: [...keywords],
}));
function keywordsFrom(value) {
    if (Array.isArray(value))
        return value.map(String).filter(Boolean);
    return String(value ?? "")
        .split(/[\s,]+/)
        .map((item) => item.trim())
        .filter(Boolean);
}
/**
 * Lit's default `type: Boolean` converter treats ANY attribute presence — including
 * the literal string `"false"` — as `true` (`fromAttribute: (v) => v !== null`), so
 * `show-text="false"` written as plain HTML markup silently does nothing. This
 * converter fixes `fromAttribute` to honor a literal `"false"` while keeping the
 * usual presence-based `toAttribute` semantics for default-true boolean properties.
 */
const literalFalseBooleanConverter = {
    fromAttribute(value) {
        return value !== null && value !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
function normalizeDataItem(row) {
    const emoji = String(row.emoji ?? row.icon ?? row.value ?? "").trim();
    if (!emoji)
        return null;
    const name = String(row.name ?? row.label ?? emoji).trim() || emoji;
    return {
        emoji,
        name,
        value: String(row.value ?? emoji),
        category: String(row.category ?? "custom") || "custom",
        keywords: keywordsFrom(row.keywords),
    };
}
/**
 * `<loomi-emoji-picker>` — searchable emoji picker with categories, keyboard support
 * and native form association.
 *
 * @fires emoji-select - `detail: { value, emoji, name, category, item }`
 * @fires change - `detail: { value, emoji, item }`
 */
let LoomiEmojiPicker = class LoomiEmojiPicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.selectedValue = "";
        this.label = "";
        this.placeholder = DEFAULT_PLACEHOLDER;
        this.emptyText = DEFAULT_EMPTY_TEXT;
        this.locale = "";
        this.size = "medium";
        this.data = [];
        this.emojis = "";
        this.inline = false;
        this.searchable = true;
        this.showCategories = true;
        this.showText = false;
        this.disabled = false;
        this.readonly = false;
        this.required = false;
        this.invalid = false;
        this.open = false;
        this.search = "";
        this.category = "all";
        this.activeIndex = 0;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.value);
        this.syncValidity();
    }
    get value() {
        return this.selectedValue;
    }
    get selection() {
        return this.selectedItem;
    }
    reset() {
        this.selectedValue = "";
        this.emitChange(null);
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
    get allItems() {
        if (Array.isArray(this.data) && this.data.length) {
            return this.data.map(normalizeDataItem).filter((item) => Boolean(item));
        }
        if (this.emojis.trim()) {
            return this.emojis
                .split(/[\s,]+/)
                .map((emoji) => emoji.trim())
                .filter(Boolean)
                .map((emoji) => ({ emoji, name: emoji, value: emoji, category: "custom", keywords: [] }));
        }
        return DEFAULT_EMOJIS;
    }
    get categories() {
        return ["all", ...Array.from(new Set(this.allItems.map((item) => item.category)))];
    }
    get visibleItems() {
        const query = this.search.trim().toLowerCase();
        return this.allItems.filter((item) => {
            const categoryMatches = this.category === "all" || item.category === this.category;
            if (!categoryMatches)
                return false;
            if (!query)
                return true;
            const haystack = [item.emoji, item.name, item.value, item.category, ...item.keywords].join(" ").toLowerCase();
            return haystack.includes(query);
        });
    }
    get selectedItem() {
        if (!this.selectedValue)
            return null;
        return this.allItems.find((item) => item.value === this.selectedValue || item.emoji === this.selectedValue)
            ?? {
                emoji: this.selectedValue,
                name: this.selectedValue,
                value: this.selectedValue,
                category: "custom",
                keywords: [],
            };
    }
    syncValidity(showInvalid = this.validationVisible) {
        const valueMissing = this.required && !this.disabled && !this.readonly && !this.selectedValue;
        this.invalid = valueMissing && showInvalid;
        this.internals.setValidity(valueMissing ? { valueMissing: true } : {}, valueMissing ? loomiT("validation.requiredField", {}, this.locale) : "");
        return !valueMissing;
    }
    onPopoverToggle(event) {
        this.open = event.detail.open;
        if (this.open) {
            this.clampActive();
            if (this.searchable)
                this.updateComplete.then(() => this.searchEl?.focus());
        }
        else {
            this.search = "";
            this.validate();
        }
    }
    onFocusOut() {
        if (!this.open)
            this.validate();
    }
    clampActive() {
        const total = this.visibleItems.length;
        this.activeIndex = total ? Math.min(Math.max(this.activeIndex, 0), total - 1) : -1;
    }
    setSearch(value) {
        this.search = value;
        this.activeIndex = this.visibleItems.length ? 0 : -1;
    }
    setCategory(category) {
        this.category = category;
        this.search = "";
        this.activeIndex = this.visibleItems.length ? 0 : -1;
        if (this.searchable)
            this.updateComplete.then(() => this.searchEl?.focus());
    }
    choose(item) {
        if (this.disabled || this.readonly)
            return;
        this.selectedValue = item.value;
        this.validationVisible = true;
        this.syncValidity(true);
        const detail = { value: item.value, emoji: item.emoji, name: item.name, category: item.category, item };
        this.dispatchEvent(new CustomEvent("emoji-select", { bubbles: true, composed: true, detail }));
        this.emitChange(item);
        if (!this.inline)
            this.popoverEl?.hide();
    }
    emitChange(item) {
        this.internals.setFormValue(this.value);
        this.syncValidity();
        this.dispatchEvent(new CustomEvent("change", {
            bubbles: true,
            composed: true,
            detail: { value: this.value, emoji: item?.emoji ?? "", item },
        }));
    }
    onKeydown(event) {
        const isOpen = this.open || this.inline;
        if (!this.inline && !isOpen && event.key === "ArrowDown") {
            event.preventDefault();
            this.popoverEl?.show();
            return;
        }
        if (!isOpen)
            return;
        const items = this.visibleItems;
        if (!items.length && event.key !== "Escape")
            return;
        const move = (next) => {
            event.preventDefault();
            this.activeIndex = (next + items.length) % items.length;
        };
        if (event.key === "ArrowRight" || event.key === "ArrowDown")
            move(this.activeIndex + 1);
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp")
            move(this.activeIndex - 1);
        else if (event.key === "Home")
            move(0);
        else if (event.key === "End")
            move(items.length - 1);
        else if (event.key === "Enter") {
            event.preventDefault();
            const item = items[this.activeIndex >= 0 ? this.activeIndex : 0];
            if (item)
                this.choose(item);
        }
        else if (event.key === "Escape" && !this.inline) {
            event.preventDefault();
            this.popoverEl?.hide();
        }
    }
    categoryLabel(category) {
        return CATEGORY_LABELS[category] ?? category.replace(/[-_]/g, " ");
    }
    renderPanelBody() {
        const items = this.visibleItems;
        const activeId = this.activeIndex >= 0 ? `loomi-emoji-${this.activeIndex}` : "";
        const searchPlaceholder = loomiDefaultText(DEFAULT_SEARCH_PLACEHOLDER, DEFAULT_SEARCH_PLACEHOLDER, "emojiPicker.searchPlaceholder", this.locale);
        return html `${this.searchable
            ? html `<input
            class="loomi-search"
            type="search"
            autocomplete="off"
            spellcheck="false"
            aria-label=${searchPlaceholder}
            aria-activedescendant=${activeId || nothing}
            placeholder=${searchPlaceholder}
            .value=${this.search}
            @input=${(event) => this.setSearch(event.target.value)}
          />`
            : nothing}
      ${this.showCategories
            ? html `<div class="loomi-categories" aria-label="Emoji categories">
            ${this.categories.map((category) => html `<button
              class="loomi-category ${this.category === category ? "active" : ""}"
              type="button"
              title=${this.categoryLabel(category)}
              aria-label=${this.categoryLabel(category)}
              aria-pressed=${this.category === category ? "true" : "false"}
              @click=${() => this.setCategory(category)}
            >${CATEGORY_ICONS[category] ?? "•"}</button>`)}
          </div>`
            : nothing}
      ${items.length
            ? html `<div
            class="loomi-grid"
            role="listbox"
            aria-activedescendant=${!this.searchable ? activeId || nothing : nothing}
            aria-label=${loomiT("emojiPicker.dialog", {}, this.locale)}
          >
            ${items.map((item, index) => {
                const selected = this.selectedValue === item.value || this.selectedValue === item.emoji;
                return html `<button
                id=${`loomi-emoji-${index}`}
                class="loomi-option ${index === this.activeIndex ? "active" : ""} ${selected ? "selected" : ""}"
                type="button"
                role="option"
                aria-label=${item.name}
                aria-selected=${selected ? "true" : "false"}
                title=${item.name}
                @mouseenter=${() => (this.activeIndex = index)}
                @click=${() => this.choose(item)}
              >${item.emoji}</button>`;
            })}
          </div>`
            : html `<div class="loomi-empty">${loomiDefaultText(this.emptyText, DEFAULT_EMPTY_TEXT, "emojiPicker.emptyText", this.locale)}</div>`}`;
    }
    render() {
        const selected = this.selectedItem;
        const placeholder = loomiDefaultText(this.placeholder, DEFAULT_PLACEHOLDER, "emojiPicker.placeholder", this.locale);
        const triggerLabel = selected?.name ?? placeholder;
        return html `<div
      class="loomi-emoji-picker size-${this.size} ${this.inline ? "inline" : ""}"
      @keydown=${this.onKeydown}
      @focusout=${this.onFocusOut}
    >
      ${this.label ? html `<span class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>` : nothing}
      ${this.inline
            ? html `<div class="loomi-emoji-panel" part="panel">${this.renderPanelBody()}</div>`
            : html `<loomi-popover
            class="loomi-emoji-popover"
            position="bottom"
            .width=${PANEL_WIDTH_PX[this.size]}
            .disabled=${this.disabled || this.readonly}
            @loomi-toggle=${this.onPopoverToggle}
          >
            <span
              slot="trigger"
              class="loomi-emoji-trigger ${this.showText ? "with-text" : ""}"
              aria-label=${triggerLabel}
            >
              <span aria-hidden="true">${selected?.emoji ?? "☺"}</span>
              ${this.showText
                ? html `<span class="loomi-value ${selected ? "" : "placeholder"}" aria-hidden="true">${triggerLabel}</span>`
                : nothing}
            </span>
            ${this.open ? this.renderPanelBody() : nothing}
          </loomi-popover>`}
      ${this.invalid ? html `<div class="loomi-error">${loomiT("validation.requiredField", {}, this.locale)}</div>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiEmojiPicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiEmojiPicker.prototype, "selectedValue", void 0);
__decorate([
    property()
], LoomiEmojiPicker.prototype, "label", void 0);
__decorate([
    property()
], LoomiEmojiPicker.prototype, "placeholder", void 0);
__decorate([
    property({ attribute: "empty-text" })
], LoomiEmojiPicker.prototype, "emptyText", void 0);
__decorate([
    property()
], LoomiEmojiPicker.prototype, "locale", void 0);
__decorate([
    property()
], LoomiEmojiPicker.prototype, "size", void 0);
__decorate([
    property({ type: Array })
], LoomiEmojiPicker.prototype, "data", void 0);
__decorate([
    property()
], LoomiEmojiPicker.prototype, "emojis", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiEmojiPicker.prototype, "inline", void 0);
__decorate([
    property({ type: Boolean, converter: literalFalseBooleanConverter })
], LoomiEmojiPicker.prototype, "searchable", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-categories", converter: literalFalseBooleanConverter })
], LoomiEmojiPicker.prototype, "showCategories", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-text", converter: literalFalseBooleanConverter })
], LoomiEmojiPicker.prototype, "showText", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiEmojiPicker.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiEmojiPicker.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiEmojiPicker.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiEmojiPicker.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiEmojiPicker.prototype, "open", void 0);
__decorate([
    state()
], LoomiEmojiPicker.prototype, "search", void 0);
__decorate([
    state()
], LoomiEmojiPicker.prototype, "category", void 0);
__decorate([
    state()
], LoomiEmojiPicker.prototype, "activeIndex", void 0);
__decorate([
    query(".loomi-search")
], LoomiEmojiPicker.prototype, "searchEl", void 0);
__decorate([
    query("loomi-popover")
], LoomiEmojiPicker.prototype, "popoverEl", void 0);
LoomiEmojiPicker = __decorate([
    customElement("loomi-emoji-picker")
], LoomiEmojiPicker);
export { LoomiEmojiPicker };
//# sourceMappingURL=loomi-emoji-picker.js.map