# 01 · Scaffold, iPad stage, demo assignment fixture

Routes: `/`, `/student`, `/teacher`.

## Files touched

| File | What it does |
|---|---|
| `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `vitest.config.mts` | Next 16 / React 19 / Tailwind 4 / KaTeX / vitest toolchain, copied from the roughdraft; vitest passes with no tests |
| `app/globals.css` | Design tokens under Tailwind `@theme` (ink, accent, cream; secure/developing/gap; wrong red and standout blue), fonts, KaTeX sizing, iPad bezel/screen classes |
| `app/layout.tsx` | Fonts (Inter, Playfair Display), KaTeX CSS, no global nav (each side has its own chrome) |
| `app/page.tsx` | Entry: pick the student iPad or the teacher view |
| `app/student/page.tsx` | Assignment overview on the iPad: title, target skill, five prerequisite subskills, four problems typeset |
| `app/student/StudentChrome.tsx` | The frame inside the screen: iPadOS status strip + product top bar with the demo student |
| `app/teacher/page.tsx` | Teacher shell: "Where the class is" table with one row (the demo student), every subskill not seen yet |
| `components/IpadStage.tsx` | Client component: 1180×820 screen in a bezel, scaled to fit the viewport |
| `components/ui.tsx`, `Math.tsx`, `Tag.tsx`, `Brand.tsx` | Presentational kit ported from the roughdraft |
| `data/types.ts` | Vocabulary: `SubskillId`, `SubskillStatus`, `Problem`, `Assignment` |
| `data/subskills.ts` | The six subskills, `PREREQ_IDS`, `TARGET_ID` |
| `data/assignment.ts` | `ASSIGNMENT` (four problems with labelled worked solutions), `DEMO_STUDENT` |
| root `package.json`, `README.md`, `DECISION_LOG.md` | Root scripts now delegate to `curr_version/`; two decisions logged |

## How it connects

```
 browser tab A                                    browser tab B
 ┌──────────────────────────────┐                 ┌──────────────────────────────┐
 │ /student  page.tsx (server)  │                 │ /teacher  page.tsx (server)  │
 │   └▶ IpadStage (client)      │                 │   table: DEMO_STUDENT row    │
 │        └▶ StudentChrome      │                 │   StatusDot per subskill     │
 │             └▶ overview      │                 └──────────────┬───────────────┘
 └──────────────┬───────────────┘                                │
                │ reads                                          │ reads
                ▼                                                ▼
 ┌──────────────────────────────────────────────────────────────────────────────┐
 │ data/   types.ts ◀── subskills.ts (SUBSKILLS, PREREQ_IDS, TARGET_ID)          │
 │                  ◀── assignment.ts (ASSIGNMENT.problems[4], DEMO_STUDENT)     │
 └──────────────────────────────────────────────────────────────────────────────┘
                ▲
                │ reads (chips need only an id)
 ┌──────────────┴───────────────────────────────────────────────────────────────┐
 │ components/  ui.tsx · Math.tsx (KaTeX) · Tag.tsx · Brand.tsx · IpadStage.tsx  │
 └──────────────────────────────────────────────────────────────────────────────┘

 Dependency rule: app ──▶ components ──▶ data ──▶ types. Nothing points the other way.
 The two tabs do not yet share state; ticket 05 adds the cross-tab session store.
```

## Verified by

`npm run build`, `npm run lint`, `tsc --noEmit`, `vitest run` (no tests yet, passes), and
headless-Chrome screenshots of `/`, `/student` and `/teacher` at 1440×1000, plus `/student` at
1100×800 to check the stage scales down.
