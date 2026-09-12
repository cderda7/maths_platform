# Architecture — Edexia · Maths

Running architecture record for the closed-loop demo. One row per completed ticket, in build
order (01–16 spec v2, 17–25 spec v3); per-ticket detail lives in `architecture/<nn>-<slug>.md`. Paths below are
relative to the repo root. Next.js 16 App Router, React 19, Tailwind 4, KaTeX; no backend beyond
the one route the help chat streams through (`/api/help-chat`, ticket 69), all data static under
`data/`. The Sept 7 mockup was removed on 10 Sep 2026 (ticket 60).

## System diagram

```
 browser tab A · student iPad                        browser tab B · teacher laptop
 ┌──────────────────────────────────┐                ┌──────────────────────────────────┐
 │ /student?stage=  page.tsx (server)│               │ /teacher  page.tsx ▶ TeacherLive │
 │ /teacher/assignments/create      │                │   (no board indicator, ticket 55)│
 │   CreateAssignment ▶ QuestionTile (the tile is the editor) ▶ QuestionView ◀ lib/mathInput (x**2 → KaTeX); draft/set ▶ …/create/review (stub)│
 │ /teacher/assignments/new (old)   │
 │   NewAssignment ▶ PathwayMap     │
 │ /teacher/whole-class ▶ setup     │
 │ /teacher/board ▶ BoardControls   │   (pad · prev · mode · marks · End · next; no examples)
 │   └▶ StudentApp (client)         │                │   useBatchedSession(3 s)         │
 │   ForceSubmit → advance/start    │
 │       useStudentSession()        │                │   subskillStatuses · caution     │
 │       └▶ IpadStage ▶ StudentChrome│               │   classmates (19: 6 full, 13 light) · seating groups (5 colours)│
 │            └▶ screens/            │               └──────────────┬───────────────────┘
 │               Overview ▶ Confidence ▶ (not confident: a callout, offerLines: Warm up | Start the set)│                              │ reads every 3 s
 │               ▶ WarmupChat (the ticked skills → concernTurns, the skill in a light blue box (ink text) in each ask, later ones "How about…?"; one bubble at a time to turnSteps, the box off while the tutor "writes" → answers → focus → warmupSequence, easiest first)│
 │               ▶ Practice (pad · skill buttons: dark once on or through, tap opens · HelpMenu: hint · worked example · video · chat · follow-up split pane)│
 │                   HelpChat (ticket 69): under the read-as lines while open, content-sized to a 42% cap then scrolling (ticket 103) · lines said → run.chat · POST /api/help-chat streams claude-opus-5 (lib/helpChat.ts brief: hints only, two ways in, "which makes more sense?")│
 │                   HintCard: linked hint words light the expression (termTex) — practices only│
 │               ▶ Working ─▶ DrawPad (canvas ink)                  │
 │                                  ├▶ "Read as" column             │
 │                                  └▶ PromptModal · HelpPicker (this problem's moves) · PracticeOverlay = PracticePad (shared with the warm-up)
 │               ▶ Feedback = individual review (detective sentence · star · what you submitted · pad · guard · hand in) · Waiting│
 │               ▶ Frozen (versions beside a pad: teacher-ink mirror or write-with-me; marks follow the board)│
 │               ▶ ClassWait (gate: n of 20 · teacher start) ▶ GroupBoard (one shared whiteboard · the pen by shuffle · check) ▶ GroupDebrief (three versions · a note · marks · 20 s hold)              │
 │                 └─ both under one GroupHeader (problem · GroupBar centred in a 3-column grid · pen chip or "the group got it")                                        │
 │               ▶ Report (teacher's colours + reflection → sent)   │
 │               ▶ Peers (mastery only: class struggles, counts)    │
 │               ▶ History (final only; compare scroll-synced)      │
 │               DiagnosticModal over any stage while a push is pending
 └───────────────┬──────────────────┘                               │
 browser tab C · smartboard (projector, display only)               │
 ┌──────────────────────────────────────────────────────────────┐   │
 │ /board ▶ SmartBoard  useClassroom · useLiveSession · useNow   │   │
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
 │ lib/board.ts        boardContent(classroom, session, now) → blank | group | holding | whole-class│
 │ lib/standings.ts    standingsAt (per seating group: live run or the scripted race) · rankStandings│
 │ lib/assignment.ts   activeAssignment(classroom) → created title + problems, or fixture│
 │ lib/pathway.ts      REVIEW_ORDER · successors · nextStage · pathwaySentence/Chip    │
 │ lib/session.ts      StudentSession · sessionReducer(s, a, env) · sessionAt (pure)   │
 │ lib/recognition.ts  nextLine · afterUndo  (burst of strokes → scripted line)        │
 │ lib/hint.ts         hintSegments · findFragment · termTex (\htmlClass wraps, no layout change)│
 │ lib/helpChat.ts     findPractice · parseHelpChatRequest · helpChatSystem (the tutor's brief) · helpChatMessages · chatSegments│
 │   app/api/help-chat/route.ts  the one live model call: Anthropic SDK stream → text/plain; 503 with no credentials│
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
 │ lib/commentary.ts   commentaryFor(student, session) → ideas + clarification (individual view) │
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
 │   race.ts         RACE_SCHEDULE: the other groups' finish moments, seconds from the start │
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
 │                 (lib/split.ts: panes, a design size each · placeFor · frameFor ·     │
 │                  dragStep: a divider drag ends the moment the button is not held)   │
 │ scripts/laptop-check.mjs  every teacher route at two laptop widths, no x-overflow    │
 └────────────────────────────────────────────────────────────────────────────────────┘

 Dependency rule: app ──▶ components ──▶ data ──▶ types. Nothing points the other way.
```

## Tickets, in build order

