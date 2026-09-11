# 72 · The offer callout: the pitch, the count, and the attention cues

Route: `/student?stage=confidence`, after a not-confident answer.

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` (+ test) | `offerLines(confidence)`: the question naming the ticked skills in tick order ("Warm up on factorising & the discriminant first?", or "Warm up before the set?" with none) and the size line ("2 short problems, then the set"; "a few short problems, then the set" with none), reusing the chat's `skillWord` and `amp` |
| `app/student/screens/ConfidenceScreen.tsx` | The two buttons from ticket 71 sit in a callout card (`data-warmup-offer`, `role="group"`) with the two lines above them. It is `absolute`, right-aligned, its bottom 60 px above the row's bottom (the 48 px empty Submit spot plus a 12 px gap), so it floats over the dimmed list and nothing reflows. The answer list gets `opacity-50` with a 300 ms fade as well as `pointer-events-none` |
| `app/globals.css` | `offer-rise` (14 px up and fade in, 200 ms, ease-out) on `.offer-in`; `offer-pulse` (a 14 px accent ring fading out, 650 ms, 240 ms after) on `.offer-in::after`, on its own layer so the card keeps its lift shadow after; both off under `prefers-reduced-motion`. No `position` in the rule: unlayered CSS would beat the `absolute` utility |
| `FUTURE_FEATURES.md`, `DECISION_LOG.md` | The teacher switch, the mid-set re-offer, the un-submit, the chat exit, the duration line, the covered rows; the fork-on-the-same-screen decision |

## How it connects

```
   ConfidenceScreen, answered ≠ null (warmupOffered(session))

   ┌─ data-answers ──────────────────────────────────┐   opacity 0.5 (300 ms), pointer-events none,
   │ ○ confident                                     │   shows session.confidence, not the draft
   │ ○ not confident                                 │
   │ ● not confident with…                           │
   │     ☐ null factor law   ☑ factorising  …        │
   │                          ┌─ data-warmup-offer ──────────────────────┐
   │                          │ Warm up on factorising & the discriminant │ ← offerLines(answered).question
   └──────────────────────────│ first?                                    │
                              │ 2 short problems, then the set            │ ← offerLines(answered).size
                              │              [ Warm up ] [ Start the set ] │ → warmup/accept | warmup/decline
                              └──────────────────────────────────────────┘
                                          ↑ .offer-in: rises 14 px + fades in (200 ms)
                                          ↑ ::after: one accent ring, 14 px, gone by ~900 ms
                                                        ── 12 px gap ──
                                            [ data-submit-spot, 48 px, empty ]  ← where Submit stood

   lib/warmup.ts  offerLines
     low-when, leaves [a, b]   → "Warm up on a & b first?"        · "2 short problems, then the set"
     low-when, leaves [a]      → "Warm up on a first?"            · "1 short problem, then the set"
     low | low-when, leaves [] → "Warm up before the set?"        · "a few short problems, then the set"
```

## Verified by

vitest (309 tests, two new for `offerLines`); eslint and tsc clean; `next build`. Headless Chrome on
the built app (port 3131), sampled through the motion: 60 ms after Submit the callout is mid-rise
(opacity below 1, a translate on it); at 360 ms the `::after` ring is an 8 px accent shadow; at
1060 ms opacity 1, no transform, the ring fully transparent and the card's own shadow intact. The
answer list stays exactly where it was (its bottom edge unchanged at 758.5 px), at opacity 0.5 with
pointer events off; the callout's bottom edge is 12 px above the empty spot. Lines read "Warm up on
factorising & the discriminant first?" / "2 short problems, then the set" for two ticks and "Warm
up before the set?" / "a few short problems, then the set" for plain "not confident"; "Warm up"
from the plain answer opens the chat with the open question. Screenshots before Submit, mid-rise,
mid-pulse and settled.
