var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars, onClickOutside } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import "@loomidev/tooltip/loomi-tooltip.js";
import { componentStyles } from "./generated/styles.css.js";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/** Which arrow key moves focus further from the trigger vs. back toward it, per stack axis. */
const AXIS_KEYS = {
    up: { next: "ArrowUp", prev: "ArrowDown" },
    down: { next: "ArrowDown", prev: "ArrowUp" },
    left: { next: "ArrowLeft", prev: "ArrowRight" },
    right: { next: "ArrowRight", prev: "ArrowLeft" },
};
/** Walks into nested shadow roots to find the actually-focused element. */
function deepActiveElement() {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement)
        el = el.shadowRoot.activeElement;
    return el;
}
/** Maps an item pill's own icon/label flex-direction onto the tooltip placement that
 * puts the label where the pill's label would otherwise have gone (`icons-only`). */
const FLOW_TO_TOOLTIP_PLACEMENT = {
    row: "right",
    "row-reverse": "left",
    column: "bottom",
    "column-reverse": "top",
};
/**
 * `<loomi-fab-item>` — one action inside a `<loomi-fab>`'s speed-dial menu.
 *
 * @fires loomi-select - Clicked (not disabled). `detail: { value, label }`, bubbles/composed.
 */
let LoomiFabItem = class LoomiFabItem extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Name of a built-in icon (same registry as `<loomi-icon>`). */
        this.icon = "";
        /** Icon set override for just this item. Empty = inherit from the parent's `icon-source`. */
        this.iconSource = "";
        /** Visible text next to the icon. */
        this.label = "";
        /** Value reported on `event.detail.value` when this item is selected. */
        this.value = "";
        /** Disable this item — excluded from click, keyboard nav, and styled as inactive. */
        this.disabled = false;
        /** Fallback icon source inherited from the parent `<loomi-fab>`. Set internally — not a public API. */
        this.hostIconSource = "heroicons";
        /** Pushed down from the parent `<loomi-fab>`'s `icons-only`. Set internally — not a public API. */
        this.hostIconsOnly = false;
        /** Pushed down from the parent `<loomi-fab>`. Where the `icons-only` tooltip appears. Set internally — not a public API. */
        this.hostTooltipPlacement = "top";
        this.onClick = (event) => {
            if (this.disabled) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            this.dispatchEvent(new CustomEvent("loomi-select", {
                detail: { value: this.value, label: this.label },
                bubbles: true,
                composed: true,
            }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get effectiveIconSource() {
        return (this.iconSource || this.hostIconSource || "heroicons");
    }
    /** Move focus to this item's button. Used by `<loomi-fab>`'s roving keyboard nav. */
    focusItem() {
        this.renderRoot.querySelector(".loomi-pill")?.focus();
    }
    renderPill() {
        const iconOnly = this.hostIconsOnly;
        return html `
      <button
        class="loomi-pill ${iconOnly ? "icon-only" : ""}"
        type="button"
        role="menuitem"
        ?disabled=${this.disabled}
        aria-label=${iconOnly ? this.label : nothing}
        @click=${this.onClick}
      >
        <span class="loomi-pill-icon" aria-hidden="true">
          ${this.icon
            ? html `<loomi-icon class="loomi-pill-icon-glyph" name=${this.icon} source=${this.effectiveIconSource}></loomi-icon>`
            : nothing}
        </span>
        ${!iconOnly && this.label ? html `<span class="loomi-pill-label">${this.label}</span>` : nothing}
      </button>
    `;
    }
    render() {
        if (this.hostIconsOnly && this.label) {
            return html `<loomi-tooltip
        class="loomi-item-tooltip"
        content=${this.label}
        placement=${this.hostTooltipPlacement}
        >${this.renderPill()}</loomi-tooltip
      >`;
        }
        return this.renderPill();
    }
};
__decorate([
    property()
], LoomiFabItem.prototype, "icon", void 0);
__decorate([
    property({ attribute: "icon-source" })
], LoomiFabItem.prototype, "iconSource", void 0);
__decorate([
    property()
], LoomiFabItem.prototype, "label", void 0);
__decorate([
    property()
], LoomiFabItem.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFabItem.prototype, "disabled", void 0);
__decorate([
    property({ attribute: false })
], LoomiFabItem.prototype, "hostIconSource", void 0);
__decorate([
    property({ attribute: false })
], LoomiFabItem.prototype, "hostIconsOnly", void 0);
__decorate([
    property({ attribute: false })
], LoomiFabItem.prototype, "hostTooltipPlacement", void 0);
LoomiFabItem = __decorate([
    customElement("loomi-fab-item")
], LoomiFabItem);
export { LoomiFabItem };
/**
 * `<loomi-fab>` — a floating action button. With no children it's a single action
 * button; add `<loomi-fab-item>` children and it becomes a speed-dial menu.
 *
 * @slot - `<loomi-fab-item>` children.
 * @fires open - The speed-dial menu opened. @fires close - It closed.
 */
let LoomiFab = class LoomiFab extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Which viewport corner to anchor to (`floating`), or which edge to align the menu to (`docked`). */
        this.placement = "bottom-right";
        /** Which way the speed-dial menu expands. Empty = infer from `placement` (bottom-* → up, top-* → down). */
        this.direction = "";
        /** How the speed-dial menu is triggered. `hover` still opens on click/focus too, for touch and keyboard. */
        this.trigger = "click";
        /** `floating` (default) anchors the button to a viewport corner. `docked` renders in normal flow. */
        this.variant = "floating";
        /** Size preset for the trigger button and speed-dial item circles. */
        this.size = "regular";
        /** Palette accent for the trigger and (softly) the item icons. */
        this.color = "primary";
        /** Name of a built-in icon (same registry as `<loomi-icon>`) shown on the trigger. */
        this.icon = "plus";
        /** Default icon set for the trigger and every item — overridable per-item via `icon-source`. */
        this.iconSource = "heroicons";
        /** Show only the icon on every item, with its `label` as a `<loomi-tooltip>` instead of visible text. */
        this.iconsOnly = false;
        /** Accessible label for the trigger button and the menu. Defaults to a localized "Actions". */
        this.label = "";
        /** Menu open state (reflected). Only meaningful when there are `<loomi-fab-item>` children. */
        this.open = false;
        /** Disable the trigger entirely. */
        this.disabled = false;
        /** Close the menu after an item is selected. */
        this.closeOnSelect = true;
        /** Dim the rest of the page while the menu is open; clicking it closes the menu. */
        this.backdrop = false;
        /** Locale override for built-in aria labels. */
        this.locale = "";
        this.hasItems = false;
        this.cleanupOutsideClick = null;
        this.hoverCloseTimer = 0;
        this.onSlotChange = (event) => {
            const slot = event.target;
            this.hasItems = slot.assignedElements({ flatten: true }).some((el) => el instanceof LoomiFabItem);
            this.syncItemDefaults();
        };
        this.onTriggerClick = () => {
            if (this.disabled || !this.hasItems)
                return;
            this.toggle();
        };
        this.onItemSelect = () => {
            if (this.closeOnSelect) {
                this.hide();
                this.focusTrigger();
            }
        };
        this.onHostMouseEnter = () => {
            if (this.trigger !== "hover" || this.disabled || !this.hasItems)
                return;
            clearTimeout(this.hoverCloseTimer);
            this.show();
        };
        this.onHostMouseLeave = () => {
            if (this.trigger !== "hover")
                return;
            clearTimeout(this.hoverCloseTimer);
            this.hoverCloseTimer = window.setTimeout(() => this.hide(), 200);
        };
        this.onHostFocusOut = (event) => {
            if (this.trigger !== "hover")
                return;
            const next = event.relatedTarget;
            if (next && this.contains(next))
                return;
            this.hide();
        };
        this.onKeyDown = (event) => {
            if (this.disabled || !this.hasItems)
                return;
            const axis = AXIS_KEYS[this.resolvedDirection];
            if (event.key === "Escape" && this.open) {
                event.preventDefault();
                event.stopPropagation();
                this.hide();
                this.focusTrigger();
                return;
            }
            if (!this.open) {
                if (event.key === axis.next) {
                    event.preventDefault();
                    this.show();
                    void this.updateComplete.then(() => this.focusItemAt(0));
                }
                return;
            }
            const items = this.getEnabledItems();
            if (!items.length)
                return;
            const current = deepActiveElement();
            const index = items.findIndex((item) => item === current || item.contains(current));
            if (event.key === axis.next) {
                event.preventDefault();
                this.focusItemAt(index < 0 ? 0 : index + 1);
            }
            else if (event.key === axis.prev) {
                event.preventDefault();
                if (index <= 0) {
                    this.hide();
                    this.focusTrigger();
                }
                else {
                    this.focusItemAt(index - 1);
                }
            }
            else if (event.key === "Home") {
                event.preventDefault();
                this.focusItemAt(0);
            }
            else if (event.key === "End") {
                event.preventDefault();
                this.focusItemAt(items.length - 1);
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.addEventListener("mouseenter", this.onHostMouseEnter);
        this.addEventListener("mouseleave", this.onHostMouseLeave);
        this.addEventListener("focusout", this.onHostFocusOut);
        this.addEventListener("keydown", this.onKeyDown);
        this.addEventListener("loomi-select", this.onItemSelect);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("mouseenter", this.onHostMouseEnter);
        this.removeEventListener("mouseleave", this.onHostMouseLeave);
        this.removeEventListener("focusout", this.onHostFocusOut);
        this.removeEventListener("keydown", this.onKeyDown);
        this.removeEventListener("loomi-select", this.onItemSelect);
        this.cleanupOutsideClick?.();
        this.cleanupOutsideClick = null;
        clearTimeout(this.hoverCloseTimer);
    }
    willUpdate(changedProperties) {
        super.willUpdate(changedProperties);
        if (changedProperties.has("iconSource") ||
            changedProperties.has("iconsOnly") ||
            changedProperties.has("placement") ||
            changedProperties.has("direction")) {
            this.syncItemDefaults();
        }
    }
    /** Open the speed-dial menu. No-op when disabled, empty, or already open. */
    show() {
        if (this.disabled || !this.hasItems || this.open)
            return;
        this.open = true;
        this.dispatchEvent(new Event("open", { bubbles: true, composed: true }));
        this.cleanupOutsideClick = onClickOutside(this, () => this.hide());
    }
    /** Close the speed-dial menu. */
    hide() {
        if (!this.open)
            return;
        this.open = false;
        this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
        this.cleanupOutsideClick?.();
        this.cleanupOutsideClick = null;
    }
    /** Toggle the speed-dial menu. */
    toggle() {
        if (this.open)
            this.hide();
        else
            this.show();
    }
    get resolvedDirection() {
        if (this.direction)
            return this.direction;
        return this.placement.startsWith("top") ? "down" : "up";
    }
    /** Flex-direction for each item's own icon/label row, so labels extend away from the nearest screen edge. */
    pillFlow(dir) {
        if (dir === "left" || dir === "right") {
            return this.placement.startsWith("top") ? "column" : "column-reverse";
        }
        return this.placement.endsWith("left") ? "row" : "row-reverse";
    }
    getItems() {
        return Array.from(this.children).filter((child) => child instanceof LoomiFabItem);
    }
    getEnabledItems() {
        return this.getItems().filter((item) => !item.disabled);
    }
    syncItemDefaults() {
        const tooltipPlacement = FLOW_TO_TOOLTIP_PLACEMENT[this.pillFlow(this.resolvedDirection)] ?? "top";
        for (const item of this.getItems()) {
            item.hostIconSource = this.iconSource;
            item.hostIconsOnly = this.iconsOnly;
            item.hostTooltipPlacement = tooltipPlacement;
        }
    }
    focusItemAt(index) {
        const items = this.getEnabledItems();
        if (!items.length)
            return;
        items[Math.max(0, Math.min(index, items.length - 1))].focusItem();
    }
    focusTrigger() {
        this.renderRoot.querySelector(".loomi-trigger")?.focus();
    }
    get dialClasses() {
        const dir = this.resolvedDirection;
        const cross = dir === "up" || dir === "down"
            ? this.placement.endsWith("left")
                ? "side-left"
                : "side-right"
            : this.placement.startsWith("top")
                ? "edge-top"
                : "edge-bottom";
        return ["loomi-dial", `dir-${dir}`, cross].join(" ");
    }
    render() {
        const accent = accentVars(this.color);
        const triggerLabel = this.label || loomiT("fab.trigger", {}, this.locale);
        return html `
      <div class="loomi-root" style=${accent}>
        ${this.backdrop ? html `<div class="loomi-backdrop" @click=${() => this.hide()}></div>` : nothing}
        <div
          class=${this.dialClasses}
          role="menu"
          aria-hidden=${this.open ? "false" : "true"}
          aria-label=${this.label || loomiT("fab.dialog", {}, this.locale)}
          style=${`--loomi-pill-flow:${this.pillFlow(this.resolvedDirection)}`}
        >
          <slot @slotchange=${this.onSlotChange}></slot>
        </div>
        <button
          class="loomi-trigger"
          type="button"
          ?disabled=${this.disabled}
          aria-haspopup=${this.hasItems ? "menu" : nothing}
          aria-expanded=${this.hasItems ? (this.open ? "true" : "false") : nothing}
          aria-label=${triggerLabel}
          @click=${this.onTriggerClick}
        >
          <loomi-icon class="loomi-trigger-icon" name=${this.icon} source=${this.iconSource}></loomi-icon>
        </button>
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiFab.prototype, "placement", void 0);
__decorate([
    property({ reflect: true })
], LoomiFab.prototype, "direction", void 0);
__decorate([
    property()
], LoomiFab.prototype, "trigger", void 0);
__decorate([
    property({ reflect: true })
], LoomiFab.prototype, "variant", void 0);
__decorate([
    property({ reflect: true })
], LoomiFab.prototype, "size", void 0);
__decorate([
    property()
], LoomiFab.prototype, "color", void 0);
__decorate([
    property()
], LoomiFab.prototype, "icon", void 0);
__decorate([
    property({ attribute: "icon-source" })
], LoomiFab.prototype, "iconSource", void 0);
__decorate([
    property({ type: Boolean, attribute: "icons-only", reflect: true })
], LoomiFab.prototype, "iconsOnly", void 0);
__decorate([
    property()
], LoomiFab.prototype, "label", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFab.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFab.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, attribute: "close-on-select", converter: booleanAttribute })
], LoomiFab.prototype, "closeOnSelect", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiFab.prototype, "backdrop", void 0);
__decorate([
    property()
], LoomiFab.prototype, "locale", void 0);
__decorate([
    state()
], LoomiFab.prototype, "hasItems", void 0);
LoomiFab = __decorate([
    customElement("loomi-fab")
], LoomiFab);
export { LoomiFab };
//# sourceMappingURL=loomi-fab.js.map