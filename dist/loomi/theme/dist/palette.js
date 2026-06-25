import { LOOMI_COLORS, LOOMI_SHADES, } from "./generated/palette.gen.js";
export { LOOMI_COLORS, LOOMI_SHADES };
/** Type guard: is `value` one of the supported loomi color names? */
export function isLoomiColor(value) {
    return (typeof value === "string" &&
        LOOMI_COLORS.includes(value));
}
//# sourceMappingURL=palette.js.map