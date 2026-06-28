var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LoomiElement, themeStyles, isLoomiColor } from "@loomidev/core";
import { getLoomiIcon } from "./icons.js";
import { buttonStyles } from "./generated/styles.css.js";
/** Padding + font-size per size. Literal strings so Tailwind's scanner picks them up. */
const SIZE = {
    tiny: "px-2.5 py-1 text-xs",
    small: "px-3 py-1.5 text-sm",
    regular: "px-4 py-2 text-sm",
    medium: "px-5 py-2.5 text-base",
    big: "px-6 py-3 text-lg",
};
const RADIUS = {
    none: "rounded-none",
    small: "rounded",
    medium: "rounded-lg",
    full: "rounded-full",
};
const BORDER_WIDTH = {
    2: "border-2",
    4: "border-4",
    8: "border-8",
};
/**
 * `<loomi-button>` — a themeable button web component.
 *
 * Structural variant (`type`) and palette (`color`) are independent, and styling is
 * composed from orthogonal attributes (`size`, `radius`, `outline`, `border-width`).
 * Colors resolve through `--loomi-*` custom properties, so the whole theme can be
 * re-skinned from the host page with no rebuild.
 *
 * @slot - Default slot: the button label.
 * @slot prefix - Content rendered before the icon/label.
 * @slot suffix - Content rendered after the label.
 * @csspart button - The underlying `<button>`/`<a>` element.
 * @fires click - Native click event (composed; crosses the shadow boundary).
 */
