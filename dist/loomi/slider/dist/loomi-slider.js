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
 * `<loomi-slider>` — select a numeric value or numeric range with a slider.
 * Form-associated: submits the value under `name`.
 *
 * @fires input - As the value changes (composed).
 * @fires change - On commit (composed).
 */
let LoomiSlider = class LoomiSlider extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.color = "primary";
        this.min = 0;
        this.max = 100;
        this.step = 1;
        this.selected = 0;
        this.selectedEnd = 100;
        this.range = false;
        this.showValues = true;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.value);
    }
    get value() {
        if (!this.range)
            return String(this.startValue);
        return `${this.startValue} - ${this.endValue}`;
    }
    get lowerBound() {
        return Math.min(this.min, this.max);
    }
    get upperBound() {
        return Math.max(this.min, this.max);
    }
    clamp(value) {
        return Math.min(this.upperBound, Math.max(this.lowerBound, value));
    }
    get selectedValue() {
        return this.clamp(this.selected);
    }
    get selectedEndValue() {
        return this.clamp(this.selectedEnd);
    }
    get startValue() {
        return this.range ? Math.min(this.selectedValue, this.selectedEndValue) : this.selectedValue;
    }
    get endValue() {
        return Math.max(this.selectedValue, this.selectedEndValue);
    }
    get progressStyle() {
        const span = this.upperBound - this.lowerBound;
        const start = this.range ? this.startValue : this.lowerBound;
        const end = this.range ? this.endValue : this.startValue;
        const startPercent = span ? ((start - this.lowerBound) / span) * 100 : 0;
        const endPercent = span ? ((end - this.lowerBound) / span) * 100 : 0;
        return `${accentVars(this.color)} --loomi-range-start: ${startPercent}%; --loomi-range-end: ${endPercent}%;`;
    }
    onInput(handle, e) {
        const next = Number(e.target.value);
        if (handle === "start") {
            this.selected = next;
            if (this.range && next > this.selectedEnd)
                this.selectedEnd = next;
        }
        else {
            this.selectedEnd = next;
            if (next < this.selected)
                this.selected = next;
        }
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
    onChange() {
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    render() {
        return html `<div class="loomi-slider" style=${this.progressStyle}>
      <div class="loomi-control ${this.range ? "loomi-control-range" : ""}">
        <span class="loomi-track" aria-hidden="true"></span>
        <input
          class="loomi-range ${this.range ? "loomi-range-start" : ""}"
          type="range"
          name=${this.name || nothing}
          min=${this.lowerBound}
          max=${this.upperBound}
          step=${this.step}
          aria-label=${this.range ? "Minimum value" : "Value"}
          .value=${String(this.startValue)}
          @input=${(event) => this.onInput("start", event)}
          @change=${this.onChange}
        />
        ${this.range
            ? html `<input
              class="loomi-range loomi-range-end"
              type="range"
              min=${this.lowerBound}
              max=${this.upperBound}
              step=${this.step}
              aria-label="Maximum value"
              .value=${String(this.endValue)}
              @input=${(event) => this.onInput("end", event)}
              @change=${this.onChange}
            />`
            : nothing}
      </div>
      ${this.showValues ? html `<span class="loomi-value">${this.value}</span>` : nothing}
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
    property({ type: Number, attribute: "selected-end" })
], LoomiSlider.prototype, "selectedEnd", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSlider.prototype, "range", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-values" })
], LoomiSlider.prototype, "showValues", void 0);
LoomiSlider = __decorate([
    customElement("loomi-slider")
], LoomiSlider);
export { LoomiSlider };
//# sourceMappingURL=loomi-slider.js.map