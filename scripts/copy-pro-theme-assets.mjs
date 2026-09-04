// Copies generated Pro theme CSS/JSON from the sibling loomiui-pro repo into docs/public/pro/themes/
// so the docs site can preview real presets without depending on the private npm package.

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const themesDist = resolve(__dirname, "../../pro/packages/themes/dist");
const publicThemes = resolve(__dirname, "../public/pro/themes");

if (!existsSync(themesDist)) {
  console.warn(
    "[copy-pro-theme-assets] skip — no themes dist found. Run `pnpm --filter @loomidev-pro/themes build` in loomiui-pro first."
  );
  process.exit(0);
}

rmSync(publicThemes, { recursive: true, force: true });
mkdirSync(publicThemes, { recursive: true });

cpSync(resolve(themesDist, "css"), resolve(publicThemes, "css"), { recursive: true });
cpSync(resolve(themesDist, "json"), resolve(publicThemes, "json"), { recursive: true });

console.log("[copy-pro-theme-assets] copied Pro theme CSS + JSON into public/pro/themes/");
