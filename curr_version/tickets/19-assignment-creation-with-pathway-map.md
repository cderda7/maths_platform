# 19: Assignment creation with the pathway map

**What to build:** The teacher creates the assignment in the current build: a title, problems picked from the bank, and the review pathway chosen on a three-column map. Column one is the fixed bold "1st submit". Tapping a stage in column two bolds it, fades its siblings and fills column three with the stages that may legally follow; column three behaves the same. Any faded node is tappable and clears downstream picks. Stopping is implicit: leave later columns empty and submit. A one-line sentence under the map reads the pathway in words. A dashed, disabled "continue tomorrow" node hangs off 1st submit labelled coming soon. Submit writes the assignment (title, problem ids, pathway) to the classroom store; the student tab then shows that title and problem set and follows that pathway. Reset clears the created assignment.

**Blocked by:** 18 (Pathway model and routing).

**Status:** done

- [x] Teacher route for creating an assignment, ported from the Sept 7 mockup and cut to the copy rule
- [x] Title input and problem picker from the bank; at least one problem required
- [x] Pathway map with bold-and-fade columns driven by the pathway module's legal successors; reversible; implicit stop; live summary sentence
- [x] Dashed disabled "continue tomorrow" node, coming soon
- [x] Submit writes to the classroom store; student tab reads title, problems and pathway from it when present, fixture otherwise
- [x] Reset clears the created assignment along with the student session
- [x] Classroom reducer tests cover creation and reset
- [x] Build, lint, type-check, vitest pass; headless: create with two different pathways and confirm the student tab follows each
- [x] Architecture note written and folded into `ARCHITECTURE.md`
