# 51: Debrief: a pane that matches the group's rework turns green

**What to build:** On the student's group review debrief (the three columns after a correct check), if the student's handed-in or reworked version is the same as the group's rework, that column's white box takes the same green as the "the group got it" pill.

**Blocked by:** 41 (the debrief this tints).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

In the demo Sam's independent rework of Q1 is exactly what the group later wrote, yet the Reworked and Group's rework columns look identical, two white boxes, and nothing says "you already had this". The header pill is green; the column that earned it should be too.

## Solution

`matchesGroup(lines, group)` in `lib/debrief.ts`: true when a version has the same lines in the same order, whitespace aside, and at least one line. `markedVersions` carries `matches` on each version, never on the group's own column. The screen paints a matching pane `bg-secure-soft border-secure-line`, the pill's exact tokens, and its plain line boxes white-on-green with the same green border so the lavender outline does not clash; red and blue marks are untouched.

## Acceptance

- [x] Q1 debrief: Reworked pane green (`#e6f5ec`, border `#bfe4cf`), Handed in and Group's rework white
- [x] A handed-in version that equals the group's rework is green too; the group's own column never is
- [x] Same lines in another order, or a prefix, or nothing written: no green
- [x] Marks still show inside a green pane; the pill unchanged
- [x] vitest rule tests; browser check on the built app; architecture note and root docs
