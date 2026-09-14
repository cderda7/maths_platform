# 283: Holistic grid: right margin equals left, every category chip inside its column

**What to build:** Noticed by ticket 276's agent (2026-09-14) on ticket 277's grid: the last result sat ~6 px (screen) from the card's right edge against ~17 px on the left. Measuring the fix found a second flaw from 277: the COMMUNICATION chip (126 layout px, the Class View's chip, which must not change) overflowed its 123 px column.

**Blocked by:** 277, 276.

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

- **Gutter.** An empty 16 px last column (`GUTTER`, `aria-hidden` cells), so the last result ends 24 layout px from the card's inner right edge, as "PS6" starts 24 px from the left; row rules still run edge to edge.
- **Room for the chips.** The side column narrows 540 → 500 px and the set column 272 → 256 px (the topic still two lines), so each category column is 129.5 px and the widest chip (COMMUNICATION, 126) sits inside it.

## Acceptance

- [x] `gutter283.mjs` at 1280×800 and 1440×900, all twenty on both routes (1200 checks): last result's right margin equals the set label's left margin (±1 px), every cell one width, every chip inside its column, no scroll either way
- [x] `drill277.mjs` rerun (patterns fit, flyouts, every skill's problems) passes
- [x] vitest, eslint, tsc, next build, check:laptop
