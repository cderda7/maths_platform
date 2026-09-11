# 96: The lit hint box stops short of the glyph next to it

**What to build:** When a hint word lights its fragment of the problem, the blue box around the fragment never covers a neighbouring glyph. The 7 of 7x lights with the x wholly outside its box, and the layout does not move when the box appears.

**Blocked by:** 88 (the abutting-fragments gap), 83 (the box's padding).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-11), with a screenshot of the monic warm-up's first hint, "middle coefficient" hovered: "refine this -- i don't like how the x gets partially put into the blue box. avoid overlap".

The box is padded beyond its fragment and was ringed 2px further (ticket 83, ticket 30), so the eye finds it; 7 and x are typeset touching, so the box reached about a third of the way into the x. The same held for the 3 of 3x², the 10 inside 10x, the 3 of 3x on a read line, and the conjured 1 in front of x².

## Solution

- `lib/hint.ts`: `wrap` writes a thin space (`\,`) between a wrapped fragment and a glyph typeset flush against it on either side: a letter, digit or bracket, spaces skipped, but not a command name's last letter. Written at rest as well as lit, so lighting still moves nothing. `conjure` writes the same after the inserted fragment. The abutting-fragments gap (`\kern0.7em`) is unchanged.
- `app/globals.css`: `.hint-term` padding is `0.2em 0.12em` (was `0.12em 0.1em` plus a 2px ring in the same colour, which only made the box bigger); the ring and its transition go. The sides stay inside the thin space, so the neighbour's cell is 1px clear of the box at the problem's size.
- `lib/hint.test.ts`: the thin space on either side, none beside an operator, relation, brace or command; every existing expectation updated; the no-layout-change sweeps allow the gap at rest.

## Acceptance

- [x] Monic warm-up, "middle coefficient" hovered: the x's cell starts 1px right of the box; "constant" hovered: the "=" is 3px clear
- [x] Non-monic: the 3 clears the x², the 10 inside 10x clears the x, the whole 10x box holds the thin space inside it
- [x] Lighting any term changes no spacing in any warm-up problem or read line (existing sweeps, gap allowed at rest)
- [x] vitest (338), eslint, tsc, `next build`, headless browser check; architecture note, root docs, decision log, future features
