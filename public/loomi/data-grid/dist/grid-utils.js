export const DEFAULT_COLUMN_WIDTH_PX = 120;
export const SELECTION_COLUMN_WIDTH_PX = 42;
export function formatCellValue(value) {
    if (value == null) {
        return "";
    }
    if (value instanceof Date) {
        return value.toLocaleDateString();
    }
    if (typeof value === "object") {
        return JSON.stringify(value);
    }
    return String(value);
}
export function compareValues(first, second) {
    if (typeof first === "number" && typeof second === "number") {
        return first - second;
    }
    if (first instanceof Date && second instanceof Date) {
        return first.getTime() - second.getTime();
    }
    return formatCellValue(first).localeCompare(formatCellValue(second));
}
export function resolveRowKey(row, rowKeyField) {
    const value = row[rowKeyField];
    return value == null ? JSON.stringify(row) : String(value);
}
/** Reads a row's grid metadata, if any module has stamped it. */
export function getRowMeta(row) {
    return row.__gridMeta;
}
/** Returns a shallow clone of `row` with `meta` attached/merged as `__gridMeta`. */
export function withRowMeta(row, meta) {
    return { ...row, __gridMeta: { ...getRowMeta(row), ...meta } };
}
export function isStructuralRow(row) {
    const meta = getRowMeta(row);
    return meta != null && meta.type !== "data";
}
export function aggregateValues(values, aggregate = "count") {
    const numbers = values.map((value) => Number(value)).filter((value) => !Number.isNaN(value));
    switch (aggregate) {
        case "sum":
            return numbers.reduce((total, value) => total + value, 0);
        case "avg":
            return numbers.length === 0 ? 0 : numbers.reduce((total, value) => total + value, 0) / numbers.length;
        case "min":
            return numbers.length === 0 ? 0 : Math.min(...numbers);
        case "max":
            return numbers.length === 0 ? 0 : Math.max(...numbers);
        case "count":
        default:
            return values.length;
    }
}
function escapeCsvCell(value) {
    if (/[",\n]/.test(value)) {
        return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
}
export function rowsToCsv(rows, columns) {
    const header = columns.map((column) => escapeCsvCell(column.label)).join(",");
    const lines = rows.map((row) => columns.map((column) => escapeCsvCell(formatCellValue(row[column.key]))).join(","));
    return [header, ...lines].join("\n");
}
export function rowsToTsv(rows, columns) {
    return rows.map((row) => columns.map((column) => formatCellValue(row[column.key])).join("\t")).join("\n");
}
export function downloadTextFile(filename, contents, mimeType = "text/plain") {
    const blob = new Blob([contents], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
}
/** Parses a CSS width string to pixels, falling back when missing or invalid. */
export function resolveColumnWidthPx(column, columnWidths = {}, fallback = DEFAULT_COLUMN_WIDTH_PX) {
    const width = columnWidths[column.key] ?? column.width;
    if (width) {
        const parsed = parseFloat(width);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    if (column.minWidth) {
        const parsed = parseFloat(column.minWidth);
        if (!Number.isNaN(parsed)) {
            return parsed;
        }
    }
    return fallback;
}
/** Reorders columns into start-pinned, normal, then end-pinned groups. */
export function orderPinnedColumns(columns) {
    const start = columns.filter((column) => column.pinned === "start");
    const middle = columns.filter((column) => column.pinned !== "start" && column.pinned !== "end");
    const end = columns.filter((column) => column.pinned === "end");
    return [...start, ...middle, ...end];
}
/** Computes sticky `left`/`right` offsets for pinned columns. */
export function computeColumnPinLayout(columns, columnWidths, selectionColumnWidth = 0) {
    const startOffsets = new Map();
    const endOffsets = new Map();
    let lastStartKey = null;
    let firstEndKey = null;
    let left = selectionColumnWidth;
    for (const column of columns) {
        if (column.pinned === "start") {
            startOffsets.set(column.key, left);
            lastStartKey = column.key;
            left += resolveColumnWidthPx(column, columnWidths);
        }
    }
    let right = 0;
    for (let index = columns.length - 1; index >= 0; index -= 1) {
        const column = columns[index];
        if (column.pinned === "end") {
            endOffsets.set(column.key, right);
            firstEndKey ??= column.key;
            right += resolveColumnWidthPx(column, columnWidths);
        }
    }
    return { startOffsets, endOffsets, lastStartKey, firstEndKey };
}
//# sourceMappingURL=grid-utils.js.map