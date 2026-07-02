/** Pro catalog derived from strategy/templates.md and strategy/themes.md */

export const PRO_AREAS = [
  { key: "templates", label: "Templates", icon: "rectangle-stack", href: "/pro/templates/" },
  { key: "themes", label: "Themes", icon: "swatch", href: "/pro/themes/" },
];

export const PRO_CATEGORIES = [
  { key: "template-variants", label: "Template Variants", area: "templates", icon: "squares-plus" },
  { key: "admin-pro", label: "Admin Pro", area: "templates", icon: "shield-check" },
  { key: "saas-starter", label: "SaaS Starter", area: "templates", icon: "rocket-launch" },
  { key: "crm", label: "CRM", area: "templates", icon: "users" },
  { key: "analytics", label: "Analytics Dashboard", area: "templates", icon: "chart-bar" },
  {
    key: "token-system",
    label: "Token System",
    area: "themes",
    icon: "variable",
    href: "/pro/themes/token-system/",
  },
  {
    key: "theme-presets",
    label: "Theme Presets",
    area: "themes",
    icon: "paint-brush",
    href: "/pro/themes/theme-presets/",
  },
  {
    key: "theme-builder",
    label: "Theme Builder",
    area: "themes",
    icon: "adjustments-horizontal",
    href: "/pro/themes/theme-builder/",
  },
  { key: "figma-kit", label: "Figma Kit", area: "themes", icon: "beaker", href: "/pro/themes/figma-kit/" },
  { key: "assets-brand", label: "Assets & Brand", area: "themes", icon: "photo", href: "/pro/themes/assets-brand/" },
  {
    key: "accessibility-quality",
    label: "Accessibility & Quality",
    area: "themes",
    icon: "eye",
    href: "/pro/themes/accessibility-quality/",
  },
];

const ITEMS = {
  "template-variants": [
    "Admin Pro vite-lit",
    "Admin Pro next-react",
    "Admin Pro nuxt",
    "Admin Pro laravel-inertia",
    "SaaS Starter vite-lit",
    "SaaS Starter next-react",
    "CRM vite-lit",
    "CRM next-react",
    "Analytics Dashboard vite-lit",
    "Analytics Dashboard next-react",
  ],
  "admin-pro": [
    "Dashboard page",
    "Users page",
    "User detail page",
    "Teams or organizations page",
    "Roles and permissions page",
    "Permission matrix",
    "Activity log page",
    "Settings page",
    "Billing page",
    "Notifications page",
    "Profile page",
    "Reports page",
    "Data table example",
    "Form wizard example",
    "Empty states",
    "Loading states",
    "Error states",
  ],
  "saas-starter": [
    "Sign in page",
    "Sign up page",
    "Forgot password page",
    "Reset password page",
    "Onboarding flow",
    "Organization switcher",
    "Invite members flow",
    "Workspace settings",
    "Account settings",
    "Subscription and billing",
    "Usage page",
    "API keys page",
    "Notifications settings",
    "Team roles page",
  ],
  crm: [
    "Leads page",
    "Lead detail page",
    "Contacts page",
    "Contact detail page",
    "Companies page",
    "Company detail page",
    "Deals pipeline",
    "Deal detail page",
    "Tasks page",
    "Notes panel",
    "Activity timeline",
    "Reports page",
    "Saved views",
    "Import flow",
  ],
  analytics: [
    "Overview page",
    "Metrics page",
    "Segments page",
    "Cohorts page",
    "Reports page",
    "Saved reports",
    "Export center",
    "Date range comparison",
    "Alerts page",
    "Empty metric states",
    "Loading chart states",
    "Error chart states",
  ],
  "token-system": [
    "Color tokens",
    "Typography tokens",
    "Spacing tokens",
    "Radius tokens",
    "Shadow tokens",
    "Border tokens",
    "Motion tokens",
    "Z-index tokens",
    "Density tokens",
    "Component-level tokens",
    "Dark mode tokens",
    "High contrast tokens",
  ],
  "theme-presets": [
    "Default Loomi theme",
    "SaaS admin theme",
    "Fintech theme",
    "Healthcare theme",
    "Education theme",
    "Creator tools theme",
    "Developer tools theme",
    "E-commerce admin theme",
    "Enterprise neutral theme",
    "High contrast accessibility theme",
    "Marketing growth theme",
    "Legal compliance theme",
  ],
  "theme-builder": [
    "Web-based theme editor",
    "Color palette editor",
    "Typography editor",
    "Radius controls",
    "Density controls",
    "Light/dark preview",
    "Component preview grid",
    "Token export as CSS variables",
    "Token export as JSON",
    "Token export as TypeScript",
    "Theme import flow",
    "Theme validation",
  ],
  "figma-kit": [
    "Core component library",
    "Pro component library",
    "Tokenized color styles",
    "Tokenized text styles",
    "Auto layout patterns",
    "Page layout examples",
    "Admin dashboard frames",
    "SaaS settings frames",
    "Data table states",
    "Form states",
    "Modal states",
    "Empty states",
    "Documentation page in Figma",
    "Version history notes",
  ],
  "assets-brand": [
    "App shell examples",
    "Dashboard preview assets",
    "Template preview screenshots",
    "Component preview screenshots",
    "Marketing page visuals",
    "Social preview images",
  ],
  "accessibility-quality": [
    "Contrast checks for each theme",
    "Focus ring checks",
    "Reduced motion behavior",
    "Color-blindness review",
    "Density review",
    "Mobile viewport review",
    "Browser compatibility review",
    "Theme migration notes",
    "Theme changelog",
  ],
};

