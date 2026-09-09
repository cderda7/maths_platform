# 18 · Pathway model and routing

Routes: `/student?stage=working&pathway=wc` (any of `none · indiv · group · wc · indiv,group ·
indiv,wc · group,wc · indiv,group,wc`) creates the demo assignment with that pathway and starts
the run; `/student?stage=waiting`; the chip and gated tabs on every `/teacher` route.

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `ReviewStage = individual | group | whole-class`, `Pathway = ReviewStage[]`; new student `Stage` `waiting` |
| `lib/pathway.ts` | The rule: `REVIEW_ORDER`, `isValidPathway`, `successors(prefix)` (for the creation map), `allPathways()` (eight), `nextStage(pathway, transition)` for `handed-in / reworked / group-done`, `pathwaySentence`, `pathwayChip`, `parsePathway` for deep links, `DEFAULT_PATHWAY = [individual, group]` |
| `lib/classroom.ts` | Teacher-owned `ClassroomState { assignment }`, `CreatedAssignment { title, problemIds, pathway, createdAt }`, `classroomReducer` (`assignment/create`, `reset`), `pathwayOf(state)` |
| `lib/classroom-store.ts` | The second shared store: own localStorage key and BroadcastChannel, `getClassroom · subscribeClassroom · setClassroom · dispatchClassroom · resetClassroom · useClassroom` |
| `lib/session.ts` | `SessionEnv { pathway }` third reducer argument (defaults to the build's pathway so every existing test holds); new `hand-in` action; `hand-in`, `rework/done`, `group/done` route through `nextStage`; `waiting` in the deep-link order |
| `lib/store.ts` | `dispatch` reads the classroom pathway and passes it as the env; stamps `at` on `hand-in`; `resetSession` also resets the classroom |
| `app/student/page.tsx`, `app/student/StudentApp.tsx` | `?pathway=` parsed on the server, applied on mount by creating the fixture assignment with that pathway; `waiting` stage renders `WaitingScreen` |
| `app/student/screens/WaitingScreen.tsx` | "Handed in · Waiting for Ms Okafor", nothing to tap |
| `app/student/screens/WorkingScreen.tsx` | "Hand in" dispatches `hand-in` instead of `goto feedback` |
| `app/teacher/TeacherChrome.tsx` | Pathway chip (`submit → indiv → group`); the Groups tab is offered only when the pathway includes group review |
| `app/teacher/TeacherLive.tsx`, `lib/groups.ts` | Stage words for `waiting` |
| `lib/pathway.test.ts`, `lib/classroom.test.ts`, `lib/session.test.ts` | Eight pathways valid, bad orders rejected, successors, every transition; classroom create/reset; the reducer walked through all eight pathways ends on the report |

## How it connects

```
 /student?pathway=wc ──▶ StudentApp mount ──▶ dispatchClassroom(assignment/create {title, problemIds, pathway})
                                                        │
                                                        ▼
 ┌──────────────────────────────┐        ┌──────────────────────────────────────────┐
 │ lib/classroom-store.ts       │        │ lib/store.ts (student session, as before) │
 │  key …/classroom/v1          │        │  dispatch(action):                        │
 │  ClassroomState.assignment   │──read──▶   env = { pathway: pathwayOf(classroom) } │
 │  .pathway                    │        │   sessionReducer(s, action, env)          │
 └──────────────┬───────────────┘        └──────────────────┬───────────────────────┘
                │ useClassroom()                            │ nextStage(pathway, …)
                ▼                                           ▼
 TeacherChrome: chip · tabs gated          hand-in   → feedback | group-pass | waiting | report
                                           rework/done → group-pass | waiting | report
                                           group/done  → waiting | report
 Reset (any tab) ──▶ resetClassroom() + INITIAL_SESSION
```

## Verified by

vitest (70 tests), `tsc --noEmit`, `eslint`, `next build`, and a two-tab CDP run: for each of the
eight pathways the student tab hands in from Q4, finishes a rework and finishes a group
discussion, and lands on the expected screen every time (feedback / quick pass / handed-in
waiting / report); the teacher tab shows `submit → whole class` with no Groups tab under the
whole-class-only pathway, all four tabs under the full pathway, and returns to
`submit → indiv → group` with the overview on the student tab after Reset.
