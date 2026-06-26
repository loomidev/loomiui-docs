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
/**
 * `<loomi-icon>` — renders an icon from the shared `@loomi/icons` registry by `name`,
 * a file from a custom directory, or any custom SVG placed in the default slot. Registry
 * icons follow `currentColor`; file icons render as images. Size is controlled with the
 * `size` attribute or the `--loomi-icon-size` custom property.
 *
 * @slot - Custom inline `<svg>` (overrides `name`).
 */
let LoomiIcon = class LoomiIcon extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Registered icon name (see `@loomi/icons`). */
        this.name = "";
        /** Heroicons style variant. */
        this.variant = "outline";
        /** Directory for file-based icons. `name` becomes the file name. */
        this.directory = "";
        /** Stroke width for registry icons. */
        this.strokeWidth = "1.5";
        /** CSS size, e.g. `1.5rem`, `32px`. Sets `--loomi-icon-size`. */
        this.size = "";
        /** Accessible label; when omitted the icon is `aria-hidden`. */
        this.label = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get fileIconUrl() {
        if (!this.directory || !this.name)
            return "";
        const cleanDirectory = this.directory.replace(/\/+$/, "");
        const fileName = /\.[a-z0-9]+$/i.test(this.name) ? this.name : `${this.name}.svg`;
        return `${cleanDirectory}/${encodeURIComponent(fileName)}`;
    }
    render() {
        if (this.size)
            this.style.setProperty("--loomi-icon-size", this.size);
        const variant = this.variant === "solid" ? "solid" : "outline";
        const labelled = !!this.label;
        const role = labelled ? "img" : nothing;
        const ariaLabel = labelled ? this.label : nothing;
        const ariaHidden = labelled ? nothing : "true";
        const fileIconUrl = this.fileIconUrl;
        if (fileIconUrl) {
            return html `<img
        src=${fileIconUrl}
        alt=${labelled ? this.label : ""}
        role=${role}
        aria-label=${ariaLabel}
        aria-hidden=${ariaHidden}
      />`;
        }
        const path = this.name ? getLoomiIcon(this.name, variant) : undefined;
        if (!path) {
            // No registry match — render whatever SVG is slotted.
            return html `<slot role=${role} aria-label=${ariaLabel} aria-hidden=${ariaHidden}></slot>`;
        }
        return html `<svg
      viewBox="0 0 24 24"
      fill=${variant === "solid" ? "currentColor" : "none"}
      stroke=${variant === "solid" ? "none" : "currentColor"}
      stroke-width=${variant === "solid" ? nothing : this.strokeWidth}
      role=${role}
      aria-label=${ariaLabel}
      aria-hidden=${ariaHidden}
    >
      ${path}
    </svg>`;
    }
};
__decorate([
    property()
], LoomiIcon.prototype, "name", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "variant", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "directory", void 0);
__decorate([
    property({ attribute: "stroke-width" })
], LoomiIcon.prototype, "strokeWidth", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "size", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "label", void 0);
LoomiIcon = __decorate([
    customElement("loomi-icon")
], LoomiIcon);
export { LoomiIcon };
//# sourceMappingURL=loomi-icon.js.map