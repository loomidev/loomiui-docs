import { html } from "lit";
import "@loomidev/chart/loomi-chart.js";
import { defineGridModule } from "../grid-module.js";
import { getRowMeta } from "../grid-utils.js";
/**
 * Renders a `<loomi-chart>` below the grid, summarizing the currently
 * processed (filtered/sorted) rows as label/value points.
 *
 * ```ts
 * grid.modules = [chartsModule({ labelField: "month", valueField: "revenue", type: "line" })];
 * ```
 */
export function chartsModule(options) {
    return defineGridModule({
        name: "charts",
        renderBelowTable(rows) {
            const dataRows = rows.filter((row) => {
                const meta = getRowMeta(row);
                return meta == null || meta.type === "data";
            });
            const points = dataRows.slice(0, options.limit ?? 20).map((row) => ({
                label: String(row[options.labelField] ?? ""),
                value: Number(row[options.valueField]) || 0
            }));
            if (points.length === 0) {
                return undefined;
            }
            return html `<loomi-chart type=${options.type ?? "bar"} color=${options.color ?? "primary"} .data=${points}></loomi-chart>`;
        }
    });
}
//# sourceMappingURL=charts.js.map