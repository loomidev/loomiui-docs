// Display taxonomy for the /components/ gallery page ONLY — a different grouping than
// scripts/loomiui-packages.mjs's CATEGORY (which drives the import map, sidebar
// autogeneration, and asset copying, and can't change without touching those). This is
// purely "which of the 7 marketing-facing buckets does each component's card show up
// in" for the components index page's sidebar/filter pills, matching the same
// Data Entry / Feedback / Navigation / Overlay / Data Display / Layout / Media split
// already named (but not wired up) in src/pages/index.astro's `componentCategories`.
import { COMPONENT_NAMES } from "../../scripts/loomiui-packages.mjs";

export const DISPLAY_CATEGORIES = [
  { key: "data-entry", label: "Data Entry", icon: "pencil-square" },
  { key: "feedback", label: "Feedback", icon: "chat-bubble-left-right" },
  { key: "navigation", label: "Navigation", icon: "map" },
  { key: "overlay", label: "Overlay", icon: "square-3-stack-3-d" },
  { key: "data-display", label: "Data Display", icon: "table-cells" },
  { key: "layout", label: "Layout", icon: "rectangle-group" },
  { key: "media", label: "Media", icon: "photo" },
];

const MEMBERS = {
  "data-entry": [
    "input", "textarea", "select", "checkbox", "radio", "toggle", "number", "slider",
    "datepicker", "timepicker", "timezonepicker", "colorpicker", "filepicker", "checkcards",
    "code", "countries", "creditcard", "text-editor", "tag-input",
  ],
  feedback: ["alert", "notification", "bell", "spinner", "progress", "processing"],
  navigation: ["tab", "pagination", "dropmenu", "theme-switcher"],
  overlay: ["modal", "popover", "tooltip", "drawer"],
  "data-display": ["table", "tag", "statistic", "rating", "timeline", "listview", "contact-card", "chart", "horizontal-line-graph"],
  layout: ["button", "card", "accordion", "centered-content", "sortable"],
  media: ["icon", "avatar", "empty-state"],
};

// Every COMPONENT_NAMES entry must land in exactly one bucket above — fail fast at
// build time (rather than silently dropping a card) if a new package is added to
// loomiui-packages.mjs without a matching entry here.
const ASSIGNED = new Set(Object.values(MEMBERS).flat());
const missing = COMPONENT_NAMES.filter((name) => !ASSIGNED.has(name));
if (missing.length > 0) {
  throw new Error(`component-categories.mjs: no display category for: ${missing.join(", ")}`);
}

export function categoryKeyOf(name) {
  for (const [key, names] of Object.entries(MEMBERS)) {
    if (names.includes(name)) return key;
  }
  return null;
}

export function categoryCounts() {
  return Object.fromEntries(DISPLAY_CATEGORIES.map(({ key }) => [key, MEMBERS[key].length]));
}
