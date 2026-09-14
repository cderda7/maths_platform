import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { DEFAULT_GROUPS } from "@/data/groups";
import { absenceLocked, absentOf, canMarkAbsent, liveAbsent, presentCount, presentGroups, withAbsence } from "./absence";
import { assignmentBundle, classSize, submittedCount } from "./assignments";
import { classroomCards } from "./classroomCards";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { classStages } from "./classStage";
import { skipFixture } from "./demo";
import { tally } from "./diagnostic";
import { arrivesAt, closedAt, currentIndex } from "./diagnosticChain";
import { problemsByStruggle } from "./examples";
import { groupPlan, recordReviewProblems } from "./group";
import { mistakesByProblem } from "./mistakes";
import { sessionAt } from "./session";
import { standingsAt } from "./standings";

/** Absent students (ticket 250): the classroom's list, and every count and group that leaves them out. */

const now = 1_700_000_000_000;
const mark = (c: ClassroomState, student: string, absent: boolean, assignment = ASSIGNMENT.id) => classroomReducer(c, { type: "absence/set", assignment, student, absent });

describe("absences in the classroom", () => {
  it("start from the demo's: Chloe absent on Problem Set 6, nobody on Problem Sets 1–5", () => {
    expect(absentOf(INITIAL_CLASSROOM, "pset-6")).toEqual(["chloe"]);
    for (const id of ["pset-1", "pset-2", "pset-3", "pset-4", "pset-5"]) expect(absentOf(INITIAL_CLASSROOM, id), id).toEqual([]);
    expect(liveAbsent(null)).toEqual(["chloe"]);
  });

  it("mark and unmark, per assignment: a mark on one set leaves every other set as it was", () => {
    const priya = mark(INITIAL_CLASSROOM, "priya", true);
    expect(absentOf(priya, "pset-6")).toEqual(["chloe", "priya"]);
    expect(absentOf(priya, "pset-5")).toEqual([]);
    const onFive = mark(priya, "priya", true, "pset-5");
    expect(absentOf(onFive, "pset-5")).toEqual(["priya"]);
    expect(absentOf(onFive, "pset-6")).toEqual(["chloe", "priya"]);
    const back = mark(onFive, "priya", false);
    expect(absentOf(back, "pset-6")).toEqual(["chloe"]);
    expect(absentOf(back, "pset-5")).toEqual(["priya"]);
    // Chloe unmarked stores an empty list, which wins over the demo's.
    const chloe = mark(back, "chloe", false);
    expect(absentOf(chloe, "pset-6")).toEqual([]);
    expect(chloe.absences).toEqual({ "pset-6": [], "pset-5": ["priya"] });
  });

  it("is idempotent: marking the absent absent, or the present present, is the same state", () => {
    expect(mark(INITIAL_CLASSROOM, "chloe", true)).toBe(INITIAL_CLASSROOM);
    expect(mark(INITIAL_CLASSROOM, "priya", false)).toBe(INITIAL_CLASSROOM);
    const list = ["a"];
    expect(withAbsence(list, "a", true)).toBe(list);
    expect(withAbsence(list, "b", false)).toBe(list);
  });

  it("never marks the live student absent on the live set (his iPad is running it); on a finished set he can be", () => {
    expect(mark(INITIAL_CLASSROOM, DEMO_STUDENT.id, true)).toBe(INITIAL_CLASSROOM);
    expect(canMarkAbsent("live", DEMO_STUDENT.id)).toBe(false);
    expect(canMarkAbsent("live", "priya")).toBe(true);
    expect(canMarkAbsent("finished", DEMO_STUDENT.id)).toBe(true);
    expect(absentOf(mark(INITIAL_CLASSROOM, DEMO_STUDENT.id, true, "pset-5"), "pset-5")).toEqual([DEMO_STUDENT.id]);
  });

  it("disables mark absent once the student has handed the set in; mark present always acts (ticket 270)", () => {
    expect(absenceLocked({ kind: "submitted" }, false)).toBe(true);
    expect(absenceLocked({ kind: "submitted" }, true)).toBe(false);
    expect(absenceLocked({ kind: "not-started" }, false)).toBe(false);
    expect(absenceLocked({ kind: "warming-up" }, false)).toBe(false);
    expect(absenceLocked({ kind: "working", label: "Q4" }, false)).toBe(false);
  });

  it("reset returns to the demo's absences", () => {
    const changed = mark(mark(INITIAL_CLASSROOM, "chloe", false), "priya", true, "pset-3");
    const reset = classroomReducer(changed, { type: "reset" });
    expect(absentOf(reset, "pset-6")).toEqual(["chloe"]);
    expect(absentOf(reset, "pset-3")).toEqual([]);
  });
});

