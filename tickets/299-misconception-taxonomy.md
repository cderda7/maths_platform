# 299: Mistakes are named by misconception, from one taxonomy with permanent ids

**What to build:** every wrong line of every evaluation table points at one entry of a named misconception taxonomy with a permanent id. The Mistakes tab's pills, the class review picker, the repeated-slip rule and the Classroom's top gap all name and count mistakes by it, not by skill. Counts add up across students, sets and classes.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-15), from an outside review: "Granularity mismatch. 'Where students went wrong' labels clusters by skill ('null factor law'). Class review labels the same clusters by misconception ('guessed pair, not expanded back', 'scaled two of three terms', 'tripled, third term not restored'). The second is right and it's already in your product. Use misconception labels everywhere. Then make them a stable named taxonomy with IDs that persist across students, sets and cohorts, so you can count them. Right now you can't tell me how common 'null factor law without zero' is nationally. Eedi can answer that question about its own taxonomy, and that's the whole difference. let's make this edit"

## Decisions (asked 2026-09-15)

- The Mistakes pill reads the **taxonomy name**, the same on every problem and set; the wrong line over the names already shows the instance. Clusters regroup by misconception.
- Class review and the "repeated" rule switch to the same id: one name everywhere. More slips read as repeated (accepted when asked).
- Also switch: the Classroom's top gap (here), Compare and picker chips and the blame chip (ticket 301), diagnostic distractors (ticket 302).
- The ids reach the evaluation tables only. Story patterns, tile tags and notes stay free text (FUTURE_FEATURES).
- Naming rule relayed from the user the same day: a name says what is wrong, never what the student is supposed to have done (no "guessed", "trying", "slipped", "misread").

## Acceptance

- [x] `data/misconceptions.ts`: 37 misconceptions (name of five words or fewer, an `about` sentence), ids typed, permanent, tested
- [x] Every wrong line in the six tables carries `misconception`; `LineVerdict.name` is gone
- [x] Mistakes tab: pills name the misconception, groups cluster by it, a long pill widens its columns and never wraps or clips
- [x] Class review picker names options by misconception; "repeated" compares ids; the 14 review cases that flipped are rewritten in the sheet and the records
- [x] Classroom top gap by misconception; the story sheet's top gaps and `specs/class-story.md` follow
- [x] `lib/misconceptionCounts.ts`: sightings and counts by id across students, sets and classes
- [x] vitest, eslint, tsc, next build, check:laptop; click-through

## Solution

`data/misconceptions.ts` holds the taxonomy as code, like the skill taxonomy: `MISCONCEPTIONS` (id → name, about), `MisconceptionId`, `misconceptionName`, `isMisconceptionId`. The 105 per-problem names were sorted by hand into 37 misconceptions (one id per former name, via a mapping script), then renamed under the naming rule. `wrong()` takes the id as its fifth argument.

`lib/mistakes.ts` rows carry `misconceptions` instead of leaf `slips`, and `groupBySlip` groups by them. `SlipChip` renders the name. `TeacherMistakes`' `FitGrid` adds each pill group to its widening pass. `lib/classroomCards.ts` clusters the top gap by misconception. `lib/examples.ts` names options from the first wrong line's id (`ExampleOption.misconception`). `lib/reviewRule.ts` and `lib/classStory.ts` compare ids.

Consequences in the data: 14 past review cases became repeated slips (PS1 Sofia Q7, Q10; PS3 Amelia Q2, Q4, Tomas Q2, Q6, Q10, Aiden Q1, Q7; PS4 Tomas Q5, Q9; PS5 Tomas Q2). Their second submissions are removed and the sheet's reasons rewritten. Every group already had a version of each problem. Top gaps are now PS1 square out, root not taken (3, a three-way tie at 3); PS2 applied to some terms only (6); PS3–PS5 brackets don't expand back (7, 8, 7); PS6 applied to some terms only (6).

Verification: vitest 1037 (`data/misconceptions.test.ts` 3, `lib/misconceptionCounts.test.ts` 3); eslint, tsc, next build; check:laptop 74; `click299.mjs` 894/894 at 1280×800 and 1440×900. It checks every pill on all six sets' Mistakes tabs (reads a taxonomy name, one line, unclipped, inside its cell, no skill label, no sideways page scroll). It also checks the Classroom's six top gaps, fitting their cards; Q7's three pills, which don't move when Q7 opens; and Q7's class review picker (correct plus the three names, none clipped).
