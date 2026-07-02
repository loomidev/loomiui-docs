var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import "@loomidev/button/loomi-button.js";
import "@loomidev/icon/loomi-icon.js";
import "@loomidev/spinner/loomi-spinner.js";
import "@loomidev/textarea/loomi-textarea.js";
import "@loomidev/tooltip/loomi-tooltip.js";
import "./loomi-chat.js";
import { componentStyles } from "./generated/styles.css.js";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
let messageUid = 0;
function createMessageId() {
    messageUid += 1;
    return `loomi-chat-${messageUid}`;
}
/**
 * `<loomi-chat-window>` — a chat card with message scroller, empty state, reset
 * control, and composer footer.
 *
 * @fires send - `detail: { message: LoomiChatWindowMessage }` when the user sends.
 * @fires reset - when the conversation is reset.
 */
let LoomiChatWindow = class LoomiChatWindow extends LoomiElement {
    constructor() {
        super(...arguments);
        this.title = "New Chat";
        this.description = "How can I help you today?";
        this.emptyTitle = "Morning!";
        this.emptyDescription = "What are we working on today? Press send to start a new conversation.";
        this.inputPlaceholder = "Message…";
        this.footerNote = "";
        this.windowHeight = "35rem";
        this.busy = false;
        this.autoScroll = true;
        this.showReset = true;
        this.readOnly = false;
        this.messages = [];
        this.draft = "";
        this.onDraftInput = (event) => {
            const target = event.target;
            this.draft = target.value;
        };
        this.onSubmit = (event) => {
            event?.preventDefault();
            const text = this.draft.trim();
            if (!text || this.busy || this.readOnly)
                return;
            const message = this.appendMessage({ role: "user", text });
            this.draft = "";
            if (this.textareaEl)
                this.textareaEl.value = "";
            this.dispatchEvent(new CustomEvent("send", {
                bubbles: true,
                composed: true,
                detail: { message },
            }));
        };
        this.onReset = () => {
            if (this.busy)
                return;
            this.reset();
        };
        this.onComposerKeydown = (event) => {
            if (event.key !== "Enter" || event.shiftKey || event.isComposing)
                return;
            event.preventDefault();
            this.onSubmit();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.style.setProperty("--loomi-chat-window-height", this.windowHeight);
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("windowHeight")) {
            this.style.setProperty("--loomi-chat-window-height", this.windowHeight);
        }
    }
    /** Append a message to the transcript. */
    appendMessage(message) {
        const next = {
            id: message.id ?? createMessageId(),
            role: message.role,
            text: message.text,
            sender: message.sender,
        };
        this.messages = [...this.messages, next];
        return next;
    }
    /** Replace the text of an existing message (for streaming). */
    updateMessageText(id, text) {
        this.messages = this.messages.map((message) => message.id === id ? { ...message, text } : message);
    }
    /** Clear the transcript and composer. */
    reset() {
        this.messages = [];
        this.draft = "";
        this.dispatchEvent(new CustomEvent("reset", { bubbles: true, composed: true }));
    }
    renderMessages() {
        return html `${this.messages.map((message) => html `<loomi-chat-item
        message-id=${message.id}
        ?scroll-anchor=${message.role === "user"}
      >
        <loomi-chat-message
          message-role=${message.role}
          .variant=${message.role === "user" ? "muted" : "ghost"}
          sender=${message.sender ?? ""}
          text=${message.text}
        ></loomi-chat-message>
      </loomi-chat-item>`)}`;
    }
    renderEmptyState() {
        return html `<div class="loomi-chat-empty">
      <loomi-icon
        name="chat-bubble-left-ellipsis"
        class="loomi-chat-empty-icon"
      ></loomi-icon>
      <div class="loomi-chat-empty-title">${this.emptyTitle}</div>
      <div class="loomi-chat-empty-copy">${this.emptyDescription}</div>
    </div>`;
    }
    render() {
        const hasMessages = this.messages.length > 0;
        return html `<div class="loomi-chat-window">
      <div class="loomi-chat-card-wrap">
        <div class="loomi-chat-shell">
          <header class="loomi-chat-header">
            <div class="loomi-chat-header-copy">
              <div class="loomi-chat-title">${this.title}</div>
              <div class="loomi-chat-description">${this.description}</div>
            </div>
            ${this.showReset
            ? html `<loomi-tooltip content="Reset">
                  <loomi-button
                    class="loomi-chat-reset-btn"
                    type="secondary"
                    size="small"
                    radius="medium"
                    aria-label="Reset conversation"
                    ?disabled=${this.busy || !hasMessages}
                    @click=${this.onReset}
                  >
                    <loomi-icon name="arrow-path" slot="prefix"></loomi-icon>
                  </loomi-button>
                </loomi-tooltip>`
            : nothing}
          </header>

          <div class="loomi-chat-body">
            ${hasMessages
            ? html `<loomi-chat-scroller
                  ?auto-scroll=${this.autoScroll}
                  default-scroll-position="end"
                  scroll-previous-item-peek="64"
                >
                  <loomi-chat-viewport>
                    <loomi-chat-content ?transcript-busy=${this.busy}>
                      ${this.renderMessages()}
                    </loomi-chat-content>
                  </loomi-chat-viewport>
                  <loomi-chat-scroll-button direction="end"></loomi-chat-scroll-button>
                </loomi-chat-scroller>`
            : this.renderEmptyState()}
          </div>

          <footer class="loomi-chat-composer">
            <form class="loomi-chat-input-wrap" @submit=${this.onSubmit}>
              <div class="loomi-chat-input-group">
                <div class="loomi-chat-input-body">
                  <loomi-textarea
                    .value=${this.draft}
                    placeholder=${this.inputPlaceholder}
                    rows="2"
                    ?disabled=${this.busy || this.readOnly}
                    @input=${this.onDraftInput}
                    @keydown=${this.onComposerKeydown}
                  ></loomi-textarea>
                </div>
                <div class="loomi-chat-input-actions">
                  ${this.busy
            ? html `<loomi-spinner type="dot" size="small" color="gray"></loomi-spinner>`
            : nothing}
                  <loomi-button
                    type="primary"
                    size="small"
                    radius="full"
                    aria-label="Send message"
                    ?disabled=${!this.draft.trim() || this.busy || this.readOnly}
                    @click=${this.onSubmit}
                  >
                    <loomi-icon name="arrow-up" slot="prefix"></loomi-icon>
                  </loomi-button>
                </div>
              </div>
            </form>
          </footer>
        </div>
      </div>
      ${this.footerNote
            ? html `<div class="loomi-chat-footer-note">${this.footerNote}</div>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiChatWindow.prototype, "title", void 0);
__decorate([
    property()
], LoomiChatWindow.prototype, "description", void 0);
__decorate([
    property({ attribute: "empty-title" })
], LoomiChatWindow.prototype, "emptyTitle", void 0);
__decorate([
    property({ attribute: "empty-description" })
], LoomiChatWindow.prototype, "emptyDescription", void 0);
__decorate([
    property({ attribute: "input-placeholder" })
], LoomiChatWindow.prototype, "inputPlaceholder", void 0);
__decorate([
    property({ attribute: "footer-note" })
], LoomiChatWindow.prototype, "footerNote", void 0);
__decorate([
    property({ attribute: "window-height" })
], LoomiChatWindow.prototype, "windowHeight", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiChatWindow.prototype, "busy", void 0);
__decorate([
    property({ type: Boolean, attribute: "auto-scroll", converter: booleanAttribute })
], LoomiChatWindow.prototype, "autoScroll", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-reset", converter: booleanAttribute })
], LoomiChatWindow.prototype, "showReset", void 0);
__decorate([
    property({ type: Boolean, attribute: "read-only", converter: booleanAttribute })
], LoomiChatWindow.prototype, "readOnly", void 0);
__decorate([
    property({ type: Array })
], LoomiChatWindow.prototype, "messages", void 0);
__decorate([
    state()
], LoomiChatWindow.prototype, "draft", void 0);
__decorate([
    query("loomi-textarea")
], LoomiChatWindow.prototype, "textareaEl", void 0);
LoomiChatWindow = __decorate([
    customElement("loomi-chat-window")
], LoomiChatWindow);
export { LoomiChatWindow };
//# sourceMappingURL=loomi-chat-window.js.map