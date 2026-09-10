# 50 · Feedback summary chips and level column labels

Route: `/student` at the `feedback` stage (the "indiv review" skip).

## Files touched

| File | What it does |
|---|---|
| `lib/feedback.ts` | `FeedbackSummary` gains `head` (the count clause, "5 of your problems contain a mistake.") and `hint` (the first `HINT_CAP` leaves). New `summaryParts(count, subskills, version)` builds head, hint and the joined `sentence` in one place; `summarySentence` is now a one-line wrapper over it and `feedbackSummary` spreads the parts into its result. `sentence` is unchanged, so the group-stage `notice` in `lib/session.ts` and every existing test read the same string |
| `app/student/screens/FeedbackScreen.tsx` | The summary `Card` (now carrying `data-summary`) holds two paragraphs: `summary.head` as prose, then, when there is a hint, a `flex-wrap` row (`data-hint`) of the word "Double-check" and one `LeafChip student` per leaf, overridden to `!bg-accent-deep !border-accent-deep !text-white`. The pad is `PadSection title="If needed, correct it here" padded={false}` |
| `components/PadSection.tsx` | New `padded` prop (default `true`): `false` drops the section's `px-6 py-6` so the pad's eyebrow starts where a neighbouring column's does. The header row is `items-start` with the Undo / Clear group at `-mt-2.5`, so the eyebrow's top edge is the row's top edge and the buttons' text stays centred on it; the working, frozen, group-board, smart-board and teacher-board pads keep their inset and look the same |
| `lib/feedback.test.ts` | One new case: the scripted run's `head` and three-leaf `hint`; `summaryParts` for a clean run and for a `final` run with no leaves |

## How it connects

```
 StudentSession ──▶ feedbackSummary(session, "original", problems)
                       │  count · subskills (first-occurrence order)
                       ▼
                    summaryParts(count, subskills, version)
                       ├─ head      "5 of your problems contain a mistake."
                       ├─ hint      [monic, nonmonic, nfl]   (≤ HINT_CAP)
                       └─ sentence  head + " Double-check a, b and c."  ──▶ lib/session.ts notice (group stage)

 FeedbackScreen
   ├─ aside
   │    Card tone="soft" [data-summary]
   │      ├─ <p> head
   │      └─ <p data-hint flex-wrap> "Double-check" · LeafChip×hint  (bg accent-deep #4535c8, text white)
   │    problem list · Hand in
   └─ section  grid-cols-[220px_1fr_230px] gap-3
        ├─ col 1  Eyebrow "What you submitted" ─────────────── y = 230
        ├─ col 2  PadSection padded={false}
        │           header items-start: Eyebrow "If needed, correct it here" ─ y = 230
        │                               [Undo] [Clear] at -mt-2.5 (text centred on the eyebrow)
        │           DrawPad
        └─ col 3  ReadAs  Eyebrow "Read as" ─────────────────── y = 230
```

## Verified by

vitest (268 tests, one new); eslint and tsc clean; a headless-Chrome run of the built app on
port 3117 at `/student?stage=feedback`: three `[data-hint] [data-leaf]` chips reading
"factorising", "non-monic factorising", "null factor law" with background and border
`rgb(69, 53, 200)` and text `rgb(255, 255, 255)`; the three eyebrows all at `top: 230`; the pad's
label text "If needed, correct it here". At `/student?stage=working` the "Your working" eyebrow and
the Undo button share a vertical centre (158.75 vs 158.6).
