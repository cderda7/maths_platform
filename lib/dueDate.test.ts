import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, type ClassroomState } from "./classroom";
import { classroomCards, sectionCards } from "./classroomCards";
import { created, createAction } from "./create";
import { DEMO_PATHWAY, demoSend, readyDraft, skipFixture, teacherSkip } from "./demo";
import { generatedDraft } from "./draft";
import { addDays, addMonths, addMonthsToDay, dayLabel, dayName, DEMO_TODAY, DUE_DEFAULT, dueOrDefault, dueOrder, isIsoDay, monthLabel, monthOf, monthWeeks, weekEnd, weekStart } from "./dueDate";
import { INITIAL_SESSION } from "./session";
import { studentClassroom } from "./studentClassroom";

describe("calendar days (ticket 289)", () => {
  it("reads a stored day as cards show a due date, and orders it like the fixtures' days", () => {
    expect(dayLabel("2026-09-10")).toBe("Thu 10 Sep");
    expect(dayLabel("2026-09-14")).toBe("Mon 14 Sep");
    expect(dayLabel("2026-10-01")).toBe("Thu 1 Oct");
    expect(dayName("2026-09-10")).toBe("Thursday 10 September 2026");
    expect(dueOrder(dayLabel("2026-09-11"))).toBeGreaterThan(dueOrder("Thu 10 Sep"));
    expect(dueOrder(dayLabel("2026-10-01"))).toBeGreaterThan(dueOrder(dayLabel("2026-09-30")));
  });

  it("the demo's today is Thu 10 Sep, where an in-class set's picker starts", () => {
    expect(dayLabel(DEMO_TODAY)).toBe("Thu 10 Sep");
    expect(dayLabel(DUE_DEFAULT.pset)).toBe(ASSIGNMENT.due);
  });

  it("only a real calendar day is a stored day", () => {
    expect(isIsoDay("2026-09-10")).toBe(true);
    for (const bad of ["2026-02-30", "2026-9-10", "Thu 10 Sep", "", null, undefined, 20260910]) expect(isIsoDay(bad)).toBe(false);
  });

  it("walks days, weeks and months, keeping a month's end inside the next month", () => {
    expect(addDays("2026-09-30", 1)).toBe("2026-10-01");
    expect(addDays("2026-09-01", -1)).toBe("2026-08-31");
    expect(addMonthsToDay("2026-08-31", 1)).toBe("2026-09-30");
    expect(addMonthsToDay("2026-10-31", -1)).toBe("2026-09-30");
    expect(addMonthsToDay("2026-12-15", 1)).toBe("2027-01-15");
    expect(addMonths({ year: 2026, month: 0 }, -1)).toEqual({ year: 2025, month: 11 });
    expect(weekStart("2026-09-10")).toBe("2026-09-07");
    expect(weekEnd("2026-09-10")).toBe("2026-09-13");
    expect(weekStart("2026-09-07")).toBe("2026-09-07");
    expect(weekEnd("2026-09-13")).toBe("2026-09-13");
  });

  it("lays a month out Monday to Sunday, padded to whole weeks", () => {
    const sep = monthWeeks(monthOf("2026-09-10"));
    expect(monthLabel(monthOf("2026-09-10"))).toBe("September 2026");
    expect(sep).toHaveLength(5);
    expect(sep.every((w) => w.length === 7)).toBe(true);
    // 1 Sep 2026 is a Tuesday; 30 Sep a Wednesday.
    expect(sep[0]).toEqual([null, "2026-09-01", "2026-09-02", "2026-09-03", "2026-09-04", "2026-09-05", "2026-09-06"]);
    expect(sep[4]).toEqual(["2026-09-28", "2026-09-29", "2026-09-30", null, null, null, null]);
    expect(sep.flat().filter(Boolean)).toHaveLength(30);
    // February 2027 starts on a Monday: four full weeks.
    expect(monthWeeks({ year: 2027, month: 1 })).toHaveLength(4);
  });

  it("a stored due before the earliest day, or none, reads as the default", () => {
    expect(dueOrDefault("2026-09-15", DEMO_TODAY, DUE_DEFAULT.pset)).toBe("2026-09-15");
    expect(dueOrDefault(DEMO_TODAY, DEMO_TODAY, DUE_DEFAULT.pset)).toBe(DEMO_TODAY);
    expect(dueOrDefault("2026-09-09", DEMO_TODAY, DUE_DEFAULT.pset)).toBe(DEMO_TODAY);
    expect(dueOrDefault(undefined, DEMO_TODAY, DUE_DEFAULT.pset)).toBe(DEMO_TODAY);
    expect(dueOrDefault("garbage", DEMO_TODAY, DUE_DEFAULT.pset)).toBe(DEMO_TODAY);
    // A default that has fallen behind the earliest day moves up to it.
    expect(dueOrDefault(undefined, "2026-09-08", "2026-09-07")).toBe("2026-09-08");
  });
});

