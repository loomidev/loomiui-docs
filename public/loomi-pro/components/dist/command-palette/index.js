import { LoomiProCommandPalette } from "./loomi-pro-command-palette.js";
export { LoomiProCommandPalette } from "./loomi-pro-command-palette.js";
export function defineLoomiProCommandPalette() {
    if (!customElements.get("loomi-pro-command-palette")) {
        customElements.define("loomi-pro-command-palette", LoomiProCommandPalette);
    }
}
//# sourceMappingURL=index.js.map