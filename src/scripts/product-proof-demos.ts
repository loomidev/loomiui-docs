export {};

type ModalElement = HTMLElement & {
  show?: () => void;
  hide?: () => void;
};

type FloatingPanelElement = HTMLElement & {
  show?: () => void;
  hide?: () => void;
  top?: string;
  left?: string;
  width?: string;
  height?: string;
  title?: string;
};

type SortableElement = HTMLElement & {
  items?: Array<Record<string, string | boolean>>;
  updateComplete?: Promise<unknown>;
};

const mailSummaries: Record<string, string> = {
  "launch-plan": "AI summary: Nadia needs approval on the launch plan, with attention on cold-room handoff and label printing.",
  "billing-review": "AI summary: Owen sent Q3 pricing changes. Weekend refrigerated transport is the main margin risk.",
  "dock-thread": "AI summary: Samira and Malik aligned on training Theo for cold-room exceptions, pending Alice's approval.",
};

const kanbanHeadings: Record<string, { title: string; kicker: string }> = {
  dashboard: { title: "Dashboard", kicker: "Project overview" },
  tasks: { title: "Good morning, Kwame", kicker: "Tasks board" },
  calendar: { title: "Calendar", kicker: "Sprint schedule" },
  messages: { title: "Messages", kicker: "Team inbox" },
  files: { title: "Files", kicker: "Project documents" },
  team: { title: "Team", kicker: "Members and workload" },
};

const settingsHeadings: Record<string, string> = {
  general: "General Settings",
  profile: "Profile",
  workspace: "Workspace",
  projects: "Projects",
  members: "Members & Permissions",
  roles: "Roles",
  notifications: "Notifications",
  integrations: "Integrations",
  automation: "Automation",
  security: "Security",
  billing: "Billing & Subscription",
  import: "Import / Export",
  appearance: "Appearance",
  localisation: "Localisation",
};

const kanbanTasks = {
  todo: [
    { id: "design-login", label: "Design login and registration flow", meta: "UI/UX - May 22 - 2 comments", avatarImage: "/avatars/female2.jpg" },
    { id: "ci-pipeline", label: "Set up CI/CD pipeline for staging", meta: "DevOps - May 24 - 1 comment", avatarImage: "/avatars/male.jpg" },
    { id: "roles", label: "Define user roles and permissions", meta: "Backend - May 25 - 3 comments", avatarImage: "/avatars/male2.jpg" },
    { id: "payments", label: "Research payment gateway options", meta: "Research - May 26", avatarImage: "/avatars/female.jpg" },
  ],
  progress: [
    { id: "dashboard-layout", label: "Build dashboard layout and widgets", meta: "UI/UX - May 20 - 4 comments", avatarImage: "/avatars/male.jpg" },
    { id: "auth", label: "Implement user authentication", meta: "Backend - May 21 - 2 comments", avatarImage: "/avatars/female2.jpg" },
    { id: "sms", label: "Integrate SMS notifications", meta: "Backend - May 23 - 1 comment", avatarImage: "/avatars/male2.jpg" },
    { id: "landing", label: "Create landing page content", meta: "Content - May 24", avatarImage: "/avatars/female.jpg" },
  ],
  review: [
    { id: "transactions", label: "Transaction history API endpoint", meta: "Backend - May 19 - Review", avatarImage: "/avatars/male.jpg" },
    { id: "privacy", label: "Update privacy policy page", meta: "Content - May 18 - Review", avatarImage: "/avatars/female2.jpg" },
    { id: "responsive", label: "Fix responsive issues on mobile", meta: "UI/UX - May 17 - Review", avatarImage: "/avatars/male2.jpg" },
  ],
  done: [
    { id: "kickoff", label: "Project kickoff and requirements", meta: "Done - May 10", avatarImage: "/avatars/male.jpg" },
    { id: "schema", label: "Database schema design", meta: "Done - May 11", avatarImage: "/avatars/male2.jpg" },
    { id: "repo", label: "Set up project repository", meta: "Done - May 12", avatarImage: "/avatars/female2.jpg" },
    { id: "env", label: "Configure environment variables", meta: "Done - May 13", avatarImage: "/avatars/male.jpg" },
    { id: "style-guide", label: "Create UI style guide", meta: "Done - May 14", avatarImage: "/avatars/female.jpg" },
  ],
};

