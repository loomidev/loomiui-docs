// Regenerates src/content/docs/contributing.md from ../../components/CONTRIBUTING.md —
// the maintainer's guide is NOT hand-maintained here, it's derived from the components
// monorepo's own CONTRIBUTING.md (the source of truth for architecture/workflow docs),
// the same way component pages are derived from each package's README
// (see gen-component-docs.mjs). Re-run this after editing CONTRIBUTING.md.
//
//   node scripts/gen-contributing-doc.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const SOURCE = resolve(import.meta.dirname, "../../components/CONTRIBUTING.md");
const OUT = resolve(import.meta.dirname, "../src/content/docs/contributing.md");

function firstParagraph(bodyAfterH1) {
  const lines = bodyAfterH1.split("\n");
  const out = [];
  let started = false;
  for (const line of lines) {
    if (!line.trim() || line.trim().startsWith(">")) {
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

let description = firstParagraph(body).replace(/"/g, "'").replace(/`/g, "");
if (description.length > 160) {
  description = description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
}

const frontmatter = ["---", "title: Contributing", `description: "${description}"`, "---", ""].join("\n");

writeFileSync(OUT, frontmatter + body);
console.log("Generated contributing.md from components/CONTRIBUTING.md.");
