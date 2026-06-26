var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, onClickOutside } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-popover>` — a floating rich-content panel opened on click or hover.
 *
 * @slot - Panel content (rich markup allowed).
 * @slot trigger - Custom trigger markup (overrides the `trigger` icon).
 */
let LoomiPopover = class LoomiPopover extends LoomiElement {
    constructor() {
        super(...arguments);
        this.trigger = "information-circle";
        this.triggerOn = "click";
        this.position = "bottom";
        this.title = "";
        this.width = 280;
        this.open = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanup?.();
    }
    show() {
        if (this.open)
            return;
        this.open = true;
        if (this.triggerOn === "click")
            this.cleanup = onClickOutside(this, () => (this.open = false));
    }
    hide() {
        this.open = false;
        this.cleanup?.();
    }
    toggle() {
        this.open ? this.hide() : this.show();
    }
    render() {
        const path = getLoomiIcon(this.trigger.replace(/-icon$/, ""));
        return html `<button
      class="loomi-trigger"
      aria-haspopup="dialog"
      aria-expanded=${this.open ? "true" : "false"}
      @click=${this.triggerOn === "click" ? () => this.toggle() : nothing}
      @mouseenter=${this.triggerOn === "mouseover" ? () => this.show() : nothing}
      @mouseleave=${this.triggerOn === "mouseover" ? () => this.hide() : nothing}
    >
      <slot name="trigger">
        ${path ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>` : "?"}
      </slot>
    </button>
    ${this.open
            ? html `<div class="loomi-panel pos-${this.position}" role="dialog" style="--loomi-pop-width:${this.width}px">
          ${this.title ? html `<div class="loomi-title">${this.title}</div>` : nothing}
          <div class="loomi-content"><slot></slot></div>
        </div>`
            : nothing}`;
    }
};
__decorate([
    property()
], LoomiPopover.prototype, "trigger", void 0);
__decorate([
    property({ attribute: "trigger-on" })
], LoomiPopover.prototype, "triggerOn", void 0);
__decorate([
    property()
], LoomiPopover.prototype, "position", void 0);
__decorate([
    property()
], LoomiPopover.prototype, "title", void 0);
__decorate([
    property({ type: Number })
], LoomiPopover.prototype, "width", void 0);
__decorate([
    state()
], LoomiPopover.prototype, "open", void 0);
LoomiPopover = __decorate([
    customElement("loomi-popover")
], LoomiPopover);
export { LoomiPopover };
//# sourceMappingURL=loomi-popover.js.map