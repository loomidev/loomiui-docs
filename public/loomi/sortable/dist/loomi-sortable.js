var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const GRIP = svg `<path d="M9 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM17 5a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM17 12a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM17 19a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" fill="currentColor" />`;
// Module-level because a drag-and-drop gesture can span two <loomi-sortable>
// elements, and both lists need to agree on what is currently being dragged.
let activeDrag = null;
/**
 * `<loomi-sortable>` — a SortableJS-inspired drag-and-drop list. Provide rows via
 * the `items` array (`{ id, label, meta?, locked?, filtered?, className? }`). Give
 * two or more lists the same non-empty `group` to let users drag items between them.
 *
 * Form-associated: when `name` is set, the host submits the current order (JSON array
 * of ids) like a native form control.
 *
 * @fires reorder - `detail: { order }` after reordering within the same list.
 * @fires transfer - `detail: { order, items }` on BOTH lists involved, after item(s)
 *   move from one list to another.
 * @fires item-click - `detail: { item }` when a row is clicked outside multi-drag mode.
 * @fires filter - `detail: { item }` when a filtered row is clicked or drag-started.
 */
let LoomiSortable = class LoomiSortable extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.rowRects = new Map();
        this.items = [];
        /** Form-control name; when set, the host submits the order as a JSON array of ids. */
        this.name = "";
        /** Kept for backwards compatibility; setting a non-empty `group` is enough to share lists. */
        this.type = "simple";
        /** SortableJS-style group name or object (`{ name, pull, put }`) for shared lists. */
        this.group = "";
        /** Leave dragged item(s) in place when dropped into another shared list. Alias for `group.pull = "clone"`. */
        this.clone = false;
        /** Enable or disable drag-starting from this list. The list still accepts incoming transfers when `false`. */
        this.sortable = true;
        this.locale = "";
        /** Enable or disable sorting within this list. Items may still be dragged out when `false`. */
        this.sort = true;
        /** SortableJS-style selector for rows/elements that cannot be dragged, e.g. `.filtered`. */
        this.filter = "";
        /** SortableJS-style handle selector. Any non-empty value enables the built-in row handle. */
        this.handle = "";
        /** Drag by a dedicated handle instead of the whole row surface. */
        this.hasHandle = false;
        /** Icon name (from `@loomidev/icons`) used for the drag handle when handle mode is enabled. */
        this.handleIcon = "bars-3";
        /** Backwards-compatible multi-drag flag. */
        this.multidrag = false;
        /** SortableJS-style camelCase multi-drag flag, exposed as the `multi-drag` attribute. */
        this.multiDrag = false;
        /** Extra class applied to selected rows in multi-drag mode. */
        this.selectedClass = "selected";
        /** Swap the dropped row with the row it lands on instead of shifting rows in between. */
        this.swap = false;
        /** Extra class applied to the hovered row in swap mode. */
        this.swapClass = "highlight";
        /** Reorder animation duration in ms. `0` disables the animation. */
        this.animation = 150;
        this.dragIndex = null;
        this.overIndex = null;
        this.dragOverContainer = false;
        this.selectedIds = new Set();
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    /** Current order of ids. */
    get order() {
        return this.items.map((i) => i.id);
    }
    willUpdate(changed) {
        this.internals.setFormValue(this.name ? JSON.stringify(this.order) : null);
        if (changed.has("items"))
            this.captureRects();
    }
    updated(changed) {
        if (changed.has("items"))
            this.playFlip();
    }
    captureRects() {
        this.rowRects.clear();
        this.renderRoot.querySelectorAll(".loomi-row").forEach((el) => {
            const id = el.dataset.id;
            if (id)
                this.rowRects.set(id, el.getBoundingClientRect());
        });
    }
    playFlip() {
        if (this.animation <= 0)
            return;
        this.renderRoot.querySelectorAll(".loomi-row").forEach((el) => {
            const id = el.dataset.id;
            const prev = id ? this.rowRects.get(id) : undefined;
            if (!prev)
                return;
            const next = el.getBoundingClientRect();
            const dx = prev.left - next.left;
            const dy = prev.top - next.top;
            if (!dx && !dy)
                return;
            el.style.transition = "none";
            el.style.transform = `translate(${dx}px, ${dy}px)`;
            requestAnimationFrame(() => {
                el.style.transition = `transform ${this.animation}ms ease`;
                el.style.transform = "";
            });
        });
    }
    get isMultiDrag() {
        return this.multidrag || this.multiDrag;
    }
    get handleMode() {
        return this.hasHandle || this.handle.trim() !== "";
    }
    get normalizedGroup() {
        if (!this.group)
            return { name: "" };
        return typeof this.group === "string" ? { name: this.group } : this.group;
    }
    groupName() {
        return this.normalizedGroup.name?.trim() ?? "";
    }
    optionAllows(option, peerGroup, sameGroup) {
        if (option === undefined)
            return sameGroup;
        if (option === true || option === "clone")
            return true;
        if (option === false)
            return false;
        if (Array.isArray(option))
            return option.includes(peerGroup);
        return option === peerGroup;
    }
    canPullTo(target) {
        const sourceGroup = this.groupName();
        const targetGroup = target.groupName();
        if (!sourceGroup || !targetGroup)
            return false;
        return this.optionAllows(this.normalizedGroup.pull, targetGroup, sourceGroup === targetGroup);
    }
    canPutFrom(source) {
        const targetGroup = this.groupName();
        const sourceGroup = source.groupName();
        if (!targetGroup || !sourceGroup)
            return false;
        return this.optionAllows(this.normalizedGroup.put, sourceGroup, targetGroup === sourceGroup);
    }
    shouldCloneTransfer() {
        return this.clone || this.normalizedGroup.pull === "clone";
    }
    acceptsTransferFrom(other) {
        return other !== this && other.canPullTo(this) && this.canPutFrom(other);
    }
    rowClasses(item, i, locked, filtered) {
        const classes = ["loomi-row"];
        if (this.dragIndex === i)
            classes.push("dragging");
        if (this.overIndex === i) {
            classes.push("over");
            if (this.swap && this.swapClass)
                classes.push(this.swapClass);
        }
        if (this.selectedIds.has(item.id)) {
            classes.push("selected");
            if (this.selectedClass && this.selectedClass !== "selected")
                classes.push(this.selectedClass);
        }
        if (locked)
            classes.push("locked");
        if (filtered)
            classes.push("filtered");
        if (item.className)
            classes.push(...item.className.split(/\s+/).filter(Boolean));
        return classes.join(" ");
    }
    itemFilteredByData(item) {
        if (item.filtered)
            return true;
        if (this.filter.trim() === ".filtered") {
            return item.className?.split(/\s+/).includes("filtered") ?? false;
        }
        return false;
    }
    rowMatchesFilter(row) {
        const selector = this.filter.trim();
        if (!selector)
            return false;
        try {
            return row.matches(selector) || !!row.querySelector(selector);
        }
        catch {
            return false;
        }
    }
    emitFilter(item) {
        this.dispatchEvent(new CustomEvent("filter", { bubbles: true, composed: true, detail: { item } }));
    }
    onRowClick(item, e) {
        const row = e.currentTarget;
        if (item.locked || this.itemFilteredByData(item) || this.rowMatchesFilter(row)) {
            this.emitFilter(item);
            return;
        }
        if (this.isMultiDrag) {
            e.preventDefault();
            const next = new Set(this.selectedIds);
            if (next.has(item.id))
                next.delete(item.id);
            else
                next.add(item.id);
            this.selectedIds = next;
            return;
        }
        this.dispatchEvent(new CustomEvent("item-click", { bubbles: true, composed: true, detail: { item } }));
    }
    onDragStart(i, e) {
        const item = this.items[i];
        const row = e.currentTarget;
        if (this.handleMode && !e.target?.closest(".loomi-handle")) {
            e.preventDefault();
            return;
        }
        if (item.locked || this.itemFilteredByData(item) || this.rowMatchesFilter(row)) {
            e.preventDefault();
            this.emitFilter(item);
            return;
        }
        if (!this.sortable) {
            e.preventDefault();
            return;
        }
        const dragged = this.isMultiDrag && this.selectedIds.has(item.id) && this.selectedIds.size > 1
            ? this.items.filter((it) => this.selectedIds.has(it.id))
            : [item];
        this.dragIndex = i;
        activeDrag = { source: this, items: dragged };
        if (e.dataTransfer) {
            e.dataTransfer.effectAllowed = this.shouldCloneTransfer() ? "copyMove" : "move";
            e.dataTransfer.setData("text/plain", dragged.map((it) => it.id).join(","));
        }
    }
    onDragOver(i, e) {
        if (!activeDrag)
            return;
        if (activeDrag.source !== this && !this.acceptsTransferFrom(activeDrag.source))
            return;
        e.preventDefault();
        this.overIndex = i;
    }
    onContainerDragOver(e) {
        if (!activeDrag)
            return;
        if (activeDrag.source !== this && !this.acceptsTransferFrom(activeDrag.source))
            return;
        e.preventDefault();
        this.dragOverContainer = true;
    }
    endDrag() {
        this.dragIndex = this.overIndex = null;
        this.dragOverContainer = false;
        activeDrag = null;
    }
    reorderWithin(index) {
        if (!activeDrag)
            return;
        const before = this.order.join("\u0000");
        const dragged = activeDrag.items;
        const draggedIds = new Set(dragged.map((it) => it.id));
        const target = this.items[index];
        if (!this.sort || this.dragIndex === null || (target && draggedIds.has(target.id))) {
            this.endDrag();
            return;
        }
        if (this.swap && target && dragged.length === 1) {
            const from = this.items.findIndex((it) => it.id === dragged[0].id);
            if (from !== -1) {
                const next = [...this.items];
                [next[from], next[index]] = [next[index], next[from]];
                this.items = next;
            }
        }
        else {
            const targetId = target?.id;
            const remaining = this.items.filter((it) => !draggedIds.has(it.id));
            const targetIdx = targetId ? remaining.findIndex((it) => it.id === targetId) : remaining.length;
            remaining.splice(targetIdx === -1 ? remaining.length : targetIdx, 0, ...dragged);
            this.items = remaining;
        }
        this.selectedIds = new Set();
        this.endDrag();
        if (this.order.join("\u0000") !== before) {
            this.dispatchEvent(new CustomEvent("reorder", { bubbles: true, composed: true, detail: { order: this.order } }));
        }
    }
    onDrop(i) {
        if (!activeDrag)
            return;
        if (activeDrag.source === this) {
            this.reorderWithin(i);
            return;
        }
        this.acceptTransfer(i);
    }
    onContainerDrop() {
        if (!activeDrag) {
            this.endDrag();
            return;
        }
        if (activeDrag.source === this) {
            this.reorderWithin(this.items.length);
            return;
        }
        this.acceptTransfer(this.items.length);
    }
    acceptTransfer(index) {
        if (!activeDrag)
            return;
        const { source, items: dragged } = activeDrag;
        if (!this.acceptsTransferFrom(source)) {
            this.endDrag();
            return;
        }
        if (!source.shouldCloneTransfer()) {
            const draggedIds = new Set(dragged.map((it) => it.id));
            source.items = source.items.filter((it) => !draggedIds.has(it.id));
        }
        const incoming = source.shouldCloneTransfer() ? dragged.map((it) => ({ ...it })) : dragged;
        const next = [...this.items];
        next.splice(index, 0, ...incoming);
        this.items = next;
        this.selectedIds = new Set();
        source.selectedIds = new Set();
        source.dragIndex = source.overIndex = null;
        source.dragOverContainer = false;
        this.endDrag();
        source.dispatchEvent(new CustomEvent("transfer", { bubbles: true, composed: true, detail: { order: source.order, items: dragged } }));
        this.dispatchEvent(new CustomEvent("transfer", { bubbles: true, composed: true, detail: { order: this.order, items: incoming } }));
    }
    render() {
        const handleSvg = getLoomiIcon(this.handleIcon) ?? GRIP;
        return html `<div
      class="loomi-sortable ${this.dragOverContainer ? "drag-over" : ""}"
      @dragover=${(e) => this.onContainerDragOver(e)}
      @dragleave=${() => {
            this.dragOverContainer = false;
        }}
      @drop=${(e) => {
            e.preventDefault();
            this.onContainerDrop();
        }}
    >
      ${this.items.map((item, i) => {
            const filtered = this.itemFilteredByData(item);
            const locked = !!item.locked || !this.sortable || filtered;
            const rowDraggable = !this.handleMode && !locked;
            const handleDraggable = this.handleMode && !locked;
            return html `<div
          class=${this.rowClasses(item, i, locked, filtered)}
          data-id=${item.id}
          data-filtered=${filtered ? "true" : nothing}
          draggable=${rowDraggable}
          @dragstart=${(e) => this.onDragStart(i, e)}
          @dragover=${(e) => this.onDragOver(i, e)}
          @drop=${(e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onDrop(i);
            }}
          @dragend=${() => this.endDrag()}
          @click=${(e) => this.onRowClick(item, e)}
        >
          ${this.handleMode
                ? html `<span class="loomi-handle" draggable=${handleDraggable} data-handle="true"
                ><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  ${handleSvg}
                </svg></span
              >`
                : nothing}
          <span class="loomi-text">
            <span class="loomi-label">${item.label}</span>
            ${item.meta ? html `<span class="loomi-meta">${item.meta}</span>` : nothing}
          </span>
          ${item.locked || filtered
                ? html `<svg class="loomi-lock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                ${getLoomiIcon("lock-closed")}
              </svg>`
                : nothing}
        </div>`;
        })}
      ${this.items.length === 0 ? html `<div class="loomi-empty-hint">${loomiT("sortable.dropHere", {}, this.locale)}</div>` : nothing}
    </div>`;
    }
};
__decorate([
    property({ type: Array })
], LoomiSortable.prototype, "items", void 0);
__decorate([
    property({ reflect: true })
], LoomiSortable.prototype, "name", void 0);
__decorate([
    property()
], LoomiSortable.prototype, "type", void 0);
__decorate([
    property()
], LoomiSortable.prototype, "group", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSortable.prototype, "clone", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSortable.prototype, "sortable", void 0);
__decorate([
    property()
], LoomiSortable.prototype, "locale", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSortable.prototype, "sort", void 0);
__decorate([
    property()
], LoomiSortable.prototype, "filter", void 0);
__decorate([
    property()
], LoomiSortable.prototype, "handle", void 0);
__decorate([
    property({ type: Boolean, attribute: "has-handle" })
], LoomiSortable.prototype, "hasHandle", void 0);
__decorate([
    property({ attribute: "handle-icon" })
], LoomiSortable.prototype, "handleIcon", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSortable.prototype, "multidrag", void 0);
__decorate([
    property({ type: Boolean, attribute: "multi-drag" })
], LoomiSortable.prototype, "multiDrag", void 0);
__decorate([
    property({ attribute: "selected-class" })
], LoomiSortable.prototype, "selectedClass", void 0);
__decorate([
    property({ type: Boolean })
], LoomiSortable.prototype, "swap", void 0);
__decorate([
    property({ attribute: "swap-class" })
], LoomiSortable.prototype, "swapClass", void 0);
__decorate([
    property({ type: Number })
], LoomiSortable.prototype, "animation", void 0);
__decorate([
    state()
], LoomiSortable.prototype, "dragIndex", void 0);
__decorate([
    state()
], LoomiSortable.prototype, "overIndex", void 0);
__decorate([
    state()
], LoomiSortable.prototype, "dragOverContainer", void 0);
__decorate([
    state()
], LoomiSortable.prototype, "selectedIds", void 0);
LoomiSortable = __decorate([
    customElement("loomi-sortable")
], LoomiSortable);
export { LoomiSortable };
//# sourceMappingURL=loomi-sortable.js.map