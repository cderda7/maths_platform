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

  it("Q5 reads the turning point's height and the point as two lines, each a correct step", () => {
    expect(RECOGNITION.q5.slice(-2)).toEqual(["y = 4 - 8 - 5 = -9", "(2, -9)"]);
    expect(PROBLEMS.find((p) => p.id === "q5")!.solution.slice(-2).map((st) => st.label)).toEqual(["Height on the axis", "Turning point"]);
    expect(evaluateLine("q5", "y = 4 - 8 - 5 = -9").verdict).toBe("ok");
    expect(evaluateLine("q5", "(2, -9)").verdict).toBe("ok");
    for (const tex of RECOGNITION.q5) expect(tex).not.toContain("\\quad");
  });
  it("an unknown line is unclear, never wrong", () => {
    expect(evaluateLine("q1", "x = 42").verdict).toBe("unclear");
  });
});

describe("wrong lines are named for the teacher (ticket 148)", () => {
  it("every wrong entry carries a name of five words or fewer; ok entries none", async () => {
    const { EVALUATION } = await import("@/data/evaluation");
    for (const [pid, table] of Object.entries(EVALUATION))
      for (const [tex, v] of Object.entries(table)) {
        if (v.verdict === "wrong") {
          expect(v.name, `${pid} ${tex}`).toBeTruthy();
          expect(v.name!.split(/\s+/).length, `${pid} ${tex}: ${v.name}`).toBeLessThanOrEqual(5);
        } else expect(v.name, `${pid} ${tex}`).toBeUndefined();
      }
  });
});
