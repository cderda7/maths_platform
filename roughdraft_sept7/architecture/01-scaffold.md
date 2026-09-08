# 01 · Scaffold, design system, static data layer

Commit `013b769`. Foundation everything else sits on: Next.js 16 app shell, Tailwind 4 theme
tokens, KaTeX, the shared component kit, and the whole static data layer.

## Files touched

| File | Role |
|---|---|
| `app/layout.tsx` | Root layout. Loads Playfair Display + Inter via `next/font`, imports KaTeX CSS and `globals.css`, mounts `Nav` above every page. |
| `app/globals.css` | Tailwind `@theme` tokens: ink navy, indigo accent, warm paper ground, and the four marker colours (sound / shaky / slip / unclear) with soft + line variants. |
| `components/Brand.tsx` | `Brand` wordmark and `BrandMark` icon. |
| `components/Nav.tsx` | Client component. Two link groups (student / teacher) with active-state from `usePathname`. |
| `components/ui.tsx` | Primitives: `Card`, `Eyebrow`, `H1`, `H2`, `Button`, `Avatar`. |
| `components/Tag.tsx` | `DifficultyTag` (QCE degree-of-difficulty), `SubskillChip`, `StatusDot`, `STATUS_WORD` lookup. |
| `components/Math.tsx` | `M`: renders a LaTeX string with `katex.renderToString`. Works in server and client components. |
| `components/StepTrace.tsx` | The core feedback pattern: vertical derivation with per-step marker, label, subskill chip, note. Also `MarkerBadge`, `MarkerLegend`. |
| `components/ConfidenceCheck.tsx` | Four-level confidence picker plus `CONFIDENCE_OPTIONS`. |
| `components/HelpPicker.tsx` | `HelpPicker` (example / hint / video) and `HelpContentView`; exports `HelpKind`. |
| `data/types.ts` | All domain types: `Problem`, `EvalStep`, `MarkerKind`, `FlowStage`, `NextStep`, `Student`, `GapStatus`, `Confidence`, … |
| `data/problems.ts` | `PROBLEMS`, `PROBLEM_MAP`, `ASSIGNMENT`, `ASSIGNMENT_ORDER` (7 core + 3 warm-ups). |
| `data/subskills.ts` | `SUBSKILLS`, `SUBSKILL_MAP`, `PREREQ_IDS` (the five prerequisite subskills). |
| `data/students.ts` | Twelve-student roster, `STUDENTS` + `STUDENT_MAP`. |
| `data/flows.ts` | `FLOWS`: scripted stage-by-stage journeys for Priya and Jordan. |
| `data/chat.ts` | `CHAT_SCRIPT`, `CHAT_PROBLEM_ID`, `HELP_Q4`, `HelpContent` type. |
| `data/teacher.ts` | Teacher-side aggregates: `CLASS_PATTERNS`, `HINT_SUGGESTIONS`, `JORDAN_HIGHLIGHTS`, `JORDAN_CHECKINS`, `JORDAN_REPORT`. |
| `package.json`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore` | Tooling. KaTeX is the only non-scaffold dependency. |

## How it connects

```
┌──────────────────────────────────────────────────────────────────────┐
│ app/layout.tsx                                                       │
│   fonts ─┐  katex.min.css ─┐  globals.css (@theme tokens) ─┐        │
│          └─────────────────┴────────────────────────────────┘        │
│   ┌──────────────┐                                                   │
│   │ Nav.tsx      │──▶ Brand.tsx                                      │
│   └──────────────┘                                                   │
│   {children}  ◀── every route page                                   │
└──────────────────────────────────────────────────────────────────────┘

          shared component kit                    static data layer
┌──────────────────────────────┐        ┌────────────────────────────────┐
│ ui.tsx   Card Eyebrow H1 H2  │        │ types.ts  ◀── every data file  │
│          Button Avatar       │        │   │                            │
│ Tag.tsx  DifficultyTag       │───────▶│ subskills.ts  SUBSKILL_MAP     │
│          SubskillChip ───────┼──┐     │ problems.ts   PROBLEM_MAP      │
│          StatusDot           │  │     │ students.ts   STUDENT_MAP      │
│ Math.tsx M (katex) ◀─┐       │  │     │ flows.ts      FLOWS            │
│ StepTrace.tsx ───────┤───────┼──┘     │ chat.ts       CHAT_SCRIPT      │
│ HelpPicker.tsx ──────┘       │        │ teacher.ts    reports/patterns │
│ ConfidenceCheck.tsx          │        └────────────────────────────────┘
└──────────────────────────────┘
   components never import pages; pages import both columns.
```
