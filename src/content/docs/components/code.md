---
title: Code
description: "<loomi-code> — a verification-code (PIN) input of N boxes with auto-advance and paste support. It's common to send users a 4–6 digit code via email or SMS for…"
---
<script type="module">
  import "@loomi/code";
</script>

`<loomi-code>` — a verification-code (PIN) input of N boxes with auto-advance and paste
support. It's common to send users a 4–6 digit code via email or SMS for them to enter
here. **Form-associated**: submits the joined code under `name`.

```bash
npm install @loomi/code lit
```

```js
import "@loomi/code/loomi-code.js";
```

## Basic Usage

The default number of boxes is four.

<div class="loomi-preview" data-label="Preview">
<loomi-code></loomi-code>
</div>

```html
<loomi-code></loomi-code>
```

<div class="loomi-preview" data-label="Preview">
<loomi-code size="big"></loomi-code>
</div>

```html
<loomi-code size="big"></loomi-code>
```

Set `total-digits` to show more or fewer boxes — there's no upper limit, so this also
works well for collecting longer numeric codes like account numbers.

<div class="loomi-preview" data-label="Preview">
<loomi-code total-digits="6"></loomi-code>
</div>

```html
<loomi-code total-digits="6"></loomi-code>
```

## Masking

Hide the entered characters, like a password field.

<div class="loomi-preview" data-label="Preview">
<loomi-code mask></loomi-code>
</div>

```html
<loomi-code mask></loomi-code>
```

## Reacting to a Completed Code

The `verify` event fires once every box is filled. `e.detail.code` is the joined string.

<div class="loomi-preview" data-label="Preview">
<loomi-code></loomi-code>
<script type="module">
  document.querySelector("loomi-code").addEventListener("verify", (e) => {
    console.log(e.detail.code); // "1234"
  });
</script>
</div>

```html
<loomi-code></loomi-code>

<script type="module">
  document.querySelector("loomi-code").addEventListener("verify", (e) => {
    console.log(e.detail.code); // "1234"
  });
</script>
```

## Showing an Error & Clearing

Call `showError()` on the element to display `error-message` and shake the boxes red;
call `clear()` to empty them so the user can try again.

<div class="loomi-preview" data-label="Preview">
<loomi-code error-message="Yikes, check your code"></loomi-code>
<script type="module">
  const el = document.querySelector("loomi-code");
  el.addEventListener("verify", (e) => {
    if (e.detail.code !== "1234") {
      el.showError();
      el.clear();
    }
  });
</script>
</div>

```html
<loomi-code error-message="Yikes, check your code"></loomi-code>

<script type="module">
  const el = document.querySelector("loomi-code");
  el.addEventListener("verify", (e) => {
    if (e.detail.code !== "1234") {
      el.showError();
      el.clear();
    }
  });
</script>
```

## Attributes

| Attribute | Default | Description |
| --- | --- | --- |
| `name` | _(blank)_ | Submitted with the form. |
| `total-digits` | `4` | Number of input boxes. |
| `size` | `small` | `small` \| `big` |
| `mask` | `false` | Hide entered characters. _(boolean)_ |
| `error-message` | `Verification code is invalid` | Shown when `showError()` is called. |

**Methods:** `clear()`, `showError()`. **Property:** `code`. **Event:** `verify`
(`detail: { code }`, fired when all boxes are filled).

> Not (yet) ported from BladewindUI: the built-in resend countdown timer, spinner and
> success-checkmark helpers — wire those up yourself from the `verify` event and your own
> async verification call.

## Full Example

<div class="loomi-preview" data-label="Preview">
<loomi-code
  name="pin-code"
  total-digits="5"
  error-message="Please enter the correct code"
></loomi-code>
<script type="module">
  const el = document.querySelector("loomi-code");
  el.addEventListener("verify", async (e) => {
    const ok = await verifyPin(e.detail.code);
    if (!ok) {
      el.showError();
      el.clear();
    }
  });
</script>
</div>

```html
<loomi-code
  name="pin-code"
  total-digits="5"
  error-message="Please enter the correct code"
></loomi-code>

<script type="module">
  const el = document.querySelector("loomi-code");
  el.addEventListener("verify", async (e) => {
    const ok = await verifyPin(e.detail.code);
    if (!ok) {
      el.showError();
      el.clear();
    }
  });
</script>
```
