var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-statistic>` — a dashboard stat showing a `number` and `label`, with optional
 * currency, icon (slot) and loading spinner.
 *
 * @slot icon - Leading (or trailing) icon/illustration.
 */
let LoomiStatistic = class LoomiStatistic extends LoomiElement {
    constructor() {
        super(...arguments);
        this.label = "";
        this.locale = "";
        this.number = "";
        this.labelPosition = "top";
        this.currency = "";
        this.currencyPosition = "left";
        this.iconPosition = "left";
        this.hasShadow = true;
        this.hasBorder = true;
        this.showSpinner = false;
        this.radius = "small";
        this.url = "";
        this.iconColor = "";
        this.iconSize = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get hasIcon() {
        return !!this.querySelector('[slot="icon"]');
    }
    render() {
        const cls = [
            "loomi-stat",
            `r-${this.radius}`,
            this.hasShadow ? "shadow" : "",
            this.hasBorder ? "bordered" : "",
            this.iconPosition === "right" ? "icon-right" : "",
            this.url ? "clickable" : "",
        ].join(" ");
        const iconStyle = [
            this.iconColor ? `--loomi-stat-icon-color:${this.iconColor}` : "",
            this.iconSize ? `--loomi-stat-icon-size:${this.iconSize}` : "",
        ].filter(Boolean).join(";");
        return html `
      <div
        class=${cls}
        role=${this.url ? "link" : nothing}
        tabindex=${this.url ? "0" : nothing}
        @click=${this.url ? () => (location.href = this.url) : nothing}
      >
        ${this.hasIcon ? html `<div class="loomi-ico" part="icon" style=${iconStyle}><slot name="icon"></slot></div>` : null}
        <div class="loomi-body ${this.labelPosition}">
          <div class="loomi-label">${this.label}</div>
          ${this.showSpinner
            ? html `<svg class="loomi-spinner" viewBox="0 0 24 24" fill="none" aria-label=${loomiT("common.loading", {}, this.locale)}><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3" opacity="0.25"></circle><path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path></svg>`
            : html `<div class="loomi-number ${this.currency && this.currencyPosition === "right" ? "currency-right" : ""}">
                ${this.currency ? html `<span class="loomi-currency">${this.currency}</span>` : null}
                <span>${this.number}</span>
              </div>`}
        </div>
      </div>`;
    }
};
__decorate([
    property()
], LoomiStatistic.prototype, "label", void 0);
__decorate([
    property()
], LoomiStatistic.prototype, "locale", void 0);
__decorate([
    property()
], LoomiStatistic.prototype, "number", void 0);
__decorate([
    property({ attribute: "label-position" })
], LoomiStatistic.prototype, "labelPosition", void 0);
__decorate([
    property()
], LoomiStatistic.prototype, "currency", void 0);
__decorate([
    property({ attribute: "currency-position" })
], LoomiStatistic.prototype, "currencyPosition", void 0);
__decorate([
    property({ attribute: "icon-position" })
], LoomiStatistic.prototype, "iconPosition", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-shadow" })
], LoomiStatistic.prototype, "hasShadow", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-border" })
], LoomiStatistic.prototype, "hasBorder", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-spinner" })
], LoomiStatistic.prototype, "showSpinner", void 0);
__decorate([
    property()
], LoomiStatistic.prototype, "radius", void 0);
__decorate([
    property()
], LoomiStatistic.prototype, "url", void 0);
__decorate([
    property({ attribute: "icon-color" })
], LoomiStatistic.prototype, "iconColor", void 0);
__decorate([
    property({ attribute: "icon-size" })
], LoomiStatistic.prototype, "iconSize", void 0);
LoomiStatistic = __decorate([
    customElement("loomi-statistic")
], LoomiStatistic);
export { LoomiStatistic };
//# sourceMappingURL=loomi-statistic.js.map