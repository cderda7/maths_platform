# Architecture — Edexia · Maths (QCE Methods mockup)

Running architecture record. One section per completed screen, in build order; per-screen detail
lives in `architecture/<nn>-<slug>.md`. All paths below are relative to `roughdraft_sept7/`, where
the mockup was moved on 8 Sep 2026. This is a design-only mockup: Next.js 16 App Router,
React 19, Tailwind 4, KaTeX, no backend, all data static under `data/`.

## System diagram

```
                                   ┌──────────────────────────────────────────────┐
                                   │ app/layout.tsx                               │
                                   │  fonts · katex.css · globals.css (@theme)    │
                                   │  ┌────────────┐                              │
                                   │  │ Nav.tsx    │──▶ Brand.tsx                 │
                                   │  └────────────┘                              │
                                   └───────────────────┬──────────────────────────┘
                                                       │ {children}
        ┌──────────────────────────────────────────────┼───────────────────────────────────────┐
        │                                              │                                       │
        ▼ student routes                               ▼ /  (02 role picker)                   ▼ teacher routes
┌───────────────────────────────┐                                              ┌────────────────────────────────────┐
│ /student            (03) page │                                              │ /teacher              (08) page    │
│ /student/work    (04,11) page─┼─▶ WorkFlow.tsx ──▶ WorkingEditor.tsx (11) │ /teacher/assignments/new (09) page─┼─▶ NewAssignment.tsx
│ /student/tutor      (05) page─┼─▶ TutorScreen.tsx     (client, ?turn&help)  │ /teacher/students/[id]   (10) page─┼─▶ StudentDetail.tsx
│ /student/check-in   (06) page─┼─▶ CheckInScreen.tsx   (client)              └──────────────────┬─────────────────┘
│ /student/teacher-view (07) page┼─▶ TeacherViewScreen.tsx (client)                               │
└───────────────┬───────────────┘                                                                │
                │                                                                                │
                │   server page.tsx parses URL ──▶ init props ──▶ client screen owns state       │
                │                                                                                │
                ▼                                                                                ▼
┌──────────────────────────────────────────┐                  ┌────────────────────────────────────────────────┐
│ components/  (shared kit, no page deps)  │                  │ data/  (static TypeScript, no fetching)        │
│                                          │                  │                                                │
│  ui.tsx        Card Eyebrow H1 H2        │                  │  types.ts ◀───────── every file below          │
│                Button Avatar             │                  │                                                │
│  Tag.tsx       DifficultyTag SubskillChip│──── reads ──────▶│  subskills.ts  SUBSKILLS SUBSKILL_MAP PREREQ_IDS│
│                StatusDot STATUS_WORD     │                  │  problems.ts   PROBLEMS PROBLEM_MAP ASSIGNMENT │
│  Math.tsx      M  (katex.renderToString) │                  │  students.ts   STUDENTS STUDENT_MAP            │
│  StepTrace.tsx StepTrace MarkerLegend ───┼──── reads ──────▶│  flows.ts      FLOWS {priya, jordan}           │
│  HelpPicker.tsx HelpPicker HelpContentView│                  │  chat.ts       CHAT_SCRIPT HELP_Q4             │
│  ConfidenceCheck.tsx                     │                  │  teacher.ts    CLASS_PATTERNS HINT_SUGGESTIONS │
│  Brand.tsx     Brand BrandMark           │                  │                JORDAN_{REPORT,HIGHLIGHTS,CHECKINS}│
└──────────────────────────────────────────┘                  └────────────────────────────────────────────────┘

                                 ┌────────────────────────────────────────────────┐
                                 │ lib/  (pure logic, unit-tested)                │
                                 │  evaluate.ts  normalize · toTex · toPlain      │
                                 │               evaluateAttempt · planNext       │──▶ reads data/problems, data/subskills
                                 │  evaluate.test.ts (vitest)                     │
                                 └────────────────────────────────────────────────┘

Dependency rule: app ──▶ components ──▶ data ──▶ types, and app ──▶ lib ──▶ data.  Nothing points the other way.
```

## Key data flows

