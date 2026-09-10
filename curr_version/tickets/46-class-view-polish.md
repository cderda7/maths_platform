# 46: Class view polish

**What to build:** On `/teacher`: the Confidence column a fifth wider, with a named skill that would wrap shrunk to one line instead; hovering a row shows two stacked buttons beside the name ("see dot skills" opens every dot's skills for that student, "student report" opens the individual view) in light blue with dark indigo text, the name itself no longer a link; the UNIT header reads NEW SKILLS; no timestamps in the Set column; one student (Chloe Abara) has handed nothing in and shows a light blue caution triangle with a bold black exclamation mark over a small grey MISSING; the header's hover "expand" (which cycled groups → skills → close with the same label, and could not close from the groups level) is replaced by two stacked buttons, "skills" and "sub-skills", the open one highlighted and reading "close …".

**Blocked by:** 43 (name links, header expand).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Long confidence answers wrapped mid-skill; the name's hover-underline and tooltip read as a link, not an action; a teacher could not tell what the header's "expand" would do next, nor close a column from its groups level; timestamps mean nothing for in-class work; nothing in the demo class showed what a student who never handed in looks like.

## Solution

`FitText` shrinks a nowrap line to its box. Row hover (`group/row`) reveals a stacked pair of `STACK_IDLE` buttons; the open one turns `STACK_ACTIVE`. Header hover hides the chip and shows the same stacked pair, one per level (`setColumnLevel`; a two-layer category has only "skills"); the chip is indigo while its column is open. `Classmate.when` is gone. Chloe has `done: 0`; `classmateEvidence` marks her unsubmitted so no half-dots appear.

## Acceptance

- [x] Confidence column 96 px (was 80); "non-monic factorising" on one line at a smaller size
- [x] Hover any part of a row: "see dot skills" and "student report", same width and text size, light blue / dark indigo; name is plain text
- [x] "see dot skills" opens the row's groups view (the view in the user's screenshot); pressed state; click again closes
- [x] Header reads NEW SKILLS; no timestamps; Chloe shows the triangle and MISSING, every dot unseen, confidence "—"
- [x] Header buttons: skills / sub-skills; the open level reads "close skills" / "close sub-skills" and closes from either level; unit has one button
- [x] vitest, eslint, tsc clean; headless-Chrome check of the built app; architecture note and root docs
