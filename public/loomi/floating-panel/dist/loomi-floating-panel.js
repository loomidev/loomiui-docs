var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const RESIZE_DIRS = ["n", "s", "e", "w", "ne", "nw", "se", "sw"];
const EDGE_DIRS = new Set(["n", "s", "e", "w"]);
const GRIP = svg `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`;
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/** Base z-index new panels stack above; each bring-to-front bumps a shared counter on top of it. */
const Z_BASE = 2147480000;
let topStackOffset = 0;
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
/** Walks into nested shadow roots to find the actually-focused element. */
function deepActiveElement() {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement)
        el = el.shadowRoot.activeElement;
    return el;
}
const registry = new Map();
/** Open a floating panel by its `name`. */
export function showLoomiFloatingPanel(name) {
    registry.get(name)?.show();
}
/** Close a floating panel by its `name`. */
export function hideLoomiFloatingPanel(name) {
    registry.get(name)?.hide();
}
window.showLoomiFloatingPanel = showLoomiFloatingPanel;
window.hideLoomiFloatingPanel = hideLoomiFloatingPanel;
/**
 * `<loomi-floating-panel>` — a draggable, resizable panel that floats above the page,
 * unanchored to any trigger. Open/close via `name` with `showLoomiFloatingPanel()` /
 * `hideLoomiFloatingPanel()`, or the instance `show()` / `hide()` methods.
 *
 * @slot - The panel body.
 * @fires open - Shown. @fires close - Dismissed.
 * @fires loomi-drag - `detail: { top, left }` after the panel is moved.
 * @fires loomi-resize - `detail: { top, left, width, height }` after the panel is resized.
 * @fires loomi-minimize - `detail: { minimized }` when the minimize button is toggled.
 * @fires loomi-maximize - `detail: { maximized }` when the maximize button (or header double-click) is toggled.
 */
