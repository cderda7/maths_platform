import { DEMO_DRAFT_GOAL, DEMO_DRAFT_TITLE, DEMO_PASTE_LINES } from "@/data/draft-seed";
import { HOMEWORK_PASTE_LINES, homeworkTitle } from "@/data/homework-draft-seed";
import { draftFor, type AssignmentDraft, type ClassroomState, type DraftQuestion } from "./classroom";
import type { CreateKind } from "./createPipeline";
import { parseQuestion, stemText } from "./mathInput";
import { DEMO_TODAY, DUE_DEFAULT, type IsoDay } from "./dueDate";
import { nextHomework } from "./homeworks";

/**
 * The create screen's start (ticket 188). "+In-Class PSet" opens it blank: a greyed title and goal,
 * one inert ghost tile, and a pulsing "Generate simulated assignment". Generating stores the demo
 * teacher's set (`data/draft-seed`: the title, the goal, Q1–Q10 as typed) as the draft, flagged
 * `generated`, and from then on the screen is the editor over that draft, across reloads, until
 * Create clears the draft or Reset demo clears the classroom. Pure.
 */

/** Whether a kind's create screen shows the editor (the draft was generated) or the blank start. */
export const isGenerated = (c: ClassroomState | null | undefined, kind: CreateKind = "pset"): boolean => draftFor(c, kind)?.generated === true;

/** Typed lines read as the editor reads them, with ids `<prefix>-1` … */
const seeded = (lines: readonly string[], prefix: string): DraftQuestion[] =>
  lines.map((text, i) => {
    const p = parseQuestion(text);
    return { id: `${prefix}-${i + 1}`, text, stem: stemText(p.stem), tex: p.tex };
  });

/** The draft Generate stores: the seeded set with each line read as the editor reads a typed one, ids `seed-1` … `seed-10`, due on the default day (ticket 289). */
export function generatedDraft(at: number): AssignmentDraft {
  return { title: DEMO_DRAFT_TITLE, goal: DEMO_DRAFT_GOAL, questions: seeded(DEMO_PASTE_LINES, "seed"), updatedAt: at, generated: true, due: DUE_DEFAULT.pset };
}

/**
 * +Homework's Generate (ticket 291): the demo teacher's ten for the class's next homework (`data/homework-draft-seed.ts`),
 * titled by its number ("Homework 3"), ids `hw-seed-1` … `hw-seed-10`, due a week after the previous homework (`nextHomework`:
 * Mon 14 Sep). No goal: nothing shows a homework's goal to the students.
 */
export function generatedHomeworkDraft(c: ClassroomState | null | undefined, at: number): AssignmentDraft {
  const next = nextHomework(c);
  return { title: homeworkTitle(next.n), goal: "", questions: seeded(HOMEWORK_PASTE_LINES, "hw-seed"), updatedAt: at, generated: true, due: next.due };
}

/** A kind's Generate. */
export const generatedDraftFor = (kind: CreateKind, c: ClassroomState | null | undefined, at: number): AssignmentDraft => (kind === "homework" ? generatedHomeworkDraft(c, at) : generatedDraft(at));

/**
 * Where a kind's due date may start and where the picker starts: an in-class set from today, at the next lesson day
 * (ticket 289); a homework after the previous homework's due date and never before today, a week after that due date
 * (ticket 291, `nextHomework`: Homework 3 from Thu 10 Sep, starting at Mon 14 Sep).
 */
export function dueRange(kind: CreateKind, c: ClassroomState | null | undefined): { min: IsoDay; fallback: IsoDay } {
  if (kind === "pset") return { min: DEMO_TODAY, fallback: DUE_DEFAULT.pset };
  const next = nextHomework(c);
  return { min: next.min, fallback: next.due };
}
