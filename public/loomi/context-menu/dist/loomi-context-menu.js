var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, onClickOutside } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const CHEVRON_RIGHT = svg `<path d="m9 18 6-6-6-6" />`;
/**
 * `<loomi-context-menu-item>` — a single right-click menu line. Put links/handlers
 * inside, or set `icon`.
 *
 * @slot - Item content.
 * @slot submenu - Nested `<loomi-context-menu-item>` children.
 */
let LoomiContextMenuItem = class LoomiContextMenuItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.icon = "";
        this.shortcut = "";
        this.iconRight = false;
        this.header = false;
        this.divider = false;
        this.hover = true;
        this.hasSubmenuItems = false;
        this.menuIconRight = false;
        this.submenuOpen = false;
        this.onSubmenuSlotChange = (event) => {
            const slot = event.target;
            this.hasSubmenuItems = slot.assignedElements({ flatten: true }).length > 0;
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get hasSubmenu() {
        return this.hasSubmenuItems;
    }
    get selectable() {
        return !this.header && !this.divider;
    }
    setMenuIconRight(value) {
        this.menuIconRight = value;
    }
    focusItem() {
        this.renderRoot.querySelector(".loomi-item")?.focus();
    }
    onItemClick() {
        if (this.hasSubmenuItems)
            this.submenuOpen = !this.submenuOpen;
    }
    render() {
        if (this.divider)
            return html `<div class="loomi-divider"></div>`;
        const iconRight = this.iconRight || this.menuIconRight;
        const path = this.icon ? getLoomiIcon(this.icon) : undefined;
        const cls = `loomi-item ${iconRight ? "right" : ""} ${this.hasSubmenuItems ? "has-submenu" : ""} ${this.header ? "header" : this.hover ? "hoverable" : ""}`;
        return html `<div
        class=${cls}
        role=${this.header ? "presentation" : "menuitem"}
        tabindex=${this.header ? nothing : "-1"}
        aria-haspopup=${this.hasSubmenuItems ? "menu" : nothing}
        aria-expanded=${this.hasSubmenuItems ? (this.submenuOpen ? "true" : "false") : nothing}
        @click=${this.onItemClick}
      >
      ${path ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>` : nothing}
      <span class="loomi-label"><slot></slot></span>
      ${this.shortcut ? html `<kbd class="loomi-shortcut">${this.shortcut}</kbd>` : nothing}
      ${this.hasSubmenuItems
            ? html `<svg class="loomi-submenu-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            ${CHEVRON_RIGHT}
          </svg>`
            : nothing}
    </div>
    <div class="loomi-submenu ${this.hasSubmenuItems ? "ready" : ""} ${this.submenuOpen ? "open" : ""}" role="menu">
      <slot name="submenu" @slotchange=${this.onSubmenuSlotChange}></slot>
    </div>`;
    }
};
__decorate([
    property()
], LoomiContextMenuItem.prototype, "icon", void 0);
__decorate([
    property()
], LoomiContextMenuItem.prototype, "shortcut", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiContextMenuItem.prototype, "iconRight", void 0);
__decorate([
    property({ type: Boolean })
], LoomiContextMenuItem.prototype, "header", void 0);
__decorate([
    property({ type: Boolean })
], LoomiContextMenuItem.prototype, "divider", void 0);
__decorate([
    property({ type: Boolean })
], LoomiContextMenuItem.prototype, "hover", void 0);
__decorate([
    state()
], LoomiContextMenuItem.prototype, "hasSubmenuItems", void 0);
__decorate([
    state()
], LoomiContextMenuItem.prototype, "menuIconRight", void 0);
__decorate([
    state()
], LoomiContextMenuItem.prototype, "submenuOpen", void 0);
LoomiContextMenuItem = __decorate([
    customElement("loomi-context-menu-item")
], LoomiContextMenuItem);
export { LoomiContextMenuItem };
/**
 * `<loomi-context-menu>` — a right-click action menu for target content.
 *
 * @slot target - The region that opens the menu on contextmenu, ContextMenu, or Shift+F10.
 * @slot - `<loomi-context-menu-item>` children.
 */
let LoomiContextMenu = class LoomiContextMenu extends LoomiElement {
    constructor() {
        super(...arguments);
        this.disabled = false;
        this.divided = false;
        this.position = "auto";
        this.scrollable = false;
        this.height = 200;
        this.hideAfterClick = true;
        this.iconRight = false;
        this.open = false;
        this.resolvedPosition = "left";
        this.focusedIndex = -1;
        this.menuX = 0;
        this.menuY = 0;
        this.anchorX = 0;
        this.anchorY = 0;
        this.placementFrame = 0;
        this.onTargetContextMenu = (event) => {
            if (this.disabled)
                return;
            event.preventDefault();
            this.showAt(event.clientX, event.clientY);
        };
        this.onTargetKeyDown = (event) => {
            if (this.disabled)
                return;
            if (event.key !== "ContextMenu" && !(event.shiftKey && event.key === "F10"))
                return;
            event.preventDefault();
            const target = this.renderRoot.querySelector(".loomi-target");
            const rect = target?.getBoundingClientRect();
            this.showAt(rect ? rect.left + Math.min(rect.width / 2, 24) : 0, rect ? rect.top + Math.min(rect.height, 32) : 0);
            void this.updateComplete.then(() => this.focusItemAt(0));
        };
        this.onItemsClick = (event) => {
            const item = event.composedPath().find((target) => target instanceof LoomiContextMenuItem);
            if (item && item.selectable && !item.hasSubmenu && this.hideAfterClick)
                this.hide();
        };
        this.onMenuKeyDown = (event) => {
            if (!this.open)
                return;
            const items = this.getTopLevelItems();
            if (!items.length)
                return;
            if (event.key === "Escape") {
                event.preventDefault();
                this.hide();
                this.renderRoot.querySelector(".loomi-target")?.focus();
                return;
            }
            if (event.key === "ArrowDown") {
                event.preventDefault();
                this.focusItemAt(this.focusedIndex + 1);
            }
            else if (event.key === "ArrowUp") {
                event.preventDefault();
                this.focusItemAt(this.focusedIndex - 1);
            }
            else if (event.key === "Home") {
                event.preventDefault();
                this.focusItemAt(0);
            }
            else if (event.key === "End") {
                event.preventDefault();
                this.focusItemAt(items.length - 1);
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
        this.cleanupListeners?.();
        cancelAnimationFrame(this.placementFrame);
    }
    showAt(clientX, clientY) {
        if (this.disabled)
            return;
        this.anchorX = clientX;
        this.anchorY = clientY;
        this.open = true;
        this.focusedIndex = -1;
        this.cleanupOutside?.();
        this.cleanupListeners?.();
        this.cleanupOutside = onClickOutside(this, () => this.hide());
        this.cleanupListeners = this.observePlacement();
        this.schedulePlacement();
    }
    hide() {
        this.open = false;
        this.focusedIndex = -1;
        this.cleanupOutside?.();
        this.cleanupOutside = undefined;
        this.cleanupListeners?.();
        this.cleanupListeners = undefined;
        cancelAnimationFrame(this.placementFrame);
    }
    observePlacement() {
        const reposition = () => this.schedulePlacement();
        const onOutsideContextMenu = (event) => {
            if (!event.composedPath().includes(this))
                this.hide();
        };
        window.addEventListener("resize", reposition);
        window.addEventListener("scroll", reposition, true);
        document.addEventListener("contextmenu", onOutsideContextMenu, true);
        return () => {
            window.removeEventListener("resize", reposition);
            window.removeEventListener("scroll", reposition, true);
            document.removeEventListener("contextmenu", onOutsideContextMenu, true);
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
        const menu = this.renderRoot.querySelector(".loomi-menu");
        if (!menu)
            return;
        const menuRect = menu.getBoundingClientRect();
        const menuWidth = menuRect.width || 216;
        const menuHeight = menuRect.height || 160;
        const margin = 8;
        const viewportWidth = document.documentElement.clientWidth || window.innerWidth;
        const viewportHeight = document.documentElement.clientHeight || window.innerHeight;
        const leftFits = this.anchorX + menuWidth <= viewportWidth - margin;
        const rightFits = this.anchorX - menuWidth >= margin;
        if (this.position !== "auto") {
            this.resolvedPosition = this.position;
        }
        else if (leftFits && !rightFits) {
            this.resolvedPosition = "left";
        }
        else if (rightFits && !leftFits) {
            this.resolvedPosition = "right";
        }
        else if (rightFits && this.anchorX > viewportWidth / 2) {
            this.resolvedPosition = "right";
        }
        else {
            this.resolvedPosition = "left";
        }
        const desiredX = this.resolvedPosition === "right" ? this.anchorX - menuWidth : this.anchorX;
        const maxX = Math.max(margin, viewportWidth - margin - menuWidth);
        const maxY = Math.max(margin, viewportHeight - margin - menuHeight);
        this.menuX = Math.min(Math.max(margin, desiredX), maxX);
        this.menuY = Math.min(Math.max(margin, this.anchorY), maxY);
    }
    getTopLevelItems() {
        return Array.from(this.children).filter((child) => child instanceof LoomiContextMenuItem && child.selectable);
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
        for (const item of this.querySelectorAll("loomi-context-menu-item")) {
            item.setMenuIconRight(this.iconRight);
        }
    }
    onSlotChange() {
        this.applyItemDefaults();
    }
    updated(changedProperties) {
        if (changedProperties.has("iconRight"))
            this.applyItemDefaults();
        if (changedProperties.has("disabled") && this.disabled)
            this.hide();
    }
    render() {
        return html `<span
      class="loomi-target"
      tabindex=${this.disabled ? nothing : "0"}
      aria-haspopup="menu"
      aria-expanded=${this.open ? "true" : "false"}
      @contextmenu=${this.onTargetContextMenu}
      @keydown=${this.onTargetKeyDown}
    >
      <slot name="target"></slot>
    </span>
    ${this.open
            ? html `<div
          class="loomi-menu ${this.resolvedPosition} ${this.scrollable ? "scrollable" : ""}"
          style=${`--loomi-context-menu-x:${this.menuX}px;--loomi-context-menu-y:${this.menuY}px;${this.scrollable ? `--loomi-menu-height:${this.height}px` : ""}`}
          role="menu"
          @click=${this.onItemsClick}
          @keydown=${this.onMenuKeyDown}
        >
          <slot @slotchange=${this.onSlotChange}></slot>
        </div>`
            : nothing}`;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiContextMenu.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiContextMenu.prototype, "divided", void 0);
__decorate([
    property()
], LoomiContextMenu.prototype, "position", void 0);
__decorate([
    property({ type: Boolean })
], LoomiContextMenu.prototype, "scrollable", void 0);
__decorate([
    property({ type: Number })
], LoomiContextMenu.prototype, "height", void 0);
__decorate([
    property({ type: Boolean, attribute: "hide-after-click" })
], LoomiContextMenu.prototype, "hideAfterClick", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiContextMenu.prototype, "iconRight", void 0);
__decorate([
    state()
], LoomiContextMenu.prototype, "open", void 0);
__decorate([
    state()
], LoomiContextMenu.prototype, "resolvedPosition", void 0);
__decorate([
    state()
], LoomiContextMenu.prototype, "focusedIndex", void 0);
__decorate([
    state()
], LoomiContextMenu.prototype, "menuX", void 0);
__decorate([
    state()
], LoomiContextMenu.prototype, "menuY", void 0);
LoomiContextMenu = __decorate([
    customElement("loomi-context-menu")
], LoomiContextMenu);
export { LoomiContextMenu };
//# sourceMappingURL=loomi-context-menu.js.map