// Semver helpers shared by the version switcher (src/lib/versions.mjs, runs in the
// browser too) and scripts/sync-docs-version.mjs (plain Node). Kept free of JSON
// imports so Node can load it without import attributes.
//
// A "line" is every release sharing a major version: 0.x.x, 1.x.x, 2.x.x. The
// switcher lists one entry per line, and each superseded line is archived at its
// own subdomain, v0.loomiui.com, v1.loomiui.com (see .github/workflows/deploy.yml).

export const LIVE_ORIGIN = "https://loomiui.com";

/** @param {string} version */
const parse = (version) => version.replace(/^v/, "").split(".").map((part) => Number.parseInt(part, 10) || 0);

/** "0.9.3" → "0", "1.3.4" → "1" @param {string} version */
export const lineOf = (version) => `${parse(version)[0]}`;

/** @param {string} a @param {string} b */
export const compareVersions = (a, b) => {
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) - (pb[i] ?? 0);
  return 0;
};

/** Where a superseded line lives: "0.9.3" → https://v0.loomiui.com @param {string} version */
export const archiveUrlOf = (version) => `https://v${lineOf(version)}.loomiui.com`;
