import { describe, expect, it } from "vitest";
import { groupOfStudent, moveStudent, seated, seatingOf, unevenGroups } from "./seating";
import { DEFAULT_GROUPS, GROUP_COLOURS } from "@/data/groups";
import { CLASSMATES, GROUPMATE_IDS, OTHER_GROUPS } from "@/data/classmates";
import { DEMO_STUDENT } from "@/data/assignment";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";

describe("the class of twenty", () => {
  it("is Sam plus nineteen classmates with unique ids, every one seated exactly once in five groups of four", () => {
    expect(CLASSMATES).toHaveLength(19);
    expect(new Set(CLASSMATES.map((c) => c.id)).size).toBe(19);
    const all = seated(DEFAULT_GROUPS);
    expect(all).toHaveLength(20);
    expect(new Set(all).size).toBe(20);
    expect(all).toContain(DEMO_STUDENT.id);
    for (const c of CLASSMATES) expect(all, c.id).toContain(c.id);
    expect(unevenGroups(DEFAULT_GROUPS)).toEqual([]);
    expect(DEFAULT_GROUPS.sky).toEqual([DEMO_STUDENT.id, ...GROUPMATE_IDS]);
  });

  it("the platform-suggested groups still cover every classmate once", () => {
    const ids = [...GROUPMATE_IDS, ...OTHER_GROUPS.flat()];
    expect(new Set(ids).size).toBe(ids.length);
    expect([...ids].sort()).toEqual(CLASSMATES.map((c) => c.id).sort());
  });

  it("every lightweight classmate's wrong problems have a known slip behind them", () => {
    for (const c of CLASSMATES) for (const pid of c.wrong) expect(c.attempts[pid], `${c.id} ${pid}`).toBeDefined();
  });
});

describe("seating rules", () => {
  it("finds a student's colour, moves them, flags uneven groups, and ignores no-op or unknown moves", () => {
    expect(groupOfStudent(DEFAULT_GROUPS, "priya")).toBe("coral");
    const moved = moveStudent(DEFAULT_GROUPS, "priya", "sky");
    expect(moved.coral).not.toContain("priya");
    expect(moved.sky).toEqual([...DEFAULT_GROUPS.sky, "priya"]);
    expect(unevenGroups(moved)).toEqual(["coral", "sky"]);
    expect(moveStudent(DEFAULT_GROUPS, "priya", "coral")).toBe(DEFAULT_GROUPS);
    expect(moveStudent(DEFAULT_GROUPS, "nobody", "sky")).toBe(DEFAULT_GROUPS);
    expect(GROUP_COLOURS).toHaveLength(5);
  });

  it("the classroom keeps the groups, resets them, and reads an older stored state as the default", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "groups/move", student: "jordan", to: "mint" });
    expect(c.groups?.mint).toContain("jordan");
    expect(c.groups?.sky).not.toContain("jordan");
    c = classroomReducer(c, { type: "groups/reset" });
    expect(c.groups).toEqual(DEFAULT_GROUPS);
    expect(seatingOf(undefined)).toEqual(DEFAULT_GROUPS);
  });
});
