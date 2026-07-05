var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { css, html, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LoomiElement, loomiStyles, loomiT, accentVars, lockBodyScroll, unlockBodyScroll, } from "@loomidev/core";
import "@loomidev/icon/loomi-icon.js";
import { componentStyles } from "./generated/styles.css.js";
const MIN_THUMB_SIZE = 96;
const MAX_THUMB_SIZE = 320;
const THUMB_STEP = 32;
const DEFAULT_THUMB_SIZE = 160;
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.5;
const DEFAULT_SLIDESHOW_INTERVAL = 3000;
const TOAST_DURATION_MS = 2200;
const ALL_ALBUM = "";
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false";
    },
    toAttribute(value) {
        return value ? "" : null;
    },
};
/** Walks into nested shadow roots to find the actually-focused element. */
function deepActiveElement() {
    let el = document.activeElement;
    while (el?.shadowRoot?.activeElement)
        el = el.shadowRoot.activeElement;
    return el;
}
function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}
const FOCUSABLE_SELECTOR = 'button:not([disabled]), [tabindex]:not([tabindex="-1"])';
/**
 * `<loomi-photo-gallery-item>` — one photo inside a `<loomi-photo-gallery>`. A plain data
 * holder (like `<option>`) — it never renders itself; the gallery reads its attributes to
 * draw the grid tile and lightbox view.
 */
let LoomiPhotoGalleryItem = class LoomiPhotoGalleryItem extends LoomiElement {
    constructor() {
        super(...arguments);
        /** Full-size image URL, shown in the lightbox. */
        this.src = "";
        /** Grid thumbnail URL. Falls back to `src` when omitted. */
        this.thumb = "";
        /** Accessible text and lightbox caption fallback. */
        this.alt = "";
        /** Album/group name. Left blank, the photo only shows up under "All". */
        this.album = "";
        /** Caption shown under the image in the lightbox. Falls back to `alt`. */
        this.caption = "";
        /** Whether this photo is favourited. Settable up front or toggled from the UI. */
        this.favourite = false;
    }
    static { this.styles = [loomiStyles(componentStyles), css `:host { display: none; }`]; }
    render() {
        return nothing;
    }
};
__decorate([
    property()
], LoomiPhotoGalleryItem.prototype, "src", void 0);
__decorate([
    property()
], LoomiPhotoGalleryItem.prototype, "thumb", void 0);
__decorate([
    property()
], LoomiPhotoGalleryItem.prototype, "alt", void 0);
__decorate([
    property()
], LoomiPhotoGalleryItem.prototype, "album", void 0);
__decorate([
    property()
], LoomiPhotoGalleryItem.prototype, "caption", void 0);
__decorate([
    property({ type: Boolean, reflect: true, converter: booleanAttribute })
], LoomiPhotoGalleryItem.prototype, "favourite", void 0);
LoomiPhotoGalleryItem = __decorate([
    customElement("loomi-photo-gallery-item")
], LoomiPhotoGalleryItem);
export { LoomiPhotoGalleryItem };
/**
 * `<loomi-photo-gallery>` — an album grid built from `<loomi-photo-gallery-item>` children,
 * with a toolbar (album list, zoom, square thumbnails, slideshow) and a full-size lightbox
 * viewer (zoom, rotate, favourite, share) opened by clicking a photo. Every toolbar icon can
 * be hidden individually via its `show-*` attribute.
 *
 * @slot - `<loomi-photo-gallery-item>` children.
 * @fires loomi-favourite - `detail: { index, src, favourite }`.
 * @fires loomi-photo-open - Lightbox opened. `detail: { index, src }`.
 * @fires loomi-photo-close - Lightbox closed.
 * @fires loomi-photo-change - Navigated to another photo in the lightbox. `detail: { index, src }`.
 * @fires loomi-rotate - `detail: { index, rotation }` (cumulative degrees).
 * @fires loomi-share - `detail: { index, src }`, fired before the native share sheet/clipboard fallback runs.
 * @fires loomi-slideshow-start / loomi-slideshow-end
 * @fires loomi-album-change - `detail: { album }` (`""` means "All").
 */
