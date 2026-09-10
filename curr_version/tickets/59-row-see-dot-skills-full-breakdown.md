# 59: Class view: "see dot skills" beside a student's name opens the full breakdown, every group already open to its skills

**What to build:** On `/teacher`, the "see dot skills" button that appears beside a student's name on hover opens that student's row with every dot's groups *and* their skills showing at once (the same view the header's "full breakdown" gives one column, but for every column of that row), not the groups alone with each group's skills a further click away.

**Blocked by:** 55 (same button)

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Two screenshots from the user (2026-09-10): Oliver Brennan's row open with the group chips laid out under the dots, and beneath only the groups the user had already clicked showing their skills; and Lucas Tanaka's hover buttons. The ask: "have see dot skills open up full view (down to subskills), not just group skills". A teacher pressing the button wants the whole picture of one student; clicking nine group chips one at a time to get it is the wrong default.

## Solution

`TeacherLive`: the row button calls `openRow(id, "expanded")` instead of `openRow(id, "groups")`. `RowDrill` already had that mode (it is what a double-tap on the row opens): every group of every category starts open, the work panel sits beneath. Nothing else changes: the button still reads "close" while the row is open and closes it; a single tap on the row still opens the groups level; a double-tap and the header's "full breakdown" still do what they did. The component's doc comment says what the button opens.

## Acceptance

- [x] Hover a row, click "see dot skills": the row opens in `expanded` mode, every group chip with its skills listed beneath (Zara Haddad: nine groups, 14 skills, one click)
- [x] The button reads "close" while open and closes the row
- [x] vitest (280 tests), eslint, tsc, `next build`; headless-Chrome click-through on port 3133; architecture note and root docs
