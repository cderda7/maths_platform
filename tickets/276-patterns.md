# 276: Habits become patterns: recent patterns only, one-set patterns shown, no Habits header or live tag

**What to build:** Across Holistic Assessment (the tiles, ticket 252, and a student's page, tickets 251 and 269) "habits" are renamed **patterns**, in the UI and in the code. A pattern surfaces only if it occurred on at least one of the five most recent assignments; when it does, every earlier set it occurred on shows as part of it. Patterns seen on a single set show too (on tiles as well as the page). The student page's "Habits" section header goes, and so does the "live" tag on Sam's live set.

**Blocked by:** none.

**Status:** open

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-14), answering whether habits seen on one set belong on tiles: "yes habits only seen on one set apply there. let's rename it 'patterns' instead of 'habits' in our head, bc that's how i'll want to talk about it in the future. also can remove live tag from Holistic Assessment. make a rule where a pattern that hasn't shown up in 5 assignments doesn't surface. IF it's a pattern that's happened in more recent assignments, then yes show the earlier pset as part of that pattern. but anything that, in this example, only happened on pset 1 & never again shouldn't show up in patterns." On which header: "i mean the HABITS header — don't need that. only that one."

## Solution

- Rule, one pure function used by both the tiles and the page: order the class's sets by due date; the recent window is the latest five (with PS1–PS6: PS2–PS6). A pattern (ticket 252's grouping of wordings, `data/habitTags.ts`) surfaces iff one of its occurrences is in the window; a surfacing pattern lists all its occurrences, older ones included. A pattern only on PS1 never surfaces. The live set counts as in the window only for occurrences the teacher has seen (as today).
- Tiles: one-set patterns now show (with "· 1 set" or no count, matching the tag style; keep the label consistent); category labels and strengths unchanged.
- Student page: the "Habits" eyebrow is removed (the category groups stay); the "live" pill on the set head is removed.
- Rename throughout: UI copy, identifiers, file names (`data/habitTags.ts` → `data/patternTags.ts`, `lib/holisticTiles.ts` fields, data attributes like `data-holistic-habits`), tests, scripts, architecture notes for 251/252/269 where they describe current behaviour. Leave `data/story.ts` authored prose as is unless its field names are code-facing, then rename those too. Leave historical ticket text and decision-log entries unchanged.

## Acceptance

- [ ] Unit: the window rule (only-PS1 hidden; PS1 + PS4 shows both; only PS6 shows; single-set shown); tiles and page read the same function; no identifier or UI string "habit" remains outside historical docs (grep)
- [ ] Click-through at 1280×800 and 1440×900, all twenty students on tiles and both page routes: every shown pattern has an occurrence in PS2–PS6 and lists its PS1 occurrence when it has one; a PS1-only pattern appears nowhere; one-set patterns on tiles; no Habits header; no live tag with PS6 live; tiles stay equal height per row and nothing clips
- [ ] vitest, eslint, tsc, next build, check:laptop
