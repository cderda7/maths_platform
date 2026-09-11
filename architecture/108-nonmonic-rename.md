# 108 · The non-monic skill is "Non-monic factorisation"

Route: `/student?stage=working` (Q2 or Q7, "I need help"), and every screen that shows a leaf's full name.

## Files touched

| File | What it does |
|---|---|
| `data/taxonomy.ts` | The `algebra.expand-factor.nonmonic` leaf is `leaf("Non-monic factorisation", "non-monic factorising", …)`: the full name changed, the short form, description and id as before. |

## How it connects

```
 data/taxonomy.ts
   nonmonic: leaf(name: "Non-monic factorisation", short: "non-monic factorising")
        │                                                  │
        │ studentLeafName(id).name                         │ studentLeafName(id).short
        ▼                                                  ▼
   HelpPicker "Which skill?" row (PracticePrompt.tsx)    feedback summary chips (lib/feedback.ts)
   ConfidenceScreen, PeerScreen (lower-cased)            confidence copy ("low: …, non-monic factorising")
   warm-up chat "Let's start with ___." (lib/warmup.ts)  mistakes pills, class-view columns
   help chat prompt (lib/helpChat.ts)
```

The `short` form is the one in sentences and chips and is unchanged, so every test and fixture that quotes "non-monic factorising" still holds. The sibling leaf "Monic trinomials" is untouched (see FUTURE_FEATURES.md).

## Verified by

vitest (340), eslint, tsc, `next build`; a headless click-through (`picker.mjs`) of Q2's "I need help" picker, which lists "Non-monic factorisation", "Null factor law", "Fractions", with a screenshot.
