# 195: The Mistakes tab's stage group ends on the problem cards' right edge

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherMistakes.tsx` | The Mistakes tab; its title row now mirrors a problem row, so the stage group ends on the cards' right edge. |
| `app/teacher/DiagnosticPush.tsx` | The live diagnostic beside each problem; exports `DiagnosticFootprint`, the chip's unseen footprint. |
| `tickets/195-mistakes-stage-right.md` | The ticket. |

## How it connects

```
 TeacherMistakes (/teacher/a/<id>/mistakes)

 title row    ┌─ flex-1 ─────────────────────────────────────────┐ gap-4 ml-5 ┌──────────────────────┐
              │ Where students went wrong   [indiv working] 18/20 done [force submit] │            │ DiagnosticFootprint │ (unseen)
              └──────────────────────────────────────────────────┘            └──────────────────────┘
                                                                  ▲ same x
 problem row  [counts] ┌─ Card flex-1 ─────────────────────────────┐ gap-4 ml-5 ┌──────────────────────┐
                       │ Q1 ...                                    │            │ DiagnosticPush chip  │
                       └───────────────────────────────────────────┘            └──────────────────────┘

 DiagnosticPush.tsx
   ChipLabel ──┬──► chip button (in flow)
               └──► DiagnosticFootprint ──┬──► holds the chip's place while the flyout is open
                                          └──► TeacherMistakes title row (live sets only)

 ForceSubmit (inline) ── unchanged; its countdown grows leftward inside the right-aligned group
```
