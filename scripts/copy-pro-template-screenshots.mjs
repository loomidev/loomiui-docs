// Copies template preview screenshots from the sibling loomiui-pro repo into
// docs/public/pro/templates/ for the Pro gallery.

import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const proTemplates = resolve(__dirname, "../../pro/templates");
const publicTemplates = resolve(__dirname, "../public/pro/templates");

const templates = ["admin", "saas", "crm", "analytics"];
const variantsByTemplate = {
  admin: ["vite-lit", "next-react", "nuxt", "laravel-inertia"],
  saas: ["vite-lit", "next-react", "nuxt", "laravel-inertia"],
  crm: ["vite-lit", "next-react", "nuxt", "laravel-inertia"],
  analytics: ["vite-lit", "next-react", "nuxt", "laravel-inertia"],
};
const previewFallbacks = {
  "admin/nuxt": "admin/next-react",
  "admin/laravel-inertia": "admin/next-react",
  "saas/nuxt": "saas/next-react",
  "saas/laravel-inertia": "saas/next-react",
  "crm/nuxt": "crm/next-react",
  "crm/laravel-inertia": "crm/next-react",
  "analytics/nuxt": "analytics/next-react",
  "analytics/laravel-inertia": "analytics/next-react",
};
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
  for (const variant of variantsByTemplate[template] ?? []) {
    const fallback = previewFallbacks[`${template}/${variant}`];
    const [sourceTemplate, sourceVariant] = fallback ? fallback.split("/") : [template, variant];
    const sourceDir = resolve(proTemplates, sourceTemplate, "shared", "screenshots", sourceVariant);
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
