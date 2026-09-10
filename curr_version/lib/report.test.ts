import { describe, expect, it } from "vitest";
import type { Confidence } from "@/data/types";
import { reportFacts } from "./report";
import { sessionAt } from "./session";

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
