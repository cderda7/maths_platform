# 164: No "Group review" crumb beside the wordmark; the pathway strip names the stage

**What to build:** On the group review screen (and the class-wait screen before it) the student's header shows the wordmark alone at the left. The "Group review" crumb that sat after "Edexia · Maths" is removed: the pathway strip (ticket 151) at the right already lights the same stage with the arrows between stages, so the crumb said it twice.

**Blocked by:** nothing.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-12), with a screenshot of the group review screen (header: "Edexia · Maths   Group review … [indiv working] → [indiv review] → [group review] → [class review]  Sam Okonkwo"): "remove the extra 'group review' label next to Edexia Maths -- now redundant now that i have the arrows between stages in the other part of the header".

## Solution

- `app/student/StudentApp.tsx`: the `CRUMB` map's `class-wait` and `group` entries become `null`, and a `null` entry means no crumb at all (the fallback to the assignment title or the class name applies only to stages the map leaves out). The class name would have been the wrong third thing to show there: the strip names the stage, the screen's heading names the problem.
- `app/student/StudentChrome.tsx`: `crumb` accepts `null`; the header's left group renders the brand alone.
- The other crumbs are unchanged: the class name on the overview, goal and check-in; the assignment title while working, reviewing, waiting and frozen; "Warm-up"; "Your report"; "Where the class is finding it hard"; "Your working".
- Docs: this ticket, the architecture note, `ARCHITECTURE.md`, `FUTURE_FEATURES.md`.

## Acceptance

- [x] `/student` at the class-wait and group review stages: the header's left group is the brand alone, at the same coordinates as on every other screen; "Group review" appears nowhere in that group; the strip still names group review
- [x] the overview (class name), working (assignment title), warm-up ("Warm-up") and report ("Your report") crumbs are still there
- [x] vitest (453), eslint, tsc, `next build`, headless click-through (`crumb164.mjs`, 11 checks)
