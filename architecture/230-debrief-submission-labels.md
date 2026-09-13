# 230: The debrief's own panes say "Your first submission" and "Your second submission"

## Files touched

| File | What it does |
| --- | --- |
| `lib/debrief.ts` | `markedVersions` builds the debrief's panes; the student's two are now labelled "Your first submission" and "Your second submission". |
| `lib/debrief.test.ts` | Pins the pane labels, greens and marks. |
| `app/student/screens/GroupDebrief.tsx` | Renders the panes (doc comment only). |
| `tickets/230-debrief-submission-labels.md` | The ticket. |

## How it connects

```
 /student  stage "group"  →  GroupBoardScreen   →  GroupDebrief.tsx
                                                      │ markedVersions(problem, own, group, unsolved)
                                                      ▼
                                              lib/debrief.ts
   ┌ Your first submission ┐ ┌ Your second submission ┐ ┌ Group's rework ┐
   │ session.lines[q]  ◄230│ │ session.rework[q]  ◄230│ │ (or last try)  │
   └───────────────────────┘ └─ only if reworked ─────┘ └────────────────┘
   label → <Eyebrow> text, React key, data-version
```
