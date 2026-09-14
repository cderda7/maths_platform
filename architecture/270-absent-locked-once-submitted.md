# 270: Mark absent is disabled once the student has handed the set in

## Files touched

| File | What it does |
| --- | --- |
| `lib/absence.ts` | `absenceLocked(progress, absent)`: a present student whose progress is `submitted` cannot be marked absent; an absent student can always be marked present. Beside `canMarkAbsent` (whether the row offers the toggle at all). |
| `lib/absence.test.ts` | Every progress kind, absent and present. |
| `app/teacher/TeacherLive.tsx` | Each roster row gains `locked` from `rosterProgress` (the same progress that names the row's pill); the toggle is `disabled` with `ROW_DISABLED` (grey, no hover, same 96 px box), a "has handed this set in" tooltip and aria-label, and `data-absent-locked`. |

## How it connects

```
 lib/assignments.ts rosterProgress(set, session, now)
        │  per student: not-started | warming-up | working | submitted   (lib/progress.ts, ticket 185)
        ▼
 app/teacher/TeacherLive.tsx  (Class View roster)
   row.absent ◄── assignment.absent (lib/absence.ts absentOf, ticket 250)
   row.locked ◄── absenceLocked(progress, absent) ── lib/absence.ts
        │
        ▼
   under the name:  canMarkAbsent(kind, id)?  ──no──► no toggle (Sam on the live set)
                          │ yes
                          ▼
             locked? ──yes──► [ mark absent ]  disabled, grey, tooltip
                          │ no
                          ▼
             [ mark absent | mark present ] ─► dispatchClassroom("absence/set") ─► lib/classroom.ts reducer
```
