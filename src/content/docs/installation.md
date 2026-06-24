---
title: Installation
description: Install the whole LoomiUI library, a single component, or a whole category.
---

LoomiUI ships as many small npm packages instead of one big one. Pick the install path
that matches how much of the library you actually need.

`lit` is a **peer dependency** of every package, so your app controls the single Lit
version on the page — there's never more than one copy.

<loomi-tabs>
<loomi-tab label="Install everything" active>

The umbrella package re-exports every component and registers all of them on import.

```bash
npm install @loomi/components lit
```

```js
import "@loomi/components"; // registers every <loomi-*> element
```

Prefer to only register what you use? Import per-component subpaths from the same
package:

```js
import "@loomi/components/button";
import "@loomi/components/datepicker";
```

</loomi-tab>
<loomi-tab label="Install one component">

Each component is a fully standalone package. Installing it pulls in only its direct
dependencies (the shared theme tokens and, where relevant, the icon registry) — never
the rest of the library.

```bash
npm install @loomi/button lit
```

```js
import "@loomi/button/loomi-button.js";
```

```html
<loomi-button color="primary" icon="check">Save changes</loomi-button>
```

</loomi-tab>
<loomi-tab label="Install a category">

If you need most of a category but not the entire library, install that category's
grouping package.

```bash
npm install @loomi/forms lit
# or
npm install @loomi/content lit
# or
npm install @loomi/navigation lit
```

```js
import "@loomi/forms"; // registers every form component
```

</loomi-tab>
</loomi-tabs>

## TypeScript

Every package ships its own `.d.ts` declarations, so component props, events, and the
exported helper functions (like `accentVars` or `showLoomiModal`) are typed out of the
box — no `@types/*` package needed.

## What's next

- **[Customization →](/customization/)** — re-theme the whole library with one CSS
  variable, and set up dark mode.
- **Browse components** — see the sidebar for the full alphabetical list.
