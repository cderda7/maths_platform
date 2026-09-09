# 19 · Assignment creation with the pathway map

Routes: `/teacher/assignments/new` (linked from every teacher page as "New assignment"); the
created title and problem set show on `/student` and in every teacher eyebrow.

## Files touched

| File | What it does |
|---|---|
| `app/teacher/assignments/new/page.tsx`, `NewAssignment.tsx` | The creation screen, ported from the Sept 7 mockup and cut to the copy rule: title input, the four bank problems as toggles (all on by default) with the prerequisite chips they cover, the pathway map, Create. Create dispatches `assignment/create` to the classroom store and returns to `/teacher` |
| `app/teacher/assignments/new/PathwayMap.tsx` | The map. Column one is the always-bold "student submission" (tapping it clears every later column; follow-up 2026-09-09, renamed from "1st submit") with a dashed, disabled "continue tomorrow · soon" node under it. Each later column lists `successors(picked so far)`; the pick is bold, its siblings fade to 35 % but stay tappable, picking clears downstream, tapping the pick again unpicks it (implicit stop). `pathwaySentence` under the map |
| `lib/assignment.ts` | `activeAssignment(classroom)`: the created title and chosen problems in bank order, or the fixture; unknown ids dropped, an empty choice or blank title falls back |
| `lib/classroom-store.ts` | `useAssignment()` hook over the classroom store |
| `app/teacher/TeacherChrome.tsx` | "New assignment" link beside Reset |
| `app/student/screens/OverviewScreen.tsx`, `WorkingScreen.tsx`, `FeedbackScreen.tsx`, `ReworkScreen.tsx`, `WaitingScreen.tsx`, `HistoryScreen.tsx`, `ReportScreen.tsx`, `app/student/StudentApp.tsx` | Read title and problem set from `useAssignment()`; feedback and rework lists filter to the chosen problems |
| `app/teacher/TeacherLive.tsx`, `groups/`, `mistakes/`, `compare/`, `report/` | Eyebrows and the live intro line show the created title |
| `lib/classroom.test.ts` | Active assignment: fixture fallback, bank order, unknown ids, empty choice |

## How it connects

```
 /teacher/assignments/new
   NewAssignment ── title · chosen ids · PathwayMap(value, onChange) ──▶ dispatchClassroom(assignment/create)
                       │                                                          │
                       │ successors(prefix) · pathwaySentence  (lib/pathway.ts)    ▼
                       │                                            classroom-store  (shared, every tab)
                       ▼                                                          │
 PathwayMap: [1st submit] → [col 0: indiv | group | wc] → [col 1: successors] → …   │ useAssignment()
             pick = bold · siblings opacity-35 · downstream cleared · re-tap = stop  ▼
                                                     activeAssignment(classroom) → { title, problems, created }
                                                       │                    │
                                              student screens         teacher eyebrows · live intro
                                              (overview, working,     TeacherChrome chip · gated tabs (18)
                                               feedback, rework, …)
```

Derivations in `lib/` (feedback, versions, report facts) still run over the fixture's four
problems; unchosen problems simply have no lines. Honouring the chosen subset inside those
derivations is noted in `FUTURE_FEATURES.md`.

## Verified by

vitest (72 tests), `tsc --noEmit`, `eslint`, `next build`, and a two-tab CDP run: from the default
map (`submit → individual review → group review`) the teacher picks whole-class only, then
individual, then individual → group → whole-class, switches column two to whole-class (column
three clears), un-picks column two (stops after individual); the sentence and the bold/faded
nodes match at every step and "continue tomorrow" is disabled. Unticking Q1, retitling to
"Quadratics — Set 4" and pressing Create lands on `/teacher` with chip `submit → indiv` and no
Groups tab; the student tab shows the new title with Q2–Q4, works through them, hands in to the
feedback screen listing Q2–Q4, and Reset returns both tabs to the fixture.
