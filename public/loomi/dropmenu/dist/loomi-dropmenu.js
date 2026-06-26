var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, onClickOutside } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import { componentStyles } from "./generated/styles.css.js";
const ELLIPSIS = svg `<path d="M6 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM21 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="currentColor" />`;
/**
 * `<loomi-dropmenu-item>` — a single menu line. Put links/handlers inside, or set `icon`.
 * @slot - Item content.
 */
let LoomiDropmenuItem = class LoomiDropmenuItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.icon = "";
        this.iconRight = false;
        this.header = false;
        this.divider = false;
        this.hover = true;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        if (this.divider)
            return html `<div class="loomi-divider"></div>`;
        const path = this.icon ? getLoomiIcon(this.icon) : undefined;
        const cls = `loomi-item ${this.iconRight ? "right" : ""} ${this.header ? "header" : this.hover ? "hoverable" : ""}`;
        return html `<div class=${cls}>
      ${path ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>` : nothing}
      <span style="flex:1 1 auto"><slot></slot></span>
    </div>`;
    }
};
__decorate([
    property()
], LoomiDropmenuItem.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiDropmenuItem.prototype, "iconRight", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenuItem.prototype, "header", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenuItem.prototype, "divider", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenuItem.prototype, "hover", void 0);
LoomiDropmenuItem = __decorate([
    customElement("loomi-dropmenu-item")
], LoomiDropmenuItem);
export { LoomiDropmenuItem };
/**
 * `<loomi-dropmenu>` — a dropdown action menu. Trigger via the default ellipsis icon, an
 * icon name (`trigger`), or custom markup in the `trigger` slot.
 *
 * @slot - `<loomi-dropmenu-item>` children.
 * @slot trigger - Custom trigger markup.
 */
let LoomiDropmenu = class LoomiDropmenu extends LoomiElement {
    constructor() {
        super(...arguments);
        this.trigger = "";
        this.triggerOn = "click";
        this.divided = false;
        this.position = "auto";
        this.scrollable = false;
        this.height = 200;
        this.hideAfterClick = true;
        this.iconRight = false;
        this.open = false;
        this.resolvedPosition = "left";
        this.placementFrame = 0;
        this.onItemsClick = (e) => {
            const item = e.target.closest("loomi-dropmenu-item");
            if (item && !item.header && !item.divider && this.hideAfterClick)
                this.closeMenu();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanupOutside?.();
        this.cleanupPlacement?.();
        cancelAnimationFrame(this.placementFrame);
    }
    toggle() {
        if (this.open)
            this.closeMenu();
        else
            this.openMenu();
    }
    openMenu() {
        if (this.open)
            return;
        this.open = true;
        this.cleanupOutside = onClickOutside(this, () => this.closeMenu());
        this.cleanupPlacement = this.observePlacement();
        this.schedulePlacement();
    }
    closeMenu() {
        this.open = false;
        this.cleanupOutside?.();
        this.cleanupOutside = undefined;
        this.cleanupPlacement?.();
        this.cleanupPlacement = undefined;
        cancelAnimationFrame(this.placementFrame);
    }
    observePlacement() {
        const reposition = () => this.schedulePlacement();
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        return () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
        };
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
        if (this.position !== "auto") {
            this.resolvedPosition = this.position;
            return;
        }
        const menu = this.renderRoot.querySelector(".loomi-menu");
        if (!menu)
            return;
        const triggerRect = this.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const menuWidth = menuRect.width || 192;
        const margin = 8;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const leftAligned = {
            start: triggerRect.left,
            end: triggerRect.left + menuWidth,
        };
        const rightAligned = {
            start: triggerRect.right - menuWidth,
            end: triggerRect.right,
        };
        const visibleWidth = (candidate) => Math.max(0, Math.min(candidate.end, viewportWidth - margin) - Math.max(candidate.start, margin));
        const leftVisible = visibleWidth(leftAligned);
        const rightVisible = visibleWidth(rightAligned);
        const leftFits = leftAligned.start >= margin && leftAligned.end <= viewportWidth - margin;
        const rightFits = rightAligned.start >= margin && rightAligned.end <= viewportWidth - margin;
        if (leftFits && !rightFits) {
            this.resolvedPosition = "left";
        }
        else if (rightFits && !leftFits) {
            this.resolvedPosition = "right";
        }
        else if (leftVisible !== rightVisible) {
            this.resolvedPosition = leftVisible > rightVisible ? "left" : "right";
        }
        else {
            this.resolvedPosition = "left";
        }
    }
    render() {
        const triggerPath = this.trigger ? getLoomiIcon(this.trigger.replace(/-icon$/, "")) : undefined;
        return html `<button
      class="loomi-trigger"
      aria-haspopup="menu"
      aria-expanded=${this.open ? "true" : "false"}
      @click=${this.triggerOn === "click" ? () => this.toggle() : nothing}
      @mouseenter=${this.triggerOn === "mouseover" ? () => this.openMenu() : nothing}
    >
      <slot name="trigger">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
          ${triggerPath ?? ELLIPSIS}
        </svg>
      </slot>
    </button>
    ${this.open
            ? html `<div
          class="loomi-menu ${this.resolvedPosition} ${this.scrollable ? "scrollable" : ""}"
          style=${this.scrollable ? `--loomi-menu-height:${this.height}px` : nothing}
          role="menu"
          @click=${this.onItemsClick}
        >
          <slot></slot>
        </div>`
            : nothing}`;
    }
};
__decorate([
    property()
], LoomiDropmenu.prototype, "trigger", void 0);
__decorate([
    property({ attribute: "trigger-on" })
], LoomiDropmenu.prototype, "triggerOn", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiDropmenu.prototype, "divided", void 0);
__decorate([
    property()
], LoomiDropmenu.prototype, "position", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenu.prototype, "scrollable", void 0);
__decorate([
    property({ type: Number })
], LoomiDropmenu.prototype, "height", void 0);
__decorate([
    property({ type: Boolean, attribute: "hide-after-click" })
], LoomiDropmenu.prototype, "hideAfterClick", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiDropmenu.prototype, "iconRight", void 0);
__decorate([
    state()
], LoomiDropmenu.prototype, "open", void 0);
__decorate([
    state()
], LoomiDropmenu.prototype, "resolvedPosition", void 0);
LoomiDropmenu = __decorate([
    customElement("loomi-dropmenu")
], LoomiDropmenu);
export { LoomiDropmenu };
//# sourceMappingURL=loomi-dropmenu.js.map