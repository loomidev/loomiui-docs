var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const CHEVRON = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />`;
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />`;
const PIN = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />`;
const DEFAULT_PLACEHOLDER = "Select a timezone";
const DEFAULT_EMPTY_PLACEHOLDER = "No timezones found";
// A small hand-picked set covering every UTC offset, used only on engines without
// `Intl.supportedValuesOf` (e.g. Safari < 15.4) — modern evergreen browsers and Node 20+
// return the full ~400-zone IANA set instead.
const FALLBACK_ZONE_IDS = [
    "UTC", "Pacific/Midway", "Pacific/Honolulu", "America/Anchorage", "America/Los_Angeles",
    "America/Denver", "America/Chicago", "America/Mexico_City", "America/New_York",
    "America/Halifax", "America/St_Johns", "America/Sao_Paulo", "Atlantic/Azores",
    "Europe/London", "Europe/Paris", "Europe/Berlin", "Europe/Madrid", "Europe/Rome",
    "Africa/Lagos", "Africa/Cairo", "Europe/Moscow", "Asia/Dubai", "Asia/Kabul",
    "Asia/Karachi", "Asia/Kolkata", "Asia/Kathmandu", "Asia/Dhaka", "Asia/Bangkok",
    "Asia/Shanghai", "Asia/Singapore", "Asia/Tokyo", "Asia/Seoul", "Australia/Sydney",
    "Pacific/Norfolk", "Pacific/Auckland", "Pacific/Kiritimati",
];
function allTimezoneIds() {
    try {
        const supportedValuesOf = Intl.supportedValuesOf;
        if (typeof supportedValuesOf === "function") {
            const zones = supportedValuesOf("timeZone");
            if (zones.length)
                return zones;
        }
    }
    catch {
        /* fall through to the fallback list */
    }
    return FALLBACK_ZONE_IDS;
}
function splitZoneId(id) {
    const parts = id.split("/");
    const city = (parts[parts.length - 1] ?? id).replace(/_/g, " ");
    const region = parts.length > 1 ? parts.slice(0, -1).join(" / ").replace(/_/g, " ") : "Other";
    return { city, region };
}
// Computes the zone's current UTC offset by reading its wall-clock time for `at`,
// re-interpreting those same numbers as UTC, and diffing from the real UTC instant —
// works for any offset granularity (including the 30/45-minute zones) and stays
// DST-correct since it's keyed off `at`, unlike a baked-in offset would be.
function offsetMinutesFor(id, at) {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: id,
            hourCycle: "h23",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        })
            .formatToParts(at)
            .reduce((acc, part) => {
            if (part.type !== "literal")
                acc[part.type] = part.value;
            return acc;
        }, {});
        const asUTC = Date.UTC(Number(parts.year), Number(parts.month) - 1, Number(parts.day), Number(parts.hour), Number(parts.minute), Number(parts.second));
        const minutes = Math.round((asUTC - at.getTime()) / 60000);
        return minutes === 0 ? 0 : minutes; // normalize -0
    }
    catch {
        return 0;
    }
}
function formatOffsetLabel(offsetMinutes) {
    const sign = offsetMinutes < 0 ? "-" : "+";
    const abs = Math.abs(offsetMinutes);
    const h = String(Math.floor(abs / 60)).padStart(2, "0");
    const m = String(abs % 60).padStart(2, "0");
    return `UTC${sign}${h}:${m}`;
}
function currentTimeFor(id, locale, at) {
    try {
        return new Intl.DateTimeFormat(locale || undefined, { timeZone: id, hour: "numeric", minute: "2-digit" }).format(at);
    }
    catch {
        return "";
    }
}
function buildZoneRecords(locale) {
    const now = new Date();
    const records = allTimezoneIds().map((id) => {
        const { city, region } = splitZoneId(id);
        const offsetMinutes = offsetMinutesFor(id, now);
        return {
            id,
            city,
            region,
            offsetMinutes,
            offsetLabel: formatOffsetLabel(offsetMinutes),
            time: currentTimeFor(id, locale, now),
        };
    });
    records.sort((a, b) => a.offsetMinutes - b.offsetMinutes || a.city.localeCompare(b.city));
    return records;
}
function browserZoneId() {
    try {
        return Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    }
    catch {
        return "";
    }
}
/**
 * `<loomi-timezonepicker>` — a searchable dropdown over the full IANA timezone
 * database (`Intl.supportedValuesOf("timeZone")`), each row showing its current local
 * time and live UTC offset (DST-aware, recomputed — not a baked-in value).
 *
 * `selection` accepts a canonical IANA id (e.g. `"Africa/Accra"`) or a bare city name
 * (e.g. `"Accra"`), case-insensitively.
 *
 * Form-associated: submits the IANA id under `name`.
 *
 * @csspart trigger - The clickable trigger.
 * @csspart panel - The dropdown panel.
 * @fires select - `detail: { id, city, region, offsetLabel }` when a zone is chosen.
 * @fires change - Fired when the selection changes (composed).
 */
let LoomiTimezonepicker = class LoomiTimezonepicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.name = "";
        this.label = "";
        this.placeholder = DEFAULT_PLACEHOLDER;
        this.locale = "";
        this.selection = "";
        this.disabled = false;
        this.readonly = false;
        this.required = false;
        this.size = "medium";
        this.variant = "default";
        this.emptyPlaceholder = DEFAULT_EMPTY_PLACEHOLDER;
        this.invalid = false;
        this.open = false;
        this.search = "";
        this.selectedId = "";
        /** Index of the keyboard-highlighted option within `this.filtered`, while open. */
        this.activeIndex = -1;
        this.recordsCache = null;
        this.onDocClick = (e) => {
            if (this.open && !e.composedPath().includes(this))
                this.close(true);
        };
        this.onKeydown = (e) => {
            if (e.key === "Escape") {
                this.close(true);
                return;
            }
            if (!this.open) {
                if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
                    e.preventDefault();
                    this.toggleOpen();
                }
                return;
            }
            const opts = this.filtered;
            switch (e.key) {
                case "ArrowDown":
                    e.preventDefault();
                    this.activeIndex = Math.min(this.activeIndex + 1, opts.length - 1);
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                    break;
                case "Home":
                    e.preventDefault();
                    this.activeIndex = 0;
                    break;
                case "End":
                    e.preventDefault();
                    this.activeIndex = opts.length - 1;
                    break;
                case "Enter":
                case " ":
                    if (this.activeIndex >= 0 && opts[this.activeIndex]) {
                        e.preventDefault();
                        this.choose(opts[this.activeIndex]);
                    }
                    break;
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("click", this.onDocClick, true);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("click", this.onDocClick, true);
    }
    willUpdate(changed) {
        if (changed.has("selection")) {
            this.selectedId = this.resolveZone(this.selection)?.id ?? "";
        }
        this.internals.setFormValue(this.formValue);
        this.syncValidity();
    }
    /** Pre-built zone list (id, city, region, live offset, live local time) — recomputed
     * at most once a minute (or on a locale change) so offsets stay fresh without a timer. */
    get records() {
        const now = Date.now();
        if (!this.recordsCache || this.recordsCache.locale !== this.locale || now - this.recordsCache.at > 60_000) {
            this.recordsCache = { locale: this.locale, at: now, records: buildZoneRecords(this.locale) };
        }
        return this.recordsCache.records;
    }
    resolveZone(raw) {
        const q = raw.trim();
        if (!q)
            return undefined;
        const lower = q.toLowerCase();
        return this.records.find((z) => z.id.toLowerCase() === lower) ?? this.records.find((z) => z.city.toLowerCase() === lower);
    }
    get formValue() {
        return this.selectedId;
    }
    get selectedRecord() {
        return this.selectedId ? this.records.find((z) => z.id === this.selectedId) : undefined;
    }
    get browserZone() {
        const id = browserZoneId();
        return id ? this.records.find((z) => z.id === id) : undefined;
    }
    get filtered() {
        if (!this.search)
            return this.records;
        const q = this.search.trim().toLowerCase();
        return this.records.filter((z) => z.city.toLowerCase().includes(q) ||
            z.region.toLowerCase().includes(q) ||
            z.id.toLowerCase().includes(q) ||
            z.offsetLabel.toLowerCase().includes(q));
    }
    /** Clear the current selection. */
    reset() {
        this.selection = "";
        this.selectedId = "";
        this.emitChange();
    }
    toggleOpen() {
        if (this.disabled || this.readonly)
            return;
        if (this.open) {
            this.close(true);
            return;
        }
        this.open = true;
        const selectedIndex = this.filtered.findIndex((z) => z.id === this.selectedId);
        this.activeIndex = selectedIndex >= 0 ? selectedIndex : this.filtered.length ? 0 : -1;
        this.updateComplete.then(() => this.searchEl?.focus());
    }
    close(showValidation = false) {
        this.open = false;
        this.search = "";
        this.activeIndex = -1;
        if (showValidation)
            this.showValidation();
    }
    emitChange() {
        this.internals.setFormValue(this.formValue);
        this.syncValidity();
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    choose(rec) {
        this.selectedId = rec.id;
        this.selection = rec.id;
        this.close();
        this.dispatchEvent(new CustomEvent("select", {
            bubbles: true,
            composed: true,
            detail: { id: rec.id, city: rec.city, region: rec.region, offsetLabel: rec.offsetLabel },
        }));
        this.emitChange();
    }
    useMyTimezone() {
        const rec = this.browserZone;
        if (rec)
            this.choose(rec);
    }
    validate() {
        this.validationVisible = true;
        return this.syncValidity(true);
    }
    checkValidity() {
        this.syncValidity();
        return this.internals.checkValidity();
    }
    reportValidity() {
        this.validationVisible = true;
        this.syncValidity(true);
        return this.internals.reportValidity();
    }
    syncValidity(showInvalid = this.validationVisible) {
        const empty = this.required && !this.disabled && !this.readonly && this.selectedId === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? loomiT("validation.selectOption", {}, this.locale) : "";
        if (this.triggerEl)
            this.internals.setValidity(validity, message, this.triggerEl);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    renderPanel() {
        if (!this.open)
            return nothing;
        const opts = this.filtered;
        const myZone = this.browserZone;
        return html `
      <div class="loomi-panel" part="panel" role="listbox">
        <div class="loomi-searchbox">
          <input
            class="loomi-search"
            type="text"
            placeholder=${loomiT("timezonepicker.searchPlaceholder", {}, this.locale)}
            .value=${this.search}
            @input=${(e) => {
            this.search = e.target.value;
            this.activeIndex = this.filtered.length ? 0 : -1;
        }}
          />
        </div>
        ${myZone
            ? html `<button type="button" class="loomi-detect" @click=${() => this.useMyTimezone()}>
              <svg class="loomi-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${PIN}</svg>
              <span class="loomi-detect-label">${loomiT("timezonepicker.detectLabel", {}, this.locale)}</span>
              <span class="loomi-detect-zone">${myZone.city} (${myZone.offsetLabel})</span>
            </button>`
            : nothing}
        <div class="loomi-list">
          ${opts.length
            ? opts.map((z, i) => {
                const sel = z.id === this.selectedId;
                return html `<div
                  id="loomi-timezone-${i}"
                  class="loomi-option ${sel ? "selected" : ""} ${i === this.activeIndex ? "active" : ""}"
                  role="option"
                  aria-selected=${sel ? "true" : "false"}
                  @mouseenter=${() => (this.activeIndex = i)}
                  @click=${() => this.choose(z)}
                >
                  <span class="loomi-option-text">
                    <span class="loomi-option-city">${z.city}</span>
                    <span class="loomi-option-region">${z.region}</span>
                  </span>
                  <span class="loomi-option-meta">
                    <span class="loomi-option-time">${z.time}</span>
                    <span class="loomi-option-offset">${z.offsetLabel}</span>
                  </span>
                  ${sel
                    ? html `<svg class="loomi-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${CHECK}</svg>`
                    : nothing}
                </div>`;
            })
            : html `<div class="loomi-empty">${loomiDefaultText(this.emptyPlaceholder, DEFAULT_EMPTY_PLACEHOLDER, "timezonepicker.emptyPlaceholder", this.locale)}</div>`}
        </div>
      </div>
    `;
    }
    get floatLabel() {
        if (!this.label)
            return false;
        return this.open || !!this.selectedId;
    }
    render() {
        const hasLabel = !!this.label;
        const hasSelection = !!this.selectedId;
        const reserveLabelSpace = hasLabel && !hasSelection && !this.open;
        const rec = this.selectedRecord;
        const displayText = hasSelection && rec
            ? `${rec.city} (${rec.offsetLabel})`
            : reserveLabelSpace
                ? `${this.label}${this.required ? " *" : ""}`
                : loomiDefaultText(this.placeholder, DEFAULT_PLACEHOLDER, "timezonepicker.placeholder", this.locale);
        const activeId = this.open && this.activeIndex >= 0 && this.filtered[this.activeIndex] ? `loomi-timezone-${this.activeIndex}` : nothing;
        const classes = `loomi-timezonepicker size-${this.size} ${this.open ? "open" : ""} ${this.floatLabel ? "float" : ""}`;
        return html `
      <div class=${classes} @keydown=${this.onKeydown}>
        <button
          type="button"
          class="loomi-trigger variant-${this.variant}"
          part="trigger"
          aria-haspopup="listbox"
          aria-expanded=${this.open ? "true" : "false"}
          aria-activedescendant=${activeId}
          ?disabled=${this.disabled}
          @click=${() => this.toggleOpen()}
          @blur=${this.showValidation}
        >
          <span class="loomi-value ${hasSelection ? "" : "placeholder"} ${reserveLabelSpace ? "sizer" : ""}">${displayText}</span>
          <svg class="loomi-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${CHEVRON}</svg>
        </button>
        ${hasLabel
            ? html `<label class="loomi-label">${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label>`
            : nothing}
        ${this.renderPanel()}
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTimezonepicker.prototype, "name", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "label", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "selection", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimezonepicker.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimezonepicker.prototype, "readonly", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimezonepicker.prototype, "required", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "size", void 0);
__decorate([
    property()
], LoomiTimezonepicker.prototype, "variant", void 0);
__decorate([
    property({ attribute: "empty-placeholder" })
], LoomiTimezonepicker.prototype, "emptyPlaceholder", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTimezonepicker.prototype, "invalid", void 0);
__decorate([
    state()
], LoomiTimezonepicker.prototype, "open", void 0);
__decorate([
    state()
], LoomiTimezonepicker.prototype, "search", void 0);
__decorate([
    state()
], LoomiTimezonepicker.prototype, "selectedId", void 0);
__decorate([
    state()
], LoomiTimezonepicker.prototype, "activeIndex", void 0);
__decorate([
    query(".loomi-search")
], LoomiTimezonepicker.prototype, "searchEl", void 0);
__decorate([
    query(".loomi-trigger")
], LoomiTimezonepicker.prototype, "triggerEl", void 0);
LoomiTimezonepicker = __decorate([
    customElement("loomi-timezonepicker")
], LoomiTimezonepicker);
export { LoomiTimezonepicker };
//# sourceMappingURL=loomi-timezonepicker.js.map