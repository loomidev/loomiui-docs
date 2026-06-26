var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars } from "@loomi/core";
import "@loomi/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const TYPE = {
    success: { color: "green", icon: "check-circle" },
    info: { color: "blue", icon: "information-circle" },
    warning: { color: "orange", icon: "exclamation-triangle" },
    error: { color: "red", icon: "exclamation-circle" },
};
let uid = 0;
/**
 * `<loomi-notification>` — a container for stacked, auto-dismissing toasts. Trigger via
 * the `notify()` method or the global `showLoomiNotification()` helper.
 */
let LoomiNotification = class LoomiNotification extends LoomiElement {
    constructor() {
        super(...arguments);
        this.position = "top-right";
        this.locale = "";
        this.toasts = [];
        this.timers = new Map();
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.moveToDocumentBody();
    }
    moveToDocumentBody() {
        const body = this.ownerDocument?.body;
        if (body && this.parentElement !== body) {
            body.appendChild(this);
        }
    }
    /** Show a notification. Re-renders an existing one when `name` matches. */
    notify(opts) {
        const type = opts.type ?? "success";
        const dismissIn = opts.dismissIn ?? 15;
        let toast;
        if (opts.name) {
            const existing = this.toasts.find((t) => t.name === opts.name);
            if (existing) {
                Object.assign(existing, opts, { type });
                this.toasts = [...this.toasts];
                this.arm(existing.id, dismissIn);
                return;
            }
        }
        toast = { ...opts, id: ++uid, type };
        this.toasts = [...this.toasts, toast];
        this.arm(toast.id, dismissIn);
    }
    arm(id, dismissIn) {
        clearTimeout(this.timers.get(id));
        if (dismissIn > 0)
            this.timers.set(id, setTimeout(() => this.dismiss(id), dismissIn * 1000));
    }
    dismiss(id) {
        clearTimeout(this.timers.get(id));
        this.timers.delete(id);
        this.toasts = this.toasts.filter((t) => t.id !== id);
    }
    onDismiss(event, id) {
        event.preventDefault();
        event.stopPropagation();
        this.dismiss(id);
    }
    render() {
        return html `<div class="loomi-stack pos-${this.position}">
      ${this.toasts.map((t) => {
            const meta = TYPE[t.type];
            return html `<div class="loomi-toast" role="status" style=${accentVars(meta.color)}>
          <loomi-icon class="loomi-ico" name=${meta.icon} stroke-width="1.6"></loomi-icon>
          <div class="loomi-content">
            ${t.title ? html `<div class="loomi-title">${t.title}</div>` : nothing}
            <div class="loomi-message">${t.message}</div>
          </div>
          <button type="button" class="loomi-close" aria-label=${loomiT("common.dismiss", {}, this.locale)} @click=${(event) => this.onDismiss(event, t.id)}>
            <loomi-icon name="x-mark" stroke-width="2"></loomi-icon>
          </button>
        </div>`;
        })}
    </div>`;
    }
};
__decorate([
    property()
], LoomiNotification.prototype, "position", void 0);
__decorate([
    property()
], LoomiNotification.prototype, "locale", void 0);
__decorate([
    state()
], LoomiNotification.prototype, "toasts", void 0);
LoomiNotification = __decorate([
    customElement("loomi-notification")
], LoomiNotification);
export { LoomiNotification };
/**
 * Show a notification from anywhere. Uses the first `<loomi-notification>` on the page,
 * creating one (top-right) if none exists.
 */
export function showLoomiNotification(title, message, type = "success", dismissIn = 15, name) {
    let host = document.querySelector("loomi-notification");
    if (!host) {
        host = document.createElement("loomi-notification");
        document.body.appendChild(host);
    }
    host.notify({ title, message, type, dismissIn, name });
}
window.showLoomiNotification = showLoomiNotification;
//# sourceMappingURL=loomi-notification.js.map