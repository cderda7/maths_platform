# 340: A × closes the live diagnostic box

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/DiagnosticPush.tsx` | New `FlyoutClose({ problemId, top })`: an absolute 32 px × at `right-4`, `top` given per card so it centres on that card's first row; press → `setFlyoutOpen(problemId, false)`. `DiagnosticOverlay`'s card and `DiagnosticPush`'s flyout card become `relative` and render it; the overlay's header row gains `pr-10`. |
| `tickets/340-…`, `ARCHITECTURE.md` | Docs. |

## How it connects

```
 app/teacher/TeacherMistakes.tsx
   │ split (individual working)            │ not split (after working)
   ▼                                       ▼
 DiagnosticOverlay                     DiagnosticPush flyout
 ┌──────────────────────────────┐      ┌────────────────────────┐
 │ LIVE DIAGNOSTIC Q1 Solve…  × │◀┐    │ [Live diagnostic ›]  × │◀┐
 │ 1 · FIND THE PAIR            │ │    │ 1 · FIND THE PAIR      │ │
 │ …                            │ │    │ …                      │ │
 └──────────────────────────────┘ │    └────────────────────────┘ │
                                  └──── FlyoutClose ──────────────┘
                                             │ press
                                             ▼
                          app/teacher/diagnosticFlyout.ts
                          setFlyoutOpen(problemId, false)
                          (same store Escape, a press outside,
                           the pointer leaving and the chip use)
```
