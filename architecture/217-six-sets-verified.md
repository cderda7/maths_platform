# 217: Six sets end to end, and the docs

Routes checked: `/teacher` (before and after Create, 1280×800, 1440×900, 1280×600, 1440×700), `/teacher/a/pset-1` … `pset-6` `/class`, `/mistakes`, `/groups`, `/report?student=`, `/teacher/a/pset-6/class?report=<earlier>&student=&open=` and its Return, `/teacher/assignments/create` → `/review`, `/student` (every skip), `/teacher/board`.

## Files touched

| File | What it does |
| --- | --- |
| `lib/setHistory.test.ts` | The registry-wide one-step test is strict again: `unregisteredBetween` (ticket 211's skip for a real pair with an unregistered sheet set between them) is gone, with the `STORY_SETS` import; every set × student × category pair and every newest-vs-today pair is checked with nothing allowed, and Sam's earlier pills likewise. |
| `lib/newSkills.test.ts` | Create's inference over the real registry: `recentSets("pset-6", 2)` is Sets 5 and 4, and `inferNewSkills` over them still gives Set 6's discriminant and null factor law. |
| `app/teacher/TeacherLive.tsx` | The Class View's due line sets the title in upper case (`data-due-title`), so a set made through Create ("Problem Set 6 — Roots of a quadratic") reads like the fixtures and a skip-made set ("PROBLEM SET 6 — …"). |
| `README.md` | "The Classroom's six sets": the sets and their New skills, pinned Live and scrolling Past, history (ticket 237's real-sets-only pills and in-set reports), the class story sheet, how to add a finished set; Create's New skills step, Problem Set 6 routes and the test count brought up to date. |
| `ARCHITECTURE.md` | The six-set diagram folded under the system diagram; the ticket row. |
| `FUTURE_FEATURES.md` | Tickets 210's, 211's, 212's and 215's items that waited on the four sets marked done; a 217 section (Sam's live today against his history, board and class review on a finished set, sentence answers left alone, "Not sent yet" on a past report). |
| `DECISION_LOG.md` | The jump test is strict and Sam's live row stays outside the sheet's one-step contract. |

Not in the repo: the click-through `click217.mjs` and its fixture generator (a throwaway vitest file writing `expected.json` from `data/story.ts`, the finished sets and `categoryHistory`).

## How it connects

```
 data/story.ts  STORY_SETS (6 sets: due, New skills, categories) + STORY (20 × 6 × 6)
      │                                           │
      │ the contract                              │ equality per registered set
      ▼                                           ▼
 data/finishedSets.ts ── PS1 PS2 PS3 PS4 PS5 ──► lib/finishedSets.ts (oldest due first)
                                                   │
 data/assignment.ts (Set 6, live) ────────────────►│
                                                   ▼
                                     lib/assignments.ts REGISTRY
          ┌──────────────────┬───────────────┬────┴────────────┬────────────────────────┐
          ▼                  ▼               ▼                 ▼                        ▼
  Classroom.tsx        TeacherLive      TeacherMistakes    lib/setHistory.ts      lib/newSkills.ts
  pinned Live: PS6     rows, dots,      Groups, reports    earlier sets that      recentSets(pset-6, 2)
  Past: PS5 … PS1      due line (upper) per set            assessed the category, = PS5, PS4 → disc, nfl
                       New skills drill                    ≤ 5, "MON 7 SEP"        (newSkills.test.ts)
                              │                                   │
                              └──── history pill (Link) ◄─────────┘
                                         │ ?report=<earlier>&student=&open=
                                         ▼
                                    ClassView ─► EarlierReport (this set's tabs, earlier ReportBody)
                                         │ pulsing "← Return to PSet 6"
                                         ▼
                                    ?history=<student>&open=<category> ─► TeacherLive history mode

 lib/setHistory.test.ts: every set × student × category, no pair more than one step (no skip)
 click217.mjs (scratchpad): the same on screen for all twenty on Set 6, spot checks on Sets 3, 4 and 5
```
