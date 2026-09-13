# 216: The Classroom pins its heading and the Live card; Past scrolls

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/Classroom.tsx` | The Classroom page. The eyebrow, title row and Live section are one sticky region (`data-classroom-pinned`, cream, out over the chrome's padding so nothing moves at scroll 0); Past follows in flow and scrolls under it. The region's height feeds `--classroom-pinned`, each card's `scroll-margin-top`, so a focused card lands below the edge. With nothing live the Live section is gone and Past opens in its place. |
| `lib/classroomCards.ts` | `dueOrder` (a due date's place in the year) and `newestFirst` (stable sort); `sectionCards` sorts each section newest due first. |
| `lib/classroomCards.test.ts` | The sort across six sets given out of order (ties kept) and `dueOrder`. |
| `tickets/216-classroom-pinned-live.md` | The ticket. |

## How it connects

```
 TeacherChrome (zoom 0.72)
 ┌──────────────────────────────────────────────────────────────┐
 │ header (never scrolls)                                        │
 ├──────────────────────────────────────────────────────────────┤
 │ main[data-teacher-scroll]  ── the one scroll region ──────┐   │
 │   div.py-12.px-6                                           │   │
 │   Classroom                                                │   │
 │   ┌─ data-classroom-pinned (sticky top-0, bg-cream) ──────┐│   │
 │   │  -mt-12 pt-12 / -mx-6 px-6: covers the chrome padding ││   │
 │   │  eyebrow · Edexia Classroom · + New assignment        ││   │
 │   │  LIVE · Problem Set 6 card        (only when live)    ││   │
 │   │  pb-10 (pb-12 with nothing live) = Past's old gap     ││   │
 │   └──────────────── clean edge ───────────────────────────┘│   │
 │   PAST                           ▲ scrolls under the edge  │   │
 │   card (newest due) ... card (oldest)                      │   │
 │     scroll-margin-top: var(--classroom-pinned)  ◄── ResizeObserver
 └────────────────────────────────────────────────────────────┘   │

 classroomCards(classroom, session, now)
   └─► sectionCards ─► assignmentCard per bundle ─► newestFirst (dueOrder)
         └─► { live, past } ─► Classroom
```
