import { describe, expect, it } from "vitest";
import { ASSIGNMENT, PROBLEMS } from "@/data/assignment";
import { PS5_ASSIGNMENT } from "@/data/pset5/assignment";
import { DEMO_PASTE } from "@/data/draft-seed";
import { ADD_CONTEXT, CHANGE_SIGNS, REMOVE_REPEAT } from "@/data/review";
import type { DraftQuestion } from "./classroom";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { parseQuestion, splitPaste, stemText } from "./mathInput";
import { DEFAULT_GROUPS } from "@/data/groups";
import { assignmentGroupsOf, moveStudent } from "./seating";
import { applyReview, bankMatch, bankProblemsOf, countByDifficulty, defaultLabel, draftKey, heuristicLabel, initialReview, labelsOf, nextDifficulty, normTex, recommendationsFor, reviewFor, reviewNewSkills, type ReviewState } from "./review";

/** The demo paste as the create screen stores it. */
function pasted(): DraftQuestion[] {
  return splitPaste(DEMO_PASTE).map((text, i) => {
    const p = parseQuestion(text);
    return { id: `q${i + 1}`, text, stem: stemText(p.stem), tex: p.tex };
  });
}

describe("matching typed questions to the bank", () => {
  it("normalises spacing, braces and fraction commands away", () => {
    expect(normTex("x^{2} + 5x + 6 = 0")).toBe("x^2+5x+6=0");
    expect(normTex("\\tfrac{1}{3}x^2 + 2x + \\tfrac{8}{3}")).toBe(normTex("\\frac{1}{3}x^{2} + 2x + \\frac{8}{3}"));
    expect(normTex(null)).toBe("");
  });

  it("finds the bank problem behind every pasted question except the two draft-only ones", () => {
    const qs = pasted();
    expect(qs).toHaveLength(10);
    const matched = qs.map((q) => bankMatch(q.tex)?.id ?? null);
    expect(matched).toEqual([null, "q2", "q3", "q4", "q5", "q6", "q7", "q8", null, "q10"]);
  });
});

describe("labels", () => {
  it("gives every pasted question the bank's label, or the draft fixture's", () => {
    const labels = labelsOf(pasted());
    expect(Object.values(labels)).toEqual(["simple familiar", "simple familiar", "simple unfamiliar", "complex familiar", "simple unfamiliar", "complex unfamiliar", "complex familiar", "simple familiar", "simple unfamiliar", "complex unfamiliar"]);
    expect(countByDifficulty(Object.values(labels))).toEqual({ "simple familiar": 3, "simple unfamiliar": 3, "complex familiar": 2, "complex unfamiliar": 2 });
  });

  it("labels a question it does not know by a heuristic", () => {
    expect(heuristicLabel("Solve for x.", "x^{2} - 6x + 9 = 0")).toBe("simple familiar");
    expect(heuristicLabel("Solve, giving exact values.", "5x^{2} - 3x - 1 = 0")).toBe("complex familiar");
    expect(heuristicLabel("Find the turning point of the graph of", "y = 2x^{2} - 8x")).toBe("simple unfamiliar");
    expect(heuristicLabel("A farmer has 60 metres of fence and wants the largest rectangular paddock against a wall. Find the maximum area.", null)).toBe("complex unfamiliar");
    expect(defaultLabel({ stem: "Factorise.", tex: "\\frac{1}{2}x^{2} + x" })).toBe("complex familiar");
  });

  it("a tap on a pill rotates through the four labels in order and round again", () => {
    expect(nextDifficulty("simple familiar")).toBe("simple unfamiliar");
    expect(nextDifficulty("simple unfamiliar")).toBe("complex familiar");
    expect(nextDifficulty("complex familiar")).toBe("complex unfamiliar");
    expect(nextDifficulty("complex unfamiliar")).toBe("simple familiar");
  });

  it("keeps the teacher's relabel over the system's", () => {
    const qs = pasted();
    expect(labelsOf(qs, { q2: "complex unfamiliar" }).q2).toBe("complex unfamiliar");
    expect(labelsOf(qs, { q2: "complex unfamiliar" }).q1).toBe("simple familiar");
  });
});

describe("the review state and the draft it is about", () => {
  it("is fresh for a different draft but keeps the relabels and the pathway", () => {
    const qs = pasted();
    const stored: ReviewState = { ...initialReview(qs), step: "pathway", answers: { [CHANGE_SIGNS.id]: "accept" }, labels: { q2: "complex familiar" }, pathway: ["whole-class"] };
    expect(reviewFor(qs, stored)).toBe(stored);
    const edited = [...qs.slice(0, 9), { ...qs[9], text: qs[9].text + " Explain." }];
    expect(draftKey(edited)).not.toBe(draftKey(qs));
    const fresh = reviewFor(edited, stored);
    expect(fresh.step).toBe("difficulty");
    expect(fresh.answers).toEqual({});
    expect(fresh.labels).toEqual({ q2: "complex familiar" });
    expect(fresh.pathway).toEqual(["whole-class"]);
    expect(fresh.groups).toBeUndefined();
  });

  it("keeps the groups confirmed on the pathway step for a different draft too, and Create freezes them without touching the class defaults (ticket 188)", () => {
    const qs = pasted();
    const groups = moveStudent(DEFAULT_GROUPS, "jordan", "mint");
    const stored: ReviewState = { ...initialReview(qs), step: "pathway", groups };
    const edited = [...qs.slice(0, 9), { ...qs[9], text: qs[9].text + " Explain." }];
    expect(reviewFor(edited, stored).groups).toEqual(groups);
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", id: "pset-6", groups, title: "t", problemIds: ["q1"], pathway: ["individual", "group"], at: 1 });
    expect(assignmentGroupsOf(c, "pset-6").mint).toContain("jordan");
    expect(c.groups).toEqual(DEFAULT_GROUPS);
  });
  it("leaves the order out, so a reorder keeps the review's decisions (ticket 150)", () => {
    const qs = pasted();
    const reversed = [...qs].reverse();
    expect(draftKey(reversed)).toBe(draftKey(qs));
    const stored: ReviewState = { ...initialReview(qs), step: "recommendations", answers: { [CHANGE_SIGNS.id]: "accept" } };
    expect(reviewFor(reversed, stored)).toBe(stored);
  });

  it("is kept in the classroom store and cleared by null and by reset", () => {
    const review = initialReview(pasted());
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "review/set", review });
    expect(c.review).toEqual(review);
    expect(classroomReducer(c, { type: "review/set", review: null }).review).toBeNull();
    expect(classroomReducer(c, { type: "reset" }).review).toBeUndefined();
  });
});

