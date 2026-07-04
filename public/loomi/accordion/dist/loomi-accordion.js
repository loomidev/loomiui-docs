var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const CHEVRON = svg `<path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />`;
/**
 * `<loomi-accordion-item>` — a single collapsible section. Use inside `<loomi-accordion>`.
 *
 * @slot - The collapsible body.
 * @slot title - Custom title content (overrides the `title` attribute).
 * @fires loomi-accordion-toggle - Fired when toggled (the parent uses it to coordinate).
 */
let LoomiAccordionItem = class LoomiAccordionItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.open = false;
        this.title = "";
        this.color = "";
        this.noPadding = false;
        /** Set by the parent: true => standalone card styling. */
        this.standalone = false;
        this.toggle = () => {
            this.open = !this.open;
            this.dispatchEvent(new CustomEvent("loomi-accordion-toggle", { bubbles: true, composed: true }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="loomi-shell" style=${this.color ? accentVars(this.color) : nothing}>
      <button class="loomi-head" aria-expanded=${this.open ? "true" : "false"} @click=${this.toggle}>
        <span class="loomi-title"><slot name="title">${this.title}</slot></span>
        <svg class="loomi-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${CHEVRON}</svg>
      </button>
      <div class="loomi-content">
        <div><div class="loomi-inner"><slot></slot></div></div>
      </div>
    </div>`;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAccordionItem.prototype, "open", void 0);
__decorate([
    property()
], LoomiAccordionItem.prototype, "title", void 0);
__decorate([
    property()
], LoomiAccordionItem.prototype, "color", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: "no-padding" })
], LoomiAccordionItem.prototype, "noPadding", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAccordionItem.prototype, "standalone", void 0);
LoomiAccordionItem = __decorate([
    customElement("loomi-accordion-item")
], LoomiAccordionItem);
export { LoomiAccordionItem };
/**
 * `<loomi-accordion>` — groups `<loomi-accordion-item>` children. By default only one
 * item stays open at a time.
 *
 * @slot - `<loomi-accordion-item>` children.
 */
let LoomiAccordion = class LoomiAccordion extends LoomiElement {
    constructor() {
        super(...arguments);
        this.grouped = true;
        this.canOpenMultiple = false;
        this.color = "";
        this.sync = () => {
            for (const item of this.items) {
                item.standalone = !this.grouped;
                if (!item.hasAttribute("color"))
                    item.color = this.color;
            }
        };
        this.onToggle = (e) => {
            const item = e.target;
            if (item.open && !this.canOpenMultiple) {
                for (const other of this.items)
                    if (other !== item)
                        other.open = false;
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get items() {
        return Array.from(this.querySelectorAll("loomi-accordion-item"));
    }
    firstUpdated() {
        this.sync();
    }
    updated() {
        this.sync();
    }
    render() {
        return html `<div
      class="loomi-accordion ${this.grouped ? "grouped" : "ungrouped"}"
      @loomi-accordion-toggle=${this.onToggle}
    >
      <slot @slotchange=${this.sync}></slot>
    </div>`;
    }
};
__decorate([
    property({ type: Boolean })
], LoomiAccordion.prototype, "grouped", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-open-multiple" })
], LoomiAccordion.prototype, "canOpenMultiple", void 0);
__decorate([
    property()
], LoomiAccordion.prototype, "color", void 0);
LoomiAccordion = __decorate([
    customElement("loomi-accordion")
], LoomiAccordion);
export { LoomiAccordion };
//# sourceMappingURL=loomi-accordion.js.map