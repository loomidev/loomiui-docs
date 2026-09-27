// Docs versions for the switcher next to the logo (src/components/VersionSwitcher.astro).
//
// CURRENT_VERSION is what this build documents. scripts/sync-docs-version.mjs sets
// it from the components' @loomidev/core version on every dev run and build, and
// adds that version to public/versions.json.
//
// Every deployed version is recorded in public/versions.json, served from the live
// site at VERSIONS_URL. Each build (including frozen, archived ones on their own
// subdomains) fetches that one file at runtime, so an old version's menu still lists
// releases made after it was frozen. When a release line is superseded, point its
// entry's `url` at the archived deployment.
//
// The menu doesn't list every entry: collapseVersions() keeps only the newest release
// of each major, so 0.8.3, 0.9.0, 1.0.0, 1.3.4, 2.0.4 shows as 2.0.4, 1.3.4, 0.9.0.
import current from "./current-version.json";
import { compareVersions as compare, lineOf } from "./version-lines.mjs";

export const CURRENT_VERSION = current.version;

export const VERSIONS_URL = "https://loomiui.com/versions.json";

/** @typedef {{ version: string, url: string }} DocsVersion */

/**
 * Newest release of each breaking line, newest first. The line holding
 * `current` is always represented by `current` itself, so the page you're on is
 * the one that gets the check mark even if versions.json is behind or ahead of it.
 * @param {DocsVersion[]} versions
 * @param {string} current
 * @returns {(DocsVersion & { current: boolean })[]}
 */
export function collapseVersions(versions, current = CURRENT_VERSION) {
  const currentLine = lineOf(current);
  /** @type {Map<string, DocsVersion>} */
  const newest = new Map();
  for (const entry of versions) {
    const line = lineOf(entry.version);
    if (line === currentLine) continue;
    const kept = newest.get(line);
    if (!kept || compare(entry.version, kept.version) > 0) newest.set(line, entry);
  }
  const currentEntry = versions.find((entry) => lineOf(entry.version) === currentLine);
  newest.set(currentLine, { version: current, url: currentEntry?.url ?? "/" });
  return [...newest.values()]
    .sort((a, b) => compare(b.version, a.version))
    .map((entry) => ({ ...entry, current: entry.version === current }));
}

/** @param {string} version */
export const formatVersion = (version) => `v${version.replace(/^v/, "")}`;
