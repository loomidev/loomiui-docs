import { html, nothing } from "lit";
import { defineGridModule } from "../grid-module.js";
/**
 * Renders only the rows visible in the scroll viewport (plus overscan),
 * padding the rest with spacer rows so scrollbar size/position stay
 * accurate. Set `max-height` on the grid so `.grid-wrap` actually scrolls;
 * disables core pagination while active.
 *
 * ```ts
 * grid.maxHeight = "480px";
 * grid.pagination = false;
 * grid.modules = [virtualScrollingModule({ rowHeight: 44 })];
 * ```
 */
export function virtualScrollingModule(options = {}) {
    const rowHeight = options.rowHeight ?? 40;
    const overscan = options.overscan ?? 6;
    let scrollTop = 0;
    let attachedEl = null;
    let latestCtx = null;
    const onScroll = () => {
        if (!attachedEl) {
            return;
        }
        scrollTop = attachedEl.scrollTop;
        latestCtx?.requestUpdate();
    };
    function ensureScrollListener(ctx) {
        latestCtx = ctx;
        const wrap = ctx.grid.shadowRoot?.querySelector(".grid-wrap");
        if (!wrap || wrap === attachedEl) {
            return;
        }
        attachedEl?.removeEventListener("scroll", onScroll);
        attachedEl = wrap;
        attachedEl.addEventListener("scroll", onScroll, { passive: true });
    }
    return defineGridModule({
        name: "virtual-scrolling",
        detach() {
            attachedEl?.removeEventListener("scroll", onScroll);
            attachedEl = null;
            latestCtx = null;
        },
        renderBody(rows, columns, renderRow, ctx) {
            ensureScrollListener(ctx);
            const viewportHeight = attachedEl?.clientHeight || 480;
            const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
            const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
            const endIndex = Math.min(rows.length, startIndex + visibleCount);
            const topHeight = startIndex * rowHeight;
            const bottomHeight = (rows.length - endIndex) * rowHeight;
            const colSpan = columns.length + (ctx.grid.selectable ? 1 : 0);
            return html `
        ${topHeight > 0
                ? html `<tr class="virtual-spacer" style=${`--loomi-data-grid-spacer-height:${topHeight}px`}>
              <td colspan=${colSpan}></td>
            </tr>`
                : nothing}
        ${rows.slice(startIndex, endIndex).map((row, offset) => renderRow(row, startIndex + offset))}
        ${bottomHeight > 0
                ? html `<tr class="virtual-spacer" style=${`--loomi-data-grid-spacer-height:${bottomHeight}px`}>
              <td colspan=${colSpan}></td>
            </tr>`
                : nothing}
      `;
        }
    });
}
//# sourceMappingURL=virtual-scrolling.js.map