# 244: Every record carries what review made of its mistakes

## Files touched

| File | What it does |
| --- | --- |
| `data/recordReview.ts` | `SetReview` (second submissions by student, one `GroupVersion` per group per problem: a rework, a scripted try, or `firstOf` a member) and `withReview`, which writes them onto the records as `Classmate.review`. |
| `data/pset1..5/review.ts` | Each finished set's review: `solution(k)` for a fixed problem's second submission and a solved group's rework, `lastTry(student)` for an unsolved one. |
| `data/pset1..5/classmates.ts` | The records are built as before, then exported through `withReview` (`PSN_SAM`, `PSN_CLASSMATES` keep their names). |
| `data/classmates-review.ts` | Problem Set 6's review; sky's versions are the demo group's script (`RECOGNITION_REWORK`, the Q7 last try, Q9's model solution). |
| `data/classmates.ts` | `CLASSMATES = withReview(RECORDS, SET6_REVIEW)`. |
| `data/story.ts` | `ReviewOutcome`, `ReviewCase`, `StoryReview`, and `STORY_REVIEW`: every student's wrong problems per set, the outcome and the hand-checked reasoning. |
| `lib/reviewRule.ts` | `reviewByRule`: the agreed rules applied literally (one-off, repeated with a helper, habit; one version per group; scripted groups), with `conflict` where the rules disagree. |
| `lib/classStory.ts` | `recordOutcomes`, `reviewMismatches` (records vs sheet vs rules vs versions); the markdown sheet gains the Review rule and a review table and reasons per set. |
| `lib/report.ts` | `recordReviews(record, problems, over)` hides a second submission until individual review is finished and a group's version until group review is; `reviewStagesOver(stages)`; `ALL_REVIEW_STAGES`. |
| `app/teacher/report/TeacherReport.tsx` | Passes the set's finished review stages (`assignmentStages` at `useNow`) to `recordReviews`. |
| `components/OutcomeTiles.tsx` | `noteInLabel`: the not-solved note as Incorrect's second label line, on one line (the teacher's report), so a record with unsolved problems is no taller; the student report keeps it under the tiles. |
| `app/teacher/report/TeacherReport.tsx` (layout) | `teacherNoteFloor(n)` widens Incorrect 28 px per unsolved problem; "· Not solved in group review" sits beside the open problem's outcome eyebrow instead of under its versions; the skills card grows to the page's spare height (a layout effect writing `min-height`, observed on the frame and the boxes that size the page), and `Versions` scales a working still too tall for the card down whole (`zoom` from two readings of the panel's height), so no working scrolls; the commentary's idea rows are 3 px top and bottom (were 4) so the longest commentary fits under ticket 266's raised head. |
| `specs/class-story.md` | Regenerated (`npm run story:sheet`). |
| `data/story.test.ts`, `data/finishedSets.test.ts`, `data/recordReview.test.ts`, `lib/report.test.ts` | Sheet review part complete; every set's records equal it and the rules; the checker bites; sky equals Sam's run; `withReview` changes nothing else; stage gating skip by skip. |

## How it connects

```
 data/story.ts STORY (statuses, habits) ──────────────┐
                                                      ▼
 data/psetN/classmates.ts (first submissions) ─► lib/reviewRule.ts reviewByRule ◄244
 data/classmates.ts RECORDS                         one-off  → own rework
            │                                       repeated → group (a groupmate without it)
            │                                       habit    → still wrong, group's last try
            │                                       one version per group; sky on Set 6 = script
            │                                                 │
            │                                                 ▼  (held equal in tests)
            │                     data/story.ts STORY_REVIEW ◄244 ── lib/classStory.ts renderClassStory
            │                        cases {q, outcome, why}          └─► specs/class-story.md
            │                                                 ▲
            │                                                 │ reviewMismatches ◄244
 data/psetN/review.ts ◄244 ─┐                                 │ (data/story.test.ts,
 data/classmates-review.ts ◄244                               │  data/finishedSets.test.ts)
   second: {student: {pid: lines}}                            │
   groups: {colour: {pid: rework | lastTry | script}}         │
            │                                                 │
            ▼                                                 │
 data/recordReview.ts withReview ◄244 ──► Classmate.review ───┘
   (seating: data/groups.ts DEFAULT_GROUPS)       │
                                                  ▼
 lib/assignments.ts assignmentStages ──► lib/report.ts reviewStagesOver ◄244
                                                  │ over: individual? group?
                                                  ▼
                                   lib/report.ts recordReviews(record, problems, over) ◄244
                                                  │ Reviews {first, second, group?}
                                                  ▼
                               columnsOf / shownVersions (ticket 243, unchanged)
                                                  │
                                                  ▼
                        app/teacher/report/TeacherReport.tsx  What happened tiles, versions side by side
```

The first submission (`attempts`, `wrong`, `done`) is untouched, so the Class View's statuses, the history pills and the Mistakes view read exactly what they did.
