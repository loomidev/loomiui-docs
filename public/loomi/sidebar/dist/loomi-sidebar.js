var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import "@loomidev/tooltip/loomi-tooltip.js";
import { componentStyles } from "./generated/styles.css.js";
import { findSidebarProvider, readSidebarPreference, SIDEBAR_KEYBOARD_SHORTCUT, SIDEBAR_MOBILE_BREAKPOINT, SIDEBAR_WIDTH, SIDEBAR_WIDTH_ICON, SIDEBAR_WIDTH_MOBILE, syncSidebarIconCollapsed, writeSidebarPreference, } from "./sidebar-context.js";
class SidebarPartElement extends LoomiElement {
    constructor() {
        super(...arguments);
        this.onSidebarStateChange = () => {
            syncSidebarIconCollapsed(this);
        };
    }
    connectedCallback() {
        super.connectedCallback();
        syncSidebarIconCollapsed(this);
        findSidebarProvider(this)?.addEventListener("loomi-sidebar-state-change", this.onSidebarStateChange);
    }
    disconnectedCallback() {
        findSidebarProvider(this)?.removeEventListener("loomi-sidebar-state-change", this.onSidebarStateChange);
        super.disconnectedCallback();
    }
}
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
const PANEL_LEFT = svg `<rect width="18" height="18" x="3" y="3" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2"/><line x1="9" x2="9" y1="3" y2="21" stroke="currentColor" stroke-width="2"/>`;
function provider(node) {
    return findSidebarProvider(node);
}
/**
 * `<loomi-sidebar-provider>` — wraps a sidebar layout and manages open/collapsed state,
 * keyboard shortcut (⌘/Ctrl+B), and mobile sheet behavior.
 *
 * @slot - `loomi-sidebar`, `loomi-sidebar-inset`, and other layout children.
 */
