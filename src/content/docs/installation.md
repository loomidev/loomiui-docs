---
title: Installation
description: Install LoomiUI in a few simple steps.
---

LoomiUI is installed with npm, just like most frontend packages.

The easiest way to start is to install the main package:

```bash
npm install @loomi/components lit
```

Then import LoomiUI once in your app:

```js
import "@loomi/components";
```

Now you can use LoomiUI components in your HTML:

```html
<loomi-button color="primary">Save</loomi-button>
```

## Why do I install `lit` too?

LoomiUI is built with [Lit](https://lit.dev/). Installing `lit` gives LoomiUI the small
runtime it needs in your app.

You usually do not need to import `lit` yourself. Just install it with LoomiUI.

## Pick an install option

If you are new, use **Install everything**. You can switch to smaller installs later if
you want to keep your app bundle smaller.

<loomi-tabs>
<loomi-tab label="Install everything" active>

Use this when you want the simplest setup.

```bash
npm install @loomi/components lit
```

```js
import "@loomi/components"; // registers every <loomi-*> element
```

You can also import only the components you use from the same package:

```js
import "@loomi/components/button";
import "@loomi/components/datepicker";
```

</loomi-tab>
<loomi-tab label="Install one component">

Use this when you only need one component.

```bash
npm install @loomi/button lit
```

```js
import "@loomi/button";
```

```html
<loomi-button color="primary" icon="check">Save changes</loomi-button>
```

Each component package works on its own, so this does not install the whole library.

</loomi-tab>
<loomi-tab label="Install a category">

Use this when you need a group of related components.

Each category has one package for the full group. Every component also has its own
standalone package if you only need that one component.

### Forms

```bash
npm install @loomi/forms lit
```

```js
import "@loomi/forms"; // registers every form component
```

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-input>` | Text input with labels, icons, and validation. | `@loomi/input` |
| `<loomi-textarea>` | Multi-line text input. | `@loomi/textarea` |
| `<loomi-select>` | Custom select dropdown. | `@loomi/select` |
| `<loomi-checkbox>` | Checkbox input. | `@loomi/checkbox` |
| `<loomi-radio>` | Radio button input. | `@loomi/radio` |
| `<loomi-toggle>` | On/off switch. | `@loomi/toggle` |
| `<loomi-number>` | Number input with plus and minus controls. | `@loomi/number` |
| `<loomi-slider>` | Range slider input. | `@loomi/slider` |
| `<loomi-code>` | PIN or verification code input. | `@loomi/code` |
| `<loomi-checkcards>` | Selectable card inputs. | `@loomi/checkcards` |
| `<loomi-datepicker>` | Date picker. | `@loomi/datepicker` |
| `<loomi-timepicker>` | Time picker. | `@loomi/timepicker` |
| `<loomi-colorpicker>` | Color picker. | `@loomi/colorpicker` |
| `<loomi-filepicker>` | File picker with drag and drop. | `@loomi/filepicker` |

### Content

```bash
npm install @loomi/content lit
```

```js
import "@loomi/content"; // registers every content component
```

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-card>` | Basic content card. | `@loomi/card` |
| `<loomi-avatar>` | User image, initials, or avatar stack. | `@loomi/avatar` |
| `<loomi-accordion>` | Expand and collapse sections. | `@loomi/accordion` |
| `<loomi-tag>` | Label, badge, or small status chip. | `@loomi/tag` |
| `<loomi-tooltip>` | Small message on hover or focus. | `@loomi/tooltip` |
| `<loomi-popover>` | Floating panel for extra content. | `@loomi/popover` |
| `<loomi-empty-state>` | Placeholder for an empty page or list. | `@loomi/empty-state` |
| `<loomi-statistic>` | Dashboard number with a label. | `@loomi/statistic` |
| `<loomi-rating>` | Star, heart, or thumbs-up rating. | `@loomi/rating` |
| `<loomi-timeline>` | Chronological list of events. | `@loomi/timeline` |
| `<loomi-progress>` | Progress bar or progress circle. | `@loomi/progress` |
| `<loomi-listview>` | Divided list of items. | `@loomi/listview` |
| `<loomi-contact-card>` | Ready-made contact details card. | `@loomi/contact-card` |
| `<loomi-centered-content>` | Centers content vertically and horizontally. | `@loomi/centered-content` |
| `<loomi-sortable>` | Drag-and-drop reorderable list. | `@loomi/sortable` |
| `<loomi-processing>` | Shows working, success, or failed states. | `@loomi/processing` |
| `<loomi-horizontal-line-graph>` | Labeled proportion bar. | `@loomi/horizontal-line-graph` |
| `<loomi-chart>` | SVG charts like line, bar, pie, and donut. | `@loomi/chart` |

### Navigation

```bash
npm install @loomi/navigation lit
```

```js
import "@loomi/navigation"; // registers every navigation component
```

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-tab>` | Tabbed content. | `@loomi/tab` |
| `<loomi-pagination>` | Page controls. | `@loomi/pagination` |
| `<loomi-dropmenu>` | Dropdown action menu. | `@loomi/dropmenu` |
| `<loomi-theme-switcher>` | Light, dark, and system theme toggle. | `@loomi/theme-switcher` |

### Standalone Components

These components are installed one at a time.

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-button>` | Button for actions and links. | `@loomi/button` |
| `<loomi-icon>` | Icon renderer. | `@loomi/icon` |
| `<loomi-spinner>` | Loading spinner. | `@loomi/spinner` |
| `<loomi-alert>` | Inline message for info, warning, success, or error. | `@loomi/alert` |
| `<loomi-bell>` | Notification bell with an optional status dot. | `@loomi/bell` |
| `<loomi-modal>` | Dialog or popup window. | `@loomi/modal` |
| `<loomi-notification>` | Toast notification. | `@loomi/notification` |
| `<loomi-table>` | Data table with sorting, search, and pagination. | `@loomi/table` |

</loomi-tab>
</loomi-tabs>

## TypeScript

TypeScript support is included in every LoomiUI package.

You do not need to install a separate `@types/*` package. After you install a LoomiUI
package, TypeScript can read its types automatically.

This helps when you import component classes, helper functions, or shared types:

```ts
import "@loomi/button";
import type { LoomiButton, LoomiButtonSize } from "@loomi/button";

const size: LoomiButtonSize = "regular";
const button = document.querySelector("loomi-button") as LoomiButton | null;

button?.startSpinner();
```

Some components also export helper functions:

```ts
import { showLoomiModal } from "@loomi/modal";

showLoomiModal("delete-user");
```

If you use LoomiUI in plain HTML, you usually do not need to think about these types.
They are most useful when your TypeScript code talks to a component directly.

## What's next

- **[Customization →](/customization/)** — change colors and set up dark mode.
- **Browse components** — use the sidebar to see every component.
