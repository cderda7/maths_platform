# 264: Sam's Classroom is his landing page: To do, Missing, Completed

`/student` is Sam's own Edexia Classroom on the iPad. Problem Set 6 appears in To do only once the teacher has sent it; a fresh demo has not.

## Files touched

| File | What it does |
| --- | --- |
| `lib/studentClassroom.ts` | Pure. `studentSection(id, classroom, session, now)`: a finished set is Completed when `data/story.ts` has Sam handing something in (Missing when nothing); Problem Set 6 is null until sent (`assignmentIds`, the teacher Classroom's own test), then To do, Completed once `reportSent`, Missing when every stage is over (`currentClassStage` null) without his hand-in. `studentClassroom` gives the cards by section, newest due first, with the To do card's one action (`start` at the start, `continue` in the run). The hrefs: `/student`, `/student/a/<id>`. |
| `lib/studentClassroom.test.ts` | The section of each set before sending, after, mid-lesson, after completion and completed without hand-in; reset. |
| `lib/demo.ts` | `demoSend(pathway, now, startedAt)`, the one "Problem Set 6 sent by a presenter" action (skips use it). `deepLinkClassroom`: `?pathway=` sends with that pathway from now; a named `?stage=` sends under `DEFAULT_PATHWAY`, live for an hour like a skip, only when nothing is sent; a plain link sends nothing. |
| `lib/demo.test.ts` | The deep-link rules; every skip sends the set. |
| `app/student/layout.tsx` | Wraps every student route in `StudentShell`, so the device stays mounted between the Classroom and the set. |
| `app/student/StudentShell.tsx` | The iPad: `IpadStage`, the lesson's clockwork moved out of `StudentApp` unchanged (teacher advances, the gate, the shared whiteboard's scripted turns, class review's freeze and release), the countdown pill and the diagnostic over every screen, and SKIP TO. |
| `app/student/page.tsx` | Renders `StudentClassroom`. An old deep link (`stage`, `run` or `pathway` in the query) redirects, query and all, to `/student/a/pset-6`. |
| `app/student/page.test.ts` | The redirects of both pages. |
| `app/student/a/[id]/page.tsx` | The set on the iPad (only the live set; any other id redirects to the Classroom); parses the deep link as `/student` did. |
| `app/student/StudentApp.tsx` | Now the set's screens only: sends the set for a deep link on mount (`deepLinkClassroom`), goes back to the Classroom when the set is not sent (never, or Reset in another tab), renders nothing for a plain link until the store says it is sent. |
| `app/student/StudentClassroom.tsx` | The Classroom screen: eyebrow `11MAM2 · Mathematical Methods · Ms Okafor`, "Edexia Classroom", then To do, Missing, Completed; an empty section says so ("Nothing to do right now.", "Nothing missing."); 56 px cards with the name, "due …" and on To do an accent START / CONTINUE; opens the set with `router.push`. Sections wait for the client (no flash of a fresh demo). While class review has frozen the class it goes to the set. |
| `app/student/StudentChrome.tsx`, `components/Brand.tsx` | `Brand` takes `href`: on the iPad the Edexia mark is a link to `/student` (still a label elsewhere). A frozen header already takes no presses. |
| `components/SkipTo.tsx` | After a jump, opens `/student/a/pset-6` when not already there, so every skip works from the Classroom. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Create also resets Sam's session: a sent set starts his run at its start. |
| `lib/board.ts`, `app/board/SmartBoard.tsx`, `lib/board.test.ts` | Before a set is sent the blank board names the class alone, no Problem Set 6 title (it read the fixture's). |
| `scripts/hint-box-sweep.mjs`, `scripts/laptop-check.mjs` | Open `/student/a/pset-6…` (plain `/student` no longer continues the run). |

## How it connects

```
 fresh demo: classroom.assignment = null
                                                         teacher laptop
 Sam's iPad                                              /teacher/assignments/create/review
 ┌───────────────────── app/student/layout.tsx ────────┐   Create ─▶ assignment/create
 │ StudentShell (IpadStage · clockwork · countdown ·    │          └▶ setSession(INITIAL_SESSION)
 │               diagnostic · SkipTo)                   │                     │
 │                                                      │      classroom store (localStorage +
 │  /student ─▶ StudentClassroom ◀─────────────────────────────  BroadcastChannel), session store
 │   studentClassroom(classroom, session, now)          │                     │
 │   ┌ TO DO     [PS6 · due Thu 10 Sep · START]  ◀ sent │                     ▼
 │   ├ MISSING   Nothing missing.                       │    /teacher Classroom: assignmentIds
 │   └ COMPLETED PS6 (report sent) · PS5 … PS1 ◀ story  │    ─▶ LIVE card only once sent
 │        │ START / CONTINUE                            │
 │        ▼                   ▲ Edexia mark (href)      │
 │  /student/a/pset-6 ─▶ StudentApp ─▶ StudentChrome ▶ screens (overview … homework)
 │        ▲  not sent ─▶ router.replace("/student")     │
 │        │                                             │
 │  /student?stage=… ─307─▶ /student/a/pset-6?stage=…   │
 │        deepLinkClassroom: send (DEFAULT_PATHWAY, 1 h ago) if nothing sent
 │  SKIP TO ─▶ skipFixture (demoSend DEMO_PATHWAY) ─▶ push /student/a/pset-6
 └──────────────────────────────────────────────────────┘
 Reset demo ─▶ INITIAL_CLASSROOM + INITIAL_SESSION ─▶ PS6 leaves To do, the set route goes home
```