let LoomiFloatingPanel = class LoomiFloatingPanel extends LoomiElement {
    constructor() {
        super(...arguments);
        this.name = "";
        this.title = "";
        this.locale = "";
        this.open = false;
        this.showCloseIcon = true;
        /** Enables the eight drag handles along the edges/corners. */
        this.resizable = true;
        /** Disables moving the panel by dragging (or arrow-keying) its header. */
        this.noDrag = false;
        /** Keeps the panel's edges within the viewport while dragging/resizing. */
        this.bounded = true;
        /** Shows a header button that collapses the panel to just its title bar. */
        this.minimize = false;
        /** Shows a header button that expands the panel to fill the viewport. */
        this.maximize = false;
        /** Restricts dragging to a dedicated grip in the header instead of the whole header. */
        this.dragHandle = false;
        /** Whether the panel is currently collapsed to its title bar. */
        this.minimized = false;
        /** Whether the panel is currently filling the viewport. */
        this.maximized = false;
        /** Initial position; any CSS length. Left unset, the panel opens centered. */
        this.top = "";
        this.left = "";
        /** Initial size; any CSS length. Left unset, falls back to the stylesheet default. */
        this.width = "";
        this.height = "";
        this.minWidth = 220;
        this.minHeight = 140;
        this.maxWidth = Infinity;
        this.maxHeight = Infinity;
        /** Persists position/size to `localStorage` under this key across reloads. */
        this.autoSaveId = "";
        /** Explicit pixel rect once the panel has been dragged/resized (or restored); `null` while it's still following the `top`/`left`/`width`/`height` attributes (or centered). */
        this.rect = null;
        this.hasLoadedPersisted = false;
        /** The element focused before `show()` was called, restored when the panel closes. */
        this.previouslyFocused = null;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.bringToFront = () => {
            topStackOffset += 1;
            this.style.zIndex = String(Z_BASE + topStackOffset);
        };
        this.onKey = (e) => {
            if (!this.open || e.key !== "Escape" || !this.containsFocus())
                return;
            this.hide();
        };
        /** Toggles the collapsed-to-title-bar state; turns off `maximized` first if it was on. */
        this.toggleMinimize = () => {
            if (this.maximized)
                this.maximized = false;
            this.minimized = !this.minimized;
            this.dispatchEvent(new CustomEvent("loomi-minimize", { detail: { minimized: this.minimized }, bubbles: true, composed: true }));
        };
        /** Toggles the fill-the-viewport state; turns off `minimized` first if it was on. */
        this.toggleMaximize = () => {
            if (this.minimized)
                this.minimized = false;
            this.maximized = !this.maximized;
            this.dispatchEvent(new CustomEvent("loomi-maximize", { detail: { maximized: this.maximized }, bubbles: true, composed: true }));
        };
        this.onHeaderDoubleClick = () => {
            if (!this.maximize)
                return;
            this.toggleMaximize();
        };
        this.onHeaderPointerDown = (e) => {
            if (this.dragHandle && !e.currentTarget.classList.contains("loomi-grip"))
                return;
            if (this.noDrag || this.maximized || e.button !== 0)
                return;
            if (e.target?.closest(".loomi-header-btn"))
                return;
            e.preventDefault();
            const header = e.currentTarget;
            header.setPointerCapture(e.pointerId);
            const start = this.getBoundingClientRect();
            const startX = e.clientX;
            const startY = e.clientY;
            this.classList.add("is-dragging");
            const onMove = (moveEvent) => {
                let top = start.top + (moveEvent.clientY - startY);
                let left = start.left + (moveEvent.clientX - startX);
                if (this.bounded) {
                    top = clamp(top, 0, Math.max(0, window.innerHeight - start.height));
                    left = clamp(left, 0, Math.max(0, window.innerWidth - start.width));
                }
                this.rect = { top, left, width: start.width, height: start.height };
                this.syncPosition();
            };
            const onUp = () => {
                header.removeEventListener("pointermove", onMove);
                header.removeEventListener("pointerup", onUp);
                header.removeEventListener("pointercancel", onUp);
                this.classList.remove("is-dragging");
                this.persistRect();
                if (this.rect) {
                    this.dispatchEvent(new CustomEvent("loomi-drag", {
                        detail: { top: this.rect.top, left: this.rect.left },
                        bubbles: true,
                        composed: true,
                    }));
                }
            };
            header.addEventListener("pointermove", onMove);
            header.addEventListener("pointerup", onUp);
            header.addEventListener("pointercancel", onUp);
        };
        this.onHeaderKeyDown = (e) => {
            if (this.dragHandle && !e.currentTarget.classList.contains("loomi-grip"))
                return;
            if (this.noDrag || this.maximized)
                return;
            const step = e.shiftKey ? 10 : 1;
            let dx = 0;
            let dy = 0;
            switch (e.key) {
                case "ArrowLeft":
                    dx = -step;
                    break;
                case "ArrowRight":
                    dx = step;
                    break;
                case "ArrowUp":
                    dy = -step;
                    break;
                case "ArrowDown":
                    dy = step;
                    break;
                default: return;
            }
            e.preventDefault();
            const start = this.getBoundingClientRect();
            let top = start.top + dy;
            let left = start.left + dx;
            if (this.bounded) {
                top = clamp(top, 0, Math.max(0, window.innerHeight - start.height));
                left = clamp(left, 0, Math.max(0, window.innerWidth - start.width));
            }
            this.rect = { top, left, width: start.width, height: start.height };
            this.syncPosition();
            this.persistRect();
            this.dispatchEvent(new CustomEvent("loomi-drag", { detail: { top, left }, bubbles: true, composed: true }));
        };
        this.onResizePointerDown = (dir, e) => {
            if (!this.resizable || this.maximized || this.minimized || e.button !== 0)
                return;
            e.preventDefault();
            e.stopPropagation();
            const handle = e.currentTarget;
            handle.setPointerCapture(e.pointerId);
            const rect = this.getBoundingClientRect();
            const start = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
            const startX = e.clientX;
            const startY = e.clientY;
            this.classList.add("is-resizing");
            const onMove = (moveEvent) => {
                this.rect = this.computeResizedRect(dir, start, moveEvent.clientX - startX, moveEvent.clientY - startY);
                this.syncPosition();
            };
            const onUp = () => {
                handle.removeEventListener("pointermove", onMove);
                handle.removeEventListener("pointerup", onUp);
                handle.removeEventListener("pointercancel", onUp);
                this.classList.remove("is-resizing");
                this.persistRect();
                if (this.rect) {
                    this.dispatchEvent(new CustomEvent("loomi-resize", { detail: { ...this.rect }, bubbles: true, composed: true }));
                }
            };
            handle.addEventListener("pointermove", onMove);
            handle.addEventListener("pointerup", onUp);
            handle.addEventListener("pointercancel", onUp);
        };
        this.onResizeKeyDown = (dir, e) => {
            if (this.maximized || this.minimized)
                return;
            const step = e.shiftKey ? 10 : 1;
            let dx = 0;
            let dy = 0;
            switch (e.key) {
                case "ArrowLeft":
                    dx = -step;
                    break;
                case "ArrowRight":
                    dx = step;
                    break;
                case "ArrowUp":
                    dy = -step;
                    break;
                case "ArrowDown":
                    dy = step;
                    break;
                default: return;
            }
            e.preventDefault();
            const rect = this.getBoundingClientRect();
            const start = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
            this.rect = this.computeResizedRect(dir, start, dx, dy);
            this.syncPosition();
            this.persistRect();
            this.dispatchEvent(new CustomEvent("loomi-resize", { detail: { ...this.rect }, bubbles: true, composed: true }));
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        if (this.name)
            registry.set(this.name, this);
        document.addEventListener("keydown", this.onKey);
        this.addEventListener("pointerdown", this.bringToFront);
        if (!this.hasLoadedPersisted) {
            this.hasLoadedPersisted = true;
            this.rect = this.loadPersistedRect();
        }
        if (!this.hasAttribute("tabindex"))
            this.tabIndex = -1;
        this.setAttribute("role", "dialog");
        this.setAttribute("aria-modal", "false");
        this.syncPosition();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.name)
            registry.delete(this.name);
        document.removeEventListener("keydown", this.onKey);
        this.removeEventListener("pointerdown", this.bringToFront);
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("title") || changed.has("locale")) {
            this.setAttribute("aria-label", this.title || loomiT("floatingPanel.dialog", {}, this.locale));
        }
        if (changed.has("top") || changed.has("left") || changed.has("width") || changed.has("height")) {
            this.syncPosition();
        }
    }
    show() {
        this.previouslyFocused = deepActiveElement();
        this.moveToDocumentBody();
        this.open = true;
        this.bringToFront();
        this.dispatchEvent(new Event("open", { bubbles: true, composed: true }));
        this.updateComplete.then(() => {
            const header = this.shadowRoot?.querySelector(".loomi-header");
            (header ?? this).focus();
        });
    }
    hide() {
        if (!this.open)
            return;
        this.open = false;
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
        document.body.appendChild(this);
    }
    restoreOriginalPosition() {
        if (!this.originalParent)
            return;
        const nextSibling = this.originalNextSibling?.parentNode === this.originalParent ? this.originalNextSibling : null;
        if (this.originalParent.isConnected) {
            this.originalParent.insertBefore(this, nextSibling);
        }
        this.originalParent = null;
        this.originalNextSibling = null;
    }
    storageKey() {
        return this.autoSaveId ? `loomi-floating-panel:${this.autoSaveId}` : null;
    }
    loadPersistedRect() {
        const key = this.storageKey();
        if (!key || typeof localStorage === "undefined")
            return null;
        try {
            const raw = localStorage.getItem(key);
            if (!raw)
                return null;
            const parsed = JSON.parse(raw);
            const { top, left, width, height } = parsed;
            if ([top, left, width, height].every((value) => typeof value === "number" && Number.isFinite(value))) {
                return { top, left, width, height };
            }
        }
        catch {
            // Ignore invalid persisted rect and fall back to attribute/CSS defaults.
        }
        return null;
    }
    persistRect() {
        const key = this.storageKey();
        if (!key || !this.rect || typeof localStorage === "undefined")
            return;
        try {
            localStorage.setItem(key, JSON.stringify(this.rect));
        }
        catch {
            // Storage unavailable/full — persistence is a nicety, not required for the panel to work.
        }
    }
    /** Applies `rect` (once the panel has moved/resized) or the raw `top`/`left`/`width`/`height` attributes directly to the host's inline style — the host itself is the visible, positioned box. */
    syncPosition() {
        if (this.rect) {
            this.classList.remove("is-centered");
            this.style.top = `${this.rect.top}px`;
            this.style.left = `${this.rect.left}px`;
            this.style.width = `${this.rect.width}px`;
            this.style.height = `${this.rect.height}px`;
            return;
        }
        this.classList.toggle("is-centered", !this.top && !this.left);
        this.style.top = this.top || "";
        this.style.left = this.left || "";
        this.style.width = this.width || "";
        this.style.height = this.height || "";
    }
    containsFocus() {
        const active = deepActiveElement();
        if (!active)
            return false;
        return active === this || this.contains(active) || (this.shadowRoot?.contains(active) ?? false);
    }
    /** Resizes from `start` by pointer/keyboard delta `(dx, dy)`, re-anchoring the edge opposite the drag direction so it doesn't move once width/height clamp. */
    computeResizedRect(dir, start, dx, dy) {
        let { top, left, width, height } = start;
        if (dir.includes("e"))
            width = start.width + dx;
        if (dir.includes("w")) {
            width = start.width - dx;
        }
        if (dir.includes("s"))
            height = start.height + dy;
        if (dir.includes("n")) {
            height = start.height - dy;
        }
        width = clamp(width, this.minWidth, this.maxWidth);
        height = clamp(height, this.minHeight, this.maxHeight);
        if (dir.includes("w"))
            left = start.left + start.width - width;
        if (dir.includes("n"))
            top = start.top + start.height - height;
        if (this.bounded) {
            left = clamp(left, 0, Math.max(0, window.innerWidth - width));
            top = clamp(top, 0, Math.max(0, window.innerHeight - height));
            width = Math.min(width, window.innerWidth - left);
            height = Math.min(height, window.innerHeight - top);
        }
        return { top, left, width, height };
    }
    render() {
        if (!this.open)
            return nothing;
        const moveLabel = loomiT("floatingPanel.move", {}, this.locale);
        const resizeLabel = loomiT("floatingPanel.resize", {}, this.locale);
        const minimizeLabel = loomiT(this.minimized ? "floatingPanel.restore" : "floatingPanel.minimize", {}, this.locale);
        const maximizeLabel = loomiT(this.maximized ? "floatingPanel.restore" : "floatingPanel.maximize", {}, this.locale);
        const grabLabel = this.title ? `${this.title} — ${moveLabel}` : moveLabel;
        return html `
      <div
        class="loomi-header ${this.dragHandle ? "has-grip" : ""}"
        tabindex=${this.dragHandle ? nothing : "0"}
        aria-label=${this.dragHandle ? nothing : grabLabel}
        @pointerdown=${this.onHeaderPointerDown}
        @keydown=${this.onHeaderKeyDown}
        @dblclick=${this.onHeaderDoubleClick}
      >
        ${this.dragHandle
            ? html `<span
              class="loomi-grip"
              tabindex="0"
              role="button"
              aria-label=${grabLabel}
              @pointerdown=${this.onHeaderPointerDown}
              @keydown=${this.onHeaderKeyDown}
              >${GRIP}</span
            >`
            : nothing}
        <div class="loomi-title">${this.title}</div>
        <div class="loomi-header-actions">
          ${this.minimize
            ? html `<button
                class="loomi-header-btn loomi-minimize"
                aria-label=${minimizeLabel}
                @click=${this.toggleMinimize}
              >
                <loomi-icon name=${this.minimized ? "chevron-up" : "minus"} size="1.05rem" stroke-width="2"></loomi-icon>
              </button>`
            : nothing}
          ${this.maximize
            ? html `<button
                class="loomi-header-btn loomi-maximize"
                aria-label=${maximizeLabel}
                @click=${this.toggleMaximize}
              >
                <loomi-icon
                  name=${this.maximized ? "arrows-pointing-in" : "arrows-pointing-out"}
                  size="0.95rem"
                  stroke-width="2"
                ></loomi-icon>
              </button>`
            : nothing}
          ${this.showCloseIcon
            ? html `<button
                class="loomi-header-btn loomi-close"
                aria-label=${loomiT("common.close", {}, this.locale)}
                @click=${() => this.hide()}
              >
                <loomi-icon name="x-mark" size="1.05rem" stroke-width="2"></loomi-icon>
              </button>`
            : nothing}
        </div>
      </div>
      <div class="loomi-body"><slot></slot></div>
      ${this.resizable
            ? RESIZE_DIRS.map((dir) => html `
              <div
                class="loomi-resize dir-${dir}"
                tabindex="0"
                role="separator"
                aria-orientation=${EDGE_DIRS.has(dir) ? (dir === "n" || dir === "s" ? "horizontal" : "vertical") : nothing}
                aria-label=${resizeLabel}
                @pointerdown=${(e) => this.onResizePointerDown(dir, e)}
                @keydown=${(e) => this.onResizeKeyDown(dir, e)}
              ></div>
            `)
            : nothing}
    `;
    }
};
__decorate([
    property()
], LoomiFloatingPanel.prototype, "name", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "title", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFloatingPanel.prototype, "open", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-close-icon", converter: booleanAttribute })
], LoomiFloatingPanel.prototype, "showCloseIcon", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiFloatingPanel.prototype, "resizable", void 0);
__decorate([
    property({ type: Boolean, attribute: "no-drag" })
], LoomiFloatingPanel.prototype, "noDrag", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiFloatingPanel.prototype, "bounded", void 0);
__decorate([
    property({ type: Boolean })
], LoomiFloatingPanel.prototype, "minimize", void 0);
__decorate([
    property({ type: Boolean })
], LoomiFloatingPanel.prototype, "maximize", void 0);
__decorate([
    property({ type: Boolean, attribute: "drag-handle" })
], LoomiFloatingPanel.prototype, "dragHandle", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFloatingPanel.prototype, "minimized", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFloatingPanel.prototype, "maximized", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "top", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "left", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "width", void 0);
__decorate([
    property()
], LoomiFloatingPanel.prototype, "height", void 0);
__decorate([
    property({ type: Number, attribute: "min-width" })
], LoomiFloatingPanel.prototype, "minWidth", void 0);
__decorate([
    property({ type: Number, attribute: "min-height" })
], LoomiFloatingPanel.prototype, "minHeight", void 0);
__decorate([
    property({ type: Number, attribute: "max-width" })
], LoomiFloatingPanel.prototype, "maxWidth", void 0);
__decorate([
    property({ type: Number, attribute: "max-height" })
], LoomiFloatingPanel.prototype, "maxHeight", void 0);
__decorate([
    property({ attribute: "auto-save-id" })
], LoomiFloatingPanel.prototype, "autoSaveId", void 0);
LoomiFloatingPanel = __decorate([
    customElement("loomi-floating-panel")
], LoomiFloatingPanel);
export { LoomiFloatingPanel };
//# sourceMappingURL=loomi-floating-panel.js.map