# 336: The teacher changes the pathway from the decision card during the lesson

## Files touched

| File | What it does |
| --- | --- |
| `lib/pathwayChange.ts` | New, pure. The change rule and where every student in the room is. `LinePlace` (working 0, individual review 1, group review 2, class review 3, done 4); `stagePlace(stage)` (a student stage's place: the gate is group review's entry, class review's wait its entry); `pathwayLocks(pathway, places)` (a review is locked when it is on the pathway and someone in the room is at its place or past it; an off review is never locked); `switchStage` (one toggle, a locked stage refused); `changedPathway(current, requested, locks)` (every free stage as chosen, every locked one as it is now); `samePathway`; `presentPlaces(c, set, session, now)` (Sam from his session; each present classmate from the demo's own model: working until the stream hands them in, then the entry the pathway gives after hand-in, after their corrections (Where students are's Done reviewing) or after their group is home or sits out; the gate opened lifts the room into group review, the board projected into class review, the lesson over to done); `liveLocks`. |
| `lib/pathwayChange.test.ts` | New. Every student stage's place; each review's lock against every pathway and a student at every place; the toggle and the resolution against locks; the demo class (nothing locked when the card comes due at 3:40, individual review locked at the first classmate's hand-in and free again when that student is marked absent, a hand-in on a pathway without individual review at the gate, every presenter stage, the lesson over, a group sitting out at class review's wait); routing after each change (class review added: group done to class review's wait, both strips; individual review removed: hand-in and force submit to the gate; group review added: corrections to the gate, the group from the set's seating with an absence and a seating move, ticket 332's union; individual review refused once Sam handed in and the answer keep); the pathway written once, invalid or no set refused; a reload. |
| `lib/decisionState.ts` | `DecisionAnswer` gains `{ kind: "change"; pathway }`; `answerPathway(answer)`: the pathway an answer writes, if any (ticket 337's answer can carry one too). |
| `lib/classroom.ts` | The decision reducer's answer writes `answerPathway` to `assignment.pathway` in the same step, only when the decision was not already answered and the pathway is valid. |
| `lib/group.ts` | `groupPlan(session, absent, afterIndividual, seating)`: Sam's table is the students seated with him in `seating` (the default seating when not given), no longer the fixed three groupmates. `liveGroupPlan(c, session)`: the set's own seating, its absences and the rule for the pathway as it is. |
| `app/student/StudentShell.tsx`, `lib/demo.ts` | The gate, the forced board and the presenter's group jumps read `liveGroupPlan`; the report jump's finished run takes the set's seating. |
| `components/PathwayStop.tsx` | New. Create's pathway stop (ink, muted, on with ✓, off dashed, undecided) at a caller's fixed size, `line` (Create, 14 px) or `card` (13.5 px). Lifted out of `PathwayMap`. |
| `app/teacher/assignments/PathwayMap.tsx` | Its `Pill` and `Check` are `PathwayStop` and `PathwayCheck` at Create's size: unchanged on screen. |
| `app/teacher/DecisionCard.tsx` | Change between Later and Keep. It turns the card's pathway into `ChangePathway`: the working and the three reviews top to bottom as `PathwayStop`s (136 × 32 layout px) joined by an ink track with an arrowhead into each, each stage's description beside it (faded when off), "Switch any review students haven't started."; the working and every locked review in ink with a title saying students have started it; Later and Done. Done resolves the choice against the class at the press (`getClassroom`, `getSnapshot`, `Date.now()`) and answers `change` with the pathway, or `keep` when it is the pathway as planned. |
| ticket, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`, `README.md` | Docs. |

## How it connects

```
 Sam's session (3 s batch; live at Done) ──┐   lib/stream.ts classmatesAt ──┐   lib/reviewPlaces.ts (Done reviewing)
                                           │                                │   lib/standings.ts (home, sitting out)
                                           ▼                                ▼   lib/readiness.ts (gate opened)
 ┌ lib/pathwayChange.ts ──────────────────────────────────────────────────────────────────────────────┐
 │ presentPlaces(c, set, session, now) ─▶ [0..4 per student in the room]  (absent students out)        │
 │ pathwayLocks(pathway, places)       ─▶ { individual, group, whole-class }: on && someone at/past it │
 │ switchStage(pathway, stage, locks)      changedPathway(current, requested, locks)                   │
 └──────────────────────────────┬───────────────────────────────────────────────────────────────────┘
                                │ liveLocks
                                ▼
 ┌ app/teacher/DecisionCard.tsx ─────────────────────────────┐        ┌ components/PathwayStop.tsx ┐
 │ [Later] [Change] [Keep]                                   │        │ ink / on ✓ / off dashed    │
 │   Change ─▶ ChangePathway: working ink, reviews toggles ──┼──────▶ │ size line | card           │
 │   [Later] [Done]                                          │        └──────────────▲─────────────┘
 │   Done ─▶ decision/answer { change, pathway } | { keep }  │                       │
 └──────────────────────────────┬────────────────────────────┘      app/teacher/assignments/PathwayMap.tsx
                                ▼                                        (Create's line, unchanged)
 ┌ lib/classroom.ts classroomReducer ───────────────────────┐
 │ decision/answer ─▶ decisionsReducer (answered, final)    │
 │   + answerPathway(answer) ─▶ assignment.pathway          │  lib/decisionState.ts
 └──────────────────────────────┬───────────────────────────┘
                                │ pathwayOf(c): every tab, a reload
          ┌─────────────────────┼───────────────────────────┬──────────────────────────────┐
          ▼                     ▼                           ▼                              ▼
 lib/classStage.ts       lib/store.ts dispatch        app/student/StudentShell.tsx   lib/assignments.ts
 pathwayStages           sessionReducer env.pathway   gate / forced board            assignmentTabs (Groups)
   │                     nextStage at hand-in,          liveGroupPlan(c, session)    WholeClassCard, GroupProgressCard
   ▼                     corrections, group done         │  lib/group.ts groupPlan(…, seating)
 BackLine strip (teacher)  (each student's next          │  assignmentGroupsOf + liveAbsent + 332's rule
 PathwayStrip (Sam)         transition)                  ▼
                                                     group/begin { members from seating }
```

## Layout

```
 ┌ decision card, 400 layout px, bottom-right of the scroll region (grows upward) ┐
 │ Most students are close to finishing.                                          │
 │ Let's discuss what's next.                                                     │
 │ 10 of 19 here have submitted Q7                                                │
 │ YOUR PATHWAY                                                                   │
 │ Switch any review students haven't started.                                    │
 │ (  indiv working  )  students finish the set and hand it in        ◀ ink        │
 │         ↓                                                                      │
 │ ( ✓ indiv review  )  students find and fix their own mistakes      ◀ toggle on  │
 │         ↓                                                                      │
 │ (  group review   )  groups compare answers and fix mistakes...    ◀ ink: locked│
 │         ↓                                                                      │
 │ ( - class review -)  you lead the class through ... (faded)        ◀ toggle off │
 │                                                     [Later] [Done]             │
 └────────────────────────────────────────────────────────────────────────────────┘
```

## For ticket 337

- **Adding class review through the same rule.** Take `liveLocks(c, set, session, now)`; if `locks["whole-class"]` is false (it is while nobody in the room is at class review's wait or past it), the pathway is `changedPathway(pathwayOf(c), [...pathwayOf(c), "whole-class"], locks)`. `REVIEW_ORDER` puts it last.
- **Writing it.** Give 337's answer a `pathway` field: `answerPathway` returns any answer's `pathway`, and the classroom reducer writes it to the assignment in the same `decision/answer` step (once, when the decision is first answered, and only if the pathway is valid). Extend `DecisionAnswer` with the split's kind and its moved questions.
