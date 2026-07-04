var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars, cssColor } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
/** Size CSS vars aligned with `<loomi-button>` control tokens. */
const SIZE_VARS = {
    tiny: "--loomi-bg-height:2rem;--loomi-bg-pad-x:0.625rem;--loomi-bg-font:0.75rem;--loomi-bg-radius:0.4rem",
    small: "--loomi-bg-height:2.25rem;--loomi-bg-pad-x:0.75rem;--loomi-bg-font:0.875rem;--loomi-bg-radius:0.45rem",
    regular: "--loomi-bg-height:2.5rem;--loomi-bg-pad-x:1rem;--loomi-bg-font:0.875rem;--loomi-bg-radius:0.5rem",
    medium: "--loomi-bg-height:2.75rem;--loomi-bg-pad-x:1.25rem;--loomi-bg-font:1rem;--loomi-bg-radius:0.55rem",
    big: "--loomi-bg-height:3rem;--loomi-bg-pad-x:1.5rem;--loomi-bg-font:1.125rem;--loomi-bg-radius:0.6rem",
};
/**
 * `<loomi-button-group-item>` — a single button within a `<loomi-button-group>`.
 *
 * Set `label` for button text, `icon` for a built-in icon name, `icon-right` to place
 * the icon after the label, `selected` to mark this item as active, and `disabled` to
 * disable just this item. The `value` attribute is surfaced in the `button-group-change`
 * event emitted by the parent.
 *
 * @slot - Button label text (used when the `label` attribute is absent).
 * @fires loomi-bg-click - Bubbles + composed; `detail: { value }`. Handled by the parent.
 */
let LoomiButtonGroupItem = class LoomiButtonGroupItem extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Button label text. Falls back to slot text if empty. */
        this.label = "";
        /** Built-in icon name to render (same registry as `<loomi-button>`). */
        this.icon = "";
        /** Place the icon after the label instead of before it. */
        this.iconRight = false;
        /** Mark this item as the selected / active item. */
        this.selected = false;
        /** Disable this individual item. */
        this.disabled = false;
        /** Value surfaced in the `button-group-change` event. Falls back to `label`. */
        this.value = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    handleClick() {
        if (this.disabled)
            return;
        this.dispatchEvent(new CustomEvent("loomi-bg-click", {
            bubbles: true,
            composed: true,
            detail: { value: this.value },
        }));
    }
    renderIcon() {
        if (!this.icon)
            return nothing;
        const path = getLoomiIcon(this.icon);
        if (!path)
            return nothing;
        return html `<svg
      class="loomi-bg-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >${path}</svg>`;
    }
    render() {
        const icon = this.renderIcon();
        const leading = !this.iconRight ? icon : nothing;
        const trailing = this.iconRight ? icon : nothing;
        const cls = ["loomi-bg-btn", this.selected ? "selected" : ""].filter(Boolean).join(" ");
        return html `
      <button
        class=${cls}
        type="button"
        ?disabled=${this.disabled}
        aria-pressed=${this.selected ? "true" : "false"}
        @click=${this.handleClick}
      >
        ${leading}
        <span class="loomi-bg-label"><slot>${this.label}</slot></span>
        ${trailing}
      </button>
    `;
    }
};
__decorate([
    property()
], LoomiButtonGroupItem.prototype, "label", void 0);
__decorate([
    property()
], LoomiButtonGroupItem.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiButtonGroupItem.prototype, "iconRight", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiButtonGroupItem.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiButtonGroupItem.prototype, "disabled", void 0);
__decorate([
    property()
], LoomiButtonGroupItem.prototype, "value", void 0);
LoomiButtonGroupItem = __decorate([
    customElement("loomi-button-group-item")
], LoomiButtonGroupItem);
export { LoomiButtonGroupItem };
/**
 * `<loomi-button-group>` — a horizontal row of secondary-style toggle buttons.
 *
 * Place `<loomi-button-group-item>` elements as children. Unselected items use the same
 * neutral bordered ghost treatment as `<loomi-button type="secondary">`; the selected
 * item uses a calm neutral gray fill (never the group `color`, which only tints the
 * focus ring). Only the first and last items carry rounded corners; adjacent borders
 * collapse.
 *
 * @slot - `<loomi-button-group-item>` children.
 * @fires button-group-change - `detail: { value, label, index }` when selection changes.
 *
 * @example
 * ```html
 * <loomi-button-group color="primary">
 *   <loomi-button-group-item label="Day"   value="day"   icon="calendar" selected></loomi-button-group-item>
 *   <loomi-button-group-item label="Week"  value="week"  icon="calendar-days"></loomi-button-group-item>
 *   <loomi-button-group-item label="Month" value="month"></loomi-button-group-item>
 * </loomi-button-group>
 * ```
 */
