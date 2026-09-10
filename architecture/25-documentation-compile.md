# 25 · Documentation compile

No routes. Files: `README.md` (root and the app's, since merged into one), `ARCHITECTURE.md`, `DECISION_LOG.md`,
`FUTURE_FEATURES.md`, `CLAUDE.md`, this note.

## What changed

| File | What it does |
|---|---|
| app `README.md` (now the root `README.md`) | Recompiled for the finished state: the two specs, the lesson in order (creation → hand in → detective review → group → whole-class → report), the teacher surfaces, the `?pathway=` deep links and three useful starts, where things are |
| `README.md` (root) | Points at both specs and tickets 01–25; names `FUTURE_FEATURES.md` |
| `ARCHITECTURE.md` | Commit hashes filled for 17–24; row 25; the system diagram had been folded ticket by ticket (classroom store, pathway, assignment, examples, frozen, the new routes and stages) |
| `DECISION_LOG.md` | Entries were written as each decision was made: the copy rule, two stores, pathway as a rule, ink in the session, detective feedback and the guard, advances as deadlines, the board's anonymity seam, the derived freeze and atomic Project |
| `FUTURE_FEATURES.md` | Final pass: everything deferred during the build is present (see the file) |
| `CLAUDE.md` | Layout points at the app folder (now the repo root); the future-features policy stands |

## How it connects

```
 specs/spec2.md ──▶ tickets/17..25 ──▶ architecture/17..25 ──▶ ARCHITECTURE.md (system diagram + table)
                                   └──▶ DECISION_LOG.md (one entry per significant decision)
                                   └──▶ FUTURE_FEATURES.md (everything scoped out, generously)
 README.md (root) ──▶ app README.md (demo script, deep links, where things are; one file since ticket 60)
```

## Known deviations from spec v3, recorded here

- The frozen screen shows the two versions **side by side** rather than stacked when a problem
  was reworked: on the landscape iPad this keeps both fully visible; the order is still handed-in
  then reworked, left to right.
- Board counts use students who handed in the problem as the denominator, as agreed in the
  interview; classmates' correct work is the model solution because the fixtures only script
  their mistakes.
- `lib/` derivations still run over the fixture's four problems when the teacher picks a subset;
  the student screens filter (see `FUTURE_FEATURES.md`).
