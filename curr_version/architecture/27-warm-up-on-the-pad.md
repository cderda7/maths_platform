# 27 · Warm-up on the pad, confidence first, multimodal help

Route: `/student` (stages `overview` → `confidence` → `practice` → `working`). Deep links:
`/student?stage=confidence` (declined the warm-up), `/student?stage=practice` (took it, confidence
filled in).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `PracticeProblem` gains `hint` (one sentence naming the move, required for every practice) and `followUp?` (a fresh problem on the same leaf, itself a `PracticeProblem`) |
| `data/practice.ts` | A hint on all eleven practices; the warm-up (`PRACTICE`, monic factorising) carries a follow-up `w-monic-2` with a negative pair |
| `data/recognition.ts` | `RECOGNITION_WARMUP`: what the pad reads for `w-monic` and `w-monic-2`, one line per burst. Unmarked, so no evaluation entry |
| `lib/session.ts` | `WarmupState` (`problem` first/second, `example` playing, `exampleShown`, `hinted[]`, `exampled[]`, its own `lines`/`ink`) on the session as `warmup`; actions `warmup/reveal · stroke · undo · clear · hint · example · example-step · next`; `warmupProblem(s)`; the flow is now accept/decline → `confidence` → (`practice` if taken) → `working`; `ORDER` and `sessionAt` follow the new order |
| `lib/hierarchy.ts`, `lib/examples.ts`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx` | Before-hand-in stage lists reordered (membership unchanged) |
| `components/PracticeCard.tsx` | Optional controlled mode (`shown` + `onReveal`) so the worked example's step count lives in the session; `compact` stacks label over maths for the 400 px column |
| `app/student/screens/PracticeScreen.tsx` | The warm-up as the working layout: problem · pad · Read as, "On to the set" always on the right. `HelpMenu` ("I’d like a…": hint · worked example · video, status at the right; dismissed by a tap outside or Escape). The example replaces the pad; complete → "Try one more →" → split pane: finished example over the follow-up on the left, clean pad in the middle |
| `app/student/screens/PracticePrompt.tsx` | `Scrim` exported for the help menu |
| `app/student/screens/ConfidenceScreen.tsx` | Button reads "Warm up" or "Start Q1" from the earlier choice; the "Warm-up done" caption is gone |
| `app/student/StudentApp.tsx` | Hands `session` and `dispatch` to the warm-up |
| `lib/session.test.ts` | New order, deep links, the warm-up slice (isolation from `lines`/`ink`, undo/clear, hint once per problem, example gating the follow-up, recognition scripts present) |
| `vitest.config.mts` | `import.meta.dirname` (drops Vite's `__dirname` warning) |

## How it connects

```
 OverviewScreen ── Warm up ──▶ practice/accept ─┐
                ── Start ────▶ practice/decline ─┴─▶ ConfidenceScreen ── confidence/set ──▶ stage = taken ? practice : working
                                                                                                    │
      ┌─────────────────────────────────────────────────────────────────────────────────────────────┘
      ▼
 PracticeScreen (stage practice)              session.warmup { problem, example, exampleShown, hinted, exampled, lines, ink }
 ┌──────────────┬──────────────────────┬────────────┐
 │ problem      │ PadSection           │ ReadAs     │   strokes ──▶ warmup/stroke · burst end ──▶ nextLine(RECOGNITION_WARMUP[id]) ──▶ warmup/reveal
 │ hint card    │  or, while example:  │ On to the  │
 │ I need help ─┼▶ HelpMenu            │ set ───────┼──▶ practice/finish ──▶ working
 └──────────────┤  hint ──▶ warmup/hint (card under the problem)
                │  example ──▶ warmup/example ──▶ PracticeCard(shown = exampleShown, onReveal = warmup/example-step)
                │             all shown ──▶ exampled ∋ id ──▶ "Try one more" ──▶ warmup/next ──▶ problem = second
                │  video ──▶ href="#" (dead, "Not available yet")
                └──────────────────────────────────────────────
 second: grid 400 | 1fr | 300 · left = PracticeCard(PRACTICE, all steps, compact) over the follow-up · the same pad, help and exit

 lib/hierarchy sessionEvidence / feedback / versions read session.lines only, so the warm-up is invisible to marking and to the teacher grid.
```

## Verified by

vitest (129 tests): the new flow and deep links; warm-up lines and ink isolated from the marked
slices with escalation untouched; undo and clear; a hint once per problem; the example gating
"Try one more"; each warm-up problem has a recognition script. `tsc --noEmit`, `eslint`,
`next build`. CDP click-through on `/student`: Warm up → "How confident are you?" → Depends on
the skill · Algebra → button "Warm up" → the three-pane warm-up with "Warm-up · NOT MARKED"; a
stroke burst reads one line; help menu lists hint / worked example / video; the hint card stays
under the problem; the video click changes nothing; the example replaces the pad, four steps,
"Try one more →"; the split pane shows the finished example on the left, `x² − 7x + 10 = 0`, a
clean pad that reads a line; reload lands on the same follow-up with its line; help is offered
again; "On to the set" lands on Q1 with `session.lines` empty and the warm-up slice intact; the
decline path's button reads "Start Q1"; `?stage=practice` deep-links to the warm-up.
