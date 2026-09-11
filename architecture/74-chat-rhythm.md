# 74 · The concerns chat's rhythm: one bubble at a time, and a box that says whose turn it is

Route: `/student?stage=warmup-chat`.

## Files touched

| File | What it does |
|---|---|
| `lib/warmup.ts` (+ test) | `concernTurns(seed)`: the turns as lists of bubbles (the opening two: setup then ask; later questions one). `closingLine(first)`: "Thanks. Let's start with fractions." `turnSteps(bubbles, opening)`: the playback as `PlayStep`s `{ at, shown, dots }`, with `CHAT_BEAT_MS` 400, `CHAT_DOTS_MS` 1000, `CHAT_CLOSE_MS` 1200 (2800 since ticket 107). `concernTranscript` emits one tutor line per bubble; `concernsAnswered` counts turns |
| `lib/session.ts` (+ test) | `warmup/say` no longer opens the pad and is ignored once every question has its answer; new `warmup/begin` opens the pad only then |
| `app/student/screens/WarmupChatScreen.tsx` | Renders answered turns in full, then the current turn's bubbles up to the step reached, then the dots; timers step through `turnSteps` for the turn after the last answer (keyed on the answer count, so a reload replays only that turn) and send `warmup/begin` after the closing bubble. The box is disabled, cream and "the tutor is writing…" until the turn's last bubble; then paper, focused, "in your own words…", with `pulse-once` on its wrapper |
| `app/globals.css` | The ring pulse moves from `.offer-in::after` to `.pulse-once::after`; `.offer-in` keeps the rise. Both off under reduced motion |
| `app/student/screens/ConfidenceScreen.tsx` | The callout is `offer-in pulse-once` |

## How it connects

```
   lib/warmup.ts                                  WarmupChatScreen
   concernTurns(seed) = [                          answers = stored student lines
     ["Let's do a warm up on a & b.",              turnIndex = answers.length
      "First, tell me … with a."],                 closing  = turnIndex ≥ turns.length
     ["Next, tell me … with b."] ]                 current  = closing ? [closingLine(first)] : turns[turnIndex]
                                                   steps    = turnSteps(current.length, turnIndex == 0)
   turnSteps(2, opening)                           play     = the step reached (timers), tagged with its turn
     0     shown 1, dots      ← first bubble is
     1000  shown 2, no dots     already there      transcript = turns[0..turnIndex) each + its answer, at once
   turnSteps(1, later)                                        + current[0..play.shown) + (play.dots ? "…" : ∅)
     0     shown 0, no dots  ← the student's
     400   shown 0, dots       bubble just landed  yourTurn = !closing && play.shown ≥ current.length
     1400  shown 1, no dots
                                                   box   off: disabled · cream · "the tutor is writing…" · send grey
   closing: steps as "later", then                       on: paper · focus() · "in your own words…" · .pulse-once
     + CHAT_CLOSE_MS → dispatch warmup/begin
                                                   send → warmup/say → answers.length + 1 → the next turn plays
   lib/session.ts
     warmup/say    ignored once concernsAnswered   (the chat stays for the closing bubble)
     warmup/begin  warmup-chat ∧ concernsAnswered → stage = practice

   Reload mid-turn: answered turns render in full; the current turn's timers start again from 0.
   The "your move" cue: .pulse-once (one accent ring) on the offer callout (72) and on the box here.
```

## Verified by

vitest (311 tests: turns, closing line, playback steps, the reducer's say/begin); eslint and tsc
clean; `next build`. Headless Chrome on the built app (port 3133), sampled on a clock: 150 ms after
"Warm up" one bubble, the dots, the box disabled and cream with "the tutor is writing…", send off;
at 1250 ms two bubbles, no dots, the box white, focused, "in your own words…", the ring animating,
send off until text is typed; after send, at 150 ms the student's bubble and no dots, at 650 ms the
dots, at 1650 ms "Next, tell me about your concerns with zero-finding." and the box on again; a
reload at that point shows the answered turn in full and replays only the second turn (dots at
300 ms, the question by 1700 ms); after the last answer, at 1600 ms "Thanks. Let's start with
factorising." with the box off, and at 3000 ms the pad. Screenshots of the dots, the box turning on
mid-pulse, the second turn and the closing bubble.
