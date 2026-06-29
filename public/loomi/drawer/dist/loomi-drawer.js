var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, onClickOutside, lockBodyScroll, unlockBodyScroll } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
const FOCUSABLE_SELECTOR = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
/** Walks into nested shadow roots to find the actually-focused element. */
function deepActiveElement() {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement)
        el = el.shadowRoot.activeElement;
    return el;
}
/**
 * Resolves once `el`'s open/close CSS animation finishes. Falls back to a timer so a
 * disabled or zero-duration animation (e.g. via a custom `--loomi-drawer-duration`,
 * or a misconfigured override) can't leave `hide()` hanging forever.
 */
function waitForAnimation(el, fallbackMs = 500) {
    if (!el)
        return Promise.resolve();
    return new Promise((resolve) => {
        let done = false;
        const finish = () => {
            if (done)
                return;
            done = true;
            el.removeEventListener("animationend", onEnd);
            el.removeEventListener("animationcancel", onEnd);
            clearTimeout(timer);
            resolve();
        };
        const onEnd = (e) => {
            if (e.target === el)
                finish();
        };
        el.addEventListener("animationend", onEnd);
        el.addEventListener("animationcancel", onEnd);
        const timer = setTimeout(finish, fallbackMs);
    });
}
const registry = new Map();
/** Open a drawer by its `name`. */
export function showLoomiDrawer(name) {
    registry.get(name)?.show();
}
/** Close a drawer by its `name`. */
export function hideLoomiDrawer(name) {
    registry.get(name)?.hide();
}
window.showLoomiDrawer = showLoomiDrawer;
window.hideLoomiDrawer = hideLoomiDrawer;
/**
 * `<loomi-drawer>` — a panel that slides in from an edge of the screen. Open/close via
 * `name` with `showLoomiDrawer()` / `hideLoomiDrawer()`, or the instance `show()` / `hide()`
 * methods.
 *
 * @slot - The drawer body.
 * @fires open - Shown. @fires close - Dismissed (fires as the close animation starts).
 */
