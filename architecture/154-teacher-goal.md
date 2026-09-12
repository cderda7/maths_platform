# 154 · The teacher's goal for the class, read before the check-in

Route: `/teacher/assignments/create` (the field), `/student` (the overview's CONTINUE, the `goal` stage).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage` gains `goal`; `Assignment.goal` replaces the unrendered `intro`; `BEFORE_HAND_IN_STAGES`, the one list of stages before hand-in. |
| `data/assignment.ts`, `data/draft-seed.ts` | The fixture's goal (Ms Okafor's suggested message) and the draft seed that repeats it. |
| `lib/session.ts` | `SessionEnv.goal`; `overview/start` → `goal` (or `confidence` when blank); `goal/continue` → `confidence`; `ORDER` and `sessionAt` know the stage. |
| `lib/store.ts` | Puts the active assignment's goal into the reducer's env. |
| `lib/classroom.ts`, `lib/assignment.ts` | `goal` on the draft, the created assignment, the create action and the active assignment; `GOAL_MAX`. |
| `lib/classStage.ts`, `lib/hierarchy.ts`, `lib/examples.ts`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx` | Read the shared stage list instead of their own copy. |
| `app/student/screens/GoalScreen.tsx` | The screen: eyebrow, heading, avatar + tailed bubble, CONTINUE. |
| `app/student/screens/OverviewScreen.tsx` | CONTINUE (was START) with the looping pulse. |
| `app/student/screens/ConfidenceScreen.tsx` | Eyebrow "Check in". |
| `app/student/StudentApp.tsx`, `app/student/page.tsx` | Mounts the stage; `?stage=goal`. |
| `app/globals.css` | `.pulse-loop::after`: the accent ring every 2 s; reduced motion holds a halo. |
| `app/teacher/assignments/create/CreateAssignment.tsx` | The goal field under the title, seeded, capped, saved to the draft. |
| `app/teacher/assignments/create/review/ReviewAssignment.tsx` | Create passes the draft's goal. |
| `lib/session.test.ts`, `lib/classroom.test.ts` | The flow and the goal's travel. |

## How it connects

```
 /teacher/assignments/create                                     /student
 ┌──────────────────────────────┐                                ┌──────────────────────────────────────────────┐
 │ title                        │   draft/set                    │ overview ── CONTINUE (pulse-loop) ──▶ goal ──▶ confidence │
 │ Goal for the class  [textarea│──────────▶ classroom.draft     │            overview/start   goal/continue     "Check in"   │
 │  239 / 280 ]                 │              .goal             │                 │                                          │
 │ Q tiles …          Continue  │                                │        env.goal.trim() ? "goal" : "confidence"            │
 └──────────────────────────────┘                                └──────────────────────────────────────────────┘
            │ review → Create                                                      ▲
            ▼ assignment/create { goal }                                           │ SessionEnv.goal  (lib/store.ts)
      classroom.assignment.goal ──▶ activeAssignment().goal ───────────────────────┘
                (absent → fixture's; "" → no goal screen)        │
                                                                 └──▶ GoalScreen: "Before you get started" / "Ms Okafor wants you to know…"
                                                                        (MO) ◁ [ the goal, line breaks kept ]        CONTINUE
```

## Verified by

vitest (434), eslint, tsc, `next build`; a headless run (`goal154.mjs`, 35 checks): the overview's button reads continue with an endless 2 s `pulse-loop` ring on its `::after`; CONTINUE opens the goal screen with the eyebrow, heading, the 239-character fixture goal, the MO avatar left of the bubble with the tail over its edge, the strip still on indiv working, CONTINUE at the overview button.s exact coordinates; then the check-in ("Check in"), Submit at the same coordinates; reloads and `?stage=goal` hold; the create screen's label, prompt copy, preload, counter, order under the title, a 300-character paste cut to 280, the draft in the store; the review walked to Create, the assignment's goal the teacher's words with the line break kept on the student's screen; a blank goal created and the overview's CONTINUE opening the check-in directly; reduced motion with no animation and a 6 px halo.
