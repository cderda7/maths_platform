# 243: The teacher's student report gets the Q tiles, and a tile's working opens in the skills card's place

**What to build:** On the teacher's student report, a What happened card under the skills with the student report's Q tiles (a column per review stage), ★ on starred problems, a faded tile for every problem outside a chosen commentary idea, and one muted line of confidence (with practice and caution on the live set). A tile or a skill row opens its working in the skills card's place, the card keeping its size; a problem's versions (first submission, second submission, group's rework) sit side by side, only those that tell its story. The key moves to the foot of the right column. The page fits the laptop with nothing to scroll.

**Blocked by:** 233, 237.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), with a screenshot of the student's report: "add the same Q tile & click to see question functionality to teacher view of student report as in student view of student report. there will be some reorganization of the page as a result". Grilled, they settled:

- **Every student on every set** gets real review columns (1a). The records carry no review data yet, so this ticket reads it where it exists and ticket 244 writes it; until then a record fills only Correct first try and Incorrect.
- **Working opens inline on the left**, never in the right column, which would disturb Commentary and In their words (2b). Measured, the space under What happened was about 50 px on the 1280×800 laptop against the ~250 a problem needs, so the working **takes the skills card's place**, the card keeping its size and What happened staying below to switch tiles (16a, "good idea"). A skill row opens there too (13a).
- **Tiles replace the facts list and the Starred card** (4c): a tile already says slipped and reworked, a ★ marks a starred problem, and confidence, practice and caution fit one line.
- **The key goes to the foot of the right column**, level with What happened's (5b, 14b).
- **Nothing to scroll** on the laptop (6a).
- **A commentary idea fades every tile but its problems** (12a).
- **Versions to the right, like the group debrief** (15): "first submission, second submission, group's rework. also only show what's relevant": right first try shows the first submission alone; right after individual review, first and second; right after group review, all three, or first and the group's when the pathway skips individual review. Still-incorrect problems (not spelled out) show every version there is, the group's last try included when the group took it on.

## Solution

- `lib/report.ts`: `ProblemReview` (first, second, group `{ lines, solved }`) for either kind of student: `sessionReviews` from the live session and group run, `recordReviews` from a set record (`classmateLines` and the record's optional `review`). `outcomeOf`, `columnsOf`, `unsolvedOf` read it; `problemOutcome`, `outcomeColumns`, `unsolvedInGroup` keep their signatures on top. `shownVersions` picks the versions per the rule above; `labelSentence` words a record's confidence label as the live sentence.
- `data/classmates.ts`: `Classmate.review?` (what ticket 244 fills).
- `components/OutcomeTiles.tsx`: What happened's tiles lifted out of the student report, plus `starred`, `lit` and `noteFloor` for the teacher.
- `components/HierarchyDrill.tsx`: `WorkLines` split out of `ProblemWork` so a version column draws the same marked lines; a problem header may wrap.
- `components/StatusKey.tsx`: `split` sets the key as two lists of three.
- `components/Tag.tsx`: a difficulty pill never wraps inside itself (it did as "simple / unfamiliar" in a skill's three-column working).
- `app/teacher/report/TeacherReport.tsx`: the skills stay laid out, `invisible`, under an absolutely placed working panel (`data-report-work`, "← Skills"), so the card cannot resize; What happened below; the key at the right column's foot; right-column spacing tightened (idea rows `py-1`, boxes `py-4`, the quote 19 px) so the longest commentary fits.
- `app/student/screens/ReportScreen.tsx`: draws `OutcomeTiles`; nothing on screen changes.

## Acceptance

- [x] Unit (`lib/report.test.ts`): the live session's versions and columns equal the student report's; `shownVersions` for first, individual, group (with and without individual review), wrong; a record's versions with and without `review`; `labelSentence`
- [x] Click-through `click243.mjs` (114 checks at 1280×800 and 1440×900): Sam live's tiles equal his own report's columns; ★ on exactly his stars; notes carry confidence and practice; facts list and Starred gone; key out of the skills card, its foot level with What happened's, every key word on one line; nothing to scroll; Q4 opens the first submission alone in the card's place, the card and What happened unmoved; Q1 first and second side by side, the second his rework line for line; Q7 first, second and group's last try, "Not solved in group review", every line inside its column; same tile, Escape, a press elsewhere and ← Skills close; a ⚠ chip opens that skill; a skill row opens its working in the same place, nothing to scroll; a tile switches from a skill; an idea fades the other tiles and again restores them; Mia (Set 6), Sam and Ethan (Set 4), Zara (Set 1): the pathway's four columns, ten tiles, first try and Incorrect only, confidence sentence, no stars, a wrong tile's first submission alone, nothing to scroll; the earlier-set report inside Set 6's history has tiles and opens working; the student report still opens working in its side column, no stars or fading
- [x] Fit sweep `fit243.mjs`: all twenty students on all six sets and Sam live at 1280×800 and 1440×900, nothing to scroll
- [x] `click233.mjs` (the student report, 80 checks) still passes
- [x] vitest 759, eslint, tsc, next build, check:laptop 62
