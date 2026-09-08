# 05: Teacher live subskill status and caution flag

**What to build:** A teacher opens the teacher route in a second browser tab on the same laptop and watches the demo student's subskill status (secure / developing / gap / not seen yet) update in batches while the student works in the iPad tab. When the student is about to enter isolated practice a second time for the same subskill, a red caution flag appears on that student. Introduces the shared demo session: an in-memory store mirrored across tabs (BroadcastChannel, with a snapshot in localStorage so a freshly opened teacher tab catches up), plus a "reset demo" control. Log this decision in `DECISION_LOG.md`.

**Blocked by:** 04 (Scripted evaluation, subskill escalation, isolated practice prompt, "I need help").

**Status:** done

- [x] Session store shared across tabs; opening the teacher tab after the student has started shows current state, not blank
- [x] Teacher live view: one row for the demo student with a status dot per subskill, confidence rating from 02, and progress through the set
- [x] Updates are batched (a visible "updated a moment ago" cadence), not per-keystroke
- [x] Red caution flag appears exactly when the counter raises caution and stays until reset
- [x] "Reset demo" control clears the session in both tabs
- [x] `DECISION_LOG.md` entry for the cross-tab session mechanism
- [x] Architecture note written and folded into `ARCHITECTURE.md`
