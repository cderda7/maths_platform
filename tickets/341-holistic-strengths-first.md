# 341: Holistic Assessment tiles: strengths first

**What to build:** on Holistic Assessment's tiles, a student's Strengths sit directly under the summary, above the issues (Across sets, then the pattern categories).

**Blocked by:** none.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Carson, 2026-09-15, over a screenshot of the tiles (Across sets and the categories first, Strengths last):

- "reorder so strenghts on top, then the issues"

## Acceptance

- [x] Strengths first under the summary's rule; Across sets and the pattern categories follow in their old order
- [x] A tile with strengths only (Priya) and a tile with no strengths are unchanged in look
- [x] Nothing else on the tile changes (tags, colours, spacing)

## Verification

- eslint, tsc, next build, vitest `lib/holisticTiles.test.ts` 7/7
- Screenshot of `/teacher/students` at 1440 wide against a production build, every tile checked
