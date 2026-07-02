---
title: Installation
description: Install LoomiUI in a few simple steps.
---

LoomiUI is installed with npm, just like most frontend packages.

To keep setup simple, start with the main package first. This registers all LoomiUI
components at once, so you can begin building immediately without choosing individual
packages up front.

```bash
npm install @loomidev/components lit
```

Then import LoomiUI once in your app entry file (for example, `main.js` or `index.ts`) so all registered components are available across your application:

```js
import "@loomidev/components";
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
npm install @loomidev/components lit
```

```js
import "@loomidev/components"; // registers every <loomi-*> element
```

You can also import only the components you use from the same package:

```js
import "@loomidev/components/button";
import "@loomidev/components/datepicker";
```

### Install specific components

Use this when you only need specific components. Each component package works on its own. 
In the example below we install the [avatar](/components/avatar), [button](/components/button) and [chart](/components/chart) components.

```bash
npm install @loomidev/avatar @loomidev/button @loomidev/chart lit
```

```js
import "@loomidev/avatar";
import "@loomidev/button";
import "@loomidev/chart";
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
npm install @loomidev/forms lit
```

```js
import "@loomidev/forms"; // registers every form component
```

| Component | Description | Standalone package      |
| --- | --- |-------------------------|
| `<loomi-input>` | Text input with labels, icons, and validation. | `@loomidev/input`       |
| `<loomi-textarea>` | Multi-line text input. | `@loomidev/textarea`    |
| `<loomi-select>` | Custom select dropdown. | `@loomidev/select`      |
| `<loomi-checkbox>` | Checkbox input. | `@loomidev/checkbox`    |
| `<loomi-radio>` | Radio button input. | `@loomidev/radio`       |
| `<loomi-toggle>` | On/off switch. | `@loomidev/toggle`      |
| `<loomi-number>` | Number input with plus and minus controls. | `@loomidev/number`      |
| `<loomi-slider>` | Range slider input. | `@loomidev/slider`      |
| `<loomi-code>` | PIN or verification code input. | `@loomidev/code`        |
| `<loomi-checkcards>` | Selectable card inputs. | `@loomidev/checkcards`  |
| `<loomi-datepicker>` | Date picker. | `@loomidev/datepicker`  |
| `<loomi-timepicker>` | Time picker. | `@loomidev/timepicker`  |
| `<loomi-colorpicker>` | Color picker. | `@loomidev/colorpicker` |
| `<loomi-filepicker>` | File picker with drag and drop. | `@loomidev/filepicker`  |

#### Content

```bash
npm install @loomidev/content lit
```

```js
import "@loomidev/content"; // registers every content component
```

| Component | Description | Standalone package                |
| --- | --- |-----------------------------------|
| `<loomi-card>` | Basic content card. | `@loomidev/card`                  |
| `<loomi-avatar>` | User image, initials, or avatar stack. | `@loomidev/avatar`                |
| `<loomi-accordion>` | Expand and collapse sections. | `@loomidev/accordion`             |
| `<loomi-tag>` | Label, badge, or small status chip. | `@loomidev/tag`                   |
| `<loomi-tooltip>` | Small message on hover or focus. | `@loomidev/tooltip`               |
| `<loomi-popover>` | Floating panel for extra content. | `@loomidev/popover`               |
| `<loomi-empty-state>` | Placeholder for an empty page or list. | `@loomidev/empty-state`           |
| `<loomi-statistic>` | Dashboard number with a label. | `@loomidev/statistic`             |
| `<loomi-rating>` | Star, heart, or thumbs-up rating. | `@loomidev/rating`                |
| `<loomi-timeline>` | Chronological list of events. | `@loomidev/timeline`              |
| `<loomi-progress>` | Progress bar or progress circle. | `@loomidev/progress`              |
| `<loomi-listview>` | Divided list of items. | `@loomidev/listview`              |
| `<loomi-contact-card>` | Ready-made contact details card. | `@loomidev/contact-card`          |
| `<loomi-centered-content>` | Centers content vertically and horizontally. | `@loomidev/centered-content`      |
| `<loomi-sortable>` | Drag-and-drop reorderable list. | `@loomidev/sortable`              |
| `<loomi-processing>` | Shows working, success, or failed states. | `@loomidev/processing`            |
| `<loomi-horizontal-line-graph>` | Labeled proportion bar. | `@loomidev/horizontal-line-graph` |
| `<loomi-chart>` | SVG charts like line, bar, pie, and donut. | `@loomidev/chart`                 |

#### Navigation

```bash
npm install @loomidev/navigation lit
```

```js
import "@loomidev/navigation"; // registers every navigation component
```

| Component | Description | Standalone package         |
| --- | --- |----------------------------|
| `<loomi-tab>` | Tabbed content. | `@loomidev/tab`            |
| `<loomi-pagination>` | Page controls. | `@loomidev/pagination`     |
| `<loomi-dropmenu>` | Dropdown action menu. | `@loomidev/dropmenu`       |
| `<loomi-theme-switcher>` | Light, dark, and system theme toggle. | `@loomidev/theme-switcher` |

#### Standalone Components

These components are installed one at a time.

| Component | Description | Standalone package       |
| --- | --- |--------------------------|
| `<loomi-button>` | Button for actions and links. | `@loomidev/button`       |
| `<loomi-icon>` | Icon renderer. | `@loomidev/icon`         |
| `<loomi-spinner>` | Loading spinner. | `@loomidev/spinner`      |
| `<loomi-alert>` | Inline message for info, warning, success, or error. | `@loomidev/alert`        |
| `<loomi-bell>` | Notification bell with an optional status dot. | `@loomidev/bell`         |
| `<loomi-modal>` | Dialog or popup window. | `@loomidev/modal`        |
| `<loomi-notification>` | Toast notification. | `@loomidev/notification` |
| `<loomi-table>` | Data table with sorting, search, and pagination. | `@loomidev/table`        |

## TypeScript

TypeScript support is included in every LoomiUI package, so it works out of the box.

You do not need to install a separate `@types/*` package. Once you install a LoomiUI
package, TypeScript picks up the types automatically.

That means you get helpful autocomplete, safer code, and clearer errors while you work.
It is especially useful when you import component classes, helper functions, or shared
types in your app:

```ts
import "@loomidev/button";
import type { LoomiButton, LoomiButtonSize } from "@loomidev/button";

const size: LoomiButtonSize = "regular";
const button = document.querySelector("loomi-button") as LoomiButton | null;

button?.startSpinner();
```

Some components also export helper functions:

```ts
import { showLoomiModal } from "@loomidev/modal";

showLoomiModal("delete-user");
```

If you use LoomiUI in plain HTML, you usually do not need to think about types at all.
Just install the package, import the component, and use the element in your markup.

Types become helpful when you are writing TypeScript and your code interacts with a
component directly (for example, reading properties, calling methods, or handling typed
events).

## What's next

- **[Customization →](/customization/)** — change colors and set up dark mode.
- **[CLI →](/cli/)** — scaffold Pro starter kits with `loomi-pro` (requires a Pro license).
- **[MCP Server →](/mcp-server/)** — connect AI tools to LoomiUI component docs.
- **Browse components** — use the sidebar to see every component.