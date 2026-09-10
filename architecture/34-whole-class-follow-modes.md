# 34 · Whole-class review on the student screen: versions beside a pad, frozen or write-with-me

Routes: `/student` (stage `frozen`), `/teacher/whole-class` (the mode choice), `/teacher/board`
(the toggle and the teacher's pad). Demo: the "whole-class review" skip.

## Files touched

| File | What it does |
|---|---|
| `lib/classroom.ts` (+ test) | `FollowMode` (`frozen` \| `write-with-me`) and `FOLLOW_MODE_WORD`; `WholeClassSession.modes` (per projected problem, seeded from `wc/setup { mode }`, frozen by default) and `.ink` (the teacher's strokes per problem); actions `wc/mode`, `wc/stroke`, `wc/ink-undo`, `wc/ink-clear`; `currentSlide` carries `mode` and `teacherInk` (older stored sessions read as frozen, nothing written) |
| `lib/frozen.ts` (+ test) | `FrozenView.mode` and `.teacherInk` |
| `lib/session.ts` (+ test) | `followInk` per problem (the student's own writing in write-with-me: never marked, never a version); `follow/stroke`, `follow/undo`, `follow/clear` |
| `components/DrawPad.tsx`, `components/PadSection.tsx` | `readOnly`: draws the strokes, ignores the pointer, no toolbar |
| `app/student/screens/FrozenScreen.tsx` | Banner with a mode chip; label · expression · "n of m"; versions on the left (one or two: half the width; three: two thirds, `data-split`), two-case lines as two boxes; the pad on the right: a read-only mirror of the teacher's ink titled "Ms Okafor's working" in frozen mode, the student's own "Write with me" pad otherwise. No difficulty tag |
| `app/teacher/board/Board.tsx` | A "Your working" pad beside the examples (`wc/stroke` etc.); a mode toggle in the footer (`wc/mode` for the current problem) |
| `app/teacher/whole-class/WholeClassSetup.tsx` | "Student screens": screens frozen / write with me, chosen before Project, with a note that it can change per problem |
| `lib/demo.ts` | The whole-class skip projects in frozen mode |

## How it connects

```
 WholeClassSetup ── Project ──▶ wc/setup { problems, examples, mode } · wc/project
 Board ── pad ──▶ wc/stroke { problem, stroke } ──┐   ── toggle ──▶ wc/mode { problem, mode }
                                                  ▼
 classroom store (localStorage + BroadcastChannel) ──▶ every student tab
                                                  │
 FrozenScreen ◀── frozenView(session, classroom) = { versions, mode, teacherInk, … }
   grid: [versions: 1–2 → 1/2 · 3 → 2/3] [pad]
   mode frozen        → PadSection readOnly, strokes = teacherInk        (select-none, chrome disabled)
   mode write-with-me → PadSection live, strokes = session.followInk[pid] ──▶ follow/stroke · follow/undo · follow/clear
```

## Verified by

vitest (180 tests): modes seeded from setup, per-problem switch, teacher ink with undo and clear,
older sessions read as frozen; the frozen view carries mode and ink; follow-along ink is kept
apart from every version. CDP, two tabs: the whole-class skip shows the frozen screen with the
"screens frozen" chip, a 1/2 split, "Handed in" and "Reworked" with branch boxes, no difficulty
tag, and a toolbar-less pad titled "Ms Okafor's working"; a stroke on the board's pad reaches the
student's mirror; switching the board to "write with me" changes the chip, gives the student a
live pad with a toolbar, and a stroke there lands in `followInk` with the rework ink untouched;
the next problem keeps its own (frozen) mode. `tsc --noEmit`, `eslint`, `next build`.
