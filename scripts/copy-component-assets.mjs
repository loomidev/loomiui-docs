// Copies each @loomidev/* package's compiled `dist/` output into docs/public/loomi/<name>/dist/
// so the docs site can load real, working components in the browser via plain <script
// type="module"> tags pointing at absolute URLs — no bundler step on the docs side.
//
// Run `pnpm --filter ./components/packages/* build` (or just `pnpm build` at the
// components monorepo root) FIRST so each package's dist/ is up to date, then run this.

import { cpSync, existsSync, rmSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_PACKAGE_NAMES } from "./loomiui-packages.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PACKAGES = resolve(__dirname, "../../components/packages");
const PUBLIC_LOOMI = resolve(__dirname, "../public/loomi");

// Only .js is needed in the browser — skip .d.ts/.d.ts.map/.js.map so we don't ship
// type declarations and source maps as public static assets.
const isRuntimeFile = (path) => !/\.(d\.ts|d\.ts\.map|js\.map)$/.test(path);

// The maps aren't copied, so drop the sourceMappingURL comments too — otherwise
// devtools requests every missing .map and floods the dev server log with 404s.
const stripSourceMapComments = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) stripSourceMapComments(path);
    else if (entry.name.endsWith(".js")) {
      const code = readFileSync(path, "utf8");
      const stripped = code.replace(/^\/\/# sourceMappingURL=.+$/gm, "");
      if (stripped !== code) writeFileSync(path, stripped);
    }
  }
};

rmSync(PUBLIC_LOOMI, { recursive: true, force: true });
mkdirSync(PUBLIC_LOOMI, { recursive: true });

let copied = 0;
for (const name of ALL_PACKAGE_NAMES) {
  const src = resolve(PACKAGES, name, "dist");
  if (!existsSync(src)) {
    console.warn(`[copy-component-assets] skip "${name}" — no dist/ found. Build the components monorepo first.`);
    continue;
  }
  const dest = resolve(PUBLIC_LOOMI, name, "dist");
  cpSync(src, dest, { recursive: true, filter: isRuntimeFile });
  stripSourceMapComments(dest);
  copied++;
}

console.log(`[copy-component-assets] published dist/ for ${copied}/${ALL_PACKAGE_NAMES.length} packages to public/loomi/.`);
