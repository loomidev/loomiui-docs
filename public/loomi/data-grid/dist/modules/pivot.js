import { defineGridModule } from "../grid-module.js";
import { aggregateValues, formatCellValue } from "../grid-utils.js";
/**
 * Reshapes flat rows into a row/column/value pivot matrix — e.g. rows of
 * `{ region, quarter, revenue }` become one row per `region` with a column
 * per `quarter` holding summed `revenue`. Replaces both the row set and the
 * column set, so it composes best on its own (place it last in `modules`).
 *
 * ```ts
 * grid.modules = [pivotModule({ rowField: "region", columnField: "quarter", valueField: "revenue" })];
 * ```
 */
export function pivotModule(options) {
    let computedColumns = [];
    return defineGridModule({
        name: "pivot",
        stage: "shape",
        transformRows(rows) {
            const buckets = new Map();
            const columnValues = new Set();
            for (const row of rows) {
                const rowValue = formatCellValue(row[options.rowField]);
                const columnValue = formatCellValue(row[options.columnField]);
                columnValues.add(columnValue);
                const bucket = buckets.get(rowValue);
                if (bucket) {
                    bucket.push(row);
                }
                else {
                    buckets.set(rowValue, [row]);
                }
            }
            const sortedColumnValues = [...columnValues].sort();
            computedColumns = [
                { key: options.rowField, label: options.rowLabel ?? String(options.rowField), sortable: true },
                ...sortedColumnValues.map((columnValue) => ({
                    key: columnValue,
                    label: columnValue || "(blank)",
                    align: "end",
                    sortable: true
                }))
            ];
            const pivotRows = [];
            for (const [rowValue, bucketRows] of buckets) {
                const pivotRow = { [options.rowField]: rowValue };
                for (const columnValue of sortedColumnValues) {
                    const matching = bucketRows.filter((row) => formatCellValue(row[options.columnField]) === columnValue);
                    pivotRow[columnValue] = aggregateValues(matching.map((row) => row[options.valueField]), options.aggregate ?? "sum");
                }
                pivotRows.push(pivotRow);
            }
            return pivotRows;
        },
        transformColumns() {
            return computedColumns;
        }
    });
}
//# sourceMappingURL=pivot.js.map