describe("recommendations", () => {
  it("match the change and the removal by expression, and always add", () => {
    const active = recommendationsFor(pasted());
    expect(active.map((a) => [a.rec.id, a.targetId])).toEqual([
      [CHANGE_SIGNS.id, "q1"],
      [REMOVE_REPEAT.id, "q9"],
      [ADD_CONTEXT.id, undefined],
    ]);
  });

  it("follow the questions, not their positions, and hide when the target was not pasted", () => {
    const qs = pasted().reverse();
    expect(recommendationsFor(qs).map((a) => a.targetId)).toEqual(["q1", "q9", undefined]);
    const without = pasted().filter((q) => q.id !== "q9");
    expect(recommendationsFor(without).map((a) => a.rec.id)).toEqual([CHANGE_SIGNS.id, ADD_CONTEXT.id]);
  });

  it("applied: a changed question keeps its place, a removed one goes, the addition comes last", () => {
    const qs = pasted();
    const all = applyReview(qs, { labels: {}, answers: { [CHANGE_SIGNS.id]: "accept", [REMOVE_REPEAT.id]: "accept", [ADD_CONTEXT.id]: "accept" }, addition: 0 });
    expect(all).toHaveLength(10);
    expect(all[0]).toMatchObject({ id: "q1", tex: "x^{2} - 5x + 6 = 0", origin: "changed", difficulty: "simple familiar" });
    expect(all.find((q) => q.id === "q9")).toBeUndefined();
    expect(all[9]).toMatchObject({ origin: "added", tex: "h = -x^{2} + 6x", difficulty: "complex unfamiliar" });
    expect(bankProblemsOf(all).map((p) => p.id)).toEqual(PROBLEMS.map((p) => p.id));
    // Its New skills against Problem Set 5 are Problem Set 6's own (ticket 209); the teacher's change stands, kept to skills still in the set.
    const recent = [PS5_ASSIGNMENT];
    const inferred = reviewNewSkills(all, {}, recent);
    expect([...inferred.chosen].sort()).toEqual([...ASSIGNMENT.newSkills].sort());
    expect(inferred.changed).toBe(false);
    expect(inferred.candidates).toEqual(expect.arrayContaining([...ASSIGNMENT.newSkills, "algebra.expand-factor.binomial"]));
    const changed = reviewNewSkills(all, { newSkills: ["algebra.expand-factor.binomial", "calculus.differentiation.chain"] }, recent);
    expect(changed).toMatchObject({ chosen: ["algebra.expand-factor.binomial"], changed: true, inferred: inferred.inferred });
    expect(reviewNewSkills(all, { newSkills: [] }, recent).chosen).toEqual([]);
  });

  it("applied: kept as is leaves the set as typed, and Try another cycles the addition", () => {
    const qs = pasted();
    const kept = applyReview(qs, { labels: { q3: "complex familiar" }, answers: { [CHANGE_SIGNS.id]: "keep", [REMOVE_REPEAT.id]: "keep", [ADD_CONTEXT.id]: "keep" }, addition: 0 });
    expect(kept.map((q) => q.id)).toEqual(qs.map((q) => q.id));
    expect(kept[0]).toMatchObject({ tex: "x^{2} + 5x + 6 = 0", origin: "typed" });
    expect(kept[2].difficulty).toBe("complex familiar");
    expect(bankProblemsOf(kept).map((p) => p.id)).toEqual(["q2", "q3", "q4", "q5", "q6", "q7", "q8", "q10"]);
    const garden = applyReview(qs, { labels: {}, answers: { [ADD_CONTEXT.id]: "accept" }, addition: 1 });
    expect(garden[10].tex).toBe("w(w + 3) = 40");
    const wrapped = applyReview(qs, { labels: {}, answers: { [ADD_CONTEXT.id]: "accept" }, addition: 3 });
    expect(wrapped[10].tex).toBe("h = -x^{2} + 6x");
  });

  it("the created assignment carries the finalised questions beside the bank ids", () => {
    const final = applyReview(pasted(), { labels: {}, answers: { [CHANGE_SIGNS.id]: "accept", [REMOVE_REPEAT.id]: "accept", [ADD_CONTEXT.id]: "accept" }, addition: 0 });
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Set 4", problemIds: bankProblemsOf(final).map((p) => p.id), pathway: ["individual"], questions: final, at: 3 });
    expect(c.assignment?.questions).toHaveLength(10);
    expect(c.assignment?.problemIds).toHaveLength(10);
  });
});
