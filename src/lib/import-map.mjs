// Shared browser import map so live component previews (plain <script type="module">
// tags embedded directly in Markdown content, or hand-authored in src/pages/*.astro)
// can resolve every @loomi/* package's internal bare-specifier imports (e.g. `from
// "@loomi/core"`) without a bundler on the docs site. `lit` itself comes from a CDN,
// exactly like a consumer who hasn't installed loomi locally would load it. Each
// package also gets a `<name>/` *prefix* entry, since a couple of components import
// siblings via a subpath (e.g. `@loomi/checkbox/loomi-checkbox.js` from inside
// <loomi-table>).
//
// Used by astro.config.mjs (injected into every Starlight-rendered page's <head>) AND
// by src/pages/index.astro directly (a raw Astro page outside Starlight's Layout, so
// Starlight's `head` config never reaches it).
import { ALL_PACKAGE_NAMES } from "../../scripts/loomiui-packages.mjs";

export function buildImportMap() {
  return {
    imports: {
      lit: "https://esm.sh/lit@3.3.3",
      "lit/": "https://esm.sh/lit@3.3.3/",
      quill: "https://esm.sh/quill@2.0.3",
      "quill/": "https://esm.sh/quill@2.0.3/",
      ...Object.fromEntries(
        ALL_PACKAGE_NAMES.flatMap((name) => [
          [`@loomidev/${name}`, `/loomi/${name}/dist/index.js`],
          [`@loomidev/${name}/`, `/loomi/${name}/dist/`],
        ]),
      ),
    },
  };
}