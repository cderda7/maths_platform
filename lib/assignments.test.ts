import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { DEFAULT_GROUPS } from "@/data/groups";
import { assignmentBundle, assignmentHref, assignmentIds, assignmentStages, assignmentTabs, currentStageOf, isAssignmentId, landingFor, landingTab, LIVE_ASSIGNMENT_ID, liveStartedAt, PROBLEM_SET_2_BEFORE_CREATE, rosterProgress, submittedCount } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, type ClassroomState } from "./classroom";
import { SKIP_STARTED_AGO_MS, SKIP_TARGETS, skipFixture } from "./demo";
import { CLASS_SIZE } from "./readiness";
import { sessionAt } from "./session";

const now = 1_700_000_000_000;
/** Problem Set 2 as the create flow leaves it (ticket 188): created with the fixture's set. */
const CREATED = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], goal: ASSIGNMENT.goal, at: now });

describe("the assignment registry", () => {
  it("holds Problem Set 2 under the id pset-2, the student side's set", () => {
    expect(LIVE_ASSIGNMENT_ID).toBe("pset-2");
    expect(ASSIGNMENT.id).toBe("pset-2");
    expect(isAssignmentId("pset-2")).toBe(true);
    expect(isAssignmentId("set-3")).toBe(false);
    expect(assignmentIds(CREATED)).toEqual(["pset-2", "pset-1"]);
    expect(assignmentBundle("nope", CREATED)).toBeNull();
  });

  it("Problem Set 2 is not in the Classroom until it is created (ticket 188); Reset demo takes it out again", () => {
    expect(PROBLEM_SET_2_BEFORE_CREATE).toBe(false);
    expect(assignmentIds(INITIAL_CLASSROOM)).toEqual(["pset-1"]);
    expect(assignmentBundle("pset-2", INITIAL_CLASSROOM)).toBeNull();
    expect(isAssignmentId("pset-2")).toBe(true);
    expect(liveStartedAt(INITIAL_CLASSROOM)).toBeNull();
    expect(assignmentIds(classroomReducer(CREATED, { type: "reset" }))).toEqual(["pset-1"]);
  });

  it("Create records when the set went live; a skip past creation has it exist, started long before", () => {
    expect(liveStartedAt(CREATED)).toBe(now);
    expect(liveStartedAt(classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "t", problemIds: ["q1"], pathway: [], at: now, startedAt: now - 5 }))).toBe(now - 5);
    for (const t of SKIP_TARGETS) {
      const { classroom } = skipFixture(t, now);
      expect(assignmentIds(classroom), t).toEqual(["pset-2", "pset-1"]);
      expect(liveStartedAt(classroom), t).toBe(now - SKIP_STARTED_AGO_MS);
    }
    // An assignment stored before ticket 188 has no startedAt: its creation time stands in.
    const old: ClassroomState = { ...CREATED, assignment: { ...CREATED.assignment!, startedAt: undefined } };
    expect(liveStartedAt(old)).toBe(now);
  });

  it("the created set bundles the fixture: title, due, problems, classmates, pathway, groups", () => {
    const b = assignmentBundle("pset-2", CREATED)!;
    expect(b).toMatchObject({ id: "pset-2", kind: "live", title: ASSIGNMENT.title, name: "Problem Set 2 — Roots of a quadratic", due: "Thu 10 Sep", className: "11 Methods", classCode: "11MAM2", unitNumber: 1 });
    expect(b.problems.map((p) => p.id)).toEqual(ASSIGNMENT.problems.map((p) => p.id));
    expect(b.classmates).toBe(CLASSMATES);
    expect(b.pathway).toEqual(["individual", "group"]);
    expect(b.groups).toEqual(DEFAULT_GROUPS);
  });

  it("the live set reads the created assignment: its title, problems and pathway", () => {
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Set 4", problemIds: ["q1", "q3"], pathway: ["whole-class"], at: now });
    const b = assignmentBundle("pset-2", c)!;
    expect(b.title).toBe("Set 4");
    expect(b.name).toBe("Set 4");
    expect(b.problems.map((p) => p.id)).toEqual(["q1", "q3"]);
    expect(b.pathway).toEqual(["whole-class"]);
  });

  it("links: the landing, each tab, and Groups only on a pathway with group review", () => {
    expect(assignmentHref("pset-2")).toBe("/teacher/a/pset-2");
    expect(assignmentHref("pset-2", "mistakes")).toBe("/teacher/a/pset-2/mistakes");
    expect(assignmentTabs({ id: "pset-2", pathway: ["individual", "group"] }).map((t) => t.href)).toEqual(["/teacher/a/pset-2/class", "/teacher/a/pset-2/mistakes", "/teacher/a/pset-2/groups"]);
    expect(assignmentTabs({ id: "pset-2", pathway: ["individual"] }).map((t) => t.label)).toEqual(["Class", "Mistakes"]);
  });
});

