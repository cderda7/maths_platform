# 353: "Your turn", "On your own" and "Skip to the set" all confirm before moving on unfinished

**What to build:** "Your turn" and "On your own" are pinned to the corner of the middle column for the whole step, not just once ready, greyed out until the step's own last item is done, and — like "Next skill" — a press before then asks first rather than silently doing nothing or moving on unconfirmed. "Skip to the set" always asks first too, since it always means leaving something unfinished.

**Blocked by:** 349.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 349 pinned "Your turn"/"On your own" to the corner, but only once the step was already finished (they simply didn't render before then), and a press always acted immediately with no confirm — deliberately different from "Next skill".

Carson (2026-09-16), after seeing that build: "'your turn' & 'on your own' still not working -- want them in the bottom right corner of the center column during the whole working period, just greyed out until last step is done. same functionality as 'next skill' -- confirm you want to move on. let's ALSO do this for 'skip to the set' -- confirmation gate." This reverses ticket 349's "no confirm" call for those two buttons and adds a fourth gated control.

## Acceptance

- [x] On the worked-example step, "Your turn →" is pinned to the corner from the moment the step opens (not only once the example has been seen in full), greyed out (`aria-disabled`, still clickable) until it has
- [x] On the completion step, "On your own →" is pinned to the corner from the moment the step opens, greyed out until every blank is filled in
- [x] A press on either while not ready opens a corner confirm naming what's unfinished ("Are you sure you'd like to move on to your turn? You haven't seen the whole example yet." / "…to your own turn? You haven't finished every line yet."); confirming moves on anyway (the reducer's `warmup/next` gains a `force` flag, ticket 313's readiness guard bypassed only when explicitly confirmed); a press once ready acts at once, same as before
- [x] "Skip to the set" always opens a corner confirm ("Are you sure you'd like to skip the rest of the warm-up and go to the set?"); confirming skips, "Keep going" cancels and the warm-up carries on
- [x] "Next skill" is unchanged from ticket 349 (greyed until the skill's alone problem is finished, confirms before then)
- [x] Every confirm drops when it goes stale: switching skill or step (a chip) while one is open, or finishing the step while it's still open, both close it with no second press
- [x] vitest (a new case for `force` in `lib/warmupSteps.test.ts`), eslint, tsc, next build; a click-through against a production build covering all four gates: greyed from the start, the confirm's wording, cancelling, confirming (force-advancing past an unfinished step), and the button un-greying and acting directly once actually done
- [x] Ticket docs: `architecture/353-warmup-confirm-all.md`, ARCHITECTURE, DECISION_LOG

## Notes

- `lib/session.ts`'s `warmup/next` action gains an optional `force?: boolean`; existing tests (`lib/warmupSteps.test.ts`, `lib/session.test.ts`) never set it and are unaffected — confirmed by running the suite unchanged before adding the new `force` test.
- Hit an unexpected snag from `eslint-plugin-react-hooks`'s new `react-hooks/purity` rule: storing a closure that (deep inside) calls `Date.now()` as a *value inside an object literal* built during render gets flagged as "calling an impure function during render", even though the closure is never invoked until a later click. Passing the same closure as a bare argument to another function (itself only called from inside a JSX-attribute arrow) does not trigger it. Worked around by keeping the confirm dialog's message/label as plain-string lookup tables and dispatching the actual action through a single `if`/`else` chain inside the confirm button's own `onClick` arrow, rather than a lookup table of functions.
