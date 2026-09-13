import { describe, expect, it } from "vitest";
import type { Confidence } from "@/data/types";
import { skipFixture } from "./demo";
import { outcomeColumns, problemOutcome, reportFacts, unsolvedInGroup } from "./report";
import { INITIAL_SESSION, sessionAt, sessionReducer } from "./session";

const labels = (cols: ReturnType<typeof outcomeColumns>) => Object.fromEntries(cols.map((c) => [c.id, c.problems.map((p) => p.label)]));

describe("problem outcomes", () => {
  const reworked = sessionAt("report");

  it("puts each problem in exactly one column, in set order", () => {
    const cols = outcomeColumns(reworked, ["individual", "group"], null);
    expect(cols.map((c) => c.id)).toEqual(["first", "individual", "group", "wrong"]);
    expect(cols.flatMap((c) => c.problems).length).toBe(10);
    expect(cols.map((c) => c.label)).toEqual(["Correct first try", "Correct after individual review", "Correct after group review", "Incorrect"]);
  });

  it("reads the demo's reworked run: five right first try, four right after individual review, Q7 still wrong", () => {
    const by = labels(outcomeColumns(reworked, ["individual"], null));
    expect(by.first).toEqual(["Q4", "Q5", "Q6", "Q8", "Q9"]);
    expect(by.individual).toEqual(["Q1", "Q2", "Q3", "Q10"]);
    expect(by.wrong).toEqual(["Q7"]);
  });

  it("counts a problem the group's rework checked as correct after group review, once group review is in the pathway; one the group closed unsolved stays incorrect", () => {
    const { session, classroom } = skipFixture("report", 1_000_000);
    // Q7: slipped again in the student's own rework, and the group never solved it (ticket 222).
    expect(session.rework.q7?.length).toBeGreaterThan(0);
    expect(classroom.group?.resolved).not.toContain("q7");
    expect(classroom.group?.unsolved).toEqual(["q7"]);
    const with_ = labels(outcomeColumns(session, ["individual", "group"], classroom.group));
    expect(with_.individual).toEqual(["Q1", "Q2", "Q3", "Q10"]);
    expect(with_.group).toEqual([]);
    expect(with_.wrong).toEqual(["Q7"]);
    // The report names it: not solved in group review (ticket 223).
    expect(unsolvedInGroup(session, ["individual", "group"], classroom.group).map((p) => p.label)).toEqual(["Q7"]);
    expect(unsolvedInGroup(session, ["individual"], classroom.group)).toEqual([]);
    expect(unsolvedInGroup(session, ["individual", "group"], null)).toEqual([]);
    // Had the group's rework checked, Q7 would sit in the group column.
    const solved = { ...classroom.group!, resolved: [...classroom.group!.resolved, "q7"], unsolved: [] };
    const withSolved = labels(outcomeColumns(session, ["individual", "group"], solved));
    expect(withSolved.group).toEqual(["Q7"]);
    expect(withSolved.wrong).toEqual([]);
    const without = labels(outcomeColumns(session, ["individual"], classroom.group));
    expect(without.group).toBeUndefined();
    expect(without.wrong).toEqual(["Q7"]);
    const noRun = labels(outcomeColumns(session, ["individual", "group"], null));
    expect(noRun.group).toEqual([]);
    expect(noRun.wrong).toEqual(["Q7"]);
  });

  it("shows only the columns the pathway allows", () => {
    expect(outcomeColumns(reworked, [], null).map((c) => c.id)).toEqual(["first", "wrong"]);
    expect(outcomeColumns(reworked, ["group"], null).map((c) => c.id)).toEqual(["first", "group", "wrong"]);
    expect(outcomeColumns(reworked, ["whole-class"], null).map((c) => c.id)).toEqual(["first", "wrong"]);
    expect(outcomeColumns(reworked, ["individual", "group", "whole-class"], null).map((c) => c.id)).toEqual(["first", "individual", "group", "wrong"]);
  });

  it("ignores a rework when individual review is not in the pathway, and a run when group review is not", () => {
    const { session, classroom } = skipFixture("report", 1_000_000);
    expect(problemOutcome(session, "q1", [], classroom.group)).toBe("wrong");
    expect(problemOutcome(session, "q1", ["individual"], classroom.group)).toBe("individual");
    expect(problemOutcome(session, "q1", ["group"], classroom.group)).toBe("group");
    expect(problemOutcome(session, "q1", ["whole-class"], classroom.group)).toBe("wrong");
    expect(problemOutcome(session, "q4", [], null)).toBe("first");
  });

  it("calls an unattempted problem incorrect", () => {
    expect(problemOutcome(INITIAL_SESSION, "q1", ["individual", "group"], null)).toBe("wrong");
    expect(labels(outcomeColumns(INITIAL_SESSION, [], null)).wrong.length).toBe(10);
  });

  it("puts every problem of a strong run in the first column", () => {
    const by = labels(outcomeColumns(sessionAt("report", "strong"), ["individual", "group"], null));
    expect(by.first.length).toBe(10);
    expect(by.wrong).toEqual([]);
  });
});

