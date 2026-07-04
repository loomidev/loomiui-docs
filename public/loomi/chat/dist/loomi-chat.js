var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { findChatScrollerHost, getChatScrollerController, } from "./chat-scroller-controller.js";
import { componentStyles } from "./generated/styles.css.js";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/**
 * `<loomi-chat-scroller>` — chat transcript scroller root. Owns scroll state for its
 * viewport, content, items, and scroll button children.
 */
let LoomiChatScroller = class LoomiChatScroller extends LoomiElement {
    constructor() {
        super(...arguments);
        this.controller = getChatScrollerController(this);
        this.autoScroll = false;
        this.defaultScrollPosition = "end";
        this.scrollPreviousItemPeek = 64;
        this.scrollMargin = 0;
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.syncController();
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("autoScroll") ||
            changed.has("defaultScrollPosition") ||
            changed.has("scrollPreviousItemPeek") ||
            changed.has("scrollMargin")) {
            this.syncController();
        }
    }
    syncController() {
        this.controller.configure({
            autoScroll: this.autoScroll,
            defaultScrollPosition: this.defaultScrollPosition,
            scrollPreviousItemPeek: this.scrollPreviousItemPeek,
            scrollMargin: this.scrollMargin,
        });
    }
    scrollToEnd(behavior = "smooth") {
        this.controller.scrollToEnd(behavior);
    }
    scrollToStart(behavior = "smooth") {
        this.controller.scrollToStart(behavior);
    }
    scrollToMessage(messageId, options) {
        return this.controller.scrollToMessage(messageId, options);
    }
    render() {
        return html `<div class="loomi-chat-scroller"><slot></slot></div>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "auto-scroll", converter: booleanAttribute })
], LoomiChatScroller.prototype, "autoScroll", void 0);
__decorate([
    property({ attribute: "default-scroll-position" })
], LoomiChatScroller.prototype, "defaultScrollPosition", void 0);
__decorate([
    property({ type: Number, attribute: "scroll-previous-item-peek" })
], LoomiChatScroller.prototype, "scrollPreviousItemPeek", void 0);
__decorate([
    property({ type: Number, attribute: "scroll-margin" })
], LoomiChatScroller.prototype, "scrollMargin", void 0);
LoomiChatScroller = __decorate([
    customElement("loomi-chat-scroller")
], LoomiChatScroller);
export { LoomiChatScroller };
/**
 * `<loomi-chat-viewport>` — scrollable transcript viewport. Place inside
 * `<loomi-chat-scroller>`.
 */
let LoomiChatViewport = class LoomiChatViewport extends LoomiElement {
    constructor() {
        super(...arguments);
        this.scrollerHost = null;
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute("role", "region");
        this.setAttribute("aria-label", "Messages");
        this.tabIndex = 0;
    }
    firstUpdated() {
        this.scrollerHost = findChatScrollerHost(this);
        if (!this.scrollerHost)
            return;
        const controller = getChatScrollerController(this.scrollerHost);
        controller.attachViewport(this);
        this.unsubscribe = controller.subscribe(() => this.requestUpdate());
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.();
        if (this.scrollerHost) {
            getChatScrollerController(this.scrollerHost).detachViewport();
            this.scrollerHost = null;
        }
    }
    render() {
        return html `<div class="loomi-chat-viewport"><slot></slot></div>`;
    }
};
LoomiChatViewport = __decorate([
    customElement("loomi-chat-viewport")
], LoomiChatViewport);
export { LoomiChatViewport };
/**
 * `<loomi-chat-content>` — transcript container with live-region defaults.
 */
let LoomiChatContent = class LoomiChatContent extends LoomiElement {
    constructor() {
        super(...arguments);
        this.transcriptBusy = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.setAttribute("role", "log");
        this.setAttribute("aria-relevant", "additions");
        this.setAttribute("aria-live", "polite");
    }
    firstUpdated() {
        const scroller = findChatScrollerHost(this);
        if (!scroller)
            return;
        getChatScrollerController(scroller).attachContent(this);
    }
    render() {
        return html `<div class="loomi-chat-content" aria-busy=${this.transcriptBusy ? "true" : "false"}>
      <slot></slot>
    </div>`;
    }
};
__decorate([
    property({ type: Boolean, attribute: "aria-busy", converter: booleanAttribute })
], LoomiChatContent.prototype, "transcriptBusy", void 0);
LoomiChatContent = __decorate([
    customElement("loomi-chat-content")
], LoomiChatContent);
export { LoomiChatContent };
/**
 * `<loomi-chat-item>` — transcript row boundary for anchoring and scroll tracking.
 */
let LoomiChatItem = class LoomiChatItem extends LoomiElement {
    constructor() {
        super(...arguments);
        this.messageId = "";
        this.scrollAnchor = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.toggleAttribute("data-scroll-anchor", this.scrollAnchor);
        this.register(true);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        const scroller = findChatScrollerHost(this);
        if (scroller) {
            getChatScrollerController(scroller).unregisterItem(this, this.messageId || undefined);
        }
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("scrollAnchor") || changed.has("messageId")) {
            this.toggleAttribute("data-scroll-anchor", this.scrollAnchor);
            this.register(false);
        }
    }
    register(isNew) {
        const scroller = findChatScrollerHost(this);
        if (!scroller)
            return;
        const registration = {
            messageId: this.messageId || undefined,
            scrollAnchor: this.scrollAnchor,
        };
        const controller = getChatScrollerController(scroller);
        if (isNew)
            controller.registerItem(this, registration);
        else
            controller.updateItem(this, registration);
    }
    render() {
        return html `<slot></slot>`;
    }
};
__decorate([
    property({ attribute: "message-id" })
], LoomiChatItem.prototype, "messageId", void 0);
__decorate([
    property({ type: Boolean, attribute: "scroll-anchor", converter: booleanAttribute })
], LoomiChatItem.prototype, "scrollAnchor", void 0);
LoomiChatItem = __decorate([
    customElement("loomi-chat-item")
], LoomiChatItem);
export { LoomiChatItem };
/**
 * `<loomi-chat-scroll-button>` — jump-to-latest control shown when the reader
 * scrolls away from the live edge.
 */
let LoomiChatScrollButton = class LoomiChatScrollButton extends LoomiElement {
    constructor() {
        super(...arguments);
        this.direction = "end";
        this.active = false;
        this.onClick = () => {
            const scroller = findChatScrollerHost(this);
            if (!scroller)
                return;
            const controller = getChatScrollerController(scroller);
            if (this.direction === "end")
                controller.scrollToEnd("smooth");
            else
                controller.scrollToStart("smooth");
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    firstUpdated() {
        const scroller = findChatScrollerHost(this);
        if (!scroller)
            return;
        const controller = getChatScrollerController(scroller);
        this.syncActive(controller);
        this.unsubscribe = controller.subscribe(() => this.syncActive(controller));
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.unsubscribe?.();
    }
    syncActive(controller) {
        const next = this.direction === "end"
            ? controller.isScrollButtonActive()
            : controller.getScrollable().start;
        if (next !== this.active) {
            this.active = next;
        }
    }
    render() {
        return html `<button
      type="button"
      class="loomi-chat-scroll-btn"
      data-active=${this.active ? "true" : "false"}
      data-direction=${this.direction}
      ?inert=${!this.active}
      tabindex=${this.active ? 0 : -1}
      aria-hidden=${this.active ? "false" : "true"}
      @click=${this.onClick}
    >
      <loomi-icon name=${this.direction === "end" ? "arrow-down" : "arrow-up"}></loomi-icon>
      <span class="sr-only">${this.direction === "end" ? "Scroll to end" : "Scroll to start"}</span>
    </button>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiChatScrollButton.prototype, "direction", void 0);
