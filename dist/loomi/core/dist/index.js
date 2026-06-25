import { themeStyles } from "@loomi/theme";
// Re-export the shared theme surface so components import everything from @loomi/core.
export { themeStyles, LOOMI_COLORS, LOOMI_SHADES, isLoomiColor, } from "@loomi/theme";
/**
 * Prepend the shared theme tokens to a component's own styles. Use it in
 * `static styles` so every `var(--loomi-*)` reference resolves in the Shadow DOM:
 *
 * ```ts
 * static styles = loomiStyles(componentStyles);
 * ```
 */
export function loomiStyles(...styles) {
    return [themeStyles, ...styles];
}
/** A single token reference with its private-default fallback, e.g. `var(--loomi-red-600, var(--_loomi-red-600-default))`. */
function token(color, shade) {
    return `var(--loomi-${color}-${shade}, var(--_loomi-${color}-${shade}-default))`;
}
/** A single themed color value (with private-default fallback) for inline use. */
export function cssColor(color, shade) {
    return token(color || "primary", shade);
}
/**
 * Build the per-instance accent variables for a color. Set the returned string as the
 * element's inline `style` and reference the slots from plain CSS:
 *
 * | slot | shade |
 * | --- | --- |
 * | `--_loomi-accent` | 600 |
 * | `--_loomi-accent-strong` | 700 |
 * | `--_loomi-accent-soft` | 100 |
 * | `--_loomi-accent-softer` | 50 |
 * | `--_loomi-accent-ring` | 200 |
 * | `--_loomi-accent-fg` | 700 |
 * | `--_loomi-accent-border` | 200 |
 *
 * Defaults flow from the global `--loomi-<color>-*` theme slots, so a single `:root`
 * override re-skins every component that uses an accent.
 */
export function accentVars(color) {
    const c = color || "primary";
    return [
        `--_loomi-accent:${token(c, 600)}`,
        `--_loomi-accent-strong:${token(c, 700)}`,
        `--_loomi-accent-soft:${token(c, 100)}`,
        `--_loomi-accent-softer:${token(c, 50)}`,
        `--_loomi-accent-ring:${token(c, 200)}`,
        `--_loomi-accent-fg:${token(c, 700)}`,
        `--_loomi-accent-border:${token(c, 200)}`,
        "",
    ].join(";");
}
/**
 * Call `handler` when a pointer event lands outside `el` (crossing shadow boundaries
 * via composedPath). Returns a cleanup function. Handy for selects, dropmenus, popovers.
 */
export function onClickOutside(el, handler) {
    const listener = (e) => {
        if (!e.composedPath().includes(el))
            handler();
    };
    document.addEventListener("click", listener, true);
    return () => document.removeEventListener("click", listener, true);
}
//# sourceMappingURL=index.js.map