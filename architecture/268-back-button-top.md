# 268: Back buttons at the report's spot, level with its eyebrow

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/AssignmentContext.tsx` | `BACK_LEFT` now targets where the report's column starts on screen, `max(0, (100vw − 1476px) / 2) + 21.6px`, less this page's column start, over the button's zoom. |
| `app/teacher/report/TeacherReport.tsx` | The "← Class view" wrapper rises `marginTop: -28` (was -12) so the button's top is Class View's from the window, not from the bar. |
| `tickets/268-back-button-top.md` | The ticket. |

## How it connects

```
 window ─────────────────────────────────────────────────────────────────────
 │ Class View (frame 0.72)                 │ Report (frame 0.9)
 │ bar 47.1 px                             │ bar 58.6 px
 │                                         │   wrapper zoom 0.8, --back-zoom 0.72,
 │                                         │   marginTop −28 ◄268 (−20.2 on screen)
 │ ↕ 81.6 from the window top              │ ↕ 81.6 from the window top
 │ ◄ X ►[← Edexia Classroom]               │ ◄ X ►[← Class view]
 │         ┌ column (1181 px max) ┐        │ ◄ X ►11 METHODS · PROBLEM SET 5 …
 │         │ 11 METHODS · UNIT 1  │        │      (AC) Amelia Chen
 │         │ Class View           │        │
 │
 │ X = max(0, (100vw − 1476px) / 2) + 21.6px   (the report's column start) ◄268
 │ BackButton marginLeft = (X − this page's column start) / --back-zoom      = 0 on the report
```
