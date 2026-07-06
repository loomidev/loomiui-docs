var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT } from "@loomidev/core";
import "@loomidev/filepicker/loomi-filepicker.js";
import "@loomidev/icon/loomi-icon.js";
import "@loomidev/input/loomi-input.js";
import "@loomidev/modal/loomi-modal.js";
import "@loomidev/select/loomi-select.js";
import "@loomidev/tooltip/loomi-tooltip.js";
import { componentStyles } from "./generated/styles.css.js";
const TOOL_ORDER = [
    "heading",
    "font-family",
    "font-size",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "font-color",
    "highlight-color",
    "bullet-list",
    "ordered-list",
    "align-left",
    "align-center",
    "align-right",
    "align-justify",
    "inline-code",
    "superscript",
    "subscript",
    "blockquote",
    "code-block",
    "link",
    "image",
    "video",
    "ai",
];
const TOOL_SET = new Set(TOOL_ORDER);
const TOOL_ALIASES = {
    h1: "heading",
    h2: "heading",
    h3: "heading",
    h4: "heading",
    h5: "heading",
    h6: "heading",
    headings: "heading",
    header: "heading",
    headers: "heading",
    fonts: "font",
    family: "font-family",
    size: "font-size",
    color: "font-color",
    colours: "colors",
    colour: "font-color",
    "text-color": "font-color",
    highlight: "highlight-color",
    "background-color": "highlight-color",
    "font-colour": "font-color",
    "highlight-colour": "highlight-color",
    italics: "italic",
    strike: "strikethrough",
    "strike-through": "strikethrough",
    "bullet": "bullet-list",
    bullets: "lists",
    "dot-list": "bullet-list",
    dots: "bullet-list",
    "number-list": "ordered-list",
    "numbered-list": "ordered-list",
    numbers: "ordered-list",
    "ordered": "ordered-list",
    "unordered-list": "bullet-list",
    "text-alignments": "align",
    alignment: "align",
    alignments: "align",
    left: "align-left",
    center: "align-center",
    centre: "align-center",
    "align-centre": "align-center",
    right: "align-right",
    justify: "align-justify",
    code: "code-tools",
    "code-inline": "inline-code",
    "inlinecode": "inline-code",
    quote: "blockquote",
    embeds: "embed",
    media: "media",
    "ai-generate": "ai",
    generate: "ai",
    full: "all",
};
const TOOL_GROUPS = {
    none: [],
    default: ["basic", "heading", "lists", "align", "embed"],
    basic: ["bold", "italic", "underline", "strikethrough"],
    marks: ["bold", "italic", "underline", "strikethrough", "inline-code", "superscript", "subscript"],
    colors: ["font-color", "highlight-color"],
    colour: ["font-color", "highlight-color"],
    font: ["font-family", "font-size"],
    typography: ["heading", "font-family", "font-size", "font-color", "highlight-color"],
    lists: ["bullet-list", "ordered-list"],
    align: ["align-left", "align-center", "align-right", "align-justify"],
    script: ["superscript", "subscript"],
    "code-tools": ["inline-code", "code-block"],
    blocks: ["blockquote", "code-block"],
    embed: ["link", "image", "video"],
    media: ["image", "video"],
    all: ["typography", "basic", "lists", "align", "script", "blocks", "embed", "ai"],
};
const ACTIVE_COMMANDS = {
    bold: "bold",
    italic: "italic",
    underline: "underline",
    strikethrough: "strikeThrough",
    "bullet-list": "insertUnorderedList",
    "ordered-list": "insertOrderedList",
    superscript: "superscript",
    subscript: "subscript",
};
const TOOL_LABELS = {
    heading: "Heading",
    "font-family": "Font family",
    "font-size": "Font size",
    bold: "Bold",
    italic: "Italic",
    underline: "Underline",
    strikethrough: "Strikethrough",
    "font-color": "Font color",
    "highlight-color": "Highlight color",
    "bullet-list": "Bullet list",
    "ordered-list": "Numbered list",
    "align-left": "Align left",
    "align-center": "Align center",
    "align-right": "Align right",
    "align-justify": "Justify",
    "inline-code": "Inline code",
    superscript: "Superscript",
    subscript: "Subscript",
    blockquote: "Blockquote",
    "code-block": "Code block",
    link: "Link",
    image: "Image",
    video: "Video",
    ai: "AI generate",
};
const TOOL_ICONS = {
    heading: { name: "heading-01", source: "untitledui" },
    bold: { name: "bold-01", source: "untitledui" },
    italic: { name: "italic-01", source: "untitledui" },
    underline: { name: "underline-01", source: "untitledui" },
    strikethrough: { name: "strikethrough-01", source: "untitledui" },
    "font-color": { name: "type-01", source: "untitledui" },
    "highlight-color": { name: "paint-brush" },
    "bullet-list": { name: "list-bullet" },
    "ordered-list": { name: "numbered-list" },
    "align-left": { name: "align-left", source: "untitledui" },
    "align-center": { name: "align-center", source: "untitledui" },
    "align-right": { name: "align-right", source: "untitledui" },
    "align-justify": { name: "align-justify", source: "untitledui" },
    "inline-code": { name: "code-bracket" },
    blockquote: { name: "quote-down", source: "iconsax" },
    "code-block": { name: "code-bracket-square" },
    link: { name: "link" },
    image: { name: "photo" },
    video: { name: "video-camera" },
    ai: { name: "sparkles" },
};
const FONT_FAMILIES = [
    { label: "Sans", value: "ui-sans-serif, system-ui, sans-serif" },
    { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
    { label: "Mono", value: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace" },
];
const FONT_SIZES = [
    { label: "Small", value: "2" },
    { label: "Normal", value: "3" },
    { label: "Large", value: "5" },
    { label: "Huge", value: "7" },
];
const HEADING_OPTIONS = [
    { label: "Body", value: "p" },
    { label: "H1", value: "h1" },
    { label: "H2", value: "h2" },
    { label: "H3", value: "h3" },
    { label: "H4", value: "h4" },
    { label: "H5", value: "h5" },
    { label: "H6", value: "h6" },
];
function normalizeToken(value) {
    return value.trim().toLowerCase().replace(/[\s_]+/g, "-");
}
function normalizeEditorHtml(value) {
    return value.trim() === "<br>" ? "" : value;
}
function stripTags(value) {
    return value.replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<script[\s\S]*?<\/script>/gi, "").replace(/<[^>]*>/g, "");
}
function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => {
        if (char === "&")
            return "&amp;";
        if (char === "<")
            return "&lt;";
        if (char === ">")
            return "&gt;";
        if (char === '"')
            return "&quot;";
        return "&#39;";
    });
}
function safeUrl(value, protocols = ["http:", "https:"]) {
    const trimmed = value.trim();
    if (!trimmed)
        return "";
    if (/^(\/|\.\/|\.\.\/)/.test(trimmed))
        return trimmed;
    try {
        const url = new URL(/^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`);
        return protocols.includes(url.protocol) ? url.href : "";
    }
    catch {
        return "";
    }
}
function videoEmbedUrl(value) {
    const url = safeUrl(value);
    if (!url)
        return "";
    try {
        const parsed = new URL(url, window.location.href);
        if (parsed.hostname.includes("youtube.com")) {
            const id = parsed.searchParams.get("v");
            return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : url;
        }
        if (parsed.hostname === "youtu.be") {
            const id = parsed.pathname.replace(/^\/+/, "");
            return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : url;
        }
        if (parsed.hostname.includes("vimeo.com")) {
            const id = parsed.pathname.split("/").filter(Boolean)[0];
            return id ? `https://player.vimeo.com/video/${encodeURIComponent(id)}` : url;
        }
    }
    catch {
        return url;
    }
    return url;
}
function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error ?? new Error("Unable to read file"));
        reader.readAsDataURL(file);
    });
}
/**
 * `<loomi-text-editor>` - a themeable rich-text editor with a native
 * contenteditable surface, configurable toolbar groups, floating label, inline
 * validation, and HTML form submission.
 *
 * @csspart field - The bordered container.
 * @csspart toolbar - The toolbar container.
 * @csspart editor - The editable surface.
 * @fires input - Native input event (composed).
 * @fires change - Native change event (composed).
 */
