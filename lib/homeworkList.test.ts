import katex from "katex";
import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { PROBLEM_DIAGNOSTICS } from "@/data/diagnostic";
import { SIMILAR_PROBLEMS } from "@/data/homework";
import { HOMEWORK_PASTE_LINES } from "@/data/homework-draft-seed";
import { PS5_SIMILAR_PROBLEMS } from "@/data/homework-similar-ps5";
import { HOMEWORK_RECOMMENDATIONS } from "@/data/review";
import { PS5_PROBLEMS } from "@/data/pset5/assignment";
import { FINISHED_SETS } from "./finishedSets";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { homeworkSent } from "./create";
import { DEMO_PATHWAY, demoSend, teacherSkip } from "./demo";
import { generatedHomeworkDraft } from "./draft";
import { homeworkProblems, similarFor, texDiff, texShape } from "./homework";
import { everWrongOn, groupBySet, homeworkList, ownProblems, ownSets } from "./homeworkList";
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
  it("his own problems first, Problem Set 6 then Problem Set 5, each as its similar problem; then the teacher's ten, numbered on", () => {
    const { c, session } = opened();
    const list = homeworkList("hw-3", c, session)!;
    expect(list).toMatchObject({ id: "hw-3", name: "Homework 3", due: "Mon 14 Sep" });
    expect(list.own.map((g) => [g.setId, g.name])).toEqual([
      ["pset-6", "Problem Set 6"],
      ["pset-5", "Problem Set 5"],
    ]);
    expect(list.own[0].items.map((i) => i.key)).toEqual(["own-q1", "own-q2", "own-q3", "own-q7", "own-q10"]);
    expect(list.own[1].items.map((i) => i.key)).toEqual(["own-ps5-q4", "own-ps5-q6", "own-ps5-q9"]);
    const own = list.own.flatMap((g) => g.items);
    expect(own.map((i) => i.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect(list.everyone.map((i) => i.n)).toEqual([9, 10, 11, 12, 13, 14, 15, 16, 17, 18]);
    for (const i of own) {
      const id = i.key.replace(/^own-/, "");
      const s = similarFor(id)!;
      expect([i.stem, i.tex], id).toEqual([s.stem, s.tex]);
    }
  });

  it("never an original: every own question differs from the problem it came from, in the same TeX shape", () => {
    const { c, session } = opened();
    const originals = [...PROBLEMS, ...PS5_PROBLEMS];
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

  it("a set with nothing ever wrong is left out: a run where every step held lists Problem Set 5 alone", () => {
    const s = sessionAt("report", "strong");
    const { c } = opened(s);
    expect(homeworkList("hw-3", c, s)!.own.map((g) => g.setId)).toEqual(["pset-5"]);
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
