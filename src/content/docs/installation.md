---
title: Installation
description: Install LoomiUI in a few simple steps.
---

LoomiUI is installed with npm, just like most frontend packages.

To keep setup simple, start with the main package first. This registers all LoomiUI
components at once, so you can begin building immediately without choosing individual
packages up front.

```bash
npm install @loomi/components lit
```

Then import LoomiUI once in your app entry file (for example, `main.js` or `index.ts`) so all registered components are available across your application:

```js
import "@loomi/components";
```

Now you can use LoomiUI components in your HTML:

```html
<loomi-button color="primary">Save</loomi-button>
```

## Why do I install `lit` too?

LoomiUI is powered by [Lit](https://lit.dev/). Adding `lit` installs the runtime LoomiUI
components rely on to render, react to state changes, and update in the browser.
Because of this, LoomiUI packages require `lit` to be present at runtime.

In most apps, you do not need to import `lit` yourself unless you are using Lit APIs directly.
For typical LoomiUI usage, install `lit` with LoomiUI and import only the components you need.

## Pick an install option

**Install everything** is the fastest way to get LoomiUI running, with every component available out of the box. 
As you get a hang on the library, you can move to smaller installs and import only what you need.

### Install everything

This is the easiest way to get started fast, since everything is ready to use right away.

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

### Install specific components

Use this when you only need specific components. Each component package works on its own. 
In the example below we install the [avatar](/components/avatar), [button](/components/button) and [chart](/components/chart) components.

```bash
npm install @loomi/avatar @loomi/button @loomi/chart lit
```

```js
import "@loomi/avatar";
import "@loomi/button";
import "@loomi/chart";
```

```html
<loomi-avatar image="/avatars/jondoe.svg"></loomi-avatar>
```
```html
<loomi-button color="primary" icon="check">Save changes</loomi-button>
```

### Install a category

Use this when you need a group of related components.

LoomiUI's components are split into three categories. 
Each category has one package for the full group. Every component also has its own
standalone package if you only need that one component. 

| Category | Description |
| --- | --- |
| [forms](#forms) | Input and form-related components. |
| [content](#content) | Display and layout components for content presentation. |
| [navigation](#navigation) | Components for movement, menus, tabs, and paging. |
| standalone | This is not a 'category' per se. All other components that fall out of the three categories. |

#### Forms

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

#### Content

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

#### Navigation

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

#### Standalone Components

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

## TypeScript

TypeScript support is included in every LoomiUI package, so it works out of the box.

You do not need to install a separate `@types/*` package. Once you install a LoomiUI
package, TypeScript picks up the types automatically.

That means you get helpful autocomplete, safer code, and clearer errors while you work.
It is especially useful when you import component classes, helper functions, or shared
types in your app:

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

If you use LoomiUI in plain HTML, you usually do not need to think about types at all.
Just install the package, import the component, and use the element in your markup.

Types become helpful when you are writing TypeScript and your code interacts with a
component directly (for example, reading properties, calling methods, or handling typed
events).

## What's next

- **[Customization →](/customization/)** — change colors and set up dark mode.
- **Browse components** — use the sidebar to see every component.
