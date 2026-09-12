# 163 · The teacher bar's tabs sit at the right as indigo pills; "New assignment" is a white pill

Route: every `/teacher/*` page (the bar is the frame's fixed top row).

## Files touched

| File | What it does |
|---|---|
| `app/teacher/TeacherChrome.tsx` | The bar: the brand alone at the left; at the right one row of the pathway-gated tabs (`nav[data-teacher-tabs]`, indigo pills, the current page filled deep), "New assignment" (a white pill with an ink border, `ml-1.5` past the row's gap), the teacher's name and avatar. Every pill carries a 1 px border (transparent on the tabs) so all stand the same height. |

## How it connects

```
 TeacherChrome (app/teacher/TeacherChrome.tsx)      zoom 0.72, max-w-[1640px] px-6 py-4
 ┌────────────────────────────────────────────────────────────────────────────────────────┐
 │ <Brand/>                    (Class) (Mistakes) (Groups)  ( New assignment )  Ms Okafor MO │
 │                              └── TEACHER_TABS filtered ──┘   └─ data-new-assignment ─┘   │
 │                                  by pathwayOf(useClassroom())                            │
 └────────────────────────────────────────────────────────────────────────────────────────┘
   tab, not current   bg-accent-soft  text-accent-deep   hover bg-accent-line
   tab, current       bg-accent-deep  text-white         aria-current="page"  (path === href)
   New assignment     bg-white  border-ink  text-ink     hover bg-cream-deep  → /teacher/assignments/create
```

Was: the tabs beside the brand at the left as plain `text-ink-soft` words (the current one soft indigo), "New assignment" the soft indigo pill at the right.

## Verified by

vitest, eslint, tsc, `next build`; `nav163.mjs` (session `203c4a61-…`'s scratchpad, app on 3301 / CDP 9601): `/teacher`, `/teacher/mistakes`, `/teacher/groups`, `/teacher/assignments/create` at 1400 and `/teacher` at 1280: the three tabs then New assignment, name and avatar in that order in the right half of the bar, on one line at one height, inside the frame; the current page's tab deep indigo on white text with `aria-current`, the others soft indigo, none current on the create screen; New assignment white with a 1 px ink border (reads 1.39 px under the zoom) and ink text, cream on hover without resizing; screenshots of both widths read by eye.
