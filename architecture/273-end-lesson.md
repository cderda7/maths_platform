# 273: The teacher can end a lesson whose pathway has no class review

On the live Class View's Pathway card, once the class is on the pathway's last stage and that stage is not class review, an "end lesson" pill sits above force submit. A press starts the one-minute grace; when it runs out every student still in the lesson lands on their report and the lesson ends (`lessonEndedAt`), so the set moves to Past.

## Files touched

| File | What it does |
| --- | --- |
| `lib/classroom.ts` | `AdvanceKind` gains `end-lesson`. `lesson/end { at }`: stamps `lessonEndedAt` at `at` (the grace's deadline, so every tab stamps the same moment) and ends a group run still going where it stands (`done`, `endedAt`); idempotent, a lesson already over is unchanged. `isEnding(c, now)`: end lesson's minute is running. `endLessonAwaited(c, applied, now)`: an end lesson not yet applied to this session, counting down or due and fresh. |
| `lib/classStage.ts` | `endsLesson(id, c)`: the pathway's last stage (the working itself on a set with no review), never class review. `canEndLesson(id, c, session, now)`: the class is on that stage and no advance counts down (everyone may already be done: that is the case it exists for). `otherAdvancePending(c, now, kind)`: force submit waits while end lesson's minute runs. |
| `lib/session.ts` | `advance/apply` with `end-lesson`: a student still in the lesson (before hand-in, correcting, waiting, at the gate, on the board) goes to `report` with the work as it stands (a set not handed in is handed in with its blanks not attempted; corrections under way handed in), notice `ENDED_LESSON_TEXT` ("Your teacher ended the lesson."); one already past it only records the id. |
| `app/teacher/EndLesson.tsx` (new) | `EndLesson`: the pill (force submit's `FORCE_PILL` look, `absolute bottom-full` of the stage note, 4 px above force submit), disabled unless `canEndLesson`; while pending, "ending lesson", "N not done" (or "everyone done"), "0:59 · Cancel", laid from force submit's top over force submit and its count. `LessonEnds`: renders nothing; stamps `lesson/end` at the deadline from any teacher screen. |
| `app/teacher/TeacherLive.tsx` | The stage note renders `EndLesson` (with `total - done`) and wraps force submit and the count in `data-stage-note-rows`, `invisible` while `isEnding`, so their room is kept and nothing moves. |
| `app/teacher/ForceSubmit.tsx` | Exports `mmss` and `FORCE_PILL` (the shared look); disabled while another advance counts down. |
| `app/teacher/TeacherChrome.tsx` | Mounts `LessonEnds` on every teacher route. |
| `app/student/StudentShell.tsx` | At the deadline the iPad applies `end-lesson` to Sam's session and dispatches `lesson/end` at the deadline; the countdown reads "Your teacher is ending the lesson in 0:59". While `endLessonAwaited`, a group run found done does not dispatch the student's own `group/done`: a teacher tab whose clock ticks first can end the run before this tab reaches the deadline, which (seen once in the click-through at 1440x900) sent Sam to the report without the notice. |
| `lib/endLesson.test.ts` (new) | Where the pill goes for every pathway; when it can start; everyone done; force submit waiting; the grace and Cancel; the state after (lesson over at the deadline, Past, board blank, run ended, Sam on report, his To do); `lesson/end` idempotence; each student stage's landing. |

## How it connects

```
 /teacher/a/pset-6/class  Pathway card (pathway without class review, class on its last stage)
 ┌──────────────────────────────────────────────┐
 │ PATHWAY                                      │
 │ [indiv working]                              │
 │       ↓            ┌ data-end-lesson-slot ┐  │   absolute bottom-full: force submit,
 │ [indiv review]     │ (end lesson)         │  │   the count and the pills never move
 │       ↓            └──────────────────────┘  │
 │ [group review]     (force submit)            │◀─ while ending: "• ending lesson /
 │                    12/19 done                │    7 not done / 0:59 · Cancel" laid over
 └──────────────┬───────────────────────────────┘    these two (invisible, room kept)
                │ press: canEndLesson (lib/classStage.ts)
                ▼
 dispatchClassroom advance/start { kind: "end-lesson" }  (lib/classroom.ts, deadline = now + GRACE_MS)
                │  classroom channel + localStorage
     ┌──────────┴─────────────────────────────┬───────────────────────────────────┐
     ▼                                        ▼                                   ▼
 Sam's iPad StudentShell                 any teacher tab                    /board, Classroom tab
 countdown "ending the lesson in 0:59"   TeacherChrome ▶ LessonEnds         unchanged during the minute
     │ deadline (isDue)                      │ deadline (isDue)
     ▼                                        ▼
 session advance/apply end-lesson        classroom lesson/end { at: deadline }  (idempotent,
 (lib/session.ts) ─▶ stage "report",     ◀── the iPad dispatches it too ──       group run ended)
 notice "Your teacher ended the lesson."      │
                                              ▼ lessonEndedAt ─▶ lessonOver
               ┌──────────────────────────────┼───────────────────────────────┐
               ▼                              ▼                               ▼
 currentClassStage null (lib/classStage)  assignmentCard: Past, "done"   boardContent: blank
 Class View " · complete", every pill     (lib/classroomCards.ts)        (lib/board.ts)
 over, no stage note
```

## Verification

- vitest 964 after rebasing on 284 and 285 (9 in `lib/endLesson.test.ts`), `npx eslint .`, `npx tsc --noEmit`, `npx next build`, `check:laptop` 74/74 on the production build.
- Click-through `click273.mjs` (158 checks at 1280x800 and 1440x900 on individual → group and individual only; teacher Class View, a Classroom tab, the board and Sam's iPad): Create with the pathway chosen; no pill on any stage before the last; on the last stage the pill enabled, in force submit's computed look, lower case, 4 px above it, covering nothing, inside the card, at least 4 layout px from any stage pill; the stage pills and the card as on the stage before, force submit, count and note identical with the pill taken out; the press shows the countdown with the not-done count (`total - done`), force submit and the count keep their rects; the iPad counts down "ending the lesson"; Cancel (1280) takes it all back; on individual → group the lesson and the run are ended from another tab 5 s before the deadline and Sam stays on the board until the advance lands him (this check failed with the `endLessonAwaited` guard taken out, reproducing the race); after 4 s the countdown is under 0:58, Sam still in the stage, PS6 still Live, force submit disabled; at the deadline Sam on his report with the notice, `lessonEndedAt` equal to the deadline, the group run ended there, the Class View " · complete" with every stage over, PS6 in Past on the Classroom tab without reload, the board blank, PS6 in Sam's To do.
- Re-run: `click272.mjs` 246/246, `skip263.mjs` 558/558.
- Measured at 1280x800 (layout px from the card's corner): individual → group, stage note at x 204.2, "indiv review" ends at 187.4, the pill 80.7 × 25.8 at y 159.7 above force submit at 189.5; individual only, the note at x 199.4 and "indiv working" ends at 194.8, so the pill's top-left corner is 4.6 px right of that pill's bottom-right corner with their rows overlapping 10 px (their rounded corners leave a visible gap).
