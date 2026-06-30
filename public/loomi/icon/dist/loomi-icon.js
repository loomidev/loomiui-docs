var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { getLoomiIcon, getLoomiDiskIconUrl, loadLoomiDiskIcon, isLoomiDiskIconSource, } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const RADIUS = {
    none: "rounded-none",
    small: "rounded",
    medium: "rounded-lg",
    full: "rounded-full",
};
/**
 * `<loomi-icon>` — renders an icon from the shared `@loomidev/icons` registry by `name`,
 * a file from a custom directory, or any custom SVG placed in the default slot.
 *
 * `source` picks the icon set. `heroicons` (default) is inlined at build time. `iconsax`
 * and `untitledui` are disk-based: their real `.svg` files ship inside `@loomidev/icons`
 * and are fetched (and cached in memory) the first time each one is used, instead of
 * bloating every consumer's bundle with every icon in the set. All registry icons follow
 * `currentColor`; file icons (via `directory`) render as images instead. Size is
 * controlled with the `size` attribute or the `--loomi-icon-size` custom property.
 *
 * Set `branded` to sit the icon on a rounded, primary-colored background badge instead
 * of rendering it bare — `shade` picks a light tint or a solid fill, `radius` picks the
 * corner rounding.
 *
 * @slot - Custom inline `<svg>` (overrides `name`).
 */
let LoomiIcon = class LoomiIcon extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Registered icon name (see `@loomidev/icons`). */
        this.name = "";
        /** Icon set to render from. */
        this.source = "heroicons";
        /** Visual style. Availability depends on `source` — see the README's attribute table. */
        this.variant = "outline";
        /** Directory for file-based icons. `name` becomes the file name. */
        this.directory = "";
        /** Stroke width. Heroicons outline only — the other sets ship a fixed weight. */
        this.strokeWidth = "1.5";
        /** CSS size, e.g. `1.5rem`, `32px`. Sets `--loomi-icon-size`. */
        this.size = "";
        /** Accessible label; when omitted the icon is `aria-hidden`. */
        this.label = "";
        /** Render the icon on a rounded, primary-colored background badge. */
        this.branded = false;
        /** Badge background: a light primary tint, or a solid primary fill. Only applies when `branded`. */
        this.shade = "light";
        /** Badge corner radius. Only applies when `branded`. */
        this.radius = "medium";
        this._diskRequest = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get fileIconUrl() {
        if (!this.directory || !this.name)
            return "";
        const cleanDirectory = this.directory.replace(/\/+$/, "");
        const fileName = /\.[a-z0-9]+$/i.test(this.name) ? this.name : `${this.name}.svg`;
        return `${cleanDirectory}/${encodeURIComponent(fileName)}`;
    }
    willUpdate(changed) {
        if (!changed.has("name") && !changed.has("source") && !changed.has("variant") && !changed.has("directory")) {
            return;
        }
        const source = this.source;
        if (this.directory || !isLoomiDiskIconSource(source) || !this.name) {
            this._diskRequest = "";
            return;
        }
        const requestKey = `${source}:${this.variant}:${this.name}`;
        if (requestKey === this._diskRequest)
            return;
        this._diskRequest = requestKey;
        loadLoomiDiskIcon(source, this.name, this.variant).then((markup) => {
            if (this._diskRequest !== requestKey)
                return; // superseded by a newer request
            this._diskIcon = markup;
        });
    }
    renderContent() {
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
        const source = this.source;
        if (isLoomiDiskIconSource(source)) {
            const known = this.name && getLoomiDiskIconUrl(source, this.name, this.variant);
            if (!known) {
                // Unregistered name for this source — render whatever SVG is slotted.
                return html `<slot role=${role} aria-label=${ariaLabel} aria-hidden=${ariaHidden}></slot>`;
            }
            // Sized placeholder until the fetch resolves, so there's no layout jump.
            return html `<svg viewBox="0 0 24 24" fill="none" role=${role} aria-label=${ariaLabel} aria-hidden=${ariaHidden}
        >${this._diskIcon ?? nothing}</svg
      >`;
        }
        const variant = this.variant === "solid" ? "solid" : "outline";
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
    render() {
        if (this.size)
            this.style.setProperty("--loomi-icon-size", this.size);
        const content = this.renderContent();
        if (!this.branded)
            return content;
        const cls = ["loomi-icon-badge", this.shade, RADIUS[this.radius] ?? RADIUS.medium].join(" ");
        return html `<span class=${cls} style=${accentVars("primary")}>${content}</span>`;
    }
};
__decorate([
    property()
], LoomiIcon.prototype, "name", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "source", void 0);
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
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiIcon.prototype, "branded", void 0);
__decorate([
    property()
], LoomiIcon.prototype, "shade", void 0);
__decorate([
    property({ reflect: true })
], LoomiIcon.prototype, "radius", void 0);
__decorate([
    state()
], LoomiIcon.prototype, "_diskIcon", void 0);
LoomiIcon = __decorate([
    customElement("loomi-icon")
], LoomiIcon);
export { LoomiIcon };
//# sourceMappingURL=loomi-icon.js.map