__decorate([
    state()
], LoomiChatScrollButton.prototype, "active", void 0);
LoomiChatScrollButton = __decorate([
    customElement("loomi-chat-scroll-button")
], LoomiChatScrollButton);
export { LoomiChatScrollButton };
/**
 * `<loomi-chat-message>` — a single chat bubble aligned for user or assistant turns.
 */
let LoomiChatMessage = class LoomiChatMessage extends LoomiElement {
    constructor() {
        super(...arguments);
        this.messageRole = "assistant";
        this.variant = "ghost";
        this.sender = "";
        this.text = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const align = this.messageRole === "user" ? "end" : "start";
        const resolvedVariant = this.variant ||
            (this.messageRole === "user"
                ? "muted"
                : "ghost");
        return html `<div class="loomi-chat-message align-${align}">
      ${this.sender && this.messageRole !== "user"
            ? html `<div class="loomi-chat-message-header">${this.sender}</div>`
            : nothing}
      <div class="loomi-chat-bubble variant-${resolvedVariant}">
        <slot>${this.text}</slot>
      </div>
    </div>`;
    }
};
__decorate([
    property({ reflect: true, attribute: "message-role" })
], LoomiChatMessage.prototype, "messageRole", void 0);
__decorate([
    property({ reflect: true })
], LoomiChatMessage.prototype, "variant", void 0);
__decorate([
    property()
], LoomiChatMessage.prototype, "sender", void 0);
__decorate([
    property()
], LoomiChatMessage.prototype, "text", void 0);
LoomiChatMessage = __decorate([
    customElement("loomi-chat-message")
], LoomiChatMessage);
export { LoomiChatMessage };
//# sourceMappingURL=loomi-chat.js.map