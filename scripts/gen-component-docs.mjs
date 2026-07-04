// Regenerates src/content/docs/components/**/*.md from each @loomidev/* package's
// README.md (one level up, in ../../components/packages/<name>/README.md).
//
// Component docs are NOT hand-maintained in this project — they're derived from the
// published package README, which is the source of truth for that component's API.
// Re-run this after editing a component's README.
//
// Every fenced ```html code block in the README also gets a LIVE rendered preview
// inserted directly above it (same markup, executed for real), plus one page-level
// <script type="module"> that imports the component via the browser import map
// declared in astro.config.mjs. Run scripts/copy-component-assets.mjs first so the
// compiled components this imports actually exist under public/loomi/.
//
//   node scripts/gen-component-docs.mjs

import { readFileSync, writeFileSync, mkdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import {
  COMPONENT_NAMES,
  PACKAGE_PREFIX,
  categoryOf,
  tagNameFor,
} from "./loomiui-packages.mjs";

const PACKAGES = resolve(import.meta.dirname, "../../components/packages");
const DOCS = resolve(import.meta.dirname, "../src/content/docs/components");

// One flat directory, sorted alphabetically by Starlight's autogenerate (which sorts by
// slug) — categoryOf() is still used elsewhere (the MCP server manifest) but no longer
// affects the doc URL, which is just /components/<name>/ regardless of category.
const pathFor = (name) => (categoryOf(name) ? `/components/${name}/` : null);

function titleCase(name) {
  const special = {
    checkcards: "Checkcards",
    qrcode: "QR Code",
    "copy-to-clipboard": "Copy to Clipboard",
    "data-grid": "Data Grid",
    calendar: "Calendar",
  };
  if (special[name]) return special[name];
  return name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function firstParagraph(bodyAfterH1) {
  const lines = bodyAfterH1.split("\n");
  const out = [];
  let started = false;
  for (const line of lines) {
    if (!line.trim()) {
      if (started) break;
      continue;
    }
    started = true;
    out.push(line.trim());
  }
  return out.join(" ");
}

const FALLBACK_EXAMPLES = {
  "button-group": `<loomi-button-group color="primary">
  <loomi-button-group-item label="Day" value="day" icon="calendar" selected></loomi-button-group-item>
  <loomi-button-group-item label="Week" value="week" icon="calendar-days"></loomi-button-group-item>
  <loomi-button-group-item label="Month" value="month"></loomi-button-group-item>
</loomi-button-group>`,
};

function packageDescription(name) {
  try {
    const pkg = JSON.parse(readFileSync(resolve(PACKAGES, name, "package.json"), "utf8"));
    return pkg.description || `${titleCase(name)} component.`;
  } catch {
    return `${titleCase(name)} component.`;
  }
}

function fallbackReadme(name) {
  const tag = tagNameFor(name);
  const example = FALLBACK_EXAMPLES[name] ?? `<${tag}></${tag}>`;
  return [
    `# ${titleCase(name)}`,
    "",
    packageDescription(name),
    "",
    "## Installation",
    "",
    "```bash",
    `npm install ${PACKAGE_PREFIX}/${name} lit`,
    "```",
    "",
    "## Import",
    "",
    "```js",
    `import "${PACKAGE_PREFIX}/${name}";`,
    "```",
    "",
    "## Usage",
    "",
    "```html",
    example,
    "```",
    "",
  ].join("\n");
}

const PREVIEW_SETUP = {
  "data-grid": `
const setupDocsPreview = () => {
  document.querySelectorAll("loomi-data-grid").forEach(async (grid) => {
    if (grid.dataset.docsReady) return;
    grid.dataset.docsReady = "true";
    const { filteringModule } = await import("@loomidev/data-grid/modules/filtering.js");
    const { savedViewsModule } = await import("@loomidev/data-grid/modules/saved-views.js");
    grid.columns = [
      { key: "name", label: "Name", sortable: true, pinned: "start" },
      { key: "email", label: "Email" },
      { key: "role", label: "Role", filterable: true },
      { key: "status", label: "Status", filterable: true, pinned: "end" },
    ];
    grid.data = [
      { id: "usr_001", name: "Ama Mensah", email: "ama@example.com", role: "Owner", status: "Active" },
      { id: "usr_002", name: "Kojo Boateng", email: "kojo@example.com", role: "Admin", status: "Invited" },
      { id: "usr_003", name: "Esi Owusu", email: "esi@example.com", role: "Member", status: "Active" },
    ];
    grid.modules = [
      filteringModule(),
      savedViewsModule({
        views: [
          { id: "active", label: "Active users", filters: [{ key: "status", value: "Active" }], pageSize: 10 },
        ],
        activeViewId: "active",
      }),
    ];
  });
};`,
  "command-palette": `
const setupDocsPreview = () => {
  document.querySelectorAll("loomi-command-palette").forEach((palette) => {
    if (palette.dataset.docsReady) return;
    palette.dataset.docsReady = "true";
    palette.items = [
      {
        id: "go-users",
        label: "Open users",
        description: "Manage members and invites",
        group: "Navigation",
        href: "/users",
        keywords: ["members", "accounts"],
        shortcut: "G U",
      },
      {
        id: "invite-member",
        label: "Invite member",
        description: "Send a team invitation",
        group: "Actions",
      },
      {
        id: "open-billing",
        label: "Open billing",
        description: "Review invoices and plan details",
        group: "Navigation",
        shortcut: "G B",
      },
    ];
  });
};`,
  "filter-builder": `
const setupDocsPreview = () => {
  document.querySelectorAll("loomi-filter-builder").forEach((builder) => {
    if (builder.dataset.docsReady) return;
    builder.dataset.docsReady = "true";
    builder.fields = [
      { key: "name", label: "Name", type: "text" },
      {
        key: "status",
        label: "Status",
        type: "select",
        options: [
          { label: "Active", value: "Active" },
          { label: "Invited", value: "Invited" },
        ],
      },
      { key: "createdAt", label: "Created date", type: "date" },
    ];
    builder.rules = [{ id: "status-active", field: "status", operator: "equals", value: "Active" }];
  });
};`,
  chat: `
const setupDocsPreview = () => {
  document.querySelectorAll("loomi-chat-window").forEach((chat) => {
    if (chat.dataset.docsReady) return;
    chat.dataset.docsReady = "true";
    chat.participants = [
      { id: "you", name: "You", label: "YO", color: "primary" },
      { id: "sara", name: "Sara", label: "SA", color: "warning" },
      { id: "alex", name: "Alex", label: "AL", color: "success" },
    ];
    chat.currentUserId = "you";
    chat.showAvatars = true;
    chat.appendMessage({
      senderId: "sara",
      text: "Can we ship the dashboard this week?",
    });
    chat.appendMessage({
      senderId: "you",
      text: "Yes — I'll open the release branch after standup.",
    });
    chat.addEventListener("send", () => {
      chat.appendMessage({
        senderId: "alex",
        text: "I'll update the QA checklist once the branch is up.",
      });
    });
  });
};`,
  calendar: `
const setupDocsPreview = () => {
  document.querySelectorAll("loomi-calendar").forEach((calendar) => {
    if (calendar.dataset.docsReady) return;
    calendar.dataset.docsReady = "true";
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const day = today.getDate();
    calendar.editable = true;
    calendar.view = calendar.getAttribute("view") || "week";
    calendar.weekStarts = calendar.getAttribute("week-starts") || "monday";
    const demoStart = new Date();
    demoStart.setSeconds(0, 0);
    demoStart.setMinutes(Math.ceil(demoStart.getMinutes() / 30) * 30 + 30);
    const demoEnd = new Date(demoStart.getTime() + 2 * 60 * 60 * 1000);
    const demoInviteeAvatars = [
      "https://i.pravatar.cc/80?img=1",
      "https://i.pravatar.cc/80?img=2",
      "https://i.pravatar.cc/80?img=3",
      "https://i.pravatar.cc/80?img=4",
      "https://i.pravatar.cc/80?img=5",
    ];
    calendar.events = [
      {
        id: "evt_demo",
        title: "Product demo",
        start: demoStart,
        end: demoEnd,
        color: "primary",
        description: "Sienna is inviting you to a scheduled Zoom meeting.\\nTopic: Product demo for the new dashboard and Q&A session.\\n\\nJoin Zoom Meeting: https://us02web.zoom.us/j/86341969512\\nMeeting ID: 863 4196 9512",
        reminder: { label: "10 min before", minutesBefore: 10 },
        invitees: [
          { id: "u1", name: "Sienna Reed", initials: "SR", status: "yes", avatarUrl: demoInviteeAvatars[0] },
          { id: "u2", name: "Alex Kim", initials: "AK", status: "yes", avatarUrl: demoInviteeAvatars[1] },
          { id: "u3", name: "Jordan Lee", initials: "JL", status: "yes", avatarUrl: demoInviteeAvatars[2] },
          { id: "u4", name: "Morgan Patel", initials: "MP", status: "yes", avatarUrl: demoInviteeAvatars[3] },
          { id: "u5", name: "Casey Wu", initials: "CW", status: "yes", avatarUrl: demoInviteeAvatars[4] },
          { id: "u6", name: "Olivia Ross", initials: "OR", status: "awaiting" },
        ],
      },
      {
        id: "evt_1",
        title: "Product review",
        start: new Date(year, month, day, 10, 0),
        end: new Date(year, month, day, 11, 0),
        color: "primary",
        description: "Quarterly roadmap review",
      },
      {
        id: "evt_2",
        title: "Client lunch",
        start: new Date(year, month, day, 12, 30),
        end: new Date(year, month, day, 13, 30),
        color: "success",
      },
      {
        id: "evt_3",
        title: "Team offsite",
        start: new Date(year, month, day + 1, 0, 0),
        end: new Date(year, month, day + 2, 23, 59),
        color: "warning",
        isAllDay: true,
        recurrence: { frequency: "yearly", label: "Repeats yearly" },
      },
      {
        id: "evt_4",
        title: "Design sync",
        start: new Date(year, month, day, 14, 0),
        end: new Date(year, month, day, 15, 0),
        color: "secondary",
      },
      {
        id: "evt_5",
        title: "Sprint planning",
        start: new Date(year, month, day, 15, 30),
        end: new Date(year, month, day, 16, 30),
        color: "primary",
      },
      {
        id: "evt_6",
        title: "Investor call",
        start: new Date(year, month, day, 9, 0),
        end: new Date(year, month, day, 9, 45),
        color: "error",
      },
    ];
    calendar.resources = [
      { id: "room-a", label: "Room A", color: "primary" },
      { id: "room-b", label: "Room B", color: "secondary" },
    ];

    calendar.addEventListener("loomi-event-create", (event) => {
      calendar.events = [...calendar.events, event.detail.event];
    });

    calendar.addEventListener("loomi-event-duplicate", (event) => {
      calendar.events = [...calendar.events, event.detail.event];
    });

    calendar.addEventListener("loomi-event-delete", (event) => {
      calendar.events = calendar.events.filter((entry) => entry.id !== event.detail.event.id);
    });

    calendar.addEventListener("loomi-event-change", (event) => {
      const { event: updated } = event.detail;
      calendar.events = calendar.events.map((entry) => (entry.id === updated.id ? updated : entry));
    });
  });
};`,
};

function fixLinks(md) {
  let out = md;
  // root README anchors -> the customization page
  out = out.replace(/\]\(\.\.\/\.\.\/README\.md#[a-z0-9-]*theming[a-z0-9-]*\)/gi, "](/customization/)");
  out = out.replace(/\]\(\.\.\/\.\.\/README\.md\)/g, "](/installation/)");
  // sibling package links: ../<name> or ../<name>/README.md -> /components/<cat>/<name>/, else unlink
  out = out.replace(/\[([^\]]+)\]\(\.\.\/([a-z0-9-]+)\/?(?:README\.md)?(#[a-z0-9-]+)?\)/gi, (_m, label, name) => {
    const p = pathFor(name);
    return p ? `[${label}](${p})` : label;
  });
  // anything else pointing at a relative path we don't have a page for -> unlink
  out = out.replace(/\[([^\]]+)\]\((?:\.\.?\/)[^)]*\)/g, "$1");
  return out;
}

