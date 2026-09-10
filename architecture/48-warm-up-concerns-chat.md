# 48 · Warm-up concerns chat, and the pad's skill buttons

Route: `/student` (stages `overview` → `confidence` → `warmup-chat` → `practice` → `working`).
Deep links: `/student?stage=warmup-chat` (three skills ticked, no answers yet; also the demo
strip's "warm-up"), `/student?stage=practice` (the three answers behind it: fractions, factorising,
the null factor law, then non-monic factorising).

## Files touched

| File | What it does |
|---|---|
| `data/types.ts` | `Stage`: `warmup-pick` → `warmup-chat` |
| `lib/warmup.ts` | The chat's script, pure: `concernPrompts(seed)` (no seed: one open question; one skill: "Let's do a warm up on a. Tell me a little bit about your concerns with a."; more: "Let's do a warm up on a, b, & c. First, tell me a little bit about your concerns with a." then "Next, tell me about your concerns with b." per skill), `concernTranscript(seed, messages)` (question, answer, question … up to the first unanswered; stored tutor lines from an older snapshot are ignored), `concernsAnswered(seed, messages)`. `focusLeaves(seed: LeafId[], messages)` now starts from the ticked skills rather than picked problems; `interpret` unchanged, so an answer naming "fractions" or "Q2" still adds those. `tutorReply` removed |
| `lib/session.ts` | `WarmupState`: `selected` gone, `done: string[]` added (problem ids worked through). Actions: `warmup/select` and `warmup/begin` gone; `warmup/say` only at `warmup-chat`, stores the student's line and moves to `practice` once every question is answered; `warmup/skill-done` adds the current problem to `done` and opens the nearest not-done step after it (wrapping), or → `working` when none is left; `warmup/goto {step}` opens any step. `warmupSeed(s)` (the `low-when` leaves, else `[]`), `warmupFocus(s) = focusLeaves(warmupSeed(s), messages)`. `confidence/set` → `warmup-chat` when the warm-up was chosen. `DEMO_WARMUP_CONFIDENCE` (factorising, fractions, null factor law) and `DEMO_CONCERNS` (three answers, the first naming Q2) seed the two warm-up deep links; later stages keep `DEMO_CONFIDENCE` |
| `app/student/screens/WarmupChatScreen.tsx` | New. A centred column (`max-w-3xl`, like the confidence screen): eyebrow "Warm-up", the transcript as bubbles (tutor left on paper, student right on ink), a textarea (Enter sends, Shift-Enter for a newline) and an accent "send" disabled while empty. Focus returns to the textarea after each send. Nothing else: the last answer changes the stage |
| `app/student/screens/WarmupPickScreen.tsx` | Deleted |
| `app/student/screens/PracticeScreen.tsx` | The strip above the problem is now `<button>`s, one per problem in `warmupSequence(focus)`: `data-state` current / done / todo; current and done `bg-standout text-white`, todo `bg-standout-soft text-standout`; the current one carries a `ring-2 ring-standout-line` and `aria-current="step"`; a tap → `warmup/goto`. "Next skill →" → `warmup/skill-done`; the label is "On to the set" when no other skill is left undone; "Skip to the set" shows while one is |
| `components/ProblemCard.tsx` | Selection (`selected`, `onToggle`, `highlight`) removed with the chooser; keeps `chips` and `compact` for the start screen's tiles |
| `app/student/StudentApp.tsx`, `app/student/page.tsx`, `app/teacher/TeacherLive.tsx`, `app/teacher/ForceSubmit.tsx`, `lib/examples.ts`, `lib/hierarchy.ts`, `lib/demo.ts` | The renamed stage in the crumb map, the URL stage list and the before-hand-in lists; the "warm-up" skip target → `sessionAt("warmup-chat")` |
| `lib/session.test.ts`, `lib/warmup.test.ts`, `lib/demo.test.ts` | The flow, the overall-answer case, a question named in an answer, done/wrap/goto on the pad, hydration of an older snapshot, the prompts and the transcript |

## How it connects

```
 ConfidenceScreen ── confidence/set { level: "low-when", leaves: [a, b, c] } ──▶ practice === "taken" ? warmup-chat : working
                                          │
                                          ▼ warmupSeed(s) = [a, b, c]           (an overall answer: [])
 WarmupChatScreen (stage warmup-chat)
 │ concernTranscript(seed, warmup.messages)                 concernPrompts(seed)
 │   [tutor] Let's do a warm up on a, b, & c. First, tell me a little bit about your concerns with a.
 │   [student] …            ──▶ warmup/say ──▶ messages + 1
 │   [tutor] Next, tell me about your concerns with b.
 │   [student] …
 │   [tutor] Next, tell me about your concerns with c.
 │   [student] …            ──▶ warmup/say ──▶ concernsAnswered? ──▶ stage practice
 ▼
 PracticeScreen (stage practice) ── PracticePad (run = warmup)
 │ focus = focusLeaves(seed, messages)   → seed ∪ leaves named in answers ∪ leaves of "Qn" named
 │ sequence = warmupSequence(focus)      → one problem per leaf, easiest first
 │ strip: [a ■ done][b ■ current ◎][c □ todo][d □ todo]   ■ = standout on white   □ = standout-soft
 │   tap ─────────────▶ warmup/goto { step }        (no marking)
 │   "Next skill →" ──▶ warmup/skill-done ──▶ done + current · step = nearest not done after it (wraps)
 │   "On to the set" ─▶ warmup/skill-done ──▶ none left ──▶ stage working
 │   "Skip to the set" ▶ practice/finish  ──▶ stage working
```

## Verified by

vitest (269 tests: 4 new, the chooser's rewritten); eslint and tsc clean; `next build`; a
headless-Chrome run of the built app on port 3131: start → "warm up" → three skills ticked → the
chat's three questions with the exact wording above, "send" disabled while empty, the third answer
opening the pad; four chips easiest first with the computed backgrounds `rgb(47, 111, 179)` for
current/done and `rgb(232, 240, 250)` for todo; "Next skill →" marking fractions done; a tap on the
fourth chip opening non-monic factorising; Next wrapping to factorising then the null factor law
with "On to the set" and no "Skip to the set"; landing on the working screen; the demo strip's
"warm-up" landing on the chat; an overall "not confident" answer getting the open question and, with
nothing named, the default factorising warm-up alone. The start screen's ten tiles still render
with no chips after the card's trim.
