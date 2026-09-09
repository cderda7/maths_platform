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
 │ /teacher/assignments/new         │
 │   NewAssignment ▶ PathwayMap     │
 │   └▶ StudentApp (client)         │                │   useBatchedSession(3 s)         │
 │       useStudentSession()        │                │   subskillStatuses · caution     │
 │       └▶ IpadStage ▶ StudentChrome│               │   classmates (static fixture)    │
 │            └▶ screens/            │               └──────────────┬───────────────────┘
 │               Overview ▶ Practice │                              │ reads every 3 s
 │               ▶ Confidence ▶ Working ─▶ DrawPad (canvas ink)     │
 │                                  ├▶ "Read as" column             │
 │                                  └▶ PromptModal · PracticeOverlay · HelpPicker
 │               ▶ Feedback (red / blue / clue / star) · Waiting   │
 │               ▶ Rework (clue only; second version on the pad)   │
 │               ▶ GroupPass (all-correct) ▶ GroupDiscuss (no marks)│
 │               ▶ Report (teacher's colours + reflection → sent)   │
 │               ▶ Peers (mastery only: class struggles, counts)    │
 │               ▶ History (final only; compare scroll-synced)      │
 │               DiagnosticModal over any stage while a push is pending
 └───────────────┬──────────────────┘                               │
                 │ dispatch(action)                                 │
                 ▼                                                  ▼
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ lib/store.ts   one StudentSession · localStorage snapshot · BroadcastChannel        │
 │                useStudentSession · useBatchedSession · useNow · resetSession        │
 │                dispatch(action) runs the reducer under env { pathway } from …       │
 │ lib/classroom-store.ts  ClassroomState (teacher-owned, own key + channel)           │
 │                useClassroom · dispatchClassroom · resetClassroom                    │
 │ lib/classroom.ts    CreatedAssignment { title, problemIds, pathway } · pathwayOf    │
 │ lib/assignment.ts   activeAssignment(classroom) → created title + problems, or fixture│
 │ lib/pathway.ts      REVIEW_ORDER · successors · nextStage · pathwaySentence/Chip    │
 │ lib/session.ts      StudentSession · sessionReducer(s, a, env) · sessionAt (pure)   │
 │ lib/recognition.ts  nextLine · afterUndo  (burst of strokes → scripted line)        │
 │   session.ink / reworkInk: strokes per problem, popped with lines on undo/clear      │
 │ lib/evaluate.ts     evaluateLine(problem, tex) → ok | wrong | unclear               │
 │ lib/escalation.ts   recordMistake · requestHelp → { trigger, cautioned }            │
 │ lib/status.ts       subskillStatuses · problemsStarted  (teacher-side derivation)   │
 │ lib/feedback.ts     runKind · feedbackFor → lines, standouts, slips, clue, clean     │
 │ lib/group.ts        computePhases (∩ correct / ∪ wrong) · groupPlan → DiscussionView │
 │ lib/report.ts       reportFacts · confidenceSentence  (same text on both sides)      │
 │ lib/mistakes.ts     mistakesByProblem → problem → rows (live student + classmates)   │
 │ lib/peers.ts        peerStruggles (counts only) · isMastery                          │
 │ lib/versions.ts     versionsOf (handed in / after rework) · alignVersions            │
 │ lib/groups.ts       reviewGroups → per group: member lines + one shared note         │
 │ lib/diagnostic.ts   isCorrect                                                       │
 └───────────────────────────────────────┬────────────────────────────────────────────┘
                                         ▼ reads
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ data/  (static TypeScript, no fetching)                                            │
 │   types.ts        SubskillId · SubskillStatus · Problem · Assignment · Confidence · Stage │
 │   subskills.ts    SUBSKILLS · SUBSKILL_MAP · PREREQ_IDS · TARGET_ID                │
 │   assignment.ts   ASSIGNMENT (4 problems, labelled solutions) · PRACTICE · DEMO_STUDENT │
 │   recognition.ts  RECOGNITION[problemId] (scripted run) · RECOGNITION_REWORK (corrected) │
 │   evaluation.ts   EVALUATION[problemId][tex] → LineVerdict (ok/wrong, subskill, clue)    │
 │                   STANDOUT[problemId][tex] → { when: strong|weak|both, why }              │
 │   practice.ts     PRACTICES[subskill]: one isolated practice problem each · PRACTICE     │
 │   classmates.ts   CLASSMATES (rows, wrong sets, attempts, group lines) · groups          │
 │   diagnostic.ts   DIAGNOSTICS: the live multiple-choice question the teacher can push    │
 └────────────────────────────────────────────────────────────────────────────────────┘
                 ▲ reads (a chip needs only an id)
 ┌───────────────┴────────────────────────────────────────────────────────────────────┐
 │ components/  (presentational kit, no page deps)                                    │
 │   ui.tsx  Card Eyebrow H1 H2 Button Avatar    Math.tsx  M (katex.renderToString)   │
 │   Tag.tsx DifficultyTag SubskillChip StatusDot STATUS_WORD                         │
 │   Brand.tsx Brand BrandMark                   IpadStage.tsx  bezel + scale-to-fit  │
 │   DrawPad.tsx  pointer events → ink; reports pen-down and burst-end(strokeCount)   │
 │   InkView.tsx  read-only SVG of stored strokes, cropped and fitted to its box       │
 │   PadSection.tsx  pad + Undo/Clear      ReadAs.tsx  transcription column + shimmer  │
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
| 05 | Teacher live subskill status and caution flag | `/teacher`, `/student` | `a816258` | [curr_version/architecture/05-teacher-live-status-and-caution-flag.md](curr_version/architecture/05-teacher-live-status-and-caution-flag.md) |
| 06 | Feedback layers on submission | `/student?stage=feedback` | `c09798e` | [curr_version/architecture/06-feedback-layers.md](curr_version/architecture/06-feedback-layers.md) |
| 07 | Independent rework stage | `/student?stage=rework` | `6dbf08f` | [curr_version/architecture/07-independent-rework.md](curr_version/architecture/07-independent-rework.md) |
| 08 | Simulated group review, two phases | `/student?stage=group-pass`, `…=group-discuss` | `8b2f174` | [curr_version/architecture/08-simulated-group-review.md](curr_version/architecture/08-simulated-group-review.md) |
| 09 | Student final report and reflection | `/student?stage=report` | `7c66e0a` | [curr_version/architecture/09-student-final-report.md](curr_version/architecture/09-student-final-report.md) |
| 10 | Teacher final report | `/teacher/report` | `d3fb1c9` | [curr_version/architecture/10-teacher-final-report.md](curr_version/architecture/10-teacher-final-report.md) |
| 11 | Teacher mistake view | `/teacher/mistakes` | `5ac30a1` | [curr_version/architecture/11-teacher-mistake-view.md](curr_version/architecture/11-teacher-mistake-view.md) |
| 12 | Peer-struggle screen (Tier 2) | `/student?stage=report&run=strong` → peers | `a53863a` | [curr_version/architecture/12-peer-struggle-screen.md](curr_version/architecture/12-peer-struggle-screen.md) |
| 13 | Submission history (Tier 2) | `/student?stage=history` | `67db35d` | [curr_version/architecture/13-submission-history.md](curr_version/architecture/13-submission-history.md) |
| 14 | Teacher review-groups view (Tier 2) | `/teacher/groups` | `0c268b0` | [curr_version/architecture/14-teacher-review-groups-view.md](curr_version/architecture/14-teacher-review-groups-view.md) |
| 15 | Teacher original vs final (Tier 2) | `/teacher/compare` | `3fb499b` | [curr_version/architecture/15-teacher-original-vs-final.md](curr_version/architecture/15-teacher-original-vs-final.md) |
| 16 | Diagnostic MCQ push (Tier 2) | `/teacher` → `/student` interrupt | `7b3d49c` | [curr_version/architecture/16-diagnostic-mcq-push.md](curr_version/architecture/16-diagnostic-mcq-push.md) |
| 17 | Copy sweep to the rule (spec v3) | every route | `cabb007` | [curr_version/architecture/17-copy-sweep.md](curr_version/architecture/17-copy-sweep.md) |
| 18 | Pathway model and routing | `/student?pathway=…`, `/teacher` chip | `dc5ee2a` | [curr_version/architecture/18-pathway-model-and-routing.md](curr_version/architecture/18-pathway-model-and-routing.md) |
| 19 | Assignment creation with the pathway map | `/teacher/assignments/new` | `2af6872` | [curr_version/architecture/19-assignment-creation-with-pathway-map.md](curr_version/architecture/19-assignment-creation-with-pathway-map.md) |
| 20 | Persisted ink | `/student` working, rework, history | _this commit_ | [curr_version/architecture/20-persisted-ink.md](curr_version/architecture/20-persisted-ink.md) |

## Conventions

- **Server `page.tsx` reads params and hands an `init` object to a client screen.** Client
  components never read the URL themselves.
- **Components read data, never pages.** A chip needs only a subskill id.
- **Vocabulary lives in `data/types.ts`.** Rationale in `DECISION_LOG.md`.
- **`lib/` is for pure, testable logic** (escalation counter, group-phase computation).
- **Copy follows the rule in `curr_version/specs/spec2.md`**: headlines two to four words, no
  explanatory sentence that doesn't change what the user does next, labels over sentences, at
  most one helper line per screen, no legends. The detective sentence is the one exception.
- **Student screens are designed at true iPad size** (1180×820) inside `IpadStage`; the stage
  scales, layouts never reflow.
