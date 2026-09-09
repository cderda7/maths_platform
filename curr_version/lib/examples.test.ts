import { describe, expect, it } from "vitest";
import { boardExamples, bucketCounts, bucketOf, candidatesFor, problemsByStruggle, struggleCount, suggestExamples } from "./examples";
import { sessionAt } from "./session";

describe("board examples", () => {
  it("buckets by correct or the first wrong step's subskill", () => {
    expect(bucketOf("q2", ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \;\\text{or}\; x = 1"])).toBe("factoring");
    expect(bucketOf("q4", ["a = 3,\; b = -5,\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"])).toBe("correct");
    expect(bucketOf("q1", [])).toBe("correct");
  });

  it("every classmate who handed a problem in is a candidate; the live student joins once handed in, with their final version", () => {
    const none = candidatesFor("q2", null);
    expect(none.map((c) => c.studentId)).toEqual(["priya", "jordan", "amelia", "tomas", "zara", "liam"]);
    expect(candidatesFor("q4", null).map((c) => c.studentId)).toEqual(["priya", "amelia", "tomas", "zara"]); // jordan and liam never reached Q4
    expect(candidatesFor("q2", sessionAt("working")).some((c) => c.studentId === "sam")).toBe(false);
    const reworked = candidatesFor("q2", sessionAt("group-pass"));
    const sam = reworked.find((c) => c.studentId === "sam")!;
    expect(sam.bucket).toBe("correct"); // the rework fixed Q2
    expect(candidatesFor("q2", sessionAt("feedback")).find((c) => c.studentId === "sam")!.bucket).toBe("factoring");
  });

  it("counts buckets and struggles; problems sort by struggle", () => {
    const counts = bucketCounts(candidatesFor("q2", sessionAt("feedback")));
    expect(counts.get("factoring")).toBe(3); // sam, jordan, liam
    expect(counts.get("correct")).toBe(4);
    expect(struggleCount("q3", sessionAt("feedback"))).toBe(4); // sam, tomas, zara, liam
    expect(problemsByStruggle(sessionAt("feedback")).map((p) => p.problem.id)).toEqual(["q3", "q2", "q1", "q4"]);
  });

  it("suggests one correct example then one per error bucket, capped at three, at least two", () => {
    const q2 = suggestExamples(candidatesFor("q2", sessionAt("feedback")));
    expect(q2).toHaveLength(2);
    expect(q2[0].studentId).toBe("priya"); // first correct
    expect(q2[1].studentId).toBe("sam"); // first in the factoring bucket
    const allCorrect = suggestExamples(candidatesFor("q1", null)); // no classmate slipped on Q1
    expect(allCorrect).toHaveLength(2);
    const capped = suggestExamples(
      [
        { studentId: "a", name: "", problemId: "q1", lines: [], bucket: "correct" },
        { studentId: "b", name: "", problemId: "q1", lines: [], bucket: "algebra" },
        { studentId: "c", name: "", problemId: "q1", lines: [], bucket: "fractions" },
        { studentId: "d", name: "", problemId: "q1", lines: [], bucket: "factoring" },
        { studentId: "e", name: "", problemId: "q1", lines: [], bucket: "factoring" },
      ],
    );
    expect(capped.map((r) => r.studentId)).toEqual(["a", "d", "b"]); // largest error bucket first, then the rest, cap 3
  });

  it("the board view model carries letters, lines and counts, and nothing that names a student or marks a line", () => {
    const s = sessionAt("feedback");
    const refs = suggestExamples(candidatesFor("q2", s));
    const board = boardExamples(refs, "q2", s);
    expect(board.map((e) => e.letter)).toEqual(["A", "B"]);
    expect(board[0]).toEqual({ letter: "A", lines: expect.any(Array), count: 4, denominator: 7 });
    expect(board[1].count).toBe(3);
    for (const e of board) {
      expect(Object.keys(e).sort()).toEqual(["count", "denominator", "letter", "lines"]);
      expect(JSON.stringify(e)).not.toMatch(/Okonkwo|Raman|Whitlock|verdict|wrong/);
    }
  });
});
