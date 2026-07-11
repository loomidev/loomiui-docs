import { LoomiProDataTable } from "./loomi-pro-data-table.js";
export { LoomiProDataTable } from "./loomi-pro-data-table.js";
export function defineLoomiProDataTable() {
    if (!customElements.get("loomi-pro-data-table")) {
        customElements.define("loomi-pro-data-table", LoomiProDataTable);
    }
}
