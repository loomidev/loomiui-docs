var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
/**
 * `<loomi-tag>` — a themeable label/badge. Faint or dark shade, optional outline,
 * rounded, tiny, and a close button.
 *
 * @slot - Tag content (falls back to the `label` attribute).
 * @fires close - Fired when the close button is clicked (the tag removes itself unless prevented).
 */
let LoomiTag = class LoomiTag extends LoomiElement {
    constructor() {
        super(...arguments);
        this.label = "";
        this.locale = "";
        this.color = "primary";
        this.shade = "faint";
        this.canClose = false;
        this.outline = false;
        this.rounded = false;
        this.tiny = false;
        this.uppercasing = false;
        this.onClose = () => {
            const ev = new CustomEvent("close", { bubbles: true, composed: true, cancelable: true });
            const proceed = this.dispatchEvent(ev);
            if (proceed)
                this.remove();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const cls = [
            "loomi-tag",
            this.outline ? "outline" : "",
            this.shade,
            this.rounded ? "rounded" : "",
            this.tiny ? "tiny" : "",
            this.uppercasing ? "uppercasing" : "",
        ].join(" ");
        return html `<span class=${cls} style=${accentVars(this.color)}>
      <slot>${this.label}</slot>
      ${this.canClose
            ? html `<button type="button" class="loomi-close" aria-label=${loomiT("common.remove", {}, this.locale)} @click=${this.onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${X}</svg>
          </button>`
            : nothing}
    </span>`;
    }
};
__decorate([
    property()
], LoomiTag.prototype, "label", void 0);
__decorate([
    property()
], LoomiTag.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTag.prototype, "color", void 0);
__decorate([
    property()
], LoomiTag.prototype, "shade", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-close" })
], LoomiTag.prototype, "canClose", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "outline", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "rounded", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "tiny", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "uppercasing", void 0);
LoomiTag = __decorate([
    customElement("loomi-tag")
], LoomiTag);
export { LoomiTag };
/**
 * `<loomi-tags>` — a simple flex container for laying out multiple `<loomi-tag>`.
 *
 * @slot - `<loomi-tag>` children.
 */
let LoomiTags = class LoomiTags extends LoomiElement {
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute("data-group", "");
    }
    render() {
        return html `<slot></slot>`;
    }
};
LoomiTags = __decorate([
    customElement("loomi-tags")
], LoomiTags);
export { LoomiTags };
//# sourceMappingURL=loomi-tag.js.map