let LoomiTextEditor = class LoomiTextEditor extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.valueSetFromEditor = false;
        this.savedRange = null;
        this.embedFiles = [];
        this.onSelectionChange = () => this.updateToolbarState();
        this.name = "";
        this.label = "";
        this.locale = "";
        this.placeholder = "";
        this.value = "";
        this.tools = "default";
        this.rows = 3;
        this.required = false;
        this.disabled = false;
        this.readonly = false;
        this.errorMessage = "";
        this.showErrorInline = false;
        this.invalid = false;
        this.variant = "default";
        this.activeTools = [];
        this.currentBlock = "p";
        this.embedTool = "";
        this.embedUrl = "";
        this.embedText = "";
        this.embedAlt = "";
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    get resolvedTools() {
        const rawTools = Array.isArray(this.tools)
            ? this.tools.map(String)
            : String(this.tools)
                .split(",")
                .map((tool) => tool.trim())
                .filter(Boolean);
        const tokens = rawTools.length ? rawTools : ["none"];
        const expanded = new Set();
        const expand = (token, seen = new Set()) => {
            const normalized = TOOL_ALIASES[normalizeToken(token)] ?? normalizeToken(token);
            if (seen.has(normalized))
                return;
            seen.add(normalized);
            const group = TOOL_GROUPS[normalized];
            if (group) {
                for (const item of group)
                    expand(item, seen);
                return;
            }
            if (TOOL_SET.has(normalized))
                expanded.add(normalized);
        };
        for (const token of tokens)
            expand(token);
        return TOOL_ORDER.filter((tool) => expanded.has(tool));
    }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("selectionchange", this.onSelectionChange);
    }
    disconnectedCallback() {
        document.removeEventListener("selectionchange", this.onSelectionChange);
        super.disconnectedCallback();
    }
    firstUpdated() {
        this.syncEditorFromValue();
        this.syncValidity();
    }
    willUpdate(changed) {
        if (changed.has("value") || changed.has("required") || changed.has("disabled") || changed.has("readonly")) {
            this.internals.setFormValue(this.value);
            this.syncValidity();
        }
    }
    updated(changed) {
        if (changed.has("value")) {
            if (this.valueSetFromEditor)
                this.valueSetFromEditor = false;
            else {
                this.syncEditorFromValue();
                this.syncValidity();
            }
        }
    }
    focus() {
        this.editorEl?.focus();
    }
    validate() {
        this.validationVisible = true;
        return this.syncValidity(true);
    }
    checkValidity() {
        this.syncValidity();
        return this.internals.checkValidity();
    }
    reportValidity() {
        this.validationVisible = true;
        this.syncValidity(true);
        return this.internals.reportValidity();
    }
    syncEditorFromValue() {
        if (!this.editorEl || this.editorEl.innerHTML === this.value)
            return;
        this.editorEl.innerHTML = this.value;
    }
    syncValueFromEditor() {
        const htmlValue = normalizeEditorHtml(this.editorEl?.innerHTML ?? "");
        this.valueSetFromEditor = true;
        this.value = htmlValue;
        this.internals.setFormValue(htmlValue);
        if (this.invalid)
            this.validate();
    }
    syncValidity(showInvalid = this.validationVisible) {
        const text = this.editorEl?.textContent ?? stripTags(this.value);
        const empty = this.required && !this.disabled && !this.readonly && text.trim() === "";
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? this.errorMessage || loomiT("validation.requiredField", {}, this.locale) : "";
        if (this.editorEl)
            this.internals.setValidity(validity, message, this.editorEl);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    handleInput() {
        this.syncValueFromEditor();
        this.updateToolbarState();
        this.emit("input");
    }
    handleBlur() {
        this.showValidation();
        this.emit("change");
    }
    emit(type) {
        this.dispatchEvent(new Event(type, { bubbles: true, composed: true }));
    }
    captureSelection() {
        const range = this.currentRange();
        this.savedRange = range ? range.cloneRange() : null;
    }
    keepToolbarFocus(event) {
        this.captureSelection();
        event.preventDefault();
    }
    command(name, value) {
        if (this.disabled || this.readonly)
            return;
        this.focus();
        document.execCommand(name, false, value);
        this.syncValueFromEditor();
        this.updateToolbarState();
        this.emit("input");
    }
    runTool(tool) {
        switch (tool) {
            case "bold":
                this.command("bold");
                break;
            case "italic":
                this.command("italic");
                break;
            case "underline":
                this.command("underline");
                break;
            case "strikethrough":
                this.command("strikeThrough");
                break;
            case "bullet-list":
                this.command("insertUnorderedList");
                break;
            case "ordered-list":
                this.command("insertOrderedList");
                break;
            case "align-left":
                this.command("justifyLeft");
                break;
            case "align-center":
                this.command("justifyCenter");
                break;
            case "align-right":
                this.command("justifyRight");
                break;
            case "align-justify":
                this.command("justifyFull");
                break;
            case "inline-code":
                this.wrapSelection("code", "code");
                break;
            case "superscript":
                this.command("superscript");
                break;
            case "subscript":
                this.command("subscript");
                break;
            case "blockquote":
                this.formatBlock("blockquote");
                break;
            case "code-block":
                this.formatBlock("pre");
                break;
            case "link":
                this.openEmbedDialog("link");
                break;
            case "image":
                this.openEmbedDialog("image");
                break;
            case "video":
                this.openEmbedDialog("video");
                break;
            case "ai":
                this.requestAiGeneration();
                break;
            default:
                break;
        }
    }
    setHeading(value) {
        this.restoreSavedSelection();
        this.formatBlock(value || "p");
    }
    setFontFamily(value) {
        if (!value)
            return;
        this.restoreSavedSelection();
        this.command("fontName", value);
    }
    setFontSize(value) {
        if (!value)
            return;
        this.restoreSavedSelection();
        this.command("fontSize", value);
    }
    setColor(command, value) {
        if (!value)
            return;
        this.restoreSavedSelection();
        this.command(command, value);
    }
    formatBlock(block) {
        this.command("formatBlock", block === "p" ? "<p>" : `<${block}>`);
        this.currentBlock = block;
    }
    wrapSelection(tagName, fallbackText) {
        if (this.disabled || this.readonly)
            return;
        this.focus();
        const range = this.currentRange();
        if (!range) {
            this.insertHtml(`<${tagName}>${escapeHtml(fallbackText)}</${tagName}>`);
            return;
        }
        const wrapper = document.createElement(tagName);
        if (range.collapsed) {
            wrapper.textContent = fallbackText;
            range.insertNode(wrapper);
            range.selectNodeContents(wrapper);
        }
        else {
            wrapper.append(range.extractContents());
            range.insertNode(wrapper);
            range.selectNodeContents(wrapper);
        }
        this.syncValueFromEditor();
        this.updateToolbarState();
        this.emit("input");
    }
    async openEmbedDialog(tool) {
        if (this.disabled || this.readonly)
            return;
        const range = this.currentRange();
        this.savedRange = range ? range.cloneRange() : this.savedRange;
        this.embedFiles = [];
        this.embedTool = tool;
        this.embedUrl = "";
        this.embedAlt = "";
        this.embedText = tool === "link" ? this.currentSelectionText() : "";
        await this.updateComplete;
        this.embedModalEl?.show();
    }
    closeEmbedDialog() {
        this.resetEmbedDialog();
        this.embedModalEl?.hide();
    }
    resetEmbedDialog() {
        this.embedTool = "";
        this.embedUrl = "";
        this.embedText = "";
        this.embedAlt = "";
        this.embedFiles = [];
        this.savedRange = null;
    }
    restoreSavedSelection() {
        this.focus();
        if (!this.savedRange)
            return;
        const root = this.getRootNode();
        const rootSelection = root.getSelection;
        const selection = rootSelection ? rootSelection.call(root) : document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(this.savedRange);
    }
    onEmbedFileChange(event) {
        this.embedFiles = event.detail.files;
    }
    async confirmEmbedDialog() {
        const tool = this.embedTool;
        if (!tool)
            return;
        const inserted = tool === "link"
            ? this.confirmLink()
            : tool === "image"
                ? await this.confirmImage()
                : await this.confirmVideo();
        if (inserted)
            this.closeEmbedDialog();
    }
    confirmLink() {
        const href = safeUrl(this.embedUrl, ["http:", "https:", "mailto:", "tel:"]);
        if (!href)
            return false;
        this.restoreSavedSelection();
        const selection = this.currentSelectionText();
        const label = this.embedText.trim() || selection || href;
        if (!selection || this.embedText.trim()) {
            this.insertHtml(`<a href="${escapeHtml(href)}">${escapeHtml(label)}</a>`);
        }
        else {
            this.command("createLink", href);
        }
        this.hardenLinks();
        return true;
    }
    async confirmImage() {
        const file = this.embedFiles.find((item) => item.type.startsWith("image/"));
        const src = file ? await readFileAsDataUrl(file) : safeUrl(this.embedUrl);
        if (!src)
            return false;
        this.restoreSavedSelection();
        this.insertHtml(`<img src="${escapeHtml(src)}" alt="${escapeHtml(this.embedAlt)}">`);
        return true;
    }
    async confirmVideo() {
        const file = this.embedFiles.find((item) => item.type.startsWith("video/"));
        if (file) {
            const src = await readFileAsDataUrl(file);
            if (!src)
                return false;
            this.restoreSavedSelection();
            this.insertHtml(`<video controls src="${escapeHtml(src)}"></video>`);
            return true;
        }
        const src = videoEmbedUrl(this.embedUrl);
        if (!src)
            return false;
        this.restoreSavedSelection();
        this.insertHtml(`<iframe src="${escapeHtml(src)}" title="Embedded video" loading="lazy" allowfullscreen></iframe>`);
        return true;
    }
    requestAiGeneration() {
        if (this.disabled || this.readonly)
            return;
        const range = this.currentRange();
        this.savedRange = range ? range.cloneRange() : this.savedRange;
        const selection = this.currentSelectionText();
        this.dispatchEvent(new CustomEvent("loomi-ai-generate", {
            bubbles: true,
            composed: true,
            detail: {
                html: this.value,
                selection,
                insert: (htmlValue) => {
                    this.restoreSavedSelection();
                    this.insertHtml(htmlValue);
                },
            },
        }));
    }
    insertHtml(markup) {
        this.command("insertHTML", markup);
    }
    hardenLinks() {
        for (const link of Array.from(this.editorEl?.querySelectorAll("a[href]") ?? [])) {
            link.setAttribute("target", "_blank");
            link.setAttribute("rel", "noopener noreferrer");
        }
        this.syncValueFromEditor();
    }
    currentSelectionText() {
        const selection = this.currentSelection();
        return selection?.toString() ?? "";
    }
    currentSelection() {
        const root = this.getRootNode();
        const rootSelection = root.getSelection;
        const selection = rootSelection ? rootSelection.call(root) : document.getSelection();
        if (!selection || selection.rangeCount === 0)
            return null;
        return this.selectionInsideEditor(selection) ? selection : null;
    }
    currentRange() {
        const selection = this.currentSelection();
        if (!selection)
            return null;
        return selection.getRangeAt(0);
    }
    selectionInsideEditor(selection) {
        if (!this.editorEl || selection.rangeCount === 0)
            return false;
        const range = selection.getRangeAt(0);
        const container = range.commonAncestorContainer;
        return this.editorEl === container || this.editorEl.contains(container);
    }
    updateToolbarState() {
        if (!this.editorEl)
            return;
        if (!this.currentSelection()) {
            this.activeTools = [];
            this.currentBlock = "p";
            return;
        }
        const active = new Set();
        for (const [tool, command] of Object.entries(ACTIVE_COMMANDS)) {
            try {
                if (document.queryCommandState(command))
                    active.add(tool);
            }
            catch {
                // Some browser commands throw when the selection is outside an editable area.
            }
        }
        this.currentBlock = this.detectCurrentBlock();
        this.activeTools = Array.from(active);
    }
    detectCurrentBlock() {
        const range = this.currentRange();
        if (!range)
            return "p";
        let node = range.startContainer;
        while (node && node !== this.editorEl) {
            if (node instanceof HTMLElement) {
                const tag = node.tagName.toLowerCase();
                if (/^h[1-6]$/.test(tag) || tag === "blockquote" || tag === "pre" || tag === "p")
                    return tag;
            }
            node = node.parentNode;
        }
        return "p";
    }
    renderTooltip(label, content) {
        return html `<loomi-tooltip content=${label} placement="bottom">${content}</loomi-tooltip>`;
    }
    renderIcon(tool) {
        const icon = TOOL_ICONS[tool];
        if (!icon)
            return nothing;
        return html `<loomi-icon
      name=${icon.name}
      source=${icon.source ?? nothing}
      size="1rem"
      stroke-width="1.8"
    ></loomi-icon>`;
    }
    renderButton(tool, fallback) {
        const label = TOOL_LABELS[tool];
        const active = this.activeTools.includes(tool);
        const buttonContent = TOOL_ICONS[tool] ? this.renderIcon(tool) : fallback || label;
        const content = html `<button
      class=${`loomi-tool-button${active ? " active" : ""}`}
      type="button"
      aria-label=${label}
      aria-pressed=${active ? "true" : "false"}
      ?disabled=${this.disabled || this.readonly}
      @mousedown=${this.keepToolbarFocus}
      @click=${() => this.runTool(tool)}
    >
      ${buttonContent}
    </button>`;
        return this.renderTooltip(label, content);
    }
    renderSelectTool(tool) {
        if (tool === "heading") {
            return this.renderToolbarSelect(tool, HEADING_OPTIONS, "Body", this.currentBlock, (value) => this.setHeading(value), "loomi-tool-select-heading");
        }
        if (tool === "font-family") {
            return this.renderToolbarSelect(tool, FONT_FAMILIES, "Font", "", (value) => this.setFontFamily(value));
        }
        return this.renderToolbarSelect(tool, FONT_SIZES, "Size", "", (value) => this.setFontSize(value), "loomi-tool-select-narrow");
    }
    renderToolbarSelect(tool, options, placeholder, selectedValue, onSelect, className = "") {
        return this.renderTooltip(TOOL_LABELS[tool], html `<loomi-select
        class=${`loomi-tool-select-custom ${className}`.trim()}
        size="tiny"
        no-clearing
        placeholder=${placeholder}
        selected-value=${selectedValue}
        .data=${options}
        ?disabled=${this.disabled || this.readonly}
        @pointerdown=${this.captureSelection}
        @select=${(event) => onSelect(event.detail.value)}
      ></loomi-select>`);
    }
    renderColorTool(tool) {
        const label = TOOL_LABELS[tool];
        const command = tool === "font-color" ? "foreColor" : "hiliteColor";
        const fallback = tool === "font-color" ? "#111827" : "#fef08a";
        return this.renderTooltip(label, html `<label
        class=${`loomi-color-tool${this.disabled || this.readonly ? " disabled" : ""}`}
        aria-label=${label}
        @pointerdown=${this.captureSelection}
      >
        ${this.renderIcon(tool)}
        <input
          type="color"
          value=${fallback}
          aria-label=${label}
          ?disabled=${this.disabled || this.readonly}
          @input=${(event) => this.setColor(command, event.target.value)}
        />
      </label>`);
    }
    renderEmbedInput(label, value, prefixIcon, onInput) {
        return html `<loomi-input
      class="loomi-embed-input"
      no-clearing
      label=${label}
      prefix-icon=${prefixIcon}
      .value=${value}
      @input=${(event) => onInput(event.target.value)}
    ></loomi-input>`;
    }
    renderEmbedFilepicker(kind) {
        const accepted = kind === "image" ? "image/*" : "video/*";
        return html `<loomi-filepicker
      class="loomi-embed-filepicker"
      accepted-file-types=${accepted}
      max-files="1"
      max-file-size=${kind === "image" ? "10mb" : "50mb"}
      .showImagePreview=${kind === "image"}
      @change=${(event) => this.onEmbedFileChange(event)}
    ></loomi-filepicker>`;
    }
    renderEmbedDialogBody() {
        if (!this.embedTool)
            return html ``;
        if (this.embedTool === "link") {
            return html `<div class="loomi-embed-form">
        ${this.renderEmbedInput("URL", this.embedUrl, "link", (value) => (this.embedUrl = value))}
        ${this.renderEmbedInput("Display text", this.embedText, "document-text", (value) => (this.embedText = value))}
      </div>`;
        }
        if (this.embedTool === "image") {
            return html `<div class="loomi-embed-form">
        ${this.renderEmbedInput("Image URL", this.embedUrl, "photo", (value) => (this.embedUrl = value))}
        ${this.renderEmbedInput("Image description", this.embedAlt, "tag", (value) => (this.embedAlt = value))}
        <div class="loomi-embed-separator">Or choose an image file</div>
        ${this.renderEmbedFilepicker("image")}
      </div>`;
        }
        return html `<div class="loomi-embed-form">
      ${this.renderEmbedInput("Video URL", this.embedUrl, "video-camera", (value) => (this.embedUrl = value))}
      <div class="loomi-embed-separator">Or choose a video file</div>
      ${this.renderEmbedFilepicker("video")}
    </div>`;
    }
    renderEmbedDialog() {
        const title = this.embedTool === "image"
            ? "Insert image"
            : this.embedTool === "video"
                ? "Insert video"
                : "Insert link";
        return html `<loomi-modal
      class="loomi-embed-modal"
      title=${title}
      size="medium"
      ok-button-label="Insert"
      cancel-button-label="Cancel"
      close-after-action="false"
      show-close-icon
      @ok=${this.confirmEmbedDialog}
      @cancel=${this.closeEmbedDialog}
      @close=${this.resetEmbedDialog}
    >
      ${this.renderEmbedDialogBody()}
    </loomi-modal>`;
    }
    renderTool(tool) {
        if (tool === "heading" || tool === "font-family" || tool === "font-size") {
            return this.renderSelectTool(tool);
        }
        if (tool === "font-color" || tool === "highlight-color")
            return this.renderColorTool(tool);
        if (tool === "superscript")
            return this.renderButton(tool, "x^2");
        if (tool === "subscript")
            return this.renderButton(tool, "x_2");
        return this.renderButton(tool);
    }
    render() {
        const hasLabel = !!this.label;
        const showError = this.invalid && this.showErrorInline && this.errorMessage;
        const tools = this.resolvedTools;
        const text = this.editorEl?.textContent ?? stripTags(this.value);
        const isEmpty = text.trim() === "";
        return html `
      ${hasLabel
            ? html `<label class="loomi-label loomi-label-static"
            >${this.label}${this.required ? html `<span class="loomi-req">*</span>` : nothing}</label
          >`
            : nothing}
      <div class="loomi-field variant-${this.variant}" part="field">
        ${tools.length
            ? html `<div class="loomi-toolbar" part="toolbar" role="toolbar">
              ${tools.map((tool) => this.renderTool(tool))}
            </div>`
            : nothing}
        <div
          class="loomi-editor"
          part="editor"
          role="textbox"
          aria-multiline="true"
          aria-label=${this.label || this.placeholder || "Rich text editor"}
          aria-disabled=${this.disabled ? "true" : "false"}
          aria-readonly=${this.readonly ? "true" : "false"}
          contenteditable=${this.disabled || this.readonly ? "false" : "true"}
          data-empty=${isEmpty ? "true" : "false"}
          data-placeholder=${this.placeholder}
          style=${`--loomi-editor-min-height:${Math.max(1, this.rows) * 1.5}em`}
          @input=${this.handleInput}
          @blur=${this.handleBlur}
          @keyup=${this.updateToolbarState}
          @mouseup=${this.updateToolbarState}
        ></div>
      </div>
      ${showError ? html `<p class="loomi-error">${this.errorMessage}</p>` : nothing}
      ${this.renderEmbedDialog()}
    `;
    }
};
__decorate([
    property({ reflect: true })
], LoomiTextEditor.prototype, "name", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "label", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "locale", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "placeholder", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "value", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "tools", void 0);
__decorate([
    property({ type: Number })
], LoomiTextEditor.prototype, "rows", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "readonly", void 0);
__decorate([
    property({ attribute: "error-message" })
], LoomiTextEditor.prototype, "errorMessage", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-error-inline" })
], LoomiTextEditor.prototype, "showErrorInline", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiTextEditor.prototype, "invalid", void 0);
__decorate([
    property()
], LoomiTextEditor.prototype, "variant", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "activeTools", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "currentBlock", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "embedTool", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "embedUrl", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "embedText", void 0);
__decorate([
    state()
], LoomiTextEditor.prototype, "embedAlt", void 0);
__decorate([
    query(".loomi-editor")
], LoomiTextEditor.prototype, "editorEl", void 0);
__decorate([
    query(".loomi-embed-modal", true)
], LoomiTextEditor.prototype, "embedModalEl", void 0);
LoomiTextEditor = __decorate([
    customElement("loomi-text-editor")
], LoomiTextEditor);
export { LoomiTextEditor };
//# sourceMappingURL=loomi-text-editor.js.map