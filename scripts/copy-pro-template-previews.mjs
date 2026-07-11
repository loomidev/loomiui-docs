// Publishes the actual Vite/Lit template applications inside the static docs site.

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const previewBuilds = resolve(__dirname, "../../pro/dist/previews");
const publicPreviews = resolve(__dirname, "../public/pro/live");
const families = ["admin", "analytics", "crm", "saas"];

if (!existsSync(previewBuilds)) {
  console.warn("[copy-pro-template-previews] skip — run `pnpm previews:build` first.");
  process.exit(0);
}

rmSync(publicPreviews, { recursive: true, force: true });
mkdirSync(publicPreviews, { recursive: true });

let copied = 0;
for (const family of families) {
  const source = resolve(previewBuilds, family);
  if (!existsSync(source)) {
    console.warn(`[copy-pro-template-previews] skip ${family} — preview build is missing.`);
    continue;
  }

  cpSync(source, resolve(publicPreviews, family), { recursive: true });
  copied++;
}

console.log(`[copy-pro-template-previews] published ${copied}/${families.length} Lit applications to public/pro/live/.`);
