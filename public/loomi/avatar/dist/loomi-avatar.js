var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars, cssColor } from "@loomidev/core";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-avatar>` — a rounded image or initials avatar with optional status dot.
 * Wrap several in `<loomi-avatars>` to stack them.
 */
let LoomiAvatar = class LoomiAvatar extends LoomiElement {
    constructor() {
        super(...arguments);
        this.image = "";
        this.alt = "avatar";
        this.label = "";
        this.size = "regular";
        this.dotted = false;
        this.dotColor = "green";
        this.dotPosition = "bottom";
        this.bgColor = "gray";
        this.showRing = true;
    }
    static { this.styles = loomiStyles(componentStyles); }
    render() {
        const useImage = this.image && this.image.length > 3;
        const inner = useImage
            ? html `<img src=${this.image} alt=${this.alt} />`
            : html `<span class="loomi-label">${this.label || this.image || "?"}</span>`;
        return html `<span
      class="loomi-av size-${this.size} ${this.showRing ? "ring" : ""}"
      style=${accentVars(this.bgColor)}
    >
      ${inner}
      ${this.dotted
            ? html `<span class="loomi-dot ${this.dotPosition}" style="background:${cssColor(this.dotColor, 500)}"></span>`
            : nothing}
    </span>`;
    }
};
__decorate([
    property()
], LoomiAvatar.prototype, "image", void 0);
__decorate([
    property()
], LoomiAvatar.prototype, "alt", void 0);
__decorate([
    property()
], LoomiAvatar.prototype, "label", void 0);
__decorate([
    property({ reflect: true })
], LoomiAvatar.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], LoomiAvatar.prototype, "dotted", void 0);
__decorate([
    property({ attribute: "dot-color" })
], LoomiAvatar.prototype, "dotColor", void 0);
__decorate([
    property({ attribute: "dot-position" })
], LoomiAvatar.prototype, "dotPosition", void 0);
__decorate([
    property({ attribute: "bg-color" })
], LoomiAvatar.prototype, "bgColor", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-ring" })
], LoomiAvatar.prototype, "showRing", void 0);
LoomiAvatar = __decorate([
    customElement("loomi-avatar")
], LoomiAvatar);
export { LoomiAvatar };
/**
 * `<loomi-avatars>` — a group/stack of `<loomi-avatar>` children, with an optional
 * "+N" bubble.
 *
 * @slot - `<loomi-avatar>` children.
 */
let LoomiAvatars = class LoomiAvatars extends LoomiElement {
    constructor() {
        super(...arguments);
        this.stacked = false;
        this.dotted = false;
        this.dotColor = "green";
        this.dotPosition = "bottom";
        this.plus = 0;
        this.size = "regular";
        this.syncChildren = () => {
            if (this.plus > 0)
                this.stacked = true;
            const hasGroupDotColor = this.hasAttribute("dot-color") || this.dotColor !== "green";
            const hasGroupDotPosition = this.hasAttribute("dot-position") || this.dotPosition !== "bottom";
            this.querySelectorAll("loomi-avatar").forEach((avatar) => {
                avatar.setAttribute("size", this.size);
                if (this.dotted)
                    avatar.setAttribute("dotted", "");
                if (hasGroupDotColor && !avatar.hasAttribute("dot-color")) {
                    avatar.setAttribute("dot-color", this.dotColor);
                }
                if (hasGroupDotPosition && !avatar.hasAttribute("dot-position")) {
                    avatar.setAttribute("dot-position", this.dotPosition);
                }
            });
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        this.syncChildren();
    }
    updated() {
        this.syncChildren();
    }
    render() {
        return html `<span class="loomi-row size-${this.size}">
      <slot @slotchange=${this.syncChildren}></slot>
      ${this.plus > 0
            ? html `<span class="loomi-plus" part="plus">+${this.plus}</span>`
            : nothing}
    </span>`;
    }
};
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAvatars.prototype, "stacked", void 0);
__decorate([
    property({ type: Boolean })
], LoomiAvatars.prototype, "dotted", void 0);
__decorate([
    property({ attribute: "dot-color" })
], LoomiAvatars.prototype, "dotColor", void 0);
__decorate([
    property({ attribute: "dot-position" })
], LoomiAvatars.prototype, "dotPosition", void 0);
__decorate([
    property({ type: Number })
], LoomiAvatars.prototype, "plus", void 0);
__decorate([
    property({ reflect: true })
], LoomiAvatars.prototype, "size", void 0);
LoomiAvatars = __decorate([
    customElement("loomi-avatars")
], LoomiAvatars);
export { LoomiAvatars };
//# sourceMappingURL=loomi-avatar.js.map