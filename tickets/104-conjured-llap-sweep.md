# 104: The conjured 1 hangs in the margin, and the lit box sweep lives in the repo

**What to build:** Two follow-ups agreed in the grilling after tickets 96–100. (1) On the discriminant warm-up, hovering "a" shows a lit 1 in front of x² that the problem does not write; it now hangs in the margin to the left of x² at zero width, so the problem's glyphs do not move while it shows. Lighting a hint word now moves nothing anywhere, with no exception. (2) The headless-browser sweep that caught the factor and denominator overlaps is checked in as `scripts/hint-box-sweep.mjs` with an npm script, and CLAUDE.md says to run it before calling any change to the box or to `lib/hint.ts` done.

**Blocked by:** 98 (the per-axis box), 100 (the tall fraction box).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user asked for a grilling to be sure the lit box was resolved (2026-09-11). Seven questions; all settled as recommended:

1. The maths on screen is the TeX in the data as KaTeX sets it; no spacing is ever written for a highlight's sake. A permanent rule.
2. Hovering a hint word changes colour only; nothing moves. A hard rule.
3. The conjured 1 was the one exception to both: `conjure` inserted TeX before x² while "a" was lit, shifting the equation. Chosen: keep the 1 but paint it in the margin with no shift.
4. A glyph with no side bearing (the 7) may touch its box edge.
5. Two touching lit boxes stay parted by a 1px clip on the second; symmetric 2px only if the hairline vanishes on the demo iPad.
6. A whole-fraction box keeps 0.14em side air.
7. The sweep moves into the repo under `scripts/` and becomes part of "done" for the box.

## Solution

- `lib/hint.ts`: `conjure` writes `\llap{\htmlClass{hint-term hint-term-lit hint-term-tight-x}{1}}` before `x^2`. KaTeX's `\llap` typesets its argument at zero width extending left, so the 1 sits just left of x² and every glyph of the problem stays where it was. Written for a `before` at the start of the line (the only use); further in, the 1 would overhang the glyph before it, noted in the doc comment.
- `lib/hint.test.ts`: the conjure expectation; the layout sweep over every warm-up problem no longer exempts a conjured fragment.
- `scripts/hint-box-sweep.mjs`: self-contained (Node 22+, no dependencies), in the conventions of `scripts/laptop-check.mjs`: a port guard, a throwaway profile deleted on exit, `Browser.close` then SIGKILL. For every warm-up on offer it writes each line of the working in turn, opens the hint offered at each point, hovers every linked word, and fails if a lit box in the problem or a read-as line intersects a glyph or fraction bar outside it, or if any glyph moves between plain, wrapped and lit. Knobs: `HINT_SWEEP_URL`, `HINT_SWEEP_SHOTS` (3× clips of every lit box), `CDP_PORT`, `CDP_PROFILE`, `CHROME`.
- `package.json`: `npm run sweep:hint-boxes`.
- `CLAUDE.md`: a "Lit hint boxes" section stating the two rules and the sweep as part of done.

## Acceptance

- [x] Discriminant problem rendered plain, wrapped and with "a" lit through the worktree's KaTeX and the box rules: every glyph of the problem at the same position in all three; the conjured 1 hangs 13px left of x² at the problem's size
- [x] `npm run sweep:hint-boxes` against the built app: all 30 checks pass (fractions, monic, null factor law, non-monic; every line; every word)
- [x] vitest (339), eslint, tsc, `next build`; architecture note, root docs, decision log, future features
