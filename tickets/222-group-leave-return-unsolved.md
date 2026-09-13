# 222: A third wrong check leaves the problem for now; still wrong on the return, it closes unsolved

**What to build:** On the group whiteboard, a third wrong check on a problem leaves it for now: after a pause the board moves on, the header says the problem is still to finish and when the group comes back to it, and after the last problem of the pass the board returns to it with the next pen in the deal. A wrong check on that return closes the problem as not solved: the debrief shows the student's versions beside the group's last try (marked, nothing green) and says the class will go over it; Next moves on. A closed-unsolved problem counts on the progress bar, so a group can reach 100% without it. In the demo the group never solves Q7: Liam's three tries (two-terms slip, lost third, then the wrong pair), the group leaves Q7 for Q9 and Q10, and Jordan's return (the right third and pair, the factors' signs flipped) checks wrong.

**Blocked by:** 221.

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

The user (2026-09-13), agreeing to the ladder: after three wrong checks "leave it for now: the board moves on … once the other problems are done, the group comes back to Q7 with the next pen"; "still wrong on that return → the group stops, the debrief says something like 'your group didn't get this one yet · we'll look at it together'". And: "after the whole iteration through the 4 wrong checks, at that point let the student progress bar move forward -- they can get to 100% even without having this problem correct. also, want to model this flow -- so have this group never get the right answer through group review; also motivates the class review session". Today a group that keeps checking wrong is stuck on the problem until the teacher ends group review.

## Solution

- `lib/groupReview.ts`: the run's itinerary is derived, not stored: `visitsOf` is the union once, then one return per problem in `left`, its pen the next in the deal (`dealPens`, the run's `seed`). `currentVisit`, `currentProblem` and `penHolder` read it. `leaving` (a third wrong check on a first visit, `LEAVE_AFTER_WRONG`) holds the board for `LEAVE_PAUSE_MS` (6 s, `leaveAt`). `unsolved`/`unsolvedAt` record a problem still wrong on its return; `isClosed`, `closedMoment`, `closedInOrder` and `writerOf` treat both endings alike; `groupProgress` counts closed problems, so the bar reaches 100% without a correct Q7. `turnScript(problem, from, returning)` plays one visit: from the attempts earlier visits made to the check that ends this one, clearing the board before each later try. Attempts record their check time.
- `lib/classroom.ts`: `group/leave` (guarded by the visit's index, so two tabs leave once); a wrong check on a return closes the problem unsolved; `group/next` moves on from any closed problem and finishes after the last visit; a leaving or closed board takes no strokes, lines or checks; a scripted `clear`.
- `app/student/StudentApp.tsx`: the loop leaves at `leaveAt`, moves on from a closed problem as before, and plays the current visit's script.
- `app/student/screens/GroupBoardScreen.tsx`: "leaving Q7 for now · back to it after Q10" in place of Check; "Q7 comes back after Q10" at the end of the members' row; "last try" in place of "n of 6" on a return.
- `lib/debrief.ts`, `app/student/screens/GroupDebrief.tsx`: the pending debrief follows the order problems closed; an unsolved problem's debrief shows the group's last try (`groupVersion`), marked, nothing green, with "not solved yet · we'll look at it together"; Next reads "finish" only on the last visit.
- `lib/standings.ts`: the live group's count, moment and pen follow closed problems.
- `data/group-scripts.ts`, `data/classmates.ts`, `data/evaluation.ts`: Q7 is the two-terms slip, the lost third, the wrong pair, and on the return the right third and pair with the brackets' signs flipped (a new wrong line, "signs flipped in the factors").
- `lib/demo.ts`: the report jump's finished run takes each problem's script as its attempts; Q7 was left and closed unsolved, last.

## Acceptance

- [x] Q7: Liam's third wrong check shows "Not yet", the hint, and a leaving notice; the board then moves to Q9 with Q7 still unresolved and the bar unmoved; Q9 and Q10 show that Q7 comes back
- [x] After Q10's debrief the board returns to Q7 with Jordan's pen, the hint still there; his wrong check opens the unsolved debrief (own versions and the group's last try, marked, no green pane), marks after 2 s, Next after the hold finishes the run
- [x] The bar reaches 100% once Q7 closes unsolved; the class view's group bar agrees
- [x] A reload in the leaving pause keeps the notice and leaves on time; two tabs leave once (browser); a stored run from before the ladder reads as a first pass (unit test)
- [x] The report jump starts from a finished run with Q7 unsolved (unit test; the class-review jump has no group run)
- [x] vitest 626, eslint, tsc, next build; click-through `flow222.mjs` (26 checks, the whole Q7 story from Liam's first try to finish, two student tabs and the teacher's class view)
