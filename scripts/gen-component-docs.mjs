// Regenerates src/content/docs/components/**/*.md from each @loomi/* package's
// README.md (one level up, in ../../components/packages/<name>/README.md).
//
// Component docs are NOT hand-maintained in this project — they're derived from the
// published package README, which is the source of truth for that component's API.
// Re-run this after editing a component's README.
//
// Every fenced ```html code block in the README also gets a LIVE rendered preview
// inserted directly above it (same markup, executed for real), plus one page-level
// <script type="module"> that imports the component via the browser import map
// declared in astro.config.mjs. Run scripts/copy-component-assets.mjs first so the
// compiled components this imports actually exist under public/loomi/.
//
//   node scripts/gen-component-docs.mjs

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { COMPONENT_NAMES, categoryOf } from "./loomiui-packages.mjs";

const PACKAGES = resolve(import.meta.dirname, "../../components/packages");
const DOCS = resolve(import.meta.dirname, "../src/content/docs/components");

// One flat directory, sorted alphabetically by Starlight's autogenerate (which sorts by
// slug) — categoryOf() is still used elsewhere (the MCP server manifest) but no longer
// affects the doc URL, which is just /components/<name>/ regardless of category.
const pathFor = (name) => (categoryOf(name) ? `/components/${name}/` : null);

function titleCase(name) {
  const special = { checkcards: "Checkcards" };
  if (special[name]) return special[name];
  return name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function firstParagraph(bodyAfterH1) {
  const lines = bodyAfterH1.split("\n");
  const out = [];
  let started = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (started) break;
      continue;
    }
    started = true;
    out.push(line.trim());
  }
  return out.join(" ");
}

function fixLinks(md) {
  let out = md;
  // root README anchors -> the customization page
  out = out.replace(/\]\(\.\.\/\.\.\/README\.md#[a-z0-9-]*theming[a-z0-9-]*\)/gi, "](/customization/)");
  out = out.replace(/\]\(\.\.\/\.\.\/README\.md\)/g, "](/installation/)");
  // sibling package links: ../<name> or ../<name>/README.md -> /components/<cat>/<name>/, else unlink
  out = out.replace(/\[([^\]]+)\]\(\.\.\/([a-z0-9-]+)\/?(?:README\.md)?(#[a-z0-9-]+)?\)/gi, (_m, label, name) => {
    const p = pathFor(name);
    return p ? `[${label}](${p})` : label;
  });
  // anything else pointing at a relative path we don't have a page for -> unlink
  out = out.replace(/\[([^\]]+)\]\((?:\.\.?\/)[^)]*\)/g, "$1");
  return out;
}

/** Insert a live <div class="loomi-preview"> rendering of each ```html fence, right above it. */
function withLivePreviews(md) {
  return md.replace(/```html\n([\s\S]*?)\n```/g, (fullMatch, code) => {
    // CommonMark ends a raw HTML block at the first blank line, so a blank line between
    // two multi-line elements (common for readability in the fenced source) would split
    // this div in two, leaving everything after it to be reprocessed as markdown prose
    // (mangled text, smart quotes, stray <p>/<blockquote> tags). Collapsing blank lines
    // only in this copy keeps the live preview as one unbroken HTML block; the fenced
    // code shown to the reader (via fullMatch, below) keeps its original formatting.
    const previewCode = code.replace(/\n{2,}/g, "\n");
    return `<div class="loomi-preview" data-label="Preview">\n${previewCode}\n</div>\n\n${fullMatch}`;
  });
}

// Wipe and recreate flat — older versions of this script nested pages under a
// per-category subdirectory (components/forms/button.md, etc.); clear that out so a
// stale nested copy never lingers alongside the new flat one.
rmSync(DOCS, { recursive: true, force: true });
mkdirSync(DOCS, { recursive: true });

let written = 0;
for (const name of COMPONENT_NAMES) {
  const readmePath = resolve(PACKAGES, name, "README.md");
  let raw;
  try {
    raw = readFileSync(readmePath, "utf8");
  } catch {
    console.warn("skip (no README found):", name);
    continue;
  }
  const lines = raw.split("\n");
  const h1Index = lines.findIndex((l) => l.startsWith("# "));
  const bodyLines = h1Index >= 0 ? lines.slice(h1Index + 1) : lines;
  const body = bodyLines.join("\n").trimStart();

  // Swap quotes/backticks out BEFORE truncating, so we never cut between a
  // backslash and the character it escapes (that previously broke YAML parsing).
  let description = firstParagraph(body).replace(/"/g, "'").replace(/`/g, "");
  if (description.length > 160) {
    description = description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  }

  const frontmatter = ["---", `title: ${titleCase(name)}`, `description: "${description}"`, "---", ""].join("\n");
  // One page-level import (registers the custom element) resolved via the browser
  // import map declared in astro.config.mjs — every live preview on the page relies on it.
  const importScript = `<script type="module">\n  import "@loomidev/${name}";\n</script>\n\n`;
  const finalBody = withLivePreviews(fixLinks(body));

  writeFileSync(resolve(DOCS, `${name}.md`), frontmatter + importScript + finalBody);
  written++;
}
console.log(`Generated ${written} component doc pages with live previews.`);