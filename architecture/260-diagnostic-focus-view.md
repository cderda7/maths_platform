# 260: A sent diagnostic chain runs in a focused view on the Mistakes page, side by side; the flyout never collapses on a new mistake

## Files touched

| File | What it does |
| --- | --- |
| `app/teacher/diagnosticFlyout.ts` (new) | A module-level store (no app imports) for which problem's flyout is open, one at a time, and each problem's selected steps: `setFlyoutOpen`, `toggleStep`, `sentFrom`, `getFlyout`, `useFlyout` (`useSyncExternalStore`). It lives outside React state, so a remount of the Mistakes tree (Fast Refresh on the demo's `next dev`) finds the flyout as it was. |
| `app/teacher/DiagnosticPush.tsx` | The flyout reads and writes that store. A send closes it and clears the selection. The live-chain band (position, answered, control, Withdraw), the chain's ticks and the chip's badge are gone: the focused view covers the page while a chain is out. Step pieces come from `DiagnosticStep`. |
| `app/teacher/DiagnosticStep.tsx` (new) | Shared by the flyout and the focused view: `StepHeading` ("1 · FIND THE PAIR", "3 slipped here"; stacked in a narrow `@container`), `StepQuestion` (stem through `FitStem`, options through `FitText`, the right one green, one column in a narrow card), `pickersFor` (avatars with repeat marks, ticket 242). |
| `app/teacher/DiagnosticFocus.tsx` (new) | The focused view: the header "Q1 x² − 5x + 6 = 0 · Live diagnostic", a centred row of step cards (`flex: 0 1 460px`, `@container`; asked → results, current → accent border and live results, later → question only at 50%), and a sticky band under it: "1st of 3 · n/19 answered", `DiagnosticControl size="focus"`, Withdraw. |
| `app/teacher/TeacherMistakes.tsx` | When the live set's chain is out (`liveDiagnostic`), renders `DiagnosticFocus` under the back button and eyebrow, and keeps the page `hidden` but mounted (`data-mistakes-page`). `useScrollAroundFocus` tracks the page's scroll from scroll events, saves it at the send (module state, so it survives a switch to Class), sets the view at the top, and restores the scroll once the problems are back. Problems' Escape layers are off while the view is up. |
| `components/FitStem.tsx` (new) | A stem paragraph at `max` px, or smaller by the one factor that fits its widest nowrap maths inside its width (layout px, zoom-safe). Re-fitted on resize and once fonts load. |
| `components/DiagnosticResults.tsx` | The panel size's stem goes through `FitStem`. Its cells stack to one column in a card narrower than 300 px (`@max-[300px]`, only inside a `@container`). |
| `components/DiagnosticControl.tsx` | "next question" and "done" (were "next step" and "back to work"). A `focus` size (17 px pill). The countdown is capped at five seconds. |
| `lib/diagnosticChain.ts` | `DIAGNOSTIC_FORCE_MS` is 5 000 (was 10 000). Comments name next question and done. |
| `app/board/SmartBoard.tsx`, `app/teacher/DiagnosticCard.tsx`, `app/student/screens/DiagnosticModal.tsx`, `app/student/StudentApp.tsx`, `lib/classroom.ts` | Wording in comments only. The board and class card get the new labels through `DiagnosticControl`. |
| `lib/diagnostic.test.ts`, `app/teacher/diagnosticFlyout.test.ts` (new) | Force submit at 5 s: a press at once closes before the last classmates, who are left out, and a late press still waits for everyone. The flyout store: one open at a time, selection per problem, send clears. |

## How it connects

```
 app/teacher/TeacherMistakes.tsx  (/teacher/a/pset-6/mistakes)
   │
   ├── useClassroom() ─► liveDiagnostic(classroom) ── chain out? ──────────────────────────────┐
   │                                                                                            │ yes
   │   no ▼                                                                                     ▼
   │  <div data-mistakes-page>  (hidden={focused}, stays mounted)          app/teacher/DiagnosticFocus.tsx ◄260
   │    problem rows ── DiagnosticPush (flyout) ◄260                          h1  Q1 [tex] · Live diagnostic
   │                     │                                                    ┌──────────┐┌══════════┐┌──────────┐
   │                     │ useFlyout(problemId)                               │1 · PAIR  ││2 · FACTOR││3 · ZEROS │
   │                     ▼                                                    │ results  ││ live res.││ question │
   │        app/teacher/diagnosticFlyout.ts ◄260                              │ avatars  ││ accent   ││ dimmed   │
   │          { open: "q1", selected: {q1:[…]} }                              └──────────┘└══════════┘└──────────┘
   │          module state: a remount reads it back                             centred row, cards flex 0 1 460px
   │                     │                                                     ┌─ sticky band ───────────────────┐
   │   send N to class ──┼─► dispatchClassroom(diagnostic/push) ──────────►     │ 1st of 3 · 14/19 answered       │
   │                     └─► sentFrom(problemId): flyout closes                 │ [force submit|next question|done]│
   │                                                                            │ Withdraw                        │
   │   useScrollAroundFocus: scroll events ─► last; at the send save it;        └─────────────────────────────────┘
   │   done / withdraw ─► the page shows again ─► scrollTop = saved                       │ DiagnosticControl size="focus"
   │                                                                                       ▼
   └── app/teacher/DiagnosticStep.tsx ◄260  StepHeading · StepQuestion (FitStem, FitText) · pickersFor
                        ▲                                   ▲
                        │ flyout                            │ focused view cards
                        └─────────────── both ──────────────┘

 components/DiagnosticControl.tsx ── force submit ─► closing in 0:05 · Cancel ─► next question ─► done
   used by: DiagnosticFocus (focus) · DiagnosticCard (card) · SmartBoard (board)
   done = diagnostic/end ─► lib/diagnosticChain.ts chainReducer (DIAGNOSTIC_FORCE_MS = 5 000) ◄260
        ─► the board gives back its screen, every iPad its work, the Mistakes view its problems

 components/DiagnosticResults.tsx size="panel" ── FitStem stem, cells grid-cols-2 → 1 under 300 px ◄260
 components/FitStem.tsx ◄260  font = 17 × min(1, width ÷ widest nowrap maths)
```

A chain is sent from one problem's flyout, so its steps share one problem. The header takes that problem, and the cards
take its mistake rows (`latest`) for "n slipped here" and the repeat marks.
