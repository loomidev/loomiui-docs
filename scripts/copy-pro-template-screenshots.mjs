// Copies template preview screenshots from the sibling loomiui-pro repo into
// docs/public/pro/templates/ for the Pro gallery.

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const proTemplates = resolve(__dirname, "../../pro/templates");
const publicTemplates = resolve(__dirname, "../public/pro/templates");

const templates = ["admin", "saas", "crm", "analytics"];
const variants = ["vite-lit", "next-react"];
const shots = ["dashboard-desktop.png", "dashboard-mobile.png"];

if (!existsSync(proTemplates)) {
  console.warn(
    "[copy-pro-template-screenshots] skip — loomiui-pro templates folder not found."
  );
  process.exit(0);
}

rmSync(publicTemplates, { recursive: true, force: true });
mkdirSync(publicTemplates, { recursive: true });

let copied = 0;

for (const template of templates) {
  for (const variant of variants) {
    const sourceDir = resolve(proTemplates, template, "shared", "screenshots", variant);
    if (!existsSync(sourceDir)) {
      console.warn(`[copy-pro-template-screenshots] skip ${template}/${variant} — no screenshots`);
      continue;
    }

    const targetDir = resolve(publicTemplates, template, variant);
    mkdirSync(targetDir, { recursive: true });

    for (const shot of shots) {
      const source = resolve(sourceDir, shot);
      if (!existsSync(source)) continue;
      cpSync(source, resolve(targetDir, shot));
      copied++;
    }
  }
}

console.log(`[copy-pro-template-screenshots] copied ${copied} screenshots into public/pro/templates/`);
