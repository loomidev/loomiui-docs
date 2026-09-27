// Keeps the version switcher in step with the component release being documented
// (see src/lib/versions.mjs). Reads the version from the sibling components
// checkout's @loomidev/core package, then:
//
//   - writes it to src/lib/current-version.json (this build's CURRENT_VERSION)
//   - adds it to public/versions.json, pointing at the live site, if it isn't
//     listed yet
//
// Both files are committed, so builds without the components checkout (ci.yml)
// still have them; this script just skips there. Commit the changes it makes
// locally so each release stays in versions.json after the next one replaces it
// on the live site.
//
// It also points every entry from an older line at that line's archive
// (https://v0.loomiui.com for 0.x.x): once a newer line is current, older lines
// are no longer on the live site, and deploy.yml archives each one at that address
// as it's replaced. An entry with any other URL is left as-is, for hand-set cases.

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { LIVE_ORIGIN, archiveUrlOf, compareVersions, lineOf } from "../src/lib/version-lines.mjs";

const CORE_PACKAGE = resolve(import.meta.dirname, "../../components/packages/core/package.json");
const CURRENT_FILE = resolve(import.meta.dirname, "../src/lib/current-version.json");
const VERSIONS_FILE = resolve(import.meta.dirname, "../public/versions.json");

if (!existsSync(CORE_PACKAGE)) {
  console.log("sync-docs-version: no components checkout, keeping committed versions");
  process.exit(0);
}

const { version } = JSON.parse(readFileSync(CORE_PACKAGE, "utf8"));

const writeIfChanged = (file, data) => {
  const next = JSON.stringify(data, null, 2) + "\n";
  if (existsSync(file) && readFileSync(file, "utf8") === next) return false;
  writeFileSync(file, next);
  return true;
};

if (writeIfChanged(CURRENT_FILE, { version })) {
  console.log(`sync-docs-version: current version is now ${version}`);
}

const versions = JSON.parse(readFileSync(VERSIONS_FILE, "utf8"));
if (!versions.some((entry) => entry.version === version)) {
  versions.push({ version, url: LIVE_ORIGIN });
  console.log(`sync-docs-version: added ${version} to public/versions.json`);
}
for (const entry of versions) {
  if (entry.url === LIVE_ORIGIN && lineOf(entry.version) !== lineOf(version)) {
    entry.url = archiveUrlOf(entry.version);
    console.log(`sync-docs-version: ${entry.version} now points at ${entry.url}`);
  }
}
versions.sort((a, b) => compareVersions(b.version, a.version));
writeIfChanged(VERSIONS_FILE, versions);
