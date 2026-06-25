var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, accentVars } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
const CHECK = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />`;
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />`;
/**
 * `<loomi-processing>` — a process indicator with `processing` (spinner), `success` and
 * `failed` states. Switch the `state` attribute (and optionally `title`/`message`) as your
 * async task progresses.
 */
let LoomiProcessing = class LoomiProcessing extends LitElement {
    constructor() {
        super(...arguments);
        this.state = "processing";
        this.title = "";
        this.message = "";
        this.color = "primary";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        let icon;
        if (this.state === "success") {
            icon = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${CHECK}</svg>`;
        }
        else if (this.state === "failed") {
            icon = html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${X}</svg>`;
        }
        else {
            icon = html `<svg class="loomi-spin" viewBox="0 0 24 24" fill="none" aria-label="Processing">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="3"></circle>
        <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
      </svg>`;
        }
        return html `<div class="loomi-proc state-${this.state}" style=${accentVars(this.color)}>
      <div class="loomi-icon">${icon}</div>
      ${this.title ? html `<div class="loomi-title">${this.title}</div>` : nothing}
      ${this.message ? html `<div class="loomi-message">${this.message}</div>` : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiProcessing.prototype, "state", void 0);
__decorate([
    property()
], LoomiProcessing.prototype, "title", void 0);
__decorate([
    property()
], LoomiProcessing.prototype, "message", void 0);
__decorate([
    property()
], LoomiProcessing.prototype, "color", void 0);
LoomiProcessing = __decorate([
    customElement("loomi-processing")
], LoomiProcessing);
export { LoomiProcessing };
//# sourceMappingURL=loomi-processing.js.map