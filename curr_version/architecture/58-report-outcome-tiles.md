# 58 · The student report says where each problem ended up as tiles in a column per review stage; Starred goes; the reflection is required

Routes: `/student?stage=report` (add `&pathway=none`, `indiv`, `indiv,group`, `group,wc` … to see the columns change; `&run=strong` for a clean run).

## Files touched

| File | What it does |
|---|---|
| `lib/report.ts` | New `Outcome` (`first` / `individual` / `group` / `wrong`), `OUTCOME_LABEL`, `problemOutcome(session, problem, pathway, run)` and `outcomeColumns(session, pathway, run, problems)`. A version "holds" when it has a line and none is wrong. The first outcome that applies wins; a stage absent from the pathway never yields its outcome and has no column |
| `lib/session.ts` | `report/send` is a no-op while the trimmed reflection is empty |
| `app/student/screens/ReportScreen.tsx` | The What happened card is a grid of `columns.length` columns, each a label two lines tall and a wrapped list of `Q1` tiles tinted by outcome; the Starred card is gone; the reflection block sits at the bottom of the aside above a button that is `disabled` until something is written and always reads "Send to <teacher>". Reads the pathway with `pathwayOf(classroom)` and the run from `classroom.group` |
| `lib/report.test.ts` | Outcome columns for the reworked demo, for a strong run, for an unattempted set, per pathway, with and without a group run; `report/send` with nothing / whitespace / text |

## How it connects

```
   classroom store ─── pathwayOf(classroom) ──┐        session.lines  (handed in)
                  └── classroom.group ────────┤        session.rework (after individual review)
                            (GroupRun)        │        run.resolved   (the group's check)
                                              ▼               │
                                   lib/report.ts              │
                                   problemOutcome ◀───────────┘
                                     first ▶ individual ▶ group ▶ wrong   (first match wins,
                                                                          a stage only if in the pathway)
                                   outcomeColumns
                                     ["first", individual?, group?, "wrong"] → { id, label, problems[] }
                                              │
                                              ▼
                             app/student/screens/ReportScreen.tsx
                             ┌──────────────────────────────────────────┐   ┌───────────────────┐
                             │ SkillColumns (ticket 57)                 │   │                   │
                             ├──────────────────────────────────────────┤   │   (empty above)   │
                             │ WHAT HAPPENED                            │   │ REFLECTION        │
                             │ Correct   Correct after  Correct  Incor- │   │ [textarea]        │
                             │ first try indiv review   after grp rect  │   │ n sentences       │
                             │ [Q4][Q5]  [Q1][Q2][Q3]   None     None   │   │ [Send to Ms O.]   │
                             │ [Q6][Q8]  [Q7][Q10]                      │   │  disabled until   │
                             │ [Q9]                                     │   │  written          │
                             └──────────────────────────────────────────┘   └───────────────────┘
                                                                                    │ report/send
                                                                                    ▼
                                                                         lib/session.ts reducer
                                                                         reflection empty → same state
```

## Verified by

vitest (280 tests); eslint and tsc clean; `next build`. A headless-Chrome run of the built app on
port 3115 opened the report with `pathway=indiv,group` (four columns: Q4 Q5 Q6 Q8 Q9 / Q1 Q2 Q3 Q7
Q10 / None / None), `pathway=none` (two), `pathway=indiv` (three) and `run=strong` (all ten in
the first column). "Starred" and "Optional" are absent; the send button starts `disabled` at
opacity 0.4 and a click leaves no `[data-sent]`; after a reflection is typed it is enabled at
opacity 1 and one click shows "Sent to Ms Okafor". The tile rows of every column start on the
same line whether the label wraps or not.
