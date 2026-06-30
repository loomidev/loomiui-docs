var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiDateFormatter, loomiDefaultText, loomiMonthName, loomiStyles, loomiT, loomiWeekdayNames, onClickOutside, } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const CAL = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />`;
const PREV = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />`;
const NEXT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />`;
const DEFAULT_PLACEHOLDER = "Select a date";
const pad = (n) => String(n).padStart(2, "0");
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => {
    const m = s.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
};
const sameDay = (a, b) => a.toDateString() === b.toDateString();
/**
 * `<loomi-datepicker>` — a calendar date picker (single or range). `popup` (input +
 * panel) or `inline` (calendar always visible, no triggering input). Locale-aware
 * month and weekday names. Form-associated: submits the formatted date(s) under `name`.
 * `selected-value`/`min-date`/`max-date` are parsed as ISO `yyyy-mm-dd`.
 *
 * @fires change - `detail: { value, dates }` when the selection changes.
 */
let LoomiDatepicker = class LoomiDatepicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        /** `popup` (input + panel) or `inline`. Attribute is `dp-style` (`style` is reserved). */
        this.dpStyle = "popup";
        this.range = false;
        this.selectedValue = "";
        this.minDate = "";
        this.maxDate = "";
        this.format = "yyyy-mm-dd";
        this.placeholder = DEFAULT_PLACEHOLDER;
        this.label = "";
        this.locale = "";
        this.required = false;
        this.weekStarts = "sunday";
        this.size = "regular";
        this.start = null;
        this.end = null;
        this.view = new Date();
        this.open = false;
        this.parsed = false;
        this.calendarView = "days";
        this.yearRangeStart = Math.floor(new Date().getFullYear() / 12) * 12;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        if (!this.parsed && this.selectedValue) {
            const parts = this.selectedValue.split(" - ");
            this.start = parseISO(parts[0]) ?? null;
            this.end = parts[1] ? parseISO(parts[1]) : null;
            if (this.start)
                this.view = new Date(this.start);
            this.parsed = true;
        }
        this.internals.setFormValue(this.value);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanup?.();
    }
    fmt(d) {
        const y = d.getFullYear(), mm = pad(d.getMonth() + 1), dd = pad(d.getDate());
        switch (this.format) {
            case "dd-mm-yyyy": return `${dd}-${mm}-${y}`;
            case "mm-dd-yyyy": return `${mm}-${dd}-${y}`;
            case "yyyy/mm/dd": return `${y}/${mm}/${dd}`;
            case "dd/mm/yyyy": return `${dd}/${mm}/${y}`;
            case "mm/dd/yyyy": return `${mm}/${dd}/${y}`;
            case "D d M, Y": {
                const wd = loomiDateFormatter(this.locale, { weekday: "short" }).format(d);
                const mo = loomiDateFormatter(this.locale, { month: "short" }).format(d);
                return `${wd} ${d.getDate()} ${mo}, ${y}`;
            }
            default: return `${y}-${mm}-${dd}`;
        }
    }
    /** Formatted value (range joined with " - "). */
    get value() {
        if (!this.start)
            return "";
        if (this.range)
            return this.end ? `${this.fmt(this.start)} - ${this.fmt(this.end)}` : this.fmt(this.start);
        return this.fmt(this.start);
    }
    get min() { return this.minDate ? parseISO(this.minDate) : null; }
    get max() { return this.maxDate ? parseISO(this.maxDate) : null; }
    disabled(d) {
        if (this.min && d < this.min)
            return true;
        if (this.max && d > this.max)
            return true;
        return false;
    }
    toggle() {
        this.open = !this.open;
        if (this.open) {
            this.calendarView = "days";
            this.yearRangeStart = this.yearRangeFor(this.view.getFullYear());
            this.cleanup = onClickOutside(this, () => (this.open = false));
        }
        else
            this.cleanup?.();
    }
    pick(d) {
        if (this.range) {
            if (!this.start || this.end || d < this.start) {
                this.start = d;
                this.end = null;
            }
            else {
                this.end = d;
            }
        }
        else {
            this.start = d;
            this.open = false;
            this.cleanup?.();
        }
        this.internals.setFormValue(this.value);
        this.dispatchEvent(new CustomEvent("change", {
            bubbles: true, composed: true,
            detail: { value: this.value, dates: [this.start, this.end].filter(Boolean).map((d) => d && iso(d)) },
        }));
    }
    shiftMonth(delta) {
        this.view = new Date(this.view.getFullYear(), this.view.getMonth() + delta, 1);
    }
    yearRangeFor(year) {
        return Math.floor(year / 12) * 12;
    }
    showMonths() {
        this.calendarView = "months";
    }
    showYears() {
        this.yearRangeStart = this.yearRangeFor(this.view.getFullYear());
        this.calendarView = "years";
    }
    pickMonth(month) {
        this.view = new Date(this.view.getFullYear(), month, 1);
        this.calendarView = "days";
    }
    pickYear(year) {
        this.view = new Date(year, this.view.getMonth(), 1);
        this.calendarView = "days";
    }
    shiftYearRange(delta) {
        this.yearRangeStart += delta * 12;
    }
    weekdays() {
        return loomiWeekdayNames(this.locale, this.weekStarts);
    }
    render() {
        const y = this.view.getFullYear(), m = this.view.getMonth();
        const first = new Date(y, m, 1);
        const offset = (first.getDay() - (this.weekStarts === "monday" ? 1 : 0) + 7) % 7;
        const daysInMonth = new Date(y, m + 1, 0).getDate();
        const today = new Date();
        const placeholder = loomiDefaultText(this.placeholder, DEFAULT_PLACEHOLDER, "datepicker.placeholder", this.locale);
        const cells = [];
        for (let i = 0; i < offset; i++)
            cells.push(html `<span class="loomi-empty"></span>`);
        for (let day = 1; day <= daysInMonth; day++) {
            const d = new Date(y, m, day);
            const isStart = this.start && sameDay(d, this.start);
            const isEnd = this.end && sameDay(d, this.end);
            const inRange = this.range && this.start && this.end && d > this.start && d < this.end;
            cells.push(html `<button
        class="loomi-day ${isStart || isEnd ? "selected" : ""} ${inRange ? "in-range" : ""} ${sameDay(d, today) ? "today" : ""}"
        ?disabled=${this.disabled(d)}
        @click=${() => this.pick(d)}
      >${day}</button>`);
        }
        const months = Array.from({ length: 12 }, (_value, month) => {
            return html `<button
        class="loomi-picker-cell ${month === m ? "selected" : ""}"
        aria-label=${loomiDateFormatter(this.locale, { month: "long", year: "numeric" }).format(new Date(y, month, 1))}
        @click=${() => this.pickMonth(month)}
      >${loomiMonthName(this.locale, month, "short")}</button>`;
        });
        const years = Array.from({ length: 12 }, (_value, index) => {
            const year = this.yearRangeStart + index;
            return html `<button
        class="loomi-picker-cell ${year === y ? "selected" : ""}"
        @click=${() => this.pickYear(year)}
      >${year}</button>`;
        });
        const calendarBody = html `
      <div class="loomi-head">
        ${this.calendarView === "years"
            ? html `<button class="loomi-nav" aria-label=${loomiT("datepicker.previousYears", {}, this.locale)} @click=${() => this.shiftYearRange(-1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${PREV}</svg></button>
            <span class="loomi-month">${this.yearRangeStart} - ${this.yearRangeStart + 11}</span>
            <button class="loomi-nav" aria-label=${loomiT("datepicker.nextYears", {}, this.locale)} @click=${() => this.shiftYearRange(1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${NEXT}</svg></button>`
            : this.calendarView === "months"
                ? html `<span class="loomi-nav-spacer"></span>
              <button class="loomi-head-button" aria-label=${loomiT("datepicker.chooseYear", {}, this.locale)} @click=${() => this.showYears()}>${y}</button>
              <span class="loomi-nav-spacer"></span>`
                : html `<button class="loomi-nav" aria-label=${loomiT("datepicker.previousMonth", {}, this.locale)} @click=${() => this.shiftMonth(-1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${PREV}</svg></button>
              <span class="loomi-title">
                <button class="loomi-head-button" aria-label=${loomiT("datepicker.chooseMonth", {}, this.locale)} @click=${() => this.showMonths()}>${loomiMonthName(this.locale, this.view.getMonth(), "long")}</button>
                <button class="loomi-head-button" aria-label=${loomiT("datepicker.chooseYear", {}, this.locale)} @click=${() => this.showYears()}>${y}</button>
              </span>
              <button class="loomi-nav" aria-label=${loomiT("datepicker.nextMonth", {}, this.locale)} @click=${() => this.shiftMonth(1)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${NEXT}</svg></button>`}
      </div>
      ${this.calendarView === "years"
            ? html `<div class="loomi-picker-grid years">${years}</div>`
            : this.calendarView === "months"
                ? html `<div class="loomi-picker-grid months">${months}</div>`
                : html `<div class="loomi-grid">
            ${this.weekdays().map((w) => html `<span class="loomi-wd">${w}</span>`)}
            ${cells}
          </div>`}
    `;
        if (this.dpStyle === "inline") {
            return html `<div class="loomi-dp-inline">
        ${this.label ? html `<span class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>` : nothing}
        <div class="loomi-cal inline">${calendarBody}</div>
      </div>`;
        }
        return html `<div class="loomi-dp ${this.open ? "open" : ""}">
      ${this.label ? html `<span class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>` : nothing}
      <div class="loomi-field size-${this.size}" @click=${() => this.toggle()}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${CAL}</svg>
        <span class="loomi-text ${this.value ? "" : "placeholder"}">${this.value || placeholder}${!this.value && this.required ? html `<span class="loomi-req"> *</span>` : nothing}</span>
      </div>
      ${this.open
            ? html `<div class="loomi-cal" @click=${(e) => e.stopPropagation()}>${calendarBody}</div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiDatepicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "dp-style" })
], LoomiDatepicker.prototype, "dpStyle", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDatepicker.prototype, "range", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiDatepicker.prototype, "selectedValue", void 0);
__decorate([
    property({ attribute: "min-date" })
], LoomiDatepicker.prototype, "minDate", void 0);
__decorate([
    property({ attribute: "max-date" })
], LoomiDatepicker.prototype, "maxDate", void 0);
__decorate([
    property()
], LoomiDatepicker.prototype, "format", void 0);
__decorate([
    property()
], LoomiDatepicker.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiDatepicker.prototype, "label", void 0);
__decorate([
    property()
], LoomiDatepicker.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDatepicker.prototype, "required", void 0);
__decorate([
    property({ attribute: "week-starts" })
], LoomiDatepicker.prototype, "weekStarts", void 0);
__decorate([
    property()
], LoomiDatepicker.prototype, "size", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "start", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "end", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "view", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "open", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "parsed", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "calendarView", void 0);
__decorate([
    state()
], LoomiDatepicker.prototype, "yearRangeStart", void 0);
LoomiDatepicker = __decorate([
    customElement("loomi-datepicker")
], LoomiDatepicker);
export { LoomiDatepicker };
//# sourceMappingURL=loomi-datepicker.js.map