let LoomiDrawer = class LoomiDrawer extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.title = "";
        this.position = "right";
        this.size = "medium";
        this.locale = "";
        this.open = false;
        this.showCloseIcon = true;
        this.backdrop = true;
        this.closeOnOutsideClick = true;
        this.preventScroll = true;
        /** True while the close animation is playing; `open` stays true for that whole span. */
        this.closing = false;
        /** The element focused before `show()` was called, restored when the drawer closes. */
        this.previouslyFocused = null;
        this.hasScrollLock = false;
        this.isMovingInDom = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        /** Bumped on every show()/hide() so a stale finalizeClose() from a superseded hide() is a no-op. */
        this.closeToken = 0;
        this.stopOutsideClick = null;
        this.onKey = (e) => {
            if (!this.open || this.closing)
                return;
            if (e.key === "Escape") {
                this.hide();
                return;
            }
            if (e.key !== "Tab" || !this.backdrop)
                return;
            // Trap focus inside the panel while open — only when acting as a modal (backdrop on);
            // a non-modal (no-backdrop) drawer leaves the rest of the page reachable by Tab.
            const focusable = this.getFocusable();
            if (focusable.length === 0) {
                e.preventDefault();
                return;
            }
            const current = deepActiveElement();
            const index = focusable.indexOf(current);
            if (e.shiftKey) {
                if (index <= 0) {
                    e.preventDefault();
                    focusable[focusable.length - 1].focus();
                }
            }
            else if (index === -1 || index === focusable.length - 1) {
                e.preventDefault();
                focusable[0].focus();
            }
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        if (this.name)
            registry.set(this.name, this);
        document.addEventListener("keydown", this.onKey);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.name)
            registry.delete(this.name);
        document.removeEventListener("keydown", this.onKey);
        if (!this.isMovingInDom) {
            this.releaseScrollLock();
            this.stopOutsideClick?.();
            this.stopOutsideClick = null;
        }
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has("open") || changedProperties.has("preventScroll")) {
            this.syncScrollLock();
        }
        if (changedProperties.has("open") || changedProperties.has("closeOnOutsideClick")) {
            this.syncOutsideClick();
        }
    }
    show() {
        this.closeToken += 1; // invalidate any in-flight close
        if (this.open && !this.closing)
            return;
        this.closing = false;
        this.previouslyFocused = deepActiveElement();
        this.moveToDocumentBody();
        this.open = true;
        this.dispatchEvent(new Event("open", { bubbles: true, composed: true }));
        this.updateComplete.then(() => {
            const focusable = this.getFocusable();
            (focusable[0] ?? this.shadowRoot?.querySelector(".loomi-panel"))?.focus();
        });
    }
    /** Starts the close animation immediately; resolves once the drawer has actually unmounted. */
    hide() {
        if (!this.open || this.closing)
            return Promise.resolve();
        const token = (this.closeToken += 1);
        this.closing = true;
        this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
        return this.finalizeClose(token);
    }
    /** Waits for the exit animation, then actually unmounts — unless a newer show()/hide() superseded this one. */
    async finalizeClose(token) {
        await this.updateComplete;
        const panel = this.shadowRoot?.querySelector(".loomi-panel");
        await waitForAnimation(panel);
        if (token !== this.closeToken)
            return;
        this.open = false;
        this.closing = false;
        this.restoreOriginalPosition();
    }
    moveToDocumentBody() {
        if (this.parentNode === document.body)
            return;
        this.originalParent = this.parentNode;
        this.originalNextSibling = this.nextSibling;
        this.isMovingInDom = true;
        document.body.appendChild(this);
        this.isMovingInDom = false;
    }
    restoreOriginalPosition() {
        if (!this.originalParent)
            return;
        const nextSibling = this.originalNextSibling?.parentNode === this.originalParent ? this.originalNextSibling : null;
        this.isMovingInDom = true;
        if (this.originalParent.isConnected) {
            this.originalParent.insertBefore(this, nextSibling);
        }
        this.isMovingInDom = false;
        this.originalParent = null;
        this.originalNextSibling = null;
    }
    syncScrollLock() {
        if (this.open && this.preventScroll) {
            if (!this.hasScrollLock) {
                lockBodyScroll();
                this.hasScrollLock = true;
            }
        }
        else {
            this.releaseScrollLock();
        }
    }
    releaseScrollLock() {
        if (!this.hasScrollLock)
            return;
        unlockBodyScroll();
        this.hasScrollLock = false;
    }
    /**
     * Detects clicks outside `.loomi-panel` (including clicks on the backdrop, or
     * anywhere on the page when there's no backdrop) and closes the drawer — independent
     * of whether a dimming backdrop is actually rendered.
     */
    syncOutsideClick() {
        const shouldListen = this.open && this.closeOnOutsideClick;
        if (shouldListen && !this.stopOutsideClick) {
            const panel = this.shadowRoot?.querySelector(".loomi-panel");
            if (panel)
                this.stopOutsideClick = onClickOutside(panel, () => this.hide());
        }
        else if (!shouldListen && this.stopOutsideClick) {
            this.stopOutsideClick();
            this.stopOutsideClick = null;
        }
    }
    /** Focusable elements in template order: close button, then slotted body content. */
    getFocusable() {
        const before = Array.from(this.shadowRoot?.querySelectorAll(".loomi-close") ?? []);
        const light = Array.from(this.querySelectorAll(FOCUSABLE_SELECTOR));
        return [...before, ...light];
    }
    render() {
        if (!this.open && !this.closing)
            return nothing;
        const animClass = this.closing ? "is-closing" : "is-open";
        return html `
      ${this.backdrop ? html `<div class="loomi-backdrop ${animClass}"></div>` : nothing}
      <div
        class="loomi-panel position-${this.position} size-${this.size} ${animClass}"
        role="dialog"
        aria-modal=${this.backdrop ? "true" : "false"}
        aria-label=${this.title || loomiT("drawer.dialog", {}, this.locale)}
        tabindex="-1"
      >
        ${this.title || this.showCloseIcon
            ? html `<div class="loomi-header">
              ${this.title ? html `<div class="loomi-title">${this.title}</div>` : nothing}
              ${this.showCloseIcon
                ? html `<button
                    class="loomi-close"
                    aria-label=${loomiT("common.close", {}, this.locale)}
                    @click=${() => this.hide()}
                  >
                    <loomi-icon name="x-mark" size="1.15rem" stroke-width="2"></loomi-icon>
                  </button>`
                : nothing}
            </div>`
            : nothing}
        <div class="loomi-body"><slot></slot></div>
      </div>
    `;
    }
};
__decorate([
    property()
], LoomiDrawer.prototype, "name", void 0);
__decorate([
    property()
], LoomiDrawer.prototype, "title", void 0);
__decorate([
    property()
], LoomiDrawer.prototype, "position", void 0);
__decorate([
    property()
], LoomiDrawer.prototype, "size", void 0);
__decorate([
    property()
], LoomiDrawer.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiDrawer.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-close-icon", converter: booleanAttribute })
], LoomiDrawer.prototype, "showCloseIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "backdrop", converter: booleanAttribute })
], LoomiDrawer.prototype, "backdrop", void 0);
__decorate([
    property({ type: Boolean, attribute: "close-on-outside-click", converter: booleanAttribute })
], LoomiDrawer.prototype, "closeOnOutsideClick", void 0);
__decorate([
    property({ type: Boolean, attribute: "prevent-scroll", converter: booleanAttribute })
], LoomiDrawer.prototype, "preventScroll", void 0);
__decorate([
    state()
], LoomiDrawer.prototype, "closing", void 0);
LoomiDrawer = __decorate([
    customElement("loomi-drawer")
], LoomiDrawer);
export { LoomiDrawer };
//# sourceMappingURL=loomi-drawer.js.map