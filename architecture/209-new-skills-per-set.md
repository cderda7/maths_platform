# 209: New skills are chosen per set

## Files touched

| File | What it does |
| --- | --- |
| `data/taxonomy.ts` | Home categories only (version `methods-2`): the null factor law in Functions › Zeros, the discriminant in Algebra › Equations, the binomial identity (merged with special products) in Algebra › Expanding & factorising, surds in Number; Unit 2–4 leaves homed (Number, Sequences & series, Calculus, Statistics). `NEW_SKILLS = "new"` is a `CategoryId` with no groups, last in `CATEGORY_ORDER`; `isFlat`; `LEAF_ALIASES` + `resolveLeaf` map retired ids. `unitOf`, `categoryLabel`, `FLAT_CATEGORIES` removed. |
| `data/types.ts` | `Assignment.newSkills`: the set's New skills. |
| `data/assignment.ts`, `data/pset5/assignment.ts` | Set 6 declares `[discriminant, nfl]`, Set 5 `[nfl, binomial]`; tags renamed. |
| `data/evaluation.ts`, `data/pset5/evaluation.ts`, `data/practice.ts`, `lib/warmup.ts`, `lib/session.ts`, `scripts/warmup-leaves.json` | The new leaf ids (names unchanged). `hydrateSession` resolves stored leaves. |
| `lib/hierarchy.ts` | `SetScope`, `columnOf`, `homeLeaves`; `hierarchyFor(ev, set)` routes a listed skill to `categories.new` and out of its home; `HierarchyResult.newSkills`; `categoriesTouched`, `sessionHierarchy`, `classmateHierarchy`, `restrictTo` per set. |
| `lib/newSkills.ts` (new) | `newSkillCandidates`, `inferNewSkills` (focus ≥ 2 problems, not assessed under its home in the last two sets), `FOCUS_PROBLEMS`, `RECENT_SETS`. |
| `lib/assignments.ts` | Bundle `newSkills` (was `unitNumber`); `recentSets(id, n)`. |
| `lib/assignment.ts`, `lib/classroom.ts` | `activeAssignment.newSkills`: Create's stored list, else the fixture's kept to the chosen problems; `CreatedAssignment.newSkills` (was `unit`). |
| `lib/review.ts` | `ReviewState.newSkills` (was `unit`); `reviewNewSkills` (candidates, inferred, chosen, changed). |
| `app/teacher/assignments/NewSkills.tsx` (new; `UnitFocus.tsx` deleted) | The pathway step's New skills card: chips, inferred on, click to switch, "use suggested". |
| `app/teacher/assignments/create/review/PathwayStep.tsx`, `ReviewAssignment.tsx` | Show the card; Create stores the chosen list. |
| `components/HierarchyDrill.tsx` | Flat tree from `result.newSkills`; home groups skip them; cross-column jumps by `columnOf`. |
| `components/SkillColumns.tsx`, `app/teacher/TeacherLive.tsx` | Pass the set; the "Unit n" label beside the pill is gone. |
| `app/teacher/report/TeacherReport.tsx`, `app/student/screens/ReportScreen.tsx`, `lib/setHistory.ts` | Roll up with the set's scope. |
| `lib/examples.ts`, `app/teacher/whole-class/*` | `newSkill` badge ("new skill") from the set's `newSkills`. |
| `lib/unit.ts`, `lib/unit.test.ts` | Deleted. |
| Tests | `lib/newSkills.test.ts` (new); routing and no-double-count in `lib/hierarchy.test.ts`; aliases in `data/taxonomy.test.ts`; stored ids in `lib/session.test.ts`; bundles in `lib/assignments.test.ts`; `reviewNewSkills` in `lib/review.test.ts`. |

## How it connects

```
  data/taxonomy.ts                       data/assignment.ts (Set 6)      data/pset5/assignment.ts
  one home per skill                     newSkills [disc, nfl]           newSkills [nfl, binomial]
  LEAF_ALIASES ─► resolveLeaf                     │                               │
        │                                         └──────────┬────────────────────┘
        │ (stored ids: session, created set)                 ▼
        ▼                                         lib/assignments.ts REGISTRY
  lib/session.ts hydrateSession                   bundle.newSkills ◄── lib/assignment.ts activeAssignment
                                                  recentSets(id, 2)        ▲  (Create's stored list,
                                                         │                 │   else fixture ∩ problems)
                                                         ▼                 │
  Create review ── lib/review.ts reviewNewSkills ── lib/newSkills.ts ──────┘ assignment/create
  (NewSkills.tsx chips, review.newSkills)            inferNewSkills          { newSkills }
                                                         
  bundle / Assignment = SetScope { problems, newSkills }
            │
            ▼
  lib/hierarchy.ts hierarchyFor(ev, set)
    listed leaf ──► categories.new      (columnOf)
    other leaf  ──► home group ──► home category   (homeLeaves)
            │
            ├─► TeacherLive (Class View) ─► HierarchyDrill: flat "new" tree, home trees without it
            ├─► TeacherReport / student ReportScreen ─► SkillColumns
            ├─► lib/setHistory.ts (earlier set's categories.new = New skills pill history)
            └─► lib/examples.ts optionsFor ─► ExamplePicker "new skill" badge
```
