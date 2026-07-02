var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
import { generateQrCode } from "./qrcode-generator.js";
let nextGradientId = 0;
const RADIUS_CLASS = {
    none: "radius-none",
    small: "radius-small",
    medium: "radius-medium",
    large: "radius-large",
    full: "radius-full",
};
/**
 * `<loomi-qrcode>` — a themeable QR code for URLs and short text values.
 */
let LoomiQrCode = class LoomiQrCode extends LoomiElement {
    constructor() {
        super(...arguments);
        this.url = "";
        this.value = "";
        this.size = 220;
        /**
         * QR error correction level, trading data density for resilience to damage or overlays:
         * - `L` (Low): recovers ~7% of the code. Highest data capacity, use for clean digital display.
         * - `M` (Medium): recovers ~15% of the code. Balanced default for most use cases.
         * - `Q` (Quartile): recovers ~25% of the code. Good when printing on materials that may wear or get dirty.
         * - `H` (High): recovers ~30% of the code. Most resilient; recommended when overlaying a logo or using
         *   visual effects (`corner-borders`, `gradient`) on top of the modules.
         */
        this.errorCorrection = "M";
        this.quietZone = 4;
        this.foreground = "var(--loomi-text)";
        this.background = "var(--loomi-surface)";
        this.radius = "medium";
        this.gradient = false;
        this.gradientFrom = "var(--loomi-primary-600)";
        this.gradientTo = "var(--loomi-cyan-500)";
        this.moduleRadius = 0;
        this.cornerBorders = false;
        this.cornerBorderColor = "var(--loomi-primary-600)";
        this.cornerBorderWidth = "4px";
        this.cornerBorderLength = "34px";
        this.gradientScan = false;
        this.scanColor = "rgba(14, 165, 233, 0.72)";
        this.scanDuration = "2.4s";
        /**
         * Number of times the scan beam sweeps down and back up. Accepts a positive integer, or
         * `"infinite"` (default) to loop forever.
         */
        this.scanCount = "infinite";
        this.accessibilityLabel = "";
        this.gradientId = `loomi-qrcode-gradient-${++nextGradientId}`;
    }
    static { this.styles = loomiStyles(componentStyles); }
    get textValue() {
        return this.url || this.value;
    }
    get normalizedErrorCorrection() {
        return this.errorCorrection === "L" || this.errorCorrection === "Q" || this.errorCorrection === "H"
            ? this.errorCorrection
            : "M";
    }
    get normalizedRadius() {
        return this.radius in RADIUS_CLASS ? this.radius : "medium";
    }
    get normalizedScanCount() {
        if (this.scanCount === "infinite")
            return "infinite";
        const parsed = Number(this.scanCount);
        return Number.isFinite(parsed) && parsed > 0 ? String(Math.floor(parsed)) : "infinite";
    }
    get wrapperStyle() {
        return [
            `--_loomi-qrcode-size:${Math.max(96, this.size)}px`,
            `--_loomi-qrcode-background:${this.background}`,
            `--_loomi-qrcode-corner-color:${this.cornerBorderColor}`,
            `--_loomi-qrcode-corner-width:${this.cornerBorderWidth}`,
            `--_loomi-qrcode-corner-length:${this.cornerBorderLength}`,
            `--_loomi-qrcode-scan-color:${this.scanColor}`,
            `--_loomi-qrcode-scan-duration:${this.scanDuration}`,
            `--_loomi-qrcode-scan-count:${this.normalizedScanCount}`,
        ].join(";");
    }
    render() {
        const value = this.textValue.trim();
        const radiusClass = RADIUS_CLASS[this.normalizedRadius];
        if (!value) {
            return html `<div class="loomi-qrcode ${radiusClass} empty" style=${this.wrapperStyle} role="img" aria-label="QR code">
        <span class="loomi-empty-mark" aria-hidden="true"></span>
      </div>`;
        }
        try {
            const qr = generateQrCode(value, this.normalizedErrorCorrection);
            const quietZone = Math.max(0, Math.floor(this.quietZone));
            const viewBoxSize = qr.size + quietZone * 2;
            const moduleFill = this.gradient ? `url(#${this.gradientId})` : this.foreground;
            const label = this.accessibilityLabel || `QR code for ${value}`;
            return html `<div
        class="loomi-qrcode ${radiusClass} ${this.cornerBorders ? "with-corners" : ""}"
        style=${this.wrapperStyle}
      >
        <svg
          class="loomi-qrcode-svg"
          viewBox=${`0 0 ${viewBoxSize} ${viewBoxSize}`}
          role="img"
          aria-label=${label}
          shape-rendering=${this.moduleRadius > 0 ? "geometricPrecision" : "crispEdges"}
        >
          <rect class="loomi-qrcode-bg" width=${viewBoxSize} height=${viewBoxSize} fill=${this.background}></rect>
          ${this.renderGradient()}
          ${this.renderModules(qr.modules, quietZone, moduleFill)}
        </svg>
        ${this.cornerBorders ? this.renderCorners() : nothing}
        ${this.gradientScan ? html `<span class="loomi-scan" aria-hidden="true"></span>` : nothing}
      </div>`;
        }
        catch {
            return html `<div
        class="loomi-qrcode ${radiusClass} error"
        style=${this.wrapperStyle}
        role="img"
        aria-label="QR code unavailable"
      >
        <span>Unable to encode QR code</span>
      </div>`;
        }
    }
    renderGradient() {
        if (!this.gradient)
            return nothing;
        return svg `<defs>
      <linearGradient id=${this.gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color=${this.gradientFrom}></stop>
        <stop offset="100%" stop-color=${this.gradientTo}></stop>
      </linearGradient>
    </defs>`;
    }
    renderModules(modules, quietZone, fill) {
        if (this.moduleRadius <= 0) {
            const path = modules
                .map((row, y) => row
                .map((dark, x) => dark ? `M${x + quietZone},${y + quietZone}h1v1h-1z` : "")
                .join(""))
                .join("");
            return svg `<path class="loomi-qrcode-modules" fill=${fill} d=${path}></path>`;
        }
        const radius = Math.max(0, Math.min(0.5, this.moduleRadius));
        return svg `<g class="loomi-qrcode-modules" fill=${fill}>
      ${modules.map((row, y) => row.map((dark, x) => dark
            ? svg `<rect
            x=${x + quietZone}
            y=${y + quietZone}
            width="1"
            height="1"
            rx=${radius}
            ry=${radius}
          ></rect>`
            : nothing))}
    </g>`;
    }
    renderCorners() {
        return html `
      <span class="loomi-corner top-left" aria-hidden="true"></span>
      <span class="loomi-corner top-right" aria-hidden="true"></span>
      <span class="loomi-corner bottom-left" aria-hidden="true"></span>
      <span class="loomi-corner bottom-right" aria-hidden="true"></span>
    `;
    }
};
__decorate([
    property()
], LoomiQrCode.prototype, "url", void 0);
__decorate([
    property()
], LoomiQrCode.prototype, "value", void 0);
__decorate([
    property({ type: Number })
], LoomiQrCode.prototype, "size", void 0);
__decorate([
    property({ attribute: "error-correction" })
], LoomiQrCode.prototype, "errorCorrection", void 0);
__decorate([
    property({ type: Number, attribute: "quiet-zone" })
], LoomiQrCode.prototype, "quietZone", void 0);
__decorate([
    property()
], LoomiQrCode.prototype, "foreground", void 0);
__decorate([
    property()
], LoomiQrCode.prototype, "background", void 0);
__decorate([
    property()
], LoomiQrCode.prototype, "radius", void 0);
__decorate([
    property({ type: Boolean })
], LoomiQrCode.prototype, "gradient", void 0);
__decorate([
    property({ attribute: "gradient-from" })
], LoomiQrCode.prototype, "gradientFrom", void 0);
__decorate([
    property({ attribute: "gradient-to" })
], LoomiQrCode.prototype, "gradientTo", void 0);
__decorate([
    property({ type: Number, attribute: "module-radius" })
], LoomiQrCode.prototype, "moduleRadius", void 0);
__decorate([
    property({ type: Boolean, attribute: "corner-borders" })
], LoomiQrCode.prototype, "cornerBorders", void 0);
__decorate([
    property({ attribute: "corner-border-color" })
], LoomiQrCode.prototype, "cornerBorderColor", void 0);
__decorate([
    property({ attribute: "corner-border-width" })
], LoomiQrCode.prototype, "cornerBorderWidth", void 0);
__decorate([
    property({ attribute: "corner-border-length" })
], LoomiQrCode.prototype, "cornerBorderLength", void 0);
__decorate([
    property({ type: Boolean, attribute: "gradient-scan" })
], LoomiQrCode.prototype, "gradientScan", void 0);
__decorate([
    property({ attribute: "scan-color" })
], LoomiQrCode.prototype, "scanColor", void 0);
__decorate([
    property({ attribute: "scan-duration" })
], LoomiQrCode.prototype, "scanDuration", void 0);
__decorate([
    property({ attribute: "scan-count" })
], LoomiQrCode.prototype, "scanCount", void 0);
__decorate([
    property({ attribute: "aria-label" })
], LoomiQrCode.prototype, "accessibilityLabel", void 0);
LoomiQrCode = __decorate([
    customElement("loomi-qrcode")
], LoomiQrCode);
export { LoomiQrCode };
//# sourceMappingURL=loomi-qrcode.js.map