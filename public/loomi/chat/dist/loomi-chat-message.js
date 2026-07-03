var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import "@loomidev/avatar/loomi-avatar.js";
import { bubbleVars, colorForParticipant, initialsFor, } from "./chat-utils.js";
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
 * `<loomi-chat-message>` — a chat bubble with optional avatar, sender label, and tail.
 */
let LoomiChatMessage = class LoomiChatMessage extends LoomiElement {
    constructor() {
        super(...arguments);
        this.text = "";
        this.sender = "";
        this.time = "";
        this.senderId = "";
        this.image = "";
        this.avatarLabel = "";
        this.bubbleColor = "";
        this.outgoing = false;
        this.showAvatar = false;
        this.showSender = false;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const color = this.bubbleColor || colorForParticipant(this.senderId || this.sender || "guest");
        const tail = this.outgoing ? "tail-end" : "tail-start";
        const label = this.avatarLabel || initialsFor(this.sender || this.senderId || "?");
        return html `<div class="loomi-chat-row ${this.outgoing ? "outgoing" : "incoming"}">
      ${this.showAvatar && !this.outgoing
            ? html `<loomi-avatar
            class="loomi-chat-row-avatar"
            size="small"
            image=${this.image}
            label=${label}
            alt=${this.sender || label}
            bg-color=${color}
          ></loomi-avatar>`
            : nothing}
      <div class="loomi-chat-row-body">
        ${this.showSender && this.sender
            ? html `<div class="loomi-chat-sender">${this.sender}</div>`
            : nothing}
        <div class="loomi-chat-bubble ${tail}" style=${bubbleVars(color)}>
          <slot>${this.text}</slot>
        </div>
        ${this.time ? html `<div class="loomi-chat-time">${this.time}</div>` : nothing}
      </div>
      ${this.showAvatar && this.outgoing
            ? html `<loomi-avatar
            class="loomi-chat-row-avatar"
            size="small"
            image=${this.image}
            label=${label}
            alt=${this.sender || label}
            bg-color=${color}
          ></loomi-avatar>`
            : nothing}
    </div>`;
    }
};
__decorate([
    property()
], LoomiChatMessage.prototype, "text", void 0);
__decorate([
    property()
], LoomiChatMessage.prototype, "sender", void 0);
__decorate([
    property()
], LoomiChatMessage.prototype, "time", void 0);
__decorate([
    property({ attribute: "sender-id" })
], LoomiChatMessage.prototype, "senderId", void 0);
__decorate([
    property()
], LoomiChatMessage.prototype, "image", void 0);
__decorate([
    property({ attribute: "avatar-label" })
], LoomiChatMessage.prototype, "avatarLabel", void 0);
__decorate([
    property({ attribute: "bubble-color" })
], LoomiChatMessage.prototype, "bubbleColor", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiChatMessage.prototype, "outgoing", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-avatar", converter: booleanAttribute })
], LoomiChatMessage.prototype, "showAvatar", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-sender", converter: booleanAttribute })
], LoomiChatMessage.prototype, "showSender", void 0);
LoomiChatMessage = __decorate([
    customElement("loomi-chat-message")
], LoomiChatMessage);
export { LoomiChatMessage };
//# sourceMappingURL=loomi-chat-message.js.map