let LoomiButton = class LoomiButton extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Structural variant: `primary` (bold fill) or `secondary` (soft). */
        this.type = "primary";
        /** Palette override. Empty = derive from `type`. One of the loomi color names. */
        this.color = "";
        /** Size preset. */
        this.size = "regular";
        /** Corner radius preset. */
        this.radius = "medium";
        /** Render as an outline (no fill, colored border + text). */
        this.outline = false;
        /** Outline border width: 2, 4 or 8. Only applies when `outline` is set. */
        this.borderWidth = 2;
        /** Name of a built-in icon (see the icon registry), or one you registered. */
        this.icon = "";
        /** Position the icon after the label instead of before it. */
        this.iconRight = false;
        /** Include a spinner (hidden until `show-spinner`). */
        this.hasSpinner = false;
        /** Show the spinner. Only has effect when `has-spinner` is set. */
        this.showSpinner = false;
        /** Disable the button. */
        this.disabled = false;
        /** Render as `button` or as an `a` (link). */
        this.tag = "button";
        /** href used when `tag="a"`. */
        this.href = "";
        /** Render the `<button>` as `type="submit"` so it submits a form. */
        this.canSubmit = false;
        /** Show the focus ring on keyboard focus. */
        this.showFocusRing = true;
        /** Uppercase the label. */
        this.uppercase = false;
        /** Optional name for targeting this button (reflected as an attribute). */
        this.name = "";
        this.onClick = (event) => {
            if (this.disabled) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
    }
    static { this.styles = [themeStyles, buttonStyles]; }
    /** Make the spinner visible. No-op unless `has-spinner` is set. */
    startSpinner() {
        if (this.hasSpinner)
            this.showSpinner = true;
    }
    /** Hide the spinner. */
    stopSpinner() {
        this.showSpinner = false;
    }
    get effectiveColor() {
        if (this.color && isLoomiColor(this.color))
            return this.color;
        return this.type === "secondary"
            ? "secondary"
            : "primary";
    }
    get spinning() {
        return this.hasSpinner && this.showSpinner;
    }
    treatmentClasses(c) {
        const w = BORDER_WIDTH[this.borderWidth] ?? BORDER_WIDTH[2];
        if (this.outline) {
            return this.type === "secondary"
                ? ["bg-transparent", `text-${c}-700`, w, "border-solid", `border-${c}-300`, `hover:bg-${c}-50`]
                : ["bg-transparent", `text-${c}-600`, w, "border-solid", `border-${c}-600`, `hover:bg-${c}-50`];
        }
        return this.type === "secondary"
            ? [`bg-${c}-100`, `text-${c}-700`, `hover:bg-${c}-200`, "border", "border-transparent"]
            : [`bg-${c}-600`, "text-white", `hover:bg-${c}-700`, "border", "border-transparent"];
    }
    computeClasses() {
        const c = this.effectiveColor;
        const classes = [
            "loomi-btn",
            "inline-flex",
            "items-center",
            "justify-center",
            "gap-2",
            "font-medium",
            "leading-none",
            "whitespace-nowrap",
            "select-none",
            "transition-colors",
            "duration-150",
            "cursor-pointer",
            SIZE[this.size] ?? SIZE.regular,
            RADIUS[this.radius] ?? RADIUS.medium,
            ...this.treatmentClasses(c),
        ];
        if (this.uppercase)
            classes.push("uppercase", "tracking-wide");
        if (this.showFocusRing) {
            classes.push("focus:outline-none", "focus-visible:outline-none", "focus-visible:ring-2", "focus-visible:ring-offset-2", `focus-visible:ring-${c}-400`);
        }
        else {
            classes.push("focus:outline-none", "focus-visible:outline-none");
        }
        return classes.join(" ");
    }
    renderIcon() {
        if (!this.icon)
            return nothing;
        const path = getLoomiIcon(this.icon);
        if (!path)
            return nothing;
        return html `<svg
      class="loomi-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.5"
      aria-hidden="true"
    >
      ${path}
    </svg>`;
    }
    renderSpinner() {
        return html `<svg
      class="loomi-spinner"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"></circle>
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      ></path>
    </svg>`;
    }
    renderContent() {
        // Spinner takes the leading slot; per BladewindUI, icon-right is ignored while spinning.
        const leading = this.spinning
            ? this.renderSpinner()
            : !this.iconRight
                ? this.renderIcon()
                : nothing;
        const trailing = !this.spinning && this.iconRight ? this.renderIcon() : nothing;
        return html `
      <slot name="prefix"></slot>
      ${leading}
      <span class="loomi-label"><slot></slot></span>
      ${trailing}
      <slot name="suffix"></slot>
    `;
    }
    render() {
        const cls = this.computeClasses();
        const content = this.renderContent();
        if (this.tag === "a") {
            return html `<a
        class=${cls}
        part="button"
        href=${ifDefined(this.disabled ? undefined : this.href || undefined)}
        role="button"
        aria-disabled=${this.disabled ? "true" : "false"}
        tabindex=${this.disabled ? "-1" : "0"}
        @click=${this.onClick}
        >${content}</a
      >`;
        }
        return html `<button
      class=${cls}
      part="button"
      type=${this.canSubmit ? "submit" : "button"}
      ?disabled=${this.disabled}
      @click=${this.onClick}
    >
      ${content}
    </button>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiButton.prototype, "type", void 0);
__decorate([
    property()
], LoomiButton.prototype, "color", void 0);
__decorate([
    property({ reflect: true })
], LoomiButton.prototype, "size", void 0);
__decorate([
    property({ reflect: true })
], LoomiButton.prototype, "radius", void 0);
__decorate([
    property({ type: Boolean })
], LoomiButton.prototype, "outline", void 0);
__decorate([
    property({ type: Number, attribute: "border-width" })
], LoomiButton.prototype, "borderWidth", void 0);
__decorate([
    property()
], LoomiButton.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiButton.prototype, "iconRight", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-spinner" })
], LoomiButton.prototype, "hasSpinner", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-spinner" })
], LoomiButton.prototype, "showSpinner", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiButton.prototype, "disabled", void 0);
__decorate([
    property({ reflect: true })
], LoomiButton.prototype, "tag", void 0);
__decorate([
    property()
], LoomiButton.prototype, "href", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-submit" })
], LoomiButton.prototype, "canSubmit", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-focus-ring" })
], LoomiButton.prototype, "showFocusRing", void 0);
__decorate([
    property({ type: Boolean })
], LoomiButton.prototype, "uppercase", void 0);
__decorate([
    property({ reflect: true })
], LoomiButton.prototype, "name", void 0);
LoomiButton = __decorate([
    customElement("loomi-button")
], LoomiButton);
export { LoomiButton };
//# sourceMappingURL=loomi-button.js.map