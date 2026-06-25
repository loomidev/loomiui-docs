var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { loomiStyles, accentVars } from "@loomi/core";
import { getLoomiIcon } from "@loomi/icons";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-tab>` — a single tab panel. Set `label` (and optionally `icon`) for its
 * heading, and `active` on the one that should show first. Place inside `<loomi-tabs>`.
 *
 * @slot - The tab's content.
 */
let LoomiTab = class LoomiTab extends LitElement {
    constructor() {
        super(...arguments);
        this.label = "";
        this.icon = "";
        this.active = false;
        this.disabled = false;
        this.url = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="loomi-panel" role="tabpanel" ?hidden=${!this.active}>
      <slot></slot>
    </div>`;
    }
};
__decorate([
    property()
], LoomiTab.prototype, "label", void 0);
__decorate([
    property()
], LoomiTab.prototype, "icon", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTab.prototype, "active", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTab.prototype, "disabled", void 0);
__decorate([
    property()
], LoomiTab.prototype, "url", void 0);
LoomiTab = __decorate([
    customElement("loomi-tab")
], LoomiTab);
export { LoomiTab };
/**
 * `<loomi-tabs>` — builds a heading bar from its `<loomi-tab>` children and toggles
 * the active panel. Styles: `simple` (default), `system`, `pills`.
 *
 * @slot - `<loomi-tab>` children.
 * @fires tab-change - `detail: { label }` when the active tab changes.
 */
let LoomiTabs = class LoomiTabs extends LitElement {
    constructor() {
        super(...arguments);
        this.color = "primary";
        this.tabStyle = "simple";
        this.defaultedActiveTab = false;
        /**
         * Arrow-key / Home / End navigation per the WAI-ARIA APG "tabs" pattern (roving
         * tabindex + automatic activation): moving focus also switches the active panel,
         * matching this component's click behavior.
         */
        this.onKeydown = (e) => {
            const enabled = this.tabs.filter((t) => !t.disabled);
            if (!enabled.length)
                return;
            const current = enabled.findIndex((t) => t.active);
            let next;
            switch (e.key) {
                case "ArrowRight":
                case "ArrowDown":
                    next = enabled[(current + 1 + enabled.length) % enabled.length];
                    break;
                case "ArrowLeft":
                case "ArrowUp":
                    next = enabled[(current - 1 + enabled.length) % enabled.length];
                    break;
                case "Home":
                    next = enabled[0];
                    break;
                case "End":
                    next = enabled[enabled.length - 1];
                    break;
                default:
                    return;
            }
            e.preventDefault();
            this.activate(next);
            this.focusTabButton(next);
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get tabs() {
        return Array.from(this.querySelectorAll("loomi-tab"));
    }
    // Runs before the first render (not firstUpdated, which runs after) so the default
    // active tab is already set by the time render() reads tab.active — avoids
    // triggering an unnecessary second update cycle right after the first.
    willUpdate() {
        if (this.defaultedActiveTab)
            return;
        const tabs = this.tabs;
        if (!tabs.length)
            return;
        this.defaultedActiveTab = true;
        if (!tabs.some((t) => t.active)) {
            const first = tabs.find((t) => !t.disabled);
            if (first)
                first.active = true;
        }
    }
    activate(tab) {
        if (tab.disabled)
            return;
        if (tab.url) {
            location.href = tab.url;
            return;
        }
        for (const t of this.tabs)
            t.active = t === tab;
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent("tab-change", { bubbles: true, composed: true, detail: { label: tab.label } }));
    }
    /** Focuses the rendered tab button at the same index as `tab` in `this.tabs`. */
    focusTabButton(tab) {
        const index = this.tabs.indexOf(tab);
        this.updateComplete.then(() => {
            this.shadowRoot?.querySelectorAll(".loomi-head")[index]?.focus();
        });
    }
    render() {
        return html `
      <div
        class="loomi-headings ${this.tabStyle}"
        role="tablist"
        style=${accentVars(this.color)}
        @keydown=${this.onKeydown}
      >
        ${this.tabs.map((tab) => html `<button
            class="loomi-head ${tab.active ? "active" : ""}"
            role="tab"
            aria-selected=${tab.active ? "true" : "false"}
            tabindex=${tab.active ? "0" : "-1"}
            ?disabled=${tab.disabled}
            @click=${() => this.activate(tab)}
          >
            ${tab.icon && getLoomiIcon(tab.icon)
            ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${getLoomiIcon(tab.icon)}</svg>`
            : nothing}
            <span>${tab.label}</span>
          </button>`)}
      </div>
      <div class="loomi-body"><slot @slotchange=${() => this.requestUpdate()}></slot></div>
    `;
    }
};
__decorate([
    property()
], LoomiTabs.prototype, "color", void 0);
__decorate([
    property({ attribute: "tab-style" })
], LoomiTabs.prototype, "tabStyle", void 0);
LoomiTabs = __decorate([
    customElement("loomi-tabs")
], LoomiTabs);
export { LoomiTabs };
//# sourceMappingURL=loomi-tab.js.map