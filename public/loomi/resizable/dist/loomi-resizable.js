var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
const GRIP = svg `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="9" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>`;
const RESIZABLE_ROLE = "data-resizable";
export function parsePercent(value) {
    if (value === null || value === undefined || value === "")
        return null;
    if (typeof value === "number")
        return Number.isFinite(value) ? value : null;
    const text = String(value).trim();
    if (text.endsWith("%")) {
        const parsed = parseFloat(text);
        return Number.isFinite(parsed) ? parsed : null;
    }
    const parsed = parseFloat(text);
    return Number.isFinite(parsed) ? parsed : null;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
function getDirectLayoutChildren(parent) {
    return Array.from(parent.children).filter((child) => child instanceof LoomiResizablePanel || child instanceof LoomiResizableHandle);
}
export function findResizablePanelGroup(el) {
    let node = el;
    while (node) {
        if (node instanceof LoomiResizablePanelGroup)
            return node;
        node = node.parentElement;
    }
    return null;
}
/**
 * `<loomi-resizable-panel>` — a resizable region inside `<loomi-resizable-panel-group>`.
 *
 * @slot - Panel content.
 */
let LoomiResizablePanel = class LoomiResizablePanel extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Stable id used in `loomi-layout-change` payloads and `auto-save-id` persistence. */
        this.panelId = "";
        /** Initial size percentage (`50` or `50%`). */
        this.defaultSize = "";
        /** Minimum size percentage. */
        this.minSize = 0;
        /** Maximum size percentage. */
        this.maxSize = 100;
        /** Allow collapsing via double-click on the adjacent handle. */
        this.collapsible = false;
        /** Size percentage when collapsed. */
        this.collapsedSize = 0;
        /** Whether the panel is collapsed. */
        this.collapsed = false;
        /** Current size percentage managed by the parent group. */
        this.size = 0;
        /** Size before collapsing, restored on expand. */
        this.preCollapseSize = 0;
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        this.setAttribute(RESIZABLE_ROLE, "panel");
        super.connectedCallback();
        findResizablePanelGroup(this)?.requestLayoutSync();
    }
    disconnectedCallback() {
        findResizablePanelGroup(this)?.requestLayoutSync();
        super.disconnectedCallback();
    }
    get effectiveSize() {
        return this.collapsed ? this.collapsedSize : this.size;
    }
    get effectiveMinSize() {
        return this.collapsed ? this.collapsedSize : this.minSize;
    }
    get effectiveMaxSize() {
        return this.collapsed ? this.collapsedSize : this.maxSize;
    }
    collapse() {
        if (!this.collapsible || this.collapsed)
            return;
        this.preCollapseSize = this.size;
        this.collapsed = true;
        findResizablePanelGroup(this)?.applyLayout();
    }
    expand() {
        if (!this.collapsed)
            return;
        this.collapsed = false;
        if (this.preCollapseSize > 0)
            this.size = this.preCollapseSize;
        findResizablePanelGroup(this)?.applyLayout();
    }
    toggleCollapsed() {
        if (this.collapsed)
            this.expand();
        else
            this.collapse();
    }
    render() {
        return html `<div class="loomi-panel"><slot></slot></div>`;
    }
};
__decorate([
    property({ attribute: "panel-id" })
], LoomiResizablePanel.prototype, "panelId", void 0);
__decorate([
    property({ attribute: "default-size" })
], LoomiResizablePanel.prototype, "defaultSize", void 0);
__decorate([
    property({ type: Number, attribute: "min-size" })
], LoomiResizablePanel.prototype, "minSize", void 0);
__decorate([
    property({ type: Number, attribute: "max-size" })
], LoomiResizablePanel.prototype, "maxSize", void 0);
__decorate([
    property({ type: Boolean })
], LoomiResizablePanel.prototype, "collapsible", void 0);
__decorate([
    property({ type: Number, attribute: "collapsed-size" })
], LoomiResizablePanel.prototype, "collapsedSize", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiResizablePanel.prototype, "collapsed", void 0);
__decorate([
    state()
], LoomiResizablePanel.prototype, "size", void 0);
__decorate([
    state()
], LoomiResizablePanel.prototype, "preCollapseSize", void 0);
LoomiResizablePanel = __decorate([
    customElement("loomi-resizable-panel")
], LoomiResizablePanel);
export { LoomiResizablePanel };
/**
 * `<loomi-resizable-handle>` — draggable separator between two panels.
 */
