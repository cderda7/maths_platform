# 73 · Offer callout: "Start the set" in the accent outline

Route: `/student?stage=confidence`, after a not-confident answer.

## Files touched

| File | What it does |
|---|---|
| `components/ui.tsx` | `Button` gains an `outline` variant: white fill, `border-accent`, `text-accent-deep`, `bg-accent-soft` on hover |
| `app/student/screens/ConfidenceScreen.tsx` | The callout's "Start the set" uses `outline` instead of `secondary` |

## How it connects

```
   data-warmup-offer (ticket 72)
     [ Warm up ]        accent fill, white text        ← unchanged, the one filled button
     [ Start the set ]  white fill, accent border,     ← was secondary (grey border, ink text)
                        accent-deep text
   Button variants: primary · secondary · outline (new) · ghost · accent · sky
```

## Verified by

eslint and tsc clean; `next build`; headless Chrome on the built app (port 3132): the decline button's
computed border colour is the accent indigo and its text the deep accent, the accept button's fill is
unchanged; screenshot of the settled callout.