describe("counts with and without an absent student", () => {
  it("the class counted: twenty, nineteen with one away", () => {
    expect(presentCount(CLASSMATES, [])).toBe(20);
    expect(presentCount(CLASSMATES, ["chloe"])).toBe(19);
    expect(presentCount(CLASSMATES, ["chloe", "nobody-we-know"])).toBe(19);
    const { classroom } = skipFixture("working", now);
    expect(classSize(assignmentBundle("pset-6", classroom)!)).toBe(19);
    expect(classSize(assignmentBundle("pset-6", mark(classroom, "chloe", false))!)).toBe(20);
    expect(classSize(assignmentBundle("pset-5", classroom)!)).toBe(20);
  });

  it("the Pathway card's stage count reads /19 with Chloe away and /20 with her back", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    const live = (c: ClassroomState) => classStages(c, session, now).find((s) => s.state === "current")!;
    expect(live(classroom)).toMatchObject({ id: "individual", total: 19 });
    expect(live(mark(classroom, "chloe", false))).toMatchObject({ id: "individual", total: 20 });
  });

  it("submitted and the Classroom card leave an absent student out of both sides, however far they got", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    const b = (c: ClassroomState) => assignmentBundle("pset-6", c)!;
    expect(submittedCount(b(classroom), session, now)).toEqual({ submitted: 19, total: 19 });
    expect(submittedCount(b(mark(classroom, "chloe", false)), session, now)).toEqual({ submitted: 19, total: 20 });
    // Priya handed everything in; away, she is counted by neither side.
    expect(submittedCount(b(mark(classroom, "priya", true)), session, now)).toEqual({ submitted: 18, total: 18 });
    const card = (c: ClassroomState) => classroomCards(c, session, now).live.find((k) => k.id === "pset-6")!;
    expect(card(classroom)).toMatchObject({ submitted: 19, total: 19 });
    expect(card(mark(classroom, "chloe", false))).toMatchObject({ submitted: 19, total: 20 });
  });

  it("Mistakes: an absent student's work is no row and counts as neither correct nor pending", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    const q = (c: ClassroomState, id: string) => mistakesByProblem(session, assignmentBundle("pset-6", c)!, now).find((p) => p.problem.id === id)!;
    const withAmelia = mark(classroom, "amelia", true);
    // Priya got Q1 right: one fewer correct. Amelia got Q7 wrong: one fewer row.
    expect(q(mark(classroom, "priya", true), "q1").right).toBe(q(classroom, "q1").right - 1);
    expect(q(classroom, "q7").rows.map((r) => r.id)).toContain("amelia");
    expect(q(withAmelia, "q7").rows.map((r) => r.id)).not.toContain("amelia");
    expect(q(withAmelia, "q7").rows).toHaveLength(q(classroom, "q7").rows.length - 1);
  });

  it("class review's struggled counts are over the students in the room", () => {
    const session = sessionAt("frozen");
    const q7 = (absent: string[]) => problemsByStruggle(session, absent).find((r) => r.problem.id === "q7")!;
    expect(q7(["amelia"])).toEqual({ ...q7([]), struggled: q7([]).struggled - 1, handedIn: q7([]).handedIn - 1 });
    expect(q7(["priya"])).toEqual({ ...q7([]), handedIn: q7([]).handedIn - 1 });
  });

  it("a diagnostic's n/19 answered: an absent student answers nothing, and the step closes on the last one in the room", () => {
    const run = { steps: ["d-factor-check"], pushedAt: now, openedAt: [now], answers: { "d-factor-check": { option: "a", at: now + 100 } }, forcedAt: {} };
    const end = tally(run, now + 60_000, currentIndex(run), ["chloe"]);
    expect(end).toMatchObject({ answered: 19, total: 19, complete: true, revealed: true });
    expect(tally(run, now + 60_000)).toMatchObject({ answered: 20, total: 20, complete: true });
    expect(tally(run, now + 50, currentIndex(run), ["chloe"]).total).toBe(19);
    // The last classmate to answer, away: the step closes when the one before them answers.
    const order = CLASSMATES.map((m, i) => ({ id: m.id, at: arrivesAt(i) })).sort((a, b) => b.at - a.at);
    expect(closedAt(run, 0, [order[0].id])).toBe(now + order[1].at);
    expect(closedAt(run, 0)).toBe(now + order[0].at);
  });
});

describe("a group with an absent member", () => {
  it("leaves their seating group for group review only: the seats stay, the class defaults are untouched", () => {
    const groups = presentGroups(DEFAULT_GROUPS, ["chloe"]);
    expect(groups.amber).toEqual(["mia", "noah", "ethan"]);
    expect(groups.sky).toEqual(DEFAULT_GROUPS.sky);
    expect(DEFAULT_GROUPS.amber).toContain("chloe");
    expect(presentGroups(DEFAULT_GROUPS, [])).toBe(DEFAULT_GROUPS);
    const { classroom } = skipFixture("group review", now);
    expect(assignmentBundle("pset-6", classroom)!.groups.amber).toContain("chloe");
  });

  it("a group of four with one away races as three; with them back, four again", () => {
    const { classroom, session } = skipFixture("group review", now);
    const amber = (c: ClassroomState) => standingsAt(c, session, now).find((s) => s.colour === "amber")!;
    expect(amber(classroom).members).toEqual(["mia", "noah", "ethan"]);
    expect(amber(mark(classroom, "chloe", false)).members).toEqual(["mia", "noah", "chloe", "ethan"]);
    // A member away takes every problem they bring (ticket 278: wrong, incomplete or not attempted) out of the union and the total.
    const withoutNoah = amber(mark(classroom, "noah", true));
    expect(withoutNoah.members).toEqual(["mia", "ethan"]);
    expect(withoutNoah.total).toBe(amber(classroom).total - recordReviewProblems(CLASSMATES.find((m) => m.id === "noah")!).length);
  });

  it("the demo student's group begins without an absent groupmate", () => {
    const session = sessionAt("group");
    expect(groupPlan(session, ["jordan"]).members.map((m) => m.id)).toEqual(["sam", "zara", "liam"]);
    expect(groupPlan(session, ["chloe"]).members.map((m) => m.id)).toEqual(["sam", "jordan", "zara", "liam"]);
  });
});
