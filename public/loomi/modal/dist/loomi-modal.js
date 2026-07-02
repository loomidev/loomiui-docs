var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars, lockBodyScroll, unlockBodyScroll } from "@loomidev/core";
import "@loomidev/button/loomi-button.js";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const TYPE = {
    info: { color: "primary", icon: "information-circle" },
    error: { color: "error", icon: "exclamation-circle" },
    warning: { color: "warning", icon: "exclamation-triangle" },
    success: { color: "success", icon: "check-circle" },
};
const DEFAULT_OK_LABEL = "Okay";
const DEFAULT_CANCEL_LABEL = "Cancel";
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
const registry = new Map();
/** Open a modal by its `name`. */
export function showLoomiModal(name) {
    registry.get(name)?.show();
}
/** Close a modal by its `name`. */
export function hideLoomiModal(name) {
    registry.get(name)?.hide();
}
window.showLoomiModal = showLoomiModal;
window.hideLoomiModal = hideLoomiModal;
/**
 * `<loomi-modal>` — an overlay dialog. Open/close via `name` with `showLoomiModal()` /
 * `hideLoomiModal()`, or the instance `show()` / `hide()` methods.
 *
 * @slot - The modal body.
 * @fires ok - Primary button clicked. @fires cancel - Secondary button clicked. @fires close - Dismissed.
 */
