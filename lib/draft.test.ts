import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { DEMO_PASTE_LINES } from "@/data/draft-seed";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { generatedDraft, isGenerated } from "./draft";
import { parseQuestion, stemText } from "./mathInput";

describe("the create screen's blank start and Generate (ticket 188)", () => {
  it("a fresh classroom, and a draft stored without the flag, open blank", () => {
    expect(isGenerated(INITIAL_CLASSROOM)).toBe(false);
    expect(isGenerated(null)).toBe(false);
    expect(isGenerated({ ...INITIAL_CLASSROOM, draft: { title: "t", questions: [], updatedAt: 1 } })).toBe(false);
  });

  it("Generate stores the seeded set: the title, the goal, Q1–Q10 read as typed, flagged generated", () => {
    const d = generatedDraft(42);
    expect(d.title).toBe("Problem Set 2 — Roots of a quadratic");
    expect(d.goal).toBe(ASSIGNMENT.goal);
    expect(d.updatedAt).toBe(42);
    expect(d.generated).toBe(true);
    expect(d.questions.map((q) => q.id)).toEqual(DEMO_PASTE_LINES.map((_, i) => `seed-${i + 1}`));
    for (const [i, q] of d.questions.entries()) {
      const p = parseQuestion(DEMO_PASTE_LINES[i]);
      expect(q).toEqual({ id: `seed-${i + 1}`, text: DEMO_PASTE_LINES[i], stem: stemText(p.stem), tex: p.tex });
    }
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "draft/set", draft: d });
    expect(isGenerated(c)).toBe(true);
  });

  it("Reset demo and Create both return the screen to blank", () => {
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "draft/set", draft: generatedDraft(1) });
    expect(isGenerated(classroomReducer(c, { type: "reset" }))).toBe(false);
    expect(isGenerated(classroomReducer(c, { type: "draft/set", draft: null }))).toBe(false);
  });
});
