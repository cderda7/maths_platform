# Architecture — Edexia · Maths (current build, `curr_version/`)

Running architecture record for the closed-loop demo. One section per completed ticket, in build
order; per-ticket detail lives in `curr_version/architecture/<nn>-<slug>.md`. Paths below are
relative to `curr_version/`. Next.js 16 App Router, React 19, Tailwind 4, KaTeX; no backend, all
data static under `data/`. The Sept 7 mockup's record is in `roughdraft_sept7/ARCHITECTURE.md`.

## System diagram

```
 browser tab A · student iPad                        browser tab B · teacher
 ┌──────────────────────────────────┐                ┌──────────────────────────────────┐
 │ /student?stage=  page.tsx (server)│               │ /teacher  page.tsx ▶ TeacherLive │
 │   └▶ StudentApp (client)         │                │   useBatchedSession(3 s)         │
 │       useStudentSession()        │                │   subskillStatuses · caution     │
 │       └▶ IpadStage ▶ StudentChrome│               │   classmates (static fixture)    │
 │            └▶ screens/            │               └──────────────┬───────────────────┘
 │               Overview ▶ Practice │                              │ reads every 3 s
 │               ▶ Confidence ▶ Working ─▶ DrawPad (canvas ink)     │
 │                                  ├▶ "Read as" column             │
 │                                  └▶ PromptModal · PracticeOverlay · HelpPicker
 └───────────────┬──────────────────┘                               │
                 │ dispatch(action)                                 │
                 ▼                                                  ▼
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ lib/store.ts   one StudentSession · localStorage snapshot · BroadcastChannel        │
 │                useStudentSession · useBatchedSession · useNow · resetSession        │
 │ lib/session.ts      StudentSession · sessionReducer · sessionAt  (pure, vitest)     │
 │ lib/recognition.ts  nextLine · afterUndo  (burst of strokes → scripted line)        │
 │ lib/evaluate.ts     evaluateLine(problem, tex) → ok | wrong | unclear               │
 │ lib/escalation.ts   recordMistake · requestHelp → { trigger, cautioned }            │
 │ lib/status.ts       subskillStatuses · problemsStarted  (teacher-side derivation)   │
 └───────────────────────────────────────┬────────────────────────────────────────────┘
                                         ▼ reads
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ data/  (static TypeScript, no fetching)                                            │
 │   types.ts        SubskillId · SubskillStatus · Problem · Assignment · Confidence · Stage │
 │   subskills.ts    SUBSKILLS · SUBSKILL_MAP · PREREQ_IDS · TARGET_ID                │
 │   assignment.ts   ASSIGNMENT (4 problems, labelled solutions) · PRACTICE · DEMO_STUDENT │
 │   recognition.ts  RECOGNITION[problemId]: the lines the pad will "read", in order      │
 │   evaluation.ts   EVALUATION[problemId][tex] → LineVerdict (ok/wrong, subskill, clue)    │
 │   practice.ts     PRACTICES[subskill]: one isolated practice problem each · PRACTICE     │
 │   classmates.ts   CLASSMATES (static rows) · GROUPMATE_IDS (mock review group)           │
 └────────────────────────────────────────────────────────────────────────────────────┘
                 ▲ reads (a chip needs only an id)
 ┌───────────────┴────────────────────────────────────────────────────────────────────┐
 │ components/  (presentational kit, no page deps)                                    │
 │   ui.tsx  Card Eyebrow H1 H2 Button Avatar    Math.tsx  M (katex.renderToString)   │
 │   Tag.tsx DifficultyTag SubskillChip StatusDot STATUS_WORD                         │
 │   Brand.tsx Brand BrandMark                   IpadStage.tsx  bezel + scale-to-fit  │
 │   DrawPad.tsx  pointer events → ink; reports pen-down and burst-end(strokeCount)   │
 │   PracticeCard.tsx  one practice problem, steps revealed one at a time              │
 │   ResetDemo.tsx     restart the shared session in every tab                         │
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
| 02 | Pre-assignment skill list, practice offer, confidence survey | `/student?stage=…` | `5ce1673` | [curr_version/architecture/02-pre-assignment-and-confidence.md](curr_version/architecture/02-pre-assignment-and-confidence.md) |
| 03 | Drawpad with simulated line-by-line recognition | `/student?stage=working` | `bcca326` | [curr_version/architecture/03-drawpad-simulated-recognition.md](curr_version/architecture/03-drawpad-simulated-recognition.md) |
| 04 | Scripted evaluation, escalation counter, practice prompt, "I need help" | `/student?stage=working` | `db5cbb1` | [curr_version/architecture/04-scripted-evaluation-and-escalation.md](curr_version/architecture/04-scripted-evaluation-and-escalation.md) |
| 05 | Teacher live subskill status and caution flag | `/teacher`, `/student` | _this commit_ | [curr_version/architecture/05-teacher-live-status-and-caution-flag.md](curr_version/architecture/05-teacher-live-status-and-caution-flag.md) |

## Conventions

- **Server `page.tsx` reads params and hands an `init` object to a client screen.** Client
  components never read the URL themselves.
- **Components read data, never pages.** A chip needs only a subskill id.
- **Vocabulary lives in `data/types.ts`.** Rationale in `DECISION_LOG.md`.
- **`lib/` is for pure, testable logic** (escalation counter, group-phase computation).
- **Student screens are designed at true iPad size** (1180×820) inside `IpadStage`; the stage
  scales, layouts never reflow.
