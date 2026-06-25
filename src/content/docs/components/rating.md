---
title: Rating
description: "<loomi-rating> — a 0–5 rating control as stars, hearts or thumbs-up. **Form-associated**: submits the rating under name."
---
<script type="module">
  import "@loomi/rating";
</script>

`<loomi-rating>` — a 0–5 rating control as stars, hearts or thumbs-up. **Form-associated**:
submits the rating under `name`.

```bash
npm install @loomi/rating lit
```

```js
import "@loomi/rating/loomi-rating.js";
```

## Basic Usage

<div class="loomi-preview" data-label="Preview">
<loomi-rating name="star-rating"></loomi-rating>
</div>

```html
<loomi-rating name="star-rating"></loomi-rating>
```

<div class="loomi-preview" data-label="Preview">
<loomi-rating type="heart" name="heart-rating"></loomi-rating>
<loomi-rating type="thumbsup" name="thumb-rating"></loomi-rating>
</div>

```html
<loomi-rating type="heart" name="heart-rating"></loomi-rating>
<loomi-rating type="thumbsup" name="thumb-rating"></loomi-rating>
```

Where there are multiple ratings on the same page, give each a unique `name`.

## Different Colors

Any loomi color works — the default is `orange`.

<div class="loomi-preview" data-label="Preview">
<loomi-rating rating="1" color="red" name="red-rating"></loomi-rating>
<loomi-rating rating="2" color="yellow" name="yellow-rating"></loomi-rating>
<loomi-rating rating="3" color="green" name="green-rating"></loomi-rating>
<loomi-rating rating="4" color="blue" name="blue-rating"></loomi-rating>
<loomi-rating rating="5" color="pink" name="pink-rating"></loomi-rating>
<loomi-rating rating="3" color="purple" name="purple-rating"></loomi-rating>
<loomi-rating rating="4" color="violet" name="violet-rating"></loomi-rating>
<loomi-rating rating="4" color="indigo" name="indigo-rating"></loomi-rating>
</div>

```html
<loomi-rating rating="1" color="red" name="red-rating"></loomi-rating>
<loomi-rating rating="2" color="yellow" name="yellow-rating"></loomi-rating>
<loomi-rating rating="3" color="green" name="green-rating"></loomi-rating>
<loomi-rating rating="4" color="blue" name="blue-rating"></loomi-rating>
<loomi-rating rating="5" color="pink" name="pink-rating"></loomi-rating>
<loomi-rating rating="3" color="purple" name="purple-rating"></loomi-rating>
<loomi-rating rating="4" color="violet" name="violet-rating"></loomi-rating>
<loomi-rating rating="4" color="indigo" name="indigo-rating"></loomi-rating>
```

## Different Sizes

<div class="loomi-preview" data-label="Preview">
<loomi-rating rating="2" size="small" name="small-rating"></loomi-rating>
<loomi-rating rating="3" size="medium" type="thumbsup" name="medium-rating"></loomi-rating>
<loomi-rating rating="2" size="big" type="heart" name="big-rating"></loomi-rating>
</div>

```html
<loomi-rating rating="2" size="small" name="small-rating"></loomi-rating>
<loomi-rating rating="3" size="medium" type="thumbsup" name="medium-rating"></loomi-rating>
<loomi-rating rating="2" size="big" type="heart" name="big-rating"></loomi-rating>
```

## Reacting to a Rating

<div class="loomi-preview" data-label="Preview">
<loomi-rating rating="2" name="album-rating"></loomi-rating>
<script type="module">
  document.querySelector('loomi-rating[name="album-rating"]').addEventListener("change", (e) => {
    console.log(e.detail.rating); // 1–5
    saveRating(e.detail.rating);
  });
</script>
</div>

```html
<loomi-rating rating="2" name="album-rating"></loomi-rating>

<script type="module">
  document.querySelector('loomi-rating[name="album-rating"]').addEventListener("change", (e) => {
    console.log(e.detail.rating); // 1–5
    saveRating(e.detail.rating);
  });
</script>
```

## Disabled / Read-Only Ratings

Not every rating needs to be interactive — display a rating the user already gave as
read-only by setting `clickable="false"`.

<div class="loomi-preview" data-label="Preview">
<loomi-rating rating="4" clickable="false"></loomi-rating>
</div>

```html
<loomi-rating rating="4" clickable="false"></loomi-rating>
```

## Form Submission

<div class="loomi-preview" data-label="Preview">
<loomi-rating name="album_rating" rating="3"></loomi-rating>
</div>

```html
<loomi-rating name="album_rating" rating="3"></loomi-rating>
```

```js
new FormData(form).get("album_rating"); // "3"
```

## Attributes

| Attribute | Default | Description |
| --- | --- | --- |
| `name` | _(blank)_ | Submitted with the form. |
| `rating` | `0` | Current rating (0–5). |
| `type` | `star` | `star` \| `heart` \| `thumbsup` |
| `color` | `orange` | Any loomi color. |
| `size` | `small` | `small` \| `medium` \| `big` |
| `clickable` | `true` | Allow changing the rating. _(boolean)_ |

**Event:** `change` (`detail: { rating }`).

## Full Example

<div class="loomi-preview" data-label="Preview">
<loomi-rating
  type="heart"
  name="album-rating"
  rating="3"
  color="yellow"
  size="big"
></loomi-rating>
</div>

```html
<loomi-rating
  type="heart"
  name="album-rating"
  rating="3"
  color="yellow"
  size="big"
></loomi-rating>
```
