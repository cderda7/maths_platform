import { DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATE_MAP, type Classmate } from "@/data/classmates";
import { feedbackFor } from "./feedback";
import type { StudentSession } from "./session";

/**
 * The individual view's two boxes. The platform's commentary on a student is a few short ideas,
 * each tied to the problems it is about: for a classmate the fixture's notes, for the demo
 * student the teacher-facing note on every step that didn't hold (the same note the mistakes
 * view shows), one idea per distinct note. The clarification is what the student wrote back:
 * the demo student's reflection once the report is sent, a classmate's scripted line. A set other than
 * Problem Set 2 passes the student's `record` on it (ticket 187), Sam's included on a finished set.
 */
export interface CommentaryIdea {
  text: string;
  problems: string[];
}

export interface StudentCommentary {
  ideas: CommentaryIdea[];
  /** Null until the student has sent something. */
  clarification: string | null;
}

export function commentaryFor(student: string, session: StudentSession | null, record?: Classmate | null): StudentCommentary {
  if (record) return { ideas: record.notes.map((n) => ({ text: n.text, problems: [...n.problems] })), clarification: record.clarification ?? null };
  if (student === DEMO_STUDENT.id) {
    if (!session) return { ideas: [], clarification: null };
    const ideas: CommentaryIdea[] = [];
    for (const p of feedbackFor(session)) {
      for (const line of p.lines) {
        if (line.verdict.verdict !== "wrong" || !line.verdict.note) continue;
        const text = line.verdict.note;
        const idea = ideas.find((i) => i.text === text);
        if (idea) {
          if (!idea.problems.includes(p.problem.id)) idea.problems.push(p.problem.id);
        } else ideas.push({ text, problems: [p.problem.id] });
      }
    }
    const reflection = session.reflection.trim();
    return { ideas, clarification: session.reportSent && reflection ? reflection : null };
  }
  const c = CLASSMATE_MAP[student];
  if (!c) return { ideas: [], clarification: null };
  return { ideas: c.notes.map((n) => ({ text: n.text, problems: [...n.problems] })), clarification: c.clarification ?? null };
}
