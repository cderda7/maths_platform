import { BEFORE_HAND_IN_STAGES } from "@/data/types";
import { storySet, STORY } from "@/data/story";
import { assignmentBundle, assignmentIds, LIVE_ASSIGNMENT_ID } from "./assignments";
import type { ClassroomState } from "./classroom";
import { currentClassStage } from "./classStage";
import { dueOrder } from "./dueDate";
import type { StudentSession } from "./session";

/**
 * Sam's Classroom (ticket 264), his landing on the iPad: every set in his Classroom under To do,
 * Missing or Completed. Only Sam has one (FUTURE_FEATURES, "A Classroom for every student").
 *
 * - A finished set (Problem Sets 1–5) is Completed when the story (`data/story.ts`) has him handing
 *   something in, Missing when it has him handing in nothing.
 * - The live set (Problem Set 6) is in his Classroom only once the teacher has sent it (Create, or a
 *   presenter skip), the same test as the teacher's Classroom (`assignmentIds`). Sent, it is To do
 *   until his report goes with its reflection (Completed), or Missing when the lesson is over
 *   (every stage of the pathway over) without his hand-in.
 *
 * Pure: derived from the classroom, his session and the clock, so every tab agrees.
 */
export type StudentSection = "todo" | "missing" | "completed";

export const STUDENT_SECTIONS: readonly StudentSection[] = ["todo", "missing", "completed"];

export const STUDENT_SECTION_LABEL: Record<StudentSection, string> = { todo: "To do", missing: "Missing", completed: "Completed" };

/** What an empty section says. */
export const STUDENT_SECTION_EMPTY: Record<StudentSection, string> = { todo: "Nothing to do right now.", missing: "Nothing missing.", completed: "Nothing completed yet." };

/** Sam's Classroom on the iPad, and a set opened from it: the student app. */
export const STUDENT_CLASSROOM_HREF = "/student";
export const studentSetHref = (id: string): string => `/student/a/${id}`;
/** His read-only report on a Completed set (ticket 287), the Completed card's press. */
export const studentReportHref = (id: string): string => `/student/a/${id}/report`;

/** The section a set is in for Sam, or null when it is not in his Classroom (Problem Set 6 before it is sent, an unknown id). */
export function studentSection(id: string, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): StudentSection | null {
  if (!assignmentIds(c).includes(id)) return null;
  if (id === LIVE_ASSIGNMENT_ID) {
    if (session?.reportSent) return "completed";
    const handedIn = !!session && !BEFORE_HAND_IN_STAGES.includes(session.stage);
    return currentClassStage(c, session, now) === null && !handedIn ? "missing" : "todo";
  }
  const n = storySet(id)?.n;
  if (n === undefined) return null;
  return (STORY.sam.done[n - 1] ?? 0) > 0 ? "completed" : "missing";
}

export interface StudentSetCard {
  id: string;
  /** As the teacher named the set: "Problem Set 6 — Roots of a quadratic". */
  name: string;
  due: string;
  section: StudentSection;
  /**
   * The To do card's one action: `start` while his run is at its start, `continue` once he is in it; it
   * opens the set (`studentSetHref`). Null on Missing and Completed cards.
   */
  action: "start" | "continue" | null;
  /**
   * Where a press on the whole card goes (ticket 287): a Completed card opens his read-only report on the set
   * (`studentReportHref`). Null on To do (its action button opens the set) and Missing (nothing handed in) cards.
   */
  href: string | null;
}

/** Every set in Sam's Classroom by section, each newest due first. */
export function studentClassroom(c: ClassroomState | null | undefined, session: StudentSession | null, now: number): Record<StudentSection, StudentSetCard[]> {
  const cards = assignmentIds(c).flatMap((id): StudentSetCard[] => {
    const b = assignmentBundle(id, c);
    const section = studentSection(id, c, session, now);
    if (!b || !section) return [];
    const action = section !== "todo" ? null : !session || session.stage === "overview" ? "start" : "continue";
    return [{ id, name: b.name, due: b.due, section, action, href: section === "completed" ? studentReportHref(id) : null }];
  });
  const sorted = [...cards].sort((a, b) => dueOrder(b.due) - dueOrder(a.due));
  return { todo: sorted.filter((k) => k.section === "todo"), missing: sorted.filter((k) => k.section === "missing"), completed: sorted.filter((k) => k.section === "completed") };
}
