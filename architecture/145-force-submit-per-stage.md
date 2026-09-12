# 145 · "force submit" beside the current pill, one stage at a time

Route: `/teacher` (the Pathway card in the side column); the countdown pill and the forced moves on `/student`.

## Files touched

| File | What it does |
|---|---|
| `lib/classroom.ts` | `AdvanceKind` is `force-submit` \| `force-review` \| `force-group` \| `whole-class-start` (`group-start` gone); action `group/end { at }` marks the shared run done where it stands with `endedAt`, once |
| `lib/groupReview.ts` | `GroupRun.endedAt` |
| `lib/standings.ts` | The scripted race's clock stops at `endedAt`: the other groups' bars hold where the teacher ended group review |
| `lib/readiness.ts` | The gate opens on a due `force-review` |
| `lib/session.ts` | `advance/apply`: `force-review` hands a correcting student in as they stand and moves them by the pathway (onto the board when group review is next; the class review wait or the report otherwise), takes a student at the gate in; `force-group` moves a student on the board on by the pathway |
| `lib/classStage.ts` | `FORCE_KIND` per stage (none for class review), `FORCE_PENDING_WORD`, `canForce(stage, classroom, session)`: the live student still on the stage and the teacher not projecting |
| `app/teacher/ForceSubmit.tsx` | Takes the stage: the compact **force submit** pill button, or `● handing in` / `1:00 · Cancel` while the grace runs (the countdown clamped to the grace, since the once-a-second clock can lag the deadline), no confirm step |
| `app/teacher/GroupStart.tsx` | Deleted: force submit on indiv review is the gate |
| `app/teacher/TeacherLive.tsx` | The title line's button gone; the current pill's note (`data-stage-note`) is the button over the count (`data-stage-count`) |
| `app/student/StudentApp.tsx` | A due `force-group` also ends the classroom's run; the pill's wording per kind, its countdown clamped to the grace |
| `lib/*.test.ts` | session, classroom, standings, readiness, classStage cases |

## How it connects

```
 teacher /teacher · Pathway card                                  classroom (every tab, at once)
   classStages(...) ▶ the current pill                                     │
   [indiv working] ── ForceSubmit stage=working  ──┐                       │
   [indiv review ] ── ForceSubmit stage=individual ┼ FORCE_KIND[stage]     │
   [group review ] ── ForceSubmit stage=group    ──┘   │ canForce? enabled  │
   [class review ]    (none)                            ▼                   │
        force submit ▶ dispatchClassroom(advance/start { kind }) ──────────▶ advance = { id, kind, deadline = now + 60 s }
        ● handing in / ending · 1:00 · Cancel ▶ advance/clear                          │
        N/20 done under it (stageDone, as ticket 129)                                  │ useClassroom() + useNow()
                                                                                       ▼
                                                        student tab: isPending → pill ("Group review starts in" for force-review
                                                                     with group next, else "Your teacher is moving the class on in")
                                                                     isDue && !applied → dispatch(advance/apply { id, kind, at })
                                                                                       │  + dispatchClassroom(group/end) for force-group
                                                                                       ▼
                                             sessionReducer: force-submit  stage ≤ working  ▶ nextStage(pathway, handed-in), notAttempted, notice
                                                             force-review  feedback         ▶ nextStage(pathway, reworked) (class-wait ▶ group), reworkedAt, notice
                                                                           class-wait       ▶ group
                                                             force-group   group            ▶ nextStage(pathway, group-done)
                                             classroomReducer: group/end ▶ group.done, endedAt ▶ standingsAt holds the race; canForce(group) false
                                             readiness: force-review due ▶ started (the gate), as group-start did
```

## Verified by

vitest (428), eslint, tsc, `next build`; `force145.mjs` (port 3251 / CDP 9551, a student tab pressing the demo strip and receiving the advances, a teacher tab pressing force submit and read after the 3 s batch, three real one-minute graces): the button's stage, text and enablement beside each current pill; the note 12 px right of the pill, centred on it, inside the card, the count under the button at the same left; the pending line and Cancel; the student's pill wording and the forced moves (feedback with the notice; the board; the class review wait with the run done); the race holding for 20 s; no button on class review or after the end; the pills' rects identical across every state; crops `f01`–`f07`.
