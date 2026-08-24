import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import tailwindcss from "@tailwindcss/vite";
import { pluginLineNumbers } from "@expressive-code/plugin-line-numbers";
import { buildImportMap } from "./src/lib/import-map.mjs";

// See src/lib/import-map.mjs — shared with src/pages/index.astro, which sits outside
// Starlight's Layout and so never receives this integration's `head` config below.
const importMap = buildImportMap();

export default defineConfig({
  site: "https://loomiui.com",
  server: {
    host: true,
    port: Number(process.env.PORT) || 4321,
    strictPort: true,
    allowedHosts: ["loomiui.test"],
  },
  vite: {
    // Tailwind here styles ONLY this docs site's own marketing chrome (the homepage in
    // src/pages/index.astro) — it has nothing to do with loomi's components, which
    // compile their own scoped Tailwind into each Shadow DOM at the package level and
    // ship zero Tailwind to consumers. This is purely the docs site authoring its own
    // page, the same boundary bladewindui.com's own site respects for its components.
    plugins: [tailwindcss()],
  },
  integrations: [
    starlight({
      title: "LoomiUI",
      tagline: "Web components for every stack",
      description: "LoomiUI is a framework-agnostic library of Web Components built with Lit, fully themeable through CSS custom properties. Install a single component or the entire library",
      // The logo image already contains the "LoomiUI" wordmark, so it replaces the
      // separate text title entirely rather than rendering alongside it. Dedicated
      // light/dark variants (rather than one image + a CSS backdrop hack) since the
      // wordmark's navy text has no other way to stay legible on a dark header.
      logo: {
        light: "./src/assets/logo-light.png",
        dark: "./src/assets/logo-dark.png",
        alt: "LoomiUI",
        replacesTitle: true,
      },
      favicon: "/favicon.png",
      customCss: ["./src/styles/custom.css"],
      expressiveCode: {
        plugins: [pluginLineNumbers()],
        defaultProps: { showLineNumbers: true },
      },
      tableOfContents: {
        minHeadingLevel: 2,
        maxHeadingLevel: 4,
      },
      components: {
        // Dogfood LoomiUI's own components in the docs site's chrome — see
        // src/components/{Head,Header,Pagination,ThemeSelect}.astro for what/why.
        Head: "./src/components/Head.astro",
        Header: "./src/components/Header.astro",
        PageFrame: "./src/components/PageFrame.astro",
        Pagination: "./src/components/Pagination.astro",
        ThemeProvider: "./src/components/ThemeProvider.astro",
        ThemeSelect: "./src/components/ThemeSelect.astro",
      },
      head: [
        {
          tag: "script",
          attrs: { type: "importmap" },
          content: JSON.stringify(importMap),
        },
      ],
      // Docs navigation lives in the top bar, but /components/* pages keep a left
      // sidebar with both groups below. src/starlightRouteData.ts turns `hasSidebar`
      // off for every other route, so this config only ever renders there.
      routeMiddleware: "./src/starlightRouteData.ts",
      sidebar: [
        {
          label: "Start Here",
          items: [
            // `data-icon` lands on the rendered <a> via Starlight's attrs-passthrough
            // (its sidebar schema has no native `icon` field) and is turned into a
            // <loomi-icon> by the script in src/components/Head.astro — Starlight
            // hardcodes its own SidebarSublist internally, so it can't be overridden
            // directly. Names are placeholders (any registered @loomidev/icons name
            // works) — swap freely.
            { label: "Installation", slug: "installation", attrs: { "data-icon": "arrow-down-tray" } },
            { label: "React", slug: "react", attrs: { "data-icon": "code-bracket-square" } },
            {
              label: "Foundations",
              slug: "foundations",
              attrs: { "data-icon": "building-library" },
            },
            { label: "Theming", slug: "theming", attrs: { "data-icon": "swatch" } },
            { label: "Internationalization", slug: "i18n", attrs: { "data-icon": "globe-alt" } },
            { label: "RTL Support", slug: "rtl-support", attrs: { "data-icon": "language" } },
            // Raw Astro page (src/pages/icons/index.astro), not a content-collection
            // doc — `link`, not `slug`, same as how MarketingHeader/Header.astro link
            // to /components/ rather than a Starlight slug.
            { label: "Icons", link: "/icons/", attrs: { "data-icon": "squares-plus" } },
            // Also a raw Astro page (src/pages/playground/index.astro) — dropped from
            // the top bar on sidebar pages (Header.astro), so it lives here instead.
            { label: "Playground", link: "/playground/", attrs: { "data-icon": "play-circle" } },
            { label: "CLI", slug: "cli", attrs: { "data-icon": "command-line" } },
            { label: "MCP", slug: "mcp-server", attrs: { "data-icon": "cpu-chip" } },
            { label: "Architecture", slug: "architecture", collapsed: true, attrs: { "data-icon": "building-library" } },
            { label: "Contributing", slug: "contributing", attrs: { "data-icon": "code-bracket" } },
          ],
        },
        {
          label: "Components",
          items: [{ autogenerate: { directory: "components" } }],
        },
      ],
    }),
  ],
});