describe("each assignment keeps its own groups", () => {
  it("a move on the assignment's Groups tab leaves the class defaults, and a move on the defaults leaves the assignment", () => {
    let c = classroomReducer(CREATED, { type: "groups/move", student: "jordan", to: "mint", assignment: "pset-2" });
    expect(assignmentBundle("pset-2", c)!.groups.mint).toContain("jordan");
    expect(c.groups).toEqual(DEFAULT_GROUPS);
    c = classroomReducer(c, { type: "groups/move", student: "priya", to: "violet" });
    expect(c.groups!.violet).toContain("priya");
    expect(assignmentBundle("pset-2", c)!.groups.violet).not.toContain("priya");
    expect(assignmentBundle("pset-2", classroomReducer(c, { type: "groups/reset", assignment: "pset-2" }))!.groups).toEqual(DEFAULT_GROUPS);
    expect(classroomReducer(c, { type: "groups/reset" }).groups).toEqual(DEFAULT_GROUPS);
  });

  it("creating the assignment freezes a copy of the class defaults (or the groups the create flow passes)", () => {
    const moved = classroomReducer(INITIAL_CLASSROOM, { type: "groups/move", student: "priya", to: "violet" });
    const created = classroomReducer(moved, { type: "assignment/create", title: "t", problemIds: ["q1"], pathway: ["group"], at: now });
    expect(assignmentBundle("pset-2", created)!.groups.violet).toContain("priya");
    // Later edits to the defaults do not reach the frozen copy.
    const after = classroomReducer(created, { type: "groups/move", student: "priya", to: "coral" });
    expect(assignmentBundle("pset-2", after)!.groups.violet).toContain("priya");
    const given = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "t", problemIds: ["q1"], pathway: ["group"], groups: { ...DEFAULT_GROUPS, sky: [], coral: [...DEFAULT_GROUPS.coral, ...DEFAULT_GROUPS.sky] }, at: now });
    expect(assignmentBundle("pset-2", given)!.groups.sky).toEqual([]);
  });

  it("a classroom stored before ticket 185 keeps its one set of groups as both the defaults and Problem Set 2's", () => {
    const { assignmentGroups, ...old } = classroomReducer(CREATED, { type: "groups/move", student: "jordan", to: "mint" });
    void assignmentGroups;
    const read = migrateClassroom(JSON.parse(JSON.stringify(old)));
    expect(read.groups!.mint).toContain("jordan");
    expect(assignmentBundle("pset-2", read)!.groups.mint).toContain("jordan");
    const older = migrateClassroom({ assignment: CREATED.assignment, advance: null, wholeClass: null });
    expect(assignmentBundle("pset-2", older)!.groups).toEqual(DEFAULT_GROUPS);
    expect(migrateClassroom(null)).toEqual(INITIAL_CLASSROOM);
    expect(migrateClassroom(INITIAL_CLASSROOM)).toBe(INITIAL_CLASSROOM);
  });
});

describe("the roster's progress and the landing", () => {
  const b = assignmentBundle("pset-2", CREATED)!;

  it("the classmates stream in from the start (ticket 189): at Create nobody has handed in; at the end everyone but Chloe (never started) and Jordan (stalled on Q8)", () => {
    expect(b.startedAt).toBe(now);
    const start = rosterProgress(b, null, now);
    expect(Object.keys(start)).toHaveLength(CLASS_SIZE);
    expect(start.chloe).toEqual({ kind: "not-started" });
    expect(start.jordan).toEqual({ kind: "warming-up" });
    expect(start.liam).toEqual({ kind: "working", label: "Q1" });
    expect(submittedCount(b, null, now)).toEqual({ submitted: 0, total: CLASS_SIZE });
    const end = rosterProgress(b, null, now + SKIP_STARTED_AGO_MS);
    expect(end.liam).toEqual({ kind: "submitted" });
    expect(end.jordan).toEqual({ kind: "working", label: "Q8" });
    expect(end[DEMO_STUDENT.id]).toEqual({ kind: "not-started" });
    expect(submittedCount(b, null, now + SKIP_STARTED_AGO_MS)).toEqual({ submitted: CLASS_SIZE - 3, total: CLASS_SIZE });
    // Sam hands in: the class is past working and every classmate who started has handed in, Jordan too.
    expect(submittedCount(b, sessionAt("feedback"), now)).toEqual({ submitted: CLASS_SIZE - 1, total: CLASS_SIZE });
  });

  it("Sam's row follows his session: warming up, then the first problem he has not answered, then handed in", () => {
    expect(rosterProgress(b, sessionAt("warmup-chat"), now)[DEMO_STUDENT.id]).toEqual({ kind: "warming-up" });
    expect(rosterProgress(b, sessionAt("working"), now)[DEMO_STUDENT.id]).toMatchObject({ kind: "working" });
    expect(rosterProgress(b, sessionAt("feedback"), now)[DEMO_STUDENT.id]).toEqual({ kind: "submitted" });
  });

  it("lands on Class once everyone is in or the class is past individual working, else on Mistakes", () => {
    expect(landingFor(false, "working")).toBe("mistakes");
    expect(landingFor(true, "working")).toBe("class");
    expect(landingFor(false, "individual")).toBe("class");
    expect(landingFor(false, "group")).toBe("class");
    expect(landingFor(false, null)).toBe("class");
  });

  it("Problem Set 2 lands on Mistakes while the class works (Chloe has not submitted), on Class once Sam hands in", () => {
    const start = skipFixture("working", now);
    expect(landingTab(b, start.classroom, start.session, now)).toBe("mistakes");
    const handedIn = skipFixture("indiv review", now);
    expect(currentStageOf(assignmentStages(b, handedIn.classroom, handedIn.session, now))?.id).toBe("individual");
    expect(landingTab(b, handedIn.classroom, handedIn.session, now)).toBe("class");
    const ended: ClassroomState = { ...handedIn.classroom, wholeClass: { problems: [], examples: {}, slide: 0, view: "unmarked", status: "ended", modes: {}, ink: {} } };
    expect(landingTab(b, ended, handedIn.session, now)).toBe("class");
  });
});
