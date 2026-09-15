# 317: The teacher's report marks a question answered after practice, and names the warm-up

**What to build:** on the teacher's report for a student, a question the student took practice on during the set carries an "after practice on <skill>" marker, and the set names the skills they warmed up on. The score does not change.

**Blocked by:** 312, 313 (the session records they add).

**Status:** ready

**Triage:** `ready-for-agent`

---

## Problem Statement

"Right first time" is the set score (`lib/setScore.ts`), and help taken during the set never counted against it. Now that help runs a worked example of a question like Q just before the student answers Q, right first time on that question means something different. Asked, the user (2026-09-15) chose a marker on the report and no change to the score. Warm-ups are one set-level note, not a marker on every question using the skill, because the warm-up is the lesson's own start.

## Acceptance

- [ ] On the teacher's report for a student on Problem Set 6 (`/teacher/a/pset-6/report?student=<id>`), each question the student took practice on shows a small muted marker "after practice on <skill>" beside its result, the skill's student-facing name; a question with none shows nothing and nothing moves
- [ ] The report names the set's warm-up once, near the confidence answer: "Warmed up on non-monic factorising" (joined like the chat joins names), or nothing when there was none
- [ ] Classmates' markers come from ticket 314's story, Sam's from his session
- [ ] `lib/setScore.ts` is unchanged and a test holds that practice never changes a score
- [ ] Sam's own report on his iPad is unchanged (a student-side marker is a FUTURE_FEATURES entry)
- [ ] Wording describes behaviour, never a trait (no "struggled", "needed help")
- [ ] vitest, eslint, tsc, next build, check:laptop; click-through at 1280×800 and 1440×900 on three reports (Sam after practice on Q2 and a warm-up, a classmate with a marker, Priya with none): markers on one line, nothing moves, no sideways scroll
- [ ] Ticket docs: `architecture/317.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES
