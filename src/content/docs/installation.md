---
title: Installation
description: Install LoomiUI in a few simple steps.
---

LoomiUI is installed with npm, following the same setup flow as most modern frontend libraries.

If you are new to LoomiUI, the recommended starting point is the main package.
Installing this package registers all available LoomiUI components in one step, which
lets you start building right away without deciding on individual component packages
up front.

This is the fastest path to a working setup. Once your project is running, you can
switch to smaller, component-level installs to keep your bundle more focused.

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

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-input>` | Text input with labels, icons, and validation. | `@loomidev/input` |
| `<loomi-password>` | Password field with reveal toggle and strength hints. | `@loomidev/password` |
| `<loomi-textarea>` | Multi-line text input. | `@loomidev/textarea` |
| `<loomi-text-editor>` | Rich-text editor with configurable tools. | `@loomidev/text-editor` |
| `<loomi-select>` | Custom select dropdown (searchable, multiple). | `@loomidev/select` |
| `<loomi-checkbox>` | Checkbox input. | `@loomidev/checkbox` |
| `<loomi-radio>` | Radio button input. | `@loomidev/radio` |
| `<loomi-toggle>` | On/off switch. | `@loomidev/toggle` |
| `<loomi-number>` | Number input with plus and minus controls. | `@loomidev/number` |
| `<loomi-slider>` | Range slider input. | `@loomidev/slider` |
| `<loomi-otp>` | One-time passcode (OTP/PIN) input. | `@loomidev/otp` |
| `<loomi-checkcards>` | Selectable card inputs. | `@loomidev/checkcards` |
| `<loomi-datepicker>` | Date picker (single or range). | `@loomidev/datepicker` |
| `<loomi-timepicker>` | Time picker. | `@loomidev/timepicker` |
| `<loomi-timezonepicker>` | Searchable timezone dropdown with live UTC offsets. | `@loomidev/timezonepicker` |
| `<loomi-colorpicker>` | Color picker. | `@loomidev/colorpicker` |
| `<loomi-filepicker>` | File picker with drag and drop. | `@loomidev/filepicker` |
| `<loomi-countries>` | Searchable country dropdown with flags and phone mode. | `@loomidev/countries` |
| `<loomi-creditcard>` | Flippable credit card input with network detection. | `@loomidev/creditcard` |
| `<loomi-date-range-picker>` | Date range picker for dashboards and reports. | `@loomidev/date-range-picker` |
| `<loomi-filter-builder>` | Structured filter editor for tables and queries. | `@loomidev/filter-builder` |

#### Content

```bash
npm install @loomidev/content lit
```

```js
import "@loomidev/content"; // registers every content component
```

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-card>` | Basic content card. | `@loomidev/card` |
| `<loomi-divider>` | Horizontal or vertical content divider. | `@loomidev/divider` |
| `<loomi-qrcode>` | QR code with corner brackets and scan effects. | `@loomidev/qrcode` |
| `<loomi-avatar>` | User image, initials, or avatar stack. | `@loomidev/avatar` |
| `<loomi-accordion>` | Expand and collapse sections. | `@loomidev/accordion` |
| `<loomi-arc-meter>` | Semi-circle status meter with marker stops. | `@loomidev/arc-meter` |
| `<loomi-tag>` | Label, badge, or small status chip. | `@loomidev/tag` |
| `<loomi-tooltip>` | Small message on hover or focus. | `@loomidev/tooltip` |
| `<loomi-popover>` | Floating panel for extra content. | `@loomidev/popover` |
| `<loomi-empty-state>` | Placeholder for an empty page or list. | `@loomidev/empty-state` |
| `<loomi-statistic>` | Dashboard number with a label. | `@loomidev/statistic` |
| `<loomi-rating>` | Star, heart, or thumbs-up rating. | `@loomidev/rating` |
| `<loomi-timeline>` | Chronological list of events. | `@loomidev/timeline` |
| `<loomi-progress>` | Progress bar, circle, or steps. | `@loomidev/progress` |
| `<loomi-listview>` | Divided list of items. | `@loomidev/listview` |
| `<loomi-contact-card>` | Ready-made contact details card. | `@loomidev/contact-card` |
| `<loomi-centered-content>` | Centers content vertically and horizontally. | `@loomidev/centered-content` |
| `<loomi-sortable>` | Drag-and-drop reorderable list. | `@loomidev/sortable` |
| `<loomi-processing>` | Shows working, success, or failed states. | `@loomidev/processing` |
| `<loomi-horizontal-line-graph>` | Labeled proportion bar. | `@loomidev/horizontal-line-graph` |
| `<loomi-chart>` | SVG charts like line, bar, pie, and donut. | `@loomidev/chart` |
| `<loomi-chat>` | Chat window and message bubbles. | `@loomidev/chat` |
| `<loomi-calendar>` | Calendar and resource scheduler. | `@loomidev/calendar` |
| `<loomi-data-grid>` | Modular data grid with sorting, filtering, and more. | `@loomidev/data-grid` |
| `<loomi-video>` | Themeable video player with custom controls. | `@loomidev/video` |

