# 191: A finished set's Class View has no Pathway card; the key's half note reads "incomplete"

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | Class View. The side column's Pathway card is now inside the existing `finished` guard, so a finished set's column starts with the Key. |
| `components/StatusKey.tsx` | The dot key shared by Class View and the student report; the half row's note is "incomplete". |
| `tickets/191-finished-class-view-trim.md` | The ticket. |

## How it connects

```
 /teacher/a/<id>/class ─► AssignmentProvider ─► TeacherLive
                                                   │ finished = assignment.kind === "finished"
                                                   ▼
                              ┌──────── side column ────────┐
                 live (pset-2)│ WholeClassCard (in use)     │ finished (pset-1)
                              │ Pathway card                │   ── (none) ──
                              │ GroupProgress · Diagnostic  │   ── (none) ──
                              │ Key ─► StatusKey            │ Key ─► StatusKey
                              └─────────────────────────────┘
                                                               ▲
 /teacher/a/<id>/report ─► TeacherReport ──────────────────────┘  half · incomplete
```
