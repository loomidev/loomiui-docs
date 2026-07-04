var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-card>` — shadcn/ui-style card root. Compose with the `loomi-card-*` parts.
 *
 * @slot - Card sections (`loomi-card-header`, `loomi-card-content`, `loomi-card-footer`, …).
 */
let LoomiCard = class LoomiCard extends LoomiElement {
    constructor() {
        super(...arguments);
        this.size = "default";
        this.url = "";
        this.hasHover = false;
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
        this.onKeydown = (event) => {
            if (!this.url)
                return;
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                this.onClick();
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const cls = ["card", this.url ? "clickable" : "", this.hasHover ? "hover" : ""]
            .filter(Boolean)
            .join(" ");
        return html `<div
      class=${cls}
      role=${this.url ? "link" : nothing}
      tabindex=${this.url ? "0" : nothing}
      @click=${this.url ? this.onClick : nothing}
      @keydown=${this.url ? this.onKeydown : nothing}
    ><slot></slot></div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiCard.prototype, "size", void 0);
__decorate([
    property()
], LoomiCard.prototype, "url", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-hover" })
], LoomiCard.prototype, "hasHover", void 0);
LoomiCard = __decorate([
    customElement("loomi-card")
], LoomiCard);
export { LoomiCard };
/**
 * `<loomi-card-header>` — title, description, and optional action region.
 *
 * @slot - `loomi-card-title`, `loomi-card-description`, and/or `loomi-card-action`.
 */
let LoomiCardHeader = class LoomiCardHeader extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="header" data-slot="card-header"><slot></slot></div>`;
    }
};
LoomiCardHeader = __decorate([
    customElement("loomi-card-header")
], LoomiCardHeader);
export { LoomiCardHeader };
/**
 * `<loomi-card-title>` — card heading.
 *
 * @slot - Title text.
 */
let LoomiCardTitle = class LoomiCardTitle extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="title" data-slot="card-title"><slot></slot></div>`;
    }
};
LoomiCardTitle = __decorate([
    customElement("loomi-card-title")
], LoomiCardTitle);
export { LoomiCardTitle };
/**
 * `<loomi-card-description>` — helper text under the title.
 *
 * @slot - Description text.
 */
let LoomiCardDescription = class LoomiCardDescription extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="description" data-slot="card-description"><slot></slot></div>`;
    }
};
LoomiCardDescription = __decorate([
    customElement("loomi-card-description")
], LoomiCardDescription);
export { LoomiCardDescription };
/**
 * `<loomi-card-action>` — top-right header action (button, badge, link, …).
 *
 * @slot - Action content.
 */
let LoomiCardAction = class LoomiCardAction extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="action" data-slot="card-action"><slot></slot></div>`;
    }
};
LoomiCardAction = __decorate([
    customElement("loomi-card-action")
], LoomiCardAction);
export { LoomiCardAction };
/**
 * `<loomi-card-content>` — main card body.
 *
 * @slot - Card content.
 */
let LoomiCardContent = class LoomiCardContent extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="content" data-slot="card-content"><slot></slot></div>`;
    }
};
LoomiCardContent = __decorate([
    customElement("loomi-card-content")
], LoomiCardContent);
export { LoomiCardContent };
/**
 * `<loomi-card-footer>` — actions and secondary content at the bottom.
 *
 * @slot - Footer content.
 */
let LoomiCardFooter = class LoomiCardFooter extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="footer" data-slot="card-footer"><slot></slot></div>`;
    }
};
LoomiCardFooter = __decorate([
    customElement("loomi-card-footer")
], LoomiCardFooter);
export { LoomiCardFooter };
//# sourceMappingURL=loomi-card.js.map