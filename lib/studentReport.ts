import type { Problem, ReviewStage } from "@/data/types";
import { assignmentBundle, LIVE_ASSIGNMENT_ID, setClassReview, type AssignmentBundle } from "./assignments";
import type { ClassroomState } from "./classroom";
import { classmateEvidence, hierarchyFor, sessionEvidence, type HierarchyResult } from "./hierarchy";
import { columnsOf, recordReviews, reportPathway, sessionReviews, type OutcomeColumn, type Reviews } from "./report";
import { movedToClassReview } from "./decisionState";
import type { StudentSession } from "./session";
import { studentSection } from "./studentClassroom";

/**
 * Sam's report on a Completed set, read-only (ticket 287): what his Classroom's Completed card opens. The same
 * columns, tiles and working the teacher's report of Sam shows on that set (`ReportBody`), from the same sources:
 *
 * - a finished set (Problem Sets 1–5): his handed-in record (`AssignmentBundle.sam`), every review stage over, and
 *   the set's recorded class review; his reflection is the record's `clarification`, which the teacher reads as
 *   "In their words".
 * - the live set (Problem Set 6) once his report is sent: his session, the classroom's group run and class review
 *   as they stand; his reflection is the one he sent.
 *
 * Null when the set is not Completed for him (To do, Missing, not in his Classroom): nothing to open.
 * Pure: derived from the classroom, his session and the clock, so every tab agrees.
 */
export interface StudentReport {
  set: AssignmentBundle;
  problems: Problem[];
  hierarchy: HierarchyResult;
  /** His recognised lines per problem: the skill rows' working. */
  lines: Record<string, string[]>;
  pathway: ReviewStage[];
  reviews: Reviews;
  columns: OutcomeColumn[];
  /** What he sent with the report. */
  reflection: string;
}

export function studentReport(id: string, c: ClassroomState | null | undefined, session: StudentSession | null, now: number): StudentReport | null {
  if (studentSection(id, c, session, now) !== "completed") return null;
  const set = assignmentBundle(id, c);
  if (!set) return null;
  const { problems } = set;
  const classReview = setClassReview(set, c, session);
  const pathway = reportPathway(set.pathway, classReview);
  if (id === LIVE_ASSIGNMENT_ID) {
    if (!session) return null;
    const evidence = sessionEvidence(session);
    const reviews = sessionReviews(session, c?.group, problems, classReview, movedToClassReview(c));
    return { set, problems, hierarchy: hierarchyFor(evidence, set), lines: evidence.lines, pathway, reviews, columns: columnsOf(reviews, pathway, problems), reflection: session.reflection.trim() };
  }
  const record = set.sam;
  if (!record) return null;
  const evidence = classmateEvidence(record, problems);
  const reviews = recordReviews(record, problems, undefined, classReview);
  return { set, problems, hierarchy: hierarchyFor(evidence, set), lines: evidence.lines, pathway, reviews, columns: columnsOf(reviews, pathway, problems), reflection: record.clarification ?? "" };
}
