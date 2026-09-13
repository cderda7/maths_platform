# 200: The way back to the Classroom is a dark purple button

## Files touched

| File | What it does |
| --- | --- |
| `app/globals.css` | Design tokens; adds `--color-accent-dark` (#2f2491), the darkest step of the accent family. |
| `app/teacher/AssignmentContext.tsx` | The assignment context and `BackToClassroom`, now a dark purple box with white text and the arrow. |
| `tickets/200-back-to-classroom-button.md` | The ticket. |

## How it connects

```
 app/globals.css
   --color-accent-dark ──► bg-accent-dark
   --color-accent-deep ──► hover:bg-accent-deep
                                │
                                ▼
 app/teacher/AssignmentContext.tsx
   BackToClassroom  ┌──────────────────────┐
                    │ ← Edexia Classroom   │ ──click──► /teacher (Classroom)
                    └──────────────────────┘
        │
        ├──► AssignmentProvider   ("Not in the Classroom")
        ├──► TeacherLive          (Class View)
        ├──► TeacherMistakes      (Mistakes tab)
        ├──► TeacherGroups        (set groups, class default groups)
        ├──► CreateAssignment / BlankStart
        └──► ReviewAssignment     (Create's review)
```
