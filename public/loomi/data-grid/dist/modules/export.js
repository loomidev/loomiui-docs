import { html } from "lit";
import { defineGridModule } from "../grid-module.js";
import { downloadTextFile, getRowMeta, rowsToCsv } from "../grid-utils.js";
/**
 * Adds export buttons to the toolbar. CSV/JSON are downloaded directly
 * client-side; any format also dispatches a `loomi-export-request` event so
 * a host app can hook in server-side exports (e.g. Excel/PDF).
 *
 * ```ts
 * grid.modules = [exportModule({ filename: "members", formats: ["csv", "json"] })];
 * ```
 */
export function exportModule(options = {}) {
    const formats = options.formats ?? ["csv", "json"];
    const filename = options.filename ?? "export";
    return defineGridModule({
        name: "export",
        renderToolbarEnd(ctx) {
            const dataRows = ctx.rows.filter((row) => getRowMeta(row) == null || getRowMeta(row)?.type === "data");
            const selectedOnly = (options.preferSelection ?? true) && ctx.grid.selectedKeys.length > 0;
            const rowsToExport = selectedOnly
                ? dataRows.filter((row) => ctx.grid.selectedKeys.includes(ctx.getRowKey(row)))
                : dataRows;
            const columns = ctx.columns.map((column) => ({ key: column.key, label: column.label }));
            const runExport = (format) => {
                if (format === "csv") {
                    downloadTextFile(`${filename}.csv`, rowsToCsv(rowsToExport, columns), "text/csv");
                }
                else if (format === "json") {
                    downloadTextFile(`${filename}.json`, JSON.stringify(rowsToExport, null, 2), "application/json");
                }
                ctx.dispatch("loomi-export-request", {
                    format,
                    rows: rowsToExport,
                    columns,
                    selectedOnly
                });
            };
            return html `
        ${formats.map((format) => html `
            <button type="button" @click=${() => runExport(format)}>Export ${format.toUpperCase()}</button>
          `)}
      `;
        }
    });
}
//# sourceMappingURL=export.js.map