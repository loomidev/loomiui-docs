---
title: Number
description: "<loomi-number> — a themeable number stepper with increment/decrement buttons, min/max/ step enforcement and a floating label. **Form-associated**."
---
<script type="module">
  import "@loomi/number";
</script>

`<loomi-number>` — a themeable number stepper with increment/decrement buttons, min/max/
step enforcement and a floating label. **Form-associated**.

```bash
npm install @loomi/number lit
```

```js
import "@loomi/number/loomi-number.js";
```

## Basic Usage

<div class="loomi-preview" data-label="Preview">
<loomi-number value="1"></loomi-number>
</div>

```html
<loomi-number value="1"></loomi-number>
```

Increment/decrement by any step:

<div class="loomi-preview" data-label="Preview">
<loomi-number step="10" value="0"></loomi-number>
</div>

```html
<loomi-number step="10" value="0"></loomi-number>
```

## Sizes

<div class="loomi-preview" data-label="Preview">
<loomi-number size="small"></loomi-number>
<loomi-number size="regular"></loomi-number>
<loomi-number size="medium"></loomi-number>
<loomi-number size="big"></loomi-number>
</div>

```html
<loomi-number size="small"></loomi-number>
<loomi-number size="regular"></loomi-number>
<loomi-number size="medium"></loomi-number>
<loomi-number size="big"></loomi-number>
```

## Button Transparency

By default the increment/decrement buttons are transparent. Set
`transparent-icons="false"` for a solid background.

<div class="loomi-preview" data-label="Preview">
<loomi-number transparent-icons="false"></loomi-number>
<loomi-number transparent-icons="false" size="big"></loomi-number>
</div>

```html
<loomi-number transparent-icons="false"></loomi-number>
<loomi-number transparent-icons="false" size="big"></loomi-number>
```

## Labels

<div class="loomi-preview" data-label="Preview">
<loomi-number label="Quantity" value="1"></loomi-number>
</div>

```html
<loomi-number label="Quantity" value="1"></loomi-number>
```

## Minimum and Maximum Limits

<div class="loomi-preview" data-label="Preview">
<loomi-number min="18" max="65" label="Your age" value="18"></loomi-number>
</div>

```html
<loomi-number min="18" max="65" label="Your age" value="18"></loomi-number>
```

The increment/decrement buttons disable at the bounds, and manually typing an
out-of-range value clamps it back to the limit on commit.

## Decimal Values

<div class="loomi-preview" data-label="Preview">
<loomi-number with-dots="false" value="3"></loomi-number>
</div>

```html
<loomi-number with-dots="false" value="3"></loomi-number>
```

## Form Values

<div class="loomi-preview" data-label="Preview">
<loomi-number name="age" value="18"></loomi-number>
</div>

```html
<loomi-number name="age" value="18"></loomi-number>
```

```js
new FormData(form).get("age"); // "18"
```

## Attributes

| Attribute | Default | Description |
| --- | --- | --- |
| `name` | _(blank)_ | Submitted with the form. |
| `label` | _(blank)_ | Floating label. |
| `value` | _(blank)_ | Current value (also a property). |
| `min` | `0` | Minimum value. |
| `max` | `100` | Maximum value. |
| `step` | `1` | Increment/decrement amount. |
| `size` | `medium` | `small` \| `regular` \| `medium` \| `big` |
| `transparent-icons` | `true` | Transparent (vs solid) stepper buttons. _(boolean)_ |
| `with-dots` | `true` | Allow decimal values. _(boolean)_ |
| `required` | `false` | Marks the field required. _(boolean)_ |
| `disabled` | `false` | Disable the control. _(boolean)_ |
| `no-clearing` | `false` | Remove the default bottom margin. _(boolean)_ |

**Methods:** `focus()`. **Events:** `input`, `change` (composed). **Parts:** `field`, `input`.

## Full Example

<div class="loomi-preview" data-label="Preview">
<loomi-number
  name="age"
  label="Age"
  size="big"
  transparent-icons="true"
  min="18"
  max="65"
  step="1"
  value="18"
></loomi-number>
</div>

```html
<loomi-number
  name="age"
  label="Age"
  size="big"
  transparent-icons="true"
  min="18"
  max="65"
  step="1"
  value="18"
></loomi-number>
```
