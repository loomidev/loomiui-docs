---
title: Installation
description: Install LoomiUI in a few simple steps.
---

LoomiUI is installed using npm and follows the same setup process as most modern frontend libraries.

If you're new to LoomiUI, start by installing the main package. It registers all components at once so you can begin building right away.

This is the fastest way to get started. Later, you can install only the components you frequently use to reduce bundle size.
<p>&nbsp;</p>

```bash
npm install @loomidev/components lit
```

<p>&nbsp;</p>

Once installation is complete, import LoomiUI in your app entry file (for example, `main.js` or `index.ts`) so all registered components are available across your application:

```js
import "@loomidev/components";
```

<p>&nbsp;</p>
Now you can use LoomiUI components in your HTML:

```html
<loomi-button color="primary">Save</loomi-button>
```

## Why do I install `lit` too?

LoomiUI is built on [Lit](https://lit.dev/), a small library for building web components. Installing `lit` provides the runtime that LoomiUI components use to render, manage state, and update efficiently in the browser. As a result, `lit` is a required dependency for all LoomiUI packages.

If you skip it, the components won't render and you'll see runtime errors in the browser console, so always install `lit` alongside LoomiUI.

For most projects, you won't need to import `lit` directly unless you're building your own Lit components or using its APIs. Simply install `lit` alongside LoomiUI and import the LoomiUI components you want to use.

## Installation Options

There are three paths to install LoomiUI. Install everything, install categories or install individual packages in the library. 

### Install everything

This is the fastest way to get started because the full LoomiUI component library is installed at once. It is ideal for prototypes, internal tools, and teams that want immediate access to all components without deciding package-by-package up front. After installation, import `@loomidev/components` once in your app entry file to register all `loomi-*` elements globally and start building right away.


```bash
npm install @loomidev/components lit
```

```js
// registers every <loomi-*> element
import "@loomidev/components";
```

<p>&nbsp;</p>
You can also import only the components you use from the same package:

```js
import "@loomidev/components/button";
import "@loomidev/components/datepicker";
```

### Install specific components

Use this approach when you only need a few components and want to keep your bundle smaller than installing the full library. Each component is published as its own package and can be installed independently.

This is a good fit for production apps that only use a subset of LoomiUI, because it reduces unused code and makes dependencies more explicit.

In the example below, we install the [avatar](/components/avatar), [button](/components/button), and [chart](/components/chart) components.

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

Use this when you need a group of related components instead of installing them one by one.

LoomiUI's components are split into three categories, each with a single package that
registers all components in that group. This is useful when your project uses several
components from the same area (for example, multiple form inputs), and you want a simpler
setup with fewer import statements.

If you only need one component, you can still install its standalone package. Category
packages are mainly for convenience when you expect to use multiple related components.

| Category | Description |
| --- | --- |
| [forms](#forms) | Input and form-related components. |
| [content](#content) | Display and layout components for content presentation. |
| [navigation](#navigation) | Components for movement, menus, tabs, and paging. |

#### Forms

Install the forms category package to register all form-related LoomiUI components at once.

```bash
npm install @loomidev/forms lit
```

```js
// registers every form component
import "@loomidev/forms"; 
```

<p>&nbsp;</p>

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

<p>&nbsp;</p>

#### Content

The `@loomidev/content` package includes reusable display components like [cards](/components/card), [tooltips](/components/tooltip), [timelines](/components/timeline), and [progress](/components/progress) indicators for building rich interfaces.

```bash
npm install @loomidev/content lit
```

```js
// registers every content component
import "@loomidev/content"; 
```

<p>&nbsp;</p>

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

<p>&nbsp;</p>

#### Navigation

Install the navigation bundle to register all navigation-related components in one package.

```bash
npm install @loomidev/navigation lit
```

```js
import "@loomidev/navigation"; // registers every navigation component
```
<p>&nbsp;</p>

| Component | Description | Standalone package |
| --- | --- | --- |
| `<loomi-tab>` | Tabbed content. | `@loomidev/tab` |
| `<loomi-pagination>` | Page controls. | `@loomidev/pagination` |
| `<loomi-dropmenu>` | Dropdown action menu. | `@loomidev/dropmenu` |
| `<loomi-context-menu>` | Right-click action menu. | `@loomidev/context-menu` |
| `<loomi-command-palette>` | Keyboard-first action launcher. | `@loomidev/command-palette` |
| `<loomi-bottom-nav>` | Mobile bottom navigation bar with badges. | `@loomidev/bottom-nav` |
| `<loomi-theme-switcher>` | Light, dark, and system theme toggle. | `@loomidev/theme-switcher` |
<p>&nbsp;</p>

#### Standalone Components

These components do not fall within any of the three categories listed above.

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
<p>&nbsp;</p>

## TypeScript

Every LoomiUI package ships with built-in TypeScript types.

No extra `@types/*` install is required. As soon as you install a LoomiUI package,
your editor and TypeScript compiler can resolve its types automatically.

**Using React?** JSX type support requires one extra package. See [Using with React →](/react/).

This gives you better developer experience right away:

- Autocomplete for component APIs
- Type-safe usage in app code
- Clearer compile-time errors while you build

It is especially useful when importing component classes, helper functions, or shared
types:

```ts
import "@loomidev/button";
import type { LoomiButton, LoomiButtonSize } from "@loomidev/button";

const size: LoomiButtonSize = "regular";
const button = document.querySelector("loomi-button") as LoomiButton | null;

button?.startSpinner(); // typed method, autocompleted in your editor
```

<p>&nbsp;</p>

Some components also export helper functions:

```ts
import { showLoomiModal } from "@loomidev/modal";

showLoomiModal("delete-user");
```
<p>&nbsp;</p>

Types are entirely optional. With plain HTML you just install the package, import the
component, and drop the element into your markup — no types involved. You only touch them
when you interact with a component from TypeScript code, such as reading properties,
calling methods, or handling typed events.

## What's next

- **[Theming →](/theming/)** — change colors and set up dark mode.
- **[CLI →](/cli/)** — scaffold Pro starter kits with `loomi-pro` (requires a Pro license).
- **[MCP Server →](/mcp-server/)** — connect AI tools to LoomiUI component docs.
- **Browse components** — use the sidebar to see every component.
