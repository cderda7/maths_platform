# 23 · Whole-class setup and the unmarked board

Routes: `/teacher/whole-class` (private setup, linked from the live view's "Whole-class review"
card when the pathway includes it) and `/teacher/board` (the projected board, no teacher chrome).

## Files touched

| File | What it does |
|---|---|
| `lib/examples.ts` | Candidates per problem (every classmate who handed it in, with their scripted attempt or the model solution when they got it right, plus the live student's final version once handed in); `bucketOf` (correct, or the first wrong step's subskill); `bucketCounts`; `struggleCount`; `problemsByStruggle`; `suggestExamples` (one correct, then one per error bucket by size, cap 3, at least 2); `boardExamples` → `{ letter, lines, count, denominator }` only |
| `lib/classroom.ts` | `WholeClassSession { problems, examples, slide, view: unmarked | marked, status: setup | active | ended }`; actions `wc/setup`, `wc/project`, `wc/next` (next problem, unmarked), `wc/prev` (back one view), `wc/marks`, `wc/end` (also clears a pending advance); `isProjecting`, `currentSlide` |
| `app/teacher/whole-class/WholeClassSetup.tsx` (+ `page.tsx`) | Problems ranked by struggle with `n/m struggled`, top three pre-checked, toggles; per chosen problem a card of suggested examples with letter, bucket tag (correct / subskill), a name selector to swap in any other candidate, and the transcription; Project → `wc/setup` + `wc/project` → the board |
| `app/teacher/board/Board.tsx` (+ `page.tsx`) | The slide: problem label and statement, 2–3 example columns with the letter, `n/m students` and the lines in large type; footer Previous · `problem 2 of 3` · End · Next. Renders nothing that names a student or marks a line; "No session projecting" with a link to setup otherwise |
| `app/teacher/WholeClassCard.tsx`, `TeacherLive.tsx` | Live-view card: "Set up →", or "Projecting · problem 2 of 3 · Board → · End" while active; hidden when the pathway has no whole-class stage |
| `lib/examples.test.ts`, `lib/classroom.test.ts` | Bucketing, candidates (live student joins once handed in, with the rework), counts and struggle ranking, suggestion order and cap, board view model shape with no names or verdicts; session setup/project/next/prev/marks/end stepping |

## How it connects

```
 live view · WholeClassCard ── Set up → ──▶ /teacher/whole-class · WholeClassSetup
                                              problemsByStruggle(session) → ranked list, top 3 checked
                                              per chosen problem: candidatesFor(pid, session) → suggestExamples → refs
                                                                   (names + bucket tags shown HERE only; swap via select)
                                              Project ──▶ dispatchClassroom(wc/setup {problems, examples}) · wc/project
                                                                              │
                                                                              ▼
                                                 classroom-store.wholeClass = { problems, examples, slide 0, unmarked, active }
                                                                              │ useClassroom()
                                                                              ▼
 /teacher/board · Board  ── currentSlide(classroom) → problem · boardExamples(refs, pid, session) → [{ letter, lines, count, denominator }]
                            Previous / Next / End → wc/prev · wc/next · wc/end          (ticket 24 adds Show marks + the student freeze)
```

## Verified by

vitest (99 tests), `tsc --noEmit`, `eslint`, `next build`, and a two-tab CDP run: with the student
handed in under submit → individual → whole-class, the live view shows the card; setup ranks
Q3 (4/7), Q2 (3/7), Q1 (1/7) checked and Q4 (1/5) unchecked, suggests a correct classmate as A
and the live student as B on each, lets B be swapped to another classmate, and toggling Q4 adds
it; Project opens the board at problem 1 of 4 with two examples showing `n/7 students` and no
student name or verdict styling anywhere in the body; Next advances, Next is disabled on the last
slide, Previous steps back one view; a second teacher tab's card reads "Projecting · problem 3 of
4"; End returns to the live view with "Set up →" again; the bare board route reads "No session
projecting".
