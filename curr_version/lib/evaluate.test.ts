import { describe, expect, it } from "vitest";
import { RECOGNITION } from "@/data/recognition";
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

  it("the scripted run slips on factorising in Q1 and Q2 and on the null factor law in Q3", () => {
    const wrongs = Object.entries(RECOGNITION).flatMap(([pid, lines]) =>
      lines.map((tex) => evaluateLine(pid, tex)).filter((v) => v.verdict === "wrong").map((v) => [pid, v.verdict === "wrong" && v.subskill]),
    );
    expect(wrongs).toEqual([
      ["q1", "factoring"],
      ["q2", "factoring"],
      ["q3", "algebra"],
    ]);
  });

  it("an unknown line is unclear, never wrong", () => {
    expect(evaluateLine("q1", "x = 42").verdict).toBe("unclear");
  });
});
