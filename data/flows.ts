import type { FlowStage } from "./types";

/**
 * Scripted differentiated-pacing flows for two sample students working the same set.
 * Priya keeps moving; Jordan is nudged toward a factorising warm-up after Q2 — framed as
 * a natural next step rather than a remediation.
 */
export const FLOWS: Record<"priya" | "jordan", FlowStage[]> = {
  priya: [
    {
      problemId: "q1",
      confidence: "certain",
      evaluation: {
        problemId: "q1",
        steps: [
          { tex: "x^2 - 5x + 6 = 0", marker: "sound", label: "Standard form", subskill: "algebra" },
          { tex: "(x - 2)(x - 3) = 0", marker: "sound", label: "Factorised", subskill: "factoring", note: "Pair chosen with the right signs." },
          { tex: "x = 2 \\text{ or } x = 3", marker: "sound", label: "Null factor law", subskill: "roots" },
        ],
        summary: "Clean. Nothing to revisit here.",
        exercised: [
          { id: "factoring", status: "sound", note: "Monic, signs right." },
          { id: "roots", status: "sound", note: "Null factor law applied to a product equal to zero." },
        ],
        next: { kind: "advance", title: "On to Q2", body: "Same idea, but the x² term has a coefficient now.", targetProblemId: "q2" },
      },
    },
    {
      problemId: "q2",
      confidence: "fairly sure",
      evaluation: {
        problemId: "q2",
        steps: [
          { tex: "2x^2 + 7x - 4 = 0", marker: "sound", label: "Standard form", subskill: "algebra" },
          { tex: "ac = -8,\\quad 8 - 1 = 7", marker: "sound", label: "Found the split", subskill: "factoring" },
          { tex: "2x^2 + 8x - x - 4 = 0", marker: "sound", label: "Split the middle term", subskill: "factoring" },
          { tex: "2x(x + 4) - 1(x + 4) = 0", marker: "sound", label: "Grouped", subskill: "factoring" },
          { tex: "(2x - 1)(x + 4) = 0", marker: "sound", label: "Factorised", subskill: "factoring" },
          { tex: "x = \\tfrac{1}{2} \\text{ or } x = -4", marker: "sound", label: "Null factor law", subskill: "roots" },
        ],
        summary: "Full method shown, and the grouping step makes the factor pair checkable.",
        exercised: [
          { id: "factoring", status: "sound", note: "Non-monic by grouping." },
          { id: "roots", status: "sound", note: "" },
        ],
        next: { kind: "advance", title: "On to Q3", body: "This one looks like it's already factorised. Look closely at the right-hand side.", targetProblemId: "q3" },
      },
    },
    {
      problemId: "q3",
      confidence: "fairly sure",
      evaluation: {
        problemId: "q3",
        steps: [
          { tex: "x^2 - x - 6 = 6", marker: "sound", label: "Expanded first", subskill: "expansion", note: "You noticed the product wasn't equal to zero." },
          { tex: "x^2 - x - 12 = 0", marker: "sound", label: "Rearranged to standard form", subskill: "algebra" },
          { tex: "(x - 4)(x + 3) = 0", marker: "sound", label: "Factorised", subskill: "factoring" },
          { tex: "x = 4 \\text{ or } x = -3", marker: "sound", label: "Null factor law", subskill: "roots" },
        ],
        summary: "You resisted the shortcut. That is the whole point of this one.",
        exercised: [
          { id: "expansion", status: "sound", note: "" },
          { id: "algebra", status: "sound", note: "" },
          { id: "roots", status: "sound", note: "Recognised when the null factor law applies." },
        ],
        next: {
          kind: "stretch",
          title: "Skip ahead to Q6?",
          body: "You're moving quickly. Q6 is a different kind of question — it asks about k, not x. You can come back to Q4 and Q5 afterwards.",
          targetProblemId: "q6",
          reason: "Three sound problems in a row with full working.",
        },
      },
    },
    {
      problemId: "q6",
      confidence: "a bit unsure",
      evaluation: {
        problemId: "q6",
        steps: [
          { tex: "b^2 - 4ac = k^2 - 36", marker: "sound", label: "Discriminant in terms of k", subskill: "graphing" },
          { tex: "k^2 - 36 = 0", marker: "sound", label: "Set it to zero for one root", subskill: "roots" },
          { tex: "k = 6", marker: "shaky", label: "Solved for k", subskill: "algebra", note: "k² = 36 has two solutions. What is the other one?" },
          { tex: "\\text{Graph touches the } x\\text{-axis}", marker: "sound", label: "Interpretation", subskill: "graphing" },
        ],
        summary: "The reasoning about the discriminant is exactly right. One root of k² = 36 went missing.",
        exercised: [
          { id: "graphing", status: "sound", note: "Linked discriminant to a touch, not a crossing." },
          { id: "algebra", status: "shaky", note: "Dropped the negative square root." },
        ],
        next: { kind: "finish", title: "Good place to pause", body: "You said 'a bit unsure' on that one, and the working shows why: the idea was solid, the last algebra step was rushed. Q4 and Q5 are still there when you come back." },
      },
    },
  ],
  jordan: [
    {
      problemId: "q1",
      confidence: "certain",
      evaluation: {
        problemId: "q1",
        steps: [
          { tex: "x^2 - 5x + 6 = 0", marker: "sound", label: "Standard form", subskill: "algebra" },
          { tex: "(x - 2)(x - 3) = 0", marker: "sound", label: "Factorised", subskill: "factoring" },
          { tex: "x = 2 \\text{ or } x = 3", marker: "sound", label: "Null factor law", subskill: "roots" },
        ],
        summary: "Clean. Nothing to revisit here.",
        exercised: [
          { id: "factoring", status: "sound", note: "Monic, signs right." },
          { id: "roots", status: "sound", note: "" },
        ],
        next: { kind: "advance", title: "On to Q2", body: "Same idea, but the x² term has a coefficient now.", targetProblemId: "q2" },
      },
    },
    {
      problemId: "q2",
      confidence: "certain",
      evaluation: {
        problemId: "q2",
        steps: [
          { tex: "2x^2 + 7x - 4 = 0", marker: "sound", label: "Standard form", subskill: "algebra" },
          {
            tex: "(2x + 4)(x - 1) = 0",
            marker: "slip",
            label: "Factorised",
            subskill: "factoring",
            note: "Try expanding this back. What do you get for the x term?",
          },
          { tex: "2x + 4 = 0 \\text{ or } x - 1 = 0", marker: "sound", label: "Null factor law", subskill: "roots", note: "Right move — this step is sound, it's just built on the line above." },
          { tex: "x = -2 \\text{ or } x = 1", marker: "sound", label: "Solved each factor", subskill: "algebra" },
        ],
        summary:
          "The method is right and the last two steps are correct given the factors. The factor pair was guessed rather than checked — expanding back would have caught it.",
        exercised: [
          { id: "factoring", status: "slip", note: "Non-monic pair not checked by expanding." },
          { id: "roots", status: "sound", note: "Null factor law applied correctly." },
          { id: "algebra", status: "sound", note: "" },
        ],
        next: {
          kind: "sidestep",
          title: "A quick one before Q3",
          body: "Q3 leans on the same factorising move as Q2. Here's a short warm-up that has the expand-back check built in — it'll make Q3 quicker.",
          targetProblemId: "p-factor",
          reason: "Non-monic factorising slip; check step skipped. Framed as preparation for Q3, not as remediation.",
        },
      },
    },
    {
      problemId: "p-factor",
      confidence: "fairly sure",
      evaluation: {
        problemId: "p-factor",
        steps: [
          { tex: "ac = -6,\\quad 6 - 1 = 5", marker: "sound", label: "Found the split", subskill: "factoring" },
          { tex: "2x^2 + 6x - x - 3", marker: "sound", label: "Split the middle term", subskill: "factoring" },
          { tex: "(2x - 1)(x + 3)", marker: "sound", label: "Grouped and factorised", subskill: "factoring" },
          { tex: "\\text{Check: } 2x^2 + 6x - x - 3 \\;\\checkmark", marker: "sound", label: "Expanded back", subskill: "expansion", note: "This is the step that was missing in Q2." },
        ],
        summary: "The ac method plus the expand-back check. That is the whole routine.",
        exercised: [
          { id: "factoring", status: "sound", note: "Non-monic by grouping, checked." },
          { id: "expansion", status: "sound", note: "" },
        ],
        next: { kind: "advance", title: "Now Q3", body: "It looks factorised already. Look closely at the right-hand side before you do anything.", targetProblemId: "q3" },
      },
    },
    {
      problemId: "q3",
      confidence: "a bit unsure",
      evaluation: {
        problemId: "q3",
        steps: [
          { tex: "x^2 - x - 6 = 6", marker: "sound", label: "Expanded first", subskill: "expansion", note: "You noticed the product wasn't equal to zero." },
          { tex: "x^2 - x - 12 = 0", marker: "sound", label: "Rearranged to standard form", subskill: "algebra" },
          { tex: "(x - 4)(x + 3) = 0", marker: "sound", label: "Factorised", subskill: "factoring" },
          { tex: "\\text{Check: } x^2 + 3x - 4x - 12 \\;\\checkmark", marker: "sound", label: "Expanded back", subskill: "expansion" },
          { tex: "x = 4 \\text{ or } x = -3", marker: "sound", label: "Null factor law", subskill: "roots" },
        ],
        summary: "You carried the check across from the warm-up without being asked. Sound all the way through.",
        exercised: [
          { id: "expansion", status: "sound", note: "" },
          { id: "factoring", status: "sound", note: "Checked this time." },
          { id: "roots", status: "sound", note: "" },
        ],
        next: { kind: "finish", title: "Good place to pause", body: "You said 'a bit unsure' and then got it right, including the check. Q4 uses the quadratic formula — the tutor is there if you want to talk it through." },
      },
    },
  ],
};
