var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from "lit";
import { property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-listitem>` — a single stackable list row.
 * @slot - Row content.
 */
export class LoomiListitem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.compact = false;
        this.asFlex = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="loomi-li" role="listitem"><slot></slot></div>`;
    }
}
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiListitem.prototype, "compact", void 0);
__decorate([
    property({ type: Boolean, attribute: "as-flex", reflect: true })
], LoomiListitem.prototype, "asFlex", void 0);
customElements.define("loomi-listitem", LoomiListitem);
customElements.define("loomi-listview-item", LoomiListitem);
//# sourceMappingURL=loomi-listview.js.map