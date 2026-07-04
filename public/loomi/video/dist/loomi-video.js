var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { LoomiElement, loomiStyles, accentVars, onClickOutside } from "@loomidev/core";
import "@loomidev/button/loomi-button.js";
import "@loomidev/icon/loomi-icon.js";
import "@loomidev/slider/loomi-slider.js";
import "@loomidev/spinner/loomi-spinner.js";
import { componentStyles } from "./generated/styles.css.js";
const SEEK_STEP_SECONDS = 5;
const VOLUME_STEP = 0.1;
const AUTOHIDE_DELAY_MS = 2500;
const ERROR_MESSAGES = {
    1: "Playback was aborted.",
    2: "A network error occurred while loading this video.",
    3: "This video could not be decoded.",
    4: "This video format isn't supported.",
};
/** Same "default true, but a string attribute can still turn it off" converter used by
 * `@loomidev/slider`'s `show-tooltip`/`show-values` — lets `autohide-controls="false"` win
 * over the property default without needing a whole boolean-attribute-removal dance. */
const booleanAttribute = {
    fromAttribute(value) {
        return value !== null && value.toLowerCase() !== "false" && value !== "0";
    },
};
function formatTime(totalSeconds) {
    const safe = Number.isFinite(totalSeconds) && totalSeconds > 0 ? totalSeconds : 0;
    const whole = Math.floor(safe);
    const hours = Math.floor(whole / 3600);
    const minutes = Math.floor((whole % 3600) / 60);
    const seconds = whole % 60;
    const mm = hours > 0 ? String(minutes).padStart(2, "0") : String(minutes);
    const ss = String(seconds).padStart(2, "0");
    return hours > 0 ? `${hours}:${mm}:${ss}` : `${mm}:${ss}`;
}
/**
 * `<loomi-video>` — a themeable wrapper around the native `<video>` element. Renders the
 * browser's real media element under the hood (so every codec/format/network quirk is
 * handled by the platform), and layers a themeable, keyboard-accessible control bar on
 * top — built from `@loomidev/button` and `@loomidev/slider` — instead of the raw native
 * control UI. Set `controls` to opt into it; without it, this is just a styled `<video>`.
 *
 * `<source>` and `<track>` children are moved onto the real internal `<video>` element
 * (Shadow DOM slotting can't make a native media element discover them itself), so
 * multi-format fallback and subtitle/caption tracks work exactly like plain HTML.
 *
 * @slot - `<source>`/`<track>` children, forwarded onto the internal `<video>`.
 * @slot controls - Replaces the entire built-in control bar with custom markup.
 * @csspart video - The internal `<video>` element.
 * @csspart controls - The control bar container.
 * @fires play - Playback started (mirrors the native event; the internal `<video>` is
 *   shadow-encapsulated, so this is how consumers observe it).
 * @fires pause - Playback paused.
 * @fires ended - Playback reached the end.
 * @fires timeupdate - `detail: { currentTime, duration }`.
 * @fires volumechange - `detail: { volume, muted }`.
 * @fires fullscreenchange - `detail: { fullscreen }`.
 * @fires enterpictureinpicture / leavepictureinpicture
 * @fires video-error - `detail: { code, message }`. Not named "error" — that event
 *   type bubbling to `window` is conventionally read as an uncaught page error by test
 *   harnesses and error-tracking tools.
 */
