var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, nextMenuFocusIndex, onClickOutside } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const ELLIPSIS = svg `<path d="M6 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM13.5 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0ZM21 12a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" fill="currentColor" />`;
const CHEVRON_RIGHT = svg `<path d="m9 18 6-6-6-6" />`;
const CHECK = svg `<path d="M20 6 9 17l-5-5" />`;
/**
 * `<loomi-dropmenu-item>` — a single menu line. Put links/handlers inside, or set `icon`.
 * Set `checkbox` or `radio` to turn it into a toggle row (see `checked`, `group`).
 * @slot - Item content.
 * @slot submenu - Nested `<loomi-dropmenu-item>` children.
 * @fires change - Fired when a `checkbox` or `radio` item's `checked` state changes (composed).
 */
let LoomiDropmenuItem = class LoomiDropmenuItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.icon = "";
        this.shortcut = "";
        this.iconRight = false;
        this.header = false;
        this.divider = false;
        this.hover = true;
        this.disabled = false;
        this.variant = "default";
        this.checkbox = false;
        this.radio = false;
        this.group = "";
        this.value = "";
        this.checked = false;
        this.hasSubmenuItems = false;
        this.menuIconRight = false;
        this.submenuOpen = false;
        this.onSubmenuSlotChange = (event) => {
            const slot = event.target;
            this.hasSubmenuItems = slot.assignedElements({ flatten: true }).length > 0;
        };
        this.onItemClick = (event) => {
            if (this.disabled) {
                event.stopPropagation();
                event.preventDefault();
                return;
            }
            if (this.hasSubmenuItems) {
                this.submenuOpen = !this.submenuOpen;
                return;
            }
            if (this.checkbox) {
                this.checked = !this.checked;
                this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
                return;
            }
            if (this.radio) {
                if (this.checked)
                    return;
                this.uncheckRadioSiblings();
                this.checked = true;
                this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get hasSubmenu() {
        return this.hasSubmenuItems;
    }
    /** `true` for `checkbox`/`radio` items — clicking one shouldn't auto-close the menu. */
    get isToggle() {
        return this.checkbox || this.radio;
    }
    get selectable() {
        return !this.header && !this.divider && !this.disabled;
    }
    setMenuIconRight(value) {
        this.menuIconRight = value;
    }
    focusItem() {
        this.renderRoot.querySelector(".loomi-item")?.focus();
    }
    uncheckRadioSiblings() {
        const root = this.getRootNode() ?? document;
        for (const sibling of root.querySelectorAll("loomi-dropmenu-item[radio]")) {
            if (sibling !== this && sibling.group === this.group)
                sibling.checked = false;
        }
    }
    get itemClass() {
        const iconRight = this.iconRight || this.menuIconRight;
        return [
            "loomi-item",
            iconRight && "right",
            this.hasSubmenuItems && "has-submenu",
            this.variant === "destructive" && "destructive",
            this.disabled && "disabled",
            this.header ? "header" : this.hover && "hoverable",
        ]
            .filter(Boolean)
            .join(" ");
    }
    get itemRole() {
        if (this.header)
            return "presentation";
        if (this.checkbox)
            return "menuitemcheckbox";
        if (this.radio)
            return "menuitemradio";
        return "menuitem";
    }
    render() {
        if (this.divider)
            return html `<div class="loomi-divider"></div>`;
        const path = this.icon ? getLoomiIcon(this.icon) : undefined;
        return html `
      <div
        class=${this.itemClass}
        role=${this.itemRole}
        tabindex=${this.header || this.disabled ? nothing : "-1"}
        aria-haspopup=${this.hasSubmenuItems ? "menu" : nothing}
        aria-expanded=${this.hasSubmenuItems ? (this.submenuOpen ? "true" : "false") : nothing}
        aria-checked=${this.isToggle ? (this.checked ? "true" : "false") : nothing}
        aria-disabled=${this.disabled ? "true" : nothing}
        @click=${this.onItemClick}
      >
        ${this.isToggle
            ? html `<span class="loomi-indicator" aria-hidden="true">
              ${this.checked
                ? this.radio
                    ? html `<span class="loomi-radio-dot"></span>`
                    : html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                      ${CHECK}
                    </svg>`
                : nothing}
            </span>`
            : nothing}
        ${path
            ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
              ${path}
            </svg>`
            : nothing}
        <span class="loomi-label"><slot></slot></span>
        ${this.shortcut ? html `<kbd class="loomi-shortcut">${this.shortcut}</kbd>` : nothing}
        ${this.hasSubmenuItems
            ? html `<svg
              class="loomi-submenu-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              aria-hidden="true"
            >
              ${CHEVRON_RIGHT}
            </svg>`
            : nothing}
      </div>
      <div
        class="loomi-submenu ${this.hasSubmenuItems ? "ready" : ""} ${this.submenuOpen ? "open" : ""}"
        role="menu"
      >
        <slot name="submenu" @slotchange=${this.onSubmenuSlotChange}></slot>
      </div>
    `;
    }
};
__decorate([
    property()
], LoomiDropmenuItem.prototype, "icon", void 0);
__decorate([
    property()
], LoomiDropmenuItem.prototype, "shortcut", void 0);
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
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiDropmenuItem.prototype, "disabled", void 0);
__decorate([
    property()
], LoomiDropmenuItem.prototype, "variant", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenuItem.prototype, "checkbox", void 0);
__decorate([
    property({ type: Boolean })
], LoomiDropmenuItem.prototype, "radio", void 0);
__decorate([
    property()
], LoomiDropmenuItem.prototype, "group", void 0);
__decorate([
    property()
], LoomiDropmenuItem.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiDropmenuItem.prototype, "checked", void 0);
__decorate([
    state()
], LoomiDropmenuItem.prototype, "hasSubmenuItems", void 0);
__decorate([
    state()
], LoomiDropmenuItem.prototype, "menuIconRight", void 0);
__decorate([
    state()
], LoomiDropmenuItem.prototype, "submenuOpen", void 0);
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
        this.placement = "auto";
        this.scrollable = false;
        this.height = 200;
        this.hideAfterClick = true;
        this.iconRight = false;
        this.open = false;
        this.resolvedPlacement = "left";
        this.focusedIndex = -1;
        this.placementFrame = 0;
        this.onItemsClick = (e) => {
            const item = e.composedPath().find((target) => target instanceof LoomiDropmenuItem);
            if (item && item.selectable && !item.hasSubmenu && !item.isToggle && this.hideAfterClick)
                this.closeMenu();
        };
        this.onTriggerKeyDown = (event) => {
            if (event.key !== "ArrowDown" && event.key !== "ArrowUp")
                return;
            event.preventDefault();
            if (!this.open)
                this.openMenu();
            void this.updateComplete.then(() => this.focusItemAt(event.key === "ArrowUp" ? -1 : 0));
        };
        this.onMenuKeyDown = (event) => {
            if (!this.open)
                return;
            const items = this.getTopLevelItems();
            if (!items.length)
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                this.closeMenu();
                this.renderRoot.querySelector(".loomi-trigger")?.focus();
                return;
            }
            const target = nextMenuFocusIndex(event, this.focusedIndex, items.length);
            if (target !== undefined) {
                event.preventDefault();
                this.focusItemAt(target);
            }
            else if ((event.key === "Enter" || event.key === " ") && this.focusedIndex >= 0) {
                event.preventDefault();
                items[this.focusedIndex].click();
            }
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
        this.focusedIndex = -1;
        this.cleanupOutside = onClickOutside(this, () => this.closeMenu());
        this.cleanupPlacement = this.observePlacement();
        this.schedulePlacement();
    }
    closeMenu() {
        this.open = false;
        this.focusedIndex = -1;
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
        if (this.placement !== "auto") {
            this.resolvedPlacement = this.placement;
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
            this.resolvedPlacement = "left";
        }
        else if (rightFits && !leftFits) {
            this.resolvedPlacement = "right";
        }
        else if (leftVisible !== rightVisible) {
            this.resolvedPlacement = leftVisible > rightVisible ? "left" : "right";
        }
        else {
            this.resolvedPlacement = "left";
        }
    }
    getTopLevelItems() {
        return Array.from(this.children).filter((child) => child instanceof LoomiDropmenuItem && child.selectable);
    }
    focusItemAt(index) {
        const items = this.getTopLevelItems();
        if (!items.length)
            return;
        const nextIndex = (index + items.length) % items.length;
        this.focusedIndex = nextIndex;
        items[nextIndex].focusItem();
    }
    applyItemDefaults() {
        for (const item of this.querySelectorAll("loomi-dropmenu-item")) {
            item.setMenuIconRight(this.iconRight);
        }
    }
    onSlotChange() {
        this.applyItemDefaults();
    }
    updated(changedProperties) {
        if (changedProperties.has("iconRight"))
            this.applyItemDefaults();
    }
    get menuClass() {
        return ["loomi-menu", this.resolvedPlacement, this.scrollable && "scrollable"].filter(Boolean).join(" ");
    }
    render() {
        const triggerPath = this.trigger ? getLoomiIcon(this.trigger.replace(/-icon$/, "")) : undefined;
        return html `
      <button
        class="loomi-trigger"
        aria-haspopup="menu"
        aria-expanded=${this.open ? "true" : "false"}
        @click=${this.triggerOn === "click" ? () => this.toggle() : nothing}
        @mouseenter=${this.triggerOn === "mouseover" ? () => this.openMenu() : nothing}
        @keydown=${this.onTriggerKeyDown}
      >
        <slot name="trigger">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
            ${triggerPath ?? ELLIPSIS}
          </svg>
        </slot>
      </button>
      ${this.open
            ? html `<div
            class=${this.menuClass}
            style=${this.scrollable ? `--loomi-menu-height:${this.height}px` : nothing}
            role="menu"
            @click=${this.onItemsClick}
            @keydown=${this.onMenuKeyDown}
          >
            <slot @slotchange=${this.onSlotChange}></slot>
          </div>`
            : nothing}
    `;
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
], LoomiDropmenu.prototype, "placement", void 0);
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
], LoomiDropmenu.prototype, "resolvedPlacement", void 0);
__decorate([
    state()
], LoomiDropmenu.prototype, "focusedIndex", void 0);
LoomiDropmenu = __decorate([
    customElement("loomi-dropmenu")
], LoomiDropmenu);
export { LoomiDropmenu };
//# sourceMappingURL=loomi-dropmenu.js.map