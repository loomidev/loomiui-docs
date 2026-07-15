---
title: Foundations
description: Shared accessibility, responsive behavior, and dark-mode guarantees across LoomiUI components.
---

Every LoomiUI component follows the same foundation for accessibility, responsive
layout, and theming. Component pages keep the details that are unique to that component
and link back here for the shared rules.

When a component page documents an exception or a more specific behavior, follow that
component guidance in addition to this baseline.

## Accessibility

LoomiUI starts with semantic HTML. Buttons, links, inputs, headings, lists, tables, and
navigation landmarks remain native elements whenever the browser already provides the
right behavior. ARIA is added for custom interaction patterns such as dialogs, menus,
listboxes, grids, and status messages.

Across the library:

- Keyboard users should be able to reach and operate the same actions as pointer users.
- Interactive controls use a visible `:focus-visible` treatment. If a component exposes
  `show-focus-ring="false"`, disable it only when your application supplies an equally
  visible replacement.
- Icon-only controls provide an accessible name through a label or `aria-label`.
- Status, progress, validation, and temporary feedback should include clear text. Color
  and icon shape should support the message, not carry the meaning alone.
- Components preserve native form behavior where possible, including labels, disabled
  states, submission, and keyboard input.

Component pages document extra keyboard commands, focus management, roles, and naming
requirements for controls that need them.

### What your application still owns

Use meaningful labels, headings, alternative text, and error messages. Test the complete
user flow with a keyboard and your supported screen readers; a component cannot infer
the context surrounding it.

## Responsive behavior

LoomiUI components adapt to the container you place them in. Shared styles favor fluid
widths, `min-width: 0`, wrapping, truncation, and stacked layouts so components remain
usable in cards, forms, sidebars, dialogs, and narrow screens.

Across the library:

- Give the parent container an intentional width and allow the component to fill or
  shrink within it.
- Use real content while testing. Long labels, translated text, validation messages,
  and user-provided values expose layout problems that placeholders miss.
- Prefer wrapping for important content. Use truncation only when the full value remains
  available elsewhere, such as a tooltip or detail view.
- Floating panels, dialogs, menus, and media viewers stay within the viewport where the
  component owns that behavior.
- Test narrow mobile, tablet, and desktop widths, plus zoomed text and browser zoom.

Component pages document fixed dimensions, mobile-only variants, container-query
behavior, or layout properties such as `orientation` when those details are specific to
the component.

## Dark mode

LoomiUI uses semantic CSS custom properties instead of hard-coded light colors for
surfaces, borders, text, hover states, focus rings, and muted content. Components inherit
those tokens through their shadow DOM.

Add `.dark` to the application root with `@loomidev/theme-switcher`, or toggle that class
with your own theme controller:

```html
<html class="dark">
  <body>
    <loomi-button>Save changes</loomi-button>
  </body>
</html>
```

Palette colors such as `primary`, `info`, `success`, `warning`, and `error` continue to
use their semantic color ramps in both modes. Surface and text tokens shift with the
active theme.

When reviewing a customized theme, check:

- Text and icon contrast on every surface.
- Borders and dividers, especially subtle variants.
- Hover, selected, disabled, and `:focus-visible` states.
- Status colors on both faint and solid backgrounds.
- Overlays and media controls. Some components intentionally keep an always-dark scrim;
  their component page documents that exception.

For palette values, token overrides, and Tailwind integration, continue with
[Theming](/theming/).