const TEMPLATE_SLUGS = {
  "Admin Pro": "admin",
  "SaaS Starter": "saas",
  CRM: "crm",
  "Analytics Dashboard": "analytics",
};

/** Desktop dashboard screenshot for shipped template variants. */
export function templatePreviewImage(title) {
  const match = title.match(/^(.+?) (vite-lit|next-react|nuxt|laravel-inertia)$/);
  if (!match) return null;

  const [, label, variant] = match;
  const slug = TEMPLATE_SLUGS[label];
  if (!slug) return null;

  return `/pro/templates/${slug}/${variant}/dashboard-desktop.png`;
}

const PREVIEW_ICONS = {
  "template-variants": "squares-plus",
  "admin-pro": "shield-check",
  "saas-starter": "rocket-launch",
  crm: "users",
  analytics: "chart-bar",
  "token-system": "variable",
  "theme-presets": "paint-brush",
  "theme-builder": "adjustments-horizontal",
  "figma-kit": "beaker",
  "assets-brand": "photo",
  "accessibility-quality": "eye",
};

const FEATURE_PAGES = {
  "token-system": {
    title: "Token System",
    kicker: "Themes",
    description:
      "Semantic design tokens power every Pro theme and template. Each preset ships complete light and dark token sets for color, typography, spacing, motion, density, and component surfaces — exported as CSS variables, JSON, or TypeScript.",
    highlights: [
      "Primary, neutral, success, warning, and error color scales",
      "Surface, text, and focus-ring tokens consumed by LoomiUI components",
      "Typography, spacing, radius, shadow, border, motion, and z-index scales",
      "Density and component-level tokens for shells, panels, and tables",
    ],
  },
  "theme-presets": {
    title: "Theme Presets",
    kicker: "Themes",
    description:
      "Browse all twelve LoomiUI Pro theme presets with live light and dark previews, token scales, component samples, and starter kit pairings.",
    highlights: [
      "Interactive preset switcher with real generated CSS variables",
      "Primary, semantic, surface, typography, radius, and shadow previews",
      "Mini app shell showing sidebar, header, and panel surfaces",
      "Copy-ready CSS import lines and starter kit mapping",
    ],
  },
  "theme-builder": {
    title: "Theme Builder",
    kicker: "Themes",
    description:
      "Customize palettes, typography, radius, and density — then preview components in light and dark mode before exporting tokens to your app.",
    highlights: [
      "Start from any Pro preset or compose a brand theme with createTheme()",
      "Override shared, light, or dark tokens without breaking component contracts",
      "Export runtime CSS variables, static stylesheets, or JSON token files",
      "Import existing themes and validate tokens before shipping",
    ],
  },
  "accessibility-quality": {
    title: "Accessibility & Quality",
    kicker: "Themes",
    description:
      "Every Pro theme is reviewed for contrast, focus visibility, motion preferences, and real-world readability — so your product stays usable across devices and assistive technology.",
    highlights: [
      "WCAG contrast review for light and dark modes",
      "Visible focus rings and keyboard-friendly component defaults",
      "Reduced-motion behavior aligned with user preferences",
      "Migration notes and changelogs when tokens evolve",
    ],
  },
  "figma-kit": {
    title: "Figma Kit",
    kicker: "Themes",
    description:
      "A tokenized Figma library aligned with LoomiUI Pro components — color and text styles, auto-layout patterns, and production-ready frames for admin, SaaS, and data-heavy products.",
    highlights: [
      "Core and Pro component libraries with matching variants",
      "Tokenized color and text styles synced to Pro themes",
      "Auto-layout patterns and page layout examples",
      "Admin, SaaS, table, form, modal, and empty-state frames",
    ],
  },
  "assets-brand": {
    title: "Assets & Brand",
    kicker: "Themes",
    description:
      "Marketing and product visuals that match Pro templates and themes — shell examples, dashboard previews, template screenshots, and launch-ready social assets.",
    highlights: [
      "App shell and dashboard preview artwork",
      "Template and component gallery screenshots",
      "Marketing page and launch announcement visuals",
      "Social preview and Open Graph image templates",
    ],
  },
};

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[`/]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferDescription(title) {
  const lower = title.toLowerCase();

  if (lower.endsWith(" page")) {
    const screen = title.replace(/\s+page$/i, "");
    if (screen.endsWith(" detail")) {
      return `Detailed ${screen.replace(/\s+detail$/i, "")} view with related records and actions.`;
    }
    return `Production-ready ${screen} screen for your starter kit.`;
  }

  if (lower.endsWith(" flow")) {
    return `Guided ${title.replace(/\s+flow$/i, "").toLowerCase()} with polished empty, loading, and error states.`;
  }

  if (lower.endsWith(" states")) {
    return `${title} covering empty, loading, and error UX patterns.`;
  }

  if (lower.endsWith(" tokens")) {
    const kind = title.replace(/\s+tokens$/i, "");
    return `${kind} tokens for consistent styling across light and dark modes.`;
  }

  if (lower.endsWith(" theme")) {
    const name = title.replace(/\s+theme$/i, "");
    return `${name} preset with tuned palettes, density, and light/dark modes.`;
  }

  if (lower.includes("vite-lit") || lower.includes("next-react") || lower.includes("variant")) {
    const [name, stack] = title.split(/\s+(?=[a-z-/]+$)/i);
    return `${name.trim()} starter kit for ${stack?.trim() ?? "your stack"}.`;
  }

  const exact = {
    "Permission matrix": "Visual grid for mapping roles to permissions across your app.",
    "Deals pipeline": "Kanban-style pipeline for tracking deals through every stage.",
    "Activity timeline": "Chronological feed of user and system activity.",
    "Saved views": "Persist filtered table and list views for quick recall.",
    "Import flow": "Upload and map CSV data into CRM records.",
    "Organization switcher": "Switch between workspaces without leaving the shell.",
    "Invite members flow": "Send invitations and assign roles from settings.",
    "Subscription and billing": "Plan selection, invoices, and payment method management.",
    "API keys page": "Create, rotate, and revoke API credentials.",
    "Notes panel": "Attach notes to leads, contacts, and deals.",
    "Export center": "Download reports and datasets in common formats.",
    "Date range comparison": "Compare metrics across two time periods.",
    "Data table example": "Advanced table with sorting, filters, and bulk actions.",
    "Form wizard example": "Multi-step form with validation and progress.",
    "Web-based theme editor": "Edit Pro themes visually in the browser.",
    "Color palette editor": "Pick primary and neutral scales with live preview.",
    "Typography editor": "Adjust font families, sizes, weights, and line heights.",
    "Radius controls": "Set corner radii from compact to rounded.",
    "Density controls": "Switch between compact, default, and spacious layouts.",
    "Light/dark preview": "Preview the same components in both color modes.",
    "Component preview grid": "See buttons, inputs, tables, and cards with your tokens.",
    "Token export as CSS variables": "Export --loomi-* variables for runtime theming.",
    "Token export as JSON": "Serialize full light and dark token sets as JSON.",
    "Token export as TypeScript": "Generate typed token objects for your codebase.",
    "Theme import flow": "Load an existing theme file to continue editing.",
    "Theme validation": "Catch missing or invalid tokens before export.",
    "Contrast checks for each theme": "Every preset is reviewed for readable text and surfaces.",
    "Focus ring checks": "Keyboard focus stays visible on interactive controls.",
    "Reduced motion behavior": "Respects prefers-reduced-motion across animations.",
    "Color-blindness review": "Palette choices tested for distinguishable states.",
    "Density review": "Compact and spacious modes stay readable on real screens.",
    "Mobile viewport review": "Themes verified on phone and tablet breakpoints.",
    "Browser compatibility review": "Token exports verified in major browsers.",
    "Theme migration notes": "Upgrade guidance when token names or scales change.",
    "Theme changelog": "Track theme updates across Pro releases.",
    "Core component library": "Figma components matching open-source LoomiUI.",
    "Pro component library": "Figma components for advanced Pro UI patterns.",
    "Tokenized color styles": "Figma color styles wired to Pro design tokens.",
    "Tokenized text styles": "Figma text styles aligned with typography tokens.",
    "Auto layout patterns": "Reusable responsive layout blocks in Figma.",
    "Page layout examples": "Starter frames for dashboards and settings.",
    "Admin dashboard frames": "Pre-built admin shell and dashboard layouts.",
    "SaaS settings frames": "Settings, billing, and team management screens.",
    "Data table states": "Default, hover, selected, and empty table examples.",
    "Form states": "Input, validation, disabled, and error form examples.",
    "Modal states": "Dialog, drawer, and confirmation patterns in Figma.",
    "Empty states": "Placeholder layouts for lists, tables, and dashboards.",
    "Documentation page in Figma": "In-file guidance for designers using the kit.",
    "Version history notes": "Track Figma kit updates alongside Pro releases.",
    "App shell examples": "Navigation, header, and sidebar layout references.",
    "Dashboard preview assets": "Marketing-ready dashboard screenshots.",
    "Template preview screenshots": "Hero images for each Pro starter kit.",
    "Component preview screenshots": "Gallery shots for advanced Pro components.",
    "Marketing page visuals": "Launch and landing page artwork.",
    "Social preview images": "Open Graph and social card templates.",
  };

  if (exact[title]) return exact[title];

  if (lower.endsWith(" panel") || lower.endsWith(" center")) {
    return `${title} UI included in the template shell.`;
  }

  if (lower.endsWith(" settings")) {
    return `Settings UI for managing ${title.replace(/\s+settings$/i, "").toLowerCase()}.`;
  }

  if (lower.endsWith(" example")) {
    return `Working ${title.replace(/\s+example$/i, "").toLowerCase()} demo wired to mock data.`;
  }

  if (lower.endsWith(" reports") || lower === "reports page") {
    return "Report listings with filters, exports, and saved views.";
  }

  return `${title} included with LoomiUI Pro.`;
}

export function getProArea(key) {
  return PRO_AREAS.find((area) => area.key === key);
}

export function getProCategory(key) {
  return PRO_CATEGORIES.find((cat) => cat.key === key);
}

export function getProFeaturePage(key) {
  return FEATURE_PAGES[key] ?? null;
}

export function categoryHref(categoryKey, areaKey) {
  const category = getProCategory(categoryKey);
  if (category?.href) return category.href;
  const area = getProArea(areaKey);
  if (area?.href) return `${area.href}?category=${categoryKey}`;
  return `/pro/?category=${categoryKey}`;
}

export function proCatalogItems(options = {}) {
  const { category: onlyCategory, area: onlyArea } = options;
  const items = [];

  for (const category of PRO_CATEGORIES) {
    if (onlyCategory && category.key !== onlyCategory) continue;
    if (onlyArea && category.area !== onlyArea) continue;

    const pageHref = category.href ?? null;
    for (const title of ITEMS[category.key] ?? []) {
      const slug = slugify(title);
      items.push({
        id: `${category.key}-${slug}`,
        anchor: slug,
        title,
        category: category.key,
        area: category.area,
        description: inferDescription(title),
        icon: PREVIEW_ICONS[category.key] ?? "sparkles",
        previewImage: category.key === "template-variants" ? templatePreviewImage(title) : null,
        search: `${title} ${category.label} ${category.area}`.toLowerCase(),
        href: pageHref ? `${pageHref}#${slug}` : null,
      });
    }
  }

  return items;
}

export function proCategoryCounts() {
  return Object.fromEntries(
    PRO_CATEGORIES.map((cat) => [cat.key, (ITEMS[cat.key] ?? []).length]),
  );
}

export function proAreaCounts() {
  const items = proCatalogItems();
  return {
    templates: items.filter((item) => item.area === "templates").length,
    themes: items.filter((item) => item.area === "themes").length,
  };
}
