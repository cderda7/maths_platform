# 18: Pathway model and routing

**What to build:** The student's flow after hand-in follows a review pathway instead of the single hardcoded pipeline. A pathway is an ordered subset of individual review, group review and whole-class review, valid only in that order, each at most once, so eight pathways exist including submit-only. The pathway lives in a new teacher-owned classroom store (same localStorage-plus-BroadcastChannel shape as the student session store, own key and pure reducer) and defaults to the current pipeline when nothing has been created, so every existing screen, deep link and test keeps working. A `?pathway=` deep link on the student tab runs any of the eight so the routing is demoable before the creation screen exists. Teacher navigation shows the pathway as a compact chip and hides links to stages not in the pathway.

**Blocked by:** 17 (Copy sweep to the rule).

**Status:** done

- [x] Pure pathway module: validity, legal successors for a prefix, next student stage after hand-in / rework / group under a pathway, and the human sentence for the chip; unit-tested for all eight pathways and for rejected orders and repeats
- [x] Classroom store and reducer with the pathway; reset clears both stores; unit-tested by action replay
- [x] Student reducer consults the pathway after hand-in, after rework hand-in and after group done; existing session tests extended across the eight pathways
- [x] New `waiting` stage with a terse "Handed in" screen shown when the next stage is whole-class review and no session is active
- [x] Submit-only lands on the report screen; submit→group goes straight to group pass using first-submit slips
- [x] `?pathway=` deep link on the student tab sets the classroom pathway for the demo
- [x] Pathway chip on teacher navigation; review-groups and whole-class links hidden when those stages are absent
- [x] Build, lint, type-check, vitest pass; headless click-through of at least submit-only, submit→group and submit→WC-waiting
- [x] Architecture note written and folded into `ARCHITECTURE.md`
