# 285: The Class View's Set column is the score on the first submission

**What to build:** Carson (2026-09-14): "scores in PSet5 don't make sense. keep in mind that the set score should be based on initial submission -- not post review stages". The Set column read problems handed in (`done`), so Sam read 10/10 on Problem Set 5 with Q4, Q6 and Q9 wrong, and Grace 7/10 for reaching seven problems. On the live set, a student still working read problems started, the live student a "handed in" line under it.

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- **The score.** Problems right on the first submission over the set's problems (`lib/setScore.ts`). Right first time is ticket 278's rule: finished, with no wrong line. A slip, a problem started and left unfinished, and one not attempted all count against it. Nothing from review counts: a second submission, the rework and the group's version are never read.
  - A set record: a problem inside `done` and off `wrong` (`recordScore`), which equals the report's Correct first try on every finished record.
  - The live student: his `lines` and typed answer alone (`sessionScore`), never `rework`; it equals ten less group review's union for him.
- **Before hand-in.** A dash while the student is still on the set (not started, warming up, a Q in progress), in the muted ink the absent dash and the confidence dash use; agreed with Carson in chat. Missing and absent keep their marks. The live student's "handed in" line under the count is gone: the score says it.
- Every set uses it: Problem Sets 1 to 5 and the live set.

## Acceptance

- [x] Problem Set 5 reads Sam 7/10, Priya 10/10, Jordan 6/10, Amelia 7/10, Tomas 3/10, Zara 7/10, Liam missing, Aiden 9/10, Mia 7/10, Noah 9/10, Chloe 7/10, Ethan 7/10, Isla 7/10, Lucas 6/10, Grace 7/10, Harper 7/10, Oliver 6/10, Ruby 7/10, Finn 7/10, Sofia 8/10
- [x] Problem Sets 1 to 4: every cell a score, missing or absent; Priya 10/10
- [x] The live set before anyone hands in: dashes, Sam's in the confidence dash's colour; after Sam hands in, his first-submission score (4/10 on the weak run) and every classmate's
- [x] `lib/setScore.test.ts`: PS5's scores; every finished record equals the report's Correct first try; the live student equals group review's union and his rework never lifts it; unfinished and unattempted count against; the column's words
- [x] `score285.mjs` click-through at 1440×900 and 1280×800 (65 checks), vitest, eslint, tsc, next build, check:laptop
