import { describe, expect, it } from "vitest";
import { CLASSMATES } from "@/data/classmates";
import { boardExamples, bucketCounts, bucketOf, candidatesFor, CORRECT, exampleOf, mistakeOf, optionOf, optionsFor, problemsByStruggle, struggleCount, suggestExamples, type Bucket, type Candidate, type PickerContext } from "./examples";
import { sessionAt } from "./session";

describe("board examples", () => {
  it("buckets by correct or the first wrong step's subskill", () => {
    expect(bucketOf("q2", ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \;\\text{or}\; x = 1"])).toBe("algebra.expand-factor.nonmonic");
    expect(bucketOf("q4", ["a = 3,\; b = -5,\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"])).toBe("correct");
    expect(bucketOf("q1", [])).toBe("correct");
    expect(mistakeOf("q2", ["2x^2 + 7x - 4 = 0", "(2x + 4)(x - 1) = 0", "x = -2 \\;\\text{or}\\; x = 1"])).toBe("(2x + 4)(x - 1) = 0");
    expect(mistakeOf("q1", [])).toBe(CORRECT);
  });

  it("every classmate who handed a problem in is a candidate; the live student joins once handed in, with their final version", () => {
    const none = candidatesFor("q2", null);
    // Everyone who reached Q2, in fixture order: the six full classmates first, then the lightweight thirteen.
    expect(none.map((c) => c.studentId).slice(0, 6)).toEqual(["priya", "jordan", "amelia", "tomas", "zara", "liam"]);
    expect(none).toHaveLength(CLASSMATES.filter((c) => c.done >= 2).length);
    const q4 = candidatesFor("q4", null).map((c) => c.studentId);
    expect(q4.slice(0, 4)).toEqual(["priya", "amelia", "tomas", "zara"]); // jordan and liam never reached Q4
    expect(q4).not.toContain("jordan");
    expect(q4).not.toContain("liam");
    expect(candidatesFor("q2", sessionAt("working")).some((c) => c.studentId === "sam")).toBe(false);
    const reworked = candidatesFor("q2", sessionAt("group"));
    const sam = reworked.find((c) => c.studentId === "sam")!;
    expect(sam.bucket).toBe("correct"); // the rework fixed Q2
    expect(candidatesFor("q2", sessionAt("feedback")).find((c) => c.studentId === "sam")!.bucket).toBe("algebra.expand-factor.nonmonic");
  });

  it("counts buckets and struggles; problems sort by struggle", () => {
    const counts = bucketCounts(candidatesFor("q2", sessionAt("feedback")));
    // sam + jordan, liam, mia, oliver, sofia guessed a pair; finn's factors were right and he lost a sign solving one (linear equations).
    const guessedQ2 = 1 + CLASSMATES.filter((c) => c.wrong.includes("q2") && c.id !== "finn").length;
    expect(counts.get("algebra.expand-factor.nonmonic")).toBe(guessedQ2);
    expect(counts.get("algebra.equations.linear")).toBe(1);
    expect(counts.get("correct")).toBe(CLASSMATES.filter((c) => c.done >= 2 && !c.wrong.includes("q2")).length);
    expect(struggleCount("q3", sessionAt("feedback"))).toBe(1 + CLASSMATES.filter((c) => c.wrong.includes("q3")).length);
    const order = problemsByStruggle(sessionAt("feedback")).map((p) => p.problem.id);
    expect(order.slice(0, 2)).toEqual(["q7", "q2"]); // q7 draws the most slips in the class of twenty; q2 and q3 tie, q2 first in set order
    expect(order).toHaveLength(10);
  });

  it("suggests the correct working then the most common exact mistakes, capped at three, at least two (ticket 148)", () => {
    const q2 = suggestExamples(candidatesFor("q2", sessionAt("feedback")));
    expect(q2).toHaveLength(3);
    expect(q2[0].studentId).toBe("priya"); // the correct working: the model solution every right classmate shares
    // The guessed pair: sam and five classmates share the mistake; the five wrote the same three lines, so the example is theirs.
    expect(q2[1].studentId).toBe("jordan");
    expect(q2[2].studentId).toBe("finn"); // alone on the sign lost solving a factor
    const q6 = suggestExamples(candidatesFor("q6", null)); // one classmate slipped on Q6: one correct, one wrong
    expect(q6).toHaveLength(2);
    const cand = (studentId: string, mistake: string, bucket: Bucket = mistake ? "algebra.equations.linear" : "correct"): Candidate => ({ studentId, name: studentId, problemId: "q1", lines: [mistake || "ok"], bucket, mistake });
    const capped = suggestExamples([cand("a", ""), cand("b", "m1"), cand("c", "m2"), cand("d", "m3"), cand("e", "m3")]);
    expect(capped.map((r) => r.studentId)).toEqual(["a", "d", "b"]); // the biggest mistake first, then the rest in order, cap 3
    const oneWrong = suggestExamples([cand("a", ""), cand("b", ""), cand("c", "m1")]);
    expect(oneWrong.map((r) => r.studentId)).toEqual(["a", "c"]);
  });

  it("the picker's options: correct first, then exact mistakes by count, identical workings largest first, the live student first in his column", () => {
    const s = sessionAt("feedback");
    const options = optionsFor(candidatesFor("q7", s));
    expect(options[0].key).toBe(CORRECT);
    expect(options[0].name).toBe("correct");
    expect(options.slice(1).map((o) => [o.name, o.count])).toEqual([
      ["scaled two of three terms", 7], // six classmates and Sam
      ["tripled, third never restored", 4],
      ["pair adds to nine", 2],
    ]);
    for (const o of options.slice(1)) {
      expect(o.leaf).toBeTruthy();
      expect(o.columns.map((c) => c.students.length)).toEqual([...o.columns.map((c) => c.students.length)].sort((x, y) => y - x));
      expect(o.count).toBe(o.columns.reduce((n, c) => n + c.students.length, 0));
    }
    const q2 = optionsFor(candidatesFor("q2", s));
    const guessed = q2.find((o) => o.name === "guessed pair, not expanded back")!;
    expect(guessed.count).toBe(6);
    expect(guessed.columns).toHaveLength(2); // the five classmates' three lines, and sam's own route
    expect(guessed.columns[0].students).toHaveLength(5);
    expect(optionOf(q2, "sam")).toBe(guessed);
    expect(exampleOf(guessed).studentId).toBe("jordan");
  });

  it("a mistake on the unit's focus leaf is badged; one the group worked through sinks and is not suggested unless needed", () => {
    const s = sessionAt("feedback");
    const q3 = candidatesFor("q3", s);
    const plain = optionsFor(q3, { unit: 1 });
    const nfl = plain.find((o) => o.name === "null factor law without zero")!;
    expect(nfl.unitFocus).toBe(true); // the wrong line is tagged unit.u1.nfl
    expect(plain.find((o) => o.key === CORRECT)!.unitFocus).toBe(false);
    expect(optionsFor(q3, { unit: 2 }).find((o) => o.name === nfl.name)!.unitFocus).toBe(false);
    // Sam's group (sam, jordan, zara, liam) checked Q3 correct in group review: zara's and liam's mistakes on Q3 are fixed.
    const group = { members: ["sam", "jordan", "zara", "liam"], resolved: ["q3"] } as unknown as NonNullable<PickerContext["group"]>;
    const fixed = optionsFor(q3, { group });
    expect(fixed.find((o) => o.name === nfl.name)!.fixedInGroup).toBe(true); // zara is on it
    expect(fixed[fixed.length - 1].name).toBe(nfl.name); // sinks to the end
    expect(suggestExamples(q3, 3, { group }).map((r) => r.studentId)).not.toContain(exampleOf(nfl).studentId);
    // With nothing else to show, a fixed mistake still makes the second example.
    const only = q3.filter((c) => c.mistake === CORRECT || c.mistake === nfl.key);
    expect(suggestExamples(only, 3, { group })).toHaveLength(2);
    expect(optionsFor(q3, { group: { ...group, resolved: [] } }).every((o) => !o.fixedInGroup)).toBe(true);
  });

  it("the board view model carries letters, lines and counts, and nothing that names a student or marks a line", () => {
    const s = sessionAt("feedback");
    const refs = suggestExamples(candidatesFor("q2", s));
    const board = boardExamples(refs, "q2", s);
    expect(board.map((e) => e.letter)).toEqual(["A", "B", "C"]);
    const handedIn = 1 + CLASSMATES.filter((c) => c.done >= 2).length;
    const wrongQ2 = 1 + CLASSMATES.filter((c) => c.wrong.includes("q2")).length;
    expect(board[0]).toEqual({ letter: "A", lines: expect.any(Array), count: handedIn - wrongQ2, denominator: handedIn });
    expect(board[1].count).toBe(wrongQ2 - 1); // the guessed pair
    expect(board[2].count).toBe(1); // finn's sign
    for (const e of board) {
      expect(Object.keys(e).sort()).toEqual(["count", "denominator", "letter", "lines"]);
      expect(JSON.stringify(e)).not.toMatch(/Okonkwo|Raman|Whitlock|verdict|wrong/);
    }
  });
});

describe("marked view", () => {
  it("marks wrong steps red and curated standouts blue, by run kind", async () => {
    const { lineMarks } = await import("./examples");
    expect(lineMarks("q1", ["x^2 - 5x + 6 = 0", "(x + 2)(x + 3) = 0", "x = -2 \\;\\text{or}\\; x = -3"])).toEqual([null, "wrong", null]);
    const q4 = lineMarks("q4", ["a = 3,\\; b = -5,\\; c = -1", "b^2 - 4ac = 25 + 12 = 37", "x = \\dfrac{5 \\pm \\sqrt{37}}{6}"]);
    expect(q4.filter((m) => m === "standout").length).toBeGreaterThan(0);
    expect(q4).not.toContain("wrong");
  });
});
