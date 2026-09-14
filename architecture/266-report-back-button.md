# 266: The student report's "← Class view" is the purple back button

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/AssignmentContext.tsx` | New `BackButton({ href, children, data-* })`: the dark purple, white-text way back (ticket 200's style). `BackToClassroom` now renders it to the Classroom. |
| `app/teacher/report/TeacherReport.tsx` | `ReportBody` puts `BackButton` → Class View above the eyebrow (not from history, where `back` holds the spot), zoomed back to Class View's scale and raised 12 px; the plain right-hand link is gone; the name row sits flush under the eyebrow. |
| `tickets/266-report-back-button.md` | The ticket. |

## How it connects

```
 app/teacher/AssignmentContext.tsx
   BackButton ◄266 (href, label) ── bg-accent-dark, white, 13.5 px
     ├──► BackToClassroom ──► Class View, Mistakes, Create, missing set   (unchanged on screen)
     └──► report/TeacherReport.tsx ReportBody ◄266
            ┌ TeacherChrome zoom = REPORT_ZOOM (0.9) ──────────────────────┐
            │ <div zoom = TEACHER_ZOOM / REPORT_ZOOM (0.8), marginTop -12> │
            │   [← Class view]  ──► assignmentHref(id, "class")            │  = Class View's
            │ </div>                                                       │    [← Edexia Classroom]
            │ ELEVEN METHODS · PROBLEM SET 5 …   (mt 9.6 px → 11.5 on screen)
            │ (AC) Amelia Chen                    (flush)                  │
            │ [ Skills … ]            [ Commentary ]                       │
            └──────────────────────────────────────────────────────────────┘
          EarlierReport (history, ticket 237) passes `back` → pulsing Return, no Class view button
```
