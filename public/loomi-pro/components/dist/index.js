import { defineLoomiProCommandPalette } from "./command-palette/index.js";
import { defineLoomiProDataTable } from "./data-table/index.js";
import { defineLoomiProDateRangePicker } from "./date-range-picker/index.js";
import { defineLoomiProFilterBuilder } from "./filter-builder/index.js";
import { defineLoomiProCalendar } from "./calendar/index.js";
export * from "./command-palette/index.js";
export * from "./data-table/index.js";
export * from "./date-range-picker/index.js";
export * from "./filter-builder/index.js";
export * from "./calendar/index.js";
export const proComponentRoadmap = [
    "advanced-data-table",
    "command-palette",
    "date-range-picker",
    "filter-builder",
    "calendar",
    "scheduler",
    "file-uploader",
    "image-cropper",
    "user-management",
    "role-editor",
    "audit-log-viewer",
    "billing-settings",
    "notification-center"
];
export function registerLoomiProComponents() {
    defineLoomiProCommandPalette();
    defineLoomiProDataTable();
    defineLoomiProDateRangePicker();
    defineLoomiProFilterBuilder();
    defineLoomiProCalendar();
}
