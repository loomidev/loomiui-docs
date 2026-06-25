var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles } from "@loomi/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-listview-item>` — a single list row (a flex container). Use inside `<loomi-listview>`.
 * @slot - Row content.
 */
let LoomiListviewItem = class LoomiListviewItem extends LitElement {
    constructor() {
        super(...arguments);
        this.compact = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="loomi-li"><slot></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiListviewItem.prototype, "compact", void 0);
LoomiListviewItem = __decorate([
    customElement("loomi-listview-item")
], LoomiListviewItem);
export { LoomiListviewItem };
/**
 * `<loomi-listview>` — a divided list of `<loomi-listview-item>` rows.
 * @slot - `<loomi-listview-item>` children.
 */
let LoomiListview = class LoomiListview extends LitElement {
    constructor() {
        super(...arguments);
        this.transparent = false;
        this.compact = false;
        this.sync = () => {
            this.querySelectorAll("loomi-listview-item").forEach((i) => (i.compact = this.compact));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    firstUpdated() {
        this.sync();
    }
    render() {
        return html `<div class="loomi-listview"><slot @slotchange=${this.sync}></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiListview.prototype, "transparent", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiListview.prototype, "compact", void 0);
LoomiListview = __decorate([
    customElement("loomi-listview")
], LoomiListview);
export { LoomiListview };
//# sourceMappingURL=loomi-listview.js.map