function pathElement<T extends HTMLElement>(event: Event, selector: string): T | null {
  return (event.composedPath().find((node) => node instanceof HTMLElement && node.matches(selector)) as T | undefined) ?? null;
}

function showModal(name: string): void {
  document.querySelector<ModalElement>(`loomi-modal[name="${name}"]`)?.show?.();
}

function showToast(message: string): void {
  const toast = document.getElementById("proof-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(Number(toast.dataset.timer || 0));
  const timer = window.setTimeout(() => toast.classList.add("hidden"), 2400);
  toast.dataset.timer = String(timer);
}

function activatePanel(root: HTMLElement, navSelector: string, panelSelector: string, key: string): void {
  for (const button of root.querySelectorAll<HTMLElement>(navSelector)) {
    const isActive = button.dataset.dashboardNav === key || button.dataset.kanbanNav === key || button.dataset.settingsNav === key;
    button.classList.toggle("active", isActive);
  }
  for (const panel of root.querySelectorAll<HTMLElement>(panelSelector)) {
    const isActive = panel.dataset.dashboardPanel === key || panel.dataset.kanbanPanel === key || panel.dataset.settingsPanel === key;
    panel.hidden = !isActive;
    panel.classList.toggle("active", isActive);
  }
}

function initDashboard(): void {
  const root = document.querySelector<HTMLElement>("[data-dashboard-demo]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = pathElement<HTMLElement>(event, "[data-dashboard-nav]");
    if (nav?.dataset.dashboardNav) {
      activatePanel(root, "[data-dashboard-nav]", "[data-dashboard-panel]", nav.dataset.dashboardNav);
      return;
    }

    const action = pathElement<HTMLElement>(event, "[data-dashboard-action]")?.dataset.dashboardAction;
    if (action === "profile") showModal("dashboard-profile-modal");
    if (action === "preferences") showModal("dashboard-preferences-modal");
    if (action === "logout") {
      root.querySelector<HTMLElement>("[data-dashboard-workspace]")?.setAttribute("hidden", "");
      root.querySelector<HTMLElement>("[data-dashboard-login]")?.removeAttribute("hidden");
      showToast("Alice Wonderland signed out");
    }

    if (pathElement(event, "[data-dashboard-login-submit]")) {
      root.querySelector<HTMLElement>("[data-dashboard-login]")?.setAttribute("hidden", "");
      root.querySelector<HTMLElement>("[data-dashboard-workspace]")?.removeAttribute("hidden");
      const password = root.querySelector<HTMLInputElement>("#dashboard-login-password");
      if (password) password.value = "";
      showToast("Welcome back, Alice");
    }
  });
}

function activeMailId(root: HTMLElement): string | null {
  return root.querySelector<HTMLElement>(".mail-row.active")?.dataset.mailId ?? null;
}

function mailToolbarHtml(): string {
  return `
    <header class="mail-detail-toolbar">
      <div class="mail-action-cluster">
        <loomi-tooltip content="Reply" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="reply"><loomi-icon name="arrow-uturn-left"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Reply all" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="reply-all"><loomi-icon name="users"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Forward" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="forward"><loomi-icon name="arrow-uturn-right"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Delete" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="delete"><loomi-icon name="trash"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Snooze" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="snooze"><loomi-icon name="clock"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Pin or flag" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="pin"><loomi-icon name="flag"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="Mark unread" placement="bottom"><button class="mail-icon-action" type="button" data-mail-action="unread"><loomi-icon name="envelope"></loomi-icon></button></loomi-tooltip>
        <loomi-tooltip content="AI summary" placement="bottom"><button class="mail-icon-action ai" type="button" data-mail-action="ai"><loomi-icon name="sparkles"></loomi-icon></button></loomi-tooltip>
      </div>
      <button class="mail-close-detail" type="button" data-mail-action="close-detail" aria-label="Close message"><loomi-icon name="x-mark"></loomi-icon></button>
    </header>
  `;
}

