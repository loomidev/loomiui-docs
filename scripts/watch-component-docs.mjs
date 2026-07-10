// Watches component package READMEs and regenerates the docs markdown pages when
// they change. Run this beside `pnpm dev` for README edits that show up quickly.

import { spawn } from "node:child_process";
import { existsSync, unwatchFile, watchFile } from "node:fs";
import { relative, resolve } from "node:path";
import { COMPONENT_NAMES } from "./loomiui-packages.mjs";

const DOCS_ROOT = resolve(import.meta.dirname, "..");
const PACKAGES_ROOT = resolve(import.meta.dirname, "../../components/packages");
const README_PATHS = COMPONENT_NAMES.map((name) => resolve(PACKAGES_ROOT, name, "README.md"));
const WATCH_INTERVAL_MS = Number(process.env.LOOMI_DOCS_README_WATCH_INTERVAL_MS ?? 500);
const DEBOUNCE_MS = Number(process.env.LOOMI_DOCS_README_DEBOUNCE_MS ?? 150);

const pendingChanges = new Set();
let debounceTimer;
let generatorRunning = false;
let rerunRequested = false;
let activeGenerator;

function packageNameFor(readmePath) {
  return relative(PACKAGES_ROOT, readmePath).replace(/[/\\]README\.md$/, "");
}

function changedLabel(paths) {
  if (paths.length === 0) return "startup";
  return paths.map(packageNameFor).sort().join(", ");
}

function runGenerator() {
  if (generatorRunning) {
    rerunRequested = true;
    return;
  }

  const changedPaths = Array.from(pendingChanges);
  pendingChanges.clear();
  generatorRunning = true;
  rerunRequested = false;

  console.log(`[docs-watch] Regenerating component docs (${changedLabel(changedPaths)})...`);
  activeGenerator = spawn(process.execPath, ["scripts/gen-component-docs.mjs"], {
    cwd: DOCS_ROOT,
    stdio: "inherit",
  });

  activeGenerator.on("exit", (code, signal) => {
    activeGenerator = undefined;
    generatorRunning = false;

    if (code === 0) {
      console.log("[docs-watch] Component docs updated.");
    } else {
      console.error(`[docs-watch] Generator failed (${signal ?? `exit ${code}`}).`);
    }

    if (rerunRequested || pendingChanges.size > 0) {
      runGenerator();
    }
  });

  activeGenerator.on("error", (error) => {
    activeGenerator = undefined;
    generatorRunning = false;
    console.error(`[docs-watch] Could not start generator: ${error.message}`);

    if (rerunRequested || pendingChanges.size > 0) {
      runGenerator();
    }
  });
}

function scheduleGenerator(readmePath) {
  pendingChanges.add(readmePath);
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(runGenerator, DEBOUNCE_MS);
}

for (const readmePath of README_PATHS) {
  watchFile(readmePath, { interval: WATCH_INTERVAL_MS }, (current, previous) => {
    const changed =
      current.mtimeMs !== previous.mtimeMs ||
      current.size !== previous.size ||
      existsSync(readmePath) !== Boolean(previous.mtimeMs);

    if (changed) {
      scheduleGenerator(readmePath);
    }
  });
}

function stop() {
  clearTimeout(debounceTimer);
  for (const readmePath of README_PATHS) {
    unwatchFile(readmePath);
  }
  activeGenerator?.kill();
}

process.on("SIGINT", () => {
  stop();
  process.exit(0);
});

process.on("SIGTERM", () => {
  stop();
  process.exit(0);
});

console.log(`[docs-watch] Watching ${README_PATHS.length} component README files.`);
runGenerator();
