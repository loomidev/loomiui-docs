import { defineGridModule } from "../grid-module.js";
import { getRowMeta, withRowMeta } from "../grid-utils.js";
/**
 * Flattens hierarchical rows (nodes with a `children` array) into an
 * indented, expand/collapsible list. Runs in the `"shape"` stage; the tree
 * roots are whatever `data` sorted to at that point.
 *
 * ```ts
 * grid.data = [{ id: "1", name: "Engineering", children: [{ id: "1a", name: "Platform" }] }];
 * grid.modules = [treeDataModule()];
 * ```
 */
export function treeDataModule(options = {}) {
    const childrenKey = options.childrenKey ?? "children";
    const expandedState = new Map();
    function isExpanded(key) {
        if (!expandedState.has(key)) {
            expandedState.set(key, options.expandedByDefault ?? true);
        }
        return expandedState.get(key) ?? false;
    }
    return defineGridModule({
        name: "tree-data",
        stage: "shape",
        transformRows(rows, ctx) {
            const flattened = [];
            const visit = (nodes, depth) => {
                for (const node of nodes) {
                    const children = node[childrenKey] ?? [];
                    const hasChildren = children.length > 0;
                    const key = ctx.getRowKey(node);
                    const expanded = hasChildren && isExpanded(key);
                    flattened.push(withRowMeta(node, { type: "data", depth, hasChildren, expanded }));
                    if (hasChildren && expanded) {
                        visit(children, depth + 1);
                    }
                }
            };
            visit(rows, 0);
            return flattened;
        },
        onGridEvent(name, detail, ctx) {
            if (name !== "loomi-grid-toggle-row") {
                return;
            }
            const { row, expanded } = detail;
            const meta = getRowMeta(row);
            if (!meta?.hasChildren) {
                return;
            }
            expandedState.set(ctx.getRowKey(row), expanded);
            ctx.requestUpdate();
        }
    });
}
//# sourceMappingURL=tree-data.js.map