#### Navigation

```bash
npm install @loomidev/navigation lit
```

```js
import "@loomidev/navigation"; // registers every navigation component
```

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-tab>` | Tabbed content. | `@loomidev/tab` |
| `<loomi-pagination>` | Page controls. | `@loomidev/pagination` |
| `<loomi-dropmenu>` | Dropdown action menu. | `@loomidev/dropmenu` |
| `<loomi-context-menu>` | Right-click action menu. | `@loomidev/context-menu` |
| `<loomi-command-palette>` | Keyboard-first action launcher. | `@loomidev/command-palette` |
| `<loomi-bottom-nav>` | Mobile bottom navigation bar with badges. | `@loomidev/bottom-nav` |
| `<loomi-theme-switcher>` | Light, dark, and system theme toggle. | `@loomidev/theme-switcher` |

#### Standalone Components

These components are installed one at a time.

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-alert>` | Inline message for info, warning, success, or error. | `@loomidev/alert` |
| `<loomi-autocomplete>` | Text input that suggests content as you type. | `@loomidev/autocomplete` |
| `<loomi-bell>` | Notification bell with an optional status dot. | `@loomidev/bell` |
| `<loomi-button>` | Button for actions and links. | `@loomidev/button` |
| `<loomi-button-group>` | Segmented button group with selection. | `@loomidev/button-group` |
| `<loomi-clipboard>` | Wraps content with a copy button. | `@loomidev/clipboard` |
| `<loomi-drawer>` | Sliding edge panel with backdrop and focus trap. | `@loomidev/drawer` |
| `<loomi-emoji-picker>` | Searchable emoji picker. | `@loomidev/emoji-picker` |
| `<loomi-fab>` | Floating action button with optional speed-dial. | `@loomidev/fab` |
| `<loomi-floating-panel>` | Draggable, resizable floating panel. | `@loomidev/floating-panel` |
| `<loomi-icon>` | Icon renderer. | `@loomidev/icon` |
| `<loomi-lightbox-image>` | Click an image to view it fullscreen. | `@loomidev/lightbox` |
| `<loomi-modal>` | Dialog or popup window. | `@loomidev/modal` |
| `<loomi-notification>` | Toast notification. | `@loomidev/notification` |
| `<loomi-photo-gallery>` | Album grid with a lightbox viewer. | `@loomidev/photo-gallery` |
| `<loomi-profile-menu>` | Profile trigger card with dropdown actions. | `@loomidev/profile-menu` |
| `<loomi-progress-steps>` | Standalone progress stepper. | `@loomidev/progress-steps` |
| `<loomi-resizable-panel-group>` | Resizable split-pane layouts. | `@loomidev/resizable` |
| `<loomi-side-nav>` | Sliding in-container side navigation. | `@loomidev/side-nav` |
| `<loomi-spinner>` | Loading spinner. | `@loomidev/spinner` |
| `<loomi-table>` | Data table with sorting, search, and pagination. | `@loomidev/table` |
| `<loomi-tag-input>` | Input content gets wrapped as tags on enter. | `@loomidev/tag-input` |
| `<loomi-timer>` | Animated count up/down timer. | `@loomidev/timer` |

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