interface DemoUser {
  name: string;
  initials: string;
}

interface DemoComment {
  author: string;
  text: string;
}

interface DemoTask {
  id: string;
  title: string;
  description: string;
  status: "todo" | "in-progress" | "done";
  assignee: string;
  dueDate: string;
  dueTime: string;
  attachment: string;
  comments: DemoComment[];
}

interface DemoProject {
  id: string;
  name: string;
  lead: string;
  health: string;
  budget: number;
  created: string;
  tasks: DemoTask[];
}

const USERS: Record<string, DemoUser> = {
  mk: { name: "Michael K. Ocansey", initials: "MK" },
  sf: { name: "Sara Field", initials: "SF" },
  rb: { name: "Robert Boateng", initials: "RB" },
};

const STATUSES: DemoTask["status"][] = ["todo", "in-progress", "done"];
const STATUS_LABELS: Record<DemoTask["status"], string> = {
  todo: "To Do",
  "in-progress": "In Progress",
  done: "Done",
};
const STATUS_COLORS: Record<DemoTask["status"], string> = {
  todo: "gray",
  "in-progress": "orange",
  done: "green",
};

const USER_OPTIONS = Object.entries(USERS).map(([value, user]) => ({
  label: user.name,
  value,
}));

let nextProjectId = 3;
let nextTaskId = 12;
let activeProjectId = "redesign";
let activeTaskId: string | null = null;
let boardFilter = "";
let toastTimer: ReturnType<typeof setTimeout> | null = null;

const projects: DemoProject[] = [
  {
    id: "redesign",
    name: "Homepage Redesign",
    lead: "mk",
    health: "On track",
    budget: 18000,
    created: "2026-06-18",
    tasks: [
      {
        id: "1",
        title: "Wireframe the hero section",
        description: "Rough layout for the new homepage hero with component callouts.",
        status: "done",
        assignee: "mk",
        dueDate: "2026-06-20",
        dueTime: "10:00",
        attachment: "hero-wireframe.fig",
        comments: [{ author: "mk", text: "Shipped — ready for review." }],
      },
      {
        id: "2",
        title: "Pick a color palette",
        description: "Decide on primary and accent colors for the redesign.",
        status: "done",
        assignee: "sf",
        dueDate: "2026-06-21",
        dueTime: "14:00",
        attachment: "",
        comments: [],
      },
      {
        id: "3",
        title: "Build the component showcase",
        description: "Wire up live Loomi components across the homepage.",
        status: "in-progress",
        assignee: "rb",
        dueDate: "2026-06-25",
        dueTime: "17:00",
        attachment: "component-map.pdf",
        comments: [{ author: "sf", text: "Ping me if you need a design review." }],
      },
      {
        id: "4",
        title: "Write launch announcement",
        description: "Draft the blog post and social copy for launch day.",
        status: "todo",
        assignee: "mk",
        dueDate: "2026-06-28",
        dueTime: "09:00",
        attachment: "",
        comments: [],
      },
      {
        id: "8",
        title: "Accessibility pass",
        description: "Check keyboard paths, labels, and contrast on the home page.",
        status: "todo",
        assignee: "sf",
        dueDate: "2026-06-29",
        dueTime: "12:00",
        attachment: "",
        comments: [],
      },
    ],
  },
  {
    id: "mobile",
    name: "Mobile App Launch",
    lead: "sf",
    health: "At risk",
    budget: 42000,
    created: "2026-06-12",
    tasks: [
      {
        id: "5",
        title: "QA onboarding flow",
        description: "Test signup, verification, and first project creation.",
        status: "in-progress",
        assignee: "sf",
        dueDate: "2026-06-26",
        dueTime: "13:30",
        attachment: "qa-notes.csv",
        comments: [{ author: "rb", text: "Android checks are halfway through." }],
      },
      {
        id: "6",
        title: "Publish beta release notes",
        description: "Summarize the feature set and known limitations.",
        status: "todo",
        assignee: "mk",
        dueDate: "2026-06-27",
        dueTime: "11:00",
        attachment: "",
        comments: [],
      },
      {
        id: "7",
        title: "App store screenshots",
        description: "Export localized screenshots for the listing.",
        status: "done",
        assignee: "rb",
        dueDate: "2026-06-22",
        dueTime: "16:00",
        attachment: "screenshots.zip",
        comments: [{ author: "sf", text: "Approved for the beta listing." }],
      },
    ],
  },
];


