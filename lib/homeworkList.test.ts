import katex from "katex";
import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { PROBLEM_DIAGNOSTICS } from "@/data/diagnostic";
import { SIMILAR_PROBLEMS } from "@/data/homework";
import { HOMEWORK_PASTE_LINES } from "@/data/homework-draft-seed";
import { PS5_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps5";
import { HOMEWORK_RECOMMENDATIONS } from "@/data/review";
import { PS5_PROBLEMS } from "@/data/pset5/assignment";
import { PS4_PROBLEMS } from "@/data/pset4/assignment";
import { PS3_PROBLEMS } from "@/data/pset3/assignment";
import { PS4_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps4";
import { PS3_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps3";
import { PS5_PS6_PRIMARY_SKILL } from "@/data/problem-skills";
import { STORY_SETS } from "@/data/story";
import { primarySkill } from "./problemSkill";
import { FINISHED_SETS } from "./finishedSets";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { homeworkSent } from "./create";
import { DEMO_PATHWAY, demoSend, teacherSkip } from "./demo";
import { generatedHomeworkDraft } from "./draft";
import { homeworkProblems, similarFor, texDiff, texShape } from "./homework";
import { carryOver, everWrongOn, groupBySet, homeworkList, leftovers, missedBefore, ownProblems, ownSets, type OwnProblem } from "./homeworkList";
import { openHomeworks } from "./homeworks";
import { parseQuestion } from "./mathInput";
import { draftKey, type ReviewState } from "./review";
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";
import { evalTex, namedValues, sameFunction, sameValues, sides } from "./texEval";

const now = 1_700_000_000_000;
const compact = (tex: string) => tex.replace(/\s+/g, "");
const renders = (tex: string) => katex.renderToString(tex, { throwOnError: true, strict: false, trust: true });

/** +Homework's Create as the demo teacher does it: Generate, every recommendation accepted, Create. */
function homeworkSentAt(c: ClassroomState, at: number): ClassroomState {
  const draft = generatedHomeworkDraft(c, at);
  const drafted = classroomReducer(c, { type: "draft/set", draft, kind: "homework" });
  const review: ReviewState = { step: "recommendations", forDraft: draftKey(draft.questions), labels: {}, answers: Object.fromEntries(HOMEWORK_RECOMMENDATIONS.map((r) => [r.id, "accept"])), addition: 0, pathway: null };
  return homeworkSent(classroomReducer(drafted, { type: "review/set", review, kind: "homework" }), at);
}

/** Problem Set 6 sent, Homework 3 sent, then the teacher's end lesson when its minute runs out: Homework 3 open. */
function opened(session: StudentSession = sessionAt("report")): { c: ClassroomState; session: StudentSession } {
  const live = homeworkSentAt(classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now)), now + 1_000);
  const grace = classroomReducer(live, { type: "advance/start", kind: "end-lesson", at: now + 5_000 });
  return { c: openHomeworks(classroomReducer(grace, { type: "lesson/end", at: now + 5_000 + GRACE_MS })), session };
}

describe("Sam's Homework 3 list (ticket 293)", () => {
  it("his own problems first, Problem Set 6, Problem Set 5, then Homework 2's Problem Set 4 (ticket 294), each as its similar problem; then the teacher's ten, numbered on", () => {
    const { c, session } = opened();
    const list = homeworkList("hw-3", c, session)!;
    expect(list).toMatchObject({ id: "hw-3", name: "Homework 3", due: "Mon 14 Sep" });
    expect(list.own.map((g) => [g.setId, g.name])).toEqual([
      ["pset-6", "Problem Set 6"],
      ["pset-5", "Problem Set 5"],
      ["pset-4", "Problem Set 4"],
    ]);
    expect(list.own[0].items.map((i) => i.key)).toEqual(["own-q1", "own-q2", "own-q3", "own-q7", "own-q10"]);
    expect(list.own[1].items.map((i) => i.key)).toEqual(["own-ps5-q4", "own-ps5-q6", "own-ps5-q9"]);
    expect(list.own[2].items.map((i) => i.key)).toEqual(["own-ps4-q10"]);
    const own = list.own.flatMap((g) => g.items);
    expect(own.map((i) => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(list.everyone.map((i) => i.n)).toEqual([10, 11, 12, 13, 14, 15, 16, 17, 18, 19]);
    for (const i of own) {
      const id = i.key.replace(/^own-/, "");
      const s = similarFor(id)!;
      expect([i.stem, i.tex], id).toEqual([s.stem, s.tex]);
    }
  });

  it("never an original: every own question differs from the problem it came from, in the same TeX shape", () => {
    const { c, session } = opened();
    const originals = [...PROBLEMS, ...PS5_PROBLEMS, ...PS4_PROBLEMS, ...PS3_PROBLEMS];
    for (const i of homeworkList("hw-3", c, session)!.own.flatMap((g) => g.items)) {
      const p = originals.find((o) => `own-${o.id}` === i.key)!;
      expect(compact(i.tex!), p.id).not.toBe(compact(p.tex));
      expect(texShape(i.tex!), p.id).toBe(texShape(p.tex));
    }
  });

  it("Problem Set 6's are the problems the homework folder animation sent, in its order", () => {
    for (const s of [sessionAt("report"), sessionAt("report", "strong"), teacherSkip("completed", classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now)), INITIAL_SESSION, now).session]) {
      const { c } = opened(s);
      const group = homeworkList("hw-3", c, s)!.own.find((g) => g.setId === "pset-6");
      expect(group?.items.map((i) => i.key.replace(/^own-/, "")) ?? []).toEqual(homeworkProblems(s).map((p) => p.id));
    }
  });

  it("a set with nothing ever wrong is left out: a run where every step held lists no Problem Set 6", () => {
    const s = sessionAt("report", "strong");
    const { c } = opened(s);
    expect(homeworkList("hw-3", c, s)!.own.map((g) => g.setId)).toEqual(["pset-5", "pset-4", "pset-3"]);
    expect(groupBySet([{ id: "a", name: "A", due: "Mon 7 Sep" }], [])).toEqual([]);
  });

  it("Everyone is the ten as Refine left them: Q8 changed, the new problem in Q9's slot", () => {
    const { c, session } = opened();
    const list = homeworkList("hw-3", c, session)!;
    const sent = c.homeworks!.find((h) => h.id === "hw-3")!;
    expect(list.everyone.map((i) => [i.stem, i.tex])).toEqual(sent.questions.map((q) => [q.stem, q.tex]));
    expect(list.everyone).toHaveLength(10);
    expect(list.everyone[7].tex).toBe("y = (x - 3)^{2} - 4");
    expect(list.everyone[8].tex).toBe("y = a(x + 2)(x - 4)");
    expect(list.everyone[0].tex).toBe(parseQuestion(HOMEWORK_PASTE_LINES[0]).tex);
  });

  it("a problem with a figure carries it: Problem Set 6's Q8 ever wrong shows its similar graph", () => {
    const base = sessionAt("report");
    const s: StudentSession = { ...base, lines: { ...base.lines, q8: [] } };
    const { c } = opened(s);
    const q8 = homeworkList("hw-3", c, s)!.own[0].items.find((i) => i.key === "own-q8");
    expect(q8).toMatchObject({ figure: "q8-similar-parabola" });
    expect(homeworkList("hw-3", c, s)!.own[0].items.filter((i) => i.figure)).toHaveLength(1);
  });

  it("only an open homework has a list: not sent, waiting in the Future, the fixtures' homeworks, an unknown id", () => {
    const live = classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now));
    const waiting = homeworkSentAt(live, now + 1_000);
    expect(homeworkList("hw-3", live, INITIAL_SESSION)).toBeNull();
    expect(homeworkList("hw-3", waiting, INITIAL_SESSION)).toBeNull();
    expect(ownSets("hw-3", waiting)).toEqual([]);
    const { c, session } = opened();
    for (const id of ["hw-1", "hw-2", "hw-4"]) expect(homeworkList(id, c, session), id).toBeNull();
  });

  it("the own sets are the frozen ones, newest first; a set's ever-wrong problems in set order", () => {
    const { c, session } = opened();
    expect(ownSets("hw-3", c)).toEqual([
      { id: "pset-6", name: "Problem Set 6", due: "Thu 10 Sep" },
      { id: "pset-5", name: "Problem Set 5", due: "Mon 7 Sep" },
    ]);
    expect(everWrongOn("pset-5", c, session).map((p) => p.label)).toEqual(["Q4", "Q6", "Q9"]);
    expect(ownProblems(ownSets("hw-3", c), c, session).map((p) => [p.setId, p.problem.id, p.similar.problemId])).toEqual([
      ["pset-6", "q1", "q1"],
      ["pset-6", "q2", "q2"],
      ["pset-6", "q3", "q3"],
      ["pset-6", "q7", "q7"],
      ["pset-6", "q10", "q10"],
      ["pset-5", "ps5-q4", "ps5-q4"],
      ["pset-5", "ps5-q6", "ps5-q6"],
      ["pset-5", "ps5-q9", "ps5-q9"],
    ]);
  });
});

describe("Problem Set 5's similar problems (ticket 293)", () => {
  it("one for every problem Sam ever got wrong on the set, in set order", () => {
    const { c, session } = opened();
    expect(PS5_SIMILAR_PROBLEMS.map((s) => s.problemId)).toEqual(everWrongOn("pset-5", c, session).map((p) => p.id));
    // The story says the same: his handed-in record marks Q4, Q6 and Q9 wrong, and a problem not attempted would have gone too.
    expect(FINISHED_SETS.find((s) => s.fixture.id === "pset-5")!.sam!.wrong).toEqual(PS5_SIMILAR_PROBLEMS.map((s) => s.problemId));
  });

  it("every question and step typesets, and the change keeps the question's shape, numbers only", () => {
    for (const s of PS5_SIMILAR_PROBLEMS) {
      const p = PS5_PROBLEMS.find((x) => x.id === s.problemId)!;
      for (const tex of [s.tex, ...s.solution.map((st) => st.tex)]) expect(() => renders(tex), `${s.problemId}: ${tex}`).not.toThrow();
      expect(compact(s.tex), s.problemId).not.toBe(compact(p.tex));
      expect(texShape(s.tex), s.problemId).toBe(texShape(p.tex));
      expect(texDiff(p.tex, s.tex).aligned, s.problemId).toBe(true);
      expect(s.stem, s.problemId).toBe(p.stem);
    }
  });

  it("carries exactly its original's skills, step for step, and a named type", () => {
    const leaves = (steps: { tags: { leaf: string }[] }[]) => [...new Set(steps.flatMap((st) => st.tags.map((t) => t.leaf)))].sort();
    for (const s of PS5_SIMILAR_PROBLEMS) {
      const p = PS5_PROBLEMS.find((x) => x.id === s.problemId)!;
      expect(leaves(s.solution), s.problemId).toEqual(leaves(p.solution));
      expect(s.solution.length, s.problemId).toBe(p.solution.length);
      expect(s.type.trim().length, s.problemId).toBeGreaterThan(0);
      expect(!!s.figure, s.problemId).toBe(!!p.figure);
    }
  });

  it("repeats no set's problem, no Problem Set 6 similar problem or diagnostic, and none of Homework 3's ten", () => {
    const taken = [
      ...FINISHED_SETS.flatMap((f) => f.fixture.problems.map((p) => p.tex)),
      ...PROBLEMS.map((p) => p.tex),
      ...SIMILAR_PROBLEMS.map((s) => s.tex),
      ...PROBLEM_DIAGNOSTICS.map((d) => d.similar),
      ...HOMEWORK_PASTE_LINES.map((l) => parseQuestion(l).tex ?? ""),
      ...HOMEWORK_RECOMMENDATIONS.flatMap((r) => (r.kind === "change" ? [r.to.tex] : r.kind === "add" ? r.options.map((o) => o.tex) : [])),
    ].map((t) => compact(t).replace(/\^\{(\d)\}/g, "^$1"));
    for (const s of PS5_SIMILAR_PROBLEMS) expect(taken, s.problemId).not.toContain(compact(s.tex));
  });

  const S = (id: string) => similarFor(id)!;
  const st = (id: string, i: number) => S(id).solution[i].tex;
  const rhs = (id: string) => S(id).tex.replace(/^y = /, "");

  it("Q4: y = 2x² − 11x − 6 splits −12 + 1, factorises to (2x + 1)(x − 6), crosses at −1/2 and 6", () => {
    expect(2 * -6).toBe(-12);
    expect(-12 * 1).toBe(-12);
    expect(-12 + 1).toBe(-11);
    for (const i of [1, 2, 3]) expect(sameFunction(st("ps5-q4", i).replace(/ = 0$/, ""), rhs("ps5-q4")), st("ps5-q4", i)).toBe(true);
    const xs = namedValues(st("ps5-q4", 4));
    expect(sameValues(xs, [-0.5, 6])).toBe(true);
    for (const x of xs) expect(evalTex(rhs("ps5-q4"), { x })).toBeCloseTo(0, 9);
  });

  it("Q6: y = x² − 6x + 11 = (x − 3)² + 2, turning point (3, 2)", () => {
    expect(sameFunction(sides(st("ps5-q6", 0)).right, rhs("ps5-q6"))).toBe(true);
    expect(sameFunction(sides(st("ps5-q6", 1)).right, rhs("ps5-q6"))).toBe(true);
    expect(evalTex(rhs("ps5-q6"), { x: 3 })).toBe(2);
    expect(st("ps5-q6", 2)).toContain("(3, 2)");
  });

  it("Q9: y = −x² + 6x + 7 opens down, meets the axes at (0, 7), 7 and −1, turning point (3, 16)", () => {
    expect(evalTex(rhs("ps5-q9"), { x: 0 })).toBe(7);
    expect(sameFunction(sides(st("ps5-q9", 2)).left, rhs("ps5-q9"))).toBe(true);
    const xs = namedValues(st("ps5-q9", 3));
    expect(sameValues(xs, [7, -1])).toBe(true);
    for (const x of xs) expect(evalTex(rhs("ps5-q9"), { x })).toBe(0);
    expect(evalTex("-9 + 18 + 7")).toBe(evalTex(rhs("ps5-q9"), { x: 3 }));
    expect(evalTex(rhs("ps5-q9"), { x: 3 })).toBe(16);
    expect(st("ps5-q9", 5)).toContain("(3, 16)");
  });
});

describe("a missed homework's leftovers carry into the next (ticket 294)", () => {
  const skills = (ps: readonly OwnProblem[]) => ps.map((p) => p.skill);
  const fake = (setId: string, id: string, skill: OwnProblem["skill"]): OwnProblem => ({ setId, problem: { id } as OwnProblem["problem"], similar: similarFor("q1")!, skill });

  it("Homework 2 is the missed homework before Homework 3; Homework 1 was done, so nothing comes into Homework 2", () => {
    const { c } = opened();
    expect(missedBefore("hw-3", c)?.id).toBe("hw-2");
    expect(missedBefore("hw-2", c)).toBeNull();
    expect(missedBefore("hw-1", c)).toBeNull();
    expect(missedBefore("hw-3", c, { "hw-2": { finishedOn: "Mon 7 Sep" } })).toBeNull();
  });

  it("the leftovers are Homework 2's own problems, every one Sam ever got wrong on Problem Sets 4 and 3, never a teacher's question", () => {
    const { c, session } = opened();
    const left = leftovers(missedBefore("hw-3", c)!, c, session);
    expect(left.sets.map((s) => s.id)).toEqual(["pset-4", "pset-3"]);
    expect(left.problems.map((p) => p.problem.id)).toEqual(["ps4-q1", "ps4-q2", "ps4-q7", "ps4-q8", "ps4-q10", "ps3-q8"]);
    const story = [...FINISHED_SETS.find((s) => s.fixture.id === "pset-4")!.sam!.wrong, ...FINISHED_SETS.find((s) => s.fixture.id === "pset-3")!.sam!.wrong];
    expect(left.problems.map((p) => p.problem.id)).toEqual(story);
    // Finished late: missed, but nothing left undone.
    expect(leftovers(missedBefore("hw-3", c)!, c, session, { "hw-2": { finishedOn: "Wed 9 Sep" } }).problems).toEqual([]);
  });

  it("a leftover whose skill his own problems here already have is dropped; the rest carry under their own set, then Everyone as sent", () => {
    const { c, session } = opened();
    const mine = ownProblems(ownSets("hw-3", c), c, session);
    expect(skills(mine)).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic", "algebra.equations.quadratic", "algebra.number.fractions", "algebra.equations.discriminant", "algebra.expand-factor.nonmonic", "algebra.expand-factor.binomial", "graphing.quadratics.sketch"]);
    const left = leftovers(missedBefore("hw-3", c)!, c, session).problems;
    expect(skills(left)).toEqual(["algebra.expand-factor.nonmonic", "algebra.expand-factor.nonmonic", "algebra.expand-factor.binomial", "algebra.expand-factor.binomial", "reasoning.interpret.worded", "algebra.expand-factor.monic"]);
    expect(carryOver(left, mine).map((p) => p.problem.id)).toEqual(["ps4-q10"]);
    const list = homeworkList("hw-3", c, session)!;
    const own = list.own.flatMap((g) => g.items);
    // Problem Set 5's Q4 and Problem Set 6's Q2 share non-monic factorising and both stay: this homework's own never knock each other out.
    expect(own.map((i) => i.key)).toContain("own-ps5-q4");
    expect(own.map((i) => i.key)).toContain("own-q2");
    const sent = c.homeworks!.find((h) => h.id === "hw-3")!;
    expect(list.everyone.map((i) => [i.stem, i.tex])).toEqual(sent.questions.map((q) => [q.stem, q.tex]));
  });

  it("no skill twice among the carried problems, nor between a carried problem and this homework's own", () => {
    for (const s of [sessionAt("report"), sessionAt("report", "strong"), INITIAL_SESSION]) {
      const { c } = opened(s);
      const mine = ownProblems(ownSets("hw-3", c), c, s);
      const carried = carryOver(leftovers(missedBefore("hw-3", c)!, c, s).problems, mine);
      const carriedSkills = skills(carried);
      expect(new Set(carriedSkills).size).toBe(carriedSkills.length);
      for (const k of carriedSkills) expect(skills(mine)).not.toContain(k);
    }
  });

  it("a run where every Problem Set 6 step held carries Problem Set 3 too: groups Problem Set 5, 4, 3, numbered straight through", () => {
    const s = sessionAt("report", "strong");
    const { c } = opened(s);
    const list = homeworkList("hw-3", c, s)!;
    expect(list.own.map((g) => [g.name, g.items.map((i) => i.key)])).toEqual([
      ["Problem Set 5", ["own-ps5-q4", "own-ps5-q6", "own-ps5-q9"]],
      ["Problem Set 4", ["own-ps4-q10"]],
      ["Problem Set 3", ["own-ps3-q8"]],
    ]);
    expect([...list.own.flatMap((g) => g.items), ...list.everyone].map((i) => i.n)).toEqual(Array.from({ length: 15 }, (_, k) => k + 1));
  });

  it("carryOver: the newer leftover stays on a shared skill, a skill this homework holds drops, a leftover with no skill named stays", () => {
    const mine = [fake("pset-6", "a", "algebra.expand-factor.monic")];
    const left = [fake("pset-4", "b", "algebra.expand-factor.nonmonic"), fake("pset-3", "c", "algebra.expand-factor.nonmonic"), fake("pset-3", "d", "algebra.expand-factor.monic"), fake("pset-3", "e", undefined)];
    expect(carryOver(left, mine).map((p) => p.problem.id)).toEqual(["b", "e"]);
    expect(carryOver([], mine)).toEqual([]);
    expect(carryOver(left, []).map((p) => p.problem.id)).toEqual(["b", "d", "e"]);
  });

  it("every leftover dropped as a duplicate: Homework 3 lists Problem Sets 6 and 5 alone", () => {
    // Nothing handed in on Problem Set 6: every problem there ever wrong, Q1's monic and Q9's worded skills among them, so every leftover is a duplicate.
    const { c: blank } = opened(INITIAL_SESSION);
    expect(carryOver(leftovers(missedBefore("hw-3", blank)!, blank, INITIAL_SESSION).problems, ownProblems(ownSets("hw-3", blank), blank, INITIAL_SESSION))).toEqual([]);
    expect(homeworkList("hw-3", blank, INITIAL_SESSION)!.own.map((g) => g.setId)).toEqual(["pset-6", "pset-5"]);
  });
});

describe("each problem's one skill (ticket 294)", () => {
  const leavesOf = (p: { solution: { tags: { leaf: string }[] }[] }) => new Set(p.solution.flatMap((st) => st.tags.map((t) => t.leaf)));

  it("every problem of every set has one, a leaf its model solution carries; Problem Sets 1–4's is their outline's first", () => {
    for (const p of [...PROBLEMS, ...FINISHED_SETS.flatMap((f) => f.fixture.problems)]) {
      const skill = primarySkill(p.id);
      expect(skill, p.id).toBeDefined();
      expect(leavesOf(p).has(skill!), `${p.id} ${skill}`).toBe(true);
    }
    for (const s of STORY_SETS.filter((x) => x.outline)) s.outline!.forEach((o, k) => expect(primarySkill(`ps${s.n}-q${k + 1}`)).toBe(o.leaves[0]));
    expect(Object.keys(PS5_PS6_PRIMARY_SKILL).sort()).toEqual([...PROBLEMS, ...PS5_PROBLEMS].map((p) => p.id).sort());
    expect(primarySkill("typed-question")).toBeUndefined();
  });
});

describe("Problem Sets 4 and 3's similar problems (ticket 294)", () => {
  const ORIGINALS = [...PS4_PROBLEMS, ...PS3_PROBLEMS];
  const ALL = [...PS4_SIMILAR_PROBLEMS, ...PS3_SIMILAR_PROBLEMS];
  const original = (id: string) => ORIGINALS.find((x) => x.id === id)!;

  it("one for every problem Sam ever got wrong on the sets, carried or not, so none is silently left out", () => {
    const { c, session } = opened();
    expect(PS4_SIMILAR_PROBLEMS.map((s) => s.problemId)).toEqual(everWrongOn("pset-4", c, session).map((p) => p.id));
    expect(PS3_SIMILAR_PROBLEMS.map((s) => s.problemId)).toEqual(everWrongOn("pset-3", c, session).map((p) => p.id));
    for (const s of ALL) expect(similarFor(s.problemId), s.problemId).toBe(s);
  });

  it("every question and step typesets, the question keeps its shape with numbers only changed, the stem is the original's (its numbers alone changed)", () => {
    for (const s of ALL) {
      const p = original(s.problemId);
      for (const tex of [s.tex, ...s.solution.map((st) => st.tex)]) expect(() => renders(tex), `${s.problemId}: ${tex}`).not.toThrow();
      expect(compact(s.tex), s.problemId).not.toBe(compact(p.tex));
      expect(texShape(s.tex), s.problemId).toBe(texShape(p.tex));
      expect(texDiff(p.tex, s.tex).aligned, s.problemId).toBe(true);
      expect(texShape(s.stem), s.problemId).toBe(texShape(p.stem));
    }
    // Every stem's numbers live in its TeX (ticket 342), so a similar problem's stem is its original's word for word.
    expect(PS4_SIMILAR_PROBLEMS.filter((s) => s.stem !== original(s.problemId).stem).map((s) => s.problemId)).toEqual([]);
  });

  it("carries exactly its original's skills, step for step, and a named type", () => {
    const leaves = (steps: { tags: { leaf: string }[] }[]) => steps.map((st) => st.tags.map((t) => t.leaf).join());
    for (const s of ALL) {
      const p = original(s.problemId);
      expect(leaves(s.solution), s.problemId).toEqual(leaves(p.solution));
      expect(s.type.trim().length, s.problemId).toBeGreaterThan(0);
      expect(!!s.figure, s.problemId).toBe(!!p.figure);
    }
  });

  it("repeats no set's problem, no other similar problem or diagnostic, and none of Homework 3's ten", () => {
    const norm = (t: string) => compact(t).replace(/\^\{(\d)\}/g, "^$1").replace(/^[a-z]=/, "");
    const taken = [
      ...FINISHED_SETS.flatMap((f) => f.fixture.problems.map((p) => p.tex)),
      ...PROBLEMS.map((p) => p.tex),
      ...SIMILAR_PROBLEMS.map((s) => s.tex),
      ...PS5_SIMILAR_PROBLEMS.map((s) => s.tex),
      ...PROBLEM_DIAGNOSTICS.map((d) => d.similar),
      ...HOMEWORK_PASTE_LINES.map((l) => parseQuestion(l).tex ?? ""),
      ...HOMEWORK_RECOMMENDATIONS.flatMap((r) => (r.kind === "change" ? [r.to.tex] : r.kind === "add" ? r.options.map((o) => o.tex) : [])),
    ].map(norm);
    for (const s of ALL) expect(taken, s.problemId).not.toContain(norm(s.tex));
    expect(new Set(ALL.map((s) => norm(s.tex))).size).toBe(ALL.length);
  });

  const S = (id: string) => similarFor(id)!;
  const st = (id: string, i: number) => S(id).solution[i].tex.replace(/\\left|\\right/g, "");

  it("PS3 Q8: x² − 10x + 21 = (x − 3)(x − 7), the pair −3 and −7, expanded back", () => {
    expect(-3 * -7).toBe(21);
    expect(-3 + -7).toBe(-10);
    expect(sameFunction(st("ps3-q8", 1), S("ps3-q8").tex)).toBe(true);
    expect(sameFunction(sides(st("ps3-q8", 2)).left, sides(st("ps3-q8", 2)).right)).toBe(true);
    expect(sides(st("ps3-q8", 2)).right.trim()).toBe(S("ps3-q8").tex);
  });

  it("PS4 Q1 and Q2: each split, grouping and factorisation equals the question", () => {
    expect([3 * -2, 6 * -1, 6 - 1]).toEqual([-6, -6, 5]);
    expect([2 * -15, 6 * -5, 6 - 5]).toEqual([-30, -30, 1]);
    for (const id of ["ps4-q1", "ps4-q2"]) for (const i of [1, 2, 3]) expect(sameFunction(st(id, i), S(id).tex), `${id} ${st(id, i)}`).toBe(true);
  });

  it("PS4 Q7: x² − 3x + 4 = (x − 3/2)² + 7/4", () => {
    for (const i of [0, 1, 2]) expect(sameFunction(st("ps4-q7", i), S("ps4-q7").tex), st("ps4-q7", i)).toBe(true);
  });

  it("PS4 Q8: 3x² + 6x − 2 = 3(x + 1)² − 5, turning point (−1, −5)", () => {
    for (const i of [0, 1, 2]) expect(sameFunction(st("ps4-q8", i), S("ps4-q8").tex), st("ps4-q8", i)).toBe(true);
    expect(evalTex(S("ps4-q8").tex, { x: -1 })).toBe(-5);
    expect(st("ps4-q8", 4)).toContain("(-1, -5)");
  });

  it("PS4 Q10: length 2w + 1, area 36: 2w² + w − 36 = (2w + 9)(w − 4), the width 4 cm and the length 9 cm", () => {
    const area = (w: number) => w * (2 * w + 1);
    expect(sameFunction("2w^2 + w - 36", "w(2w + 1) - 36", "w")).toBe(true);
    expect(sameFunction(sides(st("ps4-q10", 4)).left, "2w^2 + w - 36", "w")).toBe(true);
    expect([2 * -36, 9 * -8, 9 - 8]).toEqual([-72, -72, 1]);
    const ws = st("ps4-q10", 5).split(/\\;\\text\{or\}\\;/).map((part) => evalTex(sides(part).right));
    expect(ws.sort((a, b) => a - b)).toEqual([-4.5, 4]);
    for (const w of ws) expect(area(w)).toBe(36);
    expect([2 * 4 + 1, 4 * 9]).toEqual([9, 36]);
    expect(S("ps4-q10").solution.at(-1)!.tex).toContain("4 cm");
  });
});
