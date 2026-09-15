import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { STORY } from "@/data/story";
import { assignmentBundle, assignmentStages, setClassReview, studentRecord } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { classmateEvidence, hierarchyFor } from "./hierarchy";
import { columnsOf, recordReviews, reportPathway, reviewStagesOver, sessionReviews, type OutcomeColumn } from "./report";
import { DEMO_REFLECTION, INITIAL_SESSION, sessionAt } from "./session";
import { studentSection } from "./studentClassroom";
import { studentReport } from "./studentReport";

const now = 1_700_000_000_000;
const FINISHED = ["pset-1", "pset-2", "pset-3", "pset-4", "pset-5"];
const ids = (columns: OutcomeColumn[]) => columns.map((c) => ({ id: c.id, problems: c.problems.map((p) => p.id), notAttempted: c.notAttempted.map((p) => p.id) }));

describe("Sam's report on a Completed set (ticket 287)", () => {
  it("opens every finished set he handed in, from his record, the same columns and tiles as the teacher's report of him", () => {
    expect(FINISHED.every((_, i) => (STORY.sam.done[i] ?? 0) > 0)).toBe(true);
    for (const id of FINISHED) {
      const r = studentReport(id, INITIAL_CLASSROOM, INITIAL_SESSION, now);
      expect(r, id).not.toBeNull();
      // The teacher's report (`ReportBody`) on the same set, as it computes it.
      const set = assignmentBundle(id, INITIAL_CLASSROOM)!;
      const record = studentRecord(set, DEMO_STUDENT.id)!;
      const classReview = setClassReview(set, INITIAL_CLASSROOM, null);
      const pathway = reportPathway(set.pathway, classReview);
      const over = reviewStagesOver(assignmentStages(set, INITIAL_CLASSROOM, null, now));
      const teacher = columnsOf(recordReviews(record, set.problems, over, classReview), pathway, set.problems);
      expect(ids(r!.columns), id).toEqual(ids(teacher));
      expect(r!.pathway, id).toEqual(pathway);
      expect(r!.hierarchy, id).toEqual(hierarchyFor(classmateEvidence(record, set.problems), set));
      expect(r!.problems.map((p) => p.id), id).toEqual(set.problems.map((p) => p.id));
      // What he sent: the words the teacher reads as "In their words".
      expect(r!.reflection.length, id).toBeGreaterThan(0);
      expect(r!.reflection, id).toBe(record.clarification);
    }
  });

  it("a set with class review has its Covered column, as on the teacher's report", () => {
    const r = studentReport("pset-1", INITIAL_CLASSROOM, INITIAL_SESSION, now)!;
    expect(r.columns.map((c) => c.id)).toContain("covered");
  });

  it("Problem Set 6 opens once his report is sent, from his session, the sent reflection with it", () => {
    const { classroom, session } = skipFixture("homework", now);
    const r = studentReport("pset-6", classroom, session, now);
    expect(r).not.toBeNull();
    const set = assignmentBundle("pset-6", classroom)!;
    const classReview = setClassReview(set, classroom, session);
    const pathway = reportPathway(set.pathway, classReview);
    expect(ids(r!.columns)).toEqual(ids(columnsOf(sessionReviews(session, classroom.group, set.problems, classReview), pathway, set.problems)));
    expect(r!.reflection).toBe(DEMO_REFLECTION);
    expect(r!.set.title).toBe(ASSIGNMENT.title);
  });

  it("opens nothing that is not Completed: To do, Missing, not sent, unknown", () => {
    const sent = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual"], goal: ASSIGNMENT.goal, at: now });
    // To do: mid-run, and on the report before it is sent.
    expect(studentReport("pset-6", sent, sessionAt("working"), now)).toBeNull();
    expect(studentReport("pset-6", sent, sessionAt("report"), now)).toBeNull();
    // Not sent.
    expect(studentReport("pset-6", INITIAL_CLASSROOM, sessionAt("homework"), now)).toBeNull();
    // Missing: the lesson over without his hand-in.
    const setUp = classroomReducer(sent, { type: "wc/setup", problems: ["q1"], examples: {} });
    const ended = classroomReducer(classroomReducer(setUp, { type: "wc/project", at: now }), { type: "wc/end" });
    expect(studentSection("pset-6", ended, sessionAt("working"), now)).toBe("missing");
    expect(studentReport("pset-6", ended, sessionAt("working"), now)).toBeNull();
    expect(studentReport("pset-9", INITIAL_CLASSROOM, INITIAL_SESSION, now)).toBeNull();
  });
});
