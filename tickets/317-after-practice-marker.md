# 317: The teacher's report marks a question answered after practice, and names the warm-up

**What to build:** on the teacher's report for a student, a question the student took practice on during the set carries an "after practice on <skill>" marker, and the set names the skills they warmed up on. The score does not change.

**Blocked by:** 312, 313 (the session records they add).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

"Right first time" is the set score (`lib/setScore.ts`), and help taken during the set never counted against it. Now that help runs a worked example of a question like Q just before the student answers Q, right first time on that question means something different. Asked, the user (2026-09-15) chose a marker on the report and no change to the score. Warm-ups are one set-level note, not a marker on every question using the skill, because the warm-up is the lesson's own start.

## Acceptance

- [x] On the teacher's report for a student on Problem Set 6 (`/teacher/a/pset-6/report?student=<id>`), each question the student took practice on shows a small muted marker "after practice on <skill>" beside its result, the skill's student-facing name; a question with none shows nothing and nothing moves
- [x] The report names the set's warm-up once, near the confidence answer: "Warmed up on non-monic factorising" (joined like the chat joins names), or nothing when there was none
- [x] Classmates' markers come from ticket 314's story, Sam's from his session
- [x] `lib/setScore.ts` is unchanged and a test holds that practice never changes a score
- [x] Sam's own report on his iPad is unchanged (a student-side marker is a FUTURE_FEATURES entry)
- [x] Wording describes behaviour, never a trait (no "struggled", "needed help")
- [x] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900 on three reports (Sam after practice on Q2 and a warm-up, a classmate with a marker, Priya with none): markers on one line, nothing moves, no sideways scroll
- [x] Ticket docs: `architecture/317.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES

## Solution

- **What practice came before what** (`lib/practiceMarks.ts`, pure). `PracticeMarks` holds, per question, the skills practised on it and the skills the warm-up took. Sam's come from his session (`sessionPracticeMarks`): every accepted practice entry on its question (Q* reached, so help left from the worked example counts, or the older isolated practice opened; a declined offer does not), and each warm-up skill whose steps began (`warmup.phases`) or that he moved past (`warmup.done`), once he took the warm-up. A classmate's come from ticket 314's story (`classmatePracticeMarks`): the warm-up and help segments of `classmateTimeline`, read at the stream's clock on the live set, so a step the class has not reached yet is not there; the whole story before the set goes live and once the class has handed in, as `classPlaces` reads it (`reportPracticeMarks`). A finished set has none. Liam Q1 monic, Sofia Q2 non-monic, Harper Q3 expansion, Finn Q5 graph features; Jordan, Mia, Oliver, Tomas and Amelia's warm-ups.
- **On the report** (`app/teacher/report/TeacherReport.tsx`, `components/OutcomeTiles.tsx`). A marked tile carries a small muted dot over its top right corner (absolute, so the tile keeps its size) and the words in its name and tooltip ("Q2 after practice on non-monic factorising"). What happened's line reads, after the confidence answer, the warm-up ("Warmed up on fractions & non-monic factorising", joined as the chat joins names, `joinSkills`) and "● Q2 after practice". Pressing the tile, the working's header says "after practice on non-monic factorising" beside the result ("Correct after individual review"), on its line, the header no taller. The student's report passes no marks.
- **The notes line.** Practice taken is now a marker, so `reportFacts.practices` lists only offers declined ("Practice · null factor law · Q3 · declined"); Sam's "Practice · non-monic factorising · Q2 · taken" is gone from the line.
- **The score.** `lib/setScore.ts` is unchanged; `lib/practiceMarks.test.ts` holds that Sam's score is the same with and without his practice and warm-up, and a record's reads only `done` and `wrong`.

## Verification

- Vitest 2125 after rebasing onto tickets 332–338 (`lib/practiceMarks.test.ts` 11: the four marked classmates and no one else, the five warm-ups and hints marking nothing, the stream's clock for help and a second warm-up skill, the live set before it starts and after hand-in, finished sets, Sam's Q2 from the scripted run, help left from Q*, a declined offer, two skills on one question, the warm-up's skills opened and skipped, the words, no trait words, practice never changing a score; `lib/report.test.ts` the notes), eslint, tsc, next build; check:laptop 76.
- Click-through `click317.mjs` 838/838 (before and after the rebase) at 1280×800 and 1440×900 against a production build: Sam's iPad report with no marker before and after a warm-up; every one of the twenty reports (Sam after practice on Q2 and a warm-up on monic factorising, the nineteen classmates): no scroll, no sideways scroll, What happened's card at the same top and height as before the change, the tiles of Sam, Liam, Sofia, Oliver and Priya at the same pixels as before the change, the notes on one line, the dotted tiles exactly the story's, every tile 36 px tall and its width unchanged, the tooltips, the "Q2 after practice" line, the warm-up note right after the confidence answer, no trait wording; each marked question opened beside an unmarked one: the marker's words, on one line level with the result, inside the card, the header's height the same as the unmarked question's, KaTeX on one line. Screenshots before and after checked.

## Judgement calls

- **On the teacher's report, a question answered after practice shows a small grey dot on its tile's corner, "● Q2 after practice" on What happened's line, and the full "after practice on non-monic factorising" beside the result once the tile is pressed** (and in the tile's tooltip). The words cannot sit beside a tile without moving the tiles, and all of them on the line wraps Sam's line at 1280.
- **On the teacher's report, the skill is named as the teacher's screens name it ("monic factorising"), not as Sam's iPad does ("factorising")**, matching the confidence sentence beside it ("Confidence low when monic factorising comes up"); Oliver's would otherwise read "Warmed up on factorising & non-monic factorising".
- **On Sam's report, "Practice · non-monic factorising · Q2 · taken" no longer shows on What happened's line**; the marker on Q2 says it. A declined offer still shows there.
- **On a classmate's report during the live lesson, the marker appears when the stream reaches the practice's worked example**, though the tile already shows the record's result (as the report did before).
- **On a finished set (Problem Sets 1–5), no report shows a marker or warm-up**: the practice story is Problem Set 6's.
