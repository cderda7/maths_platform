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
 │ /teacher/assignments/new         │                │   (no board indicator, ticket 55)│
 │   NewAssignment ▶ PathwayMap     │
 │ /teacher/whole-class ▶ setup     │
 │ /teacher/board ▶ BoardControls   │   (pad · prev · mode · marks · End · next; no examples)
 │   └▶ StudentApp (client)         │                │   useBatchedSession(3 s)         │
 │   ForceSubmit → advance/start    │
 │       useStudentSession()        │                │   subskillStatuses · caution     │
 │       └▶ IpadStage ▶ StudentChrome│               │   classmates (19: 6 full, 13 light) · seating groups (5 colours)│
 │            └▶ screens/            │               └──────────────┬───────────────────┘
 │               Overview ▶ Confidence ▶ (not confident: a callout, offerLines: Warm up | Start the set)│                              │ reads every 3 s
 │               ▶ WarmupChat (the ticked skills → concernTurns, one bubble at a time to turnSteps, the box off while the tutor "writes" → answers → focus → warmupSequence, easiest first)│
 │               ▶ Practice (pad · skill buttons: dark once on or through, tap opens · HelpMenu: hint · worked example · video · chat · follow-up split pane)│
 │                   HelpChat (ticket 69): the right column while open · lines said → run.chat · POST /api/help-chat streams claude-opus-5 (lib/helpChat.ts brief: hints only, two ways in, "which makes more sense?")│
 │                   HintCard: linked hint words light the expression (termTex) — practices only│
 │               ▶ Working ─▶ DrawPad (canvas ink)                  │
 │                                  ├▶ "Read as" column             │
 │                                  └▶ PromptModal · HelpPicker (this problem's moves) · PracticeOverlay = PracticePad (shared with the warm-up)
 │               ▶ Feedback = individual review (detective sentence · star · what you submitted · pad · guard · hand in) · Waiting│
 │               ▶ Frozen (versions beside a pad: teacher-ink mirror or write-with-me; marks follow the board)│
 │               ▶ ClassWait (gate: n of 20 · teacher start) ▶ GroupBoard (one shared whiteboard · the pen by shuffle · check · we're stuck) ▶ GroupDebrief (three versions · a note · marks · 20 s hold)│
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
