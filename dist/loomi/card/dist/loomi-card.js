var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-card>` — a content card with an optional title and header/footer slots.
 * When a `header` slot is present, the body padding is removed (match it yourself).
 *
 * @slot - The card body.
 * @slot header - Fixed header region.
 * @slot footer - Fixed footer region.
 */
let LoomiCard = class LoomiCard extends LitElement {
    constructor() {
        super(...arguments);
        this.title = "";
        this.compact = false;
        this.noPadding = false;
        this.hasShadow = true;
        this.hasHover = false;
        this.radius = "small";
        this.url = "";
        this.onClick = () => {
            if (!this.url)
                return;
            if (/^https?:\/\//.test(this.url))
                window.open(this.url, "_blank");
            else if (/\)$/.test(this.url))
                new Function(this.url)();
            else
                location.href = this.url;
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get hasHeader() {
        return !!this.querySelector('[slot="header"]');
    }
    get hasFooter() {
        return !!this.querySelector('[slot="footer"]');
    }
    render() {
        const bodyCls = this.hasHeader || this.noPadding
            ? "flush"
            : this.compact
                ? "compact"
                : "";
        const cls = [
            "loomi-card",
            `r-${this.radius}`,
            this.hasShadow ? "shadow" : "",
            this.hasHover ? "hover" : "",
            this.url ? "clickable" : "",
        ].join(" ");
        return html `<div class=${cls} @click=${this.url ? this.onClick : nothing}>
      ${this.hasHeader ? html `<div class="loomi-header"><slot name="header"></slot></div>` : nothing}
      ${this.title && !this.hasHeader ? html `<div class="loomi-title">${this.title}</div>` : nothing}
      <div class="loomi-body ${bodyCls}"><slot></slot></div>
      ${this.hasFooter ? html `<div class="loomi-footer"><slot name="footer"></slot></div>` : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiCard.prototype, "title", void 0);
__decorate([
    property({ type: Boolean })
], LoomiCard.prototype, "compact", void 0);
__decorate([
    property({ type: Boolean, attribute: "no-padding" })
], LoomiCard.prototype, "noPadding", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-shadow" })
], LoomiCard.prototype, "hasShadow", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-hover" })
], LoomiCard.prototype, "hasHover", void 0);
__decorate([
    property()
], LoomiCard.prototype, "radius", void 0);
__decorate([
    property()
], LoomiCard.prototype, "url", void 0);
LoomiCard = __decorate([
    customElement("loomi-card")
], LoomiCard);
export { LoomiCard };
//# sourceMappingURL=loomi-card.js.map