let LoomiButtonGroup = class LoomiButtonGroup extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Accent used for the focus ring on the selected item. Accepts any loomi color name. */
        this.color = "primary";
        /** Size preset — controls padding and font-size of all items. */
        this.size = "regular";
        /** Disable all items in the group at once. */
        this.disabled = false;
        this.onItemClick = (e) => {
            const clicked = e
                .composedPath()
                .find((el) => el instanceof LoomiButtonGroupItem);
            if (!clicked || this.disabled || clicked.disabled)
                return;
            const items = this.items;
            for (const it of items)
                it.selected = it === clicked;
            const index = items.indexOf(clicked);
            this.dispatchEvent(new CustomEvent("button-group-change", {
                bubbles: true,
                composed: true,
                detail: {
                    value: clicked.value || clicked.label || clicked.textContent?.trim(),
                    label: clicked.label || clicked.textContent?.trim(),
                    index,
                },
            }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get items() {
        return Array.from(this.querySelectorAll("loomi-button-group-item"));
    }
    get groupStyleVars() {
        const sizeVars = SIZE_VARS[this.size] ?? SIZE_VARS.regular;
        // Selected items always use a calm neutral gray — never the group's accent color —
        // so the active item reads as "chosen" without competing for attention like a
        // primary-colored call-to-action would. `color` only tints the focus ring below.
        const selVars = [
            `--loomi-bg-sel-bg:var(--loomi-surface)`,
            `--loomi-bg-sel-color:var(--loomi-text)`,
            `--loomi-bg-sel-border:${cssColor(this.color, 500)}`,
            `--loomi-bg-sel-hover:var(--loomi-surface-hover)`,
            `--loomi-bg-accent-soft:${cssColor(this.color, 100)}`,
        ].join(";");
        return `${accentVars(this.color)};${sizeVars};${selVars}`;
    }
    applyGroupStyleVars() {
        for (const decl of this.groupStyleVars.split(";")) {
            if (!decl)
                continue;
            const idx = decl.indexOf(":");
            if (idx === -1)
                continue;
            this.style.setProperty(decl.slice(0, idx).trim(), decl.slice(idx + 1).trim());
        }
    }
    willUpdate(changed) {
        if (changed.has("color") || changed.has("size")) {
            this.applyGroupStyleVars();
        }
    }
    connectedCallback() {
        super.connectedCallback();
        this.applyGroupStyleVars();
    }
    render() {
        return html `
      <div
        class="loomi-bg-group${this.disabled ? " disabled" : ""}"
        role="group"
        @loomi-bg-click=${this.onItemClick}
      >
        <slot></slot>
      </div>
    `;
    }
};
__decorate([
    property()
], LoomiButtonGroup.prototype, "color", void 0);
__decorate([
    property({ reflect: true })
], LoomiButtonGroup.prototype, "size", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiButtonGroup.prototype, "disabled", void 0);
LoomiButtonGroup = __decorate([
    customElement("loomi-button-group")
], LoomiButtonGroup);
export { LoomiButtonGroup };
//# sourceMappingURL=loomi-button-group.js.map