import { css, html, nothing, svg } from "lit";
import { LoomiElement, loomiDateFormatter, loomiMonthName, loomiStyles, loomiWeekdayNames } from "@loomidev/core";
import { calendarStyles } from "./calendar-styles.js";
import { ALL_DAY_HEIGHT, HOUR_HEIGHT, RESOURCE_LABEL_WIDTH, addMinutes, buildAgendaGroups, canDragEvent, cloneDate, dateFromGridPosition, dateFromResourcePosition, formatEventRange, formatTime, formatTimezoneLabel, getAllDayEventsForDate, getEventsForDate, getMonthGridDays, getNowOffset, getVisibleWeekDays, isSameDay, isToday, layoutResourceDayEvents, layoutTimedEvents, startOfDay } from "./calendar-utils.js";
const PREV = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />`;
const NEXT = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />`;
const VIEW_OPTIONS = [
    { id: "month", label: "Month", shortcut: "M" },
    { id: "week", label: "Week", shortcut: "W" },
    { id: "day", label: "Day", shortcut: "D" },
    { id: "agenda", label: "Agenda", shortcut: "A" },
    { id: "resource", label: "Resources", shortcut: "R" }
];
export class LoomiProCalendar extends LoomiElement {
    static properties = {
        ...LoomiElement.properties,
        events: { attribute: false },
        resources: { attribute: false },
        view: { type: String, reflect: true },
        date: { attribute: false },
        locale: { type: String },
        weekStarts: { attribute: "week-starts" },
        timezone: { type: String },
        showTimezone: { attribute: "show-timezone", type: Boolean },
        showWeekends: { attribute: "show-weekends", type: Boolean },
        editable: { type: Boolean, reflect: true },
        loading: { type: Boolean, reflect: true },
        startHour: { attribute: "start-hour", type: Number },
        endHour: { attribute: "end-hour", type: Number },
        slotMinutes: { attribute: "slot-minutes", type: Number },
        _dragState: { state: true }
    };
    static styles = loomiStyles(calendarStyles, css `
    :host {
      --loomi-pro-cal-hour-height: ${HOUR_HEIGHT}px;
      --loomi-pro-cal-hour-count: 12;
      --loomi-pro-cal-resource-label-width: ${RESOURCE_LABEL_WIDTH}px;
    }
  `);
    events = [];
    resources = [];
    view = "month";
    date = new Date();
    locale = "";
    weekStarts = "sunday";
    timezone = "";
    showTimezone = false;
    showWeekends = true;
    editable = false;
    loading = false;
    startHour = 6;
    endHour = 18;
    slotMinutes = 30;
    boundPointerMove = (event) => this.handlePointerMove(event);
    boundPointerUp = (event) => this.handlePointerUp(event);
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute("tabindex")) {
            this.tabIndex = 0;
        }
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.detachPointerListeners();
    }
    render() {
        const hourCount = Math.max(1, this.endHour - this.startHour);
        this.style.setProperty("--loomi-pro-cal-hour-count", String(hourCount));
        return html `
      <div class="shell" @keydown=${this.handleKeydown}>
        ${this.renderToolbar()}
        <div class="body">
          ${this.loading ? html `<div class="loading-overlay">Loading calendar…</div>` : nothing}
          ${this.view === "month" ? this.renderMonthView() : nothing}
          ${this.view === "agenda" ? this.renderAgendaView() : nothing}
          ${this.view === "resource" ? this.renderResourceView() : nothing}
          ${this.view === "week" || this.view === "day" ? this.renderTimeView() : nothing}
        </div>
      </div>
    `;
    }
    renderToolbar() {
        return html `
      <div class="toolbar">
        <div class="toolbar-group">
          <div class="title">${this.getFormattedTitle()}</div>
          ${this.showTimezone && this.displayTimezone
            ? html `<span class="timezone-badge">${formatTimezoneLabel(this.displayTimezone, this.resolvedLocale)}</span>`
            : nothing}
        </div>
        <div class="toolbar-group">
          <button class="btn" @click=${this.goToToday}>Today</button>
          <button class="btn icon" aria-label="Previous" @click=${this.goPrev}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${PREV}</svg>
          </button>
          <button class="btn icon" aria-label="Next" @click=${this.goNext}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${NEXT}</svg>
          </button>
          <div class="segmented" role="tablist" aria-label="Calendar view">
            ${VIEW_OPTIONS.map((option) => html `
              <button
                class="seg-btn ${this.view === option.id ? "active" : ""}"
                role="tab"
                aria-selected=${this.view === option.id ? "true" : "false"}
                title=${`Shortcut: ${option.shortcut}`}
                @click=${() => this.changeView(option.id)}
              >${option.label}</button>
            `)}
          </div>
        </div>
      </div>
    `;
    }
    renderMonthView() {
        const cells = getMonthGridDays(this.date, this.weekStarts);
        const weekdays = loomiWeekdayNames(this.resolvedLocale, this.weekStarts);
        return html `
      <div class="month-view">
        <div class="weekdays" style=${`grid-template-columns: repeat(7, minmax(0, 1fr))`}>
          ${weekdays.map((label) => html `<div class="weekday">${label}</div>`)}
        </div>
        <div class="month-grid">
          ${cells.map(({ date, isOtherMonth }) => this.renderMonthCell(date, isOtherMonth))}
        </div>
      </div>
    `;
    }
    renderMonthCell(date, isOtherMonth) {
        const dayEvents = getEventsForDate(this.events, date);
        const today = isToday(date);
        return html `
      <div class="month-cell ${isOtherMonth ? "other-month" : ""} ${today ? "today" : ""}">
        <button
          class="day-num ${today ? "today" : ""}"
          @click=${() => this.openDayView(date)}
          aria-label=${loomiDateFormatter(this.resolvedLocale, { dateStyle: "full" }).format(date)}
        >${date.getDate()}</button>
        ${dayEvents.slice(0, 3).map((event) => this.renderEventPill(event))}
        ${dayEvents.length > 3
            ? html `<span class="event-pill more">+${dayEvents.length - 3} more</span>`
            : nothing}
      </div>
    `;
    }
    renderTimeView() {
        const days = this.view === "day"
            ? [startOfDay(this.date)]
            : getVisibleWeekDays(this.date, this.weekStarts, this.showWeekends);
        const hourCount = this.endHour - this.startHour;
        return html `
      <div class="month-view">
        <div
          class="weekdays"
          style=${`grid-template-columns: 64px repeat(${days.length}, minmax(0, 1fr))`}
        >
          <div class="weekday"></div>
          ${days.map((day) => {
            const weekdayIndex = (day.getDay() - (this.weekStarts === "monday" ? 1 : 0) + 7) % 7;
            const weekdayLabel = loomiWeekdayNames(this.resolvedLocale, this.weekStarts)[weekdayIndex];
            return html `
            <div class="weekday ${isToday(day) ? "is-today" : ""}">
              ${weekdayLabel} ${day.getDate()}
            </div>
          `;
        })}
        </div>
        ${this.renderAllDayRow(days)}
        <div class="time-layout">
          <div class="time-axis">
            ${Array.from({ length: hourCount }, (_, index) => {
            const hour = this.startHour + index;
            const labelDate = new Date(2023, 0, 1, hour, 0, 0);
            return html `<div class="time-axis-label">${formatTime(labelDate, this.resolvedLocale, this.displayTimezone)}</div>`;
        })}
          </div>
          <div class="time-grid-wrap">
            ${days.map((day) => this.renderDayColumn(day))}
          </div>
        </div>
      </div>
    `;
    }
    renderAllDayRow(days) {
        return html `
      <div
        class="all-day-row"
        style=${`grid-template-columns: 64px repeat(${days.length}, minmax(0, 1fr))`}
      >
        <div class="all-day-label">All day</div>
        ${days.map((day) => html `
          <div class="all-day-cell">
            ${getAllDayEventsForDate(this.events, day).map((event) => this.renderEventPill(event))}
          </div>
        `)}
      </div>
    `;
    }
    renderDayColumn(day) {
        const positioned = layoutTimedEvents(this.events, day, this.startHour, this.endHour);
        const nowOffset = isToday(day) ? getNowOffset(this.startHour, this.endHour, HOUR_HEIGHT) : null;
        const hourCount = this.endHour - this.startHour;
        return html `
      <div class="day-column">
        <div class="time-slots" style=${`height: ${hourCount * HOUR_HEIGHT}px`}>
          ${Array.from({ length: hourCount }, (_, index) => html `
            <div class="time-slot">
              ${this.editable ? html `
                <button
                  class="time-slot-button"
                  aria-label="Create event"
                  @click=${(event) => this.handleSlotClick(event, day, index)}
                ></button>
              ` : nothing}
            </div>
          `)}
          ${nowOffset !== null ? html `<div class="now-line" style=${`top: ${nowOffset}px`}></div>` : nothing}
          ${positioned.map((entry) => this.renderTimedEvent(entry.event, day, entry.top, entry.height, entry.left, entry.width))}
        </div>
      </div>
    `;
    }
    renderAgendaView() {
        const rangeStart = new Date(this.date.getFullYear(), this.date.getMonth(), 1);
        const rangeEnd = new Date(this.date.getFullYear(), this.date.getMonth() + 1, 0);
        const groups = buildAgendaGroups(this.events, rangeStart, rangeEnd);
        if (!groups.length) {
            return html `<div class="empty-state">No events scheduled for this range.</div>`;
        }
        return html `
      <div class="agenda-view">
        <div class="agenda-list">
          ${groups.map((group) => html `
            <section class="agenda-day">
              <div class="agenda-day-header">
                ${loomiDateFormatter(this.resolvedLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(group.date)}
              </div>
              ${group.events.map((event) => html `
                <button class="agenda-item" @click=${(clickEvent) => this.handleEventClick(clickEvent, event)}>
                  <div class="agenda-time">${formatEventRange(event, this.resolvedLocale, this.displayTimezone)}</div>
                  <div>
                    <div class="agenda-title">${event.title}</div>
                    ${event.description ? html `<div class="agenda-description">${event.description}</div>` : nothing}
                    ${event.recurrence?.label
            ? html `<div class="agenda-meta">${event.recurrence.label}</div>`
            : nothing}
                    ${event.resourceId
            ? html `<div class="agenda-meta">${this.getResourceLabel(event.resourceId)}</div>`
            : nothing}
                  </div>
                </button>
              `)}
            </section>
          `)}
        </div>
      </div>
    `;
    }
    renderResourceView() {
        const resources = this.resources.length
            ? this.resources
            : [{ id: "default", label: "Schedule", color: "primary" }];
        const hourCount = this.endHour - this.startHour;
        const day = startOfDay(this.date);
        return html `
      <div class="resource-view">
        <div class="resource-grid">
          <div class="resource-header">
            <div class="resource-label">Resources</div>
            <div class="resource-hours">
              ${Array.from({ length: hourCount }, (_, index) => {
            const hour = this.startHour + index;
            const labelDate = new Date(2023, 0, 1, hour, 0, 0);
            return html `<div class="resource-hour">${formatTime(labelDate, this.resolvedLocale, this.displayTimezone)}</div>`;
        })}
            </div>
          </div>
          ${resources.map((resource) => this.renderResourceRow(resource, day, hourCount))}
        </div>
      </div>
    `;
    }
    renderResourceRow(resource, day, hourCount) {
        const positioned = layoutResourceDayEvents(this.events, resource.id, day, this.startHour, this.endHour);
        return html `
      <div class="resource-row">
        <div class="resource-name">${resource.label}</div>
        <div
          class="resource-timeline"
          style=${`height: ${Math.max(ALL_DAY_HEIGHT, 72)}px`}
          @click=${(event) => this.handleResourceTrackClick(event, day, resource.id)}
        >
          <div class="resource-track">
            ${Array.from({ length: hourCount }, () => html `<div class="resource-slot"></div>`)}
          </div>
          ${positioned.map(({ event, left, width }) => html `
            <button
              class="timed-event event-${event.color || resource.color || "primary"} ${canDragEvent(event, this.editable) ? "draggable" : ""}"
              style=${`left: ${left}%; width: ${width}%; top: 8px; height: calc(100% - 16px);`}
              @click=${(clickEvent) => this.handleEventClick(clickEvent, event)}
              @pointerdown=${(pointerEvent) => this.handleEventPointerDown(pointerEvent, event, day, resource.id)}
            >
              <div class="timed-event-title">${event.title}</div>
              <div class="timed-event-meta">${formatEventRange(event, this.resolvedLocale, this.displayTimezone)}</div>
            </button>
          `)}
        </div>
      </div>
    `;
    }
    renderEventPill(event) {
        return html `
      <button
        class="event-pill event-${event.color || "primary"}"
        title=${event.title}
        @click=${(clickEvent) => this.handleEventClick(clickEvent, event)}
      >
        ${event.isAllDay ? "" : `${formatTime(event.start, this.resolvedLocale, event.timezone || this.displayTimezone)} `}
        ${event.title}
        ${event.recurrence?.label ? ` · ${event.recurrence.label}` : ""}
      </button>
    `;
    }
    renderTimedEvent(event, day, top, height, left, width) {
        const preview = this.getDragPreview(event);
        const displayTop = preview?.top ?? top;
        const displayHeight = preview?.height ?? height;
        const draggable = canDragEvent(event, this.editable);
        const dragging = this._dragState?.eventId === event.id;
        return html `
      <button
        class="timed-event event-${event.color || "primary"} ${draggable ? "draggable" : ""} ${dragging ? "dragging" : ""}"
        style=${`top: ${displayTop}px; height: ${displayHeight}px; left: calc(${left}% + 2px); width: calc(${width}% - 4px);`}
        @click=${(clickEvent) => this.handleEventClick(clickEvent, event)}
        @pointerdown=${(pointerEvent) => this.handleEventPointerDown(pointerEvent, event, day)}
      >
        <div class="timed-event-title">${event.title}</div>
        ${displayHeight >= 40
            ? html `<div class="timed-event-meta">${formatEventRange(event, this.resolvedLocale, this.displayTimezone)}</div>`
            : nothing}
        ${event.recurrence?.label && displayHeight >= 56
            ? html `<div class="timed-event-meta">${event.recurrence.label}</div>`
            : nothing}
        ${draggable ? html `<span class="resize-handle" @pointerdown=${(pointerEvent) => this.handleResizePointerDown(pointerEvent, event, day)}></span>` : nothing}
      </button>
    `;
    }
    getDragPreview(event) {
        if (!this._dragState || this._dragState.eventId !== event.id) {
            return null;
        }
        const deltaMinutes = Math.round(((this._dragState.currentDeltaY / HOUR_HEIGHT) * 60) / this.slotMinutes) * this.slotMinutes;
        if (this._dragState.mode === "resize") {
            const nextEnd = addMinutes(this._dragState.originalEnd, deltaMinutes);
            const startMinutes = Math.max(0, (this._dragState.originalStart.getHours() - this.startHour) * 60 + this._dragState.originalStart.getMinutes());
            const endMinutes = Math.max(startMinutes + this.slotMinutes, (nextEnd.getHours() - this.startHour) * 60 + nextEnd.getMinutes());
            return {
                top: (startMinutes / 60) * HOUR_HEIGHT,
                height: Math.max(22, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
            };
        }
        const nextStart = addMinutes(this._dragState.originalStart, deltaMinutes);
        const durationMs = this._dragState.originalEnd.getTime() - this._dragState.originalStart.getTime();
        const nextEnd = new Date(nextStart.getTime() + durationMs);
        const startMinutes = Math.max(0, (nextStart.getHours() - this.startHour) * 60 + nextStart.getMinutes());
        const endMinutes = Math.max(startMinutes + this.slotMinutes, (nextEnd.getHours() - this.startHour) * 60 + nextEnd.getMinutes());
        return {
            top: (startMinutes / 60) * HOUR_HEIGHT,
            height: Math.max(22, ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT)
        };
    }
    handleEventPointerDown(pointerEvent, event, day, resourceId) {
        if (!canDragEvent(event, this.editable)) {
            return;
        }
        pointerEvent.stopPropagation();
        this._dragState = {
            eventId: event.id,
            mode: "move",
            pointerId: pointerEvent.pointerId,
            startPointerY: pointerEvent.clientY,
            currentDeltaY: 0,
            originalStart: cloneDate(event.start),
            originalEnd: cloneDate(event.end),
            originalResourceId: event.resourceId,
            day,
            resourceId
        };
        this.attachPointerListeners();
        pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    }
    handleResizePointerDown(pointerEvent, event, day) {
        if (!canDragEvent(event, this.editable)) {
            return;
        }
        pointerEvent.stopPropagation();
        this._dragState = {
            eventId: event.id,
            mode: "resize",
            pointerId: pointerEvent.pointerId,
            startPointerY: pointerEvent.clientY,
            currentDeltaY: 0,
            originalStart: cloneDate(event.start),
            originalEnd: cloneDate(event.end),
            originalResourceId: event.resourceId,
            day
        };
        this.attachPointerListeners();
        pointerEvent.currentTarget.setPointerCapture(pointerEvent.pointerId);
    }
    handlePointerMove(pointerEvent) {
        if (!this._dragState || pointerEvent.pointerId !== this._dragState.pointerId) {
            return;
        }
        this._dragState = {
            ...this._dragState,
            currentDeltaY: pointerEvent.clientY - this._dragState.startPointerY
        };
        this.requestUpdate();
    }
    handlePointerUp(pointerEvent) {
        if (!this._dragState || pointerEvent.pointerId !== this._dragState.pointerId) {
            return;
        }
        const event = this.events.find((entry) => entry.id === this._dragState.eventId);
        if (event) {
            const deltaMinutes = Math.round(((this._dragState.currentDeltaY / HOUR_HEIGHT) * 60) / this.slotMinutes) * this.slotMinutes;
            const durationMs = this._dragState.originalEnd.getTime() - this._dragState.originalStart.getTime();
            let nextStart = this._dragState.originalStart;
            let nextEnd = this._dragState.originalEnd;
            if (this._dragState.mode === "move") {
                nextStart = addMinutes(this._dragState.originalStart, deltaMinutes);
                nextEnd = new Date(nextStart.getTime() + durationMs);
            }
            else {
                nextEnd = addMinutes(this._dragState.originalEnd, deltaMinutes);
                if (nextEnd <= nextStart) {
                    nextEnd = addMinutes(nextStart, this.slotMinutes);
                }
            }
            const changed = nextStart.getTime() !== event.start.getTime() || nextEnd.getTime() !== event.end.getTime();
            if (changed) {
                const updated = {
                    ...event,
                    start: nextStart,
                    end: nextEnd,
                    resourceId: this._dragState.resourceId ?? event.resourceId
                };
                this.dispatchEvent(new CustomEvent("loomi-event-change", {
                    detail: {
                        event: updated,
                        previousStart: this._dragState.originalStart,
                        previousEnd: this._dragState.originalEnd,
                        previousResourceId: this._dragState.originalResourceId
                    },
                    bubbles: true,
                    composed: true
                }));
            }
        }
        this._dragState = undefined;
        this.detachPointerListeners();
        this.requestUpdate();
    }
    attachPointerListeners() {
        window.addEventListener("pointermove", this.boundPointerMove);
        window.addEventListener("pointerup", this.boundPointerUp);
    }
    detachPointerListeners() {
        window.removeEventListener("pointermove", this.boundPointerMove);
        window.removeEventListener("pointerup", this.boundPointerUp);
    }
    handleSlotClick(event, day, hourIndex) {
        if (!this.editable) {
            return;
        }
        const rect = event.currentTarget.getBoundingClientRect();
        const offsetY = event.clientY - rect.top;
        const start = dateFromGridPosition(day, offsetY + hourIndex * HOUR_HEIGHT, this.startHour, HOUR_HEIGHT, this.slotMinutes);
        const end = addMinutes(start, this.slotMinutes);
        this.dispatchSlotSelect({ start, end, allDay: false });
    }
    handleResourceTrackClick(event, day, resourceId) {
        if (!this.editable) {
            return;
        }
        const track = event.currentTarget;
        const rect = track.getBoundingClientRect();
        const start = dateFromResourcePosition(day, event.clientX - rect.left, rect.width, this.startHour, this.endHour, this.slotMinutes);
        const end = addMinutes(start, this.slotMinutes);
        this.dispatchSlotSelect({ start, end, resourceId, allDay: false });
    }
    dispatchSlotSelect(detail) {
        this.dispatchEvent(new CustomEvent("loomi-slot-select", {
            detail,
            bubbles: true,
            composed: true
        }));
    }
    handleEventClick(event, calendarEvent) {
        event.stopPropagation();
        this.dispatchEvent(new CustomEvent("loomi-event-click", {
            detail: { event: calendarEvent },
            bubbles: true,
            composed: true
        }));
    }
    handleKeydown(event) {
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault();
                this.goPrev();
                break;
            case "ArrowRight":
                event.preventDefault();
                this.goNext();
                break;
            case "t":
            case "T":
                event.preventDefault();
                this.goToToday();
                break;
            default: {
                const shortcut = VIEW_OPTIONS.find((option) => option.shortcut.toLowerCase() === event.key.toLowerCase());
                if (shortcut) {
                    event.preventDefault();
                    this.changeView(shortcut.id);
                }
            }
        }
    }
    openDayView(date) {
        this.date = startOfDay(date);
        this.changeView("day");
    }
    changeView(view) {
        if (this.view === view) {
            return;
        }
        this.view = view;
        this.dispatchEvent(new CustomEvent("loomi-view-change", {
            detail: { view },
            bubbles: true,
            composed: true
        }));
    }
    goPrev() {
        const next = cloneDate(this.date);
        if (this.view === "month" || this.view === "agenda") {
            next.setMonth(next.getMonth() - 1);
        }
        else if (this.view === "week") {
            next.setDate(next.getDate() - 7);
        }
        else {
            next.setDate(next.getDate() - 1);
        }
        this.updateDate(next);
    }
    goNext() {
        const next = cloneDate(this.date);
        if (this.view === "month" || this.view === "agenda") {
            next.setMonth(next.getMonth() + 1);
        }
        else if (this.view === "week") {
            next.setDate(next.getDate() + 7);
        }
        else {
            next.setDate(next.getDate() + 1);
        }
        this.updateDate(next);
    }
    goToToday() {
        this.updateDate(new Date());
    }
    updateDate(date) {
        this.date = date;
        this.dispatchEvent(new CustomEvent("loomi-date-change", {
            detail: { date },
            bubbles: true,
            composed: true
        }));
    }
    getFormattedTitle() {
        if (this.view === "month" || this.view === "agenda") {
            return `${loomiMonthName(this.resolvedLocale, this.date.getMonth(), "long")} ${this.date.getFullYear()}`;
        }
        if (this.view === "day" || this.view === "resource") {
            return loomiDateFormatter(this.resolvedLocale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(this.date);
        }
        const days = getVisibleWeekDays(this.date, this.weekStarts, this.showWeekends);
        const start = days[0];
        const end = days[days.length - 1];
        if (isSameDay(start, end)) {
            return loomiDateFormatter(this.resolvedLocale, { month: "long", day: "numeric", year: "numeric" }).format(start);
        }
        if (start.getFullYear() === end.getFullYear() && start.getMonth() === end.getMonth()) {
            return `${loomiMonthName(this.resolvedLocale, start.getMonth(), "long")} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
        }
        if (start.getFullYear() === end.getFullYear()) {
            return `${loomiMonthName(this.resolvedLocale, start.getMonth(), "short")} ${start.getDate()} – ${loomiMonthName(this.resolvedLocale, end.getMonth(), "short")} ${end.getDate()}, ${start.getFullYear()}`;
        }
        return `${loomiDateFormatter(this.resolvedLocale, { month: "short", day: "numeric", year: "numeric" }).format(start)} – ${loomiDateFormatter(this.resolvedLocale, { month: "short", day: "numeric", year: "numeric" }).format(end)}`;
    }
    getResourceLabel(resourceId) {
        return this.resources.find((resource) => resource.id === resourceId)?.label ?? resourceId;
    }
    get resolvedLocale() {
        return this.locale || "en";
    }
    get displayTimezone() {
        if (this.timezone) {
            return this.timezone;
        }
        try {
            return Intl.DateTimeFormat().resolvedOptions().timeZone;
        }
        catch {
            return "";
        }
    }
}
//# sourceMappingURL=loomi-pro-calendar.js.map