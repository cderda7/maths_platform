import { describe, expect, it } from "vitest";
import { customQuestion, isCorrect, questionFor } from "./diagnostic";

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
});
