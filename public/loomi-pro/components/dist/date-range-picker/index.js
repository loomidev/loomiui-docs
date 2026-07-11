import { LoomiProDateRangePicker } from "./loomi-pro-date-range-picker.js";
export { LoomiProDateRangePicker } from "./loomi-pro-date-range-picker.js";
export function defineLoomiProDateRangePicker() {
    if (!customElements.get("loomi-pro-date-range-picker")) {
        customElements.define("loomi-pro-date-range-picker", LoomiProDateRangePicker);
    }
}
