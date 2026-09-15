# 334: The pathway sits beside "← Edexia Classroom" on Class View and Mistakes

## Files touched

| File | What it does |
| --- | --- |
| `lib/classStage.ts` | `StagePillState` (`over`, `current`, `ahead`, `finished`) and `stagePillState(stage)`: `finished` is the current stage with a count that has reached the class in the room. `ClassStage.state` keeps its three values, so `currentStageOf`, the Classroom's cards and the landing rule read as before. |
| `lib/classStage.test.ts` | The pill state for every stage at every point of the lesson (fresh, working, everyone handed in, individual review, every correction in, each review stage, every group finished, lesson over) on all eight pathways; the student's strip never finished. |
| `components/StagePill.tsx` | New. `StagePill` (stage id + state, `ipad` 15 px or `laptop` 13.5 px, optional `badge`), `StageArrow`, and `PathwayPills` (the stages in order with arrows; `beside` after the current pill, `badge` on it). The only place a stage pill is drawn. |
| `app/student/PathwayStrip.tsx` | Now `PathwayPills size="ipad"`: pixel-identical to before. |
| `app/teacher/BackLine.tsx` | New. The first line of Class View and Mistakes: `BackToClassroom` left, the live set's `PathwayPills size="laptop"` right, with force submit, `n/total done` and end lesson beside the current stage (end lesson's countdown in place of all three). `badge` for ticket 335's dot. |
| `app/teacher/ForceSubmit.tsx` | One form only: the 15 px pill (`FORCE_PILL_SIZE`), the countdown on one line (`PENDING_LINE`). The card's stacked variant and `inline` are gone. |
| `app/teacher/EndLesson.tsx` | One form only: a 15 px pill after the count; its countdown on one line. The absolute placement over the card's blank room is gone. |
| `app/teacher/TeacherLive.tsx` | `BackLine` replaces `BackToClassroom`; the Pathway card is gone from the right column (group progress, class review and diagnostic cards keep their order, the first level with the roster). |
| `app/teacher/TeacherMistakes.tsx` | `BackLine` replaces `BackToClassroom`; the stage pill, count and force submit left the eyebrow line (the split) and the title row. |
| `lib/classroom.ts`, `lib/progress.ts` | Comments name the strip. |
| ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 lib/classStage.ts ──────────────────────────────────────────────────────────────┐
   classStages(c, session, now, set) ─▶ [{ id, state, done, total }]             │
   pathwayStages(c, session, now)     ─▶ [{ id, state }]      (no counts)         │
   stagePillState(stage)              ─▶ over | current | ahead | finished        │
        │                                          │                              │
        │ lib/assignments.ts                       │                              │
        │ assignmentStages(bundle, …)              │                              │
        ▼                                          ▼                              │
 ┌ app/teacher/BackLine.tsx ───────────────┐   ┌ app/student/PathwayStrip.tsx ┐  │
 │ [← Edexia Classroom]        (strip) ──┐ │   │ PathwayPills size="ipad"     │  │
 │  BackToClassroom           live only  │ │   └──────────────┬───────────────┘  │
 │  beside current:                      │ │                  │                  │
 │   ForceSubmit ─ n/total done ─ EndLesson│                  │                  │
 └───────────────────────────────────────┼─┘                  │                  │
          ▲                    ▲         ▼                    ▼                  │
          │                    │   ┌ components/StagePill.tsx ───────────────┐   │
 TeacherLive.tsx     TeacherMistakes.tsx │ PathwayPills ─▶ StageArrow          │   │
 (Class View)        (Mistakes)          │              ─▶ StagePill(stage,   │◀──┘
  first child of      first child of     │                 state, size, badge)│ CLASS_STAGE_WORD
  TeacherChrome       TeacherChrome      └────────────────────────────────────┘
          │                    │
          └── same frame, same line ─▶ same rects from the window on both tabs

 ForceSubmit / EndLesson ── dispatchClassroom(advance/start | advance/clear) ─▶ lib/classroom.ts
                                                   └─▶ every iPad's countdown (StudentShell)
```

## Layout

```
 ┌ teacher column (max-w 1640, px-6, zoom 0.72) ─────────────────────────────────────────────────────────┐
 │[← Edexia Classroom]         [indiv working]→[indiv review]→(group review) [force submit] 0/19 done →[class review]│
 │ items-start: button top at 81.6 px      strip self-stretch pb-1: centred on the button, ends on column edge │
 │  11 METHODS · …                                                                                         │
 └──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
