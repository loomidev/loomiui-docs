var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const TYPE_ALIASES = {
    simple: "simple",
    spinner: "spinner",
    dot: "dot",
    "line-simple": "simple",
    "line-spinner": "spinner",
    "dot-circle": "dot",
};
const SIZE_ALIASES = {
    sm: "small",
    md: "medium",
    lg: "big",
    small: "small",
    medium: "medium",
    big: "big",
    xl: "xl",
    omg: "omg",
};
/**
 * `<loomi-spinner>` — a themeable loading spinner.
 */
let LoomiSpinner = class LoomiSpinner extends LoomiElement {
    constructor() {
        super(...arguments);
        this.size = "small";
        this.type = "simple";
        this.color = "gray";
        this.label = "";
        this.locale = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    get normalizedSize() {
        return SIZE_ALIASES[this.size] ?? "small";
    }
    get normalizedType() {
        return TYPE_ALIASES[this.type] ?? "simple";
    }
    render() {
        const label = this.label || loomiT("common.loading", {}, this.locale);
        return html `<span
      class="loomi-spinner-wrap size-${this.normalizedSize}"
      style=${accentVars(this.color)}
      role="status"
      aria-label=${label}
    >
      ${this.renderIndicator()}
      ${this.label ? html `<span class="loomi-spinner-label">${this.label}</span>` : null}
    </span>`;
    }
    renderIndicator() {
        switch (this.normalizedType) {
            case "spinner":
                return html `<svg class="loomi-spinner loomi-spinner-lines" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          ${Array.from({ length: 8 }, (_, index) => {
                    const rotation = index * 45;
                    const opacity = 0.22 + index * 0.09;
                    // Nested fragments inserted into an existing <svg> must use the `svg` tag
                    // function — `html` parses them outside any SVG context, so the browser
                    // creates them in the HTML namespace and silently drops them.
                    return svg `<line
              x1="12"
              y1="3"
              x2="12"
              y2="6"
              stroke="currentColor"
              stroke-width="2.4"
              stroke-linecap="round"
              opacity=${opacity}
              transform="rotate(${rotation} 12 12)"
            ></line>`;
                })}
        </svg>`;
            case "dot":
                return html `<svg class="loomi-spinner loomi-spinner-dots" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          ${Array.from({ length: 8 }, (_, index) => {
                    const rotation = index * 45;
                    const opacity = 0.2 + index * 0.1;
                    return svg `<circle
              cx="12"
              cy="4"
              r="1.7"
              fill="currentColor"
              opacity=${opacity}
              transform="rotate(${rotation} 12 12)"
            ></circle>`;
                })}
        </svg>`;
            case "simple":
            default:
                return html `<svg class="loomi-spinner loomi-spinner-simple" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"></circle>
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
        </svg>`;
        }
    }
};
__decorate([
    property()
], LoomiSpinner.prototype, "size", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "type", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "color", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "label", void 0);
__decorate([
    property()
], LoomiSpinner.prototype, "locale", void 0);
LoomiSpinner = __decorate([
    customElement("loomi-spinner")
], LoomiSpinner);
export { LoomiSpinner };
//# sourceMappingURL=loomi-spinner.js.map