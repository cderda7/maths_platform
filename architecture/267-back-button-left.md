# 267: Every back button pinned to the window's left edge

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/AssignmentContext.tsx` | `BACK_LEFT`: the CSS `calc` left margin that puts `BackButton` 21.6 screen px from the window's left edge; `BackButton` applies it. |
| `app/teacher/TeacherChrome.tsx` | The frame's root sets `--frame-zoom` and `--back-zoom` to its zoom beside `zoom` itself. |
| `app/teacher/report/TeacherReport.tsx` | The "← Class view" wrapper (zoom 0.8 inside the 0.9 frame) sets `--back-zoom: 0.72`. |
| `tickets/267-back-button-left.md` | The ticket. |

## How it connects

```
 TeacherChrome ◄267  style: zoom, --frame-zoom = zoom, --back-zoom = zoom
   main [data-teacher-scroll]                        (full window width)
   │
   │◄ 21.6 px ►┌──────────────────┐
   │           │← Edexia Classroom│  BackButton ◄267 marginLeft = BACK_LEFT
   │           └──────────────────┘
   │     ┌ mx-auto max-w-[1640px] px-6 ─── the page's column ───────────┐
   │     │ ELEVEN METHODS · …                                           │
   │     │ Class View / table / Mistakes / Create …                     │
   │     └──────────────────────────────────────────────────────────────┘
   │
 BACK_LEFT (in the button's px, every length × its zoom, 100vw included)
   = ( 21.6  −  max(0, (100vw − 1640 · frame-zoom) / 2)  −  24 · frame-zoom ) / back-zoom
               └──────── where the column starts on screen ─────────────┘

 callers: BackToClassroom ── TeacherLive, TeacherMistakes, TeacherGroups, AssignmentProvider,
                             CreateAssignment, BlankStart, ReviewAssignment   (back-zoom = 0.72)
          report ReportBody ── <div zoom 0.8, --back-zoom 0.72> BackButton "Class view"  (frame 0.9)
```
