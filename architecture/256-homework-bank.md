# 256: After the reflection, each problem a student got wrong turns into a similar one and goes into their homework

## Files touched

| File | What it does |
| --- | --- |
| `data/homework.ts` | `SIMILAR_PROBLEMS`: one hand-authored similar problem per PS6 problem (stem, TeX in the original's exact shape with only the numbers changed, the original's skills on every step, a named type; Q9 a new set-up, Q8 its own graph). |
| `lib/homework.ts` | Pure rules: `everWrong` / `homeworkProblems` (first submission does not hold, or a wrong second submission; not attempted goes), `texDiff` (wraps each changed number in `\htmlClass{hw-diff}` in both TeX strings), `wordDiff` + `glueRuns` / `glueStem` (a stem's changed words, its written maths kept on one line), `sameTypeLine`, and the timeline (`tileMoment`, `tileLands`, `bankedCount`, `homeworkDone`; `MOTION`, `REDUCED_MOTION`). |
| `lib/homework.test.ts` | Which problems go (fixed, still wrong, never wrong, not attempted), every similar problem's maths with `lib/texEval.ts`, shapes, skills, diffs, the sequence, the stage. |
| `lib/session.ts` | `homeworkAt`; `report/send` (with a reflection) → stage `homework` dated `at`; `DEMO_REFLECTION`; `sessionAt("homework")` starts the sequence now. |
| `data/types.ts` | Stage `homework`; figure `q8-similar-parabola`. |
| `lib/demo.ts` | SKIP TO target `homework` (the report's classroom, sequence from the jump). |
| `lib/groups.ts`, `lib/board.ts` | `homework` counts as finished / after review. |
| `app/student/page.tsx`, `StudentApp.tsx` | Deep link `?stage=homework`; renders `HomeworkScreen`; no pathway strip. |
| `app/student/screens/ReportScreen.tsx` | Send dispatches `report/send` with `at`. |
| `app/student/screens/HomeworkScreen.tsx` | The screen: headline, sent chip, Q tiles in set order (right ✓ / wrong ✕, a gone tile a dashed slot of the same size), Homework folder with its count, the report's skill dots (memoised); measures slots and the folder in layout px; drives the active tile from `homeworkAt` and the clock (`useFrameNow` while moving). |
| `components/HomeworkFlight.tsx` | The one moving thing, absolute over the screen: grows from the slot to the question below the row, rolls numbers and changed words (`MorphTex`, `WordSwap`), shows the line, shrinks back to a tile and arcs into the folder; reduced motion shows `SideBySide` in place. |
| `components/Figure.tsx` | Parabola figures from one spec (Q8's drawing unchanged) plus Q8's similar graph. |
| `app/globals.css` | `.hw-diff` / `.hw-aligned` / `.hw-morph` roll driven by `--m`; `.hw-bump`; reduced motion drops the bump. |
| tests | `lib/demo.test.ts`, `lib/board.test.ts` gain the new skip target. |

## How it connects

```
 ReportScreen ── Send (reflection written) ──► dispatch report/send { at }
                                                     │
 lib/session.ts reducer ◄256                         ▼
   reportSent = true · stage = "homework" · homeworkAt = at
   (SKIP TO "homework", ?stage=homework → sessionAt: homeworkAt = now)
                                                     │  useStudentSession
                                                     ▼
 StudentApp ──► HomeworkScreen ◄256 ─────────────────────────────────────────────┐
                  │ homeworkProblems(session)   lib/homework.ts ◄256              │
                  │   everWrong(first, second) ── lib/report.ts holds()           │
                  │ elapsed = clock − homeworkAt (useNow · useFrameNow)           │
                  │ tileMoment(i, elapsed, reduced) ─► active tile + phase + p    │
                  │ bankedCount(...) ─► folder count                              │
                  ▼                                                                │
  ┌─────────────────────────────────────────────────────────────────────┐          │
  │ Your next homework                          [Report sent to Ms …]   │          │
  │ ┌─────────────────────────────────────────────────────────────────┐ │          │
  │ │ [┄Q1┄][┄Q2┄][Q3 ✕][Q4 ✓] … [Q10 ✕]              ▭(2) Homework     │ │  slots keep
  │ └───────┬─────────────────────────────────────────────────────────┘ │  their size
  │  ┌──────▼──────────────────────────┐ HomeworkFlight ◄256 (absolute) │          │
  │  │ Q3                              │  expanding → original →        │          │
  │  │ Find all values of x …          │  morphing (--m 0→1) → similar  │          │
  │  │ (x − 3)(x + 2) = 6   ⇅ 4 · 1    │  → flying (shrink, arc)  ──────┼──► folder
  │  │ Same type, new numbers: …       │  reduced: SideBySide, in place │          │
  │  └─────────────────────────────────┘                                │          │
  │ ┌ skill dots (SkillColumns, memoised) ────────────────────────────┐ │          │
  └─────────────────────────────────────────────────────────────────────┘          │
                                                                                   │
 data/homework.ts ◄256  SIMILAR_PROBLEMS ──► similarFor · texDiff(original, similar)┘
   same shape (numbers only) → two KaTeX layers stacked, only .hw-diff groups move
   (app/globals.css .hw-aligned); stems: wordDiff → WordSwap; maths in words glued
```