describe("sending the report", () => {
  it("does nothing without a reflection", () => {
    const s = sessionAt("report");
    expect(sessionReducer(s, { type: "report/send" }).reportSent).toBe(false);
    expect(sessionReducer(sessionReducer(s, { type: "reflection/set", text: "   " }), { type: "report/send" }).reportSent).toBe(false);
    expect(sessionReducer(sessionReducer(s, { type: "reflection/set", text: "I rushed." }), { type: "report/send" }).reportSent).toBe(true);
  });
});

describe("report facts", () => {
  it("describe the scripted, reworked run as facts", () => {
    const f = reportFacts(sessionAt("report"));
    expect(f.slipped).toBe(5);
    expect(f.total).toBe(10);
    expect(f.reworked).toEqual(["Q1", "Q2", "Q3", "Q7", "Q10"]);
    expect(f.practices).toEqual(["Practice · monic factorising · Q2 · taken"]);
    expect(f.caution).toEqual([]);
    expect(f.confidence).toBe("Confidence low when monic factorising comes up");
    expect(f.stars).toEqual(["Q4"]);
  });
});

describe("the confidence label", () => {
  it("names one or two skills, and reads as low overall from three", async () => {
    const { confidenceLabel, confidenceSentence } = await import("./report");
    const one: Confidence = { level: "low-when", leaves: ["algebra.number.fractions"] };
    const two: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "algebra.equations.discriminant"] };
    const three: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "algebra.equations.discriminant", "graphing.quadratics.sketch"] };
    expect(confidenceLabel(one)).toBe("low: fractions");
    expect(confidenceLabel(two)).toBe("low: fractions, discriminant");
    expect(confidenceLabel(three)).toBe("low");
    expect(confidenceLabel({ level: "low" })).toBe("low");
    expect(confidenceLabel({ level: "confident" })).toBe("confident");
    expect(confidenceLabel(null)).toBe("—");
    expect(confidenceSentence(two)).toBe("Confidence low when fractions, discriminant comes up");
    expect(confidenceSentence(three)).toBe("Confidence low before starting");
    expect(confidenceSentence({ level: "low-when", leaves: [] })).toBe("Confidence low before starting");
  });
});

describe("confidenceForms", () => {
  it("gives a plain word one form", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("confident")).toEqual([{ words: ["confident"], hidden: 0 }]);
    expect(confidenceForms("low")).toEqual([{ words: ["low"], hidden: 0 }]);
    expect(confidenceForms("—")).toEqual([{ words: ["—"], hidden: 0 }]);
  });
  it("names one skill in full, then counts it", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("low: monic factorising")).toEqual([
      { words: ["low:", "monic", "factorising"], hidden: 0 },
      { words: ["low"], hidden: 1 },
    ]);
  });
  it("tries both skills, then each alone with the other counted, then none", async () => {
    const { confidenceForms } = await import("./report");
    expect(confidenceForms("low: fractions, non-monic factorising")).toEqual([
      { words: ["low:", "fractions,", "non-monic", "factorising"], hidden: 0 },
      { words: ["low:", "fractions"], hidden: 1 },
      { words: ["low:", "non-monic", "factorising"], hidden: 1 },
      { words: ["low"], hidden: 2 },
    ]);
  });
  it("reads the grid's own labels back", async () => {
    const { confidenceForms, confidenceLabel } = await import("./report");
    const label = confidenceLabel({ level: "low-when", leaves: ["algebra.equations.discriminant", "graphing.quadratics.features"] });
    expect(confidenceForms(label)[0].words).toEqual(["low:", "discriminant,", "graph", "features"]);
    expect(confidenceForms(label).at(-1)).toEqual({ words: ["low"], hidden: 2 });
  });
});
