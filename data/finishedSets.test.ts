import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "./assignment";
import { CLASSMATES } from "./classmates";
import { EVALUATION } from "./evaluation";
import { DEFAULT_GROUPS } from "./groups";
import { STORY, STORY_CATEGORIES } from "./story";
import { isLeafId } from "./taxonomy";
import { assignmentBundle, assignmentIds, assignmentStages, earlierAssignmentIds, isAssignmentId, rosterProgress, studentRecord, submittedCount } from "@/lib/assignments";
import { INITIAL_CLASSROOM } from "@/lib/classroom";
import { assignmentCard } from "@/lib/classroomCards";
import { missedProblems, recordStatus, storySetOf } from "@/lib/classStory";
import { dueOrder } from "@/lib/dueDate";
import { evaluateLine } from "@/lib/evaluate";
import { FINISHED_SETS } from "@/lib/finishedSets";
import { categoriesTouched, problemLeaves } from "@/lib/hierarchy";
import { mistakesByProblem } from "@/lib/mistakes";
import { CLASS_SIZE } from "@/lib/readiness";

/**
 * The shared suite every finished set runs (ticket 210): the contract in `data/finishedSet.ts` and the set's
 * rows in the class story sheet (`data/story.ts`). A set registered in `data/finishedSets.ts` is checked here
 * with no test of its own; its folder's own test holds only what is particular to it.
 */

const now = 1_700_000_000_000;

describe("the finished sets (ticket 210)", () => {
  it("are listed oldest due first, each once, and the registry holds each of them after the live set", () => {
    const ids = FINISHED_SETS.map((s) => s.fixture.id);
    expect(new Set(ids).size).toBe(ids.length);
    const order = FINISHED_SETS.map((s) => dueOrder(s.fixture.due));
    expect(order.every((d, i) => d > 0 && (i === 0 || d > order[i - 1]))).toBe(true);
    expect(earlierAssignmentIds(ASSIGNMENT.id)).toEqual(ids);
    expect(assignmentIds(INITIAL_CLASSROOM)).toEqual([...ids].reverse());
  });

  it("never share a problem id with each other or with the live set, and every table is keyed by the set's own problems", () => {
    const all = [...ASSIGNMENT.problems.map((p) => p.id), ...FINISHED_SETS.flatMap((s) => s.fixture.problems.map((p) => p.id))];
    expect(new Set(all).size).toBe(all.length);
    for (const s of FINISHED_SETS) for (const pid of Object.keys(s.evaluation)) expect(s.fixture.problems.map((p) => p.id), `${s.fixture.id} ${pid}`).toContain(pid);
    for (const s of FINISHED_SETS) for (const p of s.fixture.problems) expect(EVALUATION[p.id], p.id).toBeUndefined();
  });
});

