const BOTTOM_THRESHOLD = 24;
export class ChatScrollerController {
    constructor() {
        this.autoScroll = false;
        this.defaultScrollPosition = "end";
        this.scrollPreviousItemPeek = 64;
        this.scrollMargin = 0;
        this.viewport = null;
        this.pinnedToBottom = true;
        this.scrollableStart = false;
        this.scrollableEnd = false;
        this.scrollButtonActive = false;
        this.initialPositionApplied = false;
        this.lastAnchorEl = null;
        this.items = new Map();
        this.itemElements = new Set();
        this.resizeObserver = null;
        this.mutationObserver = null;
        this.listeners = new Set();
        this.onViewportScroll = () => {
            this.syncScrollState();
        };
    }
    configure(options) {
        if (options.autoScroll !== undefined)
            this.autoScroll = options.autoScroll;
        if (options.defaultScrollPosition !== undefined) {
            this.defaultScrollPosition = options.defaultScrollPosition;
        }
        if (options.scrollPreviousItemPeek !== undefined) {
            this.scrollPreviousItemPeek = options.scrollPreviousItemPeek;
        }
        if (options.scrollMargin !== undefined)
            this.scrollMargin = options.scrollMargin;
    }
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    getScrollable() {
        return { start: this.scrollableStart, end: this.scrollableEnd };
    }
    isScrollButtonActive() {
        return this.scrollButtonActive;
    }
    attachViewport(viewport) {
        if (this.viewport === viewport)
            return;
        this.detachViewport();
        this.viewport = viewport;
        viewport.addEventListener("scroll", this.onViewportScroll, { passive: true });
        this.syncScrollState();
        this.applyDefaultScrollPosition();
    }
    attachContent(content) {
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver = new ResizeObserver(() => this.onContentResize());
        this.resizeObserver.observe(content);
        this.mutationObserver = new MutationObserver(() => this.onContentResize());
        this.mutationObserver.observe(content, { childList: true, subtree: true, characterData: true });
    }
    detachViewport() {
        this.viewport?.removeEventListener("scroll", this.onViewportScroll);
        this.viewport = null;
        this.resizeObserver?.disconnect();
        this.mutationObserver?.disconnect();
        this.resizeObserver = null;
        this.mutationObserver = null;
    }
    registerItem(el, registration) {
        this.itemElements.add(el);
        if (registration.messageId)
            this.items.set(registration.messageId, el);
        if (registration.scrollAnchor) {
            requestAnimationFrame(() => this.anchorItem(el));
        }
        else if (this.pinnedToBottom && this.autoScroll) {
            requestAnimationFrame(() => this.scrollToEnd("instant"));
        }
        this.syncScrollState();
    }
    updateItem(el, registration) {
        if (registration.messageId)
            this.items.set(registration.messageId, el);
        if (registration.scrollAnchor) {
            requestAnimationFrame(() => this.anchorItem(el));
        }
        else if (this.pinnedToBottom && this.autoScroll) {
            requestAnimationFrame(() => this.scrollToEnd("instant"));
        }
        this.syncScrollState();
    }
    unregisterItem(el, messageId) {
        this.itemElements.delete(el);
        if (messageId)
            this.items.delete(messageId);
        if (this.lastAnchorEl === el)
            this.lastAnchorEl = null;
        this.syncScrollState();
    }
    scrollToEnd(behavior = "smooth") {
        const viewport = this.viewport;
        if (!viewport)
            return;
        viewport.scrollTo({ top: viewport.scrollHeight, behavior });
        this.pinnedToBottom = true;
        requestAnimationFrame(() => this.syncScrollState());
    }
    scrollToStart(behavior = "smooth") {
        const viewport = this.viewport;
        if (!viewport)
            return;
        viewport.scrollTo({ top: 0, behavior });
        requestAnimationFrame(() => this.syncScrollState());
    }
    scrollToMessage(messageId, options = {}) {
        const el = this.items.get(messageId);
        if (!el || !this.viewport)
            return false;
        this.scrollElementIntoView(el, options.align ?? "start", options.behavior ?? "smooth");
        return true;
    }
    applyDefaultScrollPosition() {
        if (this.initialPositionApplied || !this.viewport)
            return;
        this.initialPositionApplied = true;
        switch (this.defaultScrollPosition) {
            case "start":
                this.scrollToStart("instant");
                break;
            case "last-anchor": {
                const anchors = [...this.itemElements].filter((el) => el.hasAttribute("data-scroll-anchor"));
                const last = anchors.at(-1);
                if (last)
                    this.anchorItem(last, "instant");
                else
                    this.scrollToEnd("instant");
                break;
            }
            default:
                this.scrollToEnd("instant");
        }
    }
    onContentResize() {
        if (this.pinnedToBottom && this.autoScroll) {
            this.scrollToEnd("instant");
        }
        this.syncScrollState();
    }
    anchorItem(el, behavior = "instant") {
        const viewport = this.viewport;
        if (!viewport)
            return;
        this.lastAnchorEl = el;
        const previous = this.getPreviousItem(el);
        const peek = previous ? this.scrollPreviousItemPeek : this.scrollMargin;
        const targetTop = Math.max(0, el.offsetTop - peek - this.scrollMargin);
        viewport.scrollTo({ top: targetTop, behavior });
        this.pinnedToBottom = this.isNearBottom();
        this.syncScrollState();
    }
    getPreviousItem(el) {
        const ordered = [...this.itemElements].sort((a, b) => {
            if (a === b)
                return 0;
            const position = a.compareDocumentPosition(b);
            if (position & Node.DOCUMENT_POSITION_FOLLOWING)
                return -1;
            if (position & Node.DOCUMENT_POSITION_PRECEDING)
                return 1;
            return 0;
        });
        const index = ordered.indexOf(el);
        return index > 0 ? ordered[index - 1] : null;
    }
    scrollElementIntoView(el, align, behavior) {
        const viewport = this.viewport;
        if (!viewport)
            return;
        const viewportRect = viewport.getBoundingClientRect();
        const elRect = el.getBoundingClientRect();
        const currentTop = viewport.scrollTop;
        const offset = elRect.top - viewportRect.top + currentTop;
        let targetTop = offset - this.scrollMargin;
        if (align === "center") {
            targetTop = offset - viewport.clientHeight / 2 + el.clientHeight / 2;
        }
        else if (align === "end") {
            targetTop = offset - viewport.clientHeight + el.clientHeight + this.scrollMargin;
        }
        viewport.scrollTo({
            top: Math.max(0, Math.min(targetTop, viewport.scrollHeight - viewport.clientHeight)),
            behavior,
        });
        requestAnimationFrame(() => this.syncScrollState());
    }
    syncScrollState() {
        const viewport = this.viewport;
        if (!viewport)
            return;
        const maxScroll = Math.max(0, viewport.scrollHeight - viewport.clientHeight);
        const top = viewport.scrollTop;
        this.pinnedToBottom = maxScroll <= BOTTOM_THRESHOLD || top >= maxScroll - BOTTOM_THRESHOLD;
        this.scrollableStart = top > BOTTOM_THRESHOLD;
        this.scrollableEnd = top < maxScroll - BOTTOM_THRESHOLD;
        this.scrollButtonActive = this.autoScroll
            ? !this.pinnedToBottom
            : this.scrollableEnd;
        viewport.dataset.autoscrolling = this.pinnedToBottom && this.autoScroll ? "true" : "false";
        viewport.dataset.scrollableStart = this.scrollableStart ? "true" : "false";
        viewport.dataset.scrollableEnd = this.scrollableEnd ? "true" : "false";
        for (const listener of this.listeners)
            listener();
    }
    isNearBottom() {
        const viewport = this.viewport;
        if (!viewport)
            return true;
        const maxScroll = viewport.scrollHeight - viewport.clientHeight;
        return maxScroll <= BOTTOM_THRESHOLD || viewport.scrollTop >= maxScroll - BOTTOM_THRESHOLD;
    }
}
const SCROLLER_REGISTRY = new WeakMap();
export function getChatScrollerController(host) {
    let controller = SCROLLER_REGISTRY.get(host);
    if (!controller) {
        controller = new ChatScrollerController();
        SCROLLER_REGISTRY.set(host, controller);
    }
    return controller;
}
export function findChatScrollerHost(el) {
    return el.closest("loomi-chat-scroller");
}
//# sourceMappingURL=chat-scroller-controller.js.map