var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />`;
/**
 * `<loomi-timeline-item>` — a single timeline entry. Group inside `<loomi-timeline>`.
 *
 * There's nothing to set per-item: the connecting line hides itself on the last item,
 * and `alternate` placement resolves from the item's position among its siblings -
 * both purely in CSS, from the real DOM order.
 *
 * @slot - Custom content (overrides the `content` attribute).
 * @slot content - Alias for the default slot.
 */
let LoomiTimelineItem = class LoomiTimelineItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.date = "";
        this.content = "";
        this.completed = false;
        this.stacked = false;
        this.anchor = "small";
        this.icon = "";
        this.avatar = "";
        this.placement = "left";
        this.color = "primary";
    }
    static { this.styles = loomiStyles(componentStyles); }
    renderDot() {
        const big = this.anchor === "big";
        let inner = nothing;
        if (big) {
            if (this.avatar)
                inner = html `<img src=${this.avatar} alt="" />`;
            else if (this.icon && getLoomiIcon(this.icon))
                inner = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${getLoomiIcon(this.icon)}</svg>`;
            else if (this.completed)
                inner = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${CHECK}</svg>`;
        }
        const iconColored = big && (this.icon || this.completed) && !this.avatar;
        return html `<span class="loomi-dot ${this.anchor} ${this.completed || iconColored ? "completed" : ""}">${inner}</span>`;
    }
    render() {
        const dateCol = !this.stacked ? html `<div class="loomi-date-col">${this.date}</div>` : nothing;
        const body = html `<div class="loomi-body">
      <div class="loomi-content"><slot name="content"><slot>${this.content}</slot></slot></div>
      ${this.stacked && this.date ? html `<div class="loomi-date-top">${this.date}</div>` : nothing}
    </div>`;
        return html `<div class="loomi-item" style=${accentVars(this.color)}>
      <div class="loomi-side">${dateCol}${body}</div>
      <div class="loomi-anchor">
        ${this.renderDot()}
        <div class="loomi-line"></div>
      </div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiTimelineItem.prototype, "date", void 0);
__decorate([
    property()
], LoomiTimelineItem.prototype, "content", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTimelineItem.prototype, "completed", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTimelineItem.prototype, "stacked", void 0);
__decorate([
    property()
], LoomiTimelineItem.prototype, "anchor", void 0);
__decorate([
    property()
], LoomiTimelineItem.prototype, "icon", void 0);
__decorate([
    property()
], LoomiTimelineItem.prototype, "avatar", void 0);
__decorate([
    property({ reflect: true })
], LoomiTimelineItem.prototype, "placement", void 0);
__decorate([
    property()
], LoomiTimelineItem.prototype, "color", void 0);
LoomiTimelineItem = __decorate([
    customElement("loomi-timeline-item")
], LoomiTimelineItem);
export { LoomiTimelineItem };
/**
 * `<loomi-timeline>` — wraps `<loomi-timeline-item>` items and shares attributes with them.
 * @slot - `<loomi-timeline-item>` children.
 */
let LoomiTimeline = class LoomiTimeline extends LoomiElement {
    constructor() {
        super(...arguments);
        this.stacked = false;
        this.completed = false;
        this.anchor = "small";
        this.icon = "";
        this.placement = "left";
        this.color = "primary";
        this.sync = () => {
            const items = Array.from(this.querySelectorAll("loomi-timeline-item"));
            items.forEach((item) => {
                if (this.stacked)
                    item.stacked = true;
                if (this.completed)
                    item.completed = true;
                if (this.anchor === "big")
                    item.anchor = "big";
                if (this.icon && !item.icon)
                    item.icon = this.icon;
                if (this.placement !== "left")
                    item.placement = this.placement;
                if (this.color && item.color === "primary")
                    item.color = this.color;
            });
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    firstUpdated() {
        this.sync();
    }
    render() {
        return html `<div class="loomi-timeline placement-${this.placement}"><slot @slotchange=${this.sync}></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean })
], LoomiTimeline.prototype, "stacked", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTimeline.prototype, "completed", void 0);
__decorate([
    property()
], LoomiTimeline.prototype, "anchor", void 0);
__decorate([
    property()
], LoomiTimeline.prototype, "icon", void 0);
__decorate([
    property()
], LoomiTimeline.prototype, "placement", void 0);
__decorate([
    property()
], LoomiTimeline.prototype, "color", void 0);
LoomiTimeline = __decorate([
    customElement("loomi-timeline")
], LoomiTimeline);
export { LoomiTimeline };
//# sourceMappingURL=loomi-timeline.js.map