# 04: Scripted evaluation, subskill escalation, isolated practice prompt, "I need help"

**What to build:** Every recognised line is checked against the problem's scripted "expected correct" and "known wrong pattern" states and tagged with the subskill it exercises. The first mistake on a subskill passes without interruption. A second instance of the same subskill mistake triggers an isolated-practice prompt (a short in-frame practice on that subskill, declinable, then return to the problem) and resets that subskill's counter. If the student would enter practice for the same subskill a second time after a reset, the caution state is raised for the teacher side (surfaced in 05). An "I need help" button is always visible during the assignment and runs the identical prompt flow as a system-detected trigger. The escalation counter is pure logic with unit tests.

Counter rule from the spec, kept here because it is the decision-rich part:

```
1st instance of a subskill mistake  -> no-op
2nd instance                        -> trigger isolated practice, reset count to 0
2nd instance again after a reset    -> trigger practice AND raise caution flag
```

**Blocked by:** 03 (Drawpad with simulated line-by-line recognition).

**Status:** ready-for-agent

- [ ] Scripted evaluation fixture per problem: expected lines, known wrong patterns, the subskill each exercises
- [ ] Escalation counter implemented as a pure function/reducer with vitest coverage of 1st, 2nd, and repeat-2nd-after-reset cases
- [ ] The demo path contains a scripted second-instance mistake so the prompt is reliably reachable
- [ ] Isolated practice prompt appears in-frame, is declinable, and returns to the same problem and line
- [ ] "I need help" button visible on every problem and runs the same prompt flow
- [ ] Caution state recorded in session for the teacher view
- [ ] Architecture note written and folded into `ARCHITECTURE.md`
