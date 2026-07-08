import { defineRouteMiddleware } from "@astrojs/starlight/route-data";

// Every "Start Here" sidebar slug (astro.config.mjs) except Icons — that one is a raw
// Astro page (src/pages/icons/index.astro), not a Starlight content-collection doc, so
// it never runs through this middleware at all and is excluded for free.
const START_HERE_SLUGS = ["installation", "customization", "contributing", "i18n", "rtl-support", "mcp-server", "cli", "architecture"];

// Docs navigation lives in the top bar for the homepage and other one-off pages, but
// the component reference (/components/*) and the "Start Here" docs above keep the
// left sidebar (both groups, defined in astro.config.mjs's `sidebar`) so readers can
// jump between them without returning to a gallery. `hasSidebar` drives both
// PageFrame.astro's sidebar slot and Starlight's own `data-has-sidebar` layout
// attribute, so flipping it here keeps every downstream consumer (header padding,
// content inset, mobile menu) in sync.
export const onRequest = defineRouteMiddleware((context) => {
  const { starlightRoute } = context.locals;
  starlightRoute.hasSidebar = starlightRoute.id.startsWith("components/") || START_HERE_SLUGS.includes(starlightRoute.id);
});
