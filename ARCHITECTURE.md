# Architecture — Edexia · Maths (current build, `curr_version/`)

Running architecture record for the closed-loop demo. One row per completed ticket, in build
order (01–16 spec v2, 17–25 spec v3); per-ticket detail lives in `curr_version/architecture/<nn>-<slug>.md`. Paths below are
relative to `curr_version/`. Next.js 16 App Router, React 19, Tailwind 4, KaTeX; no backend, all
data static under `data/`. The Sept 7 mockup's record is in `roughdraft_sept7/ARCHITECTURE.md`.

## System diagram

```
 browser tab A · student iPad                        browser tab B · teacher laptop
 ┌──────────────────────────────────┐                ┌──────────────────────────────────┐
 │ /student?stage=  page.tsx (server)│               │ /teacher  page.tsx ▶ TeacherLive │
 │ /teacher/assignments/new         │                │   BoardIndicator "Board · …"     │
 │   NewAssignment ▶ PathwayMap     │
 │ /teacher/whole-class ▶ setup     │
 │ /teacher/board ▶ BoardControls   │   (pad · prev · mode · marks · End · next; no examples)
 │   └▶ StudentApp (client)         │                │   useBatchedSession(3 s)         │
 │   ForceSubmit → advance/start    │
 │       useStudentSession()        │                │   subskillStatuses · caution     │
 │       └▶ IpadStage ▶ StudentChrome│               │   classmates (19: 6 full, 13 light) · seating groups (5 colours)│
 │            └▶ screens/            │               └──────────────┬───────────────────┘
 │               Overview ▶ Confidence│                              │ reads every 3 s
 │               ▶ WarmupPick (select problems · skills by category · chat → focus → warmupSequence, easiest first)│
 │               ▶ Practice (pad · HelpMenu: hint · worked example · video · follow-up split pane)│
 │                   HintCard: linked hint words light the expression (termTex) — practices only│
 │               ▶ Working ─▶ DrawPad (canvas ink)                  │
 │                                  ├▶ "Read as" column             │
 │                                  └▶ PromptModal · HelpPicker (this problem's moves) · PracticeOverlay = PracticePad (shared with the warm-up)
 │               ▶ Feedback = individual review (detective sentence · star · what you submitted · pad · guard · hand in) · Waiting│
 │               ▶ Frozen (versions beside a pad: teacher-ink mirror or write-with-me; marks follow the board)│
 │               ▶ ClassWait (gate: n of 20 · teacher start) ▶ GroupBoard (one shared whiteboard · the pen by shuffle · check · we're stuck) ▶ GroupDebrief (three versions · a note · marks · 20 s hold)│
 │               ▶ Report (teacher's colours + reflection → sent)   │
 │               ▶ Peers (mastery only: class struggles, counts)    │
 │               ▶ History (final only; compare scroll-synced)      │
 │               DiagnosticModal over any stage while a push is pending
 └───────────────┬──────────────────┘                               │
 browser tab C · smartboard (projector, display only)               │
 ┌──────────────────────────────────────────────────────────────┐   │
 │ /board ▶ SmartBoard  useClassroom · useLiveSession           │   │
 │   boardContent → blank (class · title) · holding (standings  │   │
 │   placeholder) · slide (examples A/B/C · n/m students · marks│   │
 │   iff marked · read-only mirror of the teacher's ink)        │   │
 │   no button, no link, no live pad, no name                   │   │
 └──────────────────────────────────────────────────────────────┘   │
                 │ dispatch(action)                                 │
                 ▼                                                  ▼
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ lib/store.ts   one StudentSession · localStorage snapshot · BroadcastChannel        │
 │                useStudentSession · useBatchedSession · useNow · resetSession        │
 │                dispatch(action) runs the reducer under env { pathway } from …       │
 │ lib/classroom-store.ts  ClassroomState (teacher-owned, own key + channel)           │
 │                useClassroom · dispatchClassroom · resetClassroom                    │
 │ lib/classroom.ts    CreatedAssignment { title, problemIds, pathway } · pathwayOf    │
 │                     PendingAdvance { id, kind, deadline } · GRACE_MS · isPending/isDue│
 │                     WholeClassSession { problems, examples, slide, view, status }     │
 │ lib/examples.ts     candidatesFor · bucketOf · suggestExamples · boardExamples (no names)│
 │                     lineMarks (red / blue for the marked view, board and student alike)  │
 │ lib/frozen.ts       frozenView(session, classroom) → the student's own work on the slide │
 │ lib/board.ts        boardContent(classroom, session) → blank | holding | whole-class · boardWord│
 │ lib/assignment.ts   activeAssignment(classroom) → created title + problems, or fixture│
 │ lib/pathway.ts      REVIEW_ORDER · successors · nextStage · pathwaySentence/Chip    │
 │ lib/session.ts      StudentSession · sessionReducer(s, a, env) · sessionAt (pure)   │
 │ lib/recognition.ts  nextLine · afterUndo  (burst of strokes → scripted line)        │
 │ lib/hint.ts         hintSegments · findFragment · termTex (\htmlClass wraps, no layout change)│
 │   session.ink / reworkInk: strokes per problem, popped with lines on undo/clear      │
 │ lib/evaluate.ts     evaluateLine(problem, tex) → ok | wrong | unclear               │
 │ lib/escalation.ts   recordMistake · requestHelp → { trigger, cautioned }            │
 │ lib/hierarchy.ts    hierarchyFor(evidence) → leaf/group/category status · half dots  │
 │                     sessionEvidence · classmateEvidence (one path) · categoriesTouched │
 │ lib/unit.ts         inferUnitFromProblems · inferUnitFromText                        │
 │ lib/feedback.ts     runKind · feedbackFor (teacher views) · feedbackSummary (student) │
 │ lib/guard.ts        guardFor · trippedProblems  (originally-correct problem broken)  │
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
 │   taxonomy.ts     TAXONOMY (7 categories → groups → leaves) · LeafId · lookups · version │
 │   types.ts        Tag · Status (5 levels) · Problem · Assignment · UnitRef · Confidence · Stage │
 │   assignment.ts   ASSIGNMENT (10 problems, tagged solutions) · unitLabel · DEMO_STUDENT │
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
 │   Tag.tsx DifficultyTag LeafChip StatusDot(half) STATUS_WORD    Figure.tsx (Q8 svg) │
 │   HierarchyDrill.tsx  category → group → leaf → work, shared by grid and reports    │
 │   Brand.tsx Brand BrandMark                   IpadStage.tsx  bezel + scale-to-fit  │
 │   DrawPad.tsx  pointer events → ink; reports pen-down and burst-end(strokeCount)   │
 │   InkView.tsx  read-only SVG of stored strokes, cropped and fitted to its box       │
 │   PadSection.tsx  pad + Undo/Clear      ReadAs.tsx  transcription column + shimmer  │
 │   PracticeCard.tsx  one practice problem, steps revealed one at a time              │
 │   PracticePad.tsx   practice on the pad (warm-up + mid-set): hint, example, follow-up│
 │   HintCard.tsx      a practice hint with linked words; reports the hovered term      │
 │   ResetDemo.tsx     restart the shared session in every tab                         │
 └────────────────────────────────────────────────────────────────────────────────────┘
 ┌────────────────────────────────────────────────────────────────────────────────────┐
 │ app/layout.tsx  fonts · katex.css · globals.css (@theme tokens, .ipad-bezel/.screen)│
 │ app/page.tsx    entry: student iPad, teacher view, smartboard, or all three in /split│
 │ app/split/      SplitView: /student, /teacher, /board in scaled iframes, any of them  │
 │                 (lib/split.ts: panes · parse/toggle · gridFor · frameFor)            │
 │ scripts/laptop-check.mjs  every teacher route at two laptop widths, no x-overflow    │
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
| 20 | Persisted ink | `/student` working, rework, history | `67aec66` | [curr_version/architecture/20-persisted-ink.md](curr_version/architecture/20-persisted-ink.md) |
| 21 | Detective feedback and the guard | `/student?stage=feedback`, rework | `3479206` | [curr_version/architecture/21-detective-feedback-and-guard.md](curr_version/architecture/21-detective-feedback-and-guard.md) |
| 22 | Teacher force submit with one-minute grace | `/teacher` Class card → `/student` pill | `bd16a06` | [curr_version/architecture/22-teacher-force-submit-with-grace.md](curr_version/architecture/22-teacher-force-submit-with-grace.md) |
| 23 | Whole-class setup and the unmarked board | `/teacher/whole-class`, `/teacher/board` | `bb83c90` | [curr_version/architecture/23-whole-class-setup-and-unmarked-board.md](curr_version/architecture/23-whole-class-setup-and-unmarked-board.md) |
| 24 | Student freeze, marked view and session end | `/student` frozen, `/teacher/board` marks, `/teacher` End | `9acced2` | [curr_version/architecture/24-student-freeze-marked-view-and-session-end.md](curr_version/architecture/24-student-freeze-marked-view-and-session-end.md) |
| 25 | Documentation compile | — | `4e7b2a1` | [curr_version/architecture/25-documentation-compile.md](curr_version/architecture/25-documentation-compile.md) |
| 26 | Hierarchical skill category dashboard | `/teacher` grid + drill, reports, creation Unit Focus | `b7f5a71` | [curr_version/architecture/26-hierarchical-skill-dashboard.md](curr_version/architecture/26-hierarchical-skill-dashboard.md) |
| 27 | Warm-up on the pad, confidence first, multimodal help | `/student?stage=confidence`, `…=practice` | `9f311a5` | [curr_version/architecture/27-warm-up-on-the-pad.md](curr_version/architecture/27-warm-up-on-the-pad.md) |
| 28 | Warm-up chooser: problems, words, one skill at a time | `/student?stage=warmup-pick`, `…=practice` | `c614ed5` | [curr_version/architecture/28-warm-up-chooser.md](curr_version/architecture/28-warm-up-chooser.md) |
| 29 | Mid-set isolated practice on the pad | `/student?stage=working` overlay | `2022a51` | [curr_version/architecture/29-isolated-practice-on-the-pad.md](curr_version/architecture/29-isolated-practice-on-the-pad.md) |
| 30 | Hint words that light the problem | `/student?stage=practice`, `…=working` overlay | `917bb70` | [curr_version/architecture/30-hint-links.md](curr_version/architecture/30-hint-links.md) |
| 31 | Practice sent to the fundamental skill; confidence for the teacher | `/student?stage=working` prompt | `18b97f0` | [curr_version/architecture/31-confidence-triggered-practice.md](curr_version/architecture/31-confidence-triggered-practice.md) |
| 32 | Individual review with correction on one screen | `/student?stage=feedback` | `66fa851` | [curr_version/architecture/32-review-with-correction.md](curr_version/architecture/32-review-with-correction.md) |
| 33 | Demo "skip to" strip | `/student` (presenter control) | `d3bd7e0` | [curr_version/architecture/33-demo-skip-to.md](curr_version/architecture/33-demo-skip-to.md) |
| 34 | Whole-class review: versions beside a pad, frozen or write-with-me | `/student` frozen, `/teacher/whole-class`, `/teacher/board` | `fb9fc69` | [curr_version/architecture/34-whole-class-follow-modes.md](curr_version/architecture/34-whole-class-follow-modes.md) |
| 35 | Split view: student, teacher and board in one tab | `/split` (presenter page) | `bff34c5` | [curr_version/architecture/35-split-view.md](curr_version/architecture/35-split-view.md) |
| 36 | Class of twenty in five colour groups | `/teacher/groups` | `00d5979` | [curr_version/architecture/36-class-of-twenty-colour-groups.md](curr_version/architecture/36-class-of-twenty-colour-groups.md) |
| 37 | Teacher on a laptop: full width, and a viewport guard over every teacher route | `/` teacher card, `/teacher/**` | `02372da` | [curr_version/architecture/37-teacher-on-a-laptop.md](curr_version/architecture/37-teacher-on-a-laptop.md) |
| 38 | The smartboard surface: display only, the laptop keeps the controls | `/board`, `/teacher/board` (controls), `/teacher` indicator, `/` card | `d76c226` | [curr_version/architecture/38-smartboard-surface.md](curr_version/architecture/38-smartboard-surface.md) |
| 39 | The whole class enters group review together | `/student` class-wait, `/teacher` Class card | `54f397f` | [curr_version/architecture/39-class-enters-group-review-together.md](curr_version/architecture/39-class-enters-group-review-together.md) |
| 40 | Group review on one shared whiteboard | `/student` group | `8d9cf9e` | [curr_version/architecture/40-group-review-shared-whiteboard.md](curr_version/architecture/40-group-review-shared-whiteboard.md) |
| 41 | The debrief after a correct check | `/student` group, `/teacher/report` | _this commit_ | [curr_version/architecture/41-debrief-after-a-correct-check.md](curr_version/architecture/41-debrief-after-a-correct-check.md) |

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
