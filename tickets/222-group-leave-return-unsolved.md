# 222: A third wrong check leaves the problem for now; still wrong on the return, it closes unsolved

**What to build:** On the group whiteboard, a third wrong check on a problem leaves it for now: after a pause the board moves on, the header says the problem is still to finish and when the group comes back to it, and after the last problem of the pass the board returns to it with the next pen in the deal. A wrong check on that return closes the problem as not solved: the debrief shows the student's versions beside the group's last try (marked, nothing green) and says the class will go over it; Next moves on. A closed-unsolved problem counts on the progress bar, so a group can reach 100% without it. In the demo the group never solves Q7: Liam's three tries (two-terms slip, lost third, then the wrong pair), the group leaves Q7 for Q9 and Q10, and Jordan's return (the right third and pair, the factors' signs flipped) checks wrong.

**Blocked by:** 221.

**Status:** todo

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), agreeing to the ladder: after three wrong checks "leave it for now: the board moves on … once the other problems are done, the group comes back to Q7 with the next pen"; "still wrong on that return → the group stops, the debrief says something like 'your group didn't get this one yet · we'll look at it together'". And: "after the whole iteration through the 4 wrong checks, at that point let the student progress bar move forward -- they can get to 100% even without having this problem correct. also, want to model this flow -- so have this group never get the right answer through group review; also motivates the class review session". Today a group that keeps checking wrong is stuck on the problem until the teacher ends group review.

## Acceptance

- [ ] Q7: Liam's third wrong check shows "Not yet", the hint, and a leaving notice; the board then moves to Q9 with Q7 still unresolved and the bar unmoved; Q9 and Q10 show that Q7 comes back
- [ ] After Q10's debrief the board returns to Q7 with Jordan's pen, the hint still there; his wrong check opens the unsolved debrief (own versions and the group's last try, marked, no green pane), marks after 2 s, Next after the hold finishes the run
- [ ] The bar reaches 100% once Q7 closes unsolved; the class view's group bar agrees
- [ ] A reload at any point keeps the board where it was; two tabs never leave twice
- [ ] The report and class-review jumps start from a finished run with Q7 unsolved
- [ ] vitest, eslint, tsc, next build, browser click-through of the whole run
