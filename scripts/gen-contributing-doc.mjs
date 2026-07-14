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
let body = (h1Index >= 0 ? lines.slice(h1Index + 1) : lines).join("\n").trimStart();

function collectNumberedHeadings(markdown) {
  const headings = new Map();
  const headingPattern = /^(#{2,6})\s+(\d+(?:\.\d+)*[a-z]?)\.?\s+(.+)$/gim;
  for (const match of markdown.matchAll(headingPattern)) {
    const [, , section, title] = match;
    headings.set(section, { title });
  }
  return headings;
}

function cleanTableOfContents(markdown) {
  let inToc = false;

  return markdown
    .split("\n")
    .map((line) => {
      if (line === "## Table of contents") {
        inToc = true;
        return line;
      }
      if (inToc && line === "---") {
        inToc = false;
        return line;
      }
      if (!inToc) return line;

      return line
        .replace(/^(\s*)\d+\.\s+/gm, "$1- ")
        .replace(/^(\s*-\s+\[)\d+(?:\.\d+)*[a-z]?\.?\s+/gim, "$1");
    })
    .join("\n");
}

function cleanNumberedHeadings(markdown, headings) {
  let cleaned = markdown;

  for (const [section, heading] of headings) {
    const sectionLinkPattern = new RegExp(
      `\\[§${section.replaceAll(".", "\\.")}\\]\\(#\\d+[a-z]?-(.*?)\\)`,
      "g",
    );
    cleaned = cleaned.replace(sectionLinkPattern, `[${heading.title}](#$1)`);
  }

  return cleaned
    .replace(/\(#\d+[a-z]?-/gi, "(#")
    .replace(/^(#{2,6})\s+\d+(?:\.\d+)*[a-z]?\.?\s+/gim, "$1 ");
}

// The source doc has numbered sections, so it refers to them as "§8", "§8a", "§9.7".
// The generated docs strip those numbers, leaving "§8" dangling with nothing to point at.
// Replace every remaining §-reference with the section's title instead (e.g. "§8a" →
// "Automated smoke tests"), in link text and prose alike. Longest ids first so "§8"
// can't partially match inside "§8a".
function resolveSectionRefs(markdown, headings) {
  let out = markdown;
  const ids = [...headings.keys()].sort((a, b) => b.length - a.length);
  for (const id of ids) {
    const escaped = id.replaceAll(".", "\\.");
    const pattern = new RegExp(`§${escaped}(?![0-9a-z.])`, "gi");
    out = out.replace(pattern, headings.get(id).title);
  }
  return out;
}

const numberedHeadings = collectNumberedHeadings(body);
body = cleanNumberedHeadings(body, numberedHeadings);
body = cleanTableOfContents(body);
body = resolveSectionRefs(body, numberedHeadings);
body = body.replace(
  "\n\n> **Repo note:**",
  "\n\n> **Junior-dev note:** If you're newer to monorepos, pnpm, or Lit, treat this as a guided map, not a memory test. The extra \"why\" details are here so you can trace what a command changes before you run it.\n\n> **Repo note:**",
);

let description = firstParagraph(body).replace(/"/g, "'").replace(/`/g, "");
if (description.length > 160) {
  description = description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
}

const frontmatter = ["---", "title: Contributing", `description: "${description}"`, "---", ""].join("\n");

writeFileSync(OUT, frontmatter + body);
console.log("Generated contributing.md from components/CONTRIBUTING.md.");
