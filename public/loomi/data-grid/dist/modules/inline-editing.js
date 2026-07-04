import { html } from "lit";
import { ref } from "lit/directives/ref.js";
import { defineGridModule } from "../grid-module.js";
import { formatCellValue, getRowMeta } from "../grid-utils.js";
/**
 * Lets users edit cells whose column declares `editable: true`. Start
 * editing by double-clicking a cell (or pressing Enter while it's focused),
 * commit with Enter/blur, cancel with Escape. Edits flow through
 * `grid.updateCellValue(...)`, which mutates `grid.data` and emits
 * `loomi-cell-edit`.
 *
 * ```ts
 * grid.columns = [{ key: "name", label: "Name", editable: true }, ...];
 * grid.modules = [inlineEditingModule()];
 * ```
 */
export function inlineEditingModule(options = {}) {
    const trigger = options.trigger ?? "both";
    let editing = null;
    function isEditingCell(rowKey, columnKey) {
        return editing?.rowKey === rowKey && editing.columnKey === columnKey;
    }
    return defineGridModule({
        name: "inline-editing",
        renderCell(value, cell, ctx) {
            if (!cell.column.editable || getRowMeta(cell.row)) {
                return undefined;
            }
            const rowKeyValue = ctx.getRowKey(cell.row);
            if (!isEditingCell(rowKeyValue, cell.column.key)) {
                return undefined;
            }
            const commit = (inputValue) => {
                editing = null;
                ctx.grid.updateCellValue(rowKeyValue, cell.column.key, inputValue);
                ctx.requestUpdate();
            };
            const cancel = () => {
                editing = null;
                ctx.requestUpdate();
            };
            return html `
        <input
          type="text"
          .value=${formatCellValue(value)}
          ${ref((el) => {
                if (el instanceof HTMLInputElement) {
                    el.focus();
                    el.select();
                }
            })}
          @click=${(event) => event.stopPropagation()}
          @keydown=${(event) => {
                event.stopPropagation();
                if (event.key === "Enter") {
                    commit(event.target.value);
                }
                else if (event.key === "Escape") {
                    cancel();
                }
            }}
          @blur=${(event) => commit(event.target.value)}
        />
      `;
        },
        getCellClass(cell, ctx) {
            return isEditingCell(ctx.getRowKey(cell.row), cell.column.key) ? "loomi-grid-cell-editing" : undefined;
        },
        onCellDblClick(cell, _event, ctx) {
            if (trigger === "enter" || !cell.column.editable || getRowMeta(cell.row)) {
                return;
            }
            editing = { rowKey: ctx.getRowKey(cell.row), columnKey: cell.column.key };
            ctx.requestUpdate();
        },
        onCellKeydown(event, cell, ctx) {
            if (trigger === "dblclick" || event.key !== "Enter" || !cell.column.editable || getRowMeta(cell.row)) {
                return false;
            }
            if (editing) {
                return false;
            }
            editing = { rowKey: ctx.getRowKey(cell.row), columnKey: cell.column.key };
            ctx.requestUpdate();
            return true;
        }
    });
}
//# sourceMappingURL=inline-editing.js.map