let LoomiModal = class LoomiModal extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.title = "";
        this.type = "";
        this.icon = "";
        this.iconSource = "heroicons";
        this.size = "medium";
        this.locale = "";
        this.open = false;
        this.okButtonLabel = DEFAULT_OK_LABEL;
        this.cancelButtonLabel = DEFAULT_CANCEL_LABEL;
        this.showActionButtons = true;
        this.showCloseIcon = false;
        this.backdropCanClose = true;
        this.closeAfterAction = true;
        this.preventScroll = true;
        this.stretchActionButtons = false;
        this.alignButtons = "right";
        this.blurSize = "medium";
        /** The element focused before `show()` was called, restored when the modal closes. */
        this.previouslyFocused = null;
        this.hasScrollLock = false;
        this.isMovingInDom = false;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.onKey = (e) => {
            if (!this.open)
                return;
            if (e.key === "Escape") {
                if (this.backdropCanClose)
                    this.hide();
                return;
            }
            if (e.key !== "Tab")
                return;
            // Trap focus inside the dialog while it's open.
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
        this.onBackdrop = (e) => {
            if (e.target === e.currentTarget && this.backdropCanClose)
                this.hide();
        };
        this.onOk = () => {
            this.dispatchEvent(new Event("ok", { bubbles: true, composed: true }));
            if (this.closeAfterAction)
                this.hide();
        };
        this.onCancel = () => {
            this.dispatchEvent(new Event("cancel", { bubbles: true, composed: true }));
            if (this.closeAfterAction)
                this.hide();
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
        if (!this.isMovingInDom)
            this.releaseScrollLock();
    }
    updated(changedProperties) {
        super.updated(changedProperties);
        if (changedProperties.has("open") || changedProperties.has("preventScroll")) {
            this.syncScrollLock();
        }
    }
    show() {
        this.previouslyFocused = deepActiveElement();
        this.moveToDocumentBody();
        this.open = true;
        this.syncScrollLock();
        this.dispatchEvent(new Event("open", { bubbles: true, composed: true }));
        // Move focus into the dialog once it has rendered — first focusable element if
        // there is one (e.g. a footer button), else the dialog container itself.
        this.updateComplete
            .then(() => this.waitForActionButtons())
            .then(() => {
            const focusable = this.getFocusable();
            (focusable[0] ?? this.shadowRoot?.querySelector(".loomi-dialog"))?.focus();
        });
    }
    hide() {
        this.open = false;
        this.releaseScrollLock();
        this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
        this.restoreOriginalPosition();
        this.previouslyFocused?.focus();
        this.previouslyFocused = null;
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
    /** Focusable elements in template order: close button, slotted body, footer buttons. */
    getFocusable() {
        const before = Array.from(this.shadowRoot?.querySelectorAll(".loomi-close") ?? []);
        const light = Array.from(this.querySelectorAll(FOCUSABLE_SELECTOR));
        const after = Array.from(this.shadowRoot?.querySelectorAll(".loomi-footer loomi-button") ?? [])
            .map((button) => button.shadowRoot?.querySelector('[part="button"]') ?? null)
            .filter((button) => !!button);
        return [...before, ...light, ...after];
    }
    async waitForActionButtons() {
        const buttons = Array.from(this.shadowRoot?.querySelectorAll(".loomi-footer loomi-button") ?? []);
        await Promise.all(buttons.map((button) => button.updateComplete ?? Promise.resolve()));
    }
    render() {
        if (!this.open)
            return nothing;
        const t = this.type ? TYPE[this.type] : undefined;
        const iconName = this.icon || t?.icon || "";
        const actionColor = t?.color ?? "primary";
        const accent = accentVars(actionColor);
        const okLabel = this.okButtonLabel === DEFAULT_OK_LABEL ? loomiT("modal.ok", {}, this.locale) : this.okButtonLabel;
        const cancelLabel = this.cancelButtonLabel === DEFAULT_CANCEL_LABEL
            ? loomiT("modal.cancel", {}, this.locale)
            : this.cancelButtonLabel;
        const showOk = this.showActionButtons && this.okButtonLabel;
        const showCancel = this.showActionButtons && this.cancelButtonLabel;
        const dialogClasses = [
            "loomi-dialog",
            `size-${this.size}`,
            iconName ? "has-icon" : "is-default",
            this.showCloseIcon ? "has-close" : "",
        ].filter(Boolean).join(" ");
        return html `<div class="loomi-backdrop blur-${this.blurSize}" @click=${this.onBackdrop}>
      <div
        class=${dialogClasses}
        role="dialog"
        aria-modal="true"
        aria-label=${this.title || loomiT("modal.dialog", {}, this.locale)}
        tabindex="-1"
        style=${accent}
      >
        ${this.showCloseIcon
            ? html `<button class="loomi-close" aria-label=${loomiT("common.close", {}, this.locale)} @click=${() => this.hide()}>
              <loomi-icon name="x-mark" size="1.15rem" stroke-width="2"></loomi-icon>
            </button>`
            : nothing}
        <div class="loomi-content">
          ${iconName
            ? html `<div class="loomi-icon-wrap">
                <loomi-icon class="loomi-ico" name=${iconName} source=${this.iconSource} size="1.5rem"></loomi-icon>
              </div>`
            : nothing}
          <div class="loomi-main">
            ${this.title ? html `<div class="loomi-title">${this.title}</div>` : nothing}
            <div class="loomi-body"><slot></slot></div>
          </div>
        </div>
        ${showOk || showCancel
            ? html `<div class="loomi-footer ${this.stretchActionButtons ? "stretch" : this.alignButtons}">
              ${showCancel
                ? html `<loomi-button
                    class="loomi-action"
                    type="secondary"
                    size="small"
                    ?block=${this.stretchActionButtons}
                    @click=${this.onCancel}
                    >${cancelLabel}</loomi-button
                  >`
                : nothing}
              ${showOk
                ? html `<loomi-button
                    class="loomi-action"
                    size="small"
                    color=${actionColor}
                    ?block=${this.stretchActionButtons}
                    @click=${this.onOk}
                    >${okLabel}</loomi-button
                  >`
                : nothing}
            </div>`
            : nothing}
      </div>
    </div>`;
    }
};
__decorate([
    property()
], LoomiModal.prototype, "name", void 0);
__decorate([
    property()
], LoomiModal.prototype, "title", void 0);
__decorate([
    property()
], LoomiModal.prototype, "type", void 0);
__decorate([
    property()
], LoomiModal.prototype, "icon", void 0);
__decorate([
    property({ attribute: "icon-source" })
], LoomiModal.prototype, "iconSource", void 0);
__decorate([
    property()
], LoomiModal.prototype, "size", void 0);
__decorate([
    property()
], LoomiModal.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiModal.prototype, "open", void 0);
__decorate([
    property({ attribute: "ok-button-label" })
], LoomiModal.prototype, "okButtonLabel", void 0);
__decorate([
    property({ attribute: "cancel-button-label" })
], LoomiModal.prototype, "cancelButtonLabel", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-action-buttons", converter: booleanAttribute })
], LoomiModal.prototype, "showActionButtons", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-close-icon", converter: booleanAttribute })
], LoomiModal.prototype, "showCloseIcon", void 0);
__decorate([
    property({ type: Boolean, attribute: "backdrop-can-close", converter: booleanAttribute })
], LoomiModal.prototype, "backdropCanClose", void 0);
__decorate([
    property({ type: Boolean, attribute: "close-after-action", converter: booleanAttribute })
], LoomiModal.prototype, "closeAfterAction", void 0);
__decorate([
    property({ type: Boolean, attribute: "prevent-scroll", converter: booleanAttribute })
], LoomiModal.prototype, "preventScroll", void 0);
__decorate([
    property({ type: Boolean, attribute: "stretch-action-buttons", converter: booleanAttribute })
], LoomiModal.prototype, "stretchActionButtons", void 0);
__decorate([
    property({ attribute: "align-buttons" })
], LoomiModal.prototype, "alignButtons", void 0);
__decorate([
    property({ attribute: "blur-size" })
], LoomiModal.prototype, "blurSize", void 0);
LoomiModal = __decorate([
    customElement("loomi-modal")
], LoomiModal);
export { LoomiModal };
//# sourceMappingURL=loomi-modal.js.map