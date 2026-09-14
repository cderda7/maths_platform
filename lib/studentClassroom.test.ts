import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { skipFixture } from "./demo";
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";
import { STUDENT_CLASSROOM_HREF, studentClassroom, studentSection, studentSetHref } from "./studentClassroom";

const now = 1_700_000_000_000;
const FINISHED = ["pset-5", "pset-4", "pset-3", "pset-2", "pset-1"];
const SENT = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group", "whole-class"], goal: ASSIGNMENT.goal, at: now });
/** The lesson over: class review set up, projected and ended. */
const ended = (c: ClassroomState): ClassroomState => {
  const set = classroomReducer(c, { type: "wc/setup", problems: ["q1"], examples: {} });
  return classroomReducer(classroomReducer(set, { type: "wc/project", at: now }), { type: "wc/end" });
};
const sections = (c: ClassroomState | null, s: StudentSession | null) => {
  const r = studentClassroom(c, s, now);
  return { todo: r.todo.map((k) => k.id), missing: r.missing.map((k) => k.id), completed: r.completed.map((k) => k.id) };
};

describe("Sam's Classroom (ticket 264)", () => {
  it("before Problem Set 6 is sent: Sets 1–5 Completed, To do and Missing empty", () => {
    expect(sections(INITIAL_CLASSROOM, INITIAL_SESSION)).toEqual({ todo: [], missing: [], completed: FINISHED });
    expect(sections(null, null)).toEqual({ todo: [], missing: [], completed: FINISHED });
    expect(studentSection("pset-6", INITIAL_CLASSROOM, INITIAL_SESSION, now)).toBeNull();
    // A run left in the session from before does not put an unsent set in his Classroom.
    expect(studentSection("pset-6", INITIAL_CLASSROOM, sessionAt("report"), now)).toBeNull();
  });

  it("once sent, Problem Set 6 is in To do with its start as the action", () => {
    const r = studentClassroom(SENT, INITIAL_SESSION, now);
    expect(r.todo).toEqual([{ id: "pset-6", name: "Problem Set 6 — Roots of a quadratic", due: ASSIGNMENT.due, section: "todo", action: "start" }]);
    expect(r.completed.map((k) => k.id)).toEqual(FINISHED);
    expect(r.completed.every((k) => k.action === null)).toBe(true);
    // No session stored yet reads as the start.
    expect(studentClassroom(SENT, null, now).todo[0].action).toBe("start");
  });

  it("mid-lesson it stays in To do, and the action continues the run", () => {
    for (const stage of ["goal", "working", "feedback", "class-wait", "group", "frozen", "report"] as const) {
      expect(studentSection("pset-6", SENT, sessionAt(stage), now)).toBe("todo");
      expect(studentClassroom(SENT, sessionAt(stage), now).todo[0].action).toBe("continue");
    }
    // The presenter skips send the set first.
    const { classroom, session } = skipFixture("group review", now);
    expect(studentSection("pset-6", classroom, session, now)).toBe("todo");
  });

  it("after completion (the report sent with its reflection) it moves to Completed, newest due first", () => {
    const { classroom, session } = skipFixture("homework", now);
    expect(sections(classroom, session)).toEqual({ todo: [], missing: [], completed: ["pset-6", ...FINISHED] });
    // Handed in and the lesson over but no reflection yet: still To do, the report waits for it.
    expect(studentSection("pset-6", ended(SENT), sessionAt("report"), now)).toBe("todo");
  });

  it("completed without his hand-in, it is Missing and opens nothing", () => {
    for (const stage of ["overview", "confidence", "working"] as const) {
      const r = studentClassroom(ended(SENT), sessionAt(stage), now);
      expect(r.missing).toEqual([{ id: "pset-6", name: "Problem Set 6 — Roots of a quadratic", due: ASSIGNMENT.due, section: "missing", action: null }]);
      expect(r.todo).toEqual([]);
    }
    // Still working while the lesson runs is not missing.
    expect(studentSection("pset-6", SENT, sessionAt("working"), now)).toBe("todo");
  });

  it("reset returns Problem Set 6 to not sent", () => {
    expect(studentSection("pset-6", classroomReducer(SENT, { type: "reset" }), INITIAL_SESSION, now)).toBeNull();
  });

  it("names nothing it does not hold", () => {
    expect(studentSection("pset-9", SENT, INITIAL_SESSION, now)).toBeNull();
    expect(STUDENT_CLASSROOM_HREF).toBe("/student");
    expect(studentSetHref("pset-6")).toBe("/student/a/pset-6");
  });
});
