var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import { componentStyles } from "./generated/styles.css.js";
function icon(name) {
    return html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${getLoomiIcon(name)}</svg>`;
}
/**
 * `<loomi-contact-card>` — a ready-made card for displaying a contact.
 * @slot - Extra content rendered below the contact details.
 */
let LoomiContactCard = class LoomiContactCard extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.position = "";
        this.department = "";
        this.image = "";
        this.email = "";
        this.mobile = "";
        this.birthday = "";
        this.hasShadow = true;
        this.hasHover = false;
        this.centered = false;
        this.noPadding = false;
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
    initials() {
        return this.name.split(/\s+/).map((w) => w[0]).slice(0, 2).join("");
    }
    render() {
        const cls = [
            "loomi-cc",
            this.hasShadow ? "shadow" : "",
            this.hasHover ? "hover" : "",
            this.centered ? "centered" : "",
            this.noPadding ? "flush" : "",
            this.url ? "clickable" : "",
        ].join(" ");
        return html `<div class=${cls} @click=${this.url ? this.onClick : nothing}>
      ${this.image
            ? html `<img class="loomi-avatar" src=${this.image} alt=${this.name} />`
            : html `<span class="loomi-avatar">${this.initials()}</span>`}
      <div class="loomi-body">
        <div class="loomi-name">${this.name}</div>
        ${this.position || this.department
            ? html `<div class="loomi-position">${[this.position, this.department].filter(Boolean).join(" · ")}</div>`
            : nothing}
        ${this.email ? html `<div class="loomi-row">${icon("envelope")}<a href="mailto:${this.email}">${this.email}</a></div>` : nothing}
        ${this.mobile ? html `<div class="loomi-row">${icon("phone")}<a href="tel:${this.mobile}">${this.mobile}</a></div>` : nothing}
        ${this.birthday ? html `<div class="loomi-row">${icon("cake")}<span>${this.birthday}</span></div>` : nothing}
        <slot></slot>
      </div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiContactCard.prototype, "name", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "position", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "department", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "image", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "email", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "mobile", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "birthday", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-shadow" })
], LoomiContactCard.prototype, "hasShadow", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-hover" })
], LoomiContactCard.prototype, "hasHover", void 0);
__decorate([
    property({ type: Boolean })
], LoomiContactCard.prototype, "centered", void 0);
__decorate([
    property({ type: Boolean, attribute: "no-padding" })
], LoomiContactCard.prototype, "noPadding", void 0);
__decorate([
    property()
], LoomiContactCard.prototype, "url", void 0);
LoomiContactCard = __decorate([
    customElement("loomi-contact-card")
], LoomiContactCard);
export { LoomiContactCard };
//# sourceMappingURL=loomi-contact-card.js.map