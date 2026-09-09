# 26 · Hierarchical skill category dashboard

Routes: `/teacher` (the grid and its sideways drill), `/teacher/report` and `/student` report (the
same drill for one student), `/teacher/assignments/new` (Unit Focus card). Every other screen
changed vocabulary: leaves instead of subskills.

## Files touched

| File | What it does |
|---|---|
| `data/taxonomy.ts` (+ test) | The Methods taxonomy as code: seven categories in canonical order → groups → leaves, `version`, ids derived from the tree (`CategoryId`, `GroupId`, `LeafId`), lookups (`categoryOf`, `groupOf`, `groupsOf`, `leavesOf`), names in three forms, `resolveLeaf` (unknown id → one warning, null), `unitOf` |
| `data/types.ts` | `Tag { leaf, confidence? }`; five-level `Status`; `SolutionStep.tags`; `Problem` loses `subskill`/`prereqs`, gains `figure?`; `UnitRef`; `Confidence` "low when" names a category; `PracticeProblem.leaf`. `SubskillId` and `data/subskills.ts` are gone |
| `data/assignment.ts` | Ten problems, every step tagged (Q7 fractions + non-monic + binomial identity; Q8 a drawn parabola, graph features + zero-finding; Q9 worded ball, interpretation + graphs; Q10 show/explain, discriminant + formal justification + conclusions); `unitLabel` |
| `data/recognition.ts` | Sam's run: Q7 multiplies two of three terms by 3; Q8 right; Q9 axis without height (compounded); Q10 misreads Δ < 0 as two solutions. Reworks for Q7 and Q10 |
| `data/evaluation.ts` | Verdicts carry `tags[]` and an optional `compounds` flag; every model step, every scripted slip and every classmate slip is known |
| `data/practice.ts` | `Partial<Record<LeafId, PracticeProblem>>`, one per leaf that can be a detected mistake (a test enforces it) |
| `data/classmates.ts` | Frozen status literals removed; `done` out of ten; Amelia (Q6, Q10), Tomas (Q3–Q5, Q7), Zara (Q3, Q9) carry scripted slips |
| `lib/hierarchy.ts` (+ test) | `leafStatus` (100 / 80 / 60 %), `rollUp` (worst-first, all-unseen → unseen), `hierarchyFor(evidence)` → leaf / group / category statuses, half-dot markers, `columns`; `sessionEvidence`, `classmateEvidence`, `classmateLines` (one evidence path); `categoriesTouched`, `leavesTouched`, `problemsForLeaf` |
| `lib/escalation.ts` | Counter keyed by group, so a monic then a non-monic slip still triggers the expand-and-factor practice; caution is per group and forces its leaves to gap |
| `lib/session.ts` | Prompts and overlays carry a leaf; `practiceLeaf` picks the leaf's practice or a sibling's; confidence by category |
| `lib/feedback.ts`, `report.ts`, `peers.ts`, `groups.ts`, `mistakes.ts`, `examples.ts` | Slips, buckets, notes and facts in leaf ids and leaf short names; peers aggregate leaf statuses across classmates |
| `lib/unit.ts` (+ test) | `inferUnitFromProblems` (most-tagged Unit Focus unit, else 1), `inferUnitFromText` (keywords), `UNIT_TITLES` |
| `lib/classroom.ts` | `CreatedAssignment.unit` |
| `components/HierarchyDrill.tsx` | `SkillTree` (one category's groups and skills, fitted to a column: text shrinks from 13.5 px to 9 px, dots from 15 px to 12 px, then names wrap to a second line), `WorkPanel`, `RowDrill` (the grid's three modes) and the reports' browse drill. An outline, not columns (follow-up 2026-09-09): groups stacked with their dots on one vertical line, positioned under the clicked category dot (`offsetLeft` measured from the grid), the open group's skills indented 28 px beneath it, text to the right of the dot, never truncated, no status words and no headings; the work panel for the chosen skill sits to the right when at least 600 px remain beside the tree, otherwise beneath it at full width in three columns, each problem carrying its difficulty tag beside its label. Rule: the category dot and the group dots stay on one vertical line at all times, so the drill never scrolls. A red line carries a ⚠ chip naming the skill the mistake was attributed to only when that skill is not the one being viewed; clicking it jumps to that skill's own view (in place within the category, or by re-opening the row's drill on the right category dot, aligned, when the skill lives elsewhere). Browse mode (the reports) nests categories → groups → skills the same way |
| `components/StatusKey.tsx` | The dot key: colour · word · what it means (100 % · 80–99 % · 60–79 % · under 60 % · not seen yet) plus a grey half dot for "incomplete, problems skipped", laid out as aligned rows (dot · word · meaning); a Key card at the bottom of the live view's right column and under the teacher report's drill |
| `components/Tag.tsx` | `LeafChip`; `StatusDot` with `half` and the new `solid` token; `STATUS_WORD`, `STATUS_TEXT` |
| `components/Figure.tsx` | Inline SVG parabola for Q8 |
| `app/teacher/TeacherLive.tsx` | Pathway card at the top of the right column, stages stacked with a drawn down arrow between; three ways to open a row: a category dot (that category's tree under the dot, work beside or beneath), a click anywhere else on the row (every category's groups, each tree fitted inside its own column, skills on demand; a second click closes), a double-click (every group and skill at once). Category dots and headers are left-aligned in their columns so a tree can start under its dot and end inside the column; the student note wraps to up to three lines; columns = categories the assignment touches; 15 px dot buttons with accessible names; one expanded row at a time; classmates through the same evidence path |
| `app/student/screens/ReportScreen.tsx`, `app/teacher/report/TeacherReport.tsx` | The drill for one student (compact on the iPad) |
| `app/teacher/assignments/new/NewAssignment.tsx` | Unit Focus card: inferred unit, Confirm (required before Create), "Not quite? describe the focus" → Reassess with a caption |
| Overview, Working, Confidence, PracticePrompt, PracticeScreen, PeerScreen, Mistakes, Compare, WholeClassSetup | Leaf chips, category options, figures, help picker over leaves with practices |
| `app/globals.css` | `--color-solid` (+ soft, line) |
| `app/teacher/TeacherChrome.tsx` | Teacher pages render under a CSS zoom of 0.8 with a 1640 px container, the 80 % browser view as the default; dot alignment divides measured rects by the zoom |