describe.each(FINISHED_SETS.map((s) => [s.fixture.id, s] as const))("finished set %s (ticket 210)", (id, set) => {
  const f = set.fixture;
  const story = storySetOf(id);
  const n = story.n;
  const everyone = [set.sam, ...set.classmates];
  const bundle = assignmentBundle(id, INITIAL_CLASSROOM)!;

  it("is the sheet's set: pset-N, its name, title, due day, New skills and pathway; the class, teacher and unit of Problem Set 6", () => {
    expect(f.id).toBe(`pset-${n}`);
    expect(set.name).toBe(story.name);
    expect(f.title).toBe(story.name.toUpperCase());
    expect(f.due).toBe(story.due);
    expect(f.newSkills).toEqual(story.newSkills);
    expect(set.pathway).toEqual(story.pathway);
    expect(f).toMatchObject({ className: ASSIGNMENT.className, classCode: ASSIGNMENT.classCode, teacher: ASSIGNMENT.teacher, unit: ASSIGNMENT.unit });
    expect(f.goal.length).toBeGreaterThan(100);
  });

  it("has ten problems psN-q1 … psN-q10, labelled Q1 … Q10, touching exactly the sheet's categories, carrying the outline's leaves", () => {
    expect(f.problems.map((p) => p.id)).toEqual(Array.from({ length: 10 }, (_, i) => `ps${n}-q${i + 1}`));
    expect(f.problems.map((p) => p.label)).toEqual(Array.from({ length: 10 }, (_, i) => `Q${i + 1}`));
    expect(categoriesTouched(f)).toEqual(story.categories);
    if (story.outline) f.problems.forEach((p, i) => expect(problemLeaves(p), p.id).toEqual(expect.arrayContaining([...story.outline![i].leaves])));
  });

  it("names its New skills, each tagged in two or more problems", () => {
    expect(f.newSkills.length).toBeGreaterThan(0);
    for (const skill of f.newSkills) expect(f.problems.filter((p) => problemLeaves(p).includes(skill)).length, skill).toBeGreaterThanOrEqual(2);
  });

  it("tags every model-solution step with real leaves, every step holds in the evaluation table, and the last step is an answer", () => {
    for (const p of f.problems) {
      expect(p.solution.length, p.id).toBeGreaterThan(1);
      for (const st of p.solution) {
        expect(st.tags.length, `${p.id}: ${st.tex}`).toBeGreaterThan(0);
        for (const t of st.tags) expect(isLeafId(t.leaf), t.leaf).toBe(true);
        expect(evaluateLine(p.id, st.tex).verdict, `${p.id}: ${st.tex}`).toBe("ok");
      }
      const last = evaluateLine(p.id, p.solution[p.solution.length - 1].tex);
      expect(last.verdict === "ok" && last.answer, p.id).toBe(true);
    }
  });

  it("gives every verdict real tags, and every wrong line a clue, a note and a name of five words or fewer", () => {
    for (const [pid, table] of Object.entries(set.evaluation)) {
      for (const [tex, v] of Object.entries(table)) {
        expect(v.tags.length, `${pid}: ${tex}`).toBeGreaterThan(0);
        for (const t of v.tags) expect(isLeafId(t.leaf), `${pid}: ${tex}`).toBe(true);
        if (v.verdict === "wrong") {
          expect(v.clue && v.note && v.name, `${pid}: ${tex}`).toBeTruthy();
          expect(v.name!.split(" ").length, v.name).toBeLessThanOrEqual(5);
        }
      }
    }
  });

  it("has all twenty students: Sam, then the nineteen classmates in the class order", () => {
    expect(everyone).toHaveLength(CLASS_SIZE);
    expect([set.sam.id, set.sam.name, set.sam.initials]).toEqual([DEMO_STUDENT.id, DEMO_STUDENT.name, DEMO_STUDENT.initials]);
    expect(set.classmates.map((c) => [c.id, c.name, c.initials])).toEqual(CLASSMATES.map((c) => [c.id, c.name, c.initials]));
  });

  it("every record is complete: answered count, each wrong problem reached with worked attempts that go wrong and finish, every line known, notes on every wrong problem, words and a group line", () => {
    const ids = f.problems.map((p) => p.id);
    for (const c of everyone) {
      expect(c.done, c.id).toBeGreaterThanOrEqual(0);
      expect(c.done, c.id).toBeLessThanOrEqual(10);
      expect(c.groupStatus.length, c.id).toBeGreaterThan(0);
      if (c.done === 0) expect(c, c.id).toMatchObject({ wrong: [], attempts: {}, notes: [] });
      for (const pid of c.wrong) {
        expect(ids.indexOf(pid), `${c.id} ${pid}`).toBeGreaterThanOrEqual(0);
        expect(ids.indexOf(pid), `${c.id} ${pid} reached`).toBeLessThan(c.done);
        const lines = c.attempts[pid];
        expect(lines?.length, `${c.id} ${pid} attempts`).toBeGreaterThan(0);
        expect(lines.some((tex) => evaluateLine(pid, tex).verdict === "wrong"), `${c.id} ${pid} has a wrong line`).toBe(true);
        expect(lines.some((tex) => { const v = evaluateLine(pid, tex); return v.verdict !== "unclear" && v.answer; }), `${c.id} ${pid} finished`).toBe(true);
      }
      for (const [pid, lines] of Object.entries(c.attempts)) {
        expect(ids, `${c.id} ${pid}`).toContain(pid);
        for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${c.id} ${pid}: ${tex}`).not.toBe("unclear");
        if (!c.wrong.includes(pid)) expect(lines.every((tex) => evaluateLine(pid, tex).verdict === "ok"), `${c.id} ${pid} right line by line`).toBe(true);
      }
      for (const note of c.notes) for (const pid of note.problems) expect(ids, `${c.id} note`).toContain(pid);
      if (c.done > 0 && (c.wrong.length > 0 || c.notes.length > 0)) {
        expect(c.clarification?.length, c.id).toBeGreaterThan(0);
        for (const pid of c.wrong) expect(c.notes.some((note) => note.problems.includes(pid)), `${c.id} ${pid} noted`).toBe(true);
      }
    }
  });

  it("Priya hands in everything, right, secure in every category", () => {
    const priya = set.classmates.find((c) => c.id === "priya")!;
    expect(priya).toMatchObject({ done: 10, wrong: [] });
    for (const c of categoriesTouched(f)) expect(recordStatus(priya, f, c as (typeof STORY_CATEGORIES)[number]), c).toBe("secure");
  });

  it("equals the story sheet for every student and category: status, hand-in count, and each habit on a problem where they missed it", () => {
    const mismatches: string[] = [];
    for (const c of everyone) {
      const row = STORY[c.id];
      if (row.done[n - 1] !== c.done) mismatches.push(`${c.id} handed in ${c.done}, the sheet says ${row.done[n - 1]}`);
      for (const cat of STORY_CATEGORIES) {
        const cell = row.cells[cat][n - 1];
        const real = story.categories.includes(cat) ? recordStatus(c, f, cat) : "none";
        if (real !== cell.status) mismatches.push(`${c.id} ${cat}: ${real}, the sheet says ${cell.status}`);
        const missed = missedProblems(c, f, cat);
        for (const hb of cell.habits) for (const q of hb.problems) if (!missed.includes(q)) mismatches.push(`${c.id} ${cat} "${hb.text}": nothing missed on Q${q}`);
      }
    }
    expect(mismatches).toEqual([]);
  });

  it("is in the Classroom whatever it holds, finished: its problems, classmates, Sam's record and its frozen groups; every stage over", () => {
    expect(isAssignmentId(id)).toBe(true);
    expect(assignmentIds(null)).toContain(id);
    expect(bundle).toMatchObject({ id, kind: "finished", title: f.title, name: set.name, due: f.due, newSkills: f.newSkills, pathway: set.pathway, startedAt: null });
    expect(bundle.problems).toBe(f.problems);
    expect(bundle.classmates).toBe(set.classmates);
    expect(bundle.sam).toBe(set.sam);
    expect(bundle.groups).toEqual(set.groups ?? DEFAULT_GROUPS);
    expect(studentRecord(bundle, DEMO_STUDENT.id)).toBe(set.sam);
    expect(assignmentStages(bundle, INITIAL_CLASSROOM, null, now).every((s) => s.state === "over")).toBe(true);
    const older = FINISHED_SETS.filter((s) => dueOrder(s.fixture.due) < dueOrder(f.due)).map((s) => s.fixture.id);
    expect(earlierAssignmentIds(id)).toEqual(older);
  });

  it("the Classroom's card: done, everyone but the missing handed in, the sheet's top gap", () => {
    const missing = everyone.filter((c) => c.done === 0).length;
    expect(submittedCount(bundle, null, now)).toEqual({ submitted: CLASS_SIZE - missing, total: CLASS_SIZE });
    for (const c of everyone) expect(rosterProgress(bundle, null, now)[c.id], c.id).toEqual(c.done === 0 ? { kind: "not-started" } : { kind: "submitted" });
    const card = assignmentCard(bundle, INITIAL_CLASSROOM, null, now);
    expect(card).toMatchObject({ id, name: set.name, due: f.due, section: "past", status: "done", submitted: CLASS_SIZE - missing, total: CLASS_SIZE });
    expect(card.topGap?.name).toBe(story.topGap);
  });

  it("the Mistakes tab: every problem, right and wrong counts adding up to who reached it, every wrong row with a slip", () => {
    const ms = mistakesByProblem(null, bundle);
    expect(ms.map((m) => m.problem.id)).toEqual(f.problems.map((p) => p.id));
    ms.forEach((m, i) => {
      expect(m.right + m.rows.length, m.problem.id).toBe(everyone.filter((c) => i < c.done).length);
      for (const r of m.rows) expect(r.slips.length, `${m.problem.id} ${r.id}`).toBeGreaterThan(0);
    });
  });
});
