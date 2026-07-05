var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import "@loomidev/dropmenu/loomi-dropmenu.js";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const STORAGE_KEY = "loomi-theme";
const DEFAULT_LIGHT_TEXT = "Light";
const DEFAULT_DARK_TEXT = "Dark";
const DEFAULT_SYSTEM_TEXT = "System";
/** Apply a theme: toggles the `dark` class on <html> and stores the choice. */
export function applyLoomiTheme(mode) {
    try {
        localStorage.setItem(STORAGE_KEY, mode);
    }
    catch {
        /* ignore */
    }
    const dark = mode === "dark" || (mode === "system" && matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
}
/** The stored theme choice (defaults to "system"). */
export function getLoomiTheme() {
    try {
        return localStorage.getItem(STORAGE_KEY) || "system";
    }
    catch {
        return "system";
    }
}
/**
 * `<loomi-theme-switcher>` — a light/dark/system theme toggle. Persists the choice to
 * localStorage and toggles the `dark` class on `<html>`.
 *
 * @fires theme-change - `detail: { theme }` when the theme is changed.
 */
let LoomiThemeSwitcher = class LoomiThemeSwitcher extends LoomiElement {
    constructor() {
        super(...arguments);
        this.lightText = DEFAULT_LIGHT_TEXT;
        this.darkText = DEFAULT_DARK_TEXT;
        this.systemText = DEFAULT_SYSTEM_TEXT;
        this.locale = "";
        this.lightIcon = "sun";
        this.darkIcon = "moon";
        this.systemIcon = "computer-desktop";
        this.iconRight = false;
        this.showLabels = false;
        this.variant = "horizontal";
        this.mode = getLoomiTheme();
        this.onSystemChange = () => {
            if (this.mode === "system")
                applyLoomiTheme("system");
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        applyLoomiTheme(this.mode);
        this.mq = matchMedia("(prefers-color-scheme: dark)");
        this.mq.addEventListener("change", this.onSystemChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.mq?.removeEventListener("change", this.onSystemChange);
    }
    select(mode) {
        this.mode = mode;
        applyLoomiTheme(mode);
        this.dispatchEvent(new CustomEvent("theme-change", { bubbles: true, composed: true, detail: { theme: mode } }));
    }
    options() {
        return [
            { mode: "light", text: loomiDefaultText(this.lightText, DEFAULT_LIGHT_TEXT, "themeSwitcher.light", this.locale), icon: this.lightIcon },
            { mode: "dark", text: loomiDefaultText(this.darkText, DEFAULT_DARK_TEXT, "themeSwitcher.dark", this.locale), icon: this.darkIcon },
            { mode: "system", text: loomiDefaultText(this.systemText, DEFAULT_SYSTEM_TEXT, "themeSwitcher.system", this.locale), icon: this.systemIcon },
        ];
    }
    icon(iconName) {
        const path = getLoomiIcon(iconName);
        return path
            ? html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">${path}</svg>`
            : nothing;
    }
    opt(mode, text, iconName) {
        return html `<button
      class="loomi-opt ${this.iconRight ? "icon-right" : ""} ${this.mode === mode ? "active" : ""}"
      aria-pressed=${this.mode === mode ? "true" : "false"}
      @click=${() => this.select(mode)}
    >
      ${this.icon(iconName)}
      <span class=${this.showLabels ? "" : "loomi-sr-only"}>${text}</span>
    </button>`;
    }
    renderHorizontal() {
        return html `<div class="loomi-switch" role="group" aria-label=${loomiT("themeSwitcher.theme", {}, this.locale)}>
      ${this.options().map(({ mode, text, icon }) => this.opt(mode, text, icon))}
    </div>`;
    }
    renderDropmenu() {
        const selected = this.options().find(({ mode }) => mode === this.mode) ?? this.options()[2];
        const checkPath = getLoomiIcon("check");
        return html `<loomi-dropmenu class="loomi-theme-menu" placement="right">
      <span slot="trigger" class="loomi-menu-trigger">
        <loomi-icon class="loomi-menu-selected-icon" name=${selected.icon} size="1.05rem"></loomi-icon>
        <span class="loomi-sr-only">${loomiT("themeSwitcher.selectedTheme", { theme: selected.text }, this.locale)}</span>
        <loomi-icon class="loomi-menu-chevron" name="chevron-down" size="1rem"></loomi-icon>
      </span>
      ${this.options().map(({ mode, text, icon }) => html `<loomi-dropmenu-item
          icon=${icon}
          class=${this.mode === mode ? "selected" : ""}
          aria-current=${this.mode === mode ? "true" : "false"}
          @click=${() => this.select(mode)}
        >
          <span class="loomi-menu-item-text">${text}</span>
          ${this.mode === mode && checkPath
            ? html `<svg
                class="loomi-menu-check"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                aria-hidden="true"
              >
                ${checkPath}
              </svg>`
            : nothing}
        </loomi-dropmenu-item>`)}
    </loomi-dropmenu>`;
    }
    render() {
        return this.variant === "dropmenu" ? this.renderDropmenu() : this.renderHorizontal();
    }
};
__decorate([
    property({ attribute: "light-text" })
], LoomiThemeSwitcher.prototype, "lightText", void 0);
__decorate([
    property({ attribute: "dark-text" })
], LoomiThemeSwitcher.prototype, "darkText", void 0);
__decorate([
    property({ attribute: "system-text" })
], LoomiThemeSwitcher.prototype, "systemText", void 0);
__decorate([
    property()
], LoomiThemeSwitcher.prototype, "locale", void 0);
__decorate([
    property({ attribute: "light-icon" })
], LoomiThemeSwitcher.prototype, "lightIcon", void 0);
__decorate([
    property({ attribute: "dark-icon" })
], LoomiThemeSwitcher.prototype, "darkIcon", void 0);
__decorate([
    property({ attribute: "system-icon" })
], LoomiThemeSwitcher.prototype, "systemIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "icon-right" })
], LoomiThemeSwitcher.prototype, "iconRight", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-labels" })
], LoomiThemeSwitcher.prototype, "showLabels", void 0);
__decorate([
    property()
], LoomiThemeSwitcher.prototype, "variant", void 0);
__decorate([
    state()
], LoomiThemeSwitcher.prototype, "mode", void 0);
LoomiThemeSwitcher = __decorate([
    customElement("loomi-theme-switcher")
], LoomiThemeSwitcher);
export { LoomiThemeSwitcher };
//# sourceMappingURL=loomi-theme-switcher.js.map