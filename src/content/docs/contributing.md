---
title: Contributing
description: How to report issues, request components, and contribute to LoomiUI.
---

LoomiUI is open source and contributions are welcome. This page is a quick orientation;
the full, in-depth contributor guide lives in the repository:

**→ [Full contributor guide on GitHub](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md)**

## What contributions are welcome

- **Bug fixes** — corrections to component behavior, accessibility, or styling.
- **New components** — see [Adding a new component](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md#8-adding-a-new-component-step-by-step) in the full guide.
- **Accessibility improvements** — keyboard support, ARIA roles, focus management.
- **Documentation** — clearer explanations, examples, and fixes to these docs.
- **Translations** — adding or improving a built-in language.

If you are unsure whether something is in scope, open an issue first and ask.

## Reporting bugs and requesting components

Use the GitHub issue tracker — pick the matching template:

**→ [Open an issue](https://github.com/loomidev/loomiui/issues/new/choose)** (bug report or feature/component request)

A good bug report includes the component, what you expected, what happened, and a minimal
reproduction. A component request should describe the use case and any similar prior art.

## Local development setup

LoomiUI is a monorepo managed with [pnpm](https://pnpm.io/). You need **Node 20 or later**.

```bash
git clone https://github.com/loomidev/loomiui.git
cd loomiui
corepack enable      # turns on pnpm (bundled with Node 16.9+)
pnpm install         # install deps + link workspace packages
pnpm build           # compile every package into its dist/
```

`pnpm dev` rebuilds packages on change. See the [full setup section](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md#2-pnpm-vs-npm-and-how-to-set-it-up)
for the `corepack` fallback and why the project uses pnpm.

## Repository and package structure

Everything lives in one repository. Each component is its own npm package under
`packages/`:

- **Component packages** — one folder per component (`packages/button`, `packages/input`, …), published as `@loomidev/<name>`.
- **Foundation packages** — `@loomidev/core`, `@loomidev/theme`, and `@loomidev/icons`; every component depends on these.
- **Bundle packages** — `@loomidev/forms`, `@loomidev/content`, and `@loomidev/navigation` group related components; `@loomidev/components` is the "install everything" umbrella.

For how a single package is laid out and how theming works, see
[Anatomy of a package](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md#4-anatomy-of-one-component-package)
and [The theming model](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md#7-the-theming-model-so-you-dont-break-it).

## Testing, linting, and build requirements

Before opening a pull request, make sure these pass from the repository root:

```bash
pnpm build        # compile all packages (tests run against dist/)
pnpm typecheck    # TypeScript type-checking
pnpm test         # smoke tests via @web/test-runner (real headless Chromium)
pnpm lint         # ESLint
pnpm format       # Prettier (or `pnpm format:check` to verify without writing)
```

Continuous integration runs `build`, `typecheck`, and `test` on every push and pull
request, so a PR that fails any of them cannot merge. New components should ship with at
least one smoke test.

## Pull request expectations

- **Branch** off `main` and keep each PR focused on a single change.
- **Green checks** — `build`, `typecheck`, and `test` must pass locally and in CI.
- **Add a changeset** for any user-facing change: run `pnpm changeset` and commit the generated file so your change lands in the changelog and version bump.
- **Follow the [PR template](https://github.com/loomidev/loomiui/blob/main/.github/PULL_REQUEST_TEMPLATE.md)** and link the issue your PR addresses.
- For a new component, follow the [step-by-step checklist](https://github.com/loomidev/loomiui/blob/main/CONTRIBUTING.md#8-adding-a-new-component-step-by-step) in the full guide.

## Code of conduct and templates

- **[Code of Conduct](https://github.com/loomidev/loomiui/blob/main/CODE_OF_CONDUCT.md)** — all participation is expected to follow it.
- **[Issue templates](https://github.com/loomidev/loomiui/issues/new/choose)** — bug report and feature/component request.
- **[Security policy](https://github.com/loomidev/loomiui/blob/main/SECURITY.md)** — please report vulnerabilities privately, not as public issues.
