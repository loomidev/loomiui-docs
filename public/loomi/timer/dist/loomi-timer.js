var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, accentVars, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const SECOND_MS = 1000;
/**
 * `<loomi-timer>` - an animated count up/down timer.
 *
 * @fires timer-start - Fired when the timer starts.
 * @fires timer-pause - Fired when the timer pauses.
 * @fires timer-reset - Fired when the timer resets.
 * @fires timer-tick - Fired when the displayed whole second changes.
 * @fires timer-complete - Fired when a bounded timer reaches its end.
 */
let LoomiTimer = class LoomiTimer extends LoomiElement {
    constructor() {
        super(...arguments);
        this.direction = "down";
        this.duration = 60;
        this.startValue = 0;
        this.format = "clock";
        this.label = "";
        this.color = "primary";
        this.autoStart = false;
        this.showControls = false;
        this.animated = true;
        this.running = false;
        this.displayMs = this.initialDisplayMs;
        this.complete = false;
        this.animationFrame = 0;
        this.runStartedAt = 0;
        this.runStartedValueMs = this.initialDisplayMs;
        this.lastWholeSecond = -1;
        this.onFrame = (timestamp) => {
            this.updateDisplay(timestamp);
            if (this.running)
                this.animationFrame = requestAnimationFrame(this.onFrame);
        };
        this.onToggle = () => {
            if (this.running)
                this.pause();
            else
                this.start();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.displayMs = this.initialDisplayMs;
        this.lastWholeSecond = this.wholeSeconds;
        if (this.autoStart)
            this.start();
    }
    disconnectedCallback() {
        this.cancelFrame();
        super.disconnectedCallback();
    }
    updated(changedProperties) {
        if ((changedProperties.has("direction") ||
            changedProperties.has("duration") ||
            changedProperties.has("startValue")) &&
            !this.running) {
            this.reset(false);
            return;
        }
        if (changedProperties.has("displayMs"))
            this.dispatchTickIfNeeded();
    }
    start() {
        if (this.running || this.complete)
            return;
        this.running = true;
        this.runStartedAt = performance.now();
        this.runStartedValueMs = this.displayMs;
        this.dispatchTimerEvent("timer-start");
        this.scheduleFrame();
    }
    pause() {
        if (!this.running)
            return;
        this.updateDisplay(performance.now());
        this.running = false;
        this.cancelFrame();
        this.dispatchTimerEvent("timer-pause");
    }
    reset(emitEvent = true) {
        this.cancelFrame();
        this.running = false;
        this.complete = false;
        this.displayMs = this.initialDisplayMs;
        this.runStartedValueMs = this.displayMs;
        this.runStartedAt = 0;
        this.lastWholeSecond = this.wholeSeconds;
        if (emitEvent)
            this.dispatchTimerEvent("timer-reset");
    }
    get normalizedDirection() {
        return this.direction === "up" ? "up" : "down";
    }
    get durationMs() {
        return Math.max(0, Number(this.duration) || 0) * SECOND_MS;
    }
    get boundedCountUpMs() {
        if (this.normalizedDirection !== "up")
            return 0;
        return this.hasAttribute("duration") ? this.durationMs : 0;
    }
    get initialDisplayMs() {
        const startMs = Math.max(0, Number(this.startValue) || 0) * SECOND_MS;
        if (this.normalizedDirection === "up")
            return startMs;
        return startMs > 0 ? startMs : this.durationMs;
    }
    get wholeSeconds() {
        return this.normalizedDirection === "up"
            ? Math.floor(this.displayMs / SECOND_MS)
            : Math.ceil(this.displayMs / SECOND_MS);
    }
    get progressPercent() {
        const total = this.normalizedDirection === "up" ? this.boundedCountUpMs : this.durationMs;
        if (total <= 0)
            return this.running ? 100 : 0;
        const value = this.normalizedDirection === "up" ? this.displayMs : total - this.displayMs;
        return Math.min(100, Math.max(0, (value / total) * 100));
    }
    get displayText() {
        const seconds = Math.max(0, this.wholeSeconds);
        if (this.format === "seconds")
            return String(seconds);
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;
        const pad = (value) => String(value).padStart(2, "0");
        return hours > 0
            ? `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`
            : `${pad(minutes)}:${pad(remainingSeconds)}`;
    }
    scheduleFrame() {
        this.cancelFrame();
        this.animationFrame = requestAnimationFrame(this.onFrame);
    }
    cancelFrame() {
        if (!this.animationFrame)
            return;
        cancelAnimationFrame(this.animationFrame);
        this.animationFrame = 0;
    }
    updateDisplay(timestamp) {
        const elapsed = Math.max(0, timestamp - this.runStartedAt);
        let nextValue = this.normalizedDirection === "up"
            ? this.runStartedValueMs + elapsed
            : this.runStartedValueMs - elapsed;
        if (this.normalizedDirection === "up" && this.boundedCountUpMs > 0) {
            nextValue = Math.min(this.boundedCountUpMs, nextValue);
        }
        else if (this.normalizedDirection === "down") {
            nextValue = Math.max(0, nextValue);
        }
        this.displayMs = nextValue;
        const isComplete = (this.normalizedDirection === "down" && nextValue <= 0) ||
            (this.normalizedDirection === "up" && this.boundedCountUpMs > 0 && nextValue >= this.boundedCountUpMs);
        if (isComplete) {
            this.running = false;
            this.complete = true;
            this.cancelFrame();
            this.dispatchTimerEvent("timer-complete");
        }
    }
    dispatchTickIfNeeded() {
        const nextWholeSecond = this.wholeSeconds;
        if (nextWholeSecond === this.lastWholeSecond)
            return;
        this.lastWholeSecond = nextWholeSecond;
        this.animateTick();
        this.dispatchTimerEvent("timer-tick");
    }
    dispatchTimerEvent(type) {
        this.dispatchEvent(new CustomEvent(type, {
            bubbles: true,
            composed: true,
            detail: {
                value: this.wholeSeconds,
                direction: this.normalizedDirection,
                duration: this.duration,
                progress: this.progressPercent,
                complete: this.complete,
            },
        }));
    }
    animateTick() {
        if (!this.animated)
            return;
        if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches)
            return;
        const time = this.renderRoot.querySelector(".loomi-time");
        time?.animate([
            { transform: "translateY(0) scale(1)", opacity: 1 },
            { transform: "translateY(-0.04em) scale(1.015)", opacity: 0.86 },
            { transform: "translateY(0) scale(1)", opacity: 1 },
        ], { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    }
    render() {
        const timerStyle = `${accentVars(this.color)}--loomi-progress:${this.progressPercent};`;
        return html `<div class="loomi-timer ${this.running ? "is-running" : ""}" style=${timerStyle}>
      <div class="loomi-face" role="timer" aria-live="polite" aria-label=${this.label || nothing}>
        ${this.label ? html `<div class="loomi-label">${this.label}</div>` : nothing}
        <div class="loomi-time">${this.displayText}</div>
        <div class="loomi-status" aria-hidden="true">
          <span class="loomi-pulse"></span>
          <span>${this.running ? "Running" : this.complete ? "Complete" : "Paused"}</span>
        </div>
      </div>
      ${this.showControls
            ? html `<div class="loomi-controls">
            <button type="button" @click=${this.onToggle}>${this.running ? "Pause" : "Start"}</button>
            <button type="button" @click=${() => this.reset()}>Reset</button>
          </div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiTimer.prototype, "direction", void 0);
__decorate([
    property({ type: Number })
], LoomiTimer.prototype, "duration", void 0);
__decorate([
    property({ type: Number, attribute: "start-value" })
], LoomiTimer.prototype, "startValue", void 0);
__decorate([
    property()
], LoomiTimer.prototype, "format", void 0);
__decorate([
    property()
], LoomiTimer.prototype, "label", void 0);
__decorate([
    property()
], LoomiTimer.prototype, "color", void 0);
__decorate([
    property({ type: Boolean, attribute: "auto-start" })
], LoomiTimer.prototype, "autoStart", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-controls" })
], LoomiTimer.prototype, "showControls", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTimer.prototype, "animated", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimer.prototype, "running", void 0);
__decorate([
    state()
], LoomiTimer.prototype, "displayMs", void 0);
__decorate([
    state()
], LoomiTimer.prototype, "complete", void 0);
LoomiTimer = __decorate([
    customElement("loomi-timer")
], LoomiTimer);
export { LoomiTimer };
//# sourceMappingURL=loomi-timer.js.map