| # | Ticket | Routes | Commit | Note |
|---|---|---|---|---|
| 01 | Scaffold, iPad stage, demo assignment fixture | `/`, `/student`, `/teacher` | `bc49ffa` | [architecture/01-scaffold.md](architecture/01-scaffold.md) |
| 02 | Pre-assignment skill list, practice offer, confidence survey | `/student?stage=…` | `5ce1673` | [architecture/02-pre-assignment-and-confidence.md](architecture/02-pre-assignment-and-confidence.md) |
| 03 | Drawpad with simulated line-by-line recognition | `/student?stage=working` | `bcca326` | [architecture/03-drawpad-simulated-recognition.md](architecture/03-drawpad-simulated-recognition.md) |
| 04 | Scripted evaluation, escalation counter, practice prompt, "I need help" | `/student?stage=working` | `db5cbb1` | [architecture/04-scripted-evaluation-and-escalation.md](architecture/04-scripted-evaluation-and-escalation.md) |
| 05 | Teacher live subskill status and caution flag | `/teacher`, `/student` | `a816258` | [architecture/05-teacher-live-status-and-caution-flag.md](architecture/05-teacher-live-status-and-caution-flag.md) |
| 06 | Feedback layers on submission | `/student?stage=feedback` | `c09798e` | [architecture/06-feedback-layers.md](architecture/06-feedback-layers.md) |
| 07 | Independent rework stage | `/student?stage=rework` | `6dbf08f` | [architecture/07-independent-rework.md](architecture/07-independent-rework.md) |
| 08 | Simulated group review, two phases | `/student?stage=group-pass`, `…=group-discuss` | `8b2f174` | [architecture/08-simulated-group-review.md](architecture/08-simulated-group-review.md) |
| 09 | Student final report and reflection | `/student?stage=report` | `7c66e0a` | [architecture/09-student-final-report.md](architecture/09-student-final-report.md) |
| 10 | Teacher final report | `/teacher/report` | `d3fb1c9` | [architecture/10-teacher-final-report.md](architecture/10-teacher-final-report.md) |
| 11 | Teacher mistake view | `/teacher/mistakes` | `5ac30a1` | [architecture/11-teacher-mistake-view.md](architecture/11-teacher-mistake-view.md) |
| 12 | Peer-struggle screen (Tier 2) | `/student?stage=report&run=strong` → peers | `a53863a` | [architecture/12-peer-struggle-screen.md](architecture/12-peer-struggle-screen.md) |
| 13 | Submission history (Tier 2) | `/student?stage=history` | `67db35d` | [architecture/13-submission-history.md](architecture/13-submission-history.md) |
| 14 | Teacher review-groups view (Tier 2) | `/teacher/groups` | `0c268b0` | [architecture/14-teacher-review-groups-view.md](architecture/14-teacher-review-groups-view.md) |
| 15 | Teacher original vs final (Tier 2) | `/teacher/compare` | `3fb499b` | [architecture/15-teacher-original-vs-final.md](architecture/15-teacher-original-vs-final.md) |
| 16 | Diagnostic MCQ push (Tier 2) | `/teacher` → `/student` interrupt | `7b3d49c` | [architecture/16-diagnostic-mcq-push.md](architecture/16-diagnostic-mcq-push.md) |
| 17 | Copy sweep to the rule (spec v3) | every route | `cabb007` | [architecture/17-copy-sweep.md](architecture/17-copy-sweep.md) |
| 18 | Pathway model and routing | `/student?pathway=…`, `/teacher` chip | `dc5ee2a` | [architecture/18-pathway-model-and-routing.md](architecture/18-pathway-model-and-routing.md) |
| 19 | Assignment creation with the pathway map | `/teacher/assignments/new` | `2af6872` | [architecture/19-assignment-creation-with-pathway-map.md](architecture/19-assignment-creation-with-pathway-map.md) |
| 20 | Persisted ink | `/student` working, rework, history | `67aec66` | [architecture/20-persisted-ink.md](architecture/20-persisted-ink.md) |
| 21 | Detective feedback and the guard | `/student?stage=feedback`, rework | `3479206` | [architecture/21-detective-feedback-and-guard.md](architecture/21-detective-feedback-and-guard.md) |
| 22 | Teacher force submit with one-minute grace | `/teacher` Class card → `/student` pill | `bd16a06` | [architecture/22-teacher-force-submit-with-grace.md](architecture/22-teacher-force-submit-with-grace.md) |
| 23 | Whole-class setup and the unmarked board | `/teacher/whole-class`, `/teacher/board` | `bb83c90` | [architecture/23-whole-class-setup-and-unmarked-board.md](architecture/23-whole-class-setup-and-unmarked-board.md) |
| 24 | Student freeze, marked view and session end | `/student` frozen, `/teacher/board` marks, `/teacher` End | `9acced2` | [architecture/24-student-freeze-marked-view-and-session-end.md](architecture/24-student-freeze-marked-view-and-session-end.md) |
| 25 | Documentation compile | — | `4e7b2a1` | [architecture/25-documentation-compile.md](architecture/25-documentation-compile.md) |
| 26 | Hierarchical skill category dashboard | `/teacher` grid + drill, reports, creation Unit Focus | `b7f5a71` | [architecture/26-hierarchical-skill-dashboard.md](architecture/26-hierarchical-skill-dashboard.md) |
| 27 | Warm-up on the pad, confidence first, multimodal help | `/student?stage=confidence`, `…=practice` | `9f311a5` | [architecture/27-warm-up-on-the-pad.md](architecture/27-warm-up-on-the-pad.md) |
| 28 | Warm-up chooser: problems, words, one skill at a time | `/student?stage=warmup-pick`, `…=practice` | `c614ed5` | [architecture/28-warm-up-chooser.md](architecture/28-warm-up-chooser.md) |
| 29 | Mid-set isolated practice on the pad | `/student?stage=working` overlay | `2022a51` | [architecture/29-isolated-practice-on-the-pad.md](architecture/29-isolated-practice-on-the-pad.md) |
| 30 | Hint words that light the problem | `/student?stage=practice`, `…=working` overlay | `917bb70` | [architecture/30-hint-links.md](architecture/30-hint-links.md) |
| 31 | Practice sent to the fundamental skill; confidence for the teacher | `/student?stage=working` prompt | `18b97f0` | [architecture/31-confidence-triggered-practice.md](architecture/31-confidence-triggered-practice.md) |
| 32 | Individual review with correction on one screen | `/student?stage=feedback` | `66fa851` | [architecture/32-review-with-correction.md](architecture/32-review-with-correction.md) |
| 33 | Demo "skip to" strip | `/student` (presenter control) | `d3bd7e0` | [architecture/33-demo-skip-to.md](architecture/33-demo-skip-to.md) |
| 34 | Whole-class review: versions beside a pad, frozen or write-with-me | `/student` frozen, `/teacher/whole-class`, `/teacher/board` | `fb9fc69` | [architecture/34-whole-class-follow-modes.md](architecture/34-whole-class-follow-modes.md) |
| 35 | Split view: student, teacher and board in one tab | `/split` (presenter page) | `bff34c5` | [architecture/35-split-view.md](architecture/35-split-view.md) |
| 36 | Class of twenty in five colour groups | `/teacher/groups` | `00d5979` | [architecture/36-class-of-twenty-colour-groups.md](architecture/36-class-of-twenty-colour-groups.md) |
| 37 | Teacher on a laptop: full width, and a viewport guard over every teacher route | `/` teacher card, `/teacher/**` | `02372da` | [architecture/37-teacher-on-a-laptop.md](architecture/37-teacher-on-a-laptop.md) |
| 38 | The smartboard surface: display only, the laptop keeps the controls | `/board`, `/teacher/board` (controls), `/teacher` indicator, `/` card | `d76c226` | [architecture/38-smartboard-surface.md](architecture/38-smartboard-surface.md) |
| 39 | The whole class enters group review together | `/student` class-wait, `/teacher` Class card | `54f397f` | [architecture/39-class-enters-group-review-together.md](architecture/39-class-enters-group-review-together.md) |
| 40 | Group review on one shared whiteboard | `/student` group | `8d9cf9e` | [architecture/40-group-review-shared-whiteboard.md](architecture/40-group-review-shared-whiteboard.md) |
| 41 | The debrief after a correct check | `/student` group, `/teacher/report` | `82ff198` | [architecture/41-debrief-after-a-correct-check.md](architecture/41-debrief-after-a-correct-check.md) |
| 42 | Progress bar, leaderboard and medals | `/board` race and held standings, `/teacher` card, `/student` group bar | `fca135e` | [architecture/42-progress-bar-leaderboard-medals.md](architecture/42-progress-bar-leaderboard-medals.md) |
| 43 | The individual view, and a tidy of the teacher's screens | `/teacher` title line, chips, name links; `/teacher/report?student=`; `/teacher/groups` | `f558209` | [architecture/43-individual-view-and-teacher-tidy.md](architecture/43-individual-view-and-teacher-tidy.md) |
| 44 | Start screen simplified: no skill panel, one row per problem, accent buttons | `/student` overview | `e3466a9` | [architecture/44-start-screen-simplified.md](architecture/44-start-screen-simplified.md) |
| 45 | The teacher pane scales with its height: a 1280 × 800 laptop, fitted like the iPad | `/split` teacher pane | — | [architecture/45-teacher-pane-scales-with-its-height.md](architecture/45-teacher-pane-scales-with-its-height.md) |
| 46 | Class view polish: row buttons, header skills/sub-skills control, New skills, no timestamps, a missing student | `/teacher` grid | — | [architecture/46-class-view-polish.md](architecture/46-class-view-polish.md) |
| 47 | Start screen as a grid of tiles: ten square cards, no chips, WARM UP / START bottom right | `/student` overview | — | [architecture/47-start-screen-tiles.md](architecture/47-start-screen-tiles.md) |
| 48 | Warm-up concerns chat: the picker page gone, one question per ticked skill, then the pad with skill buttons | `/student?stage=warmup-chat`, `…=practice` | — | [architecture/48-warm-up-concerns-chat.md](architecture/48-warm-up-concerns-chat.md) |
| 49 | Group review header: no colour label, names in the group colour, a big progress bar | `/student` group | — | [architecture/49-group-header-tint.md](architecture/49-group-header-tint.md) |
| 50 | Feedback summary: skills as dark purple chips; "What you submitted" / "If needed, correct it here" / "Read as" on one line | `/student?stage=feedback` | — | [architecture/50-feedback-summary-chips.md](architecture/50-feedback-summary-chips.md) |
| 51 | Debrief: a pane that matches the group's rework turns green | `/student` group debrief | — | [architecture/51-debrief-matching-pane-green.md](architecture/51-debrief-matching-pane-green.md) |
| 52 | Group review: Liam's Q7 checks wrong first; a ten-second hold; the ring fits the button and goes once the hold ends | `/student` group | — | [architecture/52-group-wrong-rework-and-hold.md](architecture/52-group-wrong-rework-and-hold.md) |
| 53 | Group review header: the progress bar stays put on "the group got it" | `/student` group whiteboard + debrief | — | [architecture/53-group-header-shared.md](architecture/53-group-header-shared.md) |
| 54 | Whole-class review: the teacher writes on the smartboard, and switches the students' mode from it | `/board` slide, `/student` frozen, `/teacher/board` | — | [architecture/54-board-pad-and-mode-toggle.md](architecture/54-board-pad-and-mode-toggle.md) |
| 55 | Class view: see skills / full breakdown / close, one hover target per student, no board chip | `/teacher` grid, `/teacher/board` heading | — | [architecture/55-class-view-button-words-and-no-board-chip.md](architecture/55-class-view-button-words-and-no-board-chip.md) |
| 56 | Brand header: the real Edexia logo everywhere; the confidence top bar drops "Before you start" | every header, `/student?stage=confidence` | — | [architecture/56-brand-logo-and-confidence-crumb.md](architecture/56-brand-logo-and-confidence-crumb.md) |
| 57 | Student report: the skills laid out as the teacher's class-view row, every group shown at once | `/student?stage=report` | — | [architecture/57-student-report-skill-columns.md](architecture/57-student-report-skill-columns.md) |
| 58 | Student report: a tile per problem in a column per review stage in the pathway; Starred gone; the reflection required before sending | `/student?stage=report` | — | [architecture/58-report-outcome-tiles.md](architecture/58-report-outcome-tiles.md) |
| 59 | Class view: "see dot skills" beside a name opens the row's full breakdown, every group open to its skills | `/teacher` grid | — | [architecture/59-row-see-dot-skills-full-breakdown.md](architecture/59-row-see-dot-skills-full-breakdown.md) |
| 60 | Repo flatten: the app is the repo root, the Sept 7 mockup deleted | — | — | [architecture/60-repo-flatten.md](architecture/60-repo-flatten.md) |
| 61 | Teacher side: the arrow cursor everywhere, never the hand | `/teacher/**` | — | [architecture/61-teacher-arrow-cursor.md](architecture/61-teacher-arrow-cursor.md) |
| 62 | Mistakes view: students side by side, one click opens every student's work in columns | `/teacher/mistakes` | — | [architecture/62-mistakes-side-by-side.md](architecture/62-mistakes-side-by-side.md) |
| 63 | Mistakes view: one pill spans the students who slipped on the same step; the header keeps only the difficulty tag | `/teacher/mistakes` | 62 | [architecture/63-mistakes-shared-pills.md](architecture/63-mistakes-shared-pills.md) |
| 64 | Mistakes view: bigger red-filled slip pills, the question header opens and closes, an expand / close / close-all button on hover | `/teacher/mistakes` | 63 | [architecture/64-mistakes-expand-button.md](architecture/64-mistakes-expand-button.md) |
| 65 | The Edexia bar stays put when the page scrolls, and the board gets one | `/teacher/**` sticky, `/student` verified, `/board` | — | [architecture/65-sticky-brand-header.md](architecture/65-sticky-brand-header.md) |
| 66 | Mistakes view: more room between the student's name and the slip pill | `/teacher/mistakes` | 64 | [architecture/66-mistakes-pill-spacing.md](architecture/66-mistakes-pill-spacing.md) |
| 67 | Mistakes view: the slip pill starts under the avatar, not the name | `/teacher/mistakes` | 66 | [architecture/67-mistakes-pill-avatar.md](architecture/67-mistakes-pill-avatar.md) |
| 68 | Teacher side: the bar never rides the rubber-band; the window stops scrolling and only the content region does | `/teacher/**` | 65 | [architecture/68-teacher-fixed-header-frame.md](architecture/68-teacher-fixed-header-frame.md) |
| 69 | Help chat: a fourth option under "I need help", a tutor that only hints and offers a choice of ways in | `/student?stage=practice`, the practice overlay, `POST /api/help-chat` | — | [architecture/69-help-chat.md](architecture/69-help-chat.md) |
| 70 | Split view: a divider drag lasts exactly as long as the button is held; the window hears the release, a move with the button up ends it | `/split` | 35 | [architecture/70-divider-drag-release.md](architecture/70-divider-drag-release.md) |
| 71 | Start alone, Submit, and the fork: the warm-up is offered on the confidence screen to the student who says they are not confident | `/student` overview, `…?stage=confidence` | 48 | [architecture/71-start-alone-submit-and-the-fork.md](architecture/71-start-alone-submit-and-the-fork.md) |
| 72 | The offer callout: the tutor's question naming the ticked skills, one short problem per skill, a rise and one ring pulse over the dimmed list | `…?stage=confidence` | 71 | [architecture/72-offer-callout.md](architecture/72-offer-callout.md) |
| 73 | Offer callout: "Start the set" in the accent outline, a pinch stronger than a secondary button | `…?stage=confidence` | 72 | [architecture/73-offer-start-the-set-outline.md](architecture/73-offer-start-the-set-outline.md) |
| 74 | Concerns chat rhythm: the opening in two bubbles a second apart, typing dots, a box that is plainly off while the tutor writes and pulses on for the student's turn, a closing bubble before the pad | `…?stage=warmup-chat` | 48, 72 | [architecture/74-chat-rhythm.md](architecture/74-chat-rhythm.md) |
| 75 | Practice pad: "I need help" straight under the question, not at the foot of the column; the fractions warm-up is x/4 + x/2 − 6 = 9/2 with a clearing-denominators hint | `…?stage=practice`, the practice overlay | 69, 29 | [architecture/75-warmup-fractions-help-under-question.md](architecture/75-warmup-fractions-help-under-question.md) |
| 76 | The fraction problem stays wrong after the individual review: Sam's Q7 rework is a second slip, so the group's Q7 is a real struggle | `/student` group, `…?stage=report` | 52 | [architecture/76-q7-rework-still-wrong.md](architecture/76-q7-rework-still-wrong.md) |
| 77 | Hint terms can name a later occurrence of a fragment (`{ tex, within }`); `termTex` works on positioned spans | `…?stage=practice`, the practice overlay | 75 | [architecture/77-hint-fragment-within.md](architecture/77-hint-fragment-within.md) |
| 78 | Several hints per problem, one per ask ("another hint · Show 2 of 2 →", "All shown"), stacked under the problem; the fractions warm-up teaches like terms first: move the 6, then a denominator the two x terms share | `…?stage=practice`, the practice overlay, `POST /api/help-chat` | 77, 69 | [architecture/78-multiple-hints.md](architecture/78-multiple-hints.md) |
| 79 | Every warm-up line is one step and two cases branch side by side: graph features and sketch split into one row per step, the pair checks one fact per row, the worked example card boxes a two-case step like the read-back; a guard test over the bank | `…?stage=practice`, the practice overlay | 75, 29 | [architecture/79-warmup-step-rows.md](architecture/79-warmup-step-rows.md) |
| 80 | Hints that read the student's work: each hint names the point in the working it fits (`at`), "hint" picks by where the lines have got, never for a point passed, "None for this step" when nothing fits; earlier hints collapse to a line | `…?stage=practice`, the practice overlay, `POST /api/help-chat` | 78, 03 | [architecture/80-responsive-hints.md](architecture/80-responsive-hints.md) |
| 81 | Q5's turning point is two lines, the height then the point: the model solution, the scripted read-back and the evaluation table all list five lines | `…?stage=working`, `…?stage=feedback`, `…?stage=history`, the teacher's mirror | 79 | [architecture/81-q5-turning-point-rows.md](architecture/81-q5-turning-point-rows.md) |
| 82 | A hint's linked words point at the student's own line in the read-as column ("your line 4", the line tinted while lit); a lit fraction is boxed whole | `…?stage=practice`, the practice overlay | 80, 77 | [architecture/82-hint-anchors.md](architecture/82-hint-anchors.md) |
| 83 | A lit hint word lights only the line its hint points at, never the same fragment elsewhere; the lit box has a touch more room above and below | `…?stage=practice`, the practice overlay | 82 | [architecture/83-hint-lit-scope.md](architecture/83-hint-lit-scope.md) |
| 84 | The concerns chat names the skill in bold in each ask, and asks the later skills "How about with fractions?" / "How about the null factor law?" | `…?stage=warmup-chat` | 48, 74 | [architecture/84-chat-skill-emphasis.md](architecture/84-chat-skill-emphasis.md) |
| 85 | The factorising warm-up has a hint for every point in the working: the pair, the sum, the brackets, then past the brackets to the null factor law (set each bracket to zero; then x + 3 = 0 and x + 4 = 0 spelt out); the follow-up likewise | `…?stage=practice`, the practice overlay | 80, 82 | [architecture/85-monic-hints.md](architecture/85-monic-hints.md) |
| 86 | "Another hint" opens the chat on the current hint while the student's lines have not moved past what it asks for ("Talk it through →"; the tutor opens with "Let's talk more about hint 2 before another one…", stored in the chat and explained in the brief); the next hint comes once the line is written | `…?stage=practice`, the practice overlay, `POST /api/help-chat` | 85, 80, 69 | [architecture/86-hint-stall-chat.md](architecture/86-hint-stall-chat.md) |
| 87 | The factorising warm-up's second hint no longer lists the pairs to try | `…?stage=practice` | 85 | [architecture/87-monic-hint-trim.md](architecture/87-monic-hint-trim.md) |
| 88 | The factorising hints say "factors" not "brackets"; two abutting lit fragments get a 0.7em gap so their boxes sit clear of each other | `…?stage=practice`, the practice overlay and read-as column | 83, 85 | [architecture/88-factors-boxes.md](architecture/88-factors-boxes.md) |
| 89 | The concerns chat's skill names sit in a light blue box (the standout blue's soft fill and line), not bold | `…?stage=warmup-chat` | 84 | [architecture/89-chat-skill-boxes.md](architecture/89-chat-skill-boxes.md) |
| 91 | The skill box's text is ink, so the chat line reads in one colour | `…?stage=warmup-chat` | 89 | [architecture/91-chat-skill-box-ink.md](architecture/91-chat-skill-box-ink.md) |
| 90 | The worked example is maths alone, every step at the problem's size and centred under it, no captions, no "Guess the next step"; while it plays the right column is the chat headed "Question about a step?" (opener "Which step, and what about it?"), and each turn tells the tutor which steps are on screen | `…?stage=practice`, the practice overlay, `POST /api/help-chat` | 69, 79 | [architecture/90-example-chat.md](architecture/90-example-chat.md) |
| 92 | The help chat sits under the read-as lines instead of replacing them: the read-as list is capped at under half the column while the chat is open (it scrolls), the bubbles gather just above the box to write in | `…?stage=practice`, the practice overlay | 86, 69 | [architecture/92-chat-below-read-as.md](architecture/92-chat-below-read-as.md) |
| 93 | The worked example card is left-justified: the problem, every step, a two-case step's boxes and the reveal button on the card's left edge (`math-left`, an unlayered override of KaTeX's centring) | `…?stage=practice`, the practice overlay | 90 | [architecture/93-example-left.md](architecture/93-example-left.md) |
| 94 | Every worked example step is a ruled row: the same grey rule and the same air (24px each side, 16 compact) between steps as between the problem and the first step; the reveal button keeps the gap, no rule | `…?stage=practice`, the practice overlay | 93 | [architecture/94-example-rows.md](architecture/94-example-rows.md) |
| 95 | "I need help" is gone, not greyed, while the worked example plays; back wherever the pad is live again | `…?stage=practice`, the practice overlay | 90 | [architecture/95-help-hidden-in-example.md](architecture/95-help-hidden-in-example.md) |
| 96 | The lit hint box stops short of the glyph next to it: a thin space between a fragment and a glyph typeset flush against it, at rest as well as lit, and the box padded inside it | `…?stage=practice`, the practice overlay | 88, 83 | [architecture/96-lit-box-clears-neighbour.md](architecture/96-lit-box-clears-neighbour.md) |
| 97 | The lit hint box is no wider than its fragment (padding above and below only) and 7x keeps its typeset spacing: ticket 96's thin space reversed, 7x is one term | `…?stage=practice`, the practice overlay | 96 | [architecture/97-lit-box-narrow.md](architecture/97-lit-box-narrow.md) |
| 98 | The lit hint box fits its surroundings per axis (side air unless a glyph, superscript or the other factor is flush; air above and below unless a numerator or denominator) and the maths keeps its own spacing everywhere (ticket 88's kern reversed; `termTex` never changes the TeX); touching lit boxes parted by a hairline | `…?stage=practice`, the practice overlay | 97, 88, 83 | [architecture/98-factors-no-gap.md](architecture/98-factors-no-gap.md) |
| 99 | "Talk it through" is a pill on the latest hint card (opens the chat on that hint with the pad's stored opener); the help menu is four bare pills (another hint, worked example, video, chat), deep purple borders, the width of the widest, a narrower popup; "another hint" greyed while stalled | `…?stage=practice`, the practice overlay | 86, 95 | [architecture/99-talk-pill.md](architecture/99-talk-pill.md) |
| 100 | A lit box around a whole fraction has 0.2em of air above and below (`hint-term-tall`), where a digit's box keeps 0.08em | `…?stage=practice`, the practice overlay | 98 | [architecture/100-fraction-box-tall.md](architecture/100-fraction-box-tall.md) |
| 101 | The help menu's first pill always reads "hint"; pressed while the previous hint is unacted on it shows a notice ("Let's talk through the previous hint before giving you another." + "Talk it through") that opens the same chat as the hint card's pill | `…?stage=practice`, the practice overlay | 99, 86 | [architecture/101-hint-stall-popup.md](architecture/101-hint-stall-popup.md) |
| 102 | The concerns chat reflects on every answer before the next question ("Gotcha. It sounds like…", "Agreed: that's a tricky skill.", "A lot of students share that struggle.", the last repeating), and closes with the reflection then "Thank you for that insight / those insights. Let's start with ___." | `…?stage=warmup-chat` | 74, 84 | [architecture/102-reflective-listening.md](architecture/102-reflective-listening.md) |
| 103 | The chat under the read-as lines takes only the height it needs, capped at 42% of the column (about the bottom third of the page), and scrolls kept at its end so the latest exchange shows; the read-as list keeps the rest | `…?stage=practice`, the practice overlay | 69, 90 | [architecture/103-chat-bottom-third.md](architecture/103-chat-bottom-third.md) |
| 104 | The conjured 1 hangs in the margin (`\llap`, zero width) so lighting moves nothing anywhere; the lit box pixel sweep is `scripts/hint-box-sweep.mjs` (`npm run sweep:hint-boxes`), part of done for the box | `…?stage=practice`, the practice overlay; `scripts/` | 98, 100 | [architecture/104-conjured-llap-sweep.md](architecture/104-conjured-llap-sweep.md) |
| 105 | "Talk it through" is centred under the hint text in the latest hint card | `…?stage=practice`, the practice overlay | 99 | [architecture/105-talk-pill-centred.md](architecture/105-talk-pill-centred.md) |
| 107 | The concerns chat's closing bubble ("Thank you for those insights. Let's start with ___.") stays up 2.8s before the pad, the length of a whole tutor turn, instead of 1.2s | `…?stage=warmup-chat` | 102, 74 | [architecture/107-close-wait.md](architecture/107-close-wait.md) |
| 108 | The `algebra.expand-factor.nonmonic` leaf's full name is "Non-monic factorisation" (the short form "non-monic factorising" unchanged): the "Which skill?" picker, the confidence and peer screens, the warm-up and help chats | `…?stage=working`, "I need help" | 26 | [architecture/108-nonmonic-rename.md](architecture/108-nonmonic-rename.md) |
| 109 | The practice prompt's card reads "2 minutes on factorising?" (a numeral) with its two sentences in sentence case on two lines: "This is your second mistake on factorising." then "Let's do a short problem to review." | `/student` while working, a second mistake on a group | 31 | [architecture/109-prompt-copy.md](architecture/109-prompt-copy.md) |
| 106 | The fractions worked example writes the 6 as 12/2 ("x/4 + x/2 = 9/2 + 12/2") before combining the numbers: seven steps, the hints after the first placed one line later, the common-denominator hint covering the new line | `…?stage=practice`, the practice overlay | 90, 86 | [architecture/106-six-as-twelve-halves.md](architecture/106-six-as-twelve-halves.md) |
| 110 | The `algebra.expand-factor.monic` leaf's full name is "Monic factorisation" (short form "monic factorising" and the student's "Factorising" override unchanged): the teacher's skills tree | `/teacher/report?student=<id>` | 108 | [architecture/110-monic-rename.md](architecture/110-monic-rename.md) |
| 111 | Once every line of a worded problem's working is read (Q9, Q10), a box at the foot of the pad reads "Provide your final answer as a full sentence."; gone again on undo, never on a "Solve for x" | `…?stage=working`, Q9 after its three lines | 03, 18 | [architecture/111-final-sentence.md](architecture/111-final-sentence.md) |
| 112 | The confidence screen's "not confident with…" list has one "factorising" row that opens "monic" and "non-monic" under it; the row alone means both kinds (`lib/confidence.ts`); the deep-linked survey offers the warm-up | `…?stage=confidence` | 110, 48 | [architecture/112-factorising-subskills.md](architecture/112-factorising-subskills.md) |
| 113 | The confidence screen's spacing is tightened so the list fits the window with factorising's two kinds open (was 80px over) | `…?stage=confidence` | 112 | [architecture/113-confidence-fit.md](architecture/113-confidence-fit.md) |
| 114 | The "full sentence" box is the chat's text field: muted placeholder "Provide your final answer as a full sentence.", the cursor in it as it appears, Enter ends the typing, the sentence kept per problem in `session.answers` | `…?stage=working`, Q9 after its three lines | 111, 74 | [architecture/114-answer-field.md](architecture/114-answer-field.md) |
| 115 | The hand-in check: Hand in over a blank problem opens a card bottom right ("Hand in with Q7 blank?" / "Return to Q7" / "Confirm submit", or "Return to Q2, Q3, Q4" with a blue box under the pointer) instead of handing in; returning puts Hand in in the footer with "Jump to Qn" to its left while another blank remains; a starred problem's tile is the star alone | `/student` while working | — | [architecture/115-hand-in-check.md](architecture/115-hand-in-check.md) |
| 117 | The group board's "we're stuck" mode is removed: no button, no reveal of everyone's earlier work, no scripted press on Jordan's Q3 turn; the action row is Check alone (or "checks when ready") at the right | `…?stage=group` | 40, 76 | [architecture/117-remove-stuck.md](architecture/117-remove-stuck.md) |
| 116 | The handed-in screen stacks two soft boxes: "N problems are incomplete." (a problem is finished once any line, first hand-in or rework, is an answer line, right or wrong; counts down live, gone at zero) above the detective sentence, which names the first submission while anything is outstanding; rows read not attempted / unfinished / N lines; a slip made while finishing a problem blank at hand-in is never counted | `…?stage=feedback`, the post-rework notice | 07, 111 | [architecture/116-incomplete-count.md](architecture/116-incomplete-count.md) |
| 119 | The create screen: a title and the questions typed into tiles in the student's five-wide grid, each tile the editor (typed text on top, the rendered question beneath, live; `x**2`, `1/3`, `sqrt(2)` as KaTeX), a ghost for the next, Enter / Shift+Enter / Backspace / × / paste-split, "Q2 removed. Undo" and Cmd+Z, the draft in the classroom store, Continue pinned to a review stub; the old screen untouched; the bank's Q1 was mirrored to +5x and then restored, the +5x problem living only in the teacher's typed draft | `/teacher/assignments/create`, `…/create/review` | 19, 117 | [architecture/119-create-assignment.md](architecture/119-create-assignment.md) |
| 121 | The create screen opens prefilled: with no draft in the store (first visit, Reset demo) it seeds the title and the demo teacher's ten typed questions from `data/draft-seed.ts` (Q1 `x^2 + 5x + 6 = 0` and a repeated Q9 on purpose, for ticket 120's recommendations); an emptied draft stays empty; from-nothing creation deferred | `/teacher/assignments/create` | 119 | [architecture/121-prefilled-draft.md](architecture/121-prefilled-draft.md) |
| 120 | The review step, replacing the stub: the draft's tiles labelled by difficulty (bank match, fixture, heuristic; a popover to relabel; the pills arriving one by one; the counts), "Assess set" running a five-second bar with three lines, three recommendations matched by expression (change the +5x Q1 to −5x with the class's sign slip as evidence, remove the repeat of Q3, add a problem in a context with three alternatives), each accepted or kept as is with Undo and the grid following, "Finalise set" opening the pathway screen (the unit focus above the map) and Create storing the bank ids, the pathway, the unit and the finalised questions; `PathwayMap` and `UnitFocus` shared with the old screen | `/teacher/assignments/create/review` | 119, 121, 19 | [architecture/120-assignment-review.md](architecture/120-assignment-review.md) |
| 122 | A tap on a difficulty pill on the review step rotates it to the next label (simple familiar → simple unfamiliar → complex familiar → complex unfamiliar → round again) instead of opening the four in a popover | `/teacher/assignments/create/review` | 120 | [architecture/122-label-rotate.md](architecture/122-label-rotate.md) |
| 123 | The review step's unit focus has no Confirm: the inferred unit stands, the note and Reassess remain, Create is on at once; the old screen keeps its Confirm through `UnitFocus`'s optional `onConfirm` | `/teacher/assignments/create/review` | 120 | [architecture/123-no-unit-confirm.md](architecture/123-no-unit-confirm.md) |
| 124 | "Class review" as the stage's title everywhere: the class view card, the setup H1, the pathway map's node and sentence (`STAGE_WORD`), the demo strip's skip button, the status suffix and the home page copy; the chip already said it; stage id, routes and actions unchanged | `/teacher`, `/teacher/whole-class`, `/teacher/assignments/new`, `/` | — | [architecture/124-class-review-title.md](architecture/124-class-review-title.md) |
| 125 | The category-level marker is a pill (28 × 13) on the class grid, the report's browse drill and the student's report row; groups and skills keep their round dots; `StatusDot` gains `shape`, the labels beside a marker clear the pill | `/teacher`, `/teacher/report`, `/student?stage=report` | — | [architecture/125-category-pills.md](architecture/125-category-pills.md) |
| 126 | The category pill's corners follow the header chip: 4 px on the 28 × 13 pill (the chip's 6 px on 22, scaled), the hover area and ring `rounded-md`; dots unchanged | `/teacher`, `/teacher/report`, `/student?stage=report` | 125 | [architecture/126-pill-corners.md](architecture/126-pill-corners.md) |
| 128 | The class grid's row buttons (see dot skills / close, student report) hide while the pointer is over one of the row's category pills: `group-has-[[data-dot]:hover]/row:invisible` on the row-actions div; keyboard focus and the header's controls unchanged | `/teacher` | 125 | [architecture/128-pill-hides-row-actions.md](architecture/128-pill-hides-row-actions.md) |
| 129 | The Pathway card marks where the class is: `lib/classStage.ts` names every stage (indiv working first) as over / current / ahead with the current one's `N/20 done`; over pills navy, the current pill ringed in accent with the count and the group gate line to its right; the Class card gone; the class review card first in the column while a session runs | `/teacher` | 124 | [architecture/129-pathway-stage.md](architecture/129-pathway-stage.md) |
| 127 | A live diagnostic beside every problem on the mistake view: the "Live diagnostic" chip alone until clicked, then the push panel with that problem's own suggested question (one fixture per problem) or one written there; a push belongs to the panel it came from (`pushBelongsTo`), other panels' send waits; the switch reads "respond online" / "not recorded" here and on the class view | `/teacher/mistakes`, `/teacher` | 23, 25 | [architecture/127-mistake-diagnostic.md](architecture/127-mistake-diagnostic.md) |
| 131 | The class grid's row buttons also stay away for two seconds after the pointer last left any category pill (one `pillQuiet` clock for the grid, `PILL_GRACE_MS`), so a sweep across pills never shows them; entering a row without touching a pill shows them at once | `/teacher` | 128 | [architecture/131-pill-grace.md](architecture/131-pill-grace.md) |
| 133 | The drill's group and skill dot chips count as markers like the pills (pointer over one hides the row buttons, leaving one starts the clock), through pointer over/out delegated on each row's tbody against `MARKER`; the grace is one second | `/teacher` | 131 | [architecture/133-dot-grace.md](architecture/133-dot-grace.md) |
| 130 | More mistakes, more kinds: six new wrong lines in the evaluation table (Q1 wrong pair, Q2 sign solving a factor, Q3 expansion sign, Q4 −b, Q7 wrong pair, Q9 −x sign), 45 classmate wrongs instead of 32 in the shape twelve on Q7 (three strategies, six / four / two), Amelia alone on Q6, nobody on Q8; notes and clarifications cover every wrong; the race rows follow the unions | every screen that reads the classmates | 23, 36 | [architecture/130-diverse-mistakes.md](architecture/130-diverse-mistakes.md) |
| 134 | The Pathway card's over pill is the lit skill button's blue (`bg-standout text-white`), not navy ink | `/teacher` | 129 | [architecture/134-over-pill-blue.md](architecture/134-over-pill-blue.md) |
| 132 | The mistake view's diagnostic opens as a flyout from its chip, down and to the right over the blank space, the chip's footprint holding the row; the problem card and every row measure the same open or closed; a flyout that would overrun the window shifts left (`clampToViewport`) | `/teacher/mistakes` | 127 | [architecture/132-diagnostic-flyout.md](architecture/132-diagnostic-flyout.md) |
| 135 | Mistake view: inside each skill pill the students on the exact same wrong line sit together (`mistakeKey`, `groupByMistake`, `SlipGroup.mistakes`) and, open, one box in the pill's red around their working (drawn per cell: edges on the first and last, dividers between; a solo student boxed alone); columns share the card down to a 186 px floor and the working shrinks to fit (`FitGrid` measures and sets `--fit`, 17 px down to 13); names truncate | `/teacher/mistakes` | 130 | [architecture/135-exact-mistake-boxes.md](architecture/135-exact-mistake-boxes.md) |
| 138 | Students whose working is identical line for line share one column on the mistake view: the work written once, every name over it (`WorkColumn`, `groupByWork` under `groupByMistake`; pills, boxes and `start` count columns), so Q7 takes three columns and Q9 three and neither scrolls sideways | `/teacher/mistakes` | 130, 135 | [architecture/138-shared-work-columns.md](architecture/138-shared-work-columns.md) |
| 136 | The roster's student cell: a 16 px name in a fixed 142 px slot (the widest name plus 10) with the **in progress** pill after it on the same line, so every in-progress pill starts at one x; the avatar moves to a new last column after Set so the eye can find its row again; category columns sized to their chips (`columnWidth`: 96, or 132 under "Communication"), chips nowrap, `min-w-[1204px]` fitting the 1280 laptop | `/teacher` grid | 46 | [architecture/136-roster-row.md](architecture/136-roster-row.md) |
| 139 | The diagnostic's "respond online" / "not recorded" switch is gone, and the recorded flag with it: one "send to class" on both views, no pill on the student's modal, `recorded` dropped from the session's diagnostic, its answers and the push action; the finger-raising idea kept in FUTURE_FEATURES | `/teacher`, `/teacher/mistakes`, `/student` | 25, 127 | [architecture/139-no-record-toggle.md](architecture/139-no-record-toggle.md) |
| 137 | The diagnostic's result: the class view's card is a link box until a question is out, then the latest result (question, each option with `n/20 students` and its misconception, the right one green) kept on screen; the run lives on the classroom (`diagnostics`), the classmates' answers trickle in from the push time, the board takes the diagnostic at 20/20 or by the teacher's hand; the flyout shows the same result per tab; `DiagnosticResults` shared; the recorded switch gone | `/teacher`, `/teacher/mistakes`, `/student`, `/board` | 132, 130 | [architecture/137-diagnostic-results.md](architecture/137-diagnostic-results.md) |

## Conventions

- **Server `page.tsx` reads params and hands an `init` object to a client screen.** Client
  components never read the URL themselves.
- **Components read data, never pages.** A chip needs only a subskill id.
- **Vocabulary lives in `data/types.ts`.** Rationale in `DECISION_LOG.md`.
- **`lib/` is for pure, testable logic** (escalation counter, group-phase computation).
- **Copy follows the rule in `specs/spec2.md`**: headlines two to four words, no
  explanatory sentence that doesn't change what the user does next, labels over sentences, at
  most one helper line per screen, no legends. The detective sentence is the one exception.
- **Student screens are designed at true iPad size** (1180×820) inside `IpadStage`; the stage
  scales, layouts never reflow.
