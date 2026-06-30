import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { DISK_ICON_NAMES } from "./generated/disk-manifest.js";
const DEFAULT_TYPE = "outline";
function toNameSets(byType) {
    const out = {};
    for (const type of Object.keys(byType)) {
        out[type] = new Set(byType[type]);
    }
    return out;
}
const NAME_SETS = {
    iconsax: toNameSets(DISK_ICON_NAMES.iconsax),
    untitledui: toNameSets(DISK_ICON_NAMES.untitledui),
};
/** Base URL for this package's own `dist/svg/` folder, resolved relative to
 * the running module so asset URLs are correct whether this package was
 * installed from npm or loaded straight from a CDN like esm.sh. */
const ASSET_BASE_URL = new URL("./svg/", import.meta.url);
export function isLoomiDiskIconSource(source) {
    return source === "iconsax" || source === "untitledui";
}
/** Names registered for a disk-based source/type. Falls back to `outline`
 * when `type` isn't available for that source (e.g. untitledui + "twotone"). */
export function loomiDiskIconNames(source, type = DEFAULT_TYPE) {
    const names = NAME_SETS[source][type] ?? NAME_SETS[source][DEFAULT_TYPE];
    return names ? Array.from(names) : [];
}
/** All icon types a disk-based source actually ships. */
export function loomiDiskIconTypes(source) {
    return Object.keys(NAME_SETS[source]);
}
/**
 * Resolves `(source, name, type)` to the .svg file's URL, or `undefined` if
 * `name` isn't registered. Lenient on `type`: an unavailable type (e.g.
 * `untitledui` + `"twotone"`) falls back to `"outline"` rather than failing,
 * matching how `<loomi-icon>` already treats an unknown Heroicons `variant`.
 */
export function getLoomiDiskIconUrl(source, name, type = DEFAULT_TYPE) {
    const bySource = NAME_SETS[source];
    const resolvedType = bySource[type]?.has(name) ? type : DEFAULT_TYPE;
    if (!bySource[resolvedType]?.has(name))
        return undefined;
    return new URL(`${source}/${resolvedType}/${encodeURIComponent(name)}.svg`, ASSET_BASE_URL).toString();
}
// One fetch per distinct icon per page, ever — every subsequent request for
// the same (source, name, type) reuses this cached, already-settled promise.
const markupCache = new Map();
async function fetchInnerMarkup(url) {
    try {
        const response = await fetch(url);
        if (!response.ok)
            return undefined;
        const raw = await response.text();
        const inner = raw.replace(/^[\s\S]*?<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");
        return unsafeSVG(inner);
    }
    catch {
        return undefined;
    }
}
/**
 * Fetches (and caches) the inner markup for a disk-based icon, ready to drop
 * into a Lit `html` template: `` html`<svg>${await loadLoomiDiskIcon(...)}</svg>` ``.
 * Resolves to `undefined` for an unregistered name or a failed fetch — callers
 * should fall back to their own placeholder/slot in that case.
 */
export function loadLoomiDiskIcon(source, name, type = DEFAULT_TYPE) {
    const url = getLoomiDiskIconUrl(source, name, type);
    if (!url)
        return Promise.resolve(undefined);
    let pending = markupCache.get(url);
    if (!pending) {
        pending = fetchInnerMarkup(url);
        markupCache.set(url, pending);
    }
    return pending;
}
//# sourceMappingURL=disk-icons.js.map