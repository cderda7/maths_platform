import { describe, expect, it } from "vitest";
import { RECOGNITION, RECOGNITION_REWORK } from "@/data/recognition";
import { PROBLEMS } from "@/data/assignment";
import { evaluateLine } from "./evaluate";

describe("scripted evaluation", () => {
  it("knows every line the pad can read, so nothing in the scripted run is 'unclear'", () => {
    for (const [pid, lines] of Object.entries(RECOGNITION)) {
      for (const tex of lines) expect(evaluateLine(pid, tex).verdict, `${pid}: ${tex}`).not.toBe("unclear");
    }
  });

  it("knows every model-solution step", () => {
    for (const p of PROBLEMS) {
      for (const st of p.solution) expect(evaluateLine(p.id, st.tex).verdict, `${p.id}: ${st.tex}`).toBe("ok");
    }
  });

  it("the scripted run slips on monic then non-monic factorising, the null factor law, fractions and a justification", () => {
    const wrongs = Object.entries(RECOGNITION).flatMap(([pid, lines]) =>
      lines.map((tex) => evaluateLine(pid, tex)).filter((v) => v.verdict === "wrong").map((v) => [pid, v.verdict === "wrong" && v.tags[0].leaf]),
    );
    expect(wrongs).toEqual([
      ["q1", "algebra.expand-factor.monic"],
      ["q2", "algebra.expand-factor.nonmonic"],
      ["q3", "unit.u1.nfl"],
      ["q7", "algebra.number.fractions"],
      ["q10", "reasoning.justify.formal"],
    ]);
  });

  it("the rework path corrects every slip but Q7, which slips again on the fraction: every term scaled this time, the third never put back", () => {
    const wrongs = Object.entries(RECOGNITION_REWORK).flatMap(([pid, lines]) =>
      lines.map((tex) => evaluateLine(pid, tex)).filter((v) => v.verdict === "wrong").map((v) => [pid, v.verdict === "wrong" && v.tags[0].leaf]),
    );
    expect(wrongs).toEqual([
      ["q4", "algebra.equations.quadratic"],
      ["q7", "algebra.number.fractions"],
    ]);
    expect(RECOGNITION_REWORK.q7[0]).not.toBe(RECOGNITION.q7[0]);
    const v = evaluateLine("q7", RECOGNITION_REWORK.q7[0]);
    expect(v.verdict === "wrong" && v.label).toBe("Multiplied through by 3");
  });

  it("the one compounded line in the scripted run is Q9's turning point without its height", () => {
    const compounded = Object.entries(RECOGNITION).flatMap(([pid, lines]) =>
      lines
        .filter((tex) => {
          const v = evaluateLine(pid, tex);
          return v.verdict !== "unclear" && v.compounds;
        })
        .map(() => pid),
    );
    expect(compounded).toEqual(["q9"]);
  });

  it("an unknown line is unclear, never wrong", () => {
    expect(evaluateLine("q1", "x = 42").verdict).toBe("unclear");
  });
});