const taskPanel = document.getElementById("task-panel");
const toastHost = document.getElementById("demo-toast");

type LoomiModalEl = HTMLElement & { show?: () => void; hide?: () => void };

function modalByName(name: string): LoomiModalEl | null {
  return document.querySelector(`loomi-modal[name="${name}"]`);
}

function showModal(name: string): void {
  modalByName(name)?.show?.();
}

function hideModal(name: string): void {
  modalByName(name)?.hide?.();
}

function formatDate(iso: string): string {
  if (!iso) return "No date";
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function activeProject(): DemoProject {
  return projects.find((project) => project.id === activeProjectId) ?? projects[0];
}

function activeTasks(): DemoTask[] {
  return activeProject().tasks;
}

function filteredTasks(): DemoTask[] {
  const query = boardFilter.trim().toLowerCase();
  if (!query) return activeTasks();
  return activeTasks().filter((task) => {
    const assignee = USERS[task.assignee]?.name ?? "";
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      assignee.toLowerCase().includes(query)
    );
  });
}

function columnFor(status: string): HTMLElement & { items?: unknown[] } {
  return document.getElementById(`col-${status}`) as HTMLElement & { items?: unknown[] };
}

function showToast(message: string, type: "success" | "info" = "success"): void {
  if (!toastHost) return;
  toastHost.innerHTML = `<loomi-alert type="${type}" show-close-icon="false">${message}</loomi-alert>`;
  toastHost.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastHost.classList.add("hidden"), 2800);
}

function setListItems(
  id: string,
  rows: { id?: string; title: string; meta: string }[],
  clickable = false,
): void {
  const list = document.getElementById(id);
  if (!list) return;
  list.innerHTML = "";
  for (const rowData of rows) {
    const item = document.createElement("loomi-listview-item");
    if (clickable && rowData.id) item.dataset.taskId = rowData.id;
    const row = document.createElement("div");
    row.className = clickable ? "demo-activity-row" : "demo-list-row";
    const title = document.createElement("div");
    title.className = "demo-list-title";
    title.textContent = rowData.title;
    const meta = document.createElement("div");
    meta.className = "demo-list-meta";
    meta.textContent = rowData.meta;
    row.append(title, meta);
    item.appendChild(row);
    list.appendChild(item);
  }
}

function updateProjectSwitcher(): void {
  const switcher = document.getElementById("project-switcher") as (HTMLElement & {
    data?: unknown[];
    selectedValue?: string;
  }) | null;
  if (!switcher) return;
  switcher.data = projects.map((project) => ({ label: project.name, value: project.id }));
  switcher.selectedValue = activeProjectId;
}

function renderBoard(): void {
  const tasks = filteredTasks();
  for (const status of STATUSES) {
    const col = columnFor(status);
    const colTasks = tasks.filter((t) => t.status === status);
    col.items = colTasks.map((t) => ({
      id: t.id,
      label: t.title,
      meta: `${USERS[t.assignee]?.initials ?? "?"} · ${formatDate(t.dueDate)}`,
    }));
    const count = document.getElementById(`count-${status}`);
    if (count) count.textContent = String(colTasks.length);
  }
}

