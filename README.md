# LoomiUI Documentation

The documentation site for [LoomiUI](../components), built with
[Astro](https://astro.build) + [Starlight](https://starlight.astro.build), deployed at
**https://loomiui.com**.

It contains setup guides, customization notes, MCP server docs, Pro CLI docs, and generated
component references with live, runnable previews. Content is sourced from the
component monorepo where possible, so package-level README updates can be
regenerated into docs pages consistently.

## Structure

```
src/content/docs/
├─ index.mdx            # home page (hero + CTA + "why loomi")
├─ installation.md
├─ customization.mdx    # uses Starlight components, hence .mdx
├─ mcp-server.mdx       # uses Starlight components, hence .mdx
├─ cli.mdx              # Pro CLI reference
└─ components/
   ├─ standalone/   (button, icon, spinner, alert, bell, modal, notification, table)
   ├─ forms/        (input, select, datepicker, …)
   ├─ content/      (card, avatar, chart, …)
   └─ navigation/   (tab, pagination, dropmenu, theme-switcher)
```

The sidebar groups under "Components" are defined in `astro.config.mjs` and
**autogenerate** their page lists from each subdirectory — adding a new component page
to the right folder is enough; no sidebar edit needed.

## Live previews

Every `​```html` code block in a component page gets a **live rendered preview**
injected directly above it (same markup, executed for real, not a screenshot). This
works without a bundler on the docs side:

1. `scripts/copy-component-assets.mjs` copies each `@loomidev/*` package's compiled
   `dist/*.js` from the components monorepo into `public/loomi/<name>/dist/`.
2. `astro.config.mjs` declares a browser **import map** (in Starlight's `head` config)
   mapping bare specifiers like `@loomidev/button` to those public paths, and `lit` to a
   CDN — exactly what a consumer who installed the package locally would get.
3. `scripts/gen-component-docs.mjs` wraps each html code block in
   `<div class="loomi-preview">` (rendered live) and adds one
   `<script type="module">import "@loomidev/<name>";</script>` per page to register that
   component. Raw HTML in Markdown passes through untouched, so this works in plain
   `.md` files — no MDX needed.

Both scripts run automatically via `predev`/`prebuild` (see below) — you don't need to
run them by hand in normal use.

### Pro template previews

The Pro template pages embed the actual Vite/Lit applications built from the sibling
`../pro` repository. Build and publish the four preview applications into the docs
static assets with:

```bash
pnpm previews:build
pnpm dev
```

The Vite builds are copied to `public/pro/live/<family>/` and become part of the
normal static docs deployment. Run `pnpm previews:serve` only when you want to inspect
the four Pro builds independently on ports `4821` through `4824`.

## Regenerating component pages from source

Component pages are derived from each `@loomidev/*` package's `README.md`
(`../components/packages/<name>/README.md`) — they are **not** hand-maintained here. If
a component's API changes, update its package README first, then regenerate:

```bash
pnpm run gen:components
```

## Develop

```bash
pnpm install
pnpm dev       # http://localhost:4321 — runs prepare:content automatically first
```

If you've changed a component's source, rebuild the components monorepo first so the
copied `dist/` files are current:

```bash
(cd ../components && pnpm build)
pnpm dev
```

## Build

```bash
pnpm build     # build Pro previews -> prepare:content -> astro check -> astro build
pnpm preview   # serve the production build locally
```

## Deploying

`dist/` is a fully static site (HTML/CSS/JS + the bundled component assets under
`dist/loomi/`) — deploy it to any static host (Vercel, Netlify, Cloudflare Pages,
GitHub Pages, S3+CloudFront, etc.). There's no server runtime required.

- **Build command:** `pnpm build`
- **Output directory:** `dist`
- **Node version:** 22.12+ (Astro 6's minimum)

Point your host's custom domain at `loomiui.com` (already set as `site` in
`astro.config.mjs`, which is what the sitemap and canonical URLs are generated from).