```
 Step-trace feedback (the core pattern)
   Evaluation { steps: EvalStep[] , exercised, next: NextStep }
        │                 │ marker: sound | shaky | slip | unclear
        │                 ▼
        │            StepTrace.tsx ──▶ rendered in WorkFlow (04), TutorScreen (05), StudentDetail (10)
        └── next ──▶ "natural next step" card in WorkFlow (declinable)

 One report, two audiences
   teacher.ts JORDAN_REPORT ──┬──▶ TeacherViewScreen (07)  student sees it verbatim
                              └──▶ StudentDetail (10)      teacher sees the same text

 Chat drives the trace
   chat.ts CHAT_SCRIPT[turn].trace ──▶ TutorScreen right column (05)

 Live attempt (Sam, who hasn't started)
   WorkingEditor lines[] ──▶ lib/evaluate.ts evaluateAttempt ──▶ Evaluation ──▶ same StepTrace / NextStepCard
   data/problems.ts solution[] (labelled) + missteps[] are what the evaluator recognises

 Deep links
   /student/work?who=jordan&stage=1&phase=evaluated ──▶ work/page.tsx ──▶ WorkFlow init
   /student/work?who=sam&problem=q2&lines=a|b|c&confidence=certain&phase=evaluated ──▶ live attempt, checked
   /student/tutor?turn=5&help=example               ──▶ tutor/page.tsx ──▶ TutorScreen init
```

## Screens, in build order

| # | Screen | Route | Commit | Note |
|---|---|---|---|---|
| 01 | Scaffold, design system, data layer | — | `013b769` | [architecture/01-scaffold.md](architecture/01-scaffold.md) |
| 02 | Home / role picker | `/` | `d6b7841` | [architecture/02-home.md](architecture/02-home.md) |
| 03 | Practice landing | `/student` | `4fb7e94` | [architecture/03-practice-landing.md](architecture/03-practice-landing.md) |
| 04 | Working through (differentiated pacing) | `/student/work` | `6d13480` | [architecture/04-working-through.md](architecture/04-working-through.md) |
| 05 | Tutor chat + live evaluation | `/student/tutor` | `5646e90` | [architecture/05-tutor.md](architecture/05-tutor.md) |
| 06 | Confidence check-in | `/student/check-in` | `a2f4d1a` | [architecture/06-check-in.md](architecture/06-check-in.md) |
| 07 | What your teacher sees | `/student/teacher-view` | `a797a89` | [architecture/07-teacher-view.md](architecture/07-teacher-view.md) |
| 08 | Class dashboard | `/teacher` | `cf7f5f2` | [architecture/08-class-dashboard.md](architecture/08-class-dashboard.md) |
| 09 | Assignment creation | `/teacher/assignments/new` | `a05e9ec` | [architecture/09-assignment-builder.md](architecture/09-assignment-builder.md) |
| 10 | Student detail + cleanup | `/teacher/students/[id]` | `29b8656` | [architecture/10-student-detail.md](architecture/10-student-detail.md) |
| 11 | Live attempt: a student who hasn't started | `/student/work` (Sam) | — | [architecture/11-live-attempt.md](architecture/11-live-attempt.md) |

## Conventions worth carrying into the real build

- **Server `page.tsx` + client `Screen.tsx` split.** The server page reads params and hands an
  `init` object down. Client components never read the URL themselves, which avoids
  setState-in-effect and makes every mid-flow state addressable.
- **Components read data, never pages.** `Tag.tsx` and `StepTrace.tsx` import `SUBSKILL_MAP`
  directly so a chip needs only an id.
- **Vocabulary lives in `data/types.ts`.** Marker kinds (sound / shaky / slip / unclear),
  subskill statuses (secure / developing / gap / unseen), QCE difficulty tags, confidence levels.
  Rationale for each is in `decisions_log.md`.
- **`lib/` is for pure, testable logic.** The simulated step evaluator lives there with its
  vitest suite. Components and pages stay presentational; the real build swaps the evaluator for
  a model call behind the same `Evaluation` type.
- **Server components must not import values from `"use client"` modules.** They arrive as client
  references. Keep shared constants in `data/` or inline them.