let LoomiResizableHandle = class LoomiResizableHandle extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Render a visible grip icon in the handle. */
        this.withHandle = false;
        /** Disable resizing for this handle. */
        this.disabled = false;
        this.onPointerDown = (event) => {
            if (this.disabled || event.button !== 0)
                return;
            const group = findResizablePanelGroup(this);
            const indexes = group ? this.getAdjacentPanelIndexes(group) : null;
            if (!group || !indexes)
                return;
            event.preventDefault();
            const handle = event.currentTarget;
            handle.setPointerCapture(event.pointerId);
            const orientation = group.orientation;
            const startPos = orientation === "horizontal" ? event.clientX : event.clientY;
            const [leftIndex, rightIndex] = indexes;
            const startLeft = group.panels[leftIndex]?.effectiveSize ?? 0;
            const startRight = group.panels[rightIndex]?.effectiveSize ?? 0;
            const onMove = (moveEvent) => {
                const current = orientation === "horizontal" ? moveEvent.clientX : moveEvent.clientY;
                const rect = group.getLayoutRect();
                const total = orientation === "horizontal" ? rect.width : rect.height;
                if (total <= 0)
                    return;
                const deltaPercent = ((current - startPos) / total) * 100;
                group.resizeAdjacentPanels(leftIndex, rightIndex, deltaPercent, startLeft, startRight);
            };
            const onUp = () => {
                handle.removeEventListener("pointermove", onMove);
                handle.removeEventListener("pointerup", onUp);
                handle.removeEventListener("pointercancel", onUp);
                group.emitLayoutChange();
                group.saveLayout();
            };
            handle.addEventListener("pointermove", onMove);
            handle.addEventListener("pointerup", onUp);
            handle.addEventListener("pointercancel", onUp);
        };
        this.onDoubleClick = () => {
            const group = findResizablePanelGroup(this);
            const indexes = group ? this.getAdjacentPanelIndexes(group) : null;
            if (!group || !indexes)
                return;
            const [leftIndex, rightIndex] = indexes;
            const left = group.panels[leftIndex];
            const right = group.panels[rightIndex];
            if (left?.collapsible)
                left.toggleCollapsed();
            else if (right?.collapsible)
                right.toggleCollapsed();
            group.applyLayout();
            group.emitLayoutChange();
            group.saveLayout();
        };
        this.onKeyDown = (event) => {
            if (this.disabled)
                return;
            const group = findResizablePanelGroup(this);
            const indexes = group ? this.getAdjacentPanelIndexes(group) : null;
            if (!group || !indexes)
                return;
            const horizontal = group.orientation === "horizontal";
            const step = event.shiftKey ? 10 : 1;
            let delta = 0;
            switch (event.key) {
                case "ArrowLeft":
                    delta = horizontal ? -step : 0;
                    break;
                case "ArrowRight":
                    delta = horizontal ? step : 0;
                    break;
                case "ArrowUp":
                    delta = horizontal ? 0 : -step;
                    break;
                case "ArrowDown":
                    delta = horizontal ? 0 : step;
                    break;
                case "Home":
                    delta = -100;
                    break;
                case "End":
                    delta = 100;
                    break;
                default:
                    return;
            }
            if (delta === 0)
                return;
            event.preventDefault();
            const [leftIndex, rightIndex] = indexes;
            const left = group.panels[leftIndex];
            const right = group.panels[rightIndex];
            if (!left || !right)
                return;
            group.resizeAdjacentPanels(leftIndex, rightIndex, delta, left.effectiveSize, right.effectiveSize);
            group.emitLayoutChange();
            group.saveLayout();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        this.setAttribute(RESIZABLE_ROLE, "handle");
        super.connectedCallback();
        this.syncOrientation();
        findResizablePanelGroup(this)?.registerHandle(this);
    }
    disconnectedCallback() {
        findResizablePanelGroup(this)?.unregisterHandle(this);
        super.disconnectedCallback();
    }
    updated(changed) {
        if (changed.has("withHandle"))
            this.syncOrientation();
    }
    syncOrientation() {
        const group = findResizablePanelGroup(this);
        const orientation = group?.orientation ?? "horizontal";
        this.dataset.orientation = orientation;
        this.setAttribute("aria-orientation", orientation === "horizontal" ? "vertical" : "horizontal");
        this.setAttribute("role", "separator");
        this.setAttribute("tabindex", this.disabled ? "-1" : "0");
    }
    getAdjacentPanelIndexes(group) {
        const children = getDirectLayoutChildren(group);
        const index = children.indexOf(this);
        if (index <= 0)
            return null;
        const prev = children[index - 1];
        if (!(prev instanceof LoomiResizablePanel))
            return null;
        const panels = group.panels;
        const leftIndex = panels.indexOf(prev);
        const right = children[index + 1];
        if (!(right instanceof LoomiResizablePanel))
            return null;
        const rightIndex = panels.indexOf(right);
        if (leftIndex < 0 || rightIndex < 0)
            return null;
        return [leftIndex, rightIndex];
    }
    render() {
        return html `
      <div
        class="loomi-handle"
        @pointerdown=${this.onPointerDown}
        @dblclick=${this.onDoubleClick}
        @keydown=${this.onKeyDown}
      >
        ${this.withHandle ? html `<span class="loomi-grip">${GRIP}</span>` : nothing}
      </div>
    `;
    }
};
__decorate([
    property({ type: Boolean, attribute: "with-handle" })
], LoomiResizableHandle.prototype, "withHandle", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiResizableHandle.prototype, "disabled", void 0);
LoomiResizableHandle = __decorate([
    customElement("loomi-resizable-handle")
], LoomiResizableHandle);
export { LoomiResizableHandle };
/**
 * `<loomi-resizable-panel-group>` — lays out resizable panels and handles.
 *
 * @slot - `<loomi-resizable-panel>` and `<loomi-resizable-handle>` children in order.
 * @fires loomi-layout-change - `detail: { sizes, layout }` when panel sizes change.
 */
