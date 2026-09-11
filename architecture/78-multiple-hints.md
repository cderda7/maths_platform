# 78 · Several hints per problem, one per ask; the fractions warm-up teaches like terms first

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay on `…?stage=working`; `POST /api/help-chat` (the brief).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Hint { text, terms? }`; `PracticeProblem.hints: Hint[]` replaces `hint` + `hintTerms` |
| `data/practice.ts` | Every problem's hint moved into `hints: [{ text, terms }]`; the fractions problem's new steps, `why` and two hints |
| `lib/session.ts` | `PracticeRun.hinted: Record<id, number>`; `run/hint` shows the next, no-op at the last; `hydrateHinted` converts a stored id list |
| `components/PracticePad.tsx` | Stacks the shown hints under the problem; wraps the terms of all shown hints together; the menu row's title and note |
| `components/HintCard.tsx` | One `Hint` + a label; lit term matched by identity |
| `lib/helpChat.ts` | The brief lists the hints in order |
| `lib/session.test.ts`, `lib/hint.test.ts`, `lib/warmup.test.ts`, `lib/helpChat.test.ts` | Updated and extended |

## How it connects

```
   data/practice.ts  PRACTICES[leaf].hints  [ {text, terms}, {text, terms} ]      (order = order given)
                                                  │
   lib/session.ts   run.hinted[p.id] = n   ◄── run/hint: n+1 while n < hints.length
                                                  │
   components/PracticePad.tsx
     hints = p.hints.slice(0, n)                  │
     terms = hints.flatMap(h => h.terms)  ───► termTex(p.tex, terms, litTerm) ───► <M>  (every shown hint's pieces boxed at once)
     ┌──────────────────────────────┐
     │ Solve.                       │
     │ x/4 + x/2 − 6 = 9/2          │
     │ ┌ HINT 1 ────────────────┐   │  ◄── HintCard(hints[0], "Hint 1")   hover "6" / "other side" / "x terms"
     │ └────────────────────────┘   │
     │ ┌ HINT 2 ────────────────┐   │  ◄── HintCard(hints[1], "Hint 2")   hover "x terms" / "common denominator" (4, 2 under the x's)
     │ └────────────────────────┘   │
     │ [ I need help ]              │  ──► HelpMenu({shown: n, total: 2})
     └──────────────────────────────┘        n=0: "hint · Show →"   n=1: "another hint · Show 2 of 2 →"   n=2: "another hint · All shown" (disabled)
                                                  │
   lib/helpChat.ts   helpChatSystem(p)  "The hints the pad already offers, in the order it gives them: 1. … 2. …"
```

## Verified by

vitest (317 tests); eslint and tsc clean; `next build`; headless Chrome on the built app (port 3134,
CDP 9392): the menu row's title/note/disabled state at 0, 1 and 2 hints shown; the two cards' text;
hovering "6" lights the 6, "x terms" both fractions, "common denominator" the 4 and the 2 under the
x's; the maths block's box is the same size after the second hint's terms are wrapped; screenshots.
