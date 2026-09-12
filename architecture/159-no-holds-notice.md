# 159 · No "Every problem holds now." notice after a clean rework

Route: `/student` (the screen after the rework is handed in: class wait, group review, or the report, by pathway).

## Files touched

| File | What it does |
|---|---|
| `lib/session.ts` | `reworkNotice(s)`: the final version's summary sentence while its count is above zero, `null` when every problem holds. Read by `rework/done` and by `advance/apply` for the teacher's `force-review` on a student still correcting. |
| `lib/session.test.ts` | Q7 reworked with the model solution hands in with `notice: null`, by the student's press and by the force review. |
| `lib/feedback.test.ts` | A blank problem finished with a slip still hands in with no notice (the "final" sentence is unchanged; the notice is not). |

## How it connects

```
 sessionReducer (lib/session.ts)
   ├─ rework/done ─────────────────────┐
   └─ advance/apply · force-review ────┤   both: stage = nextStage(pathway, "reworked"), reworkedAt, notice
                                       ▼
                              reworkNotice(s)
                                │  feedbackSummary(s, "final")   (lib/feedback.ts, unchanged)
                                │     count > 0 → "N of your problems still contain a mistake. Double-check …"
                                │     count = 0 → null            ← was "Every problem holds now."
                                ▼
                      session.notice ──► StudentApp [data-notice] pill over the next screen (only when non-null)
```

## Verified by

vitest (452), eslint, tsc, `next build`; `notice159.mjs`: `/student?stage=feedback&run=strong`, Hand in → the waiting screen, no `[data-notice]`, "holds now" nowhere on the page; `/student?stage=feedback` (the weak run), Hand in → "5 of your problems still contain a mistake. Double-check factorising, non-monic factorising and null factor law.", ✕ clears it.
