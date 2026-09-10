# 41: The debrief after a correct check

**What to build:** When the group's rework checks correct, each student sees their handed-in and reworked versions beside the group's transcribed rework, unmarked, and answers one prompt chosen from their own history: describe your mistake if neither earlier attempt was functional, otherwise describe the mistake your peers most likely made. Then the annotated view: full red and blue marks on the student's own two versions, blue standouts on the group's rework, a 20-second hold shown as a ring filling around Next, the reflection still editable. Next enables after the hold. The next problem's board opens on the new pen-holder's first stroke; a student who lingers joins when they press Next. Reflections appear in the teacher's report, and nowhere else.

**Blocked by:** 40.

**Status:** ready-for-agent

**Triage:** `ready-for-agent`

---

## Problem Statement

A shared board loses the individual moment. The debrief restores it: every student names a mistake in their own words with the correct working in front of them, and is made to look at the marks for long enough to read them.

## Solution

A per-student debrief state for the current problem: which prompt, the text, when the annotated view opened. The comparison layout reuses the versions model. The prompt rule reads the student's own two versions. The hold is a timer on the student's screen; the group's next problem does not wait for it.

## Acceptance

- [ ] Three-version comparison, unmarked, with the prompt chosen by the student's own history
- [ ] Annotated view: full marks on the student's versions, blue standouts on the group's rework
- [ ] 20-second hold with the ring; Next disabled until it passes; reflection editable before and after
- [ ] Next problem opens on the new pen-holder's first stroke; lingerers join on Next
- [ ] Reflections stored per student and shown in the teacher's report only
- [ ] Unit tests for the prompt rule and the hold; browser check; architecture note and root docs
