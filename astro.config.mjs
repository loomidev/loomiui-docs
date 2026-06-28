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
    port: 4321,
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
        // src/components/{Head,Pagination,ThemeSelect}.astro for what/why.
        Head: "./src/components/Head.astro",
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
      sidebar: [
        {
          label: "Start Here",
          items: [
            { label: "Installation", slug: "installation" },
            { label: "Customization", slug: "customization" },
            { label: "Contributing", slug: "contributing" },
            { label: "MCP Server", slug: "mcp-server" },
            { label: "Architecture", slug: "architecture", collapsed: true },
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