let LoomiResizablePanelGroup = class LoomiResizablePanelGroup extends LoomiElement {
    constructor() {
        super(...arguments);
        this.orientation = "horizontal";
        /** Persist layout in `localStorage` under this key. */
        this.autoSaveId = "";
        this.layoutSyncQueued = false;
        this.registeredHandles = new Set();
        this.onSlotChange = () => {
            this.requestLayoutSync();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        this.setAttribute(RESIZABLE_ROLE, "group");
        super.connectedCallback();
    }
    get panels() {
        return getDirectLayoutChildren(this).filter((child) => child instanceof LoomiResizablePanel);
    }
    get handles() {
        return getDirectLayoutChildren(this).filter((child) => child instanceof LoomiResizableHandle);
    }
    registerHandle(handle) {
        this.registeredHandles.add(handle);
        handle.syncOrientation();
    }
    unregisterHandle(handle) {
        this.registeredHandles.delete(handle);
    }
    requestLayoutSync() {
        if (this.layoutSyncQueued)
            return;
        this.layoutSyncQueued = true;
        queueMicrotask(() => {
            this.layoutSyncQueued = false;
            this.initializeSizes();
            this.applyLayout();
        });
    }
    getLayoutRect() {
        const inner = this.renderRoot.querySelector(".loomi-group") ?? this;
        return inner.getBoundingClientRect();
    }
    initializeSizes() {
        const panels = this.panels;
        if (panels.length === 0)
            return;
        const specified = panels.map((panel) => parsePercent(panel.defaultSize));
        const hasSpecified = specified.some((value) => value !== null);
        let sizes;
        if (hasSpecified) {
            sizes = specified.map((value) => value ?? 0);
            const total = sizes.reduce((sum, value) => sum + value, 0);
            if (total <= 0) {
                sizes = panels.map(() => 100 / panels.length);
            }
            else if (Math.abs(total - 100) > 0.01) {
                sizes = sizes.map((value) => (value / total) * 100);
            }
        }
        else {
            sizes = panels.map(() => 100 / panels.length);
        }
        this.loadSavedLayout(sizes);
        panels.forEach((panel, index) => {
            if (panel.size <= 0)
                panel.size = sizes[index] ?? 0;
        });
    }
    loadSavedLayout(fallback) {
        if (!this.autoSaveId || typeof localStorage === "undefined")
            return;
        try {
            const raw = localStorage.getItem(`loomi-resizable:${this.autoSaveId}`);
            if (!raw)
                return;
            const layout = JSON.parse(raw);
            for (const panel of this.panels) {
                if (panel.panelId && layout[panel.panelId] != null) {
                    panel.size = layout[panel.panelId];
                }
            }
        }
        catch {
            // Ignore invalid persisted layout and fall back to defaults.
        }
        for (const panel of this.panels) {
            if (panel.size <= 0) {
                const index = this.panels.indexOf(panel);
                panel.size = fallback[index] ?? 0;
            }
        }
    }
    saveLayout() {
        if (!this.autoSaveId || typeof localStorage === "undefined")
            return;
        localStorage.setItem(`loomi-resizable:${this.autoSaveId}`, JSON.stringify(this.getLayoutMap()));
    }
    getLayoutMap() {
        const layout = {};
        for (const panel of this.panels) {
            if (panel.panelId)
                layout[panel.panelId] = panel.effectiveSize;
        }
        return layout;
    }
    applyLayout() {
        const panels = this.panels;
        if (panels.length === 0)
            return;
        const total = panels.reduce((sum, panel) => sum + panel.effectiveSize, 0);
        const scale = total > 0 ? 100 / total : 1;
        for (const panel of panels) {
            const size = panel.effectiveSize * scale;
            panel.style.flex = `0 0 ${size}%`;
            panel.style.overflow = "hidden";
            panel.style.minWidth = "0";
            panel.style.minHeight = "0";
            if (this.orientation === "horizontal") {
                panel.style.height = "100%";
                panel.style.width = "";
            }
            else {
                panel.style.width = "100%";
                panel.style.height = "";
            }
        }
        for (const handle of this.registeredHandles) {
            handle.syncOrientation();
        }
    }
    resizeAdjacentPanels(leftIndex, rightIndex, deltaPercent, startLeft, startRight) {
        const left = this.panels[leftIndex];
        const right = this.panels[rightIndex];
        if (!left || !right)
            return;
        const baseLeft = startLeft ?? left.effectiveSize;
        const baseRight = startRight ?? right.effectiveSize;
        if (left.collapsed && deltaPercent > 0)
            left.expand();
        if (right.collapsed && deltaPercent < 0)
            right.expand();
        let delta = deltaPercent;
        delta = Math.max(delta, left.effectiveMinSize - baseLeft);
        delta = Math.min(delta, left.effectiveMaxSize - baseLeft);
        delta = Math.max(delta, baseRight - right.effectiveMaxSize);
        delta = Math.min(delta, baseRight - right.effectiveMinSize);
        left.size = clamp(baseLeft + delta, left.effectiveMinSize, left.effectiveMaxSize);
        right.size = clamp(baseRight - delta, right.effectiveMinSize, right.effectiveMaxSize);
        this.applyLayout();
    }
    emitLayoutChange() {
        const sizes = this.panels.map((panel) => panel.effectiveSize);
        const detail = { sizes, layout: this.getLayoutMap() };
        this.dispatchEvent(new CustomEvent("loomi-layout-change", {
            bubbles: true,
            composed: true,
            detail,
        }));
    }
    firstUpdated() {
        this.initializeSizes();
        this.applyLayout();
    }
    render() {
        return html `<div class="loomi-group"><slot @slotchange=${this.onSlotChange}></slot></div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiResizablePanelGroup.prototype, "orientation", void 0);
__decorate([
    property({ attribute: "auto-save-id" })
], LoomiResizablePanelGroup.prototype, "autoSaveId", void 0);
LoomiResizablePanelGroup = __decorate([
    customElement("loomi-resizable-panel-group")
], LoomiResizablePanelGroup);
export { LoomiResizablePanelGroup };
//# sourceMappingURL=loomi-resizable.js.map