# 275: Class View roster: the note's new wording, Sam's extra Report link gone, his pill only while he works

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | `HolisticNote` (ticket 253) reads "Did you know? Clicking on a name opens that student's Holistic Assessment." with Dismiss and its stored dismissal unchanged. One line does not fit beside Dismiss (about 496 layout px against 338), so the text is `text-wrap: balance` over two lines, and a layout effect narrows the text span to its wider line (line extents from `Range.getClientRects`, divided by the frame's zoom), before paint, again when the web font is in and whenever the note's room resizes: a balanced block otherwise keeps the width it was offered, which left a blank run before Dismiss. The note is still absolutely placed over the Student head, starting where it did, so nothing on the roster moves. The live student's row no longer has the "Report →" link (`data-report-link`, to the old `/teacher/report`) under his name once his report was sent; the commentary line shows only for a caution chip or a sub line, so Sam's name block is one line and his name centres in the row like every other student's. His report is the row's "student report" button, as everyone's is. The live row's pill is `liveStudentTag`. |
| `lib/progress.ts` | `liveStudentTag(progress)`: the live student's roster pill: `progressTag` while he is on the set ("warming up", "Qn in progress"), "not started" before his first screen, `null` once handed in (it read "in progress" before), so his handed-in row reads like every classmate's. |
| `lib/progress.test.ts` | The pill for each kind of progress, and none for every handed-in stage. |
| `app/teacher/TeacherChrome.tsx` | Comment only: the individual view opens from a row's "student report" button, not a name. |

Nothing else linked to the removed link or the bare "in progress" pill: no test, `scripts/laptop-check.mjs` (which still loads `/teacher/report`, the redirect for old URLs, kept) or live click-through read them.

## How it connects

```
 /teacher/a/<set>/class ─► ClassView ─► TeacherLive (roster)
                                          │
        ┌─────────────────────────────────┴───────────────────────────────────────┐
        │ Student head                          │ Sam's row (live set)            │
        │  "STUDENT" ┌──────────────────────┐   │  (SO) Sam Okonkwo [Q1 in progress]
        │            │ Did you know? …opens │   │        │  └ pill: liveStudentTag  │
        │            │ that student's …     │   │        │    (none once handed in) │
        │            │             Dismiss  │   │        └ no "Report →" (removed)  │
        │            └──────────────────────┘   │   [see dot skills]              │
        │   balanced, text narrowed to its      │   [student report] ─────────────┼─► /teacher/a/<set>/report?student=sam
        │   wider line (layout effect)          │   [see history]                 │
        │              │ Dismiss                │                                 │
        │              ▼                        │         ▲                       │
        │   lib/holisticNote.ts (unchanged)     │         │ progress (sessionProgress)
        └───────────────────────────────────────┴─────────┼───────────────────────┘
                                                 lib/progress.ts
                                                   liveStudentTag ─► progressTag

 /teacher/report (old URL) ─► redirect ─► /teacher/a/pset-6/report   (kept; nothing on the roster links to it now)
```
