# 71 · Start alone, Submit, and the fork after a not-confident answer

Route: `/student` (overview), `/student?stage=confidence`.

## Files touched

| File | What it does |
|---|---|
| `lib/session.ts` (+ test) | `overview/start` (START → `confidence`); `confidence/set` now stores the answer and sends only "confident" to `working`, the other two stay on `confidence`; `warmup/accept` → `warmup-chat` (practice taken) and `warmup/decline` → `working` (practice declined), each only while `warmupOffered(s)` (a not-confident answer in, no choice yet). The old overview `practice/accept` / `practice/decline` actions are gone |
| `app/student/screens/OverviewScreen.tsx` | One button, START (accent, bottom-right), `data-start`; the WARM UP button is gone |
| `app/student/screens/ConfidenceScreen.tsx` | Takes `answered` (the recorded not-confident answer while the offer is open, else null) plus `onSubmit` / `onWarmup` / `onStart`. The button reads "Submit" whatever the answer. Once answered, the list shows the session's answer (not the draft), is `pointer-events-none`, and the button row becomes "Warm up" (accent) + "Start the set" (secondary) above an empty 48 px `data-submit-spot` where Submit stood |
| `app/student/StudentApp.tsx` | Wires the four callbacks; `answered` is `warmupOffered(session) ? session.confidence : null` |

## How it connects

```
   before (tickets 27 / 47 / 48)                        after (ticket 71)

   OverviewScreen                                       OverviewScreen
     WARM UP ──▶ practice/accept ─┐                       START ──▶ overview/start ──▶ stage = confidence
     START   ──▶ practice/decline┴▶ stage = confidence
                                                        ConfidenceScreen ── Submit ──▶ confidence/set
   ConfidenceScreen                                       "confident"        → practice = declined, stage = working (Q1)
     "Warm up" | "Start Q1" ──▶ confidence/set            "not confident"    ┐ stored; stage stays confidence,
       taken   → warmup-chat                              "not confident with…"┘ warmupOffered(s) = true:
       declined → working                                    the list locks, Submit's spot is left empty,
                                                             ┌──────────────────────────────┐
                                                             │ [ Warm up ]  [ Start the set ]│  ← just above the spot
                                                             └──────────────────────────────┘
                                                                  │               │
                                                        warmup/accept        warmup/decline
                                                        practice = taken     practice = declined
                                                        stage = warmup-chat  stage = working (Q1)
                                                        (ticked skills are the chat's seed, as before)

   warmupOffered(s) = stage == confidence ∧ confidence ≠ null ∧ level ≠ confident ∧ practice == null
   The answer and the open offer live in the session: a reload shows the same locked list and offer;
   the teacher's mirror sees "answered, choosing". sessionAt / skipFixture land where they did.
```

## Verified by

vitest (307 tests, four rewritten for the new actions); eslint and tsc clean; `next build`. Headless
Chrome on the built app (port 3131): the overview shows only "start"; Submit is disabled until an
answer; two skills ticked + Submit leaves the list locked (`pointer-events: none`), Submit gone, the
offer's bottom edge exactly at the empty spot's top edge; a reload keeps the offer with the same two
skills ticked; "Warm up" opens the chat naming factorising & the discriminant; "not confident" +
Submit + "Start the set" opens the pad; "confident" + Submit opens the pad with no offer; the demo
strip's "warm-up" and "start" land on the chat and the overview.