let LoomiSidebarProvider = class LoomiSidebarProvider extends LoomiElement {
    constructor() {
        super(...arguments);
        this.defaultOpen = true;
        this.open = readSidebarPreference();
        this.openMobile = false;
        this.variant = "sidebar";
        this.collapsible = "offcanvas";
        this.side = "left";
        this.isMobile = false;
        this.mediaQuery = null;
        this.onMediaChange = () => {
            this.isMobile = this.mediaQuery?.matches ?? false;
            if (!this.isMobile)
                this.openMobile = false;
            this.syncHostAttributes();
            this.notifyStateChange();
        };
        this.onKeyDown = (event) => {
            if (event.key.toLowerCase() !== SIDEBAR_KEYBOARD_SHORTCUT)
                return;
            if (!event.metaKey && !event.ctrlKey)
                return;
            event.preventDefault();
            this.toggleSidebar();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    get state() {
        return this.open ? "expanded" : "collapsed";
    }
    notifyStateChange() {
        this.dispatchEvent(new CustomEvent("loomi-sidebar-state-change", { bubbles: true }));
    }
    setOpen(next) {
        this.open = next;
        writeSidebarPreference(next);
        this.dispatchEvent(new CustomEvent("loomi-sidebar-open-change", { detail: { open: next } }));
        this.notifyStateChange();
    }
    setOpenMobile(next) {
        this.openMobile = next;
        this.dispatchEvent(new CustomEvent("loomi-sidebar-open-mobile-change", { detail: { open: next } }));
        this.notifyStateChange();
    }
    toggleSidebar() {
        if (this.isMobile)
            this.setOpenMobile(!this.openMobile);
        else
            this.setOpen(!this.open);
    }
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute("open"))
            this.open = readSidebarPreference() ?? this.defaultOpen;
        this.mediaQuery = window.matchMedia(`(max-width: ${SIDEBAR_MOBILE_BREAKPOINT - 1}px)`);
        this.isMobile = this.mediaQuery.matches;
        this.mediaQuery.addEventListener("change", this.onMediaChange);
        document.addEventListener("keydown", this.onKeyDown);
        this.syncHostAttributes();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.mediaQuery?.removeEventListener("change", this.onMediaChange);
        document.removeEventListener("keydown", this.onKeyDown);
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("open") && changed.get("open") !== undefined)
            writeSidebarPreference(this.open);
        this.syncHostAttributes();
        if (changed.has("open") ||
            changed.has("openMobile") ||
            changed.has("isMobile") ||
            changed.has("collapsible")) {
            this.notifyStateChange();
        }
    }
    syncHostAttributes() {
        this.dataset.state = this.state;
        this.dataset.mobile = this.isMobile ? "true" : "false";
        this.dataset.collapsible = this.collapsible;
        this.dataset.variant = this.variant;
        this.style.setProperty("--loomi-sidebar-width", SIDEBAR_WIDTH);
        this.style.setProperty("--loomi-sidebar-width-icon", SIDEBAR_WIDTH_ICON);
        this.style.setProperty("--loomi-sidebar-width-mobile", SIDEBAR_WIDTH_MOBILE);
    }
    render() {
        return html `<div class="provider-inner"><slot></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "default-open", converter: booleanAttribute })
], LoomiSidebarProvider.prototype, "defaultOpen", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiSidebarProvider.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, reflect: true, attribute: "open-mobile" })
], LoomiSidebarProvider.prototype, "openMobile", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebarProvider.prototype, "variant", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebarProvider.prototype, "collapsible", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebarProvider.prototype, "side", void 0);
__decorate([
    state()
], LoomiSidebarProvider.prototype, "isMobile", void 0);
LoomiSidebarProvider = __decorate([
    customElement("loomi-sidebar-provider")
], LoomiSidebarProvider);
export { LoomiSidebarProvider };
/**
 * `<loomi-sidebar>` — the main collapsible sidebar panel. Compose with `loomi-sidebar-*` parts.
 *
 * @slot - Header, content, footer, and rail sections.
 * @slot mobile - Optional mobile-only content (defaults to the default slot).
 */
let LoomiSidebar = class LoomiSidebar extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.side = "left";
        this.variant = "sidebar";
        this.collapsible = "offcanvas";
        this.onProviderStateChange = () => {
            this.requestUpdate();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    syncProvider() {
        const host = provider(this);
        if (!host)
            return;
        host.collapsible = this.collapsible;
        host.variant = this.variant;
        host.side = this.side;
    }
    connectedCallback() {
        super.connectedCallback();
        this.syncProvider();
        provider(this)?.addEventListener("loomi-sidebar-state-change", this.onProviderStateChange);
    }
    disconnectedCallback() {
        provider(this)?.removeEventListener("loomi-sidebar-state-change", this.onProviderStateChange);
        super.disconnectedCallback();
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("collapsible") || changed.has("variant") || changed.has("side"))
            this.syncProvider();
    }
    render() {
        const host = provider(this);
        const state = host?.state ?? "expanded";
        const isMobile = host?.isMobile ?? false;
        const openMobile = host?.openMobile ?? false;
        const inner = html `
      <div
        class="sidebar-inner"
        data-sidebar="sidebar"
        data-state=${state}
        data-collapsible=${this.collapsible}
        data-variant=${this.variant}
        data-side=${this.side}
      >
        <slot></slot>
      </div>
    `;
        if (isMobile) {
            return html `
        ${openMobile
                ? html `<div class="mobile-backdrop" @click=${() => host?.setOpenMobile(false)}></div>`
                : nothing}
        <div
          class="mobile-sheet"
          data-side=${this.side}
          data-open=${openMobile ? "true" : "false"}
          role="dialog"
          aria-modal="true"
          aria-hidden=${openMobile ? "false" : "true"}
        >
          ${inner}
        </div>
      `;
        }
        if (this.collapsible === "none") {
            return html `
        <div class="sidebar-gap" style="width: var(--loomi-sidebar-width)"></div>
        <div class="sidebar-container" data-collapsible="none" data-state=${state} data-variant=${this.variant} data-side=${this.side}>
          ${inner}
        </div>
      `;
        }
        return html `
      <div class="sidebar-gap"></div>
      <div
        class="sidebar-container"
        data-collapsible=${this.collapsible}
        data-state=${state}
        data-variant=${this.variant}
        data-side=${this.side}
      >
        ${inner}
        <slot name="rail"></slot>
      </div>
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiSidebar.prototype, "side", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebar.prototype, "variant", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebar.prototype, "collapsible", void 0);
LoomiSidebar = __decorate([
    customElement("loomi-sidebar")
], LoomiSidebar);
export { LoomiSidebar };
/** `<loomi-sidebar-header>` — sticky top region for branding or workspace switchers. */
let LoomiSidebarHeader = class LoomiSidebarHeader extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="header" data-sidebar="header"><slot></slot></div>`;
    }
};
LoomiSidebarHeader = __decorate([
    customElement("loomi-sidebar-header")
], LoomiSidebarHeader);
export { LoomiSidebarHeader };
/** `<loomi-sidebar-footer>` — sticky bottom region for user menus or actions. */
let LoomiSidebarFooter = class LoomiSidebarFooter extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="footer" data-sidebar="footer"><slot></slot></div>`;
    }
};
LoomiSidebarFooter = __decorate([
    customElement("loomi-sidebar-footer")
], LoomiSidebarFooter);
export { LoomiSidebarFooter };
/** `<loomi-sidebar-content>` — scrollable region between header and footer. */
let LoomiSidebarContent = class LoomiSidebarContent extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="content" data-sidebar="content"><slot></slot></div>`;
    }
};
LoomiSidebarContent = __decorate([
    customElement("loomi-sidebar-content")
], LoomiSidebarContent);
export { LoomiSidebarContent };
/** `<loomi-sidebar-separator>` — horizontal divider. */
let LoomiSidebarSeparator = class LoomiSidebarSeparator extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="separator" data-sidebar="separator" role="separator"></div>`;
    }
};
LoomiSidebarSeparator = __decorate([
    customElement("loomi-sidebar-separator")
], LoomiSidebarSeparator);
export { LoomiSidebarSeparator };
/** `<loomi-sidebar-group>` — section within the sidebar. Set `hide-collapsed` to hide in icon mode. */
let LoomiSidebarGroup = class LoomiSidebarGroup extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.hideCollapsed = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="group" data-sidebar="group" ?data-hide-collapsed=${this.hideCollapsed}><slot></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "hide-collapsed", converter: booleanAttribute })
], LoomiSidebarGroup.prototype, "hideCollapsed", void 0);
LoomiSidebarGroup = __decorate([
    customElement("loomi-sidebar-group")
], LoomiSidebarGroup);
export { LoomiSidebarGroup };
/** `<loomi-sidebar-group-label>` — label for a sidebar group. */
let LoomiSidebarGroupLabel = class LoomiSidebarGroupLabel extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="group-label" data-sidebar="group-label"><slot></slot></div>`;
    }
};
LoomiSidebarGroupLabel = __decorate([
    customElement("loomi-sidebar-group-label")
], LoomiSidebarGroupLabel);
export { LoomiSidebarGroupLabel };
/** `<loomi-sidebar-group-action>` — optional action button for a group header. */
let LoomiSidebarGroupAction = class LoomiSidebarGroupAction extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<button type="button" class="group-action" data-sidebar="group-action"><slot></slot></button>`;
    }
};
LoomiSidebarGroupAction = __decorate([
    customElement("loomi-sidebar-group-action")
], LoomiSidebarGroupAction);
export { LoomiSidebarGroupAction };
/** `<loomi-sidebar-group-content>` — content wrapper inside a group. */
let LoomiSidebarGroupContent = class LoomiSidebarGroupContent extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<div class="group-content" data-sidebar="group-content"><slot></slot></div>`;
    }
};
LoomiSidebarGroupContent = __decorate([
    customElement("loomi-sidebar-group-content")
], LoomiSidebarGroupContent);
export { LoomiSidebarGroupContent };
/** `<loomi-sidebar-menu>` — menu list within a group. */
let LoomiSidebarMenu = class LoomiSidebarMenu extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<ul class="menu" data-sidebar="menu"><slot></slot></ul>`;
    }
};
LoomiSidebarMenu = __decorate([
    customElement("loomi-sidebar-menu")
], LoomiSidebarMenu);
export { LoomiSidebarMenu };
/** `<loomi-sidebar-menu-item>` — single menu entry. */
let LoomiSidebarMenuItem = class LoomiSidebarMenuItem extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<li class="menu-item" data-sidebar="menu-item"><slot></slot></li>`;
    }
};
LoomiSidebarMenuItem = __decorate([
    customElement("loomi-sidebar-menu-item")
], LoomiSidebarMenuItem);
export { LoomiSidebarMenuItem };
/**
 * `<loomi-sidebar-menu-button>` — interactive menu button or link wrapper.
 * Use `tooltip` for a label when the sidebar is collapsed to icons.
 */
let LoomiSidebarMenuButton = class LoomiSidebarMenuButton extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.isActive = false;
        this.asChild = false;
        this.tooltip = "";
        this.size = "default";
        this.href = "";
        this.onClick = () => {
            if (!this.href)
                return;
            if (/^https?:\/\//.test(this.href))
                window.open(this.href, "_blank");
            else
                location.href = this.href;
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const host = provider(this);
        const showTooltip = Boolean(this.tooltip) && host?.state === "collapsed" && host?.collapsible === "icon";
        let control;
        if (this.asChild) {
            control = html `<div
        class="menu-button as-child"
        data-sidebar="menu-button"
        data-size=${this.size}
        data-active=${this.isActive ? "true" : "false"}
      ><slot></slot></div>`;
        }
        else if (this.href) {
            control = html `<a
        class="menu-button"
        data-sidebar="menu-button"
        data-size=${this.size}
        data-active=${this.isActive ? "true" : "false"}
        href=${this.href}
        aria-current=${this.isActive ? "page" : nothing}
      ><slot></slot></a>`;
        }
        else {
            control = html `<button
        type="button"
        class="menu-button"
        data-sidebar="menu-button"
        data-size=${this.size}
        data-active=${this.isActive ? "true" : "false"}
        @click=${this.onClick}
      ><slot></slot></button>`;
        }
        if (!showTooltip)
            return control;
        return html `
      <loomi-tooltip content=${this.tooltip} position="right">
        ${control}
      </loomi-tooltip>
    `;
    }
};
__decorate([
    property({ type: Boolean, attribute: "is-active", converter: booleanAttribute })
], LoomiSidebarMenuButton.prototype, "isActive", void 0);
__decorate([
    property({ type: Boolean, attribute: "as-child", converter: booleanAttribute })
], LoomiSidebarMenuButton.prototype, "asChild", void 0);
__decorate([
    property()
], LoomiSidebarMenuButton.prototype, "tooltip", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebarMenuButton.prototype, "size", void 0);
__decorate([
    property()
], LoomiSidebarMenuButton.prototype, "href", void 0);
LoomiSidebarMenuButton = __decorate([
    customElement("loomi-sidebar-menu-button")
], LoomiSidebarMenuButton);
export { LoomiSidebarMenuButton };
/** `<loomi-sidebar-menu-action>` — secondary action on a menu item. */
let LoomiSidebarMenuAction = class LoomiSidebarMenuAction extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.showOnHover = true;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<button
      type="button"
      class="menu-action"
      data-sidebar="menu-action"
      data-show-on-hover=${this.showOnHover ? "true" : "false"}
    ><slot></slot></button>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "show-on-hover", converter: booleanAttribute })
], LoomiSidebarMenuAction.prototype, "showOnHover", void 0);
LoomiSidebarMenuAction = __decorate([
    customElement("loomi-sidebar-menu-action")
], LoomiSidebarMenuAction);
export { LoomiSidebarMenuAction };
/** `<loomi-sidebar-menu-badge>` — badge overlay on a menu item. */
let LoomiSidebarMenuBadge = class LoomiSidebarMenuBadge extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<span class="menu-badge" data-sidebar="menu-badge"><slot></slot></span>`;
    }
};
LoomiSidebarMenuBadge = __decorate([
    customElement("loomi-sidebar-menu-badge")
], LoomiSidebarMenuBadge);
export { LoomiSidebarMenuBadge };
/** `<loomi-sidebar-menu-sub>` — nested submenu list. */
let LoomiSidebarMenuSub = class LoomiSidebarMenuSub extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<ul class="menu-sub" data-sidebar="menu-sub"><slot></slot></ul>`;
    }
};
LoomiSidebarMenuSub = __decorate([
    customElement("loomi-sidebar-menu-sub")
], LoomiSidebarMenuSub);
export { LoomiSidebarMenuSub };
/** `<loomi-sidebar-menu-sub-item>` — single submenu entry. */
let LoomiSidebarMenuSubItem = class LoomiSidebarMenuSubItem extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<li class="menu-sub-item" data-sidebar="menu-sub-item"><slot></slot></li>`;
    }
};
LoomiSidebarMenuSubItem = __decorate([
    customElement("loomi-sidebar-menu-sub-item")
], LoomiSidebarMenuSubItem);
export { LoomiSidebarMenuSubItem };
/** `<loomi-sidebar-menu-sub-button>` — link/button for a submenu entry. */
let LoomiSidebarMenuSubButton = class LoomiSidebarMenuSubButton extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.isActive = false;
        this.href = "";
        this.size = "md";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<a
      class="menu-sub-button"
      data-sidebar="menu-sub-button"
      data-size=${this.size}
      data-active=${this.isActive ? "true" : "false"}
      href=${this.href || "#"}
      aria-current=${this.isActive ? "page" : nothing}
    ><slot></slot></a>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "is-active", converter: booleanAttribute })
], LoomiSidebarMenuSubButton.prototype, "isActive", void 0);
__decorate([
    property()
], LoomiSidebarMenuSubButton.prototype, "href", void 0);
__decorate([
    property({ reflect: true })
], LoomiSidebarMenuSubButton.prototype, "size", void 0);
LoomiSidebarMenuSubButton = __decorate([
    customElement("loomi-sidebar-menu-sub-button")
], LoomiSidebarMenuSubButton);
export { LoomiSidebarMenuSubButton };
/** `<loomi-sidebar-inset>` — wraps the main content area beside the sidebar. */
let LoomiSidebarInset = class LoomiSidebarInset extends SidebarPartElement {
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<main class="inset" data-sidebar="inset"><slot></slot></main>`;
    }
};
LoomiSidebarInset = __decorate([
    customElement("loomi-sidebar-inset")
], LoomiSidebarInset);
export { LoomiSidebarInset };
/** `<loomi-sidebar-rail>` — edge control to toggle the sidebar. */
let LoomiSidebarRail = class LoomiSidebarRail extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.toggle = () => {
            provider(this)?.toggleSidebar();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const side = provider(this)?.side ?? "left";
        return html `<button
      type="button"
      class="rail"
      data-sidebar="rail"
      data-side=${side}
      aria-label="Toggle sidebar"
      @click=${this.toggle}
    ></button>`;
    }
};
LoomiSidebarRail = __decorate([
    customElement("loomi-sidebar-rail")
], LoomiSidebarRail);
export { LoomiSidebarRail };
/** `<loomi-sidebar-trigger>` — button that toggles the sidebar (desktop and mobile). */
let LoomiSidebarTrigger = class LoomiSidebarTrigger extends SidebarPartElement {
    constructor() {
        super(...arguments);
        this.toggle = () => {
            provider(this)?.toggleSidebar();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        return html `<button type="button" class="trigger" data-sidebar="trigger" @click=${this.toggle}>
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">${PANEL_LEFT}</svg>
      <span class="sr-only">Toggle Sidebar</span>
    </button>`;
    }
};
LoomiSidebarTrigger = __decorate([
    customElement("loomi-sidebar-trigger")
], LoomiSidebarTrigger);
export { LoomiSidebarTrigger };
//# sourceMappingURL=loomi-sidebar.js.map