describe("the picked due date flows from Create to every card (ticket 289)", () => {
  const now = 1_700_000_000_000;
  const { draft, review } = readyDraft(now);
  const ready = (due?: string): ClassroomState => ({ ...INITIAL_CLASSROOM, draft: { ...draft, ...(due ? { due } : {}) }, review });

  it("Generate's draft starts due on the default day", () => {
    expect(generatedDraft(now).due).toBe(DUE_DEFAULT.pset);
    expect(draft.due).toBe(DUE_DEFAULT.pset);
  });

  it("Create stores the draft's day on the assignment, and the set is due that day", () => {
    expect(createAction(ready("2026-09-17"))).toMatchObject({ due: "2026-09-17" });
    const c = created(ready("2026-09-17"), now);
    expect(c.assignment?.due).toBe("2026-09-17");
    expect(assignmentBundle("pset-6", c)?.due).toBe("Thu 17 Sep");
    // Reload: the stored classroom reads back the same day.
    expect(assignmentBundle("pset-6", migrateClassroom(JSON.parse(JSON.stringify(c))))?.due).toBe("Thu 17 Sep");
  });

  it("the teacher's and Sam's cards read the picked day", () => {
    const c = created(ready("2026-09-21"), now);
    expect(classroomCards(c, INITIAL_SESSION, now).live.map((k) => [k.id, k.due])).toEqual([["pset-6", "Mon 21 Sep"]]);
    expect(studentClassroom(c, INITIAL_SESSION, now).todo.map((k) => [k.id, k.due])).toEqual([["pset-6", "Mon 21 Sep"]]);
  });

  it("the cards sort by the picked day, not the fixture's", () => {
    const c = created(ready("2026-09-21"), now);
    const live = assignmentBundle("pset-6", c)!;
    const earlier = { ...assignmentBundle("pset-5", c)!, kind: "live" as const, id: "pset-x", due: "Fri 18 Sep" };
    const later = { ...earlier, id: "pset-y", due: "Wed 23 Sep" };
    expect(sectionCards([earlier, live, later], c, INITIAL_SESSION, now).live.map((k) => k.id)).toEqual(["pset-y", "pset-6", "pset-x"]);
  });

  it("a draft with no day, a malformed stored day, a skip and a deep link all leave Problem Set 6 due Thu 10 Sep", () => {
    const { due: _omit, ...undated } = draft;
    void _omit;
    const noDay = created({ ...INITIAL_CLASSROOM, draft: undated, review }, now);
    expect(noDay.assignment).not.toHaveProperty("due");
    expect(assignmentBundle("pset-6", noDay)?.due).toBe("Thu 10 Sep");
    const bad = { ...noDay, assignment: { ...noDay.assignment!, due: "someday" } };
    expect(assignmentBundle("pset-6", bad)?.due).toBe("Thu 10 Sep");
    expect(demoSend(DEMO_PATHWAY, now)).not.toHaveProperty("due");
    expect(assignmentBundle("pset-6", classroomReducer(INITIAL_CLASSROOM, demoSend(DEMO_PATHWAY, now)))?.due).toBe("Thu 10 Sep");
    expect(assignmentBundle("pset-6", skipFixture("working", now).classroom)?.due).toBe("Thu 10 Sep");
  });

  it("the presenter's send skip, after a teacher picked another day, sends due Thu 10 Sep", () => {
    const picked = { ...INITIAL_CLASSROOM, draft: { ...generatedDraft(now), due: "2026-09-24" } };
    const { classroom } = teacherSkip("send", picked, INITIAL_SESSION, now);
    expect(classroom.draft?.due).toBe(DUE_DEFAULT.pset);
    expect(assignmentBundle("pset-6", created(classroom, now))?.due).toBe("Thu 10 Sep");
  });
});
