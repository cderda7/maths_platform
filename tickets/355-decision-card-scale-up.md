# 355: The decision card's stage names get their own colour, and the whole card gets bigger

**What to build:** two follow-ups from Carson on ticket 351's shipped card: the destination stage named in the card's "Next: …" line should carry the same light-blue look as the pathway strip's own pills, for visual association; and the whole card — type and footprint both — should be substantially bigger, "like double in size approximately."

**Blocked by:** 351.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-16, once ticket 351 was live: "put 'indiv review' in the light blue (for visual consistency, makes association clearer that it's a stage). beyond that, it looks GREAT. finally, just make the whole thing bigger. want text bigger, want the pop up to take up more space. like double in size approximately."

The "Next: indiv review — …" line named the stage in plain text; nothing tied it visually to the strip's own pills (`StagePill`, `bg-standout-soft`/`text-ink`), the exact visual language the top-right reference already uses for "this is a stage." And every size on the card (headline, evidence, next-stage line, split rows, buttons, the Change view's stops) was untouched since ticket 335/336/337 — small relative to how central this card has become to teacher pathway control.

## Solution

- **`StageBadge`** (`app/teacher/DecisionCard.tsx`) — a small inline component reusing `StagePill`'s exact look (`bg-standout-soft`, `text-ink`, `font-display`), sized for inline text flow. Wraps the *destination* stage's name in the next-stage line (`indiv review`, or `group review`/`class review` in the skip variants) — not a stage being skipped over, since that one isn't where the class is headed.
- **Card widens 480px → 680px**, and every size on it scales up with it: headline 22px→30px, body copy 14px→19px, notes 13px→17-18px, `SplitRow`s' text/checkbox/figure sizes, the split list's scroll height 300px→440px, buttons to `size="lg"`, and the Change view's `PathwayStop`s (a new `card-lg` size added to the shared component, 136×32 → 190×44, 13.5px→18px — additive, the other caller (`PathwayMap`) untouched).
- **`Eyebrow`** (`components/ui.tsx`) gained an optional `style` prop, since its own `text-[11px]` class beats a later className override in Tailwind's cascade order (the same pitfall as the Button padding issue from ticket 143) — the two "Your pathway"/"Also often wrong"/"All questions" eyebrows on this card now pass `style={{ fontSize }}` to actually get bigger.

## A tradeoff surfaced, not hidden

Ticket 335 deliberately sized the card (400px, later 480px in ticket 351) to **never cover a roster row** on Class View at 1280px width — the roster's right edge sits 437 layout px from the window's right edge there, and the card's 16px inset plus its width has to stay under that. Measured live (screenshot, `/teacher/a/pset-6/class` at 1280×800): ticket 351's 480px width was *already* over that line by about 59 layout px (an uncaught regression, not something this ticket introduced); at 680px the overlap is roughly 260 layout px — several of the rightmost roster rows (SET score, avatar) sit behind the card while it's open.

Carson asked for "double, approximately" twice, clearly, after already seeing and approving the shape of the card. Rather than silently shrinking the request back down to comply with a constraint from a different, older ticket, or silently breaking that constraint without saying so: shipped the size as asked, logged the tradeoff here and in `DECISION_LOG.md`, and left a note in `FUTURE_FEATURES.md` for a responsive/adaptive fix if the overlap turns out to matter in practice.

## Acceptance

- [x] The next-stage line's destination stage name (`indiv review` in the normal case; `group review`/`class review` in the two skip variants) renders in the strip's own light-blue pill look
- [x] Headline, body text, split rows, buttons and the Change view are all noticeably larger, proportionally consistent with each other
- [x] Card is 680px wide (up from 480px)
- [x] `PathwayStop`'s new `card-lg` size is additive; `PathwayMap` (Create's own pathway line) is untouched
- [x] vitest, eslint, tsc, next build, check:laptop 76/76 (checks horizontal page overflow, not this overlay — passing does not contradict the roster-overlap finding below)
- [x] Verified live against a production build at 1280×800: the passive next-stage card (with the badge), the Change view, and the roster-overlap measurement, screenshotted
- [x] The Class-View roster overlap at 1280px is measured, explained, and logged (`DECISION_LOG.md`), not silently fixed or silently ignored
- [x] Ticket docs: this file, `architecture/355-decision-card-scale-up.md`, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`

## Known gap

The SplitRows/confirm-step content (the tick list, the two-stage move confirmation, `ProblemQuestion`'s new `figureWidth={56}`) was scaled by the same proportional approach as everything else verified live, but a live screenshot of it specifically wasn't captured this round — reproducing ticket 337's "half the room has handed in corrections" demo timing needed more fixture-construction than this round's scope justified. The logic is untouched (only size/spacing values changed) and vitest's existing coverage of `moveConfirmSentence`/`SplitRows`' underlying data still passes; worth a quick visual check next time that state comes up naturally.