function ensureMailDetail(root: HTMLElement, id: string): HTMLElement | null {
  const existing = root.querySelector<HTMLElement>(`[data-mail-detail="${id}"]`);
  if (existing) return existing;

  const row = root.querySelector<HTMLElement>(`.mail-row[data-mail-id="${id}"]`);
  const detailPane = root.querySelector<HTMLElement>(".mail-detail-pane");
  if (!row || !detailPane) return null;

  const sender = row.querySelector("strong")?.textContent?.trim() || row.dataset.recipient || "Sender";
  const subject = row.querySelector(".mail-row-copy > span")?.textContent?.trim() || "Message";
  const intro = row.querySelector(".mail-row-copy small")?.textContent?.trim() || "This message is ready for review.";
  const time = row.querySelector(".mail-time")?.textContent?.trim() || "Today";
  const article = document.createElement("article");
  article.className = "mail-detail";
  article.dataset.mailDetail = id;
  article.hidden = true;
  article.innerHTML = `
    ${mailToolbarHtml()}
    <div class="mail-summary" data-mail-summary hidden></div>
    <div class="mail-message-head">
      <div>
        <h3>${subject}</h3>
        <p><strong>${sender}</strong> to me</p>
      </div>
      <span>${time}</span>
    </div>
    <div class="mail-body">
      <p>${intro}</p>
      <p>I added the latest context and the next action for your review. Please reply when you want the team to proceed.</p>
    </div>
  `;
  detailPane.append(article);
  return article;
}

function openMail(root: HTMLElement, id: string): void {
  ensureMailDetail(root, id);
  for (const row of root.querySelectorAll<HTMLElement>(".mail-row")) row.classList.toggle("active", row.dataset.mailId === id);
  let found = false;
  for (const detail of root.querySelectorAll<HTMLElement>("[data-mail-detail]")) {
    const active = detail.dataset.mailDetail === id;
    detail.hidden = !active;
    detail.classList.toggle("active", active);
    found ||= active;
  }
  const empty = root.querySelector<HTMLElement>("[data-mail-empty]");
  if (empty) empty.hidden = found;
}

function incrementFolderCount(folder: string): void {
  const node = document.querySelector<HTMLElement>(`[data-mail-folder-count="${folder}"]`);
  if (!node) return;
  node.textContent = String((Number(node.textContent?.trim()) || 0) + 1);
}

function decrementFolderCount(folder: string): void {
  const node = document.querySelector<HTMLElement>(`[data-mail-folder-count="${folder}"]`);
  if (!node) return;
  node.textContent = String(Math.max(0, (Number(node.textContent?.trim()) || 0) - 1));
}

function dockReplyPanel(root: HTMLElement, mode: string): void {
  const panel = document.querySelector<FloatingPanelElement>('loomi-floating-panel[name="mail-reply-panel"]');
  if (!panel) return;
  const row = root.querySelector<HTMLElement>(".mail-row.active");
  const recipient = row?.dataset.recipient ?? "Nadia Mensah";
  const recipientNode = document.getElementById("mail-reply-recipient");
  if (recipientNode) recipientNode.textContent = recipient;
  panel.title = mode;
  panel.setAttribute("title", mode);

  const rect = root.getBoundingClientRect();
  const width = Math.min(400, Math.max(320, rect.width * 0.42));
  const height = 384;
  const top = Math.max(16, rect.bottom - height - 18);
  const left = Math.max(16, rect.right - width - 18);
  panel.width = `${width}px`;
  panel.height = `${height}px`;
  panel.top = `${top}px`;
  panel.left = `${left}px`;
  panel.setAttribute("width", `${width}px`);
  panel.setAttribute("height", `${height}px`);
  panel.setAttribute("top", `${top}px`);
  panel.setAttribute("left", `${left}px`);
  panel.show?.();
}

