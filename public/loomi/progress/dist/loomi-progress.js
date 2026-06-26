var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-progress-bar>` — a horizontal progress bar.
 */
let LoomiProgressBar = class LoomiProgressBar extends LoomiElement {
    constructor() {
        super(...arguments);
        this.percentage = 0;
        this.color = "primary";
        this.shade = "faint";
        this.showLabel = false;
        this.inline = true;
        this.labelPosition = "top-left";
        this.prefix = "";
        this.suffix = "";
        this.striped = false;
        this.animated = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    get pct() {
        return Math.min(100, Math.max(0, this.percentage));
    }
    get text() {
        return `${this.prefix}${this.pct}%${this.suffix ? " " + this.suffix : ""}`;
    }
    render() {
        const [vpos, hpos] = this.labelPosition.split("-");
        const outsideLabel = this.showLabel && !this.inline;
        const labelEl = outsideLabel
            ? html `<div class="loomi-bar-label-out ${hpos}">${this.text}</div>`
            : nothing;
        return html `<div class="loomi-bar-wrap" style=${accentVars(this.color)}>
      ${vpos === "top" ? labelEl : nothing}
      <div class="loomi-track" role="progressbar" aria-valuenow=${this.pct} aria-valuemin="0" aria-valuemax="100">
        <div class="loomi-fill ${this.shade === "dark" ? "dark" : ""} ${this.striped ? "striped" : ""} ${this.animated ? "animated" : ""}" style="width:${this.pct}%">
          ${this.showLabel && this.inline ? html `<span>${this.pct}%</span>` : nothing}
        </div>
      </div>
      ${vpos === "bottom" ? labelEl : nothing}
    </div>`;
    }
};
__decorate([
    property({ type: Number })
], LoomiProgressBar.prototype, "percentage", void 0);
__decorate([
    property()
], LoomiProgressBar.prototype, "color", void 0);
__decorate([
    property()
], LoomiProgressBar.prototype, "shade", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-percentage-label" })
], LoomiProgressBar.prototype, "showLabel", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-percentage-label-inline" })
], LoomiProgressBar.prototype, "inline", void 0);
__decorate([
    property({ attribute: "percentage-label-position" })
], LoomiProgressBar.prototype, "labelPosition", void 0);
__decorate([
    property({ attribute: "percentage-prefix" })
], LoomiProgressBar.prototype, "prefix", void 0);
__decorate([
    property({ attribute: "percentage-suffix" })
], LoomiProgressBar.prototype, "suffix", void 0);
__decorate([
    property({ type: Boolean })
], LoomiProgressBar.prototype, "striped", void 0);
__decorate([
    property({ type: Boolean })
], LoomiProgressBar.prototype, "animated", void 0);
LoomiProgressBar = __decorate([
    customElement("loomi-progress-bar")
], LoomiProgressBar);
export { LoomiProgressBar };
const SIZES = { tiny: 50, small: 80, medium: 120, big: 200, large: 300 };
/**
 * `<loomi-progress-circle>` — a circular progress indicator.
 */
let LoomiProgressCircle = class LoomiProgressCircle extends LoomiElement {
    constructor() {
        super(...arguments);
        this.percentage = 0;
        this.color = "primary";
        this.shade = "faint";
        this.size = "medium";
        this.showLabel = false;
        this.showPercent = false;
        this.circleWidth = 10;
    }
    static { this.styles = loomiStyles(componentStyles); }
    get pct() {
        return Math.min(100, Math.max(0, this.percentage));
    }
    get px() {
        return SIZES[this.size] ?? Number(this.size) ?? 120;
    }
    render() {
        const r = 50 - this.circleWidth / 2;
        const circ = 2 * Math.PI * r;
        const offset = circ * (1 - this.pct / 100);
        const px = this.px;
        return html `<div class="loomi-circle" style=${accentVars(this.color) + `width:${px}px;height:${px}px`}>
      <svg width=${px} height=${px} viewBox="0 0 100 100" role="progressbar" aria-valuenow=${this.pct} aria-valuemin="0" aria-valuemax="100">
        <circle class="track" cx="50" cy="50" r=${r} fill="none" stroke-width=${this.circleWidth}></circle>
        <circle class="bar ${this.shade === "dark" ? "dark" : ""}" cx="50" cy="50" r=${r} fill="none" stroke-width=${this.circleWidth}
          stroke-dasharray=${circ} stroke-dashoffset=${offset}></circle>
      </svg>
      ${this.showLabel
            ? html `<div class="label" style="font-size:${px * 0.22}px">${this.pct}${this.showPercent ? "%" : ""}</div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property({ type: Number })
], LoomiProgressCircle.prototype, "percentage", void 0);
__decorate([
    property()
], LoomiProgressCircle.prototype, "color", void 0);
__decorate([
    property()
], LoomiProgressCircle.prototype, "shade", void 0);
__decorate([
    property()
], LoomiProgressCircle.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-label" })
], LoomiProgressCircle.prototype, "showLabel", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-percent" })
], LoomiProgressCircle.prototype, "showPercent", void 0);
__decorate([
    property({ type: Number, attribute: "circle-width" })
], LoomiProgressCircle.prototype, "circleWidth", void 0);
LoomiProgressCircle = __decorate([
    customElement("loomi-progress-circle")
], LoomiProgressCircle);
export { LoomiProgressCircle };
//# sourceMappingURL=loomi-progress.js.map