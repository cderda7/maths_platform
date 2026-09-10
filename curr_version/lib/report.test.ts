import { describe, expect, it } from "vitest";
import type { Confidence } from "@/data/types";
import { skipFixture } from "./demo";
import { outcomeColumns, problemOutcome, reportFacts } from "./report";
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

  it("reads the demo's reworked run: five right first try, the five reworked all right after individual review", () => {
    const by = labels(outcomeColumns(reworked, ["individual"], null));
    expect(by.first).toEqual(["Q4", "Q5", "Q6", "Q8", "Q9"]);
    expect(by.individual).toEqual(["Q1", "Q2", "Q3", "Q7", "Q10"]);
    expect(by.wrong).toEqual([]);
  });

  it("counts a problem the group's rework checked as correct after group review, once group review is in the pathway", () => {
    const { session: fixture, classroom } = skipFixture("report", 1_000_000);
    // Q7 without its own rework: still wrong on the student's side, resolved by the group.
    const session = { ...fixture, rework: { ...fixture.rework, q7: [] } };
    expect(classroom.group?.resolved).toContain("q7");
    const with_ = labels(outcomeColumns(session, ["individual", "group"], classroom.group));
    expect(with_.individual).toEqual(["Q1", "Q2", "Q3", "Q10"]);
    expect(with_.group).toEqual(["Q7"]);
    expect(with_.wrong).toEqual([]);
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
    const two: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "unit.u1.discriminant"] };
    const three: Confidence = { level: "low-when", leaves: ["algebra.number.fractions", "unit.u1.discriminant", "graphing.quadratics.sketch"] };
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

describe("confidenceLines", () => {
  it("keeps a plain word whole", async () => {
    const { confidenceLines } = await import("./report");
    expect(confidenceLines("confident")).toEqual({ head: "confident", skills: [] });
    expect(confidenceLines("low")).toEqual({ head: "low", skills: [] });
    expect(confidenceLines("—")).toEqual({ head: "—", skills: [] });
  });
  it("splits the named skills one per line after the head", async () => {
    const { confidenceLines } = await import("./report");
    expect(confidenceLines("low: fractions, non-monic factorising")).toEqual({ head: "low:", skills: ["fractions", "non-monic factorising"] });
  });
});
