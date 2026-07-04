var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing, svg } from "lit";
import { customElement, property, state, query } from "lit/decorators.js";
import { LoomiElement, loomiDefaultText, loomiStyles, loomiT } from "@loomidev/core";
import "@loomidev/modal/loomi-modal.js";
import { showLoomiNotification } from "@loomidev/notification";
import { componentStyles } from "./generated/styles.css.js";
const UPLOAD = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 7.5 7.5 12M12 7.5v9" />`;
const FILE = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />`;
const X = svg `<path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />`;
const DEFAULT_PLACEHOLDER_LINE1 = "Choose files or drag and drop to upload";
const DEFAULT_PLACEHOLDER_LINE2 = "%s up to %s";
const MIN_CROP_SIZE = 24;
// Inline rather than in styles.css: this markup is slotted into <loomi-modal>, which
// relocates itself to document.body on show(). Once moved, it's no longer a descendant
// of loomi-filepicker's shadow root, so that stylesheet (scoped to the shadow root) stops
// applying — the crop box would silently lose its position/spotlight/cursor styling.
const CROP_STAGE_STYLE = "position:relative;display:inline-block;line-height:0;max-width:100%;max-height:55vh;overflow:hidden;border-radius:0.4rem;";
const CROP_IMG_STYLE = "display:block;max-width:100%;max-height:55vh;-webkit-user-drag:none;user-select:none;";
const CROP_RECT_STYLE = "position:absolute;box-shadow:0 0 0 9999px rgba(15,23,42,.55);border:1px solid var(--loomi-surface-border);cursor:move;touch-action:none;";
const CROP_HANDLE_STYLE = "position:absolute;right:-0.4rem;bottom:-0.4rem;width:0.85rem;height:0.85rem;border-radius:9999px;background:var(--loomi-surface);border:1px solid var(--loomi-primary-600,#1d4ed8);cursor:nwse-resize;touch-action:none;";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
function parseSize(s) {
    const m = s.trim().toLowerCase().match(/^([\d.]+)\s*(kb|mb|gb)?$/);
    if (!m)
        return Infinity;
    const n = parseFloat(m[1]);
    return n * { kb: 1024, mb: 1024 ** 2, gb: 1024 ** 3, "": 1 }[m[2] ?? ""];
}
function human(bytes) {
    if (bytes < 1024)
        return `${bytes} B`;
    if (bytes < 1024 ** 2)
        return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
}
function clamp(n, min, max) {
    return Math.min(Math.max(n, min), Math.max(min, max));
}
function loadImageElement(file) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject(new Error("loomi-filepicker: unable to load image"));
        img.src = URL.createObjectURL(file);
    });
}
/**
 * `<loomi-filepicker>` — a drag-and-drop file picker with previews. Keeps a real
 * `<input type="file">` in sync (set `name` and submit inside a `<form>` with
 * `enctype="multipart/form-data"`). A lightweight take on BladewindUI's Filepond
 * wrapper — the crop dialog is a `<loomi-modal>` and oversized-file errors surface
 * through `<loomi-notification>`.
 *
 * Set `stealth` to hide the drop-zone and file list entirely — the native input and
 * crop dialog still work, driven imperatively via `open()`/`clear()` from your own
 * trigger element (e.g. `<loomi-avatar editable>` uses this to launch a crop dialog
 * straight from an avatar click).
 *
 * @fires change - `detail: { files }` whenever the selection changes.
 */
let LoomiFilepicker = class LoomiFilepicker extends LoomiElement {
    constructor() {
        super(...arguments);
        this.internals = this.attachInternals();
        this.validationVisible = false;
        this.cropResolve = null;
        this.cropImgRef = null;
        this.cropDrag = null;
        this.name = "";
        this.acceptedFileTypes = "image/*,application/pdf";
        this.placeholderLine1 = DEFAULT_PLACEHOLDER_LINE1;
        this.placeholderLine2 = DEFAULT_PLACEHOLDER_LINE2;
        this.locale = "";
        this.maxFiles = 1;
        this.maxFileSize = "5mb";
        this.canBrowse = true;
        this.canDrop = true;
        this.disabled = false;
        this.showImagePreview = true;
        this.required = false;
        this.invalid = false;
        this.crop = false;
        this.cropAspectRatio = "16:9";
        this.resize = false;
        this.resizeWidth = 0;
        this.resizeHeight = 0;
        this.stealth = false;
        this.files = [];
        this.over = false;
        this.cropping = null;
        this.cropRect = { x: 0, y: 0, w: 0, h: 0 };
        this.onCropPointerMove = (e) => {
            if (!this.cropDrag || !this.cropping)
                return;
            const { displayW, displayH } = this.cropping;
            const dx = e.clientX - this.cropDrag.startX;
            const dy = e.clientY - this.cropDrag.startY;
            const start = this.cropDrag.rect;
            if (this.cropDrag.mode === "move") {
                const x = clamp(start.x + dx, 0, displayW - start.w);
                const y = clamp(start.y + dy, 0, displayH - start.h);
                this.cropRect = { ...start, x, y };
                return;
            }
            const ratio = this.aspectRatioValue();
            let w = clamp(start.w + dx, MIN_CROP_SIZE, displayW - start.x);
            let h;
            if (ratio === null) {
                h = clamp(start.h + dy, MIN_CROP_SIZE, displayH - start.y);
            }
            else {
                h = w / ratio;
                const maxH = displayH - start.y;
                if (h > maxH) {
                    h = maxH;
                    w = h * ratio;
                }
            }
            this.cropRect = { ...start, w, h };
        };
        this.onCropPointerUp = () => {
            this.cropDrag = null;
            window.removeEventListener("pointermove", this.onCropPointerMove);
            window.removeEventListener("pointerup", this.onCropPointerUp);
        };
        /** Backdrop click / Escape — `loomi-modal` has already hidden itself by the time this fires. */
        this.onCropModalDismiss = () => {
            this.finishCrop(null);
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    static { this.formAssociated = true; }
    /** Currently selected files. */
    get selectedFiles() {
        return this.files;
    }
    /**
     * Opens the native file picker programmatically. Pairs with `stealth`, where there's
     * no visible drop-zone for the user to click directly.
     */
    open() {
        if (this.disabled || this.cropping)
            return;
        this.input?.click();
    }
    /**
     * Clears the current selection and resyncs the underlying `<input>`/form value. Call
     * this before `open()` when re-picking should replace rather than append — `add()`
     * stops accepting new files once `max-files` is reached, so a `max-files="1"` picker
     * (the common case for `stealth`) would otherwise ignore a second pick.
     */
    clear() {
        this.files = [];
        this.syncInput();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        window.removeEventListener("pointermove", this.onCropPointerMove);
        window.removeEventListener("pointerup", this.onCropPointerUp);
    }
    willUpdate(changed) {
        if (changed.has("files") ||
            changed.has("required") ||
            changed.has("disabled") ||
            changed.has("name")) {
            this.syncFormValue();
            this.syncValidity();
        }
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
    syncFormValue() {
        if (!this.name || this.files.length === 0) {
            this.internals.setFormValue(null);
            return;
        }
        const data = new FormData();
        const name = this.maxFiles > 1 ? `${this.name}[]` : this.name;
        for (const file of this.files)
            data.append(name, file);
        this.internals.setFormValue(data);
    }
    syncValidity(showInvalid = this.validationVisible) {
        const empty = this.required && !this.disabled && this.files.length === 0;
        this.invalid = empty && showInvalid;
        const validity = empty ? { valueMissing: true } : {};
        const message = empty ? loomiT("validation.selectFile", {}, this.locale) : "";
        if (this.input)
            this.internals.setValidity(validity, message, this.input);
        else
            this.internals.setValidity(validity, message);
        return !empty;
    }
    showValidation() {
        this.validationVisible = true;
        this.syncValidity(true);
    }
    syncInput() {
        const dt = new DataTransfer();
        for (const f of this.files)
            dt.items.add(f);
        if (this.input)
            this.input.files = dt.files;
        this.syncFormValue();
        this.syncValidity();
        this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { files: this.files } }));
    }
    async add(list) {
        if (!list || this.disabled)
            return;
        const limit = parseSize(this.maxFileSize);
        const candidates = [];
        let count = this.files.length;
        for (const f of Array.from(list)) {
            if (f.size > limit) {
                showLoomiNotification(loomiT("filepicker.fileTooLargeTitle", {}, this.locale), loomiT("filepicker.fileTooLarge", { name: f.name, limit: human(limit) }, this.locale), "error");
                continue;
            }
            if (count >= this.maxFiles)
                break;
            candidates.push(f);
            count++;
        }
        if (!candidates.length)
            return;
        const accepted = [];
        for (const f of candidates) {
            const result = await this.processFile(f);
            if (result)
                accepted.push(result);
        }
        if (!accepted.length)
            return;
        this.files = [...this.files, ...accepted];
        this.syncInput();
    }
    /** Runs a single accepted file through the optional crop and resize pipeline. */
    async processFile(file) {
        let result = file;
        if (this.crop && this.isImage(result)) {
            const cropped = await this.cropImage(result);
            if (!cropped)
                return null;
            result = cropped;
        }
        if (this.resize && this.isImage(result)) {
            result = await this.resizeImage(result);
        }
        return result;
    }
    removeFile(i) {
        this.files = this.files.filter((_, idx) => idx !== i);
        this.syncInput();
    }
    onDrop(e) {
        e.preventDefault();
        this.over = false;
        if (this.canDrop && !this.disabled && !this.cropping)
            this.add(e.dataTransfer?.files ?? null);
    }
    placeholder2() {
        return loomiDefaultText(this.placeholderLine2, DEFAULT_PLACEHOLDER_LINE2, "filepicker.placeholderLine2", this.locale).replace("%s", this.acceptedFileTypes).replace("%s", this.maxFileSize);
    }
    isImage(f) {
        return f.type.startsWith("image/");
    }
    // ---- cropping ----
    aspectRatioValue() {
        if (this.cropAspectRatio === "free")
            return null;
        const m = /^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/.exec(this.cropAspectRatio);
        const ratio = m ? parseFloat(m[1]) / parseFloat(m[2]) : NaN;
        return ratio > 0 ? ratio : 16 / 9;
    }
    /**
     * Sized to ~80% of the image in both modes (not just "free") so the box never touches
     * all 4 edges at once — otherwise the box can't be dragged in whichever axis it's
     * already maxed out in.
     */
    defaultCropRect(dispW, dispH) {
        const ratio = this.aspectRatioValue();
        const maxW = dispW * 0.8;
        const maxH = dispH * 0.8;
        if (ratio === null) {
            return { x: (dispW - maxW) / 2, y: (dispH - maxH) / 2, w: maxW, h: maxH };
        }
        let w = maxW;
        let h = w / ratio;
        if (h > maxH) {
            h = maxH;
            w = h * ratio;
        }
        return { x: (dispW - w) / 2, y: (dispH - h) / 2, w, h };
    }
    cropImage(file) {
        return new Promise((resolve) => {
            this.cropResolve = resolve;
            this.cropping = {
                file,
                url: URL.createObjectURL(file),
                displayW: 0,
                displayH: 0,
                naturalW: 0,
                naturalH: 0,
            };
            // The modal element only exists in the DOM once `cropping` has rendered it.
            this.updateComplete.then(() => this.cropModalEl?.show());
        });
    }
    onCropImageLoad(e) {
        if (!this.cropping)
            return;
        const img = e.target;
        this.cropImgRef = img;
        const rect = img.getBoundingClientRect();
        this.cropping = {
            ...this.cropping,
            displayW: rect.width,
            displayH: rect.height,
            naturalW: img.naturalWidth,
            naturalH: img.naturalHeight,
        };
        this.cropRect = this.defaultCropRect(rect.width, rect.height);
    }
    onCropPointerDown(e, mode) {
        e.preventDefault();
        e.stopPropagation();
        // Without capture, a fast drag can carry the pointer onto the bare <img>, which
        // browsers treat as a native "drag this image" gesture — that hijacks the move/up
        // events the crop box needs and stalls the drag mid-gesture.
        e.currentTarget.setPointerCapture(e.pointerId);
        this.cropDrag = { mode, startX: e.clientX, startY: e.clientY, rect: { ...this.cropRect } };
        window.addEventListener("pointermove", this.onCropPointerMove);
        window.addEventListener("pointerup", this.onCropPointerUp);
    }
    /** Cancel button — closes the modal itself since `close-after-action` is off. */
    cancelCrop() {
        this.finishCrop(null);
        this.cropModalEl?.hide();
    }
    async applyCrop() {
        const session = this.cropping;
        const img = this.cropImgRef;
        if (!session || !img || !session.displayW || !session.naturalW)
            return;
        const scaleX = session.naturalW / session.displayW;
        const scaleY = session.naturalH / session.displayH;
        const sx = this.cropRect.x * scaleX;
        const sy = this.cropRect.y * scaleY;
        const sw = this.cropRect.w * scaleX;
        const sh = this.cropRect.h * scaleY;
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(sw));
        canvas.height = Math.max(1, Math.round(sh));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
            this.finishCrop(session.file);
            this.cropModalEl?.hide();
            return;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
        const type = session.file.type || "image/png";
        const blob = await new Promise((resolve) => canvas.toBlob(resolve, type));
        this.finishCrop(blob ? new File([blob], session.file.name, { type: blob.type, lastModified: Date.now() }) : session.file);
        this.cropModalEl?.hide();
    }
    /** Pure state cleanup — never closes the modal itself, so it's safe to call from a
     * "the modal already closed" handler without recursing back into `hide()`. */
    finishCrop(file) {
        const resolve = this.cropResolve;
        const session = this.cropping;
        this.cropResolve = null;
        this.cropping = null;
        this.cropDrag = null;
        this.cropImgRef = null;
        if (session)
            URL.revokeObjectURL(session.url);
        resolve?.(file);
    }
    // ---- resizing (silent — no UI) ----
    async resizeImage(file) {
        if (this.resizeWidth <= 0 && this.resizeHeight <= 0)
            return file;
        let img;
        try {
            img = await loadImageElement(file);
        }
        catch {
            return file;
        }
        const scaleW = this.resizeWidth > 0 ? this.resizeWidth / img.naturalWidth : Infinity;
        const scaleH = this.resizeHeight > 0 ? this.resizeHeight / img.naturalHeight : Infinity;
        const scale = Math.min(scaleW, scaleH);
        const w = Math.max(1, Math.round(img.naturalWidth * scale));
        const h = Math.max(1, Math.round(img.naturalHeight * scale));
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        let blob = null;
        if (ctx) {
            ctx.drawImage(img, 0, 0, w, h);
            const type = file.type || "image/png";
            blob = await new Promise((resolve) => canvas.toBlob(resolve, type));
        }
        URL.revokeObjectURL(img.src);
        return blob ? new File([blob], file.name, { type: blob.type, lastModified: Date.now() }) : file;
    }
    /**
     * Always rendered (even while `cropping` is null) so `@query(".loomi-crop-modal")`
     * reliably resolves and `show()`/`hide()` can be called imperatively — `loomi-modal`
     * portals itself to `document.body` on `show()`, so the dialog chrome, focus trap,
     * Escape-to-close and backdrop click are all delegated to it rather than hand-rolled here.
     */
    renderCropModal() {
        const session = this.cropping;
        return html `<loomi-modal
      class="loomi-crop-modal"
      size="large"
      locale=${this.locale}
      title=${loomiT("filepicker.cropTitle", {}, this.locale)}
      ok-button-label=${loomiT("filepicker.cropApply", {}, this.locale)}
      cancel-button-label=${loomiT("filepicker.cropCancel", {}, this.locale)}
      close-after-action="false"
      @ok=${() => this.applyCrop()}
      @cancel=${() => this.cancelCrop()}
      @close=${this.onCropModalDismiss}
    >
      ${session
            ? html `<div class="loomi-crop-stage" style=${CROP_STAGE_STYLE}>
            <img
              class="loomi-crop-img"
              src=${session.url}
              alt=""
              draggable="false"
              style=${CROP_IMG_STYLE}
              @load=${(e) => this.onCropImageLoad(e)}
              @error=${() => this.finishCrop(session.file)}
              @dragstart=${(e) => e.preventDefault()}
            />
            ${session.displayW
                ? html `<div
                  class="loomi-crop-rect"
                  style="${CROP_RECT_STYLE}left:${this.cropRect.x}px;top:${this.cropRect.y}px;width:${this.cropRect.w}px;height:${this.cropRect.h}px;"
                  @pointerdown=${(e) => this.onCropPointerDown(e, "move")}
                >
                  <span class="loomi-crop-handle" style=${CROP_HANDLE_STYLE} @pointerdown=${(e) => this.onCropPointerDown(e, "resize")}></span>
                </div>`
                : nothing}
          </div>`
            : nothing}
    </loomi-modal>`;
    }
    render() {
        const placeholderLine1 = loomiDefaultText(this.placeholderLine1, DEFAULT_PLACEHOLDER_LINE1, "filepicker.placeholderLine1", this.locale);
        return html `<div class="loomi-fp">
      <div
        class="loomi-drop ${this.over ? "over" : ""} ${this.disabled ? "disabled" : ""}"
        @click=${() => this.canBrowse && !this.disabled && !this.cropping && this.input.click()}
        @dragover=${(e) => { if (this.canDrop && !this.disabled && !this.cropping) {
            e.preventDefault();
            this.over = true;
        } }}
        @dragleave=${() => (this.over = false)}
        @drop=${(e) => this.onDrop(e)}
      >
        <span class="loomi-drop-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${UPLOAD}</svg>
        </span>
        <div class="loomi-drop-text">
          <div class="loomi-l1">${placeholderLine1}${this.required ? html `<span class="loomi-req"> *</span>` : nothing}</div>
          <div class="loomi-l2">${this.placeholder2()}</div>
        </div>
        <input
          class="loomi-native"
          type="file"
          name=${(this.name ? (this.maxFiles > 1 ? this.name + "[]" : this.name) : "") || nothing}
          accept=${this.acceptedFileTypes}
          ?multiple=${this.maxFiles > 1}
          ?disabled=${this.disabled || !!this.cropping}
          @blur=${this.showValidation}
          @change=${(e) => this.add(e.target.files)}
        />
      </div>
      ${this.files.length
            ? html `<div class="loomi-files">
            ${this.files.map((f, i) => html `<div class="loomi-file">
              <span class="loomi-thumb">
                ${this.showImagePreview && this.isImage(f)
                ? html `<img class="loomi-thumb" src=${URL.createObjectURL(f)} alt="" />`
                : html `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">${FILE}</svg>`}
              </span>
              <span class="loomi-meta">
                <div class="loomi-fname">${f.name}</div>
                <div class="loomi-fsize">${human(f.size)}</div>
              </span>
              <button class="loomi-remove" aria-label=${loomiT("common.remove", {}, this.locale)} @click=${() => this.removeFile(i)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">${X}</svg>
              </button>
            </div>`)}
          </div>`
            : nothing}
      ${this.renderCropModal()}
    </div>`;
    }
};
__decorate([
    property({ reflect: true })
], LoomiFilepicker.prototype, "name", void 0);
__decorate([
    property({ attribute: "accepted-file-types" })
], LoomiFilepicker.prototype, "acceptedFileTypes", void 0);
__decorate([
    property({ attribute: "placeholder-line1" })
], LoomiFilepicker.prototype, "placeholderLine1", void 0);
__decorate([
    property({ attribute: "placeholder-line2" })
], LoomiFilepicker.prototype, "placeholderLine2", void 0);
__decorate([
    property()
], LoomiFilepicker.prototype, "locale", void 0);
__decorate([
    property({ type: Number, attribute: "max-files" })
], LoomiFilepicker.prototype, "maxFiles", void 0);
__decorate([
    property({ attribute: "max-file-size" })
], LoomiFilepicker.prototype, "maxFileSize", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-browse", converter: booleanAttribute })
], LoomiFilepicker.prototype, "canBrowse", void 0);
__decorate([
    property({ type: Boolean, attribute: "can-drop", converter: booleanAttribute })
], LoomiFilepicker.prototype, "canDrop", void 0);
__decorate([
    property({ type: Boolean })
], LoomiFilepicker.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-image-preview", converter: booleanAttribute })
], LoomiFilepicker.prototype, "showImagePreview", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFilepicker.prototype, "required", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiFilepicker.prototype, "invalid", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiFilepicker.prototype, "crop", void 0);
__decorate([
    property({ attribute: "crop-aspect-ratio" })
], LoomiFilepicker.prototype, "cropAspectRatio", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiFilepicker.prototype, "resize", void 0);
__decorate([
    property({ type: Number, attribute: "resize-width" })
], LoomiFilepicker.prototype, "resizeWidth", void 0);
__decorate([
    property({ type: Number, attribute: "resize-height" })
], LoomiFilepicker.prototype, "resizeHeight", void 0);
__decorate([
    property({ type: Boolean, reflect: true, converter: booleanAttribute })
], LoomiFilepicker.prototype, "stealth", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "files", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "over", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "cropping", void 0);
__decorate([
    state()
], LoomiFilepicker.prototype, "cropRect", void 0);
__decorate([
    query("input")
], LoomiFilepicker.prototype, "input", void 0);
__decorate([
    query(".loomi-crop-modal", true)
], LoomiFilepicker.prototype, "cropModalEl", void 0);
LoomiFilepicker = __decorate([
    customElement("loomi-filepicker")
], LoomiFilepicker);
export { LoomiFilepicker };
//# sourceMappingURL=loomi-filepicker.js.map