# 80 · Hints that read the student's work

Routes: `/student?stage=practice` (the warm-up), the mid-set practice overlay; `POST /api/help-chat` (the brief).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Hint.at?: number[]`: lines of the reference working written when the hint fits; absent = general |
| `lib/hint.ts` | `positionOf(problem, lines)`, `pickHint(problem, lines, shown)`: here → general → ahead → null |
| `lib/session.ts` | `hinted: Record<id, number[]>` (indices in the order shown); `run/hint` picks on the run's lines; `hydrateHinted` reads the id-list and count shapes too |
| `components/PracticePad.tsx` | Cards in the order given, all but the latest collapsed (tap to reopen, `reopened` state); menu row enabled only while `pickHint` has something |
| `components/HintCard.tsx` | The collapsed one-line form: eyebrow + truncated muted text, the card a button |
| `lib/helpChat.ts` | Each hint in the brief is tagged with where it fits |
| `data/practice.ts` | The fractions warm-up's five hints, `at: [0]`, `[1, 2]`, `[3]`, `[4]`, `[5]` |
| `lib/hint.test.ts`, `lib/session.test.ts` | `positionOf`, `pickHint` on every branch; the reducer with lines revealed and a late start; hydration of three shapes |

## How it connects

```
   pad strokes ─► DrawPad burst ─► nextLine(warmupScript) ─► run/reveal ─► run.lines[p.id]  (a prefix of p.steps)
                                                                                 │
   "I need help" ─► HelpMenu  hints.next = pickHint(p, lines, shown) !== null     │
        │  "hint"                                                                ▼
        ▼                                          positionOf: last line matches steps[k] ─► k+1 (0 on a blank pad)
   run/hint ─► pickHint(cur, lines, shown) ─────►  1. unshown hint with pos ∈ at        ("here")
                      │                            2. unshown hint with no at            ("general")
                      │                            3. first unshown hint with min(at) > pos  ("ahead")
                      │                            4. null  ─► menu: "None for this step" / "All shown"
                      ▼
   run.hinted[p.id] = [ …, i ]   (order shown)
                      │
   PracticePad   hints = shown.map(i => p.hints[i])
     ┌ Solve.  x/4 + x/2 − 6 = 9/2 ──────────┐   terms of every shown hint wrapped together (layout never moves)
     │ ▸ HINT 1  Get the like terms toget…   │   collapsed: tap → reopened
     │ ▾ HINT 2  To combine the [x terms]…   │   reopened: linked words live again
     │ ▸ HINT 3  One fraction on each si…    │
     │ ▾ HINT 4  Only the 3 in front of x…   │   the latest: always open
     │ [ I need help ]                       │
     └───────────────────────────────────────┘

   fractions hints  at:[0] move the 6 · at:[1,2] a denominator the x terms share · at:[3] one fraction · at:[4] clear the 4 both sides · at:[5] undo the 3
```

## Verified by

vitest (322 tests, ten new); eslint and tsc clean; `next build`; headless Chrome on the built app (port
3134, CDP 9392) driving the pen: blank pad → "move the 6"; one stroke burst (line 1 read) → the
common-denominator hint; three more bursts (four lines read) with nothing else asked → the
clear-the-4 hint, skipping the two before it; again → undo the 3; again → the row reads "None for
this step", disabled. Earlier cards report `data-collapsed`; tapping the second reopens it with its
linked words while the fourth stays open; the help button's bottom edge is inside the viewport.
