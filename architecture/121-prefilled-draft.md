# 121 · The create screen opens prefilled with the demo set

Route: `/teacher/assignments/create`, first load or after Reset demo.

## Files touched

| File | What it does |
|---|---|
| `data/draft-seed.ts` | The demo teacher's draft as typed: `DEMO_PASTE_LINES` (ten lines in the editor's shorthand; Q1 `x**2 + 5x + 6 = 0` and Q9 `(x+1)(x-4) = 6` differ from the bank on purpose for ticket 120's recommendations), `DEMO_PASTE` (joined), `DEMO_DRAFT_TITLE`. Shared with the review step. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | `storedOrSeed()`: the store's draft when there is one (even an emptied one), else the seed with ids `seed-1…10`. The editor's `useState` initialisers read it; the existing save effect writes the seed to the store on mount, so a reload and the review stub see it. |
| `lib/mathInput.test.ts` | The seed against `PROBLEMS`: stems and expressions match for the eight lines that should, the two differences asserted by value. |
| `README.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` | The walkthrough's create step, the row, the decision, the deferred from-nothing flow. |

## How it connects

```
 first load                      getClassroom().draft
 ───────────▶ storedOrSeed() ──┬── draft present (even { questions: [] }) ──▶ as stored
                               └── none (fresh store, Reset demo) ──▶ { DEMO_DRAFT_TITLE, DEMO_PASTE_LINES as seed-1…10 }
                                                                              │
                     Editor useState(title), useState(qs = withGhost(…)) ◀────┘
                              │ (mount) save effect ──▶ dispatch draft/set ──▶ store ──▶ reload, ReviewStub, ticket 120
                              ▼
 ┌ Q1 ────────┐ ┌ Q2 ─┐ … ┌ Q9 ──────────┐ ┌ Q10 ─┐ ┌ Q11 (ghost) ┐
 │ x²+5x+6=0  │ │     │   │ (x+1)(x−4)=6 │ │      │ │ Type a …    │   ◀ the caret in the ghost, Continue on
 └────────────┘ └─────┘   └──────────────┘ └──────┘ └─────────────┘

 data/draft-seed.ts ◀── also the paste the review step's fixture uses (ticket 120: import, do not copy)
```

## Verified by

vitest (377), eslint, `next build`; the ticket 119 click-through extended (`create.mjs`, 35 checks): a cleared store loads the ten tiles and the ghost with the title filled and the seed already in the store, Continue on; the draft emptied by hand loads as one ghost and the whole blank flow of ticket 119 still passes from there; at the end a cleared store reseeds. Screenshot `00-seeded.png`.