function renderDashboard(): void {
  const project = activeProject();
  const tasks = project.tasks;
  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in-progress").length;
  const done = tasks.filter((t) => t.status === "done").length;
  const todo = tasks.filter((t) => t.status === "todo").length;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const dueSoon = tasks.filter((t) => t.status !== "done" && t.dueDate).length;

  const lead = USERS[project.lead];
  const dashName = document.getElementById("dash-project-name");
  const dashMeta = document.getElementById("dash-project-meta");
  const dashHealth = document.getElementById("dash-health");
  const budget = document.getElementById("dash-budget");
  if (dashName) dashName.textContent = project.name;
  if (dashMeta) dashMeta.textContent = lead ? `Led by ${lead.name}` : "No lead assigned";
  if (dashHealth) {
    dashHealth.textContent = project.health;
    dashHealth.className =
      project.health === "At risk"
        ? "demo-health demo-health--risk"
        : project.health === "Planning"
          ? "demo-health demo-health--planning"
          : "demo-health demo-health--ok";
  }
  if (budget) budget.setAttribute("label", `$${project.budget.toLocaleString()}`);

  document.getElementById("stat-total")?.setAttribute("number", String(total));
  document.getElementById("stat-progress")?.setAttribute("number", String(inProgress));
  document.getElementById("stat-complete")?.setAttribute("number", `${pct}%`);
  document.getElementById("stat-due")?.setAttribute("number", String(dueSoon));

  const progress = document.getElementById("dash-progress") as (HTMLElement & {
    percentage?: number;
  }) | null;
  if (progress) progress.percentage = pct;

  const graph = document.getElementById("status-graph") as (HTMLElement & { data?: unknown[] }) | null;
  if (graph) {
    graph.data = [
      { label: "To Do", value: todo, color: "gray" },
      { label: "In Progress", value: inProgress, color: "orange" },
      { label: "Done", value: done, color: "green" },
    ];
  }

  const workload = document.getElementById("workload-graph") as (HTMLElement & { data?: unknown[] }) | null;
  if (workload) {
    workload.data = Object.entries(USERS).map(([id, user]) => ({
      label: user.initials,
      value: Math.max(0.001, tasks.filter((task) => task.assignee === id && task.status !== "done").length),
      color: id === "mk" ? "primary" : id === "sf" ? "pink" : "cyan",
    }));
  }

  const recent = [...tasks]
    .filter((task) => task.status !== "done")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5)
    .map((task) => ({
      id: task.id,
      title: task.title,
      meta: `${STATUS_LABELS[task.status]} · ${USERS[task.assignee]?.initials ?? "?"} · ${formatDate(task.dueDate)}`,
    }));
  setListItems(
    "activity-list",
    recent.length ? recent : [{ title: "No open tasks", meta: "Create a task to get started" }],
    true,
  );
}

function renderComments(task: DemoTask): void {
  const list = document.getElementById("detail-comments");
  if (!list) return;
  list.innerHTML = "";
  if (task.comments.length === 0) {
    const empty = document.createElement("p");
    empty.className = "demo-empty-copy";
    empty.textContent = "No comments yet — add one below.";
    list.appendChild(empty);
    return;
  }
  for (const comment of task.comments) {
    const user = USERS[comment.author];
    const item = document.createElement("loomi-listview-item");
    const row = document.createElement("div");
    row.className = "demo-comment";
    const avatar = document.createElement("loomi-avatar");
    avatar.setAttribute("size", "tiny");
    avatar.setAttribute("label", user?.initials ?? "?");
    const text = document.createElement("div");
    const name = document.createElement("div");
    name.className = "demo-list-title";
    name.textContent = user?.name ?? "Unknown";
    const body = document.createElement("div");
    body.className = "demo-comment-body";
    body.textContent = comment.text;
    text.append(name, body);
    row.append(avatar, text);
    item.appendChild(row);
    list.appendChild(item);
  }
}

function openTaskPanel(id: string): void {
  const task = activeTasks().find((t) => t.id === id);
  if (!task || !taskPanel) return;
  activeTaskId = id;

  const titleEl = document.getElementById("detail-title");
  const descEl = document.getElementById("detail-description");
  const dueEl = document.getElementById("detail-due");
  const statusTag = document.getElementById("detail-status");
  if (titleEl) titleEl.textContent = task.title;
  if (descEl) descEl.textContent = task.description || "No description provided.";
  if (dueEl) {
    dueEl.textContent = `Due ${formatDate(task.dueDate)}${task.dueTime ? ` at ${task.dueTime}` : ""}${task.attachment ? ` · ${task.attachment}` : ""}`;
  }
  if (statusTag) {
    statusTag.setAttribute("label", STATUS_LABELS[task.status]);
    statusTag.setAttribute("color", STATUS_COLORS[task.status]);
  }

  const assigneeSelect = document.getElementById("detail-assignee") as (HTMLElement & {
    selectedValue?: string;
  }) | null;
  if (assigneeSelect) assigneeSelect.selectedValue = task.assignee;

  const statusSelect = document.getElementById("detail-status-select") as (HTMLElement & {
    selectedValue?: string;
  }) | null;
  if (statusSelect) statusSelect.selectedValue = task.status;

  renderComments(task);
  taskPanel.hidden = false;
  taskPanel.dataset.open = "true";
}

