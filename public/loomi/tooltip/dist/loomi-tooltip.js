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
 * `<loomi-tooltip>` — shows a tooltip on hover/focus of its trigger content.
 *
 * @slot - The trigger element(s).
 * @slot content - Rich tooltip content (overrides the `content` attribute).
 */
let LoomiTooltip = class LoomiTooltip extends LoomiElement {
    constructor() {
        super(...arguments);
        this.content = "";
        this.placement = "top";
        this.shade = "dark";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `
      <slot></slot>
      <span class="loomi-tip placement-${this.placement}" role="tooltip">
        <slot name="content">${this.content}</slot>
      </span>
    `;
    }
};
__decorate([
    property()
], LoomiTooltip.prototype, "content", void 0);
__decorate([
    property()
], LoomiTooltip.prototype, "placement", void 0);
__decorate([
    property({ reflect: true })
], LoomiTooltip.prototype, "shade", void 0);
LoomiTooltip = __decorate([
    customElement("loomi-tooltip")
], LoomiTooltip);
export { LoomiTooltip };
//# sourceMappingURL=loomi-tooltip.js.map