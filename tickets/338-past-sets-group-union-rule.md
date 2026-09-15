# 338: Past sets' review outcomes follow the after-individual-review rule

**What to build:** Problem Sets 1–5 show the review outcomes the new group rule gives (ticket 332): what each group worked, who fixed what, and what stayed wrong. So a teacher report, a student report and the story sheet never show a group working a question every member already had right after corrections.

**Blocked by:** 332.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

Ticket 332 changes which questions reach a group: only the questions a present member still has wrong after individual review. A student who fixed a question in individual review counts as a helper. Ticket 332 applies this to Problem Set 6 only. The earlier sets' authored review records (tickets 244 and 281) were written under ticket 278's rule (not right first time), so their group versions and outcomes would contradict it.

## Solution

- Regenerate every PS1–PS5 set review (second submissions and the group versions per seating group per question) from ticket 332's rule, with the helper rule and the rule that a group with nothing left sits out.
- Keep realism (the group-review-realism rule): each set keeps some questions nobody at a table could do, and a groupmate who can explain gets the group there in 1–2 tries.
- Regenerate the story sheet's review table and reasons.
- Once no record is authored under the old rule, the rule check covers every set and ticket 332's Problem Set 6-only limit goes.

## Acceptance

- [x] Unit: the review-mismatch check between records, the story sheet and the rules finds nothing on any set; every group version is for a question in that group's union; set scores unchanged on every set
- [x] The outcome counts per set (own rework, group, still wrong) are listed in the ticket's architecture note next to the old ones, with each change explained
- [x] Click-through against a production build at 1280×800 and 1440×900: all twenty student reports and the teacher report on all six sets show the new outcomes and open the right working; a student whose group sat out shows no group version; screenshots checked
- [x] vitest, eslint, tsc, next build, check:laptop
- [x] Ticket docs: `architecture/338.md`, ARCHITECTURE, DECISION_LOG, FUTURE_FEATURES, README
