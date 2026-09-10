# 34: Whole-class review on the student screen: versions beside a pad, frozen or write-with-me

**What to build:** The frozen student screen loses its difficulty tag and puts the problem's expression beside its label. The student's versions (handed in, reworked; a third when a group version exists) take half the width for one or two versions and two thirds for three, and a pad takes the rest. The teacher chooses, before projecting, between two modes and can change it per problem from the board: **screens frozen**, where the student's pad mirrors what the teacher writes on the board and takes no input, and **write with me**, where the student's pad is live and they copy the teacher's working. The mode is visible to the student.

**Blocked by:** 24 (freeze and the marked view), 23 (setup and the board), 20 (persisted ink).

**Status:** done

**Triage:** `ready-for-agent`

---

## Solution

The whole-class session carries a mode per projected problem (seeded from the setup choice), and the teacher's ink per problem, written on a pad beside the examples on the board and broadcast through the classroom store. The frozen view exposes the mode and that ink. In "screens frozen" the student's pad is read-only and shows the teacher's strokes as they arrive; in "write with me" it is the student's own pad, stored as a follow-along ink per problem on the session (never marked, never a version). A chip on the frozen banner names the mode; the board's footer has the toggle.

## Acceptance

- [x] No difficulty tag; expression beside the label; "n of m" after it
- [x] Versions take 1/2 (one or two) or 2/3 (three) of the width; the pad the rest
- [x] Setup: "Screens frozen" / "Write with me" chosen before Project
- [x] Board: a "Your working" pad whose strokes reach every student; a per-problem mode toggle
- [x] Student: read-only mirror in frozen mode, live pad in write-with-me, mode chip on the banner
- [x] Unit tests (classroom modes and ink, frozen view, follow ink); CDP two-tab check
- [x] Architecture note, `ARCHITECTURE.md`, `DECISION_LOG.md`, `FUTURE_FEATURES.md`
