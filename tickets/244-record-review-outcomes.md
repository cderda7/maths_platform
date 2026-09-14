# 244: Every record carries what review made of its mistakes

**What to build:** Every set record (all twenty students on Problem Sets 1–6, Sam's finished-set records included) says, for each problem it got wrong, whether the student fixed it on their own rework, their group fixed it, or it stayed wrong, with the working behind it: the second submission, and the group's rework or last try. The teacher's student report then fills every review column and shows those versions side by side (ticket 243 reads `Classmate.review`).

**Blocked by:** 243.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Agreed with the user on 2026-09-14, grilling ticket 243: every student on every set gets real review columns (1a), not only the live student. The records hold only their first submission (`wrong`, `attempts`), so a record today fills only Correct first try and Incorrect.

## Solution (agreed)

- **Who fixes what (8a), hand-checked per case:** a one-off slip is fixed on the student's own rework; a slip another member of their group did not make is fixed in group review; a habit (the class story sheet shows a gap in that category) stays wrong, and is marked unsolved in group review when their group took the problem on.
- **Working, not just outcomes (15):** each fixed or reworked problem needs the second submission written line by line (every line in the set's evaluation table, a wrong line carrying its slip's leaf), and a group-reviewed problem needs the group's rework (correct) or last try (wrong), shared by the group's members.
- **Where it lives:** `Classmate.review` per record; the story sheet (`data/story.ts`, `specs/class-story.md`) gains a review part per set so tests pin every record to the sheet, as they pin statuses.
- **Live Set 6 (9a):** a classmate's outcome shows only once the class has reached that stage; before individual review ends every unfixed problem sits in Incorrect, the columns never shifting.
- Groups per set: the set's own seating (`lib/seating.ts`).

## Built (2026-09-14)

- **The rules, read literally** (`lib/reviewRule.ts`): a *one-off* (that mistake on one problem of the set, the sheet's habit naming only it) is fixed on the student's own rework; a *repeated* slip is fixed in group review when a groupmate handed the problem in without making it; a *habit* (a gap in the slip's category on the set) stays wrong and the group closes it unsolved on the first habit-holder's working. A group's version is one, so a solved group rework carries every member still wrong there, a habit included; sky's Set 6 versions are the demo group's script.
- **Where it lives**: `data/psetN/review.ts`, `data/classmates-review.ts` (second submissions by student, one version per group), written onto records by `withReview` (`data/recordReview.ts`); the sheet's review part `STORY_REVIEW` (`data/story.ts`, regenerated `specs/class-story.md`) with every case's reasoning.
- **Outcomes**: 236 wrong problems. PS1 13 / 2 / 0; PS2 26 / 6 / 1; PS3 29 / 10 / 2; PS4 28 / 15 / 11; PS5 30 / 2 / 15; PS6 23 / 7 / 16 (own rework / group review / still wrong, each still-wrong problem closed unsolved by its group). Nine cases where a habit is carried by the group's single rework are listed in FUTURE_FEATURES.
- **Live Set 6 (9a)**: `recordReviews(record, problems, over)` with `reviewStagesOver(assignmentStages(…))`: second submissions once individual review is finished, group versions once group review is (over, or current with everyone done).
- **Layout the data needed** on the teacher's report: the not-solved note is Incorrect's second label line; "· Not solved in group review" sits beside the open problem's outcome; the skills card takes the page's spare height; a working still too tall is scaled down whole.

## Acceptance

- [x] Unit: every record's review against the sheet and the rules, with a test that the checker bites (`reviewMismatches` in `data/finishedSets.test.ts` per set and `data/story.test.ts` for Set 6); every second submission holds line by line and every group version holds when solved and has a wrong line when not, every line in the set's table; group versions identical across a group's members; sky equals Sam's finished run and the group script; `withReview` changes nothing but `review`; live Set 6 stage-gated skip by skip (`lib/report.test.ts`); statuses, history (`lib/setHistory.test.ts`) and Mistakes suites unchanged
- [x] Click-through `click244.mjs` (7986 checks at 1280×800 and 1440×900): all twenty reports on all six sets show the sheet's columns and the not-solved note naming exactly the unsolved problems on one line; every tile opens exactly `shownVersions`' versions with the record's lines; no maths wider than its column or split; nothing to scroll with nothing open or any working open, the card never resizing; at individual review nothing past the first submission, in group review the second submissions and no group versions. `fit244.mjs` all fit; `click243b.mjs` 106/106 (record checks updated to the filled columns); `click233b.mjs` 80/80 before ticket 256 changed the student report's send flow
- [x] vitest 896, eslint, tsc, next build, check:laptop 72
