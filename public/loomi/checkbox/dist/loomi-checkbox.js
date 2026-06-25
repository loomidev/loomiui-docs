var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, accentVars, isLoomiColor } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-checkbox>` — a themeable checkbox in the full loomi palette.
 * Form-associated: submits `value` (default `"on"`) under `name` when checked.
 *
 * @slot - Label content (supports HTML such as links). Falls back to the `label` attribute.
 * @csspart box - The checkbox box.
 * @fires change - Fired when the checked state changes (composed).
 */
let LoomiCheckbox = class LoomiCheckbox extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.value = "on";
        this.label = "";
        this.checked = false;
        this.disabled = false;
        this.color = "primary";
        this.onChange = (e) => {
            this.checked = e.target.checked;
            this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.checked ? this.value : null);
    }
    get accentColor() {
        return isLoomiColor(this.color) ? this.color : "primary";
    }
    render() {
        const style = accentVars(this.accentColor);
        return html `
      <label class="loomi-cb" style=${style}>
        <input
          class="loomi-native"
          type="checkbox"
          name=${this.name || nothing}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${this.onChange}
        />
        <span class="loomi-box" part="box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
        ${this.label || this.hasChildNodes()
            ? html `<span class="loomi-label"><slot>${this.label}</slot></span>`
            : nothing}
      </label>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiCheckbox.prototype, "name", void 0);
__decorate([
    property()
], LoomiCheckbox.prototype, "value", void 0);
__decorate([
    property()
], LoomiCheckbox.prototype, "label", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCheckbox.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCheckbox.prototype, "disabled", void 0);
__decorate([
    property()
], LoomiCheckbox.prototype, "color", void 0);
LoomiCheckbox = __decorate([
    customElement("loomi-checkbox")
], LoomiCheckbox);
export { LoomiCheckbox };
//# sourceMappingURL=loomi-checkbox.js.map