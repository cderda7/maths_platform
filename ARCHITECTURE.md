# Architecture — Edexia · Maths (current build, `curr_version/`)

Running architecture record for the closed-loop demo. One section per completed ticket, in build
order; per-ticket detail lives in `curr_version/architecture/<nn>-<slug>.md`. Paths below are
relative to `curr_version/`. Next.js 16 App Router, React 19, Tailwind 4, KaTeX; no backend, all
data static under `data/`. The Sept 7 mockup's record is in `roughdraft_sept7/ARCHITECTURE.md`.

## System diagram

```
 browser tab A · student iPad                       browser tab B · teacher
 ┌──────────────────────────────────┐               ┌──────────────────────────────────┐
 │ /student?stage=  page.tsx (server)│              │ /teacher   page.tsx (server)     │
 │   └▶ StudentApp (client)         │               │   "Where the class is" table     │
 │       useReducer(sessionReducer) │               │   one row: DEMO_STUDENT          │
 │       └▶ IpadStage ▶ StudentChrome│              │   StatusDot per subskill         │
 │            └▶ screens/            │              └───────────────┬──────────────────┘
 │               Overview ▶ Practice │                              │
 │               ▶ Confidence ▶ Working                             │
 └───────────────┬──────────────────┘                               │
                 │  lib/session.ts  StudentSession · sessionReducer · sessionAt  (pure, vitest)
                 │  (no shared state across tabs yet — ticket 05 adds the session store)
                 ▼ reads                                            ▼ reads
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ data/  (static TypeScript, no fetching)                                            │
 │   types.ts        SubskillId · SubskillStatus · Problem · Assignment · Confidence · Stage │
 │   subskills.ts    SUBSKILLS · SUBSKILL_MAP · PREREQ_IDS · TARGET_ID                │
 │   assignment.ts   ASSIGNMENT (4 problems, labelled solutions) · PRACTICE · DEMO_STUDENT │
 └────────────────────────────────────────────────────────────────────────────────────┘
                 ▲ reads (a chip needs only an id)
 ┌───────────────┴────────────────────────────────────────────────────────────────────┐
 │ components/  (presentational kit, no page deps)                                    │
 │   ui.tsx  Card Eyebrow H1 H2 Button Avatar    Math.tsx  M (katex.renderToString)   │
 │   Tag.tsx DifficultyTag SubskillChip StatusDot STATUS_WORD                         │
 │   Brand.tsx Brand BrandMark                   IpadStage.tsx  bezel + scale-to-fit  │
 └────────────────────────────────────────────────────────────────────────────────────┘
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ app/layout.tsx  fonts · katex.css · globals.css (@theme tokens, .ipad-bezel/.screen)│
 │ app/page.tsx    entry: student iPad or teacher view                                │
 └────────────────────────────────────────────────────────────────────────────────────┘

 Dependency rule: app ──▶ components ──▶ data ──▶ types. Nothing points the other way.
```

## Tickets, in build order

| # | Ticket | Routes | Commit | Note |
|---|---|---|---|---|
| 01 | Scaffold, iPad stage, demo assignment fixture | `/`, `/student`, `/teacher` | `bc49ffa` | [curr_version/architecture/01-scaffold.md](curr_version/architecture/01-scaffold.md) |
| 02 | Pre-assignment skill list, practice offer, confidence survey | `/student?stage=…` | _this commit_ | [curr_version/architecture/02-pre-assignment-and-confidence.md](curr_version/architecture/02-pre-assignment-and-confidence.md) |

## Conventions

- **Server `page.tsx` reads params and hands an `init` object to a client screen.** Client
  components never read the URL themselves.
- **Components read data, never pages.** A chip needs only a subskill id.
- **Vocabulary lives in `data/types.ts`.** Rationale in `DECISION_LOG.md`.
- **`lib/` is for pure, testable logic** (escalation counter, group-phase computation).
- **Student screens are designed at true iPad size** (1180×820) inside `IpadStage`; the stage
  scales, layouts never reflow.
