import { describe, expect, it } from "vitest";
import { PROBLEMS } from "@/data/assignment";
import { DIAGNOSTICS } from "@/data/diagnostic";
import { customQuestion, diagnosticFor, isCorrect, pushBelongsTo, questionFor } from "./diagnostic";

describe("diagnostic correctness", () => {
  it("knows the right option of a fixture question", () => {
    expect(isCorrect("d-factor-check", "b")).toBe(true);
    expect(isCorrect("d-factor-check", "a")).toBe(false);
    expect(isCorrect("nope", "b")).toBe(false);
  });

  it("a teacher-written question travels with the push and is judged by its own key", () => {
    const q = customQuestion("Which is larger", "", ["\\tfrac{1}{3}", "\\tfrac{1}{4}", "", ""], "a", 7)!;
    expect(q.id).toBe("custom-7");
    expect(q.options.map((o) => o.id)).toEqual(["a", "b"]);
    expect(isCorrect(q.id, "a", q)).toBe(true);
    expect(isCorrect(q.id, "b", q)).toBe(false);
    expect(isCorrect(q.id, "a")).toBe(false); // not a fixture
    expect(questionFor(q.id, q)).toBe(q);
  });

  it("needs a stem, two options and a correct one among them", () => {
    expect(customQuestion("", "", ["a", "b"], "a")).toBeNull();
    expect(customQuestion("Q", "", ["a", "", "", ""], "a")).toBeNull();
    expect(customQuestion("Q", "", ["a", "b", "", ""], "c")).toBeNull();
    expect(customQuestion("Q", "", ["", "b", "c", ""], "b")?.options.map((o) => o.id)).toEqual(["b", "c"]);
  });

  it("a question written on the mistake view is filed under its problem; the class view's carries none", () => {
    expect(customQuestion("Q", "", ["a", "b"], "a", 1, "q3")?.problemId).toBe("q3");
    expect(customQuestion("Q", "", ["a", "b"], "a", 1)).not.toHaveProperty("problemId");
  });
});

describe("one suggested check per problem", () => {
  it("every problem of the assignment has its own fixture, well formed", () => {
    for (const p of PROBLEMS) {
      const d = diagnosticFor(p.id);
      expect(d.problemId, p.id).toBe(p.id);
      expect(d.options.length, d.id).toBeGreaterThanOrEqual(2);
      expect(d.options.some((o) => o.id === d.correct), d.id).toBe(true);
      expect(new Set(d.options.map((o) => o.id)).size, d.id).toBe(d.options.length);
    }
    expect(new Set(DIAGNOSTICS.map((d) => d.id)).size).toBe(DIAGNOSTICS.length);
  });

  it("the class view's example stays the first fixture, and an unknown problem falls back to it", () => {
    expect(DIAGNOSTICS[0].id).toBe("d-factor-check");
    expect(diagnosticFor("q2")).toBe(DIAGNOSTICS[0]);
    expect(diagnosticFor("q99")).toBe(DIAGNOSTICS[0]);
  });
});

describe("which panel a push belongs to", () => {
  const q3 = diagnosticFor("q3");
  const q2 = diagnosticFor("q2");

  it("a fixture push belongs to the panel showing that fixture, wherever it was sent from", () => {
    expect(pushBelongsTo({ questionId: q3.id }, q3, "q3")).toBe(true);
    expect(pushBelongsTo({ questionId: q3.id }, q2, "q2")).toBe(false);
    // The class view shows the q2 fixture: its push shows on both the class view and Q2's panel.
    expect(pushBelongsTo({ questionId: q2.id }, q2)).toBe(true);
    expect(pushBelongsTo({ questionId: q2.id }, q2, "q2")).toBe(true);
  });

  it("a teacher-written push belongs to the problem it was written under, the class view's to no problem", () => {
    const underQ3 = customQuestion("Q", "", ["a", "b"], "a", 1, "q3")!;
    const onClassView = customQuestion("Q", "", ["a", "b"], "a", 1)!;
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q3, "q3")).toBe(true);
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q2, "q2")).toBe(false);
    expect(pushBelongsTo({ questionId: underQ3.id, question: underQ3 }, q2)).toBe(false);
    expect(pushBelongsTo({ questionId: onClassView.id, question: onClassView }, q2)).toBe(true);
    expect(pushBelongsTo({ questionId: onClassView.id, question: onClassView }, q2, "q2")).toBe(false);
  });
});
