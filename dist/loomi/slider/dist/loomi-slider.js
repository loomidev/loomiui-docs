var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-slider>` — select a numeric value with a slider. Form-associated: submits the
 * value under `name`.
 *
 * @fires input - As the value changes (composed).
 * @fires change - On commit (composed).
 */
let LoomiSlider = class LoomiSlider extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.color = "primary";
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.selected = 0;
        this.showValues = true;
        this.onInput = (e) => {
            this.selected = Number(e.target.value);
            this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(String(this.selected));
    }
    render() {
        const value = Math.min(this.max, Math.max(this.min, this.selected));
        return html `<div class="loomi-slider" style=${accentVars(this.color)}>
      <input
        class="loomi-range"
        type="range"
        name=${this.name || nothing}
        min=${this.min}
        max=${this.max}
        step=${this.step}
        .value=${String(value)}
        @input=${this.onInput}
        @change=${() => this.dispatchEvent(new Event("change", { bubbles: true, composed: true }))}
      />
      ${this.showValues ? html `<span class="loomi-value">${value}</span>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiSlider.prototype, "name", void 0);
__decorate([
    property()
], LoomiSlider.prototype, "color", void 0);
__decorate([
    property({ type: Number })
], LoomiSlider.prototype, "min", void 0);
__decorate([
    property({ type: Number })
], LoomiSlider.prototype, "max", void 0);
__decorate([
    property({ type: Number })
], LoomiSlider.prototype, "step", void 0);
__decorate([
    property({ type: Number })
], LoomiSlider.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-values" })
], LoomiSlider.prototype, "showValues", void 0);
LoomiSlider = __decorate([
    customElement("loomi-slider")
], LoomiSlider);
export { LoomiSlider };
//# sourceMappingURL=loomi-slider.js.map