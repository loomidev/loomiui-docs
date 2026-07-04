import { html } from "lit";
import { defineGridModule } from "../grid-module.js";
function isFilteringModule(module) {
    return module.name === "filtering" && "setFilterState" in module && "getFilterState" in module;
}
function normalizeFilters(filters = []) {
    return filters.map((filter) => ({
        key: filter.key,
        value: filter.value,
        operator: (filter.operator ?? "contains")
    }));
}
/**
 * Renders a saved-view picker in the toolbar and applies each preset's sort,
 * page size, column visibility, widths, and filters. Pairs naturally with
 * `filteringModule()` — when both are registered, filters are pushed through
 * the filtering module's `setFilterState()` API.
 *
 * ```ts
 * grid.modules = [
 *   filteringModule(),
 *   savedViewsModule({
 *     views: [{ id: "active", label: "Active users", filters: [{ key: "status", value: "Active" }] }],
 *     activeViewId: "active",
 *   }),
 * ];
 * ```
 */
export function savedViewsModule(options = {}) {
    let views = options.views ?? [];
    let activeViewId = options.activeViewId ?? null;
    let hiddenColumnKeys = new Set();
    let fallbackFilters = [];
    function findFilteringModule(ctx) {
        return ctx.grid.modules.find(isFilteringModule);
    }
    function applyFilters(ctx, view) {
        const filtering = findFilteringModule(ctx);
        const nextFilters = view ? normalizeFilters(view.filters) : [];
        if (filtering) {
            filtering.setFilterState({
                globalSearch: view?.globalSearch ?? "",
                columnFilters: nextFilters
            });
            fallbackFilters = [];
            return;
        }
        fallbackFilters = nextFilters;
    }
    function applyView(view, ctx) {
        activeViewId = view?.id ?? null;
        hiddenColumnKeys = new Set(view?.hiddenColumns ?? []);
        ctx.grid.sort = view?.sort ?? null;
        if (view?.pageSize) {
            ctx.grid.pageSize = view.pageSize;
        }
        ctx.grid.page = 1;
        if (view?.columnWidths) {
            ctx.grid.columnWidths = { ...view.columnWidths };
        }
        else if (!view) {
            ctx.grid.columnWidths = {};
        }
        applyFilters(ctx, view);
        ctx.dispatch("loomi-saved-view-change", { viewId: activeViewId, view });
        ctx.requestUpdate();
    }
    return defineGridModule({
        name: "saved-views",
        stage: "filter",
        attach(ctx) {
            if (!options.activeViewId) {
                return;
            }
            queueMicrotask(() => {
                const view = views.find((entry) => entry.id === options.activeViewId) ?? null;
                applyView(view, ctx);
            });
        },
        transformRows(rows) {
            if (fallbackFilters.length === 0) {
                return rows;
            }
            return rows.filter((row) => fallbackFilters.every((filter) => {
                const value = String(row[filter.key] ?? "").toLowerCase();
                const filterValue = filter.value.toLowerCase();
                return filter.operator === "equals" ? value === filterValue : value.includes(filterValue);
            }));
        },
        transformColumns(columns) {
            if (hiddenColumnKeys.size === 0) {
                return columns;
            }
            return columns.filter((column) => !hiddenColumnKeys.has(column.key));
        },
        renderToolbarEnd(ctx) {
            if (views.length === 0) {
                return undefined;
            }
            return html `
        <label class="saved-view-picker">
          <span class="saved-view-label">View</span>
          <select
            aria-label="Saved view"
            .value=${activeViewId ?? ""}
            @change=${(event) => {
                const viewId = event.target.value;
                const view = viewId ? views.find((entry) => entry.id === viewId) ?? null : null;
                applyView(view, ctx);
            }}
          >
            <option value="">${options.defaultLabel ?? "All rows"}</option>
            ${views.map((view) => html `<option value=${view.id} ?selected=${view.id === activeViewId}>${view.label}</option>`)}
          </select>
        </label>
      `;
        },
        onGridEvent(name, detail, ctx) {
            if (name !== "loomi-saved-view-config") {
                return;
            }
            const config = detail;
            if (config.views) {
                views = config.views;
            }
            if (config.activeViewId !== undefined) {
                const view = config.activeViewId
                    ? views.find((entry) => entry.id === config.activeViewId) ?? null
                    : null;
                applyView(view, ctx);
            }
            else {
                ctx.requestUpdate();
            }
        }
    });
}
//# sourceMappingURL=saved-views.js.map