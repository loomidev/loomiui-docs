var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loomiStyles, accentVars } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import { componentStyles } from "./generated/styles.css.js";
const TYPE_COLOR = {
    info: "blue",
    error: "red",
    warning: "orange",
    success: "green",
};
const TYPE_ICON = {
    info: "information-circle",
    error: "x-circle",
    warning: "exclamation-triangle",
    success: "check-circle",
};
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
 * `<loomi-alert>` — an inline alert message. Four prebuilt types with default icons,
 * `faint`/`dark` shades, palette overrides, an optional avatar and a dismiss button.
 *
 * @slot - The alert message (may contain HTML/links).
 * @fires close - Fired when dismissed (the alert hides itself unless prevented).
 */
let LoomiAlert = class LoomiAlert extends LitElement {
    constructor() {
        super(...arguments);
        this.type = "info";
        this.shade = "faint";
        this.color = "";
        this.showIcon = true;
        this.showCloseIcon = true;
        this.icon = "";
        this.avatar = "";
        this.showRing = false;
        this.dismissed = false;
        this.onClose = () => {
            const ev = new CustomEvent("close", { bubbles: true, composed: true, cancelable: true });
            if (this.dispatchEvent(ev))
                this.dismissed = true;
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    renderIcon(name) {
        const path = getLoomiIcon(name);
        if (!path)
            return nothing;
        return html `<svg class="loomi-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>`;
    }
    render() {
        if (this.dismissed)
            return nothing;
        const transparent = this.color === "transparent";
        const color = (this.color && !transparent ? this.color : TYPE_COLOR[this.type]);
        const iconName = this.icon || (this.color ? "" : TYPE_ICON[this.type]);
        const cls = `loomi-alert ${this.shade} ${transparent ? "transparent" : ""}`;
        return html `<div class=${cls} role="alert" style=${accentVars(color)}>
      ${this.avatar
            ? html `<img class="loomi-avatar ${this.showRing ? "ring" : ""}" src=${this.avatar} alt="" />`
            : this.showIcon && iconName
                ? this.renderIcon(iconName)
                : nothing}
      <div class="loomi-body"><slot></slot></div>
      ${this.showCloseIcon
            ? html `<button type="button" class="loomi-close" aria-label="Dismiss" @click=${this.onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${X}</svg>
          </button>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiAlert.prototype, "type", void 0);
__decorate([
    property()
], LoomiAlert.prototype, "shade", void 0);
__decorate([
    property()
], LoomiAlert.prototype, "color", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-icon", converter: booleanAttribute })
], LoomiAlert.prototype, "showIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-close-icon", converter: booleanAttribute })
], LoomiAlert.prototype, "showCloseIcon", void 0);
__decorate([
    property()
], LoomiAlert.prototype, "icon", void 0);
__decorate([
    property()
], LoomiAlert.prototype, "avatar", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-ring" })
], LoomiAlert.prototype, "showRing", void 0);
__decorate([
    state()
], LoomiAlert.prototype, "dismissed", void 0);
LoomiAlert = __decorate([
    customElement("loomi-alert")
], LoomiAlert);
export { LoomiAlert };
//# sourceMappingURL=loomi-alert.js.map