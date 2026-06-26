var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const BELL = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />`;
/**
 * `<loomi-bell>` — a notification bell with an optional (optionally animated) status dot.
 */
let LoomiBell = class LoomiBell extends LoomiElement {
    constructor() {
        super(...arguments);
        this.color = "primary";
        this.size = "small";
        this.showDot = true;
        this.animateDot = false;
        this.invert = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<span class="loomi-bell size-${this.size} ${this.invert ? "invert" : ""}" style=${accentVars(this.color)}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${BELL}</svg>
      ${this.showDot
            ? html `${this.animateDot ? html `<span class="loomi-ping"></span>` : nothing}<span class="loomi-dot"></span>`
            : nothing}
    </span>`;
    }
};
__decorate([
    property()
], LoomiBell.prototype, "color", void 0);
__decorate([
    property()
], LoomiBell.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-dot" })
], LoomiBell.prototype, "showDot", void 0);
__decorate([
    property({ type: Boolean, attribute: "animate-dot" })
], LoomiBell.prototype, "animateDot", void 0);
__decorate([
    property({ type: Boolean })
], LoomiBell.prototype, "invert", void 0);
LoomiBell = __decorate([
    customElement("loomi-bell")
], LoomiBell);
export { LoomiBell };
//# sourceMappingURL=loomi-bell.js.map