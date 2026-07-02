import { defineGridModule } from "../grid-module.js";
import { formatCellValue } from "../grid-utils.js";
function normalizeRange(anchor, focus) {
    return {
        minRow: Math.min(anchor.rowIndex, focus.rowIndex),
        maxRow: Math.max(anchor.rowIndex, focus.rowIndex),
        minCol: Math.min(anchor.columnIndex, focus.columnIndex),
        maxCol: Math.max(anchor.columnIndex, focus.columnIndex)
    };
}
/**
 * Excel-style range selection with copy/paste. Click-drag or shift+arrow to
 * select a rectangular range, Ctrl/Cmd+C copies it as tab-separated text,
 * Ctrl/Cmd+V pastes clipboard text back in starting at the anchor cell
 * (writes flow through `grid.updateCellValue`, so `loomi-cell-edit` still
 * fires for each written cell).
 *
 * ```ts
 * grid.modules = [spreadsheetModule()];
 * ```
 */
export function spreadsheetModule(options = {}) {
    let anchor = null;
    let focus = null;
    let isSelecting = false;
    const onPointerUp = () => {
        isSelecting = false;
    };
    function isInRange(cell) {
        if (!anchor || !focus) {
            return false;
        }
        const range = normalizeRange(anchor, focus);
        return (cell.rowIndex >= range.minRow &&
            cell.rowIndex <= range.maxRow &&
            cell.columnIndex >= range.minCol &&
            cell.columnIndex <= range.maxCol);
    }
    async function copyRange(ctx) {
        if (!anchor || !focus || options.enableCopy === false) {
            return;
        }
        const range = normalizeRange(anchor, focus);
        const lines = [];
        for (let rowIndex = range.minRow; rowIndex <= range.maxRow; rowIndex += 1) {
            const row = ctx.rows[rowIndex];
            if (!row)
                continue;
            const cells = [];
            for (let columnIndex = range.minCol; columnIndex <= range.maxCol; columnIndex += 1) {
                const column = ctx.columns[columnIndex];
                cells.push(column ? formatCellValue(row[column.key]) : "");
            }
            lines.push(cells.join("\t"));
        }
        try {
            await navigator.clipboard.writeText(lines.join("\n"));
        }
        catch {
            // Clipboard access can be denied outside a secure/user-gesture context — ignore silently.
        }
    }
    async function pasteRange(ctx) {
        if (!anchor || options.enablePaste === false) {
            return;
        }
        let text = "";
        try {
            text = await navigator.clipboard.readText();
        }
        catch {
            return;
        }
        const lines = text.replace(/\r/g, "").split("\n").filter((line, index, all) => !(index === all.length - 1 && line === ""));
        lines.forEach((line, lineOffset) => {
            const cells = line.split("\t");
            cells.forEach((value, cellOffset) => {
                const row = ctx.rows[anchor.rowIndex + lineOffset];
                const column = ctx.columns[anchor.columnIndex + cellOffset];
                if (!row || !column || column.editable === false) {
                    return;
                }
                ctx.grid.updateCellValue(ctx.getRowKey(row), column.key, value);
            });
        });
    }
    return defineGridModule({
        name: "spreadsheet",
        attach() {
            document.addEventListener("pointerup", onPointerUp);
        },
        detach() {
            document.removeEventListener("pointerup", onPointerUp);
        },
        getCellClass(cell) {
            return isInRange(cell) ? "loomi-grid-cell-selected" : undefined;
        },
        onCellPointerDown(cell, _event, ctx) {
            anchor = { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
            focus = { ...anchor };
            isSelecting = true;
            ctx.requestUpdate();
        },
        onCellPointerEnter(cell, _event, ctx) {
            if (!isSelecting) {
                return;
            }
            focus = { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
            ctx.requestUpdate();
        },
        onCellKeydown(event, cell, ctx) {
            const isCopy = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "c";
            const isPaste = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "v";
            if (isCopy) {
                void copyRange(ctx);
                return true;
            }
            if (isPaste) {
                anchor = anchor ?? { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
                void pasteRange(ctx);
                return true;
            }
            if (event.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                anchor = anchor ?? { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
                const current = focus ?? { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
                const rowDelta = event.key === "ArrowUp" ? -1 : event.key === "ArrowDown" ? 1 : 0;
                const colDelta = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
                focus = {
                    rowIndex: Math.max(0, Math.min(ctx.rows.length - 1, current.rowIndex + rowDelta)),
                    columnIndex: Math.max(0, Math.min(ctx.columns.length - 1, current.columnIndex + colDelta))
                };
                ctx.requestUpdate();
                return true;
            }
            if (!event.shiftKey && ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
                anchor = { rowIndex: cell.rowIndex, columnIndex: cell.columnIndex };
                focus = null;
            }
            return false;
        }
    });
}
//# sourceMappingURL=spreadsheet.js.map