var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-centered-content>` — vertically and horizontally centers its content. Handy for
 * sign-in screens, empty pages and hero sections.
 *
 * @slot - The content to center.
 */
let LoomiCenteredContent = class LoomiCenteredContent extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Minimum height of the centering area (any CSS length). */
        this.minHeight = "";
        /** Maximum width of the inner content (any CSS length). */
        this.maxWidth = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        if (this.minHeight)
            this.style.setProperty("--loomi-center-min", this.minHeight);
        if (this.maxWidth)
            this.style.setProperty("--loomi-center-max", this.maxWidth);
        return html `<div class="loomi-center"><div class="loomi-inner"><slot></slot></div></div>`;
    }
};
__decorate([
    property({ attribute: "min-height" })
], LoomiCenteredContent.prototype, "minHeight", void 0);
__decorate([
    property({ attribute: "max-width" })
], LoomiCenteredContent.prototype, "maxWidth", void 0);
LoomiCenteredContent = __decorate([
    customElement("loomi-centered-content")
], LoomiCenteredContent);
export { LoomiCenteredContent };
//# sourceMappingURL=loomi-centered-content.js.map