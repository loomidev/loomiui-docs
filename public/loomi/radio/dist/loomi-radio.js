var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars, isLoomiColor } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-radio>` — a themeable radio button. Give radios in a group the same
 * `name` and they become mutually exclusive (coordinated across the same root,
 * since native radio grouping doesn't cross shadow boundaries). Form-associated.
 *
 * @slot - Label content. Falls back to the `label` attribute.
 * @csspart dot - The radio dot.
 * @fires change - Fired when this radio becomes checked (composed).
 */
let LoomiRadio = class LoomiRadio extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.name = "";
        this.value = "";
        this.label = "";
        this.checked = false;
        this.disabled = false;
        this.color = "primary";
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    willUpdate() {
        this.internals.setFormValue(this.checked ? this.value : null);
    }
    get accentColor() {
        return isLoomiColor(this.color) ? this.color : "primary";
    }
    uncheckSiblings() {
        if (!this.name)
            return;
        const root = this.getRootNode() ?? document;
        const radios = root.querySelectorAll("loomi-radio");
        radios.forEach((r) => {
            if (r !== this && r.name === this.name)
                r.checked = false;
        });
    }
    select() {
        if (this.disabled || this.checked)
            return;
        this.uncheckSiblings();
        this.checked = true;
        this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    }
    render() {
        const style = accentVars(this.accentColor);
        return html `
      <label class="loomi-radio" style=${style}>
        <input
          class="loomi-native"
          type="radio"
          name=${this.name || nothing}
          .checked=${this.checked}
          ?disabled=${this.disabled}
          @change=${() => this.select()}
        />
        <span class="loomi-dot" part="dot"></span>
        ${this.label || this.hasChildNodes()
            ? html `<span class="loomi-label"><slot>${this.label}</slot></span>`
            : nothing}
      </label>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiRadio.prototype, "name", void 0);
__decorate([
    property()
], LoomiRadio.prototype, "value", void 0);
__decorate([
    property()
], LoomiRadio.prototype, "label", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiRadio.prototype, "checked", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiRadio.prototype, "disabled", void 0);
__decorate([
    property()
], LoomiRadio.prototype, "color", void 0);
LoomiRadio = __decorate([
    customElement("loomi-radio")
], LoomiRadio);
export { LoomiRadio };
//# sourceMappingURL=loomi-radio.js.map