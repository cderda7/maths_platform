# 129 · The Pathway card marks where the class is

Route: `/teacher` (the class view's side column).

## Files touched

| File | What it does |
|---|---|
| `lib/classStage.ts` (new) | `classStages(classroom, session, now, problemCount)`: every stage of the pathway (`working` first, then the review stages) as over / current / ahead with the current one's per-student count; `currentClassStage` picks the stage the class is on (class review while projecting, group review once the gate opened, individual review once the live student handed in, else working; none once the session ended); `stageDone` counts per stage. Pure. |
| `lib/classStage.test.ts` (new) | Seven cases through the demo's skip fixtures: words, the working count, the move on hand-in, the gate's climb and opening, finished groups, class review and its end, a pathway without stages. |
| `lib/pathway.ts` | `pathwayChip` starts with `indiv working` (was `submit`); test follows. |
| `app/teacher/TeacherLive.tsx` | The Pathway card draws `classStages`: over pills `bg-ink text-white`, the current pill `ring-2 ring-accent`, its count (`12/20 done`) absolutely positioned to the right with the gate line under it; the column at the card's left. The Class card is gone. The class review card is rendered first in the column while `currentSlide` is non-null, else in its old place. |
| `app/teacher/GroupStart.tsx` | Now the inline gate line (**start group now**; `● starting · 0:59` and **Cancel** while the grace runs); `groupStartShown` also requires the gate not to have opened. |

## How it connects

```
 student tab ──── session (3 s batches) ──┐        classroom (every tab, at once)
                                          ▼                    │
 TeacherLive ──▶ classStages(classroom, live, now, n) ◀────────┘
                    │  currentClassStage: wc active ▶ class review
                    │                     gate open (everyone in / teacher) ▶ group review
                    │                     live student handed in ▶ indiv review
                    │                     else ▶ indiv working;  wc ended ▶ none
                    │  stageDone: working = live in + classmates with all n done
                    │             individual = classReadiness.handedIn
                    │             group = members of standings at 100 %
                    ▼
   Pathway card  <ol data-pathway-chip>            side column
     [indiv working]  bg-ink text-white  (over)       ┌ WholeClassCard   ◀ first while currentSlide
          ↓                                           ├ Pathway card
     [indiv review ]  ring-2 ring-accent (current)    ├ GroupProgressCard
          ↓            ├─ 12/20 done  ◀ data-stage-count├ WholeClassCard   ◀ otherwise here
     [group review ]   └─ <GroupStart/> start group now │ DiagnosticPush
          ↓               (● starting · 0:59 / Cancel) └ Key
     [class review ]  bg-standout-soft   (ahead)
```

## Verified by

vitest, eslint, tsc, `next build`; `stage.mjs` (port 3191 / CDP 9491, a student tab pressing the demo strip and a teacher tab read after the 3 s batch): 34 checks of the chip words, each state's classes (ring shadow, navy fill, white text), the count text and that it stays inside the card, the gate line, the countdown and Cancel, the gate opening on its own, the class review card's position before, during and after a session, and that no pill's rect changes between states; 2× crops of the column in eight states.
