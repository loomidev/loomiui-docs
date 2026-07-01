import { LoomiProCalendar } from "./loomi-pro-calendar.js";
export { LoomiProCalendar } from "./loomi-pro-calendar.js";
export function defineLoomiProCalendar() {
    if (!customElements.get("loomi-pro-calendar")) {
        customElements.define("loomi-pro-calendar", LoomiProCalendar);
    }
}
//# sourceMappingURL=index.js.map