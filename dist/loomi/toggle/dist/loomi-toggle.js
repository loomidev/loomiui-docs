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
 * `<loomi-toggle>` — a themeable toggle/switch (a checkbox, spiced up).
 * Form-associated: submits `value` (default `"on"`) under `name` when checked.
 *
 * @slot - Label content. Falls back to the `label` attribute.
 * @csspart track - The switch track.
 * @csspart knob - The sliding knob.
 * @fires change - Fired when the checked state changes (composed).
 */
let LoomiToggle = class LoomiToggle extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.value = "on";
        this.label = "";
        this.labelPosition = "left";
        this.checked = false;
        this.disabled = false;
        this.justified = false;
        this.bar = "thick";
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
        const hasLabel = !!this.label || this.hasChildNodes();
        const labelEl = hasLabel
            ? html `<span class="loomi-label"><slot>${this.label}</slot></span>`
            : nothing;
        const control = html `
      <input
        class="loomi-native"
        type="checkbox"
        role="switch"
        name=${this.name || nothing}
        .checked=${this.checked}
        ?disabled=${this.disabled}
        @change=${this.onChange}
      />
      <span class="loomi-track bar-${this.bar}" part="track">
        <span class="loomi-knob" part="knob"></span>
      </span>
    `;
        return html `
      <label class="loomi-toggle" style=${style}>
        ${this.labelPosition === "left" ? labelEl : nothing} ${control}
        ${this.labelPosition === "right" ? labelEl : nothing}
      </label>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiToggle.prototype, "name", void 0);
__decorate([
    property()
], LoomiToggle.prototype, "value", void 0);
__decorate([
    property()
], LoomiToggle.prototype, "label", void 0);
__decorate([
    property({ attribute: "label-position" })
], LoomiToggle.prototype, "labelPosition", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiToggle.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiToggle.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiToggle.prototype, "justified", void 0);
__decorate([
    property()
], LoomiToggle.prototype, "bar", void 0);
__decorate([
    property()
], LoomiToggle.prototype, "color", void 0);
LoomiToggle = __decorate([
    customElement("loomi-toggle")
], LoomiToggle);
export { LoomiToggle };
//# sourceMappingURL=loomi-toggle.js.map