let LoomiVideo = class LoomiVideo extends LoomiElement {
    constructor() {
        super(...arguments);
        this.src = "";
        this.poster = "";
        /** Shows the themed control bar, loading spinner, error state, and click-to-play
         * overlay. Left unset, this is a bare, unstyled passthrough to `<video>` — matching
         * native `<video>` (no `controls` attribute = no interactive UI at all). */
        this.controls = false;
        this.autoplay = false;
        this.loop = false;
        this.muted = false;
        this.volume = 1;
        this.preload = "metadata";
        /** Defaults to `true` (unlike native `<video>`) because without it, iOS Safari hijacks
         * `play()` into its own native fullscreen player — which would hide our control bar
         * entirely. Set `playsinline="false"` to opt back into that native behavior. */
        this.playsinline = true;
        this.crossOrigin = "";
        /** Accent color for the control bar (play button, seek/volume sliders, focus ring). */
        this.color = "primary";
        this.aspectRatio = "16 / 9";
        this.fit = "contain";
        /** Hide the control bar after a few seconds of inactivity while playing. */
        this.autohideControls = true;
        this.disablePip = false;
        this.disableFullscreen = false;
        this.playing = false;
        this.buffering = false;
        this.errored = false;
        this.errorMessage = "";
        this.playbackTime = 0;
        this.mediaDuration = NaN;
        this.isFullscreen = false;
        this.isPiP = false;
        this.controlsVisible = true;
        this.scrubbing = false;
        this.previewTime = 0;
        this.showCaptionsMenu = false;
        this.activeTrackIndex = -1;
        this.tracksTick = 0;
        /** False until just after the first render commits, then flipped once — guaranteeing
         * one extra render pass where `@query`-backed getters (like `pipAvailable`) see a real
         * `<video>` element. Without this, a video with no tracks, no error, and default
         * volume/muted never gets a second render, so anything computed from `this.videoEl`
         * at render time stays frozen at its (always-null-`videoEl`) first-render value. */
        this.mediaReady = false;
        this.hideTimer = 0;
        this.closeCaptionsMenuCleanup = null;
        this.onTracksChange = () => {
            const list = this.videoEl?.textTracks;
            this.activeTrackIndex = list
                ? Array.from(list).findIndex((track) => track.mode === "showing")
                : -1;
            this.tracksTick += 1;
        };
        // ---- media element event handlers ----
        this.onPlay = () => {
            this.playing = true;
            this.errored = false;
            this.showControlsTemporarily();
            this.dispatchEvent(new Event("play", { bubbles: true, composed: true }));
        };
        this.onPause = () => {
            this.playing = false;
            this.controlsVisible = true;
            this.clearHideTimer();
            this.dispatchEvent(new Event("pause", { bubbles: true, composed: true }));
        };
        this.onEnded = () => {
            this.playing = false;
            this.controlsVisible = true;
            this.clearHideTimer();
            this.dispatchEvent(new Event("ended", { bubbles: true, composed: true }));
        };
        this.onTimeUpdate = () => {
            const video = this.videoEl;
            if (!this.scrubbing)
                this.playbackTime = video.currentTime;
            this.dispatchEvent(new CustomEvent("timeupdate", {
                bubbles: true,
                composed: true,
                detail: { currentTime: video.currentTime, duration: video.duration },
            }));
        };
        this.onDurationChange = () => {
            this.mediaDuration = this.videoEl.duration;
        };
        this.onLoadedMetadata = () => {
            this.mediaDuration = this.videoEl.duration;
            this.buffering = false;
        };
        this.onWaiting = () => {
            this.buffering = true;
        };
        this.onCanPlay = () => {
            this.buffering = false;
        };
        this.onVolumeChange = () => {
            const video = this.videoEl;
            this.volume = video.volume;
            this.muted = video.muted;
            this.dispatchEvent(new CustomEvent("volumechange", {
                bubbles: true,
                composed: true,
                detail: { volume: video.volume, muted: video.muted },
            }));
        };
        this.onMediaError = () => {
            const error = this.videoEl?.error;
            this.errored = true;
            this.buffering = false;
            this.errorMessage = (error && ERROR_MESSAGES[error.code]) || "Something went wrong playing this video.";
            this.dispatchEvent(
            // Not named "error": that event type bubbling all the way to `window` gets
            // misread as an uncaught page error by test harnesses and error-tracking tools
            // (both listen for a bare "error" reaching `window`), which isn't what this is.
            new CustomEvent("video-error", {
                bubbles: true,
                composed: true,
                detail: { code: error?.code, message: this.errorMessage },
            }));
        };
        this.onEnterPiP = () => {
            this.isPiP = true;
            this.dispatchEvent(new Event("enterpictureinpicture", { bubbles: true, composed: true }));
        };
        this.onLeavePiP = () => {
            this.isPiP = false;
            this.dispatchEvent(new Event("leavepictureinpicture", { bubbles: true, composed: true }));
        };
        this.onFullscreenChange = () => {
            this.isFullscreen = document.fullscreenElement === this;
            this.dispatchEvent(new CustomEvent("fullscreenchange", {
                bubbles: true,
                composed: true,
                detail: { fullscreen: this.isFullscreen },
            }));
        };
        this.onRetry = () => {
            this.errored = false;
            this.errorMessage = "";
            this.videoEl?.load();
        };
        // ---- interaction ----
        this.onSurfaceClick = () => {
            if (!this.controls || this.errored)
                return;
            this.togglePlay();
        };
        this.onSurfaceDblClick = () => {
            if (!this.controls || this.disableFullscreen)
                return;
            void this.toggleFullscreen();
        };
        this.onSeekInput = (event) => {
            this.scrubbing = true;
            this.previewTime = event.target.selected;
        };
        this.onSeekChange = (event) => {
            const value = event.target.selected;
            this.scrubbing = false;
            this.seek(value);
        };
        this.onVolumeInput = (event) => {
            this.setVolume(event.target.selected);
        };
        this.onToggleCaptionsMenu = () => {
            if (this.showCaptionsMenu)
                this.closeCaptionsMenu();
            else
                this.openCaptionsMenu();
        };
        this.onKeyDown = (event) => {
            const origin = event.composedPath()[0];
            // Native range inputs (the seek/volume sliders) handle their own arrow keys; a
            // focused button's own Space/Enter activation already calls the right handler via
            // its `click` listener, so don't double-fire it from here.
            if (origin instanceof HTMLInputElement)
                return;
            if ((event.key === " " || event.key === "Enter") && origin instanceof HTMLButtonElement)
                return;
            switch (event.key) {
                case " ":
                case "k":
                    event.preventDefault();
                    this.togglePlay();
                    break;
                case "ArrowRight":
                    event.preventDefault();
                    this.seek(this.playbackTime + SEEK_STEP_SECONDS);
                    break;
                case "ArrowLeft":
                    event.preventDefault();
                    this.seek(this.playbackTime - SEEK_STEP_SECONDS);
                    break;
                case "ArrowUp":
                    event.preventDefault();
                    this.setVolume((this.muted ? 0 : this.volume) + VOLUME_STEP);
                    break;
                case "ArrowDown":
                    event.preventDefault();
                    this.setVolume((this.muted ? 0 : this.volume) - VOLUME_STEP);
                    break;
                case "m":
                    event.preventDefault();
                    this.toggleMute();
                    break;
                case "f":
                    event.preventDefault();
                    void this.toggleFullscreen();
                    break;
                case "c":
                    if (this.hasTracks) {
                        event.preventDefault();
                        this.selectTrack(this.activeTrackIndex === -1 ? 0 : -1);
                    }
                    break;
                case "Home":
                    event.preventDefault();
                    this.seek(0);
                    break;
                case "End":
                    if (this.hasSeekableDuration) {
                        event.preventDefault();
                        this.seek(this.mediaDuration);
                    }
                    break;
                default:
                    break;
            }
        };
        // ---- control bar autohide ----
        this.onActivity = () => {
            this.showControlsTemporarily();
        };
        this.onPointerLeave = () => {
            if (this.playing && this.autohideControls)
                this.scheduleHideControls(300);
        };
    }
    static { this.styles = loomiStyles(componentStyles); }
    connectedCallback() {
        super.connectedCallback();
        if (!this.hasAttribute("tabindex"))
            this.tabIndex = 0;
        this.addEventListener("keydown", this.onKeyDown);
        document.addEventListener("fullscreenchange", this.onFullscreenChange);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.removeEventListener("keydown", this.onKeyDown);
        document.removeEventListener("fullscreenchange", this.onFullscreenChange);
        this.mutationObserver?.disconnect();
        this.clearHideTimer();
        this.closeCaptionsMenu();
        this.releaseMedia();
    }
    /** Detaches listeners and aborts the underlying network/decode resources. Merely
     * removing a `<video>` from the DOM does not release those on its own — leaving
     * enough un-aborted media elements behind (e.g. across many short-lived instances)
     * can exhaust the browser's media pipeline. */
    releaseMedia() {
        const video = this.videoEl;
        if (!video)
            return;
        video.removeEventListener("play", this.onPlay);
        video.removeEventListener("pause", this.onPause);
        video.removeEventListener("ended", this.onEnded);
        video.removeEventListener("timeupdate", this.onTimeUpdate);
        video.removeEventListener("durationchange", this.onDurationChange);
        video.removeEventListener("loadedmetadata", this.onLoadedMetadata);
        video.removeEventListener("waiting", this.onWaiting);
        video.removeEventListener("playing", this.onCanPlay);
        video.removeEventListener("canplay", this.onCanPlay);
        video.removeEventListener("volumechange", this.onVolumeChange);
        video.removeEventListener("error", this.onMediaError);
        video.removeEventListener("enterpictureinpicture", this.onEnterPiP);
        video.removeEventListener("leavepictureinpicture", this.onLeavePiP);
        video.pause();
        video.removeAttribute("src");
        video.load();
        const list = video.textTracks;
        list.removeEventListener("addtrack", this.onTracksChange);
        list.removeEventListener("removetrack", this.onTracksChange);
        list.removeEventListener("change", this.onTracksChange);
    }
    firstUpdated() {
        const video = this.videoEl;
        if (!video)
            return;
        video.addEventListener("play", this.onPlay);
        video.addEventListener("pause", this.onPause);
        video.addEventListener("ended", this.onEnded);
        video.addEventListener("timeupdate", this.onTimeUpdate);
        video.addEventListener("durationchange", this.onDurationChange);
        video.addEventListener("loadedmetadata", this.onLoadedMetadata);
        video.addEventListener("waiting", this.onWaiting);
        video.addEventListener("playing", this.onCanPlay);
        video.addEventListener("canplay", this.onCanPlay);
        video.addEventListener("volumechange", this.onVolumeChange);
        video.addEventListener("error", this.onMediaError);
        video.addEventListener("enterpictureinpicture", this.onEnterPiP);
        video.addEventListener("leavepictureinpicture", this.onLeavePiP);
        this.volume = video.volume;
        this.syncMediaChildren();
        this.mutationObserver = new MutationObserver(() => this.syncMediaChildren());
        this.mutationObserver.observe(this, { childList: true });
        this.mediaReady = true;
    }
    // ---- public, imperative API (mirrors the parts of HTMLVideoElement that make sense
    // to expose from behind the Shadow DOM boundary) ----
    get paused() {
        return this.videoEl?.paused ?? true;
    }
    get ended() {
        return this.videoEl?.ended ?? false;
    }
    get currentTime() {
        return this.videoEl?.currentTime ?? 0;
    }
    set currentTime(value) {
        this.seek(value);
    }
    get duration() {
        return this.videoEl?.duration ?? NaN;
    }
    play() {
        this.videoEl?.play().catch(() => { });
    }
    pause() {
        this.videoEl?.pause();
    }
    togglePlay() {
        const video = this.videoEl;
        if (!video || this.errored)
            return;
        if (video.paused || video.ended)
            this.play();
        else
            this.pause();
    }
    seek(seconds) {
        const video = this.videoEl;
        if (!video)
            return;
        const max = this.hasSeekableDuration ? this.mediaDuration : Number.MAX_SAFE_INTEGER;
        video.currentTime = Math.min(max, Math.max(0, seconds));
    }
    toggleMute() {
        const video = this.videoEl;
        if (video)
            video.muted = !video.muted;
    }
    setVolume(value) {
        const video = this.videoEl;
        if (!video)
            return;
        const clamped = Math.min(1, Math.max(0, value));
        video.volume = clamped;
        video.muted = clamped === 0;
    }
    async toggleFullscreen() {
        if (this.disableFullscreen)
            return;
        if (document.fullscreenElement === this)
            await document.exitFullscreen();
        else
            await this.requestFullscreen().catch(() => { });
    }
    async togglePictureInPicture() {
        const video = this.videoEl;
        if (!video || !this.pipAvailable)
            return;
        if (document.pictureInPictureElement === video)
            await document.exitPictureInPicture();
        else
            await video.requestPictureInPicture().catch(() => { });
    }
    // ---- derived render state ----
    get displayTime() {
        return this.scrubbing ? this.previewTime : this.playbackTime;
    }
    get hasSeekableDuration() {
        return Number.isFinite(this.mediaDuration) && this.mediaDuration > 0;
    }
    get isLiveStream() {
        return this.mediaDuration === Infinity;
    }
    get pipAvailable() {
        return (this.mediaReady &&
            !this.disablePip &&
            typeof document !== "undefined" &&
            "pictureInPictureEnabled" in document &&
            document.pictureInPictureEnabled &&
            typeof this.videoEl?.requestPictureInPicture === "function");
    }
    get tracks() {
        void this.tracksTick; // read so this getter re-evaluates whenever tracks structurally change
        const list = this.videoEl?.textTracks;
        if (!list)
            return [];
        return Array.from(list).map((track, index) => ({
            label: track.label || track.language || `Track ${index + 1}`,
        }));
    }
    get hasTracks() {
        return this.tracks.length > 0;
    }
    // ---- <source>/<track> forwarding ----
    syncMediaChildren() {
        const video = this.videoEl;
        if (!video)
            return;
        const nodes = Array.from(this.children).filter((el) => el.tagName === "SOURCE" || el.tagName === "TRACK");
        if (nodes.length === 0)
            return;
        for (const node of nodes)
            video.appendChild(node);
        this.watchTracks();
    }
    watchTracks() {
        const list = this.videoEl?.textTracks;
        if (!list)
            return;
        list.addEventListener("addtrack", this.onTracksChange);
        list.addEventListener("removetrack", this.onTracksChange);
        list.addEventListener("change", this.onTracksChange);
        this.onTracksChange();
    }
    selectTrack(index) {
        const list = this.videoEl?.textTracks;
        if (!list)
            return;
        for (let i = 0; i < list.length; i += 1)
            list[i].mode = i === index ? "showing" : "disabled";
        this.activeTrackIndex = index;
        this.closeCaptionsMenu();
    }
    openCaptionsMenu() {
        this.showCaptionsMenu = true;
        if (this.ccGroupEl) {
            this.closeCaptionsMenuCleanup = onClickOutside(this.ccGroupEl, () => this.closeCaptionsMenu());
        }
    }
    closeCaptionsMenu() {
        this.showCaptionsMenu = false;
        this.closeCaptionsMenuCleanup?.();
        this.closeCaptionsMenuCleanup = null;
    }
    showControlsTemporarily() {
        this.controlsVisible = true;
        this.clearHideTimer();
        if (this.playing && this.autohideControls)
            this.scheduleHideControls(AUTOHIDE_DELAY_MS);
    }
    scheduleHideControls(delay) {
        this.clearHideTimer();
        this.hideTimer = window.setTimeout(() => {
            if (this.showCaptionsMenu || this.matches(":focus-within"))
                return;
            this.controlsVisible = false;
        }, delay);
    }
    clearHideTimer() {
        if (!this.hideTimer)
            return;
        window.clearTimeout(this.hideTimer);
        this.hideTimer = 0;
    }
    // ---- render ----
    render() {
        const wrapStyle = `${accentVars(this.color)}aspect-ratio: ${this.aspectRatio};`;
        return html `<div
      class="loomi-video ${this.controlsVisible ? "" : "controls-hidden"}"
      style=${wrapStyle}
      @pointermove=${this.onActivity}
      @focusin=${this.onActivity}
      @mouseleave=${this.onPointerLeave}
    >
      <video
        part="video"
        class="loomi-media fit-${this.fit}"
        tabindex="-1"
        src=${ifDefined(this.src || undefined)}
        poster=${ifDefined(this.poster || undefined)}
        ?autoplay=${this.autoplay}
        ?loop=${this.loop}
        .muted=${this.muted}
        .volume=${this.volume}
        preload=${this.preload}
        .crossOrigin=${this.crossOrigin || null}
        ?playsinline=${this.playsinline}
        ?webkit-playsinline=${this.playsinline}
        @click=${this.onSurfaceClick}
        @dblclick=${this.onSurfaceDblClick}
      ></video>

      ${this.controls ? this.renderChrome() : nothing}
    </div>`;
    }
    renderChrome() {
        return html `
      ${this.buffering && !this.errored ? this.renderLoading() : nothing}
      ${this.errored ? this.renderError() : nothing}
      ${!this.errored && !this.buffering ? this.renderCenterPlay() : nothing}
      <div class="loomi-scrim" aria-hidden="true"></div>
      ${this.renderControlsBar()}
    `;
    }
    renderLoading() {
        return html `<div class="loomi-overlay loomi-loading" part="loading">
      <loomi-spinner size="big" type="spinner" color=${this.color} label="Loading"></loomi-spinner>
    </div>`;
    }
    renderError() {
        return html `<div class="loomi-overlay loomi-error" part="error" role="alert">
      <loomi-icon name="exclamation-circle" size="2.5rem"></loomi-icon>
      <p class="loomi-error-message">${this.errorMessage}</p>
      <loomi-button color=${this.color} icon="arrow-path" @click=${this.onRetry}>Retry</loomi-button>
    </div>`;
    }
    renderCenterPlay() {
        if (this.playing)
            return nothing;
        return html `<div class="loomi-center">
      <loomi-button
        class="loomi-center-play"
        color=${this.color}
        radius="full"
        size="big"
        icon=${this.ended ? "arrow-path" : "play"}
        @click=${this.togglePlay}
        ><span class="loomi-sr-only">${this.ended ? "Replay" : "Play"}</span></loomi-button
      >
    </div>`;
    }
    renderControlsBar() {
        const barStyle = `${accentVars(this.color)}--loomi-surface-border: rgba(255, 255, 255, 0.35);`;
        return html `<div
      class="loomi-controls-bar ${this.controlsVisible ? "" : "is-hidden"}"
      part="controls"
      style=${barStyle}
    >
      <slot name="controls">
        <button
          class="loomi-ctrl-btn"
          type="button"
          aria-label=${this.playing ? "Pause" : "Play"}
          @click=${this.togglePlay}
        >
          <loomi-icon name=${this.playing ? "pause" : "play"} size="1.15rem"></loomi-icon>
        </button>

        ${this.renderTimeline()}

        <div class="loomi-volume-group">
          <button
            class="loomi-ctrl-btn"
            type="button"
            aria-label=${this.muted || this.volume === 0 ? "Unmute" : "Mute"}
            @click=${this.toggleMute}
          >
            <loomi-icon
              name=${this.muted || this.volume === 0 ? "speaker-x-mark" : "speaker-wave"}
              size="1.15rem"
            ></loomi-icon>
          </button>
          <loomi-slider
            class="loomi-volume"
            color=${this.color}
            min="0"
            max="1"
            step="0.05"
            .selected=${this.muted ? 0 : this.volume}
            show-tooltip="false"
            show-values="false"
            aria-label="Volume"
            @input=${this.onVolumeInput}
          ></loomi-slider>
        </div>

        ${this.hasTracks
            ? html `<div class="loomi-cc-group">
              <button
                class="loomi-ctrl-btn ${this.activeTrackIndex >= 0 ? "is-active" : ""}"
                type="button"
                aria-label="Captions"
                aria-expanded=${this.showCaptionsMenu ? "true" : "false"}
                @click=${this.onToggleCaptionsMenu}
              >
                <loomi-icon name="language" size="1.15rem"></loomi-icon>
              </button>
              ${this.showCaptionsMenu ? this.renderCaptionsMenu() : nothing}
            </div>`
            : nothing}
        ${this.pipAvailable
            ? html `<button
              class="loomi-ctrl-btn"
              type="button"
              aria-label=${this.isPiP ? "Exit picture-in-picture" : "Picture-in-picture"}
              @click=${this.togglePictureInPicture}
            >
              <loomi-icon name="rectangle-group" size="1.1rem"></loomi-icon>
            </button>`
            : nothing}
        ${!this.disableFullscreen
            ? html `<button
              class="loomi-ctrl-btn"
              type="button"
              aria-label=${this.isFullscreen ? "Exit fullscreen" : "Fullscreen"}
              @click=${this.toggleFullscreen}
            >
              <loomi-icon
                name=${this.isFullscreen ? "arrows-pointing-in" : "arrows-pointing-out"}
                size="1.15rem"
              ></loomi-icon>
            </button>`
            : nothing}
      </slot>
    </div>`;
    }
    renderTimeline() {
        if (this.isLiveStream) {
            return html `<span class="loomi-live-badge">LIVE</span>
        <div class="loomi-spacer"></div>`;
        }
        if (!this.hasSeekableDuration)
            return html `<div class="loomi-spacer"></div>`;
        return html `<span class="loomi-time" aria-hidden="true">${formatTime(this.displayTime)}</span>
      <loomi-slider
        class="loomi-seek"
        color=${this.color}
        min="0"
        max=${this.mediaDuration}
        step="0.1"
        .selected=${this.displayTime}
        show-tooltip="false"
        show-values="false"
        aria-label="Seek"
        @input=${this.onSeekInput}
        @change=${this.onSeekChange}
      ></loomi-slider>
      <span class="loomi-time" aria-hidden="true">${formatTime(this.mediaDuration)}</span>`;
    }
    renderCaptionsMenu() {
        return html `<div class="loomi-cc-menu" role="menu">
      <button
        class="loomi-cc-item ${this.activeTrackIndex === -1 ? "is-selected" : ""}"
        role="menuitemradio"
        aria-checked=${this.activeTrackIndex === -1 ? "true" : "false"}
        @click=${() => this.selectTrack(-1)}
      >
        Off
      </button>
      ${this.tracks.map((track, index) => html `<button
          class="loomi-cc-item ${this.activeTrackIndex === index ? "is-selected" : ""}"
          role="menuitemradio"
          aria-checked=${this.activeTrackIndex === index ? "true" : "false"}
          @click=${() => this.selectTrack(index)}
        >
          ${track.label}
        </button>`)}
    </div>`;
    }
};
__decorate([
    property()
], LoomiVideo.prototype, "src", void 0);
__decorate([
    property()
], LoomiVideo.prototype, "poster", void 0);
__decorate([
    property({ type: Boolean, reflect: true })
], LoomiVideo.prototype, "controls", void 0);
__decorate([
    property({ type: Boolean })
], LoomiVideo.prototype, "autoplay", void 0);
__decorate([
    property({ type: Boolean })
], LoomiVideo.prototype, "loop", void 0);
__decorate([
    property({ type: Boolean })
], LoomiVideo.prototype, "muted", void 0);
__decorate([
    property({ type: Number })
], LoomiVideo.prototype, "volume", void 0);
__decorate([
    property()
], LoomiVideo.prototype, "preload", void 0);
__decorate([
    property({ type: Boolean, converter: booleanAttribute })
], LoomiVideo.prototype, "playsinline", void 0);
__decorate([
    property()
], LoomiVideo.prototype, "crossOrigin", void 0);
__decorate([
    property()
], LoomiVideo.prototype, "color", void 0);
__decorate([
    property({ attribute: "aspect-ratio" })
], LoomiVideo.prototype, "aspectRatio", void 0);
__decorate([
    property()
], LoomiVideo.prototype, "fit", void 0);
__decorate([
    property({ type: Boolean, attribute: "autohide-controls", converter: booleanAttribute })
], LoomiVideo.prototype, "autohideControls", void 0);
__decorate([
    property({ type: Boolean, attribute: "disable-pip" })
], LoomiVideo.prototype, "disablePip", void 0);
__decorate([
    property({ type: Boolean, attribute: "disable-fullscreen" })
], LoomiVideo.prototype, "disableFullscreen", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "playing", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "buffering", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "errored", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "errorMessage", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "playbackTime", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "mediaDuration", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "isFullscreen", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "isPiP", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "controlsVisible", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "scrubbing", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "previewTime", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "showCaptionsMenu", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "activeTrackIndex", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "tracksTick", void 0);
__decorate([
    state()
], LoomiVideo.prototype, "mediaReady", void 0);
__decorate([
    query("video")
], LoomiVideo.prototype, "videoEl", void 0);
__decorate([
    query(".loomi-cc-group")
], LoomiVideo.prototype, "ccGroupEl", void 0);
LoomiVideo = __decorate([
    customElement("loomi-video")
], LoomiVideo);
export { LoomiVideo };
//# sourceMappingURL=loomi-video.js.map