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
const MINUTE_MS = 60 * SECOND_MS;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;
/**
 * `<loomi-timer>` - an animated count up/down timer with day/hour/minute/second
 * digit segments, each labeled underneath.
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
        this.days = 0;
        this.hours = 0;
        this.mins = 1;
        this.startValue = 0;
        this.label = "";
        this.color = "primary";
        this.autoStart = false;
        this.showControls = false;
        this.showBorder = false;
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
            changedProperties.has("days") ||
            changedProperties.has("hours") ||
            changedProperties.has("mins") ||
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
    /** Whether the countdown length was explicitly configured via `days`/`hours`/`mins`. */
    get hasExplicitBound() {
        return this.hasAttribute("days") || this.hasAttribute("hours") || this.hasAttribute("mins");
    }
    /** Total time described by the `days`/`hours`/`mins` props, in milliseconds. */
    get boundMs() {
        const days = Math.max(0, Number(this.days) || 0);
        const hours = Math.max(0, Number(this.hours) || 0);
        const mins = Math.max(0, Number(this.mins) || 0);
        return days * DAY_MS + hours * HOUR_MS + mins * MINUTE_MS;
    }
    get boundedCountUpMs() {
        if (this.normalizedDirection !== "up")
            return 0;
        return this.hasExplicitBound ? this.boundMs : 0;
    }
    get initialDisplayMs() {
        const startMs = Math.max(0, Number(this.startValue) || 0) * SECOND_MS;
        if (this.normalizedDirection === "up")
            return startMs;
        return startMs > 0 ? startMs : this.boundMs;
    }
    get wholeSeconds() {
        return this.normalizedDirection === "up"
            ? Math.floor(this.displayMs / SECOND_MS)
            : Math.ceil(this.displayMs / SECOND_MS);
    }
    get progressPercent() {
        const total = this.normalizedDirection === "up" ? this.boundedCountUpMs : this.boundMs;
        if (total <= 0)
            return this.running ? 100 : 0;
        const value = this.normalizedDirection === "up" ? this.displayMs : total - this.displayMs;
        return Math.min(100, Math.max(0, (value / total) * 100));
    }
    get segments() {
        const totalSeconds = Math.max(0, this.wholeSeconds);
        const days = Math.floor(totalSeconds / 86400);
        const hours = Math.floor((totalSeconds % 86400) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        return { days, hours, minutes, seconds };
    }
    get srText() {
        const { days, hours, minutes, seconds } = this.segments;
        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
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
                days: this.days,
                hours: this.hours,
                mins: this.mins,
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
        const digits = this.renderRoot.querySelectorAll(".loomi-time");
        digits.forEach((digit) => {
            digit.animate([
                { transform: "translateY(0) scale(1)", opacity: 1 },
                { transform: "translateY(-0.04em) scale(1.015)", opacity: 0.86 },
                { transform: "translateY(0) scale(1)", opacity: 1 },
            ], { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        });
    }
    render() {
        const timerStyle = `${accentVars(this.color)}--loomi-progress:${this.progressPercent};`;
        const { days, hours, minutes, seconds } = this.segments;
        const pad = (value) => String(value).padStart(2, "0");
        const ariaLabel = this.label ? `${this.label}: ${this.srText}` : this.srText;
        return html `<div class="loomi-timer ${this.running ? "is-running" : ""}" style=${timerStyle}>
      <div
        class="loomi-face ${this.showBorder ? "bordered" : ""}"
        role="timer"
        aria-live="polite"
        aria-label=${ariaLabel}
      >
        ${this.label ? html `<div class="loomi-label">${this.label}</div>` : nothing}
        <div class="loomi-segments">
          <div class="loomi-segment">
            <div class="loomi-time">${pad(days)}</div>
            <div class="loomi-unit">Days</div>
          </div>
          <div class="loomi-sep" aria-hidden="true">:</div>
          <div class="loomi-segment">
            <div class="loomi-time">${pad(hours)}</div>
            <div class="loomi-unit">Hours</div>
          </div>
          <div class="loomi-sep" aria-hidden="true">:</div>
          <div class="loomi-segment">
            <div class="loomi-time">${pad(minutes)}</div>
            <div class="loomi-unit">Mins</div>
          </div>
          <div class="loomi-sep" aria-hidden="true">:</div>
          <div class="loomi-segment">
            <div class="loomi-time">${pad(seconds)}</div>
            <div class="loomi-unit">Secs</div>
          </div>
        </div>
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
], LoomiTimer.prototype, "days", void 0);
__decorate([
    property({ type: Number })
], LoomiTimer.prototype, "hours", void 0);
__decorate([
    property({ type: Number })
], LoomiTimer.prototype, "mins", void 0);
__decorate([
    property({ type: Number, attribute: "start-value" })
], LoomiTimer.prototype, "startValue", void 0);
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
    property({ type: Boolean, attribute: "show-border" })
], LoomiTimer.prototype, "showBorder", void 0);
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