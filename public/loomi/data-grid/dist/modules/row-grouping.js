import { defineGridModule } from "../grid-module.js";
import { aggregateValues, formatCellValue, getRowMeta, withRowMeta } from "../grid-utils.js";
/**
 * Groups (already-sorted) rows by a column value into collapsible sections
 * with per-group aggregates. Runs in the `"shape"` stage, after core
 * sorting, so a group's row order matches the active sort.
 *
 * ```ts
 * grid.modules = [rowGroupingModule({ groupBy: "department", aggregates: { salary: "avg" } })];
 * ```
 */
export function rowGroupingModule(options) {
    const expandedGroups = new Set();
    let initialized = false;
    return defineGridModule({
        name: "row-grouping",
        stage: "shape",
        transformRows(rows) {
            const groups = new Map();
            for (const row of rows) {
                const groupValue = formatCellValue(row[options.groupBy]);
                const bucket = groups.get(groupValue);
                if (bucket) {
                    bucket.push(row);
                }
                else {
                    groups.set(groupValue, [row]);
                }
            }
            if (!initialized) {
                initialized = true;
                if (options.expandedByDefault !== false) {
                    for (const groupValue of groups.keys()) {
                        expandedGroups.add(groupValue);
                    }
                }
            }
            const shaped = [];
            for (const [groupValue, groupRows] of groups) {
                const expanded = expandedGroups.has(groupValue);
                const aggregates = {};
                for (const [columnKey, aggregate] of Object.entries(options.aggregates ?? {})) {
                    aggregates[columnKey] = aggregateValues(groupRows.map((row) => row[columnKey]), aggregate);
                }
                const groupHeader = withRowMeta({ [options.groupBy]: groupValue }, {
                    type: "group",
                    groupKey: groupValue,
                    groupLabel: groupValue || "(blank)",
                    count: groupRows.length,
                    aggregates,
                    expanded,
                    hasChildren: true,
                    depth: 0
                });
                shaped.push(groupHeader);
                if (expanded) {
                    for (const row of groupRows) {
                        shaped.push(withRowMeta(row, { type: "data", depth: 1, parentKey: groupValue }));
                    }
                }
            }
            return shaped;
        },
        onGridEvent(name, detail, ctx) {
            if (name !== "loomi-grid-toggle-row") {
                return;
            }
            const { row, expanded } = detail;
            const meta = getRowMeta(row);
            if (meta?.type !== "group" || !meta.groupKey) {
                return;
            }
            if (expanded) {
                expandedGroups.add(meta.groupKey);
            }
            else {
                expandedGroups.delete(meta.groupKey);
            }
            ctx.requestUpdate();
        }
    });
}
//# sourceMappingURL=row-grouping.js.map