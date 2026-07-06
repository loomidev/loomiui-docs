var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const STEP_CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m5 12.5 4 4 10-10" />`;
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
        this.showTooltip = false;
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
          ${this.showLabel && this.inline ? html `<span class="loomi-fill-label">${this.pct}%</span>` : nothing}
        </div>
        ${this.showTooltip ? html `<span class="loomi-bar-tooltip" style="left:${this.pct}%">${this.text}</span>` : nothing}
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
    property({ type: Boolean, attribute: "show-percentage-tooltip" })
], LoomiProgressBar.prototype, "showTooltip", void 0);
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
/**
 * `<loomi-progress-step>` — one labelled step. Place inside `<loomi-progress-steps>`.
 *
 * @slot - Extra content below the description.
 * @slot label - Custom label content.
 * @slot description - Custom description content.
 * @fires progress-step-select - `detail: { index, value, label, state }`.
 */
let LoomiProgressStep = class LoomiProgressStep extends LoomiElement {
    constructor() {
        super(...arguments);
        this.label = "";
        this.description = "";
        this.href = "";
        this.state = "upcoming";
        this.value = 0;
        this.active = false;
        this.completed = false;
        this.disabled = false;
        this.error = false;
        this.clickable = false;
        this.last = false;
        this.hideIndex = false;
        this.stepIndex = 0;
        this.orientation = "horizontal";
        this.color = "primary";
        this.size = "regular";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get computedState() {
        if (this.error || this.state === "error")
            return "error";
        if (this.completed || this.state === "complete")
            return "complete";
        if (this.active || this.state === "current")
            return "current";
        return "upcoming";
    }
    get isInteractive() {
        return Boolean(this.href || this.clickable);
    }
    onSelect() {
        if (this.disabled)
            return;
        this.dispatchEvent(new CustomEvent("progress-step-select", {
            bubbles: true,
            composed: true,
            detail: {
                index: this.stepIndex,
                value: this.value || this.stepIndex,
                label: this.label,
                state: this.computedState,
            },
        }));
    }
    renderMarker(state) {
        if (state === "complete") {
            return html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true">${STEP_CHECK}</svg>`;
        }
        if (state === "error")
            return html `<span aria-hidden="true">!</span>`;
        return html `<span aria-hidden="true">${this.hideIndex ? "" : this.stepIndex}</span>`;
    }
    renderControl(state) {
        const classes = `loomi-step-control ${state}`;
        const marker = html `<span class="loomi-step-marker ${state}">${this.renderMarker(state)}</span>`;
        const label = html `<span class="loomi-step-copy">
      <span class="loomi-step-label"><slot name="label">${this.label}</slot></span>
      ${this.description
            ? html `<span class="loomi-step-description"><slot name="description">${this.description}</slot></span>`
            : html `<slot name="description"></slot>`}
    </span>`;
        if (this.href) {
            return html `<a
        class=${classes}
        href=${this.href}
        aria-current=${state === "current" ? "step" : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        @click=${this.onSelect}
      >${marker}${label}</a>`;
        }
        if (this.clickable) {
            return html `<button
        class=${classes}
        type="button"
        ?disabled=${this.disabled}
        aria-current=${state === "current" ? "step" : nothing}
        @click=${this.onSelect}
      >${marker}${label}</button>`;
        }
        return html `<span class=${classes} aria-current=${state === "current" ? "step" : nothing}>${marker}${label}</span>`;
    }
    render() {
        const state = this.computedState;
        return html `<div
      class="loomi-step ${this.orientation} ${this.size} ${state} ${this.isInteractive ? "interactive" : ""}"
      role="listitem"
      style=${accentVars(this.color)}
    >
      <div class="loomi-step-head">
        ${this.renderControl(state)}
        <span class="loomi-step-line ${state}" aria-hidden="true"></span>
      </div>
      <div class="loomi-step-body"><slot></slot></div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiProgressStep.prototype, "label", void 0);
__decorate([
    property()
], LoomiProgressStep.prototype, "description", void 0);
__decorate([
    property()
], LoomiProgressStep.prototype, "href", void 0);
__decorate([
    property()
], LoomiProgressStep.prototype, "state", void 0);
__decorate([
    property({ type: Number })
], LoomiProgressStep.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "active", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "completed", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "error", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "clickable", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiProgressStep.prototype, "last", void 0);
__decorate([
    property({ type: Boolean, attribute: "hide-index" })
], LoomiProgressStep.prototype, "hideIndex", void 0);
__decorate([
    property({ type: Number, attribute: "step-index" })
], LoomiProgressStep.prototype, "stepIndex", void 0);
__decorate([
    property({ reflect: true })
], LoomiProgressStep.prototype, "orientation", void 0);
__decorate([
    property()
], LoomiProgressStep.prototype, "color", void 0);
__decorate([
    property()
], LoomiProgressStep.prototype, "size", void 0);
LoomiProgressStep = __decorate([
    customElement("loomi-progress-step")
], LoomiProgressStep);
export { LoomiProgressStep };
/**
 * `<loomi-progress-steps>` — a horizontal or vertical progress stepper.
 *
 * @slot - `<loomi-progress-step>` children.
 * @fires progress-steps-change - `detail: { current, step }`.
 */
let LoomiProgressSteps = class LoomiProgressSteps extends LoomiElement {
    constructor() {
        super(...arguments);
        this.current = 1;
        this.color = "primary";
        this.orientation = "horizontal";
        this.size = "regular";
        this.clickable = false;
        this.syncSteps = () => {
            const steps = this.steps;
            steps.forEach((step, index) => {
                const stepNumber = index + 1;
                step.stepIndex = stepNumber;
                step.last = stepNumber === steps.length;
                if (!step.hasAttribute("color"))
                    step.color = this.color;
                step.orientation = this.orientation;
                step.size = this.size;
                if (!step.hasAttribute("clickable"))
                    step.clickable = this.clickable;
                if (!this.hasExplicitState(step)) {
                    step.completed = stepNumber < this.current;
                    step.active = stepNumber === this.current;
                    step.error = false;
                    step.state = "upcoming";
                }
            });
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get steps() {
        return Array.from(this.querySelectorAll("loomi-progress-step"));
    }
    hasExplicitState(step) {
        return (step.hasAttribute("state") ||
            step.hasAttribute("active") ||
            step.hasAttribute("completed") ||
            step.hasAttribute("error"));
    }
    onStepSelect(event) {
        if (!this.clickable)
            return;
        const step = event.target;
        if (step.disabled)
            return;
        this.current = step.stepIndex;
        this.syncSteps();
        this.dispatchEvent(new CustomEvent("progress-steps-change", {
            bubbles: true,
            composed: true,
            detail: { current: this.current, step },
        }));
    }
    willUpdate() {
        this.syncSteps();
    }
    firstUpdated() {
        this.syncSteps();
    }
    render() {
        return html `<div
      class="loomi-steps ${this.orientation} ${this.size}"
      role="list"
      style=${accentVars(this.color)}
      @progress-step-select=${this.onStepSelect}
    ><slot @slotchange=${this.syncSteps}></slot></div>`;
    }
};
__decorate([
    property({ type: Number })
], LoomiProgressSteps.prototype, "current", void 0);
__decorate([
    property()
], LoomiProgressSteps.prototype, "color", void 0);
__decorate([
    property()
], LoomiProgressSteps.prototype, "orientation", void 0);
__decorate([
    property()
], LoomiProgressSteps.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], LoomiProgressSteps.prototype, "clickable", void 0);
LoomiProgressSteps = __decorate([
    customElement("loomi-progress-steps")
], LoomiProgressSteps);
export { LoomiProgressSteps };
//# sourceMappingURL=loomi-progress.js.map