function initMail(): void {
  const root = document.querySelector<HTMLElement>("[data-mail-demo]");
  if (!root) return;
  let suppressDraftPrompt = false;

  root.addEventListener("click", (event) => {
    const row = pathElement<HTMLElement>(event, "[data-mail-id]");
    if (row?.dataset.mailId) {
      openMail(root, row.dataset.mailId);
      return;
    }

    const userAction = pathElement<HTMLElement>(event, "[data-mail-user-action]")?.dataset.mailUserAction;
    if (userAction === "profile") showModal("mail-profile-modal");
    if (userAction === "preferences") showModal("mail-preferences-modal");

    const snooze = pathElement<HTMLElement>(event, "[data-mail-snooze]")?.dataset.mailSnooze;
    if (snooze) showToast(`Message snoozed until ${snooze}`);

    const action = pathElement<HTMLElement>(event, "[data-mail-action]")?.dataset.mailAction;
    if (!action) return;

    const id = activeMailId(root);
    if (action === "reply" || action === "reply-all" || action === "forward") {
      const title = action === "reply-all" ? "Reply all" : action === "forward" ? "Forward" : "Reply";
      dockReplyPanel(root, title);
      return;
    }
    if (action === "delete" && id) {
      root.querySelector<HTMLElement>(`.mail-row[data-mail-id="${id}"]`)?.remove();
      root.querySelector<HTMLElement>(`[data-mail-detail="${id}"]`)?.remove();
      decrementFolderCount("inbox");
      const next = root.querySelector<HTMLElement>(".mail-row")?.dataset.mailId;
      if (next) openMail(root, next);
      showToast("Message moved to trash");
      return;
    }
    if (action === "close-detail") {
      for (const detail of root.querySelectorAll<HTMLElement>("[data-mail-detail]")) {
        detail.hidden = true;
        detail.classList.remove("active");
      }
      root.querySelector<HTMLElement>("[data-mail-empty]")?.removeAttribute("hidden");
      return;
    }
    if (action === "unread" && id) {
      const activeRow = root.querySelector<HTMLElement>(`.mail-row[data-mail-id="${id}"]`);
      activeRow?.classList.add("unread");
      if (activeRow && !activeRow.querySelector(".mail-unread-dot")) {
        const dot = document.createElement("span");
        dot.className = "mail-unread-dot";
        activeRow.append(dot);
      }
      showToast("Message marked unread");
      return;
    }
    if (action === "pin" && id) {
      root.querySelector<HTMLElement>(`.mail-row[data-mail-id="${id}"]`)?.classList.toggle("is-pinned");
      showToast("Pin state updated");
      return;
    }
    if (action === "ai" && id) {
      const detail = root.querySelector<HTMLElement>(`[data-mail-detail="${id}"]`);
      const summary = detail?.querySelector<HTMLElement>("[data-mail-summary]");
      if (summary) {
        summary.textContent = mailSummaries[id] ?? "AI summary: This message needs a short follow-up.";
        summary.hidden = false;
      }
      return;
    }
    if (action === "snooze") showToast("Open the clock menu to choose a snooze time");
  });

  document.getElementById("mail-reply-send")?.addEventListener("click", () => {
    suppressDraftPrompt = true;
    document.querySelector<FloatingPanelElement>('loomi-floating-panel[name="mail-reply-panel"]')?.hide?.();
    showToast("Reply sent");
  });

  document.querySelector<FloatingPanelElement>('loomi-floating-panel[name="mail-reply-panel"]')?.addEventListener("close", () => {
    if (suppressDraftPrompt) {
      suppressDraftPrompt = false;
      return;
    }
    showModal("mail-save-draft-modal");
  });

  document.querySelector<ModalElement>('loomi-modal[name="mail-save-draft-modal"]')?.addEventListener("ok", () => {
    incrementFolderCount("drafts");
    showToast("Draft saved");
  });
}

