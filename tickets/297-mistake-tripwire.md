# 297: "Not now" keeps the practice offer armed

**What to build:** during individual working, a second mistake on the same topic offers isolated practice (unchanged). A student who answers "Not now" is offered it again on the very next mistake on that topic, not two mistakes later. Tests pin the policy through the session reducer and in the browser.

**Blocked by:** none (can start immediately).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

A simulated student's review of individual working (2026-09-15): "Silence is the right call but it is unguarded. I wrote a sign error on Q1 and nothing stopped me carrying it through the set. You need a tripwire: same error class three times, offer the prerequisite. Not a correction. An offer."

The user: "do tdd to ensure this is addressed. like rn we should have the policy of on second same mistake, gets offered subskill practice -- this simulated user is saying it's not working as expected".

Reproduced in the browser on a production build before any change: Sam's scripted Q1 slip (`(x + 2)(x + 3)`, factorising) passes silently, and Q2's (`(2x + 4)(x - 1)`, factorising) raises "2 minutes on factorising?" on its second line. The offer already fired. Two things made it read as "nothing stopped me":

1. "Same mistake" is counted by topic (taxonomy group), not by kind of error. The user kept that: same topic.
2. "Not now" reset the count, so after declining, the next slip on the same topic passed silently and a fourth was needed. The user chose: the offer comes back on the very next same-topic mistake.

## Acceptance

- [x] Second mistake on a topic offers practice (unchanged, now also checked in the browser)
- [x] After "Not now", the next mistake on that topic offers practice again, on the most fundamental of all leaves slipped since practice was last taken
- [x] After "Not now", a mistake on another topic offers nothing
- [x] After "Yes" (or "I need help"), the count starts again: the next mistake on that topic is a first mistake
- [x] The offer says which mistake it is: "second" first, "third" (and so on) on a re-offer, so it never tells a student something untrue
- [x] Tests at the agreed seams: `sessionReducer` (vitest) and a browser click-through; the counter's own tests follow the changed rule
- [x] vitest, eslint, tsc, next build; click-through `click297.mjs`

## Solution

`lib/escalation.ts` no longer resets a topic's count and slipped leaves when practice is offered. A new `practiceTaken(state, group)` resets them, called by the session's `prompt/accept` and by `requestHelp` (asking for help is practice taken at once). A declined offer leaves the count at two or more, so every further slip on that topic offers again. Entries (and the caution flag at the second) still count offers, as before: a student who declines and slips again raises the teacher's caution, like one who declines and then asks for help already did.

The offer's line came from a fixed "This is your second mistake on …", which a re-offer would have made untrue. `promptSentence(session)` in `lib/session.ts` reads the topic's count (still there while the offer shows, since only practice taken resets it): second, third, … tenth, then "another"; a session saved before this ticket (count already reset) reads second. `PromptModal` takes the sentence from `WorkingScreen`.

Verification: vitest 1031 (`lib/session.test.ts` four new, and one more assertion on the re-offer's sentence: re-offer after Not now, no offer on another topic, first mistake again after Yes, the first offer's sentence; `lib/escalation.test.ts` one new, three following the rule), eslint, tsc, next build. Browser, `click297.mjs` 42/42 at 1440×900 on a production build: Sam writes all ten problems one burst per line, twice. Declining: one offer, exactly on Q2 line 2, naming factorising and a second mistake over a dimmed pad; Not now closes it with no practice opened; the rest of the set offers nothing (no third factorising slip in Sam's script); factorising stays armed; no caution. Accepting: Yes opens practice on monic factorising, Back to Q2 returns to Q2 with no offer; the count resets; no caution. Stored sessions reloaded with the offer open: count 2 reads "second mistake on factorising", count 3 "third", a pre-297 count of 0 "second"; the card stays 560 wide with its body on two lines and the same height in all three.

The re-offer itself is proven through the reducer only: Sam's scripted pad has no third factorising slip to write (FUTURE_FEATURES).
