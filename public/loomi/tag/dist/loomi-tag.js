var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
/**
 * `<loomi-tag>` — a themeable label/badge. Faint or dark shade, optional outline,
 * rounded, tiny, and a close button.
 *
 * @slot - Tag content (falls back to the `label` attribute).
 * @fires close - Fired when the close button is clicked (the tag removes itself unless prevented).
 * @fires loomi-tag-click - Internal event bubbled to `<loomi-tags>` for selection handling.
 */
let LoomiTag = class LoomiTag extends LoomiElement {
    constructor() {
        super(...arguments);
        this.label = "";
        this.locale = "";
        /** Any loomi color plus `info` (maps to blue). */
        this.color = "primary";
        this.shade = "faint";
        this.canClose = false;
        this.outline = false;
        this.rounded = false;
        this.tiny = false;
        this.uppercasing = false;
        /** Value submitted when inside `<loomi-tags>`. */
        this.value = "";
        /** Set by the parent `<loomi-tags>` when selected. */
        this.selected = false;
        /** Set by the parent `<loomi-tags>` to show pointer cursor and hover. */
        this.selectable = false;
        /** Heroicons icon name to display. */
        this.icon = "";
        /** `prefix` (default) or `suffix`. */
        this.iconPosition = "prefix";
        this.onClose = (e) => {
            e.stopPropagation();
            const ev = new CustomEvent("close", { bubbles: true, composed: true, cancelable: true });
            const proceed = this.dispatchEvent(ev);
            if (proceed)
                this.remove();
        };
        this.onTagClick = () => {
            if (!this.value)
                return;
            this.dispatchEvent(new CustomEvent("loomi-tag-click", {
                bubbles: true,
                composed: true,
                detail: { value: this.value },
            }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get resolvedColor() {
        return this.color === "info" ? "primary" : this.color;
    }
    render() {
        const cls = [
            "loomi-tag",
            this.outline ? "outline" : "",
            this.shade,
            this.rounded ? "rounded" : "",
            this.tiny ? "tiny" : "",
            this.uppercasing ? "uppercasing" : "",
            this.selected ? "selected" : "",
        ]
            .filter(Boolean)
            .join(" ");
        const iconEl = this.icon
            ? html `<loomi-icon class="loomi-tag-icon" name=${this.icon}></loomi-icon>`
            : nothing;
        return html `<span class=${cls} style=${accentVars(this.resolvedColor)} @click=${this.value ? this.onTagClick : nothing}>
      ${this.icon && this.iconPosition === "prefix" ? iconEl : nothing}
      <slot>${this.label}</slot>
      ${this.icon && this.iconPosition === "suffix" ? iconEl : nothing}
      ${this.canClose
            ? html `<button type="button" class="loomi-close" aria-label=${loomiT("common.remove", {}, this.locale)} @click=${this.onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">${X}</svg>
          </button>`
            : nothing}
    </span>`;
    }
};
__decorate([
    property()
], LoomiTag.prototype, "label", void 0);
__decorate([
    property()
], LoomiTag.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTag.prototype, "color", void 0);
__decorate([
    property()
], LoomiTag.prototype, "shade", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-close" })
], LoomiTag.prototype, "canClose", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "outline", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "rounded", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "tiny", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTag.prototype, "uppercasing", void 0);
__decorate([
    property()
], LoomiTag.prototype, "value", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTag.prototype, "selected", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTag.prototype, "selectable", void 0);
__decorate([
    property()
], LoomiTag.prototype, "icon", void 0);
__decorate([
    property({ attribute: "icon-position" })
], LoomiTag.prototype, "iconPosition", void 0);
LoomiTag = __decorate([
    customElement("loomi-tag")
], LoomiTag);
export { LoomiTag };
/**
 * `<loomi-tags>` — a flex container for `<loomi-tag>` elements, optionally functioning
 * as a selectable checkbox-style group. Set `name` to enable selection; each child tag
 * with a `value` becomes togglable. Selected values are submitted comma-joined under `name`.
 *
 * @slot - `<loomi-tag>` children.
 * @fires change - `detail: { values: string[] }` when selection changes.
 */
let LoomiTags = class LoomiTags extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.max = 0;
        this.selectedValue = "";
        this.required = false;
        /** Color propagated to child tags that have no explicit `color`. */
        this.color = "";
        this._selected = [];
        this._initialized = false;
        this.onTagClick = (e) => {
            if (!this.name)
                return;
            const value = e.detail.value;
            const has = this._selected.includes(value);
            if (has) {
                this._selected = this._selected.filter((v) => v !== value);
            }
            else if (this.max > 0 && this._selected.length >= this.max) {
                return;
            }
            else {
                this._selected = [...this._selected, value];
            }
            this.internals.setFormValue(this._selected.join(","));
            this.sync();
            this.dispatchEvent(new CustomEvent("change", {
                bubbles: true,
                composed: true,
                detail: { values: [...this._selected] },
            }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    get tags() {
        return Array.from(this.querySelectorAll("loomi-tag"));
    }
    willUpdate() {
        if (!this._initialized) {
            this._selected = this.selectedValue
                ? this.selectedValue
                    .split(",")
                    .map((v) => v.trim())
                    .filter(Boolean)
                : [];
            this._initialized = true;
        }
        if (this.name) {
            this.internals.setFormValue(this._selected.join(","));
        }
    }
    sync() {
        for (const tag of this.tags) {
            if (this.color && !tag.getAttribute("color")) {
                tag.color = this.color;
            }
            tag.selected = this.name ? this._selected.includes(tag.value) : false;
            tag.selectable = !!this.name && !!tag.value;
        }
    }
    firstUpdated() {
        this.sync();
    }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute("data-group", "");
    }
    render() {
        return html `<slot
      @slotchange=${() => this.sync()}
      @loomi-tag-click=${this.onTagClick}
    ></slot>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTags.prototype, "name", void 0);
__decorate([
    property({ type: Number })
], LoomiTags.prototype, "max", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiTags.prototype, "selectedValue", void 0);
__decorate([
    property({ type: Boolean })
], LoomiTags.prototype, "required", void 0);
__decorate([
    property()
], LoomiTags.prototype, "color", void 0);
LoomiTags = __decorate([
    customElement("loomi-tags")
], LoomiTags);
export { LoomiTags };
//# sourceMappingURL=loomi-tag.js.map