async function decorateSortableMenus(sortable: SortableElement): Promise<void> {
  await sortable.updateComplete;
  const root = sortable.shadowRoot;
  if (!root) return;
  if (!root.querySelector("[data-kanban-row-style]")) {
    const style = document.createElement("style");
    style.dataset.kanbanRowStyle = "true";
    style.textContent = `
      .loomi-row { align-items:flex-start; padding:.8rem; min-height:5.2rem; }
      .loomi-label { color:var(--loomi-text); font-weight:700; line-height:1.35; white-space:normal; }
      .loomi-meta { margin-top:.35rem; white-space:normal; }
      loomi-dropmenu { margin-left:.35rem; flex:none; }
    `;
    root.append(style);
  }
  root.querySelectorAll<HTMLElement>(".loomi-row").forEach((row) => {
    if (row.querySelector("loomi-dropmenu")) return;
    const title = row.querySelector(".loomi-label")?.textContent?.trim() || "Task";
    const menu = document.createElement("loomi-dropmenu");
    menu.setAttribute("position", "left");
    menu.setAttribute("hide-after-click", "");
    ["Open details", "Assign owner", "Duplicate", "Archive"].forEach((label) => {
      const item = document.createElement("loomi-dropmenu-item");
      item.textContent = label;
      if (label === "Archive") item.setAttribute("variant", "destructive");
      item.addEventListener("click", (event) => {
        event.stopPropagation();
        showToast(`${label}: ${title}`);
      });
      menu.append(item);
    });
    row.append(menu);
  });
}

function updateKanbanCounts(root: HTMLElement): void {
  root.querySelectorAll<SortableElement>("[data-kanban-sortable]").forEach((sortable) => {
    const count = sortable.items?.length ?? 0;
    const header = sortable.closest(".kanban-column")?.querySelector("header span");
    if (header) header.textContent = String(count);
  });
}

function initKanban(): void {
  const root = document.querySelector<HTMLElement>("[data-kanban-demo]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = pathElement<HTMLElement>(event, "[data-kanban-nav]");
    if (!nav?.dataset.kanbanNav) return;
    const key = nav.dataset.kanbanNav;
    activatePanel(root, "[data-kanban-nav]", "[data-kanban-panel]", key);
    const heading = kanbanHeadings[key];
    const title = root.querySelector<HTMLElement>("[data-kanban-heading]");
    const kicker = root.querySelector<HTMLElement>("[data-kanban-kicker]");
    if (heading && title && kicker) {
      title.textContent = heading.title;
      kicker.textContent = heading.kicker;
    }
  });

  root.querySelectorAll<SortableElement>("[data-kanban-sortable]").forEach((sortable) => {
    const key = sortable.dataset.kanbanSortable as keyof typeof kanbanTasks;
    sortable.items = [...(kanbanTasks[key] ?? [])];
    sortable.addEventListener("item-click", (event) => {
      const detail = (event as CustomEvent).detail?.item?.label ?? "Task";
      showToast(`Opened ${detail}`);
    });
    sortable.addEventListener("reorder", () => void decorateSortableMenus(sortable));
    sortable.addEventListener("transfer", () => {
      updateKanbanCounts(root);
      void decorateSortableMenus(sortable);
    });
    void decorateSortableMenus(sortable);
  });
  updateKanbanCounts(root);
}

function initSettings(): void {
  const root = document.querySelector<HTMLElement>("[data-settings-demo]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = pathElement<HTMLElement>(event, "[data-settings-nav]");
    if (!nav?.dataset.settingsNav) return;
    const key = nav.dataset.settingsNav;
    activatePanel(root, "[data-settings-nav]", "[data-settings-panel]", key);
    const heading = root.querySelector<HTMLElement>("[data-settings-heading]");
    if (heading) heading.textContent = settingsHeadings[key] ?? nav.textContent?.trim() ?? "Settings";
  });
}

function initProofActions(): void {
  document.addEventListener("click", (event) => {
    const toastTarget = pathElement<HTMLElement>(event, "[data-proof-toast]");
    const message = toastTarget?.dataset.proofToast;
    if (message) showToast(message);
  });
}

function initProductProofDemos(): void {
  initProofActions();
  initDashboard();
  initMail();
  initKanban();
  initSettings();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProductProofDemos, { once: true });
} else {
  initProductProofDemos();
}
