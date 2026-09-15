# 314: Where each student is, moment to moment

## Files touched

| File | What it does |
| --- | --- |
| `lib/place.ts` | New. The place model. `Place` (not started, confidence check, warm-up chat, warm-up on a skill at a step, a question with its detail, handed in, absent), `StudentPlace` (the place and `since`, when that step began). `sessionPlace` reads Sam's session (the one function tickets 312 and 313 extend); `carrySince` keeps a first-seen time for a place that has none; `classmateTimeline` turns a classmate's record and stream script into places in time order; `segmentAt` reads one at a moment; `classPlaces` gives the whole class at `now` on the stream's clock; `rowKey` and `placeRows` put them in lesson-order rows (Starting, Warm-up, Q1 … Q10, Handed in) with the absent in none. No React. |
| `data/stream.ts` | The classmates' script gains what happens inside its times: `warmUpSkills` (the five who answered not confident), `help` (four students, each on a question they slipped on, the skill of that wrong line) and `hints` (three students), plus the timing shares (`CONFIDENCE_CHECK_MS`, `CHAT_TURN_MS`, `WARM_UP_STEP_SHARES`, `HELP_STEP_AT`, `HINT_AT`). No answer or hand-in time changes. |
| `lib/place.test.ts` | New, 26 tests: the story against the records (confidence answers, real slips via `evaluateLine`, practices of their own), the schedule unchanged, every timeline in order and inside its answers, agreement with the roster pill at every 1.5 s, each place and step at its moment, the end state and a presenter skip, reload purity, a diagnostic chain stopping the clock, Sam's hand-in ending the stream, a finished set, absence, Sam's session places, `carrySince`, rows. |

## How it connects

```
 data/classmates.ts  CLASSMATES (confidence, done, wrong, attempts)          data/evaluation.ts (the tags of each wrong line)
        │                                                                              │ (held to by lib/place.test.ts)
        ▼                                                                              ▼
 data/stream.ts  STREAM_PACES { warmUpMs, paceMs, firstMs, submitAtMs,  + warmUpSkills ◄314, help ◄314, hints ◄314 }
        │                     timing shares ◄314
        ├──────────────▶ lib/stream.ts  scheduleFor (answers, hand-ins: unchanged) · streamElapsed · wallAt · streamOver
        │                        │
        ▼                        ▼
 lib/place.ts ◄314  classmateTimeline(m) ─▶ [ confidence │ warm-up chat │ warm-up skill 1·2·3 … │ Q1 (hint n │ practice 1·2·3) … │ handed in ]
                    segmentAt(timeline, stream clock)
                          │
 lib/session.ts ──▶ sessionPlace(session)  ◄── tickets 312 / 313 extend (step + step start times)
 (stage, warmup, overlay, overlayRun, practices, problemIndex, handedInAt)
                          │
                          ▼
                    classPlaces(set, session, now, absent) ─▶ StudentPlace[] (Sam first, roster order)
                          │                                     carrySince(prev, next, now) for a place with no time
                          ▼
                    placeRows(places, problems) ─▶ Starting · Warm-up · Q1 … Q10 · Handed in   + absent (no row)
                          │
                          ▼
            ticket 315: the Mistakes tab's "Where students are" column (lib/assignments.ts AssignmentBundle as the set)
```