let LoomiPhotoGallery = class LoomiPhotoGallery extends LoomiElement {
    constructor() {
        super(...arguments);
        this.locale = "";
        this.color = "primary";
        /** Visual style of the album list panel when it's open. */
        this.albumView = "sidebar";
        /** Force every grid thumbnail to a 1:1 square crop instead of its natural aspect ratio. */
        this.squareThumbnails = false;
        /** Grid thumbnail size in pixels. Adjusted by the zoom in/out buttons. */
        this.thumbSize = DEFAULT_THUMB_SIZE;
        /** Milliseconds between slides while the slideshow is running. */
        this.slideshowInterval = DEFAULT_SLIDESHOW_INTERVAL;
        /** Whether the album list panel is currently open. Only rendered when there's more than one album. */
        this.albumPanelOpen = true;
        /** Show the toolbar button that toggles the album list panel. */
        this.showAlbumToggle = true;
        /** Show the grid zoom-in toolbar button. */
        this.showZoomIn = true;
        /** Show the grid zoom-out toolbar button. */
        this.showZoomOut = true;
        /** Show the square-thumbnails toggle button. */
        this.showSquareToggle = true;
        /** Show the slideshow toolbar button. */
        this.showSlideshow = true;
        /** Show the lightbox zoom-in button. */
        this.lightboxShowZoomIn = true;
        /** Show the lightbox zoom-out button. */
        this.lightboxShowZoomOut = true;
        /** Show the lightbox favourite button. */
        this.lightboxShowFavourite = true;
        /** Show the lightbox rotate-left button. */
        this.lightboxShowRotate = true;
        /** Show the lightbox share button. */
        this.lightboxShowShare = true;
        /** Show the lightbox close button. Escape and clicking the backdrop still close it either way. */
        this.lightboxShowClose = true;
        this.activeAlbum = ALL_ALBUM;
        this.lightboxIndex = -1;
        this.lightboxZoom = MIN_ZOOM;
        this.lightboxRotation = 0;
        this.slideshowActive = false;
        this.toastMessage = "";
        this.previouslyFocused = null;
        this.originalParent = null;
        this.originalNextSibling = null;
        this.hasScrollLock = false;
        this.isMovingInDom = false;
        this.slideshowTimer = 0;
        this.toastTimer = 0;
        this.onSlotChange = () => {
            this.requestUpdate();
        };
        this.toggleAlbumPanel = () => {
            this.albumPanelOpen = !this.albumPanelOpen;
        };
        this.zoomInGrid = () => {
            this.thumbSize = clamp(this.thumbSize + THUMB_STEP, MIN_THUMB_SIZE, MAX_THUMB_SIZE);
        };
        this.zoomOutGrid = () => {
            this.thumbSize = clamp(this.thumbSize - THUMB_STEP, MIN_THUMB_SIZE, MAX_THUMB_SIZE);
        };
        this.toggleSquareThumbnails = () => {
            this.squareThumbnails = !this.squareThumbnails;
        };
        this.toggleSlideshow = () => {
            if (this.slideshowActive)
                this.stopSlideshow();
            else
                this.startSlideshow();
        };
        this.closeLightbox = () => {
            if (this.lightboxIndex < 0)
                return;
            this.stopSlideshow();
            this.lightboxIndex = -1;
            this.releaseScrollLock();
            this.restoreOriginalPosition();
            this.previouslyFocused?.focus();
            this.previouslyFocused = null;
            this.dispatchEvent(new Event("loomi-photo-close", { bubbles: true, composed: true }));
        };
        this.zoomInLightbox = () => {
            this.lightboxZoom = clamp(this.lightboxZoom + ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
        };
        this.zoomOutLightbox = () => {
            this.lightboxZoom = clamp(this.lightboxZoom - ZOOM_STEP, MIN_ZOOM, MAX_ZOOM);
        };
        /** Rotates 90° further left on every call — cumulative, so it keeps spinning rather than
         * snapping back to 0 (which would animate a jarring reverse spin). Resets only when the
         * lightbox moves to a different photo. */
        this.rotateLeft = () => {
            this.lightboxRotation -= 90;
            this.dispatchEvent(new CustomEvent("loomi-rotate", {
                detail: { index: this.lightboxIndex, rotation: this.lightboxRotation },
                bubbles: true,
                composed: true,
            }));
        };
        this.onShare = async () => {
            const item = this.visibleItems[this.lightboxIndex];
            if (!item)
                return;
            this.dispatchEvent(new CustomEvent("loomi-share", {
                detail: { index: this.lightboxIndex, src: item.src },
                bubbles: true,
                composed: true,
            }));
            if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
                try {
                    await navigator.share({ title: item.alt || undefined, url: item.src });
                }
                catch {
                    // User cancelled the share sheet, or the platform rejected it — nothing to recover from.
                }
                return;
            }
            if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
                try {
                    await navigator.clipboard.writeText(item.src);
                    this.showToast(loomiT("photoGallery.linkCopied", {}, this.locale));
                }
                catch {
                    // Clipboard permission denied — the loomi-share event above is still the extension point.
                }
            }
        };
        this.onKeyDown = (e) => {
            if (this.lightboxIndex < 0 || !this.containsFocus())
                return;
            switch (e.key) {
                case "Escape":
                    e.preventDefault();
                    this.closeLightbox();
                    return;
                case "ArrowRight":
                    e.preventDefault();
                    this.nextPhoto();
                    return;
                case "ArrowLeft":
                    e.preventDefault();
                    this.prevPhoto();
                    return;
                case "+":
                case "=":
                    if (this.lightboxShowZoomIn) {
                        e.preventDefault();
                        this.zoomInLightbox();
                    }
                    return;
                case "-":
                    if (this.lightboxShowZoomOut) {
                        e.preventDefault();
                        this.zoomOutLightbox();
                    }
                    return;
                case "r":
                    if (this.lightboxShowRotate) {
                        e.preventDefault();
                        this.rotateLeft();
                    }
                    return;
                case "Tab": {
                    const focusable = this.getLightboxFocusable();
                    if (!focusable.length)
                        return;
                    const current = deepActiveElement();
                    const index = focusable.indexOf(current);
                    if (e.shiftKey) {
                        if (index <= 0) {
                            e.preventDefault();
                            focusable[focusable.length - 1].focus();
                        }
                    }
                    else if (index === -1 || index === focusable.length - 1) {
                        e.preventDefault();
                        focusable[0].focus();
                    }
                    return;
                }
                default:
                    return;
            }
        };
        this.onBackdropClick = (e) => {
            if (e.target === e.currentTarget)
                this.closeLightbox();
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        document.addEventListener("keydown", this.onKeyDown);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        document.removeEventListener("keydown", this.onKeyDown);
        // moveToDocumentBody()/restoreOriginalPosition() reparent this element while it stays
        // connected, but appendChild()/insertBefore() still synchronously fire a disconnect +
        // reconnect pair around that move — without this guard, opening the lightbox (which
        // reparents to document.body) would immediately stop a slideshow started moments earlier.
        if (!this.isMovingInDom) {
            this.stopSlideshow();
            this.releaseScrollLock();
        }
        window.clearTimeout(this.toastTimer);
    }
    updated(changed) {
        super.updated(changed);
        if (changed.has("thumbSize")) {
            this.thumbSize = clamp(this.thumbSize, MIN_THUMB_SIZE, MAX_THUMB_SIZE);
        }
    }
    // ---- data ----
    get items() {
        return Array.from(this.querySelectorAll("loomi-photo-gallery-item"));
    }
    /** Distinct album names in first-seen order (blank/unset albums are excluded — they only show under "All"). */
    get albums() {
        const seen = new Set();
        for (const item of this.items)
            if (item.album)
                seen.add(item.album);
        return Array.from(seen);
    }
    get hasAlbums() {
        return this.albums.length > 0;
    }
    /** The photos visible in the grid and navigable in the lightbox, filtered by `activeAlbum`. */
    get visibleItems() {
        if (this.activeAlbum === ALL_ALBUM)
            return this.items;
        return this.items.filter((item) => item.album === this.activeAlbum);
    }
    albumCount(album) {
        return album === ALL_ALBUM ? this.items.length : this.items.filter((item) => item.album === album).length;
    }
    // ---- favourites ----
    toggleFavourite(item, index) {
        item.favourite = !item.favourite;
        this.requestUpdate();
        this.dispatchEvent(new CustomEvent("loomi-favourite", {
            detail: { index, src: item.src, favourite: item.favourite },
            bubbles: true,
            composed: true,
        }));
    }
    // ---- toolbar actions ----
    setActiveAlbum(album) {
        if (this.activeAlbum === album)
            return;
        this.activeAlbum = album;
        this.dispatchEvent(new CustomEvent("loomi-album-change", { detail: { album }, bubbles: true, composed: true }));
    }
    startSlideshow() {
        if (this.slideshowActive || !this.visibleItems.length)
            return;
        this.slideshowActive = true;
        if (this.lightboxIndex < 0)
            this.openLightbox(0);
        this.dispatchEvent(new Event("loomi-slideshow-start", { bubbles: true, composed: true }));
        this.scheduleSlideshowTick();
    }
    stopSlideshow() {
        window.clearTimeout(this.slideshowTimer);
        if (!this.slideshowActive)
            return;
        this.slideshowActive = false;
        this.dispatchEvent(new Event("loomi-slideshow-end", { bubbles: true, composed: true }));
    }
    scheduleSlideshowTick() {
        window.clearTimeout(this.slideshowTimer);
        this.slideshowTimer = window.setTimeout(() => {
            if (!this.slideshowActive)
                return;
            this.nextPhoto(true);
            this.scheduleSlideshowTick();
        }, this.slideshowInterval);
    }
    // ---- lightbox ----
    openLightbox(index) {
        const list = this.visibleItems;
        if (!list.length)
            return;
        this.previouslyFocused = deepActiveElement();
        this.moveToDocumentBody();
        this.lightboxIndex = clamp(index, 0, list.length - 1);
        this.lightboxZoom = MIN_ZOOM;
        this.lightboxRotation = 0;
        this.acquireScrollLock();
        this.dispatchEvent(new CustomEvent("loomi-photo-open", {
            detail: { index: this.lightboxIndex, src: list[this.lightboxIndex].src },
            bubbles: true,
            composed: true,
        }));
        this.updateComplete.then(() => {
            this.shadowRoot?.querySelector(".loomi-lightbox-close, .loomi-lightbox")?.focus();
        });
    }
    nextPhoto(fromSlideshow = false) {
        if (!fromSlideshow)
            this.stopSlideshow();
        const list = this.visibleItems;
        if (!list.length || this.lightboxIndex < 0)
            return;
        this.lightboxIndex = (this.lightboxIndex + 1) % list.length;
        this.lightboxZoom = MIN_ZOOM;
        this.lightboxRotation = 0;
        this.dispatchEvent(new CustomEvent("loomi-photo-change", {
            detail: { index: this.lightboxIndex, src: list[this.lightboxIndex].src },
            bubbles: true,
            composed: true,
        }));
    }
    prevPhoto() {
        this.stopSlideshow();
        const list = this.visibleItems;
        if (!list.length || this.lightboxIndex < 0)
            return;
        this.lightboxIndex = (this.lightboxIndex - 1 + list.length) % list.length;
        this.lightboxZoom = MIN_ZOOM;
        this.lightboxRotation = 0;
        this.dispatchEvent(new CustomEvent("loomi-photo-change", {
            detail: { index: this.lightboxIndex, src: list[this.lightboxIndex].src },
            bubbles: true,
            composed: true,
        }));
    }
    showToast(message) {
        window.clearTimeout(this.toastTimer);
        this.toastMessage = message;
        this.toastTimer = window.setTimeout(() => {
            this.toastMessage = "";
        }, TOAST_DURATION_MS);
    }
    acquireScrollLock() {
        if (this.hasScrollLock)
            return;
        lockBodyScroll();
        this.hasScrollLock = true;
    }
    releaseScrollLock() {
        if (!this.hasScrollLock)
            return;
        unlockBodyScroll();
        this.hasScrollLock = false;
    }
    moveToDocumentBody() {
        if (this.parentNode === document.body)
            return;
        this.originalParent = this.parentNode;
        this.originalNextSibling = this.nextSibling;
        this.isMovingInDom = true;
        document.body.appendChild(this);
        this.isMovingInDom = false;
    }
    restoreOriginalPosition() {
        if (!this.originalParent)
            return;
        const nextSibling = this.originalNextSibling?.parentNode === this.originalParent ? this.originalNextSibling : null;
        this.isMovingInDom = true;
        if (this.originalParent.isConnected)
            this.originalParent.insertBefore(this, nextSibling);
        this.isMovingInDom = false;
        this.originalParent = null;
        this.originalNextSibling = null;
    }
    containsFocus() {
        const active = deepActiveElement();
        if (!active)
            return false;
        return active === this || this.contains(active) || (this.shadowRoot?.contains(active) ?? false);
    }
    getLightboxFocusable() {
        return Array.from(this.shadowRoot?.querySelectorAll(`.loomi-lightbox ${FOCUSABLE_SELECTOR}`) ?? []);
    }
    // ---- render: toolbar ----
    renderToolbar() {
        const t = (key) => loomiT(`photoGallery.${key}`, {}, this.locale);
        return html `
      <div class="loomi-toolbar" role="toolbar" aria-label=${t("toolbar")}>
        ${this.showAlbumToggle && this.hasAlbums
            ? html `<button
              class="loomi-toolbar-btn ${this.albumPanelOpen ? "is-active" : ""}"
              type="button"
              aria-pressed=${this.albumPanelOpen ? "true" : "false"}
              aria-label=${this.albumPanelOpen ? t("hideAlbums") : t("showAlbums")}
              title=${this.albumPanelOpen ? t("hideAlbums") : t("showAlbums")}
              @click=${this.toggleAlbumPanel}
            >
              <loomi-icon name="bars-3" size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
        ${this.showZoomOut
            ? html `<button
              class="loomi-toolbar-btn"
              type="button"
              ?disabled=${this.thumbSize <= MIN_THUMB_SIZE}
              aria-label=${t("zoomOut")}
              title=${t("zoomOut")}
              @click=${this.zoomOutGrid}
            >
              <loomi-icon name="magnifying-glass-minus" size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
        ${this.showZoomIn
            ? html `<button
              class="loomi-toolbar-btn"
              type="button"
              ?disabled=${this.thumbSize >= MAX_THUMB_SIZE}
              aria-label=${t("zoomIn")}
              title=${t("zoomIn")}
              @click=${this.zoomInGrid}
            >
              <loomi-icon name="magnifying-glass-plus" size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
        ${this.showSquareToggle
            ? html `<button
              class="loomi-toolbar-btn ${this.squareThumbnails ? "is-active" : ""}"
              type="button"
              aria-pressed=${this.squareThumbnails ? "true" : "false"}
              aria-label=${this.squareThumbnails ? t("naturalThumbnails") : t("squareThumbnails")}
              title=${this.squareThumbnails ? t("naturalThumbnails") : t("squareThumbnails")}
              @click=${this.toggleSquareThumbnails}
            >
              <loomi-icon name="squares-2-x-2" size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
        ${this.showSlideshow
            ? html `<button
              class="loomi-toolbar-btn ${this.slideshowActive ? "is-active" : ""}"
              type="button"
              ?disabled=${!this.visibleItems.length}
              aria-pressed=${this.slideshowActive ? "true" : "false"}
              aria-label=${this.slideshowActive ? t("stopSlideshow") : t("startSlideshow")}
              title=${this.slideshowActive ? t("stopSlideshow") : t("startSlideshow")}
              @click=${this.toggleSlideshow}
            >
              <loomi-icon name=${this.slideshowActive ? "pause" : "play"} size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
      </div>
    `;
    }
    // ---- render: album panel ----
    renderAlbumButton(album, label, thumbSrc, style) {
        const active = this.activeAlbum === album;
        return html `
      <button
        class="loomi-album-btn ${style} ${active ? "is-active" : ""}"
        type="button"
        aria-pressed=${active ? "true" : "false"}
        @click=${() => this.setActiveAlbum(album)}
      >
        ${style === "thumbnails" && thumbSrc ? html `<img class="loomi-album-thumb" src=${thumbSrc} alt="" />` : nothing}
        <span class="loomi-album-label">${label}</span>
        <span class="loomi-album-count">${this.albumCount(album)}</span>
      </button>
    `;
    }
    renderAlbumPanel() {
        if (!this.hasAlbums || !this.albumPanelOpen)
            return nothing;
        const style = this.albumView;
        const items = this.items;
        const firstThumbFor = (album) => {
            const match = album === ALL_ALBUM ? items[0] : items.find((item) => item.album === album);
            return match ? match.thumb || match.src : "";
        };
        return html `
      <div class="loomi-albums ${style}" role="list" aria-label=${loomiT("photoGallery.albums", {}, this.locale)}>
        ${this.renderAlbumButton(ALL_ALBUM, loomiT("photoGallery.allAlbum", {}, this.locale), firstThumbFor(ALL_ALBUM), style)}
        ${this.albums.map((album) => this.renderAlbumButton(album, album, firstThumbFor(album), style))}
      </div>
    `;
    }
    // ---- render: grid ----
    renderGrid() {
        const list = this.visibleItems;
        if (!list.length) {
            return html `<div class="loomi-empty">${loomiT("photoGallery.empty", {}, this.locale)}</div>`;
        }
        return html `
      <div class="loomi-grid ${this.squareThumbnails ? "is-square" : ""}" style="--loomi-pg-tile: ${this.thumbSize}px">
        ${list.map((item, index) => this.renderTile(item, index))}
      </div>
    `;
    }
    renderTile(item, index) {
        const label = item.alt || loomiT("photoGallery.openPhoto", {}, this.locale);
        const favLabel = item.favourite
            ? loomiT("photoGallery.unfavourite", {}, this.locale)
            : loomiT("photoGallery.favourite", {}, this.locale);
        return html `
      <div class="loomi-tile">
        <button class="loomi-tile-btn" type="button" aria-label=${label} @click=${() => this.openLightbox(index)}>
          <img class="loomi-tile-img" src=${item.thumb || item.src} alt=${item.alt} loading="lazy" />
        </button>
        <button
          class="loomi-fav-btn ${item.favourite ? "is-active" : ""}"
          type="button"
          aria-pressed=${item.favourite ? "true" : "false"}
          aria-label=${favLabel}
          title=${favLabel}
          @click=${(e) => {
            e.stopPropagation();
            this.toggleFavourite(item, index);
        }}
        >
          <loomi-icon name="heart" variant=${item.favourite ? "solid" : "outline"} size="1.05rem"></loomi-icon>
        </button>
      </div>
    `;
    }
    // ---- render: lightbox ----
    renderLightbox() {
        if (this.lightboxIndex < 0)
            return nothing;
        const list = this.visibleItems;
        const item = list[this.lightboxIndex];
        if (!item)
            return nothing;
        const t = (key, params = {}) => loomiT(`photoGallery.${key}`, params, this.locale);
        const favLabel = item.favourite ? t("unfavourite") : t("favourite");
        const imgStyle = `transform: scale(${this.lightboxZoom}) rotate(${this.lightboxRotation}deg);`;
        return html `
      <div
        class="loomi-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label=${t("dialog")}
        style=${accentVars(this.color)}
        tabindex="-1"
        @click=${this.onBackdropClick}
      >
        <div class="loomi-lightbox-toolbar" role="toolbar" aria-label=${t("lightboxToolbar")}>
          <span class="loomi-lightbox-counter">${t("counter", { current: this.lightboxIndex + 1, total: list.length })}</span>
          <div class="loomi-lightbox-actions">
            ${this.lightboxShowZoomOut
            ? html `<button
                  class="loomi-lightbox-btn"
                  type="button"
                  ?disabled=${this.lightboxZoom <= MIN_ZOOM}
                  aria-label=${t("zoomOut")}
                  title=${t("zoomOut")}
                  @click=${this.zoomOutLightbox}
                >
                  <loomi-icon name="magnifying-glass-minus" size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
            ${this.lightboxShowZoomIn
            ? html `<button
                  class="loomi-lightbox-btn"
                  type="button"
                  ?disabled=${this.lightboxZoom >= MAX_ZOOM}
                  aria-label=${t("zoomIn")}
                  title=${t("zoomIn")}
                  @click=${this.zoomInLightbox}
                >
                  <loomi-icon name="magnifying-glass-plus" size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
            ${this.lightboxShowFavourite
            ? html `<button
                  class="loomi-lightbox-btn ${item.favourite ? "is-active" : ""}"
                  type="button"
                  aria-pressed=${item.favourite ? "true" : "false"}
                  aria-label=${favLabel}
                  title=${favLabel}
                  @click=${() => this.toggleFavourite(item, this.lightboxIndex)}
                >
                  <loomi-icon name="heart" variant=${item.favourite ? "solid" : "outline"} size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
            ${this.lightboxShowRotate
            ? html `<button
                  class="loomi-lightbox-btn"
                  type="button"
                  aria-label=${t("rotate")}
                  title=${t("rotate")}
                  @click=${this.rotateLeft}
                >
                  <loomi-icon name="arrow-uturn-left" size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
            ${this.lightboxShowShare
            ? html `<button class="loomi-lightbox-btn" type="button" aria-label=${t("share")} title=${t("share")} @click=${this.onShare}>
                  <loomi-icon name="share" size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
            ${this.lightboxShowClose
            ? html `<button
                  class="loomi-lightbox-btn loomi-lightbox-close"
                  type="button"
                  aria-label=${t("close")}
                  title=${t("close")}
                  @click=${this.closeLightbox}
                >
                  <loomi-icon name="x-mark" size="1.15rem"></loomi-icon>
                </button>`
            : nothing}
          </div>
        </div>

        <div class="loomi-lightbox-stage">
          ${list.length > 1
            ? html `<button class="loomi-lightbox-nav prev" type="button" aria-label=${t("previous")} @click=${() => this.prevPhoto()}>
                <loomi-icon name="chevron-left" size="1.5rem"></loomi-icon>
              </button>`
            : nothing}
          <img class="loomi-lightbox-img" src=${item.src} alt=${item.alt} style=${imgStyle} />
          ${list.length > 1
            ? html `<button class="loomi-lightbox-nav next" type="button" aria-label=${t("next")} @click=${() => this.nextPhoto()}>
                <loomi-icon name="chevron-right" size="1.5rem"></loomi-icon>
              </button>`
            : nothing}
        </div>

        ${item.caption || item.alt ? html `<div class="loomi-lightbox-caption">${item.caption || item.alt}</div>` : nothing}
        ${this.toastMessage ? html `<div class="loomi-toast" role="status" aria-live="polite">${this.toastMessage}</div>` : nothing}
      </div>
    `;
    }
    // ---- render ----
    render() {
        return html `
      <slot @slotchange=${this.onSlotChange} class="loomi-sr-only"></slot>
      ${this.renderToolbar()}
      <div class="loomi-body ${this.hasAlbums && this.albumPanelOpen ? `has-albums ${this.albumView}` : ""}">
        ${this.renderAlbumPanel()}
        ${this.renderGrid()}
      </div>
      ${this.renderLightbox()}
    `;
    }
};
__decorate([
    property()
], LoomiPhotoGallery.prototype, "locale", void 0);
__decorate([
    property()
], LoomiPhotoGallery.prototype, "color", void 0);
__decorate([
    property({ attribute: "album-view" })
], LoomiPhotoGallery.prototype, "albumView", void 0);
__decorate([
    property({ type: Boolean, attribute: "square-thumbnails", reflect: true, converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "squareThumbnails", void 0);
__decorate([
    property({ type: Number, attribute: "thumb-size" })
], LoomiPhotoGallery.prototype, "thumbSize", void 0);
__decorate([
    property({ type: Number, attribute: "slideshow-interval" })
], LoomiPhotoGallery.prototype, "slideshowInterval", void 0);
__decorate([
    property({ type: Boolean, attribute: "album-panel-open", reflect: true, converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "albumPanelOpen", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-album-toggle", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "showAlbumToggle", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-zoom-in", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "showZoomIn", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-zoom-out", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "showZoomOut", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-square-toggle", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "showSquareToggle", void 0);
__decorate([
    property({ type: Boolean, attribute: "show-slideshow", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "showSlideshow", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-zoom-in", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowZoomIn", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-zoom-out", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowZoomOut", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-favourite", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowFavourite", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-rotate", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowRotate", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-share", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowShare", void 0);
__decorate([
    property({ type: Boolean, attribute: "lightbox-show-close", converter: booleanAttribute })
], LoomiPhotoGallery.prototype, "lightboxShowClose", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "activeAlbum", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "lightboxIndex", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "lightboxZoom", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "lightboxRotation", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "slideshowActive", void 0);
__decorate([
    state()
], LoomiPhotoGallery.prototype, "toastMessage", void 0);
LoomiPhotoGallery = __decorate([
    customElement("loomi-photo-gallery")
], LoomiPhotoGallery);
export { LoomiPhotoGallery };
//# sourceMappingURL=loomi-photo-gallery.js.map