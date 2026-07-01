var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-divider>` — a content divider that can separate sections horizontally
 * or vertically, with optional text/content centered in the rule.
 *
 * @slot - Optional divider content.
 */
let LoomiDivider = class LoomiDivider extends LoomiElement {
    constructor() {
        super(...arguments);
        this.orientation = "horizontal";
        this.align = "center";
        this.variant = "solid";
        this.label = "";
        this.color = "gray";
        this.thickness = "1px";
        this.spacing = "0.75rem";
        this.hasSlottedContent = false;
        this.syncSlottedContent = () => {
            this.hasSlottedContent = Array.from(this.childNodes).some((node) => {
                if (node.nodeType === 3)
                    return !!node.textContent?.trim();
                return true;
            });
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.syncSlottedContent();
    }
    get hasContent() {
        return !!this.label || this.hasSlottedContent;
    }
    get dividerStyle() {
        return [
            accentVars(this.color),
            `--_loomi-divider-thickness:${this.thickness}`,
            `--_loomi-divider-spacing:${this.spacing}`,
            "",
        ].join(";");
    }
    render() {
        const orientation = this.orientation === "vertical" ? "vertical" : "horizontal";
        const align = this.align === "start" || this.align === "end" ? this.align : "center";
        const variant = this.variant === "dashed" || this.variant === "dotted" ? this.variant : "solid";
        return html `<div
      class="loomi-divider ${orientation} align-${align} ${variant} ${this.hasContent ? "with-content" : "empty"}"
      style=${this.dividerStyle}
      role="separator"
      aria-orientation=${orientation}
    >
      <span class="loomi-line" aria-hidden="true"></span>
      ${this.hasContent
            ? html `<span class="loomi-content"><slot @slotchange=${this.syncSlottedContent}>${this.label}</slot></span>
            <span class="loomi-line" aria-hidden="true"></span>`
            : html `<slot @slotchange=${this.syncSlottedContent}></slot>`}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiDivider.prototype, "orientation", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "align", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "variant", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "label", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "color", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "thickness", void 0);
__decorate([
    property()
], LoomiDivider.prototype, "spacing", void 0);
__decorate([
    state()
], LoomiDivider.prototype, "hasSlottedContent", void 0);
LoomiDivider = __decorate([
    customElement("loomi-divider")
], LoomiDivider);
export { LoomiDivider };
//# sourceMappingURL=loomi-divider.js.map