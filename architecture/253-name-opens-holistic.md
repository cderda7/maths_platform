# 253: A student's name in Class View opens their holistic page, with a one-time "did you know?"

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/TeacherLive.tsx` | The roster's name and both avatars (the leading one and the closing one, ticket 136) are `Link`s to `holisticHref(student, set)`, `/teacher/a/<set>/students/<id>`; the name is the one a keyboard reaches, the avatars are `tabIndex=-1` and hidden from screen readers. Same boxes as before (the name keeps its 141 px slot, each avatar link is a flex item), so no row moves. Hover: the name takes the accent's ink, an avatar a ring. In another student's history mode a name or avatar press leaves history mode, as any press on that row does. `HolisticNote`: "Did you know? A name opens that student's Holistic Assessment, also in Edexia Classroom." with Dismiss, laid absolutely over the Student head's blank space right of its label, inside the sticky head. The row's "student report" button and "mark absent" are untouched. |
| `lib/holisticNote.ts` (new) | `HOLISTIC_NOTE_KEY` (`edexia-demo-holistic-note-dismissed`, outside the demo's `edexia-maths-demo/…` keys, so Reset demo leaves it); `isNoteDismissed(storage)`, `dismissNote(storage, at)` (blocked storage tolerated); `useHolisticNote()` through `useSyncExternalStore` (`null` on the server and first render, so a dismissed note never flashes; the storage event carries another tab's change); `dismissHolisticNote()`. |
| `lib/holisticNote.test.ts` (new) | Shows until dismissed, stays dismissed, clearing the key brings it back, its own key, blocked storage. |

## How it connects

```
 /teacher/a/<set>/class ─► ClassView ─► TeacherLive (roster)
                                          │
        ┌─────────────────────────────────┼───────────────────────────────────────┐
        │ Student head                    │ each row                              │
        │  "STUDENT" [Did you know? … ]   │  (avatar) Name  [pill]   … pills …  (avatar)
        │            └ Dismiss            │     │      │  └ mark absent (250, untouched)   │
        │                 │               │     └──────┴───────────────┬────────────┘
        ▼                 ▼               │                            │ Link, holisticHref(id, set)
 lib/holisticNote.ts                      │                            │ (in another's history mode:
   useHolisticNote() ◄── storage event    │                            │  leaves history instead)
   dismissHolisticNote() ─► localStorage  │                            ▼
     "edexia-demo-holistic-note-dismissed"│          /teacher/a/<set>/students/<id>
        ▲                                 │            HolisticPage (251)
        │ never touched by                │              ← Class View ─► /teacher/a/<set>/class
 components/ResetDemo ─► resetSession()   │              set header ─► /teacher/a/<set>/report?student=&from=
   (edexia-maths-demo/classroom/v1,       │                (the per-assignment report, still also the row's
    edexia-maths-demo/session/v1 only)    │                 "student report" button)
                                          │
 app/teacher/Classroom ── Holistic Assessment (ticket 252) ─► /teacher/students/<id>  (the same page)
```
