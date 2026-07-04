export const SIDEBAR_WIDTH = "16rem";
export const SIDEBAR_WIDTH_ICON = "3rem";
export const SIDEBAR_WIDTH_MOBILE = "18rem";
export const SIDEBAR_KEYBOARD_SHORTCUT = "b";
export const SIDEBAR_STORAGE_KEY = "loomi-sidebar-open";
export const SIDEBAR_MOBILE_BREAKPOINT = 768;
export function findSidebarProvider(node) {
    const el = node instanceof Element ? node : node?.parentElement ?? null;
    return el?.closest("loomi-sidebar-provider");
}
export function readSidebarPreference() {
    if (typeof localStorage === "undefined")
        return true;
    const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (stored === null)
        return true;
    return stored !== "false";
}
export function writeSidebarPreference(open) {
    if (typeof localStorage === "undefined")
        return;
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(open));
}
export const SIDEBAR_ICON_COLLAPSED_ATTR = "data-icon-collapsed";
export function isSidebarIconCollapsed(node) {
    const provider = findSidebarProvider(node);
    return provider?.collapsible === "icon" && provider?.state === "collapsed";
}
export function syncSidebarIconCollapsed(el) {
    el.toggleAttribute(SIDEBAR_ICON_COLLAPSED_ATTR, isSidebarIconCollapsed(el));
}
//# sourceMappingURL=sidebar-context.js.map