function importScript(name) {
  const setup = PREVIEW_SETUP[name];
  const setupCall = setup
    ? [
        setup,
        'if (document.readyState === "loading") {',
        '  document.addEventListener("DOMContentLoaded", setupDocsPreview, { once: true });',
        "} else {",
        "  setupDocsPreview();",
        "}",
      ].join("\n")
    : "";

  return [
    '<script type="module">',
    `  import "${PACKAGE_PREFIX}/${name}";`,
    setupCall,
    "</script>",
    "",
  ].join("\n");
}

/**
 * Insert a live <div class="loomi-preview"> rendering of each ```html fence, right above it.
 * A ```html.skip fence renders the same live preview but omits the fence itself from the
 * output — for READMEs that already show the markup/script split into separate ```js
 * blocks above and only need this one to drive the combined preview.
 */
function withLivePreviews(md) {
  return md.replace(/```html(\.skip)?\n([\s\S]*?)\n```/g, (fullMatch, skip, code) => {
    // The "Plain HTML" CDN sample brings its own <script type="importmap"> and a
    // <script src="https://esm.sh/..."> for the component. Both are illustrative of a
    // standalone setup with no bundler — neither is safe to execute live on this page:
    // the import map collides with the one this site's own <head> already declares (the
    // browser drops the conflicting rule, e.g. for `lit`), and the esm.sh script would
    // re-register the same custom element a second time on top of this page's own
    // locally-imported copy. Leave it as inert sample code instead.
    if (/type=["']importmap["']/.test(code)) return fullMatch;

    // CommonMark ends a raw HTML block at the first blank line, so a blank line between
    // two multi-line elements (common for readability in the fenced source) would split
    // this div in two, leaving everything after it to be reprocessed as markdown prose
    // (mangled text, smart quotes, stray <p>/<blockquote> tags). Collapsing blank lines
    // only in this copy keeps the live preview as one unbroken HTML block; the fenced
    // code shown to the reader (via fullMatch, below) keeps its original formatting.
    const previewCode = code.replace(/\n{2,}/g, "\n");
    const preview = `<div class="loomi-preview" data-label="Preview">\n${previewCode}\n</div>`;
    return skip ? preview : `${preview}\n\n${fullMatch}`;
  });
}

// Wipe and recreate flat — older versions of this script nested pages under a
// per-category subdirectory (components/forms/button.md, etc.); clear that out so a
// stale nested copy never lingers alongside the new flat one.
rmSync(DOCS, { recursive: true, force: true });
mkdirSync(DOCS, { recursive: true });

let written = 0;
for (const name of COMPONENT_NAMES) {
  const readmePath = resolve(PACKAGES, name, "README.md");
  let raw;
  try {
    raw = readFileSync(readmePath, "utf8");
  } catch {
    console.warn("fallback (no README found):", name);
    raw = fallbackReadme(name);
  }
  const lines = raw.split("\n");
  const h1Index = lines.findIndex((l) => l.startsWith("# "));
  const bodyLines = h1Index >= 0 ? lines.slice(h1Index + 1) : lines;
  const body = bodyLines.join("\n").trimStart();

  // Swap quotes/backticks out and drop backslashes BEFORE truncating, so a stray
  // markdown escape (e.g. `\`` or `\-`) never leaves a dangling backslash next to
  // whatever character follows once the backtick is gone — that's what previously
  // broke YAML parsing of the double-quoted frontmatter description.
  let description = firstParagraph(body).replace(/"/g, "'").replace(/`/g, "").replace(/\\/g, "");
  if (description.length > 160) {
    description = description.slice(0, 160).replace(/\s+\S*$/, "") + "…";
  }

  const frontmatter = ["---", `title: ${titleCase(name)}`, `description: "${description}"`, "---", ""].join("\n");
  const finalBody = withLivePreviews(fixLinks(body));

  writeFileSync(resolve(DOCS, `${name}.md`), frontmatter + importScript(name) + finalBody);
  written++;
}
console.log(`Generated ${written} component doc pages with live previews.`);
