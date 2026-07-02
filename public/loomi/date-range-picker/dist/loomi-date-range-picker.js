var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, onClickOutside } from "@loomidev/core";
import "@loomidev/button/loomi-button.js";
import "@loomidev/datepicker/loomi-datepicker.js";
const DATE_FORMATTER = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric"
});
function toIsoDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
}
function addDays(date, days) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}
function startOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth(), 1);
}
function endOfMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}
function formatDate(value) {
    if (!value) {
        return "";
    }
    const parsed = new Date(`${value}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) {
        return value;
    }
    return DATE_FORMATTER.format(parsed);
}
function createDefaultPresets(referenceDate = new Date()) {
    const today = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());
    const yesterday = addDays(today, -1);
    const last7Start = addDays(today, -6);
    const last30Start = addDays(today, -29);
    const thisMonthStart = startOfMonth(today);
    const lastMonthStart = startOfMonth(new Date(today.getFullYear(), today.getMonth() - 1, 1));
    const lastMonthEnd = endOfMonth(lastMonthStart);
    return [
        { id: "today", label: "Today", startDate: toIsoDate(today), endDate: toIsoDate(today) },
        { id: "yesterday", label: "Yesterday", startDate: toIsoDate(yesterday), endDate: toIsoDate(yesterday) },
        { id: "last-7-days", label: "Last 7 days", startDate: toIsoDate(last7Start), endDate: toIsoDate(today) },
        { id: "last-30-days", label: "Last 30 days", startDate: toIsoDate(last30Start), endDate: toIsoDate(today) },
        { id: "this-month", label: "This month", startDate: toIsoDate(thisMonthStart), endDate: toIsoDate(today) },
        { id: "last-month", label: "Last month", startDate: toIsoDate(lastMonthStart), endDate: toIsoDate(lastMonthEnd) }
    ];
}
let LoomiDateRangePicker = class LoomiDateRangePicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.presets = createDefaultPresets();
        this.open = false;
        this.startDate = "";
        this.endDate = "";
        this.compareStartDate = "";
        this.compareEndDate = "";
        this.presetId = "custom";
        this.label = "Date range";
        this.placeholder = "Select date range";
        this.min = "";
        this.max = "";
        this.comparison = false;
        this.showPresets = true;
        this.popoverX = 0;
        this.popoverY = 0;
        this.placementFrame = 0;
        this.toggleOpen = (event) => {
            event.stopPropagation();
            this.open = !this.open;
            this.syncOutsideClick();
            this.dispatchOpenChange();
        };
        this.closePicker = () => {
            this.open = false;
            this.syncOutsideClick();
            this.dispatchOpenChange();
        };
        this.applyRange = () => {
            this.normalizeRange();
            this.dispatchDateEvent("loomi-date-range-apply", {
                value: this.getValue(),
                presetId: this.presetId
            });
            this.closePicker();
        };
        this.handleComparisonToggle = (event) => {
            this.comparison = event.target.checked;
            if (!this.comparison) {
                this.compareStartDate = "";
                this.compareEndDate = "";
            }
            else if (!this.compareStartDate || !this.compareEndDate) {
                this.setDefaultComparisonRange();
            }
            this.dispatchChange();
            this.schedulePlacement();
        };
        this.handleDocumentKeydown = (event) => {
            if (!this.open || event.key !== "Escape") {
                return;
            }
            this.closePicker();
        };
    }
    static { this.properties = {
        ...LoomiElement.properties,
        presets: { attribute: false },
        open: { type: Boolean, reflect: true },
        startDate: { attribute: "start-date", reflect: true },
        endDate: { attribute: "end-date", reflect: true },
        compareStartDate: { attribute: "compare-start-date" },
        compareEndDate: { attribute: "compare-end-date" },
        presetId: { attribute: "preset-id" },
        label: {},
        placeholder: {},
        min: {},
        max: {},
        comparison: { type: Boolean, reflect: true },
        showPresets: { attribute: "show-presets", type: Boolean, reflect: true }
    }; }
    static { this.styles = loomiStyles(css `
    :host {
      --loomi-date-border: var(--loomi-surface-border, #d9dee3);
      --loomi-date-muted: var(--loomi-text-muted, #62717d);
      --loomi-date-surface: var(--loomi-surface, #ffffff);
      --loomi-date-surface-active: var(--loomi-primary-50, var(--_loomi-primary-50-default, #eff6ff));
      --loomi-date-surface-hover: var(--loomi-surface-hover, #f9fbfc);
      --loomi-date-text: var(--loomi-text, #172026);
      --loomi-date-text-secondary: var(--loomi-text-secondary, #33424f);
      --loomi-date-accent: var(--loomi-primary-600, var(--_loomi-primary-600-default, #2563eb));
      --loomi-date-accent-strong: var(--loomi-primary-700, var(--_loomi-primary-700-default, #174ea6));
      display: inline-block;
      color: var(--loomi-date-text);
      font-family: Inter, ui-sans-serif, system-ui, sans-serif;
      position: relative;
    }

    .field {
      display: grid;
      gap: 6px;
    }

    label {
      color: var(--loomi-date-text-secondary);
      font-size: 13px;
      font-weight: 700;
    }

    .trigger {
      min-width: 280px;
      min-height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      border: 1px solid var(--loomi-date-border);
      border-radius: 6px;
      background: var(--loomi-date-surface);
      color: inherit;
      padding: 0 10px;
      font: inherit;
      cursor: pointer;
    }

    .trigger-text {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .chevron {
      color: var(--loomi-date-muted);
      font-size: 12px;
    }

    .popover {
      position: fixed;
      z-index: var(--loomi-date-range-picker-z-index, 1000);
      top: var(--loomi-date-range-picker-y, 0px);
      left: var(--loomi-date-range-picker-x, 0px);
      width: min(640px, calc(100vw - 32px));
      overflow: visible;
      border: 1px solid var(--loomi-date-border);
      border-radius: 8px;
      background: var(--loomi-date-surface);
      box-shadow: 0 18px 50px rgb(15 23 42 / 0.16);
    }

    .content {
      display: grid;
      grid-template-columns: 180px minmax(0, 1fr);
    }

    :host(:not([show-presets])) .content {
      grid-template-columns: 1fr;
    }

    .presets {
      display: grid;
      align-content: start;
      gap: 4px;
      border-right: 1px solid var(--loomi-date-border);
      padding: 8px;
    }

    .preset {
      min-height: 34px;
      border: 1px solid transparent;
      border-radius: 6px;
      background: transparent;
      color: inherit;
      padding: 0 10px;
      text-align: left;
      font: inherit;
      cursor: pointer;
    }

    .preset:hover,
    .preset[aria-pressed="true"] {
      background: var(--loomi-date-surface-active);
      color: var(--loomi-date-accent-strong);
    }

    .ranges {
      display: grid;
      gap: 16px;
      padding: 16px;
    }

    .range-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;
    }

    .input-field {
      display: grid;
      gap: 6px;
    }

    .input-field span,
    .compare-toggle {
      color: var(--loomi-date-muted);
      font-size: 13px;
      font-weight: 600;
    }

    .compare-toggle {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      width: fit-content;
    }

    .range-grid loomi-datepicker {
      width: 100%;
    }

    .footer {
      display: flex;
      justify-content: end;
      gap: 8px;
      border-top: 1px solid var(--loomi-date-border);
      padding: 12px;
    }

    @media (max-width: 640px) {
      .content,
      .range-grid {
        grid-template-columns: 1fr;
      }

      .presets {
        border-right: 0;
        border-bottom: 1px solid var(--loomi-date-border);
      }
    }
  `); }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("keydown", this.handleDocumentKeydown);
        if (!this.startDate || !this.endDate) {
            const defaultPreset = this.presets.find((preset) => preset.id === "last-30-days") ?? this.presets[0];
            if (defaultPreset) {
                this.applyPresetValue(defaultPreset, false);
            }
        }
    }
    disconnectedCallback() {
        document.removeEventListener("keydown", this.handleDocumentKeydown);
        this.cleanupOutside?.();
        this.cleanupPlacement?.();
        cancelAnimationFrame(this.placementFrame);
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has("open")) {
            this.syncPlacement();
        }
    }
    render() {
        return html `
      <div class="field">
        <label>${this.label}</label>
        <button class="trigger" type="button" aria-expanded=${this.open ? "true" : "false"} @click=${this.toggleOpen}>
          <span class="trigger-text">${this.getDisplayValue()}</span>
          <span class="chevron">${this.open ? "Close" : "Open"}</span>
        </button>
      </div>
      ${this.open ? this.renderPopover() : nothing}
    `;
    }
    renderPopover() {
        return html `
      <section
        class="popover"
        style=${`--loomi-date-range-picker-x:${this.popoverX}px;--loomi-date-range-picker-y:${this.popoverY}px`}
        @click=${(event) => event.stopPropagation()}
      >
        <div class="content">
          ${this.showPresets ? this.renderPresets() : nothing}
          <div class="ranges">
            ${this.renderRangeFields("Primary range", "startDate", "endDate")}
            <label class="compare-toggle">
              <input type="checkbox" .checked=${this.comparison} @change=${this.handleComparisonToggle} />
              <span>Compare to another range</span>
            </label>
            ${this.comparison ? this.renderRangeFields("Comparison range", "compareStartDate", "compareEndDate") : nothing}
          </div>
        </div>
        <div class="footer">
          <loomi-button type="secondary" size="small" @click=${this.closePicker}>Cancel</loomi-button>
          <loomi-button size="small" @click=${this.applyRange}>Apply</loomi-button>
        </div>
      </section>
    `;
    }
    renderPresets() {
        return html `
      <nav class="presets" aria-label="Date range presets">
        ${this.presets.map((preset) => {
            const pressed = this.presetId === preset.id;
            return html `
            <button
              class="preset"
              type="button"
              aria-pressed=${pressed ? "true" : "false"}
              @click=${() => this.handlePresetClick(preset)}
            >
              ${preset.label}
            </button>
          `;
        })}
      </nav>
    `;
    }
    renderRangeFields(label, startProperty, endProperty) {
        return html `
      <section class="input-field">
        <span>${label}</span>
        <div class="range-grid">
          <label class="input-field">
            <span>Start</span>
            <loomi-datepicker
              size="small"
              format="yyyy-mm-dd"
              placeholder="Select start date"
              .selectedValue=${this[startProperty]}
              min-date=${this.min || nothing}
              max-date=${this.max || nothing}
              @change=${(event) => this.handleDatepickerChange(event, startProperty)}
            ></loomi-datepicker>
          </label>
          <label class="input-field">
            <span>End</span>
            <loomi-datepicker
              size="small"
              format="yyyy-mm-dd"
              placeholder="Select end date"
              .selectedValue=${this[endProperty]}
              min-date=${this.min || nothing}
              max-date=${this.max || nothing}
              @change=${(event) => this.handleDatepickerChange(event, endProperty)}
            ></loomi-datepicker>
          </label>
        </div>
      </section>
    `;
    }
    handlePresetClick(preset) {
        this.applyPresetValue(preset, true);
    }
    handleDatepickerChange(event, property) {
        const detail = event.detail;
        const isoDate = detail?.dates?.[0];
        if (!isoDate) {
            return;
        }
        this[property] = isoDate;
        this.presetId = "custom";
        this.normalizeRange();
        this.dispatchChange();
    }
    syncOutsideClick() {
        this.cleanupOutside?.();
        this.cleanupOutside = this.open ? onClickOutside(this, () => this.closePicker()) : undefined;
    }
    syncPlacement() {
        this.cleanupPlacement?.();
        cancelAnimationFrame(this.placementFrame);
        if (!this.open) {
            this.cleanupPlacement = undefined;
            return;
        }
        const reposition = () => this.schedulePlacement();
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        this.cleanupPlacement = () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
        };
        this.schedulePlacement();
    }
    schedulePlacement() {
        cancelAnimationFrame(this.placementFrame);
        this.placementFrame = requestAnimationFrame(() => {
            void this.updateComplete.then(() => this.resolvePlacement());
        });
    }
    resolvePlacement() {
        if (!this.open)
            return;
        const popover = this.renderRoot.querySelector(".popover");
        const trigger = this.renderRoot.querySelector(".trigger");
        if (!popover || !trigger)
            return;
        const triggerRect = trigger.getBoundingClientRect();
        const popoverRect = popover.getBoundingClientRect();
        const margin = 8;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const popoverWidth = popoverRect.width || Math.min(640, viewportWidth - margin * 2);
        const popoverHeight = popoverRect.height || 420;
        const alignLeft = viewportWidth <= 640;
        let x = alignLeft ? triggerRect.left : triggerRect.right - popoverWidth;
        let y = triggerRect.bottom + margin;
        x = Math.min(Math.max(margin, x), Math.max(margin, viewportWidth - margin - popoverWidth));
        y = Math.min(Math.max(margin, y), Math.max(margin, viewportHeight - margin - popoverHeight));
        this.popoverX = x;
        this.popoverY = y;
    }
    applyPresetValue(preset, emitChange) {
        this.startDate = preset.startDate;
        this.endDate = preset.endDate;
        this.presetId = preset.id;
        if (preset.compareStartDate && preset.compareEndDate) {
            this.comparison = true;
            this.compareStartDate = preset.compareStartDate;
            this.compareEndDate = preset.compareEndDate;
        }
        if (emitChange) {
            this.dispatchChange();
        }
    }
    normalizeRange() {
        if (this.startDate && this.endDate && this.startDate > this.endDate) {
            const previousStart = this.startDate;
            this.startDate = this.endDate;
            this.endDate = previousStart;
        }
        if (this.compareStartDate && this.compareEndDate && this.compareStartDate > this.compareEndDate) {
            const previousStart = this.compareStartDate;
            this.compareStartDate = this.compareEndDate;
            this.compareEndDate = previousStart;
        }
    }
    setDefaultComparisonRange() {
        if (!this.startDate || !this.endDate) {
            return;
        }
        const start = new Date(`${this.startDate}T00:00:00`);
        const end = new Date(`${this.endDate}T00:00:00`);
        const durationDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        const comparisonEnd = addDays(start, -1);
        const comparisonStart = addDays(comparisonEnd, -durationDays + 1);
        this.compareStartDate = toIsoDate(comparisonStart);
        this.compareEndDate = toIsoDate(comparisonEnd);
    }
    dispatchChange() {
        this.dispatchDateEvent("loomi-date-range-change", {
            value: this.getValue(),
            presetId: this.presetId
        });
    }
    dispatchOpenChange() {
        this.dispatchDateEvent("loomi-date-range-open-change", { open: this.open });
    }
    dispatchDateEvent(name, detail) {
        this.dispatchEvent(new CustomEvent(name, {
            bubbles: true,
            composed: true,
            detail
        }));
    }
    getValue() {
        const value = {
            startDate: this.startDate,
            endDate: this.endDate
        };
        if (this.comparison && this.compareStartDate && this.compareEndDate) {
            value.compareStartDate = this.compareStartDate;
            value.compareEndDate = this.compareEndDate;
        }
        return value;
    }
    getDisplayValue() {
        if (!this.startDate || !this.endDate) {
            return this.placeholder;
        }
        const primary = `${formatDate(this.startDate)} - ${formatDate(this.endDate)}`;
        if (!this.comparison || !this.compareStartDate || !this.compareEndDate) {
            return primary;
        }
        return `${primary} compared with ${formatDate(this.compareStartDate)} - ${formatDate(this.compareEndDate)}`;
    }
};
__decorate([
    state()
], LoomiDateRangePicker.prototype, "popoverX", void 0);
__decorate([
    state()
], LoomiDateRangePicker.prototype, "popoverY", void 0);
LoomiDateRangePicker = __decorate([
    customElement("loomi-date-range-picker")
], LoomiDateRangePicker);
export { LoomiDateRangePicker };
//# sourceMappingURL=loomi-date-range-picker.js.map