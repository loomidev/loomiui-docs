import { LoomiProFilterBuilder } from "./loomi-pro-filter-builder.js";
export { LoomiProFilterBuilder } from "./loomi-pro-filter-builder.js";
export function defineLoomiProFilterBuilder() {
    if (!customElements.get("loomi-pro-filter-builder")) {
        customElements.define("loomi-pro-filter-builder", LoomiProFilterBuilder);
    }
}
//# sourceMappingURL=index.js.map