function closeTaskPanel(): void {
  if (!taskPanel) return;
  taskPanel.hidden = true;
  taskPanel.dataset.open = "false";
  activeTaskId = null;
}

function switchToBoardTab(): void {
  const tabs = document.querySelectorAll("#demo-nav loomi-tab");
  for (const tab of tabs) {
    const el = tab as HTMLElement & { active?: boolean; label?: string };
    el.active = el.label === "Board";
  }
}

function renderAll(): void {
  updateProjectSwitcher();
  renderBoard();
  renderDashboard();
  if (activeTaskId) {
    const stillExists = activeTasks().some((task) => task.id === activeTaskId);
    if (stillExists) openTaskPanel(activeTaskId);
    else closeTaskPanel();
  }
}

function syncColumnOrder(status: DemoTask["status"], order: string[]): void {
  const project = activeProject();
  const rank = new Map(order.map((id, index) => [id, index]));
  project.tasks.sort((a, b) => {
    if (a.status === status && b.status === status) {
      return (rank.get(a.id) ?? 0) - (rank.get(b.id) ?? 0);
    }
    return 0;
  });
}

function wireEvents(): void {
  document.getElementById("demo-new-task")?.addEventListener("click", () => showModal("demo-new-task"));
  document.getElementById("demo-new-project")?.addEventListener("click", () => showModal("demo-new-project"));

  document.getElementById("project-switcher")?.addEventListener("select", (e) => {
    const detail = (e as CustomEvent<{ value: string }>).detail;
    if (!projects.some((project) => project.id === detail.value)) return;
    activeProjectId = detail.value;
    activeTaskId = null;
    boardFilter = "";
    const search = document.getElementById("board-search") as (HTMLElement & { value?: string }) | null;
    if (search) search.value = "";
    closeTaskPanel();
    renderAll();
    showToast(`Switched to ${activeProject().name}`, "info");
  });

  document.getElementById("board-search")?.addEventListener("input", (e) => {
    const target = e.target as HTMLElement & { value?: string };
    boardFilter = target.value ?? "";
    renderBoard();
  });

  document.getElementById("activity-list")?.addEventListener("click", (e) => {
    const target = e.target;
    if (!(target instanceof Element)) return;
    const item = target.closest("[data-task-id]");
    if (!(item instanceof HTMLElement) || !item.dataset.taskId) return;
    switchToBoardTab();
    openTaskPanel(item.dataset.taskId);
  });

  document.getElementById("task-panel-close")?.addEventListener("click", closeTaskPanel);
  document.getElementById("task-panel-backdrop")?.addEventListener("click", closeTaskPanel);

  document.getElementById("detail-assignee")?.addEventListener("select", (e) => {
    const detail = (e as CustomEvent<{ value: string }>).detail;
    const task = activeTasks().find((t) => t.id === activeTaskId);
    if (task) {
      task.assignee = detail.value;
      renderAll();
      showToast(`Assigned to ${USERS[detail.value]?.name ?? "someone"}`, "info");
    }
  });

  document.getElementById("detail-status-select")?.addEventListener("select", (e) => {
    const detail = (e as CustomEvent<{ value: DemoTask["status"] }>).detail;
    const task = activeTasks().find((t) => t.id === activeTaskId);
    if (!task || !STATUSES.includes(detail.value)) return;
    task.status = detail.value;
    renderAll();
    showToast(`Moved to ${STATUS_LABELS[detail.value]}`);
  });

  document.getElementById("detail-comment-submit")?.addEventListener("click", () => {
    const textarea = document.getElementById("detail-comment-input") as (HTMLElement & { value?: string }) | null;
    const task = activeTasks().find((t) => t.id === activeTaskId);
    const text = textarea?.value?.trim();
    if (!task || !textarea || !text) return;
    task.comments.push({ author: "mk", text });
    textarea.value = "";
    renderComments(task);
    showToast("Comment posted");
  });

  for (const status of STATUSES) {
    const col = columnFor(status);
    col.addEventListener("reorder", (e) => {
      const detail = (e as CustomEvent<{ order: string[] }>).detail;
      syncColumnOrder(status, detail.order);
    });
    col.addEventListener("transfer", (e) => {
      const detail = (e as CustomEvent<{ order: string[]; items: { id: string }[] }>).detail;
      for (const item of detail.items) {
        const task = activeTasks().find((t) => t.id === item.id);
        if (task) task.status = status;
      }
      syncColumnOrder(status, detail.order);
      renderAll();
      if (detail.items.length === 1) {
        showToast(`Moved to ${STATUS_LABELS[status]}`);
      }
    });
    col.addEventListener("item-click", (e) => {
      const detail = (e as CustomEvent<{ item: { id: string } }>).detail;
      openTaskPanel(detail.item.id);
    });
  }

  const newTaskForm = document.getElementById("new-task-form");
  document.getElementById("new-task-submit")?.addEventListener("click", () => {
    if (newTaskForm instanceof HTMLFormElement) newTaskForm.requestSubmit();
  });
  document.getElementById("new-task-cancel")?.addEventListener("click", () => hideModal("demo-new-task"));
  newTaskForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(newTaskForm instanceof HTMLFormElement)) return;
    const data = new FormData(newTaskForm);
    const title = String(data.get("title") ?? "").trim();
    if (!title) return;
    const attachment = data.get("attachment");
    activeProject().tasks.push({
      id: String(nextTaskId++),
      title,
      description: String(data.get("description") ?? ""),
      status: "todo",
      assignee: String(data.get("assignee") ?? "mk"),
      dueDate: String(data.get("due_date") ?? ""),
      dueTime: String(data.get("due_time") ?? ""),
      attachment: attachment instanceof File && attachment.name ? attachment.name : "",
      comments: [],
    });
    newTaskForm.reset();
    hideModal("demo-new-task");
    renderAll();
    switchToBoardTab();
    showToast(`Created “${title}”`);
  });

  const newProjectForm = document.getElementById("new-project-form");
  document.getElementById("new-project-submit")?.addEventListener("click", () => {
    if (newProjectForm instanceof HTMLFormElement) newProjectForm.requestSubmit();
  });
  document.getElementById("new-project-cancel")?.addEventListener("click", () => hideModal("demo-new-project"));
  newProjectForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!(newProjectForm instanceof HTMLFormElement)) return;
    const data = new FormData(newProjectForm);
    const name = String(data.get("name") ?? "").trim();
    if (!name) return;
    const id = `project-${nextProjectId++}`;
    const lead = String(data.get("lead") ?? "mk");
    const startDate = String(data.get("start_date") ?? "");
    projects.push({
      id,
      name,
      lead,
      health: String(data.get("health") ?? "Planning"),
      budget: Number(String(data.get("budget") ?? "").replaceAll(",", "")) || 0,
      created: startDate,
      tasks: [
        {
          id: String(nextTaskId++),
          title: "Kickoff project plan",
          description: "Define scope, milestones, and owners for the first sprint.",
          status: "todo",
          assignee: lead,
          dueDate: startDate,
          dueTime: "09:00",
          attachment: "",
          comments: [{ author: "mk", text: "Project created from the live workspace demo." }],
        },
      ],
    });
    activeProjectId = id;
    activeTaskId = null;
    boardFilter = "";
    newProjectForm.reset();
    hideModal("demo-new-project");
    renderAll();
    showToast(`Created project “${name}”`);
  });
}

async function initializeDemoApp(): Promise<void> {
  await Promise.all(
    [
      "loomi-horizontal-line-graph",
      "loomi-listview",
      "loomi-listview-item",
      "loomi-select",
      "loomi-sortable",
      "loomi-statistic",
      "loomi-textarea",
      "loomi-tabs",
      "loomi-tab",
      "loomi-progress-bar",
      "loomi-alert",
      "loomi-modal",
      "loomi-input",
    ].map((tagName) => customElements.whenDefined(tagName)),
  );

  const assigneeSelect = document.getElementById("detail-assignee") as (HTMLElement & { data?: unknown[] }) | null;
  if (assigneeSelect) assigneeSelect.data = USER_OPTIONS;

  wireEvents();
  renderAll();
}

void initializeDemoApp();
