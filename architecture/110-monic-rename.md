# 110 · The monic skill is "Monic factorisation"

Route: `/teacher/report?student=<id>` (the skills tree, "Algebra" then "expanding & factorising"), and every teacher screen that shows a leaf's full name.

## Files touched

| File | What it does |
|---|---|
| `data/taxonomy.ts` | The `algebra.expand-factor.monic` leaf is `leaf("Monic factorisation", "monic factorising", …)`: the full name changed, the short form, description and id as before. `STUDENT_NAMES` still maps this leaf to "Factorising" for the student. |

## How it connects

```
 data/taxonomy.ts
   monic: leaf(name: "Monic factorisation", short: "monic factorising")
        │                                          │
        │ leafName(id).name  (teacher)             │ STUDENT_NAMES override (student)
        ▼                                          ▼
   HierarchyDrill leaf node (teacher report)     "Factorising" in the "Which skill?" picker,
   "monic factorisation", lower-cased by CSS      the confidence and peer screens, the chats
```

Sibling of ticket 108: the two leaves now read "Monic factorisation" and "Non-monic factorisation" side by side on the teacher's tree. The student contrast (plain "factorising" against "non-monic factorisation") is as designed.

## Verified by

vitest (340), eslint, `next build`; a headless run (`drill.mjs`) of Mia's teacher report with the factorising group open, listing non-monic factorisation, distributive expansion, monic factorisation, with a screenshot; Q1's student picker (`picker2.mjs`) still reads "Factorising", "Null factor law".
