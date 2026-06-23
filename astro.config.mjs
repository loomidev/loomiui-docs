import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";
import { ALL_PACKAGE_NAMES } from "./scripts/loomi-packages.mjs";

// Browser import map so live component previews (plain <script type="module"> tags
// embedded right in the Markdown content) can resolve every @loomi/* package's
// internal bare-specifier imports (e.g. `from "@loomi/core"`) without a bundler on the
// docs site. `lit` itself comes from a CDN, exactly like a consumer who hasn't
// installed loomi locally would load it. Each package also gets a `<name>/` *prefix*
// entry, since a couple of components import siblings via a subpath
// (e.g. `@loomi/checkbox/loomi-checkbox.js` from inside <loomi-table>).
const importMap = {
  imports: {
    lit: "https://esm.sh/lit@3.3.3",
    "lit/": "https://esm.sh/lit@3.3.3/",
    ...Object.fromEntries(
      ALL_PACKAGE_NAMES.flatMap((name) => [
        [`@loomi/${name}`, `/loomi/${name}/dist/index.js`],
        [`@loomi/${name}/`, `/loomi/${name}/dist/`],
      ]),
    ),
  },
};

export default defineConfig({
  site: "https://loomiui.com",
  integrations: [
    starlight({
      title: "loomiui",
      tagline: "Themeable Lit web components, framework-agnostic by design.",
      description:
        "loomi is a framework-agnostic web component library built with Lit, themeable entirely through CSS custom properties — install one component or the whole library.",
      // The logo image already contains the "loomiui" wordmark, so it replaces the
      // separate text title entirely rather than rendering alongside it.
      logo: { src: "./src/assets/logo.png", alt: "loomiui", replacesTitle: true },
      favicon: "/favicon.png",
      customCss: ["./src/styles/custom.css"],
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
          ],
        },
        { label: "MCP Server", slug: "mcp-server" },
        { label: "Docs Architecture", slug: "architecture" },
        {
          label: "Components",
          items: [
            { label: "Standalone", items: [{ autogenerate: { directory: "components/standalone" } }] },
            { label: "Forms", items: [{ autogenerate: { directory: "components/forms" } }] },
            { label: "Content", items: [{ autogenerate: { directory: "components/content" } }] },
            { label: "Navigation", items: [{ autogenerate: { directory: "components/navigation" } }] },
          ],
        },
      ],
    }),
  ],
});
