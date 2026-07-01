var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LoomiElement, loomiStyles } from "@loomidev/core";
import { getLoomiIcon } from "@loomidev/icons";
import { componentStyles } from "./generated/styles.css.js";
const FEEDBACK_MS = 1600;
/**
 * `<loomi-copy-to-clipboard>` — wraps text/content and appends a copy button.
 *
 * @slot - Text or one element whose text content should be copied.
 * @fires copied - `detail: { value }` after text is copied.
 * @fires copy-error - `detail: { value, error }` when clipboard write fails.
 */
let LoomiCopyToClipboard = class LoomiCopyToClipboard extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Explicit clipboard value. When blank, the component copies slotted text content. */
        this.value = "";
        /** Accessible label for the icon button. */
        this.copyLabel = "Copy to clipboard";
        /** Message shown briefly after a successful copy. */
        this.copiedLabel = "Copied";
        /** Disable the copy button. */
        this.disabled = false;
        this.status = "idle";
        this.feedbackTimer = 0;
    }
    static { this.styles = loomiStyles(componentStyles); }
    disconnectedCallback() {
        window.clearTimeout(this.feedbackTimer);
        super.disconnectedCallback();
    }
    get clipboardValue() {
        if (this.value)
            return this.value;
        const assignedNodes = this.defaultSlot?.assignedNodes({ flatten: true }) ?? [];
        return assignedNodes
            .map((node) => node.textContent ?? "")
            .join("")
            .trim();
    }
    get isCopied() {
        return this.status === "copied";
    }
    setTemporaryStatus(status) {
        window.clearTimeout(this.feedbackTimer);
        this.status = status;
        if (status === "idle")
            return;
        this.feedbackTimer = window.setTimeout(() => {
            this.status = "idle";
        }, FEEDBACK_MS);
    }
    async writeToClipboard(value) {
        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(value);
            return;
        }
        const textarea = document.createElement("textarea");
        textarea.value = value;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "fixed";
        textarea.style.inset = "0 auto auto 0";
        textarea.style.opacity = "0";
        document.body.append(textarea);
        textarea.select();
        try {
            if (!document.execCommand("copy")) {
                throw new Error("Copy command was not accepted.");
            }
        }
        finally {
            textarea.remove();
        }
    }
    async copy() {
        if (this.disabled)
            return;
        const value = this.clipboardValue;
        if (!value)
            return;
        try {
            await this.writeToClipboard(value);
            this.setTemporaryStatus("copied");
            this.dispatchEvent(new CustomEvent("copied", {
                detail: { value },
                bubbles: true,
                composed: true,
            }));
        }
        catch (error) {
            this.setTemporaryStatus("error");
            this.dispatchEvent(new CustomEvent("copy-error", {
                detail: { value, error },
                bubbles: true,
                composed: true,
            }));
        }
    }
    renderIcon() {
        const iconName = this.isCopied ? "check" : "clipboard";
        const path = getLoomiIcon(iconName);
        if (!path)
            return nothing;
        return html `<svg
      class="loomi-copy-icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.6"
      aria-hidden="true"
    >
      ${path}
    </svg>`;
    }
    render() {
        return html `
      <span class="loomi-copy-content"><slot></slot></span>
      <button
        class="loomi-copy-button ${this.status}"
        type="button"
        aria-label=${this.isCopied ? this.copiedLabel : this.copyLabel}
        ?disabled=${this.disabled}
        @click=${this.copy}
      >
        ${this.renderIcon()}
      </button>
      <span class="loomi-copy-feedback ${this.status}" aria-live="polite">
        ${this.isCopied ? this.copiedLabel : ""}
      </span>
    `;
    }
};
__decorate([
    property()
], LoomiCopyToClipboard.prototype, "value", void 0);
__decorate([
    property({ attribute: "copy-label" })
], LoomiCopyToClipboard.prototype, "copyLabel", void 0);
__decorate([
    property({ attribute: "copied-label" })
], LoomiCopyToClipboard.prototype, "copiedLabel", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiCopyToClipboard.prototype, "disabled", void 0);
__decorate([
    state()
], LoomiCopyToClipboard.prototype, "status", void 0);
__decorate([
    query("slot")
], LoomiCopyToClipboard.prototype, "defaultSlot", void 0);
LoomiCopyToClipboard = __decorate([
    customElement("loomi-copy-to-clipboard")
], LoomiCopyToClipboard);
export { LoomiCopyToClipboard };
//# sourceMappingURL=loomi-copy-to-clipboard.js.map