// Single source of truth for "which @loomidev/* packages exist and what category they're
// in", shared by astro.config.mjs (import map + sidebar), copy-component-assets.mjs
// (which dist/ folders to publish), and gen-component-docs.mjs (which READMEs to read).
// Mirrors the @loomidev/forms, @loomidev/content and @loomidev/navigation grouping packages in
// the components monorepo — keep in sync if a component is added there.

export const INFRA = ["theme", "core", "icons"];

export const CATEGORY = {
  standalone: ["button", "icon", "spinner", "alert", "bell", "modal", "notification", "table"],
  forms: [
    "input", "textarea", "select", "checkbox", "radio", "toggle", "number", "slider",
    "code", "checkcards", "datepicker", "timepicker", "colorpicker", "filepicker",
  ],
  content: [
    "card", "avatar", "accordion", "tag", "tooltip", "popover", "empty-state", "statistic",
    "rating", "timeline", "progress", "listview", "contact-card", "centered-content",
    "sortable", "processing", "horizontal-line-graph", "chart",
  ],
  navigation: ["tab", "pagination", "dropmenu", "theme-switcher"],
};

export const COMPONENT_NAMES = Object.values(CATEGORY).flat();
export const ALL_PACKAGE_NAMES = [...INFRA, ...COMPONENT_NAMES];
export const PACKAGE_PREFIX = "@loomidev";

export function categoryOf(name) {
  for (const [cat, names] of Object.entries(CATEGORY)) if (names.includes(name)) return cat;
  return null;
}

/** The custom element tag a package's docs/build artifacts are keyed by, e.g. "loomi-button". */
export function tagNameFor(name) {
  return `loomi-${name}`;
}