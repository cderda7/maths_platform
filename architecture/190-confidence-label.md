# 190 · Every confidence label legible in Class View's Confidence column

Routes: `/teacher/a/<id>/class` (Problem Set 1 and Problem Set 2).

## Files touched

| File | What it does |
|---|---|
| `lib/report.ts` | `confidenceForms(label)` (replaces `confidenceLines`): the ways a label can be written, longest first: every named skill in full, each skill alone with the rest counted ("+1"), then "low +n". `ConfidenceForm = { words, hidden }`. Pure. |
| `lib/report.test.ts` | `confidenceForms` for plain words, one skill, two skills, and a label built by `confidenceLabel`. |
| `app/teacher/TeacherLive.tsx` | `ConfidenceCell` lays out every form unseen inside the cell, picks the first that fits the cell's width and `CONFIDENCE_LINES` (3) lines of 17 px, re-measures on resize; `ConfidenceWords` keeps each word unbroken and the "+n" muted; a shortened label carries `title` and an `sr-only` full label. The cell's side padding `px-1`. `FitText` no longer imported here. |
| `tickets/190-confidence-label.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md` | The ticket, the decision, the two shrink notes marked done and what was deferred. |

## How it connects

```
 data/classmates.ts, data/pset1/classmates.ts      lib/report.ts
   Classmate.confidence ("low: fractions, …")        confidenceLabel(Sam's session.confidence)
                  │                                         │
                  └──────────────┬──────────────────────────┘
                                 ▼
          app/teacher/TeacherLive.tsx  rows[].confidence.text
                                 │
                                 ▼
          ConfidenceCell(label) ── confidenceForms(label) ──► [full, A +1, B +1, low +2]
                 │
                 ├─ every form as an invisible absolute probe (same width, same font)
                 ├─ useLayoutEffect + ResizeObserver: first probe with
                 │    scrollWidth ≤ clientWidth and height ≤ 3 × 17 px
                 └─ shows that form (ConfidenceWords), "+n" muted,
                    title + sr-only = the whole label
                                 │
                                 ▼
          td[data-confidence]  (84 px column, row height unchanged)
```
