import { DEMO_DRAFT_GOAL, DEMO_DRAFT_TITLE, DEMO_PASTE_LINES } from "@/data/draft-seed";
import type { AssignmentDraft, ClassroomState } from "./classroom";
import { parseQuestion, stemText } from "./mathInput";

/**
 * The create screen's start (ticket 188). "New assignment" opens it blank: a greyed title and goal,
 * one inert ghost tile, and a pulsing "Generate simulated assignment". Generating stores the demo
 * teacher's set (`data/draft-seed`: the title, the goal, Q1–Q10 as typed) as the draft, flagged
 * `generated`, and from then on the screen is the editor over that draft, across reloads, until
 * Create clears the draft or Reset demo clears the classroom. Pure.
 */

/** Whether the create screen shows the editor (the draft was generated) or the blank start. */
export const isGenerated = (c: ClassroomState | null | undefined): boolean => c?.draft?.generated === true;

/** The draft Generate stores: the seeded set with each line read as the editor reads a typed one, ids `seed-1` … `seed-10`. */
export function generatedDraft(at: number): AssignmentDraft {
  const questions = DEMO_PASTE_LINES.map((text, i) => {
    const p = parseQuestion(text);
    return { id: `seed-${i + 1}`, text, stem: stemText(p.stem), tex: p.tex };
  });
  return { title: DEMO_DRAFT_TITLE, goal: DEMO_DRAFT_GOAL, questions, updatedAt: at, generated: true };
}
