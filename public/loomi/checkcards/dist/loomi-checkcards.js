var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />`;
/**
 * `<loomi-checkcard>` — a single selectable card. Use inside `<loomi-checkcards>`.
 * @slot - Card body content.
 */
let LoomiCheckcard = class LoomiCheckcard extends LoomiElement {
    constructor() {
        super(...arguments);
        this.value = "";
        this.title = "";
        this.icon = "";
        this.avatar = "";
        this.selected = false;
        this.compact = false;
        this.radius = "medium";
        this.alignItems = "top";
    }
    static { this.styles = loomiStyles(componentStyles); }
    media() {
        if (this.avatar) {
            return this.avatar.length <= 3
                ? html `<span class="loomi-avatar">${this.avatar}</span>`
                : html `<img class="loomi-avatar" src=${this.avatar} alt="" />`;
        }
        if (this.icon && getLoomiIcon(this.icon)) {
            return html `<span class="loomi-media"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${getLoomiIcon(this.icon)}</svg></span>`;
        }
        return nothing;
    }
    render() {
        return html `<div
      class="loomi-card r-${this.radius} ${this.compact ? "compact" : ""} ${this.alignItems === "center" ? "center" : ""}"
      role="checkbox"
      aria-checked=${this.selected ? "true" : "false"}
      @click=${() => this.dispatchEvent(new CustomEvent("loomi-checkcard-click", { bubbles: true, composed: true, detail: { value: this.value } }))}
    >
      <svg class="loomi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${CHECK}</svg>
      ${this.media()}
      <div class="loomi-body">
        ${this.title ? html `<div class="loomi-title">${this.title}</div>` : nothing}
        <div class="loomi-content"><slot></slot></div>
      </div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiCheckcard.prototype, "value", void 0);
__decorate([
    property()
], LoomiCheckcard.prototype, "title", void 0);
__decorate([
    property()
], LoomiCheckcard.prototype, "icon", void 0);
__decorate([
    property()
], LoomiCheckcard.prototype, "avatar", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCheckcard.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean })
], LoomiCheckcard.prototype, "compact", void 0);
__decorate([
    property()
], LoomiCheckcard.prototype, "radius", void 0);
__decorate([
    property({ attribute: "align-items" })
], LoomiCheckcard.prototype, "alignItems", void 0);
LoomiCheckcard = __decorate([
    customElement("loomi-checkcard")
], LoomiCheckcard);
export { LoomiCheckcard };
/**
 * `<loomi-checkcards>` — selectable cards (a prettier checkbox/radio group).
 * Form-associated: submits selected values (comma-joined) under `name`.
 *
 * @slot - `<loomi-checkcard>` children.
 * @fires change - `detail: { values }` when the selection changes.
 */
let LoomiCheckcards = class LoomiCheckcards extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.max = 1;
        this.color = "primary";
        this.borderColor = "";
        this.borderWidth = 2;
        this.radius = "medium";
        this.compact = false;
        this.selectedValue = "";
        this.autoSelectNew = true;
        this.alignItems = "top";
        this.selected = [];
        this.initialized = false;
        this.onCardClick = (e) => {
            const value = e.detail.value;
            const has = this.selected.includes(value);
            if (has) {
                this.selected = this.selected.filter((v) => v !== value);
            }
            else if (this.max === 1) {
                this.selected = [value];
            }
            else if (this.selected.length < this.max) {
                this.selected = [...this.selected, value];
            }
            else if (this.autoSelectNew) {
                this.selected = [...this.selected.slice(1), value];
            }
            else {
                return; // blocked
            }
            this.internals.setFormValue(this.selected.join(","));
            this.sync();
            this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { values: [...this.selected] } }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    get cards() {
        return Array.from(this.querySelectorAll("loomi-checkcard"));
    }
    willUpdate() {
        if (!this.initialized) {
            this.selected = this.selectedValue ? this.selectedValue.split(",").map((s) => s.trim()).filter(Boolean) : [];
            this.initialized = true;
        }
        this.internals.setFormValue(this.selected.join(","));
    }
    sync() {
        for (const card of this.cards) {
            card.selected = this.selected.includes(card.value);
            card.compact = this.compact;
            card.radius = this.radius;
            card.alignItems = this.alignItems;
        }
    }
    firstUpdated() {
        this.sync();
    }
    render() {
        const accent = accentVars(this.borderColor || this.color);
        return html `<div class="loomi-cards" style=${accent + `--loomi-cc-border:${this.borderWidth}px`} @loomi-checkcard-click=${this.onCardClick}>
      <slot @slotchange=${() => this.sync()}></slot>
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiCheckcards.prototype, "name", void 0);
__decorate([
    property({ type: Number })
], LoomiCheckcards.prototype, "max", void 0);
__decorate([
    property()
], LoomiCheckcards.prototype, "color", void 0);
__decorate([
    property({ attribute: "border-color" })
], LoomiCheckcards.prototype, "borderColor", void 0);
__decorate([
    property({ type: Number, attribute: "border-width" })
], LoomiCheckcards.prototype, "borderWidth", void 0);
__decorate([
    property()
], LoomiCheckcards.prototype, "radius", void 0);
__decorate([
    property({ type: Boolean })
], LoomiCheckcards.prototype, "compact", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiCheckcards.prototype, "selectedValue", void 0);
__decorate([
    property({ type: Boolean, attribute: "auto-select-new" })
], LoomiCheckcards.prototype, "autoSelectNew", void 0);
__decorate([
    property({ attribute: "align-items" })
], LoomiCheckcards.prototype, "alignItems", void 0);
LoomiCheckcards = __decorate([
    customElement("loomi-checkcards")
], LoomiCheckcards);
export { LoomiCheckcards };
//# sourceMappingURL=loomi-checkcards.js.map