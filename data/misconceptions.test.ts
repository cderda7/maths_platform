import { describe, expect, it } from "vitest";
import { FINISHED_SETS } from "@/lib/finishedSets";
import { FALLBACK_STEP, PROBLEM_DIAGNOSTICS } from "./diagnostic";
import { EVALUATION } from "./evaluation";
import { isMisconceptionId, MISCONCEPTION_IDS, MISCONCEPTIONS, misconceptionName } from "./misconceptions";

/** Every evaluation table: the live set's and each finished set's. */
const TABLES = [EVALUATION, ...FINISHED_SETS.map((s) => s.evaluation)];

describe("the misconception taxonomy (ticket 299)", () => {
  it("keeps its ids: an id is never renamed or removed, only added (counts gathered under it would change meaning)", () => {
    expect(MISCONCEPTION_IDS).toEqual(expect.arrayContaining([
      "pair-sum-wrong", "brackets-dont-expand", "check-wrong", "pair-signs-swapped", "factor-missing",
      "root-vertex-sign", "minus-not-distributed", "product-sign", "collecting-sign", "rearranging-sign", "solving-sign",
      "partial-distribution", "power-on-part", "squared-termwise", "middle-not-doubled", "square-sign", "square-vs-difference",
      "divided-wrong-way", "denominator-dropped", "not-cancelled", "root-not-taken", "square-left-in-root", "roots-added", "rationalise-wrong-factor",
      "nfl-without-zero", "root-missing", "formula-2a", "minus-b-dropped", "square-not-balanced", "halving-wrong", "discriminant-root-count",
      "x-for-y", "vertex-y-wrong", "concavity-sign", "graph-signs", "context-not-checked", "question-not-answered",
      // Ticket 302: the diagnostics' distractors.
      "pair-product-wrong", "term-lost-rearranging", "wrong-inverse", "coefficients-wrong", "discriminant-formula", "wrong-feature", "substitution-wrong",
    ]));
    for (const id of MISCONCEPTION_IDS) expect(id, id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    expect(isMisconceptionId("pair-sum-wrong")).toBe(true);
    expect(isMisconceptionId("toString")).toBe(false);
  });

  it("names each once, in five words or fewer, saying what is wrong and never what the student is supposed to have done", () => {
    const names = MISCONCEPTION_IDS.map(misconceptionName);
    expect(new Set(names).size).toBe(names.length);
    for (const id of MISCONCEPTION_IDS) {
      const { name, about } = MISCONCEPTIONS[id];
      expect(name.split(/\s+/).length, name).toBeLessThanOrEqual(5);
      expect(name, id).not.toMatch(/guess|rush|slip|careless|forg[eo]t|tried|trying|copied|misread|confus/i);
      expect(about, id).toMatch(/^[A-Z(√−].*\.$/);
    }
  });

  it("is what the tables and diagnostics use: every wrong line of every set points at one, and every one is on a wrong line or a distractor (ticket 302)", () => {
    const used = new Set<string>();
    for (const table of TABLES)
      for (const [pid, lines] of Object.entries(table))
        for (const [tex, v] of Object.entries(lines)) {
          if (v.verdict !== "wrong") continue;
          expect(v.misconception && isMisconceptionId(v.misconception), `${pid} ${tex}`).toBe(true);
          used.add(v.misconception!);
        }
    for (const s of [...PROBLEM_DIAGNOSTICS.flatMap((p) => p.steps), FALLBACK_STEP]) for (const o of s.options) if (o.misconception) used.add(o.misconception);
    expect(MISCONCEPTION_IDS.filter((id) => !used.has(id))).toEqual([]);
  });
});
