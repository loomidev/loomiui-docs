var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, cssColor } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const FALLBACK = ["primary", "green", "orange", "red", "purple", "cyan", "pink", "indigo"];
/**
 * `<loomi-horizontal-line-graph>` — a single proportion bar split into colored segments,
 * with an optional legend. Provide `data` (`{ label, value, color? }`).
 */
let LoomiHorizontalLineGraph = class LoomiHorizontalLineGraph extends LitElement {
    constructor() {
        super(...arguments);
        this.data = [];
        this.showLegend = true;
        this.showValues = true;
    }
    static { this.styles = loomiStyles(componentStyles); }
    color(seg, i) {
        const c = seg.color || FALLBACK[i % FALLBACK.length];
        // a loomi color name -> themed token; otherwise use as-is (hex/rgb).
        return /^[a-z]+$/.test(c) ? cssColor(c, 500) : c;
    }
    render() {
        const total = this.data.reduce((s, d) => s + (d.value || 0), 0) || 1;
        return html `<div class="loomi-hlg">
      <div class="loomi-bar">
        ${this.data.map((seg, i) => html `<div
          class="loomi-seg"
          style="width:${((seg.value || 0) / total) * 100}%;background:${this.color(seg, i)}"
          title="${seg.label}: ${seg.value}"
        ></div>`)}
      </div>
      ${this.showLegend
            ? html `<div class="loomi-legend">
            ${this.data.map((seg, i) => html `<span class="loomi-key">
              <span class="loomi-dot" style="background:${this.color(seg, i)}"></span>
              ${seg.label}
              ${this.showValues ? html `<span class="loomi-val">${Math.round(((seg.value || 0) / total) * 100)}%</span>` : nothing}
            </span>`)}
          </div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property({ type: Array })
], LoomiHorizontalLineGraph.prototype, "data", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-legend" })
], LoomiHorizontalLineGraph.prototype, "showLegend", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-values" })
], LoomiHorizontalLineGraph.prototype, "showValues", void 0);
LoomiHorizontalLineGraph = __decorate([
    customElement("loomi-horizontal-line-graph")
], LoomiHorizontalLineGraph);
export { LoomiHorizontalLineGraph };
//# sourceMappingURL=loomi-horizontal-line-graph.js.map