var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const FILL_TRANSITION_MS = 600;
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false" && value !== "0";
    },
};
// Registering these as <percentage> custom properties (rather than the untyped default)
// is what makes the browser interpolate them smoothly for the entrance transition below,
// instead of snapping straight to the new value. This has to go through the
// CSS.registerProperty() JS API rather than an `@property` rule in the component's own
// stylesheet - at least in some engines, `@property` declared inside a shadow root's
// adopted stylesheet is parsed fine but silently ignored for animation purposes.
if (typeof CSS !== "undefined" && typeof CSS.registerProperty === "function") {
    for (const name of ["--loomi-range-start", "--loomi-range-end"]) {
        try {
            CSS.registerProperty({ name, syntax: "<percentage>", inherits: true, initialValue: "0%" });
        }
        catch {
            // Already registered (e.g. hot reload, or another instance's module got here first).
        }
    }
}
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
        this.vertical = false;
        this.marks = "";
        this.handleWidth = "";
        this.trackRadius = "999px";
        this.handleVariant = "default";
        this.valueTarget = "";
        this.showTooltip = true;
        this.showValues = true;
        /** False until just after first paint, so the track can render empty for one frame
         * and then fill in to the starting value as an entrance animation. */
        this.revealed = false;
        /** True only while the entrance animation should be transitioning, so later drag
         * interactions apply instantly instead of lagging behind a transition. */
        this.animatingEntrance = true;
        /** True only while a track click (not a drag) is animating the fill to its target,
         * reusing the same transition as the entrance animation. */
        this.animatingClick = false;
        /** Whether the pointer has moved since it went down, so a click (no movement) can
         * be told apart from a drag (movement) in `onInput`. */
        this.movedSincePointerDown = false;
        this.onPointerDown = () => {
            this.movedSincePointerDown = false;
        };
        this.onPointerMove = () => {
            this.movedSincePointerDown = true;
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.value);
    }
    firstUpdated() {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.revealed = true;
                setTimeout(() => {
                    this.animatingEntrance = false;
                }, FILL_TRANSITION_MS);
            });
        });
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        clearTimeout(this.clickAnimationTimer);
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
        const start = this.range ? this.startValue : this.lowerBound;
        const end = this.range ? this.endValue : this.startValue;
        const startPercent = this.revealed ? this.valuePercent(start) : 0;
        const endPercent = this.revealed ? this.valuePercent(end) : 0;
        const handleWidth = this.handleWidth ? ` --loomi-slider-thumb-width: ${this.handleWidth};` : "";
        return `${accentVars(this.color)} --loomi-range-start: ${startPercent}%; --loomi-range-end: ${endPercent}%; --loomi-slider-radius: ${this.trackRadius};${handleWidth}`;
    }
    valuePercent(value) {
        const span = this.upperBound - this.lowerBound;
        return span ? ((value - this.lowerBound) / span) * 100 : 0;
    }
    tooltipStyle(value) {
        const percent = this.valuePercent(value);
        const translate = percent <= 0 ? "0%" : percent >= 100 ? "-100%" : "-50%";
        const arrowPosition = percent <= 0 ? "0.65rem" : percent >= 100 ? "calc(100% - 0.65rem)" : "50%";
        return [
            `--loomi-value-position: ${percent}%`,
            `--loomi-value-translate: ${translate}`,
            `--loomi-value-arrow-position: ${arrowPosition}`,
        ].join("; ");
    }
    onInput(handle, e) {
        const next = Number(e.target.value);
        if (!this.movedSincePointerDown) {
            this.animatingClick = true;
            clearTimeout(this.clickAnimationTimer);
            this.clickAnimationTimer = setTimeout(() => {
                this.animatingClick = false;
            }, FILL_TRANSITION_MS);
        }
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
        this.syncValueTarget();
        this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    }
    onChange() {
        this.syncValueTarget();
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    syncValueTarget() {
        if (!this.valueTarget)
            return;
        const target = document.querySelector(this.valueTarget);
        if (!target)
            return;
        target.value = this.value;
        target.dispatchEvent(new Event("input", { bubbles: true }));
    }
    parsedMarks() {
        const raw = Array.isArray(this.marks)
            ? this.marks
            : String(this.marks)
                .split(",")
                .map((mark) => mark.trim())
                .filter(Boolean);
        return raw
            .map((mark) => Number(mark))
            .filter((mark) => Number.isFinite(mark))
            .map((mark) => this.clamp(mark));
    }
    renderMarks() {
        const marks = this.parsedMarks();
        if (marks.length === 0)
            return nothing;
        return html `<div class="loomi-marks" aria-hidden="true">
      ${marks.map((mark) => html `<span class="loomi-mark" style=${this.markStyle(mark)}>
          <span class="loomi-mark-label">${mark}</span>
        </span>`)}
    </div>`;
    }
    markStyle(value) {
        return this.vertical
            ? `bottom: ${this.valuePercent(value)}%`
            : `inset-inline-start: ${this.valuePercent(value)}%`;
    }
    render() {
        return html `<div class="loomi-slider ${this.vertical ? "vertical" : "horizontal"}" style=${this.progressStyle}>
      <div class="loomi-control ${this.range ? "loomi-control-range" : ""} handle-${this.handleVariant}">
        <span class="loomi-track ${this.animatingEntrance || this.animatingClick ? "animated-fill" : ""}" aria-hidden="true"></span>
        ${this.renderMarks()}
        <input
          class="loomi-range ${this.range ? "loomi-range-start" : ""}"
          type="range"
          name=${this.name || nothing}
          min=${this.lowerBound}
          max=${this.upperBound}
          step=${this.step}
          aria-label=${this.range ? "Minimum value" : "Value"}
          .value=${String(this.startValue)}
          @pointerdown=${this.onPointerDown}
          @pointermove=${this.onPointerMove}
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
              @pointerdown=${this.onPointerDown}
              @pointermove=${this.onPointerMove}
              @input=${(event) => this.onInput("end", event)}
              @change=${this.onChange}
            />`
            : nothing}
        ${this.showValues && this.showTooltip
            ? html `<span
                class="loomi-value-tooltip loomi-value-tooltip-start"
                style=${this.tooltipStyle(this.startValue)}
                aria-hidden="true"
                >${this.startValue}</span
              >
              ${this.range
                ? html `<span
                    class="loomi-value-tooltip loomi-value-tooltip-end"
                    style=${this.tooltipStyle(this.endValue)}
                    aria-hidden="true"
                    >${this.endValue}</span
                  >`
                : nothing}`
            : nothing}
      </div>
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
    property({ type: Boolean, reflect: true })
], LoomiSlider.prototype, "vertical", void 0);
__decorate([
    property()
], LoomiSlider.prototype, "marks", void 0);
__decorate([
    property({ attribute: "handle-width" })
], LoomiSlider.prototype, "handleWidth", void 0);
__decorate([
    property({ attribute: "track-radius" })
], LoomiSlider.prototype, "trackRadius", void 0);
__decorate([
    property({ attribute: "handle-variant" })
], LoomiSlider.prototype, "handleVariant", void 0);
__decorate([
    property({ attribute: "value-target" })
], LoomiSlider.prototype, "valueTarget", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-tooltip", converter: booleanAttribute })
], LoomiSlider.prototype, "showTooltip", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-values", converter: booleanAttribute })
], LoomiSlider.prototype, "showValues", void 0);
__decorate([
    state()
], LoomiSlider.prototype, "revealed", void 0);
__decorate([
    state()
], LoomiSlider.prototype, "animatingEntrance", void 0);
__decorate([
    state()
], LoomiSlider.prototype, "animatingClick", void 0);
LoomiSlider = __decorate([
    customElement("loomi-slider")
], LoomiSlider);
export { LoomiSlider };
//# sourceMappingURL=loomi-slider.js.map