# 32: Individual review with correction on one screen

**What to build:** The separate rework stage goes away. The individual review screen ("How it held up") shows, for the chosen problem, what the student submitted under a header, a pad to correct it on, and the lines read from that pad, exactly as the working screen reads them. The guard (a correction that breaks a problem whose first attempt was correct) and the hand-in live on the same screen. No difficulty tags in review; the problem's expression sits directly to the right of its label; two-case lines show as two side-by-side boxes.

**Blocked by:** 06 (feedback layers), 07 (independent rework), 21 (detective feedback and the guard).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

`FeedbackScreen` keeps its left column (the detective sentence, the problem list with stars, and now a red dot on any problem whose correction broke it) and replaces "Rework →" with "Hand in", disabled with a "Restore Qn first" note while the guard is tripped. Its right pane is a header row (label, expression, stem, star) over three columns: "What you submitted" (narrow, two-case lines split), "Correct it here" (the pad, writing to the rework slice with the rework recognition script), and "Read as" for the corrected lines. The guard banner with "Restore my original" sits under the submitted lines. The `rework` stage, its screen, its deep link and its crumb are removed; every consumer of the rework version (`rework/done`, the guard, versions, group review, the reports) is unchanged.

## Acceptance

- [x] No difficulty tag in review; expression beside the label
- [x] Submitted lines under "What you submitted", narrow, branches side by side
- [x] Pad and "Read as" wired to `rework/*` with `RECOGNITION_REWORK`
- [x] Guard banner + restore on this screen; broken dot on the list; "Hand in" blocked while tripped
- [x] `rework` stage, `ReworkScreen`, `?stage=rework` and the crumb removed; tests moved to the feedback stage
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`
