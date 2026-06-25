var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { loomiStyles, onClickOutside } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-colorpicker>` — pick a color. Uses the native color input by default; pass a
 * comma-separated `colors` list to show a swatch palette instead. Form-associated.
 *
 * @fires change - `detail: { value }` when a color is chosen.
 */
let LoomiColorpicker = class LoomiColorpicker extends LitElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.selectedValue = "#000000";
        this.showValue = false;
        this.colors = "";
        this.size = "regular";
        this.open = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.selectedValue);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.cleanup?.();
    }
    get palette() {
        return this.colors ? this.colors.split(",").map((c) => c.trim()).filter(Boolean) : [];
    }
    setValue(v) {
        this.selectedValue = v;
        this.internals.setFormValue(v);
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { value: v } }));
    }
    toggle() {
        this.open = !this.open;
        if (this.open)
            this.cleanup = onClickOutside(this, () => (this.open = false));
        else
            this.cleanup?.();
    }
    render() {
        const palette = this.palette;
        const swatch = palette.length
            ? html `<button class="loomi-swatch size-${this.size}" style="background:${this.selectedValue}" aria-label="Pick color" @click=${() => this.toggle()}></button>
          ${this.open
                ? html `<div class="loomi-panel" role="listbox">
                ${palette.map((c) => html `<button class="loomi-chip ${c.toLowerCase() === this.selectedValue.toLowerCase() ? "selected" : ""}" style="background:${c}" aria-label=${c} @click=${() => { this.setValue(c); this.open = false; }}></button>`)}
              </div>`
                : nothing}`
            : html `<input class="loomi-native size-${this.size}" type="color" name=${this.name || nothing} .value=${this.selectedValue} @input=${(e) => this.setValue(e.target.value)} />`;
        return html `<div class="loomi-cp">
      ${swatch}
      ${this.showValue ? html `<span class="loomi-value">${this.selectedValue}</span>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiColorpicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "selected-value" })
], LoomiColorpicker.prototype, "selectedValue", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-value" })
], LoomiColorpicker.prototype, "showValue", void 0);
__decorate([
    property()
], LoomiColorpicker.prototype, "colors", void 0);
__decorate([
    property()
], LoomiColorpicker.prototype, "size", void 0);
__decorate([
    state()
], LoomiColorpicker.prototype, "open", void 0);
LoomiColorpicker = __decorate([
    customElement("loomi-colorpicker")
], LoomiColorpicker);
export { LoomiColorpicker };
//# sourceMappingURL=loomi-colorpicker.js.map