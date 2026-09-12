# 175 · Category history on the class view

Route: `/teacher` (the roster).

## Files touched

| File | What it does |
|---|---|
| `lib/history.ts` (new) | `historyFor(student, category, today)`: five `HistoryPoint`s (`date`, `status`), oldest first, on `HISTORY_DATES` (Aug 31 · Sep 2 · Sep 3 · Sep 7 · Sep 9, the same for everyone). Simulated: a seed from the student and category (FNV-1a, then mulberry32) picks one of a few five-pill mixes for today's status and shuffles it, so every reload shows the same five. Red today → red and orange; orange → mostly orange, some red, some light green; light green → orange, light green and dark green; dark green → mostly dark green, some light green; hollow → the orange mix. `ALL_SECURE_STUDENT` (Priya) is dark green on every set. |
| `lib/history.test.ts` (new) | The dates and determinism; the mix rules for every classmate and category, never a hollow point; variety between students and categories; Priya dark green today in every column and behind. |
| `app/teacher/TeacherLive.tsx` | `history` state (`{ student, open }`), `openHistory` / `toggleHistory` / `leaveHistory`; the row's three-button stack (`ROW_BUTTON`: leading-none, 1.5 px vertical padding, 2 px gaps, 46 px in all, so no row grows), **see history in…** / **close history**; `HistoryPill` (the named pill and, open, the five dated pills stacked above it at z-30); `HistoryBlocker` (the cream, measured from the table by ResizeObserver, drawn beside the card in a new `relative` box at z-25); the fade (`opacity-30` tbodies, `[&>th>*]:opacity-30` heads with `pointer-events-none`, the footer); `data-set-head` on the Set head, `data-due-line` on the "due" line; the `UNIT 1` label skipped in history mode. |

## How it connects

```
 /teacher                                              TeacherLive.tsx
 ┌ Eyebrow · H1 Class View ───────────────────────────────────────────────────────────────────┐
 │ ROOTS OF A QUADRATIC — SET 3 · due Thu 10 Sep   <p data-due-line ref=dueRef>                │
 │                                        ┌── cream (row 1 or 2: top on the due line's midline) │
 │ <div class=relative ref=rosterRef>     │                                                     │
 │   HistoryBlocker (z-25, while any history is open)   ← measures table by ResizeObserver      │
 │   Card overflow-clip                   │                                                     │
 │   ┌ thead (sticky z-20; contents opacity-30 in history mode, inert) ──────────────────────┐ │
 │   │ STUDENT        ALGEBRA FUNCTIONS GRAPHING COMMUNICATION REASONING NEW SKILLS CONF SET │ │
 │   ├ tbody Sam    (opacity-30)  [pill] … ────────────────────────────────────────────── … ┤ │
 │   ├ tbody Priya  (opacity-30)  [pi▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒]  │  ← cream top on a pill's midline
 │   ├ tbody Jordan (opacity-30)  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  │     wide part: Algebra head → Set head
 │   ├ tbody Tomas ───────────────▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒─────────────┤ │  ← apron: category columns, row top → pills − 2
 │   │  TR Tomas Reyes  [see dot skills]  AUG 31             AUG 31                          │ │
 │   │                  [student report]  SEP 2              SEP 2      HistoryPill (z-30):   │ │
 │   │                  [close history ]  SEP 3              SEP 3      stack absolute        │ │
 │   │                                    SEP 7              SEP 7      inset-x-0 bottom-full │ │
 │   │                                    SEP 9              SEP 9      → dates the name's    │ │
 │   │                                   [ALGEBRA] [FUNCTIONS] [GRAPHING] [COMMUNICATION] …   │ │    width exactly
 │   │  ┌ drill row (see dot skills) — stays open beside history ───────────────────────────┐ │ │
 │   ├ tbody Zara   (opacity-30) ……                                                          ┤ │
 │   └ footer (opacity-30) ─────────────────────────────────────────────────────────────────┘ │
 └────────────────────────────────────────────────────────────────────────────────────────────┘

 click "see history in…" ─▶ openHistory(id): setColumn(null); another student's drill closed; history = { student, open: [] }
 click a named pill      ─▶ toggleHistory(c)                          (in history mode; else the category drill as before)
 click another row / its pill / the cream ─▶ leaveHistory(): history = null, nothing else
 click "close history"   ─▶ history = null
 historyFor(student, c, todayStatus)  lib/history.ts  ─▶ five { date, status }, oldest first
```

Was: two row buttons (see dot skills · student report); a pill click only ever opened the category drill; no past results anywhere on the roster.

## Verified by

vitest (479), eslint, tsc, `next build`, `check:laptop` against this build (16 route/size checks, no sideways overflow); `history175.mjs` (session `d86e608c-…`'s scratchpad, app on 3361 / CDP 9661, 154 checks at 1400 × 1000 and 1280 × 800): three 96 × 14 row buttons in a 46 px stack and no row taller than before; Tomas's drill open, then history: both, every other row, the heads and footer at 30 %, six named pills 13 px tall and ≥ 56 wide inside their columns with 2 px clear, centred where the pills were, white text (muted on his hollow Reasoning), the UNIT 1 label gone, no row moved; Algebra then Graphing: two stacks of five dated pills (Aug 31 → Sep 9) the named pill's width and left, 2 px apart, no hollow point; the cream from Algebra's head to Set's, its wide part ending at Tomas's row top, its top on Jordan's pill midline, the apron from the row top to 2 px above the pills over the category columns, the confidence cell clear, the stacks wholly on cream; Algebra again closes alone; the drill closing and reopening under the history; Zara's row click leaves the mode, opens nothing, un-fades; close history closes all; the cream click leaves; a column view closes on entry; Amelia's pill click opens history, no drill; Sam (row 1) and Priya (row 2): heads covered whole, the cream's top on the due line's midline above the card, nothing scrolled, Priya dark green throughout, Sam's hollow pills with coloured history; Jordan (row 3) cuts Sam's pill halfway and his red Algebra has only red and orange behind; scrolled 400, the cream over the stuck heads where they meet. Screenshots at both sizes (two histories with the drill, Sam, Priya, scrolled) read by eye.
