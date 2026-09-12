# 165 · The teacher bar's tabs sit directly right of the Edexia · Maths brand

Route: every `/teacher/*` page (the bar is the frame's fixed top row).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherChrome.tsx` | The bar: the left group is the brand and the pathway-gated tabs (`nav[data-teacher-tabs]`, indigo pills, the current page filled deep) in a `gap-5` row; the right group is "New assignment" (a white pill with an ink border), the teacher's name and avatar. The pills' classes are ticket 163's unchanged; only the `ml-1.5` on "New assignment" is gone, since nothing sits before it now. |

## How it connects

```
 TeacherChrome (app/teacher/TeacherChrome.tsx)      zoom 0.72, max-w-[1640px] px-6 py-4
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ <Brand/>  (Class) (Mistakes) (Groups)                  ( New assignment )  Ms Okafor MO │
 │ └─ gap-5 ─┘└── TEACHER_TABS filtered ──┘                 └─ data-new-assignment ─┘      │
 │  left group  by pathwayOf(useClassroom())               right group  gap-3              │
 └────────────────────────────────────────────────────────────────────────────────────────┘
   tab, not current   bg-accent-soft  text-accent-deep   hover bg-accent-line
   tab, current       bg-accent-deep  text-white         aria-current="page"  (path === href)
   New assignment     bg-white  border-ink  text-ink     hover bg-cream-deep  → /teacher/assignments/create
```

Was (ticket 163): the brand alone at the left; the tabs at the right end just before "New assignment".

## Verified by

vitest (454), eslint, tsc, `next build`; `nav165.mjs` (session `46148fd9-…`'s scratchpad, app on 3311 / CDP 9611): `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/assignments/create` at 1400 and `/teacher` at 1280: the brand, "· Maths", the three tabs, New assignment, name and avatar in that order; Class starts 14.39 px (20 × 0.72) after "· Maths"; Groups ends at 408 of 1400 (348 of 1280) and New assignment starts at 1090 (1030); the brand, the tabs and New assignment on one centre line, every pill one height; the current page's tab deep indigo with `aria-current`, the others soft, none on the create screen; New assignment white with a 1 px ink border; the gap identical at both widths; clicking Groups opens `/teacher/groups` with Groups current; screenshots at both widths read by eye.
