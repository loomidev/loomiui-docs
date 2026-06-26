var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-spinner>` — a themeable loading spinner.
 */
let LoomiSpinner = class LoomiSpinner extends LoomiElement {
    constructor() {
        super(...arguments);
        this.size = "small";
        this.color = "gray";
        this.locale = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<svg
      class="loomi-spinner size-${this.size}"
      style=${accentVars(this.color)}
      viewBox="0 0 24 24"
      fill="none"
      role="status"
      aria-label=${loomiT("common.loading", {}, this.locale)}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"></circle>
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
    </svg>`;
    }
};
__decorate([
    property()
], LoomiSpinner.prototype, "size", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "color", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "locale", void 0);
LoomiSpinner = __decorate([
    customElement("loomi-spinner")
], LoomiSpinner);
export { LoomiSpinner };
//# sourceMappingURL=loomi-spinner.js.map