// Regenerates src/content/docs/i18n.md from ../../components/i18n.md — the
// internationalization contributor guide is NOT hand-maintained here, it's derived
// from the components monorepo's own i18n.md (the source of truth), the same way
// contributing.md is derived from CONTRIBUTING.md (see gen-contributing-doc.mjs).
// Re-run this after editing components/i18n.md.
//
//   node scripts/gen-i18n-doc.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = resolve(import.meta.dirname, "../../components/i18n.md");
const OUT = resolve(import.meta.dirname, "../src/content/docs/i18n.md");

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

const raw = readFileSync(SOURCE, "utf8");
const lines = raw.split("\n");
const h1Index = lines.findIndex((l) => l.startsWith("# "));
const body = (h1Index >= 0 ? lines.slice(h1Index + 1) : lines).join("\n").trimStart();

// Root-relative links (`CONTRIBUTING.md`, `packages/core/README.md`) only resolve on
// GitHub, not on this site — drop the link, keeping the label, the same way
// gen-component-docs.mjs unlinks README-relative paths it has no page for.
const delinked = body.replace(/\[([^\]]+)\]\((?:CONTRIBUTING\.md|packages\/core\/README\.md)\)/g, "$1");

let description = firstParagraph(delinked).replace(/"/g, "'").replace(/`/g, "");
if (description.length > 160) {
  description = description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
}

const frontmatter = ["---", "title: Internationalization", `description: "${description}"`, "---", ""].join("\n");

writeFileSync(OUT, frontmatter + delinked);
console.log("Generated i18n.md from components/i18n.md.");