## How it connects

```
 data/taxonomy.ts  (const tree, version)  ──derives──▶  CategoryId · GroupId · LeafId  (compile-time)
        │ names · lookups
        ▼
 data/assignment.ts  step.tags[]      data/evaluation.ts  verdict.tags[] · compounds      data/practice.ts  PRACTICES[leaf]
        │                                    │                                                   ▲
        ▼                                    ▼                                                   │ practiceLeaf(leaf)
 lib/hierarchy.ts   hierarchyFor({ lines, submitted, caution })                     lib/session.ts  line/reveal → recordMistake(groupOf(leaf))
   leaf = held / attempted → secure ≥100 · solid ≥80 · developing ≥60 · gap                       prompt { leaf }
   group, category = worst-first roll-up · half = submitted && a skipped problem invokes the node
        │ sessionEvidence(session)  ·  classmateEvidence(classmate)   ← one path for every student
        ▼
 TeacherLive grid: columns = categoriesTouched · StatusDot(status, half) buttons · click → <tr> HierarchyDrill lockCategory
 ReportScreen / TeacherReport: HierarchyDrill (compact on the iPad) over the student's own evidence
 HierarchyDrill: [category] → [groups ↓ worst-first] → [leaves ↓ worst-first] → work panel (problemsForLeaf · lineMarks · left rule on tagged lines)

 NewAssignment: inferUnitFromProblems(chosen) → Unit Focus card → Confirm | note → inferUnitFromText → "reassessed from your note" → assignment/create { unit }
```

## Verified by

vitest (123 tests): taxonomy round-trips and warnings; leaf thresholds and worst-first roll-up;
the scripted run's end state (Algebra developing via monic, non-monic and fractions at 67 %,
Communication solid at 29/30 clean lines, Reasoning gap, Functions/Graphing/Unit secure or
solid, Stats absent); caution forcing a group's leaves to gap; half dots only after submit and
only where problems were skipped; every classmate line evaluable; every wrong-verdict leaf has a
practice; unit inference by tags and by keyword. `tsc --noEmit`, `eslint`, `next build`. CDP:
six category columns; Sam's dots algebra=developing, communication=solid, reasoning=gap; Liam's
half dots; 15 px dots with names like "Algebra: developing"; the drill opens under the row as an outline whose
first group dot sits under the clicked category dot, skills indent beneath the open group, no name is
truncated, the work cards carry difficulty tags, and a Unit Focus drill scrolls sideways; one row open
at a time; the student report nests categories → groups → skills the same way; the Unit Focus card infers
Unit 1, reassesses to Unit 3 from "mostly the chain rule", and Create waits for Confirm.
