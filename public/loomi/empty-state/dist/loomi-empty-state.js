var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const DEFAULT_ART = svg `<svg viewBox="0 0 120 100" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <rect x="18" y="28" width="84" height="56" rx="6" stroke="currentColor" stroke-width="3" />
  <path d="M18 44h84" stroke="currentColor" stroke-width="3" />
  <circle cx="27" cy="36" r="2.2" fill="currentColor" />
  <circle cx="35" cy="36" r="2.2" fill="currentColor" />
  <path d="M40 60h40M40 70h26" stroke="currentColor" stroke-width="3" stroke-linecap="round" />
</svg>`;
/**
 * `<loomi-empty-state>` — a friendly placeholder for empty content with an optional
 * heading, message and action button.
 *
 * @slot - Custom content (used when `show-image="false"`).
 * @fires action - Fired when the action button is clicked.
 */
let LoomiEmptyState = class LoomiEmptyState extends LoomiElement {
    constructor() {
        super(...arguments);
        this.heading = "";
        this.message = "";
        this.buttonLabel = "";
        this.showImage = true;
        this.image = "";
        this.imageSize = "medium";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        if (!this.showImage) {
            return html `<div class="loomi-empty"><slot></slot></div>`;
        }
        return html `<div class="loomi-empty">
      <div class="loomi-img size-${this.imageSize}">
        ${this.image ? html `<img src=${this.image} alt="" />` : DEFAULT_ART}
      </div>
      ${this.heading ? html `<div class="loomi-heading">${this.heading}</div>` : nothing}
      ${this.message ? html `<div class="loomi-message">${this.message}</div>` : nothing}
      ${this.buttonLabel
            ? html `<button class="loomi-btn" @click=${() => this.dispatchEvent(new Event("action", { bubbles: true, composed: true }))}>${this.buttonLabel}</button>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiEmptyState.prototype, "heading", void 0);
__decorate([
    property()
], LoomiEmptyState.prototype, "message", void 0);
__decorate([
    property({ attribute: "button-label" })
], LoomiEmptyState.prototype, "buttonLabel", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-image" })
], LoomiEmptyState.prototype, "showImage", void 0);
__decorate([
    property()
], LoomiEmptyState.prototype, "image", void 0);
__decorate([
    property({ attribute: "image-size" })
], LoomiEmptyState.prototype, "imageSize", void 0);
LoomiEmptyState = __decorate([
    customElement("loomi-empty-state")
], LoomiEmptyState);
export { LoomiEmptyState };
//# sourceMappingURL=loomi-empty-state.js.map