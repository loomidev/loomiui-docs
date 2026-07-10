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

type KanbanColumnKey = "todo" | "progress" | "done";

type KanbanTask = {
  id: string;
  title: string;
  team: string;
  date: string; // ISO yyyy-mm-dd
  assignee: string; // teammate id
};

const kanbanTeammates = [
  { id: "kwame", name: "Kwame Mensah", role: "Project Manager", image: "/avatars/male.jpg" },
  { id: "akosua", name: "Akosua Boateng", role: "UI/UX Designer", image: "/avatars/female2.jpg" },
  { id: "kofi", name: "Kofi Asare", role: "Backend Developer", image: "/avatars/male2.jpg" },
  { id: "ama", name: "Ama Serwaa", role: "Frontend Developer", image: "/avatars/female.jpg" },
];

const kanbanTaskData: Record<string, KanbanTask> = {
  "design-login": { id: "design-login", title: "Design login and registration flow", team: "UI/UX", date: "2026-07-15", assignee: "akosua" },
  "ci-pipeline": { id: "ci-pipeline", title: "Set up CI/CD pipeline for staging", team: "DevOps", date: "2026-07-17", assignee: "kofi" },
  "roles": { id: "roles", title: "Define user roles and permissions", team: "Backend", date: "2026-07-18", assignee: "kofi" },
  "payments": { id: "payments", title: "Research payment gateway options", team: "Research", date: "2026-07-20", assignee: "kwame" },
  "dashboard-layout": { id: "dashboard-layout", title: "Build dashboard layout and widgets", team: "UI/UX", date: "2026-07-11", assignee: "akosua" },
  "auth": { id: "auth", title: "Implement user authentication", team: "Backend", date: "2026-07-14", assignee: "kofi" },
  "sms": { id: "sms", title: "Integrate SMS notifications", team: "Backend", date: "2026-07-16", assignee: "ama" },
  "landing": { id: "landing", title: "Create landing page content", team: "Content", date: "2026-07-13", assignee: "ama" },
  "kickoff": { id: "kickoff", title: "Project kickoff and requirements", team: "Planning", date: "2026-07-01", assignee: "kwame" },
  "schema": { id: "schema", title: "Database schema design", team: "Backend", date: "2026-07-02", assignee: "kofi" },
  "repo": { id: "repo", title: "Set up project repository", team: "DevOps", date: "2026-07-03", assignee: "kwame" },
  "env": { id: "env", title: "Configure environment variables", team: "DevOps", date: "2026-07-06", assignee: "ama" },
  "style-guide": { id: "style-guide", title: "Create UI style guide", team: "UI/UX", date: "2026-07-07", assignee: "akosua" },
};

const kanbanColumns: Record<KanbanColumnKey, string[]> = {
  todo: ["design-login", "ci-pipeline", "roles", "payments"],
  progress: ["dashboard-layout", "auth", "sms", "landing"],
  done: ["kickoff", "schema", "repo", "env", "style-guide"],
};

const KANBAN_COLUMN_LABELS: Record<KanbanColumnKey, string> = { todo: "To Do", progress: "In Progress", done: "Done" };
const KANBAN_COLUMN_TAG_COLORS: Record<KanbanColumnKey, string> = { todo: "primary", progress: "orange", done: "green" };

let kanbanTeamFilter = "all";
let kanbanDrawerTaskId: string | null = null;
let kanbanAssignTaskId: string | null = null;

type KanbanChatMessage = {
  id: string;
  senderId: string;
  text: string;
  time?: string;
  attachment?: { name: string; meta?: string; icon?: string };
};

type KanbanChatContact = {
  id: string;
  name: string;
  role: string;
  image?: string;
  label?: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  starred?: boolean;
  mentions?: boolean;
  archived?: boolean;
  typing?: boolean;
  reply: string;
  members?: string[];
};

const kanbanChatContacts: KanbanChatContact[] = [
  { id: "akosua", name: "Akosua Boateng", role: "UI/UX Designer", image: "/avatars/female2.jpg", phone: "+233 24 123 4567", preview: "Can you share the latest wireframes for the dashboard?", time: "10:24 AM", unread: 2, starred: true, typing: true, reply: "Perfect, reviewing them now!" },
  { id: "kofi", name: "Kofi Asare", role: "Backend Developer", image: "/avatars/male2.jpg", phone: "+233 24 555 8210", preview: "The API integration is complete. Ready for testing.", time: "9:15 AM", unread: 1, reply: "I'll push the test cases shortly." },
  { id: "ama", name: "Ama Serwaa", role: "Frontend Developer", image: "/avatars/female.jpg", phone: "+233 20 771 0034", preview: "Thanks! I've updated the content based on your feedback.", time: "Yesterday", unread: 0, starred: true, reply: "Will do, thanks Kwame!" },
  { id: "design", name: "Design Team", role: "8 members", label: "DT", phone: "-", preview: "Akosua: Added new components to the library.", time: "Yesterday", unread: 2, mentions: true, reply: "I'll walk everyone through them on Friday.", members: ["akosua", "ama", "kofi"] },
  { id: "yaw", name: "Yaw Mensah", role: "DevOps Engineer", image: "/avatars/male.jpg", phone: "+233 26 400 1187", preview: "Reminder: Sprint planning tomorrow at 10am.", time: "Jul 8", unread: 0, reply: "See you at planning." },
  { id: "efua", name: "Efua Duku", role: "Content Strategist", image: "/avatars/female2.jpg", phone: "+233 27 909 5522", preview: "Please review the copy for the landing page.", time: "Jul 7", unread: 0, archived: true, reply: "No rush - whenever you get a moment." },
];

const kanbanChatTranscripts: Record<string, KanbanChatMessage[]> = {
  akosua: [
    { id: "ak-1", senderId: "akosua", text: "Hi Kwame, can you share the latest wireframes for the dashboard?", time: "10:21 AM" },
    { id: "ak-2", senderId: "kwame", text: "Hi Akosua, sure! I've just updated them based on the feedback. See attached.", time: "10:22 AM" },
    { id: "ak-3", senderId: "kwame", text: "", time: "10:22 AM", attachment: { name: "dashboard_wireframes_v2.fig", meta: "Figma File - 4.6 MB", icon: "document" } },
    { id: "ak-4", senderId: "akosua", text: "Looks great! I'll review and share my thoughts.", time: "10:23 AM" },
    { id: "ak-5", senderId: "kwame", text: "Thanks! Let me know if you need anything else.", time: "10:24 AM" },
  ],
  kofi: [
    { id: "ko-1", senderId: "kofi", text: "The API integration is complete. Ready for testing.", time: "9:12 AM" },
    { id: "ko-2", senderId: "kwame", text: "Great work! Does it cover the repayment endpoints too?", time: "9:14 AM" },
    { id: "ko-3", senderId: "kofi", text: "Yes - loans, repayments, and the field-ops summary.", time: "9:15 AM" },
  ],
  ama: [
    { id: "am-1", senderId: "ama", text: "Thanks! I've updated the content based on your feedback.", time: "Yesterday" },
    { id: "am-2", senderId: "kwame", text: "Looks much sharper. Ship it to staging when ready.", time: "Yesterday" },
  ],
  design: [
    { id: "dt-1", senderId: "akosua", text: "Added new components to the library.", time: "Yesterday" },
    { id: "dt-2", senderId: "ama", text: "Nice! Are the empty states in there as well?", time: "Yesterday" },
    { id: "dt-3", senderId: "akosua", text: "Yes, plus the new table density options.", time: "Yesterday" },
  ],
  yaw: [
    { id: "ya-1", senderId: "yaw", text: "Reminder: Sprint planning tomorrow at 10am.", time: "Jul 8" },
    { id: "ya-2", senderId: "kwame", text: "Thanks Yaw, I'll have the backlog groomed tonight.", time: "Jul 8" },
  ],
  efua: [
    { id: "ef-1", senderId: "efua", text: "Please review the copy for the landing page.", time: "Jul 7" },
  ],
};

let kanbanChatFilter = "all";
let kanbanActiveChat = "akosua";

function pathElement<T extends HTMLElement>(event: Event, selector: string): T | null {
  return (event.composedPath().find((node) => node instanceof HTMLElement && node.matches(selector)) as T | undefined) ?? null;
}

function showModal(name: string): void {
  document.querySelector<ModalElement>(`loomi-modal[name="${name}"]`)?.show?.();
}

type NotifyFn = (title: string, message?: string, type?: string, dismissIn?: number) => void;

function showToast(message: string): void {
  const notify = (window as Window & { showLoomiNotification?: NotifyFn }).showLoomiNotification;
  if (notify) {
    notify(message, "", "success", 4);
    return;
  }
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
        <loomi-dropmenu class="mail-snooze-menu" position="bottom" hide-after-click>
          <loomi-tooltip slot="trigger" content="Snooze" placement="bottom"><button class="mail-icon-action" type="button" aria-label="Snooze"><loomi-icon name="clock"></loomi-icon></button></loomi-tooltip>
          <loomi-dropmenu-item icon="clock" data-mail-snooze="Later today">Later today <span slot="meta">6:00 PM</span></loomi-dropmenu-item>
          <loomi-dropmenu-item icon="sun" data-mail-snooze="Tomorrow">Tomorrow morning</loomi-dropmenu-item>
          <loomi-dropmenu-item icon="calendar-days" data-mail-snooze="Monday">Monday</loomi-dropmenu-item>
          <loomi-dropmenu-item icon="calendar" data-mail-snooze="Custom date">Pick date</loomi-dropmenu-item>
        </loomi-dropmenu>
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

function dockReplyPanel(root: HTMLElement, mode: string, recipientOverride?: string): void {
  const panel = document.querySelector<FloatingPanelElement>('loomi-floating-panel[name="mail-reply-panel"]');
  if (!panel) return;
  const row = root.querySelector<HTMLElement>(".mail-row.active");
  const recipient = recipientOverride ?? row?.dataset.recipient ?? "Nadia Mensah";
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

function selectMailFolder(root: HTMLElement, folder: HTMLElement): void {
  for (const button of root.querySelectorAll<HTMLElement>("[data-mail-folder]")) {
    button.classList.toggle("active", button === folder);
  }
  const key = folder.dataset.mailFolder;
  let visible = 0;
  for (const row of root.querySelectorAll<HTMLElement>(".mail-row")) {
    const show = key === "inbox" || (key === "starred" && row.classList.contains("is-pinned"));
    row.hidden = !show;
    if (show) visible += 1;
  }
  const empty = root.querySelector<HTMLElement>("[data-mail-list-empty]");
  if (empty) empty.hidden = visible > 0;
  if (visible === 0) {
    for (const detail of root.querySelectorAll<HTMLElement>("[data-mail-detail]")) {
      detail.hidden = true;
      detail.classList.remove("active");
    }
    root.querySelector<HTMLElement>("[data-mail-empty]")?.removeAttribute("hidden");
  } else {
    const first = root.querySelector<HTMLElement>(".mail-row:not([hidden])")?.dataset.mailId;
    if (first) openMail(root, first);
  }
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

    if (pathElement(event, "[data-mail-compose]")) {
      dockReplyPanel(root, "New message", "Add recipient");
      return;
    }

    const folder = pathElement<HTMLElement>(event, "[data-mail-folder]");
    if (folder?.dataset.mailFolder) {
      selectMailFolder(root, folder);
      return;
    }

    const label = pathElement<HTMLElement>(event, "[data-mail-label]")?.dataset.mailLabel;
    if (label) {
      showToast(`Filtered by label: ${label}`);
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

type DrawerElement = HTMLElement & { show?: () => void; hide?: () => void };
type AutocompleteElement = HTMLElement & { data?: Array<Record<string, string>>; value?: string };
type CalendarElement = HTMLElement & { events?: Array<Record<string, unknown>> };
type ValueElement = HTMLElement & { value?: string; selectedValue?: string };

function kanbanTeammate(id: string): (typeof kanbanTeammates)[number] {
  return kanbanTeammates.find((t) => t.id === id) ?? kanbanTeammates[0];
}

function kanbanColumnOf(id: string): KanbanColumnKey | null {
  for (const col of Object.keys(kanbanColumns) as KanbanColumnKey[]) {
    if (kanbanColumns[col].includes(id)) return col;
  }
  return null;
}

function formatKanbanDate(iso: string): string {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function kanbanTaskMatchesFilter(id: string): boolean {
  return kanbanTeamFilter === "all" || kanbanTaskData[id]?.team === kanbanTeamFilter;
}

function kanbanSortableFor(root: HTMLElement, col: KanbanColumnKey): SortableElement | null {
  return root.querySelector<SortableElement>(`[data-kanban-sortable="${col}"]`);
}

function renderKanbanColumn(root: HTMLElement, col: KanbanColumnKey): void {
  const sortable = kanbanSortableFor(root, col);
  if (!sortable) return;
  sortable.items = kanbanColumns[col].filter(kanbanTaskMatchesFilter).map((id) => {
    const task = kanbanTaskData[id];
    return {
      id,
      label: task.title,
      meta: `${task.team}\n${formatKanbanDate(task.date)}`,
      avatarImage: kanbanTeammate(task.assignee).image,
      className: col === "done" ? "done-task" : "",
    };
  });
  void decorateKanbanSortable(root, sortable, col);
}

function updateKanbanCounts(root: HTMLElement): void {
  (Object.keys(kanbanColumns) as KanbanColumnKey[]).forEach((col) => {
    const header = kanbanSortableFor(root, col)?.closest(".kanban-column")?.querySelector("header span");
    if (header) header.textContent = String(kanbanColumns[col].filter(kanbanTaskMatchesFilter).length);
  });
}

function syncKanbanCalendar(root: HTMLElement): void {
  const calendar = root.querySelector<CalendarElement>("[data-kanban-calendar]");
  if (!calendar) return;
  const colors: Record<KanbanColumnKey, string> = { todo: "primary", progress: "warning", done: "success" };
  const events: Array<Record<string, unknown>> = [];
  (Object.keys(kanbanColumns) as KanbanColumnKey[]).forEach((col) => {
    kanbanColumns[col].forEach((id) => {
      const task = kanbanTaskData[id];
      if (!task) return;
      const start = new Date(`${task.date}T09:00:00`);
      events.push({
        id,
        title: task.title,
        start,
        end: new Date(start.getTime() + 60 * 60 * 1000),
        color: colors[col],
        description: `${task.team} - ${KANBAN_COLUMN_LABELS[col]} - ${kanbanTeammate(task.assignee).name}`,
      });
    });
  });
  calendar.events = events;
}

function renderKanbanBoard(root: HTMLElement): void {
  (Object.keys(kanbanColumns) as KanbanColumnKey[]).forEach((col) => renderKanbanColumn(root, col));
  updateKanbanCounts(root);
  syncKanbanCalendar(root);
}

function syncKanbanColumnFromSortable(root: HTMLElement, col: KanbanColumnKey): void {
  const sortable = kanbanSortableFor(root, col);
  if (!sortable) return;
  const visibleIds = (sortable.items ?? []).map((item) => String(item.id));
  const visibleSet = new Set(visibleIds);
  const hidden = kanbanColumns[col].filter((id) => !visibleSet.has(id) && !kanbanTaskMatchesFilter(id));
  kanbanColumns[col] = [...visibleIds, ...hidden];
}

function moveKanbanTask(root: HTMLElement, id: string, target: KanbanColumnKey): void {
  const current = kanbanColumnOf(id);
  if (!current || current === target) return;
  kanbanColumns[current] = kanbanColumns[current].filter((taskId) => taskId !== id);
  kanbanColumns[target] = [id, ...kanbanColumns[target]];
  renderKanbanBoard(root);
  showToast(`"${kanbanTaskData[id]?.title}" moved to ${KANBAN_COLUMN_LABELS[target]}`);
}

function deleteKanbanTask(root: HTMLElement, id: string): void {
  const col = kanbanColumnOf(id);
  if (!col) return;
  kanbanColumns[col] = kanbanColumns[col].filter((taskId) => taskId !== id);
  const title = kanbanTaskData[id]?.title ?? "Task";
  delete kanbanTaskData[id];
  renderKanbanBoard(root);
  showToast(`"${title}" deleted`);
}

function teammateAutocompleteData(excludeId?: string): Array<Record<string, string>> {
  return kanbanTeammates
    .filter((t) => t.id !== excludeId)
    .map((t) => ({ label: t.name, value: t.id, description: t.role, image: t.image }));
}

function openKanbanAssigneeModal(id: string): void {
  const task = kanbanTaskData[id];
  if (!task) return;
  kanbanAssignTaskId = id;
  const label = document.querySelector<HTMLElement>("[data-kam-task]");
  if (label) label.textContent = `"${task.title}" is assigned to ${kanbanTeammate(task.assignee).name}. Hand it to:`;
  const picker = document.getElementById("kam-picker") as AutocompleteElement | null;
  if (picker) {
    picker.data = teammateAutocompleteData(task.assignee);
    picker.setAttribute("selected-value", "");
    picker.value = "";
  }
  showModal("kanban-assignee-modal");
}

function openKanbanTaskDrawer(id: string): void {
  const task = kanbanTaskData[id];
  const col = kanbanColumnOf(id);
  if (!task || !col) return;
  kanbanDrawerTaskId = id;
  const drawer = document.querySelector<DrawerElement>('loomi-drawer[name="kanban-task-drawer"]');
  if (!drawer) return;
  const assignee = kanbanTeammate(task.assignee);
  drawer.querySelector("[data-ktd-title]")!.textContent = task.title;
  const status = drawer.querySelector("[data-ktd-status]");
  status?.setAttribute("label", KANBAN_COLUMN_LABELS[col]);
  status?.setAttribute("color", KANBAN_COLUMN_TAG_COLORS[col]);
  drawer.querySelector("[data-ktd-team]")!.textContent = task.team;
  drawer.querySelector("[data-ktd-date]")!.textContent = formatKanbanDate(task.date);
  drawer.querySelector("[data-ktd-assignee]")!.textContent = assignee.name;
  drawer.querySelector("[data-ktd-avatar]")?.setAttribute("image", assignee.image);
  const toggle = drawer.querySelector<HTMLElement>("[data-ktd-toggle]");
  if (toggle) {
    toggle.textContent = col === "done" ? "Reopen task" : "Mark as done";
    toggle.setAttribute("icon", col === "done" ? "arrow-uturn-left" : "check");
  }
  drawer.show?.();
}

/* Doubled class selectors so these rules outrank the component's adopted
   stylesheets, which cascade after injected <style> elements at equal specificity. */
const KANBAN_CARD_STYLE = `
  .loomi-row.loomi-row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;
    grid-template-rows: auto auto;
    align-items: start;
    gap: 0.1rem 0.55rem;
    padding: 0.7rem 0.75rem;
  }
  .loomi-row .loomi-handle { grid-column: 1; grid-row: 1 / span 2; margin-top: 0.15rem; }
  .loomi-row .loomi-text { grid-column: 2; grid-row: 1 / span 2; }
  .loomi-row .loomi-label { color: var(--loomi-text); font-weight: 400; line-height: 1.35; white-space: normal; }
  .loomi-row .loomi-meta { margin-top: 0.35rem; white-space: pre-line; line-height: 1.45; }
  .loomi-row loomi-dropmenu { grid-column: 3; grid-row: 1; justify-self: end; margin: -0.2rem -0.2rem 0 0; }
  .loomi-row .loomi-avatar-slot { grid-column: 3; grid-row: 2; align-self: end; justify-self: end; cursor: pointer; border-radius: 9999px; }
  .loomi-row .loomi-avatar-slot:hover { outline: 2px solid rgb(148 163 184 / 0.6); outline-offset: 1px; }
  .loomi-row.done-task .loomi-label { text-decoration: line-through; color: rgb(100 116 139); }
`;

async function decorateKanbanSortable(root: HTMLElement, sortable: SortableElement, col: KanbanColumnKey): Promise<void> {
  await sortable.updateComplete;
  const shadow = sortable.shadowRoot;
  if (!shadow) return;
  if (!shadow.querySelector("[data-kanban-row-style]")) {
    const style = document.createElement("style");
    style.dataset.kanbanRowStyle = "true";
    style.textContent = KANBAN_CARD_STYLE;
    shadow.append(style);
  }
  const rowTaskId = (node: HTMLElement): string => node.closest<HTMLElement>(".loomi-row")?.dataset.id ?? "";
  shadow.querySelectorAll<HTMLElement>(".loomi-row").forEach((row) => {
    const avatarSlot = row.querySelector<HTMLElement>(".loomi-avatar-slot");
    if (avatarSlot && !avatarSlot.dataset.kanbanWired) {
      avatarSlot.dataset.kanbanWired = "true";
      avatarSlot.setAttribute("title", "Reassign");
      avatarSlot.addEventListener("click", (event) => {
        event.stopPropagation();
        openKanbanAssigneeModal(rowTaskId(avatarSlot));
      });
    }
    if (row.querySelector("loomi-dropmenu")) return;
    const menu = document.createElement("loomi-dropmenu");
    menu.setAttribute("position", "left");
    menu.setAttribute("hide-after-click", "");
    menu.addEventListener("click", (event) => event.stopPropagation());
    const actions: Array<{ label: string; icon: string; run: (id: string) => void; destructive?: boolean }> = [
      { label: "Open details", icon: "document-text", run: (id) => openKanbanTaskDrawer(id) },
      { label: "Reassign", icon: "user-circle", run: (id) => openKanbanAssigneeModal(id) },
      col === "done"
        ? { label: "Reopen", icon: "arrow-uturn-left", run: (id) => moveKanbanTask(root, id, "progress") }
        : { label: "Mark as done", icon: "check", run: (id) => moveKanbanTask(root, id, "done") },
      { label: "Delete", icon: "trash", run: (id) => deleteKanbanTask(root, id), destructive: true },
    ];
    for (const action of actions) {
      const item = document.createElement("loomi-dropmenu-item");
      item.textContent = action.label;
      item.setAttribute("icon", action.icon);
      if (action.destructive) item.setAttribute("variant", "destructive");
      item.addEventListener("click", (event) => {
        event.stopPropagation();
        action.run(rowTaskId(item));
      });
      menu.append(item);
    }
    row.append(menu);
  });
}

type ChatWindowElement = HTMLElement & {
  participants?: Array<Record<string, string>>;
  conversations?: Array<Record<string, unknown>>;
  messages?: KanbanChatMessage[];
  typing?: boolean;
};

function kanbanChatContact(id: string): KanbanChatContact | undefined {
  return kanbanChatContacts.find((contact) => contact.id === id);
}

function kanbanChatEl(root: HTMLElement): ChatWindowElement | null {
  return root.querySelector<ChatWindowElement>("[data-kanban-chat]");
}

function kanbanChatContactMatchesFilter(contact: KanbanChatContact): boolean {
  if (kanbanChatFilter === "archived") return !!contact.archived;
  if (contact.archived) return false;
  if (kanbanChatFilter === "unread") return contact.unread > 0;
  if (kanbanChatFilter === "mentions") return !!contact.mentions;
  if (kanbanChatFilter === "starred") return !!contact.starred;
  return true;
}

function renderKanbanChatList(root: HTMLElement): void {
  const chat = kanbanChatEl(root);
  if (!chat) return;
  chat.conversations = kanbanChatContacts.filter(kanbanChatContactMatchesFilter).map((contact) => ({
    id: contact.id,
    name: contact.name,
    preview: contact.preview,
    time: contact.time,
    unread: contact.unread,
    image: contact.image,
    label: contact.label,
  }));
  const inbox = kanbanChatContacts.filter((contact) => !contact.archived);
  const allCount = root.querySelector<HTMLElement>('[data-kanban-chat-count="all"]');
  if (allCount) allCount.textContent = String(inbox.length);
  const unreadTotal = inbox.filter((contact) => contact.unread > 0).length;
  const unreadCount = root.querySelector<HTMLElement>('[data-kanban-chat-count="unread"]');
  if (unreadCount) unreadCount.textContent = unreadTotal > 0 ? String(unreadTotal) : "";
}

function updateKanbanChatDetails(root: HTMLElement, contact: KanbanChatContact): void {
  const details = root.querySelector<HTMLElement>("[data-kanban-chat-details]");
  if (!details) return;
  const avatar = details.querySelector("[data-kcd-avatar]");
  avatar?.setAttribute("image", contact.image ?? "");
  avatar?.setAttribute("label", contact.label ?? contact.name);
  details.querySelector("[data-kcd-name]")!.textContent = contact.name;
  details.querySelector("[data-kcd-role]")!.textContent = contact.role;
  details.querySelector("[data-kcd-time]")!.textContent = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  details.querySelector("[data-kcd-email]")!.textContent = contact.id === "design" ? "design@agriconnect.app" : `${contact.id}@agriconnect.app`;
  details.querySelector("[data-kcd-phone]")!.textContent = contact.phone;
}

function kanbanChatParticipantFor(id: string): Record<string, string> {
  const contact = kanbanChatContact(id);
  return contact
    ? { id: contact.id, name: contact.name, image: contact.image ?? "", label: contact.label ?? "" }
    : { id, name: id };
}

function openKanbanChatConversation(root: HTMLElement, id: string): void {
  const contact = kanbanChatContact(id);
  const chat = kanbanChatEl(root);
  if (!contact || !chat) return;
  kanbanActiveChat = id;
  contact.unread = 0;
  chat.setAttribute("active-conversation-id", id);
  chat.setAttribute("title", contact.name);
  chat.setAttribute("description", contact.role);
  const memberIds = contact.members ?? [contact.id];
  chat.participants = [
    { id: "kwame", name: "Kwame Mensah", image: "/avatars/male.jpg" },
    ...memberIds.map(kanbanChatParticipantFor),
  ];
  chat.messages = [...(kanbanChatTranscripts[id] ?? [])];
  chat.typing = !!contact.typing;
  updateKanbanChatDetails(root, contact);
  renderKanbanChatList(root);
}

function deleteKanbanChatConversation(root: HTMLElement): void {
  const index = kanbanChatContacts.findIndex((contact) => contact.id === kanbanActiveChat);
  if (index < 0) return;
  const [removed] = kanbanChatContacts.splice(index, 1);
  delete kanbanChatTranscripts[removed.id];
  showToast(`Conversation with ${removed.name} deleted`);
  const next = kanbanChatContacts.find(kanbanChatContactMatchesFilter) ?? kanbanChatContacts[0];
  if (next) openKanbanChatConversation(root, next.id);
  else renderKanbanChatList(root);
}

function initKanbanChat(root: HTMLElement): void {
  const chat = kanbanChatEl(root);
  if (!chat) return;

  chat.addEventListener("conversation-select", (event) => {
    const id = String((event as CustomEvent).detail?.conversation?.id ?? "");
    if (id) openKanbanChatConversation(root, id);
  });

  chat.addEventListener("send", (event) => {
    const message = (event as CustomEvent).detail?.message as KanbanChatMessage | undefined;
    const contact = kanbanChatContact(kanbanActiveChat);
    if (!message || !contact) return;
    (kanbanChatTranscripts[kanbanActiveChat] ??= []).push(message);
    contact.preview = message.text;
    contact.time = message.time ?? "Now";
    contact.typing = false;
    renderKanbanChatList(root);

    const conversationAtSend = kanbanActiveChat;
    window.setTimeout(() => {
      if (kanbanActiveChat === conversationAtSend) chat.typing = true;
    }, 600);
    window.setTimeout(() => {
      const replyContact = kanbanChatContact(conversationAtSend);
      if (!replyContact) return;
      const reply: KanbanChatMessage = {
        id: `reply-${Date.now()}`,
        senderId: replyContact.members?.[0] ?? replyContact.id,
        text: replyContact.reply,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      (kanbanChatTranscripts[conversationAtSend] ??= []).push(reply);
      replyContact.preview = reply.text;
      replyContact.time = reply.time ?? "Now";
      if (kanbanActiveChat === conversationAtSend) {
        chat.typing = false;
        chat.messages = [...kanbanChatTranscripts[conversationAtSend]];
      } else {
        replyContact.unread += 1;
      }
      renderKanbanChatList(root);
    }, 2200);
  });

  root.querySelector("[data-kcd-mute]")?.addEventListener("change", (event) => {
    const checked = !!(event.target as HTMLInputElement & { checked?: boolean }).checked;
    showToast(checked ? "Notifications muted" : "Notifications unmuted");
  });

  openKanbanChatConversation(root, kanbanActiveChat);
}

function initKanbanBoard(root: HTMLElement): void {
  (Object.keys(kanbanColumns) as KanbanColumnKey[]).forEach((col) => {
    const sortable = kanbanSortableFor(root, col);
    if (!sortable) return;
    sortable.addEventListener("item-click", (event) => {
      const id = String((event as CustomEvent).detail?.item?.id ?? "");
      if (id) openKanbanTaskDrawer(id);
    });
    sortable.addEventListener("reorder", () => {
      syncKanbanColumnFromSortable(root, col);
      void decorateKanbanSortable(root, sortable, col);
    });
    sortable.addEventListener("transfer", () => {
      syncKanbanColumnFromSortable(root, col);
      renderKanbanColumn(root, col);
      updateKanbanCounts(root);
      syncKanbanCalendar(root);
    });
  });

  // Details drawer actions
  const drawer = document.querySelector<DrawerElement>('loomi-drawer[name="kanban-task-drawer"]');
  drawer?.addEventListener("click", (event) => {
    if (!kanbanDrawerTaskId) return;
    if (pathElement(event, "[data-ktd-reassign]")) {
      openKanbanAssigneeModal(kanbanDrawerTaskId);
      return;
    }
    if (pathElement(event, "[data-ktd-toggle]")) {
      const col = kanbanColumnOf(kanbanDrawerTaskId);
      if (!col) return;
      moveKanbanTask(root, kanbanDrawerTaskId, col === "done" ? "progress" : "done");
      openKanbanTaskDrawer(kanbanDrawerTaskId);
    }
  });

  // Reassign picker
  const picker = document.getElementById("kam-picker") as AutocompleteElement | null;
  picker?.addEventListener("select", (event) => {
    const teammateId = String((event as CustomEvent).detail?.value ?? "");
    const task = kanbanAssignTaskId ? kanbanTaskData[kanbanAssignTaskId] : null;
    if (!task || !teammateId) return;
    task.assignee = teammateId;
    renderKanbanBoard(root);
    document.querySelector<ModalElement>('loomi-modal[name="kanban-assignee-modal"]')?.hide?.();
    if (kanbanDrawerTaskId === task.id) openKanbanTaskDrawer(task.id);
    showToast(`"${task.title}" assigned to ${kanbanTeammate(teammateId).name}`);
  });

  // New task drawer
  const newTaskDrawer = document.querySelector<DrawerElement>('loomi-drawer[name="kanban-new-task-drawer"]');
  const newAssignee = document.getElementById("knt-assignee") as AutocompleteElement | null;
  if (newAssignee) newAssignee.data = teammateAutocompleteData();
  newTaskDrawer?.addEventListener("click", (event) => {
    if (pathElement(event, "[data-knt-cancel]")) {
      newTaskDrawer.hide?.();
      return;
    }
    if (!pathElement(event, "[data-knt-add]")) return;
    const title = (document.getElementById("knt-title") as ValueElement | null)?.value?.trim();
    if (!title) {
      showToast("Give the task a title first");
      return;
    }
    const team = (document.getElementById("knt-team") as ValueElement | null)?.selectedValue || "UI/UX";
    const date = (document.getElementById("knt-date") as ValueElement | null)?.value || "2026-07-21";
    const assignee = newAssignee?.value || "kwame";
    const column = ((document.getElementById("knt-column") as ValueElement | null)?.selectedValue || "todo") as KanbanColumnKey;
    const id = `task-${Date.now()}`;
    kanbanTaskData[id] = { id, title, team, date, assignee: kanbanTeammates.some((t) => t.id === assignee) ? assignee : "kwame" };
    kanbanColumns[column] = [id, ...kanbanColumns[column]];
    renderKanbanBoard(root);
    newTaskDrawer.hide?.();
    const titleField = document.getElementById("knt-title") as ValueElement | null;
    if (titleField) titleField.value = "";
    showToast(`"${title}" added to ${KANBAN_COLUMN_LABELS[column]}`);
  });

  // Calendar event click -> task details
  root.querySelector<CalendarElement>("[data-kanban-calendar]")?.addEventListener("loomi-event-click", (event) => {
    const id = String((event as CustomEvent).detail?.event?.id ?? "");
    if (id && kanbanTaskData[id]) openKanbanTaskDrawer(id);
  });

  renderKanbanBoard(root);
}

function initKanban(): void {
  const root = document.querySelector<HTMLElement>("[data-kanban-demo]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = pathElement<HTMLElement>(event, "[data-kanban-nav]");
    if (nav?.dataset.kanbanNav) {
      const key = nav.dataset.kanbanNav;
      activatePanel(root, "[data-kanban-nav]", "[data-kanban-panel]", key);
      const heading = kanbanHeadings[key];
      const title = root.querySelector<HTMLElement>("[data-kanban-heading]");
      const kicker = root.querySelector<HTMLElement>("[data-kanban-kicker]");
      if (heading && title && kicker) {
        title.textContent = heading.title;
        kicker.textContent = heading.kicker;
      }
      return;
    }

    if (pathElement(event, "[data-kanban-new-task]")) {
      document.querySelector<DrawerElement>('loomi-drawer[name="kanban-new-task-drawer"]')?.show?.();
      return;
    }

    const filterItem = pathElement<HTMLElement>(event, "[data-kanban-filter]");
    if (filterItem?.dataset.kanbanFilter) {
      kanbanTeamFilter = filterItem.dataset.kanbanFilter;
      for (const item of root.querySelectorAll<HTMLElement>("[data-kanban-filter]")) {
        if (item.dataset.kanbanFilter === kanbanTeamFilter) item.setAttribute("icon", "check");
        else item.removeAttribute("icon");
      }
      const label = root.querySelector<HTMLElement>("[data-kanban-filter-label]");
      if (label) label.textContent = kanbanTeamFilter === "all" ? "Filter" : kanbanTeamFilter;
      renderKanbanBoard(root);
      return;
    }

    const chatFilter = pathElement<HTMLElement>(event, "[data-kanban-chat-filter]");
    if (chatFilter?.dataset.kanbanChatFilter) {
      kanbanChatFilter = chatFilter.dataset.kanbanChatFilter;
      for (const chip of root.querySelectorAll<HTMLElement>("[data-kanban-chat-filter]")) {
        chip.classList.toggle("active", chip === chatFilter);
      }
      renderKanbanChatList(root);
      return;
    }

    if (pathElement(event, "[data-kanban-chat-compose]")) {
      showToast("New message started");
      return;
    }

    if (pathElement(event, "[data-kanban-chat-collapse]")) {
      kanbanChatEl(root)?.toggleAttribute("conversations-avatars-only");
      return;
    }

    if (pathElement(event, "[data-kanban-chat-details-toggle]")) {
      root.querySelector<HTMLElement>("[data-kanban-chat-details]")?.toggleAttribute("hidden");
      return;
    }

    if (pathElement(event, "[data-kanban-chat-delete]")) {
      deleteKanbanChatConversation(root);
    }
  });

  initKanbanBoard(root);
  initKanbanChat(root);
}

function initSettings(): void {
  const root = document.querySelector<HTMLElement>("[data-settings-demo]");
  if (!root) return;

  root.addEventListener("click", (event) => {
    const nav = pathElement<HTMLElement>(event, "[data-settings-nav]");
    if (!nav?.dataset.settingsNav) return;
    activatePanel(root, "[data-settings-nav]", "[data-settings-panel]", nav.dataset.settingsNav);
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
