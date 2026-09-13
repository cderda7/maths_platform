# 187 · Problem Set 1 — Features of a parabola, finished, with all twenty students' work

Routes: `/teacher` (its PAST card), `/teacher/a/pset-1` (lands on Class), `/teacher/a/pset-1/class`,
`/teacher/a/pset-1/mistakes`, `/teacher/a/pset-1/groups`, `/teacher/a/<id>/report?student=<id>` (every
set's individual view, new), `/teacher/report` (now redirects to Problem Set 2's), and Problem Set 2's
Class View history.

## Files touched

| File | What it does |
|---|---|
| `data/pset1/assignment.ts` (new) | `PS1_PROBLEMS`: ten problems on the three forms (ids `ps1-q1` … `ps1-q10`, labels Q1 … Q10, difficulty labels, model solutions tagged with the same leaves as Problem Set 2); `PS1_ASSIGNMENT` (title, Thu 3 Sep, Ms Okafor's goal); `PS1_PATHWAY` individual → group. |
| `data/pset1/evaluation.ts` (new) | `PS1_EVALUATION`: every line anyone wrote on the set, with verdict, tags, clue, note and a five-word mistake name ("guessed pair, not expanded back" on Q4 and Q8). |
| `data/pset1/classmates.ts` (new) | `PS1_SAM` and `PS1_CLASSMATES`: all twenty students' results in the `Classmate` shape, each wrong problem with its working, notes, words, group line; Liam handed nothing in. |
| `data/pset1/pset1.test.ts` (new) | Data integrity (20 students, every wrong problem worked and finished, every line known, tags exist), the registry entry, Mistakes counts, the Classroom card's top gap, the two sets' history. |
| `data/evaluation.ts` | Exports its verdict helpers (`T`, `ok`, `okc`, `wrong`, `A`) for Problem Set 1's table. |
| `lib/evaluate.ts` | `evaluateLine` reads both sets' tables (ids never collide). |
| `data/groups.ts` | `FROZEN_GROUPS["pset-1"]`: the class default seating. |
| `lib/assignments.ts` | Registers `pset-1` (`kind: "finished"`, `name`, pathway, classmates, `sam`); `AssignmentBundle.sam` (Sam's record on a finished set, null on the live one); `earlierAssignmentIds`, `studentRecord`, `assignmentReportHref`. |
| `lib/mistakes.ts` | `MistakeSet.sam`: on a finished set Sam's row and right count come from his record. |
| `lib/history.ts` | `HISTORY_DATES` now all before Sep 3; `historyWith` (simulated five, then real results, the last five; drawn around the oldest real result); `historyDate`. |
| `lib/setHistory.ts` (new) | `earlierResults(id, student, category)` (each earlier finished set's category status for the student) and `categoryHistory` for the Class View. |
| `lib/commentary.ts` | `commentaryFor(student, session, record?)`: a set's record wins. |
| `app/teacher/TeacherLive.tsx` | Sam's row from his record on a finished set; history from `categoryHistory`; "student report" to the set's report; a finished set shows " · complete", no refresh line and no live-lesson cards (group progress, class review, live diagnostic). |
| `app/teacher/TeacherMistakes.tsx` | No live diagnostic beside a finished set's problems; side fix: the count column is a fixed 103 px with tabular figures, so every problem card starts at the same x (an "11/20" card sat 2 px left of an "18/20" one, "10/20 skipped" 6 px right, on both sets). |
| `app/teacher/report/TeacherReport.tsx` | Reads the student's record from the bundle (`studentRecord`, Sam's on a finished set), labels from the set's problems, "← Class view" to the set's Class. |
| `app/teacher/a/[id]/report/page.tsx` (new), `app/teacher/report/page.tsx` | Every set's individual view under its id; the old URL redirects to Problem Set 2's with `?student` kept. |
| `lib/assignments.test.ts` | The Classroom holds both sets. |
| `scripts/laptop-check.mjs` | Problem Set 1's Class, Mistakes, Groups and a report. |

## How it connects

```
 data/pset1/assignment.ts ─ PS1_ASSIGNMENT, PS1_PROBLEMS (ps1-q1…q10), PS1_PATHWAY
 data/pset1/classmates.ts ─ PS1_SAM, PS1_CLASSMATES (attempts: TeX lines per problem)
 data/pset1/evaluation.ts ─ PS1_EVALUATION ──┐
 data/evaluation.ts ─────── EVALUATION ──────┴─► lib/evaluate.ts evaluateLine(pid, tex)
 data/groups.ts ─────────── FROZEN_GROUPS["pset-1"] = DEFAULT_GROUPS
        │
        ▼
 lib/assignments.ts REGISTRY [ pset-2 (live) , pset-1 (finished, sam, name) ]
        │  assignmentBundle("pset-1") { kind finished, problems, classmates, sam, groups }
        │
        ├─► app/teacher/Classroom.tsx ── lib/classroomCards.ts ─► PAST card: done · 19/20 ·
        │                                  top gap "non-monic factorising" (7 students)
        ├─► AssignmentLanding ── every stage over ─► /teacher/a/pset-1/class
        ├─► TeacherLive ── rows: recordRow(sam), recordRow(classmates) ─► hierarchyFor
        │                  history: lib/setHistory.categoryHistory(id, student, cat)
        │                             └─ earlierAssignmentIds(id) ─► finished bundles
        │                                 └─ classmateHierarchy(record) ─► "Sep 3" status
        │                             └─ lib/history.historyWith(simulated Aug × 4 + real)
        ├─► TeacherMistakes ── mistakesByProblem(null, bundle) (sam + classmates)
        ├─► TeacherGroups ── bundle.groups (frozen copy)
        └─► /teacher/a/<id>/report ─► TeacherReport ── studentRecord(bundle, student)
                                                        commentaryFor(…, record)
 /teacher/report?student=x ── redirect ─► /teacher/a/pset-2/report?student=x
```
