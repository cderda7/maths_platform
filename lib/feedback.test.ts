import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { feedbackFor, runKind } from "./feedback";
import { scriptedSession, sessionAt, sessionReducer, type StudentSession } from "./session";

const modelRun = (): StudentSession => {
  let s = sessionAt("working");
  for (const p of PROBLEMS) for (const [i, st] of p.solution.entries()) s = sessionReducer(s, { type: "line/reveal", problem: p.id, line: { tex: st.tex, strokeCount: i + 1 } });
  return s;
};

describe("feedback layers", () => {
  it("the scripted run is a weak run; the model solution is a strong one", () => {
    expect(runKind(scriptedSession())).toBe("weak");
    expect(runKind(modelRun())).toBe("strong");
  });

  it("every step that didn't hold is red, and only those", () => {
    const fb = feedbackFor(scriptedSession());
    const reds = fb.flatMap((p) => p.lines.filter((l) => l.verdict.verdict === "wrong").map((l) => [p.problem.id, l.tex.slice(0, 12)]));
    expect(reds).toEqual([
      ["q1", "(x + 2)(x + "],
      ["q2", "(2x + 4)(x -"],
      ["q3", "x - 3 = 6 \\;"],
      ["q7", "x^2 + 6x + \\"],
      ["q10", "\\Delta < 0 \\"],
    ]);
  });

  it("a weak run's standouts are the harder correct steps; a strong run's are the novel ones", () => {
    const weak = feedbackFor(scriptedSession()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(weak).toEqual(["q2:2x + 4 = 0", "q4:b^2 - 4ac ", "q4:x = \\dfrac", "q8:1 - 4 + 3 "]);
    const strong = feedbackFor(modelRun()).flatMap((p) => p.lines.filter((l) => l.standout).map((l) => `${p.problem.id}:${l.tex.slice(0, 10)}`));
    expect(strong).toEqual(["q2:ac = -8,\\q", "q3:x^2 - x - ", "q4:b^2 - 4ac ", "q5:x = \\tfrac", "q6:36 - 4k = ", "q8:1 - 4 + 3 ", "q10:\\text{The "]);
  });

  it("clues are pattern-level and only on problems with a slip; a clean problem can be starred", () => {
    const fb = feedbackFor(scriptedSession());
    expect(fb.map((p) => !!p.clue)).toEqual([true, true, true, false, false, false, true, false, false, true]);
    expect(fb.map((p) => p.clean)).toEqual([false, false, false, true, true, true, false, true, true, false]);
    for (const p of fb) if (p.clue) expect(p.clue).not.toMatch(/line \d/i);
  });

  it("starring toggles and only clean problems are meant to be starred", () => {
    let s = scriptedSession();
    s = sessionReducer(s, { type: "star/toggle", problem: "q4" });
    expect(s.stars).toEqual(["q4"]);
    s = sessionReducer(s, { type: "star/toggle", problem: "q4" });
    expect(s.stars).toEqual([]);
  });
});

describe("detective feedback summary", () => {
  it("zero mistakes: every problem held, no hint", async () => {
    const { feedbackSummary } = await import("./feedback");
    const s = feedbackSummary(modelRun());
    expect(s).toMatchObject({ count: 0, total: 10, subskills: [] });
    expect(s.sentence).toBe("Every problem held.");
  });

  it("one mistake still gets a hint naming its subskill", async () => {
    const { summarySentence } = await import("./feedback");
    expect(summarySentence(1, ["algebra.number.fractions"])).toBe("1 of your problems contains a mistake. Double-check fractions.");
  });

  it("the scripted run: five problems, leaves in first-occurrence order, hint capped at three", async () => {
    const { feedbackSummary, summarySentence } = await import("./feedback");
    const s = feedbackSummary(scriptedSession());
    expect(s.count).toBe(5);
    expect(s.subskills).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic", "unit.u1.nfl", "algebra.number.fractions", "reasoning.justify.formal"]);
    // Q9 and Q10 stop short of a final answer in the scripted run (ticket 111), so the clause names the first submission.
    expect(s.sentence).toBe("5 problems in your first submission contain a mistake. Double-check factorising, non-monic factorising and null factor law.");
    expect(summarySentence(5, s.subskills)).toBe("5 of your problems contain a mistake. Double-check factorising, non-monic factorising and null factor law.");
  });

  it("splits the sentence into the count clause and the capped hint leaves for the chips", async () => {
    const { feedbackSummary, summaryParts } = await import("./feedback");
    const s = feedbackSummary(scriptedSession());
    expect(s.head).toBe("5 problems in your first submission contain a mistake.");
    expect(s.hint).toEqual(["algebra.expand-factor.monic", "algebra.expand-factor.nonmonic", "unit.u1.nfl"]);
    expect(summaryParts(5, s.subskills).head).toBe("5 of your problems contain a mistake.");
    expect(summaryParts(0, ["algebra.number.fractions"])).toEqual({ head: "Every problem held.", hint: [], sentence: "Every problem held." });
    expect(summaryParts(2, [], "final")).toEqual({ head: "2 of your problems still contain a mistake.", hint: [], sentence: "2 of your problems still contain a mistake." });
  });

  it("caps the hint at three subskills", async () => {
    const { summarySentence } = await import("./feedback");
    expect(summarySentence(4, ["algebra.equations.linear", "algebra.number.fractions", "algebra.expand-factor.monic", "algebra.expand-factor.expand"])).toBe("4 of your problems contain a mistake. Double-check linear equations, fractions and factorising.");
  });

  it("the final version reads the rework and says 'still'", async () => {
    const { feedbackSummary } = await import("./feedback");
    const reworked = sessionAt("group"); // scripted run with every slipped problem corrected but Q7, which slipped again
    expect(feedbackSummary(reworked, "final").sentence).toBe("1 of your problems still contains a mistake. Double-check fractions.");
    expect(feedbackSummary(reworked, "original").count).toBe(5);
    let partial = sessionAt("feedback");
    partial = sessionReducer(partial, { type: "rework/reveal", problem: "q1", line: { tex: "(x - 2)(x - 3) = 0", strokeCount: 1 } });
    partial = sessionReducer(partial, { type: "rework/reveal", problem: "q1", line: { tex: "x = 2 \\text{ or } x = 3", strokeCount: 2 } });
    const f = feedbackSummary(partial, "final");
    expect(f.count).toBe(4);
    expect(f.sentence).toMatch(/^4 of your problems still contain a mistake\./);
  });
});

describe("incomplete work", () => {
  const OR = " \\;\\text{or}\\; ";
  /** Handed in with one line of working on Q2 and nothing else, as a student who ran out of time. */
  const thinHandIn = (): StudentSession => {
    let s = sessionAt("working");
    s = sessionReducer(s, { type: "line/reveal", problem: "q2", line: { tex: "2x^2 + 7x - 4 = 0", strokeCount: 5 } });
    return { ...s, stage: "feedback" };
  };
  const rework = (s: StudentSession, problem: string, texs: string[]) => texs.reduce((acc, tex, n) => sessionReducer(acc, { type: "rework/reveal", problem, line: { tex, strokeCount: (n + 1) * 5 } }), s);

  it("every problem's model solution reaches an answer line", async () => {
    const { evaluateLine } = await import("./evaluate");
    for (const p of PROBLEMS) {
      const flags = p.solution.map((st) => {
        const v = evaluateLine(p.id, st.tex);
        return v.verdict !== "unclear" && v.answer === true;
      });
      expect(flags.some(Boolean), p.id).toBe(true);
    }
  });

  it("the scripted run finishes Q1 to Q8, right or wrong, and stops short on the two worded problems", async () => {
    const { progressOf, incompleteProblems, feedbackSummary } = await import("./feedback");
    const s = scriptedSession();
    expect(PROBLEMS.map((p) => progressOf(s, p.id))).toEqual(["finished", "finished", "finished", "finished", "finished", "finished", "finished", "finished", "unfinished", "unfinished"]);
    expect(incompleteProblems(s)).toEqual(["q9", "q10"]);
    const f = feedbackSummary(s);
    expect(f.incomplete).toBe(2);
    expect(f.incompleteHead).toBe("2 problems are incomplete.");
    const done = feedbackSummary(modelRun());
    expect(done.incomplete).toBe(0);
    expect(done.incompleteHead).toBeNull();
    expect(done.head).toBe("Every problem held.");
  });

  it("Q9's scripted correction is the one missing line: a single burst finishes it and the incomplete box counts down (ticket 158)", async () => {
    const { progressOf, feedbackSummary } = await import("./feedback");
    const { reworkScript } = await import("@/data/recognition");
    const { guardFor } = await import("./guard");
    expect(reworkScript("q9")).toEqual(["h = -9 + 18 = 9"]);
    let s: StudentSession = { ...scriptedSession(), stage: "feedback" };
    s = rework(s, "q9", reworkScript("q9"));
    expect(progressOf(s, "q9")).toBe("finished");
    expect(feedbackSummary(s).incompleteHead).toBe("1 problem is incomplete.");
    expect(guardFor(s, "q9").tripped).toBe(false);
    // The mistakes box reads the first submission, so finishing Q9 leaves it alone.
    expect(feedbackSummary(s).head).toBe("5 problems in your first submission contain a mistake.");
    s = rework(s, "q10", reworkScript("q10"));
    expect(feedbackSummary(s).incompleteHead).toBeNull();
    // A problem that held with no scripted correction reads its own working again, and holds again.
    for (const pid of ["q5", "q6", "q8"]) {
      expect(reworkScript(pid).length, pid).toBeGreaterThan(0);
      const again = rework(s, pid, reworkScript(pid));
      expect(guardFor(again, pid).tripped, pid).toBe(false);
      expect(progressOf(again, pid), pid).toBe("finished");
    }
    // The deep-linked reworked run still has Q9 unfinished: only problems that slipped are reworked there.
    const deep = sessionAt("group");
    expect(deep.rework.q9).toBeUndefined();
    expect(progressOf(deep, "q9")).toBe("unfinished");
  });

  it("a thin hand-in: not attempted or unfinished rows, ten incomplete, no mistakes in the first submission", async () => {
    const { progressOf, feedbackSummary } = await import("./feedback");
    const s = thinHandIn();
    expect(progressOf(s, "q1")).toBe("not-attempted");
    expect(progressOf(s, "q2")).toBe("unfinished");
    const f = feedbackSummary(s);
    expect(f.incomplete).toBe(10);
    expect(f.incompleteHead).toBe("10 problems are incomplete.");
    expect(f.count).toBe(0);
    expect(f.head).toBe("No mistakes in your first submission.");
    expect(f.hint).toEqual([]);
  });

  it("finishing problems on the rework pad counts the box down; the last one takes the box away", async () => {
    const { progressOf, feedbackSummary } = await import("./feedback");
    let s = rework(thinHandIn(), "q1", ["(x - 2)(x - 3) = 0"]);
    expect(progressOf(s, "q1")).toBe("unfinished");
    expect(feedbackSummary(s).incomplete).toBe(10);
    s = rework(s, "q1", ["x = 2" + OR + "x = 3"]);
    expect(progressOf(s, "q1")).toBe("finished");
    expect(feedbackSummary(s).incomplete).toBe(9);
    expect(feedbackSummary(s).incompleteHead).toBe("9 problems are incomplete.");
    s = rework(s, "q2", ["(2x - 1)(x + 4) = 0", "x = \\tfrac{1}{2}" + OR + "x = -4"]);
    expect(feedbackSummary(s).incomplete).toBe(8);
    for (const p of PROBLEMS.slice(2)) s = rework(s, p.id, p.solution.map((st) => st.tex));
    const f = feedbackSummary(s);
    expect(f.incomplete).toBe(0);
    expect(f.incompleteHead).toBeNull();
    expect(f.head).toBe("Every problem held.");
  });

  it("a wrong step while finishing a blank problem changes neither box nor the hand-in notice", async () => {
    const { progressOf, feedbackSummary } = await import("./feedback");
    let s = rework(thinHandIn(), "q1", ["(x + 2)(x + 3) = 0", "x = -2" + OR + "x = -3"]);
    expect(progressOf(s, "q1")).toBe("finished");
    const f = feedbackSummary(s);
    expect(f).toMatchObject({ count: 0, hint: [], incomplete: 9, head: "No mistakes in your first submission." });
    expect(feedbackSummary(s, "final").sentence).toBe("Every problem holds now.");
    s = sessionReducer(s, { type: "rework/done" });
    expect(s.notice).toBe("Every problem holds now.");
  });

  it("the sentence typed under a worded problem's working is its answer", async () => {
    const { progressOf, feedbackSummary } = await import("./feedback");
    let s = scriptedSession();
    expect(progressOf(s, "q9")).toBe("unfinished");
    s = sessionReducer(s, { type: "answer/set", problem: "q9", text: "  " });
    expect(progressOf(s, "q9")).toBe("unfinished");
    s = sessionReducer(s, { type: "answer/set", problem: "q9", text: "It lands 6 m away and its greatest height is 9 m." });
    expect(progressOf(s, "q9")).toBe("finished");
    expect(feedbackSummary(s).incompleteHead).toBe("1 problem is incomplete.");
  });

  it("singular forms and the first-submission clause", async () => {
    const { incompleteHead, summaryParts } = await import("./feedback");
    expect(incompleteHead(1)).toBe("1 problem is incomplete.");
    expect(incompleteHead(0)).toBeNull();
    expect(summaryParts(1, ["algebra.number.fractions"], "original", true).sentence).toBe("1 problem in your first submission contains a mistake. Double-check fractions.");
    expect(summaryParts(0, [], "original", true).head).toBe("No mistakes in your first submission.");
    // The clause is the original version's: the post-rework notice keeps "still", whatever is outstanding.
    expect(summaryParts(2, [], "final", true).head).toBe("2 of your problems still contain a mistake.");
    expect(summaryParts(0, [], "final", true).head).toBe("Every problem holds now.");
  });
});
