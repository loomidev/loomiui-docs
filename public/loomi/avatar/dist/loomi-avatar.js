var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, accentVars, cssColor } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
/**
 * `<loomi-avatar>` — a rounded image or initials avatar with optional status dot.
 * Wrap several in `<loomi-avatars>` to stack them.
 *
 * Set `editable` to let users replace the image themselves: clicking (or
 * Enter/Space-ing) the avatar launches a crop dialog and swaps in the result. See the
 * README for how to persist the picked file.
 *
 * @fires change - Fired after a new image is picked via `editable`. `detail: { file, image }`.
 */
let LoomiAvatar = class LoomiAvatar extends LoomiElement {
    constructor() {
        super(...arguments);
        this.image = "";
        this.alt = "avatar";
        this.label = "";
        this.size = "regular";
        this.dotted = false;
        this.pulseDot = false;
        this.dotColor = "success";
        this.dotPosition = "bottom";
        this.bgColor = "gray";
        this.showRing = true;
        this.verified = false;
        this.editable = false;
        this.editLabel = "Edit avatar";
        // `<loomi-filepicker>` is a much heavier dependency (it pulls in @loomidev/modal and
        // @loomidev/notification) than the rest of this component needs, so it's only loaded
        // — via dynamic import, matching other optional-heavy integrations — once `editable`
        // is actually set, instead of bundled unconditionally for every avatar.
        this.filepickerReady = false;
        this.filepickerLoading = false;
        this.imageObjectUrl = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.imageObjectUrl)
            URL.revokeObjectURL(this.imageObjectUrl);
    }
    willUpdate(changed) {
        if (changed.has("editable") && this.editable && !this.filepickerReady && !this.filepickerLoading) {
            this.filepickerLoading = true;
            import("@loomidev/filepicker/loomi-filepicker.js").then(() => {
                this.filepickerReady = true;
            });
        }
    }
    openEditor() {
        if (!this.editable)
            return;
        this.filepickerEl?.clear();
        this.filepickerEl?.open();
    }
    onEditKeydown(e) {
        if (e.key !== "Enter" && e.key !== " ")
            return;
        e.preventDefault();
        this.openEditor();
    }
    onFilepickerChange(e) {
        // The internal filepicker is an implementation detail — its own `change` event
        // (composed, so it would otherwise cross out of this shadow root) is swallowed here
        // in favor of this component's own `change` event, dispatched below.
        e.stopPropagation();
        const file = e.detail.files[0];
        if (!file)
            return;
        if (this.imageObjectUrl)
            URL.revokeObjectURL(this.imageObjectUrl);
        this.imageObjectUrl = URL.createObjectURL(file);
        this.image = this.imageObjectUrl;
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { file, image: this.imageObjectUrl } }));
    }
    render() {
        const useImage = this.image && this.image.length > 3;
        const inner = useImage
            ? html `<img src=${this.image} alt=${this.alt} />`
            : html `<span class="loomi-label">${this.label || this.image || "?"}</span>`;
        return html `<span
      class="loomi-av size-${this.size} ${this.showRing ? "ring" : ""} ${this.editable ? "editable" : ""}"
      style=${accentVars(this.bgColor)}
      role=${this.editable ? "button" : nothing}
      tabindex=${this.editable ? "0" : nothing}
      aria-label=${this.editable ? this.editLabel : nothing}
      @click=${this.editable ? this.openEditor : nothing}
      @keydown=${this.editable ? this.onEditKeydown : nothing}
    >
      ${inner}
      ${this.dotted
            ? html `<span
            class="loomi-dot ${this.dotPosition} ${this.pulseDot ? "pulse" : ""}"
            style=${`background:${cssColor(this.dotColor, 500)};--loomi-dot-pulse:${cssColor(this.dotColor, 400)}`}
          ></span>`
            : nothing}
      ${this.verified
            ? html `<span class="loomi-verified" part="verified">
            <loomi-icon name="check-badge" variant="solid"></loomi-icon>
          </span>`
            : nothing}
      ${this.editable
            ? html `<span class="loomi-edit-overlay" part="edit-overlay">
            <loomi-icon name="camera" variant="solid"></loomi-icon>
          </span>`
            : nothing}
    </span>
    ${this.editable && this.filepickerReady
            ? html `<loomi-filepicker
          class="loomi-edit-fp"
          stealth
          crop
          crop-aspect-ratio="1:1"
          accepted-file-types="image/*"
          @change=${(e) => this.onFilepickerChange(e)}
        ></loomi-filepicker>`
            : nothing}`;
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
    property({ type: Boolean, attribute: "pulse-dot" })
], LoomiAvatar.prototype, "pulseDot", void 0);
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
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAvatar.prototype, "verified", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiAvatar.prototype, "editable", void 0);
__decorate([
    property({ attribute: "edit-label" })
], LoomiAvatar.prototype, "editLabel", void 0);
__decorate([
    state()
], LoomiAvatar.prototype, "filepickerReady", void 0);
__decorate([
    state()
], LoomiAvatar.prototype, "imageObjectUrl", void 0);
__decorate([
    query(".loomi-edit-fp")
], LoomiAvatar.prototype, "filepickerEl", void 0);
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
        this.pulseDot = false;
        this.dotColor = "success";
        this.dotPosition = "bottom";
        this.plus = 0;
        this.size = "regular";
        this.stackSpace = "";
        this.syncChildren = () => {
            if (this.plus > 0)
                this.stacked = true;
            if (this.stackSpace)
                this.style.setProperty("--loomi-av-stack-offset", this.stackSpace);
            else
                this.style.removeProperty("--loomi-av-stack-offset");
            const hasGroupDotColor = this.hasAttribute("dot-color") || this.dotColor !== "success";
            const hasGroupDotPosition = this.hasAttribute("dot-position") || this.dotPosition !== "bottom";
            this.querySelectorAll("loomi-avatar").forEach((avatar) => {
                avatar.setAttribute("size", this.size);
                if (this.dotted)
                    avatar.setAttribute("dotted", "");
                if (this.pulseDot)
                    avatar.setAttribute("pulse-dot", "");
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
    property({ type: Boolean, attribute: "pulse-dot" })
], LoomiAvatars.prototype, "pulseDot", void 0);
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
__decorate([
    property({ attribute: "stack-space" })
], LoomiAvatars.prototype, "stackSpace", void 0);
LoomiAvatars = __decorate([
    customElement("loomi-avatars")
], LoomiAvatars);
export { LoomiAvatars };
//# sourceMappingURL=loomi-avatar.js.map