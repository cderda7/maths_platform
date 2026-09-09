import { describe, expect, it } from "vitest";
import { classroomReducer, INITIAL_CLASSROOM, pathwayOf } from "./classroom";
import { DEFAULT_PATHWAY } from "./pathway";

describe("classroom state", () => {
  it("defaults to the build's pathway when nothing has been created", () => {
    expect(pathwayOf(INITIAL_CLASSROOM)).toEqual(DEFAULT_PATHWAY);
    expect(pathwayOf(null)).toEqual(DEFAULT_PATHWAY);
  });

  it("creating an assignment sets the pathway in force; reset clears it", () => {
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Set 4", problemIds: ["q1", "q3"], pathway: ["whole-class"], at: 5 });
    expect(c.assignment).toEqual({ title: "Set 4", problemIds: ["q1", "q3"], pathway: ["whole-class"], createdAt: 5 });
    expect(pathwayOf(c)).toEqual(["whole-class"]);
    expect(classroomReducer(c, { type: "reset" })).toEqual(INITIAL_CLASSROOM);
  });
});

describe("active assignment", () => {
  it("falls back to the fixture when nothing has been created", async () => {
    const { activeAssignment } = await import("./assignment");
    const a = activeAssignment(INITIAL_CLASSROOM);
    expect(a.created).toBe(false);
    expect(a.problems.map((p) => p.id)).toEqual(["q1", "q2", "q3", "q4"]);
  });

  it("keeps the chosen problems in bank order, drops unknown ids, never returns an empty set", async () => {
    const { activeAssignment } = await import("./assignment");
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "  Set 4 ", problemIds: ["q4", "bogus", "q2"], pathway: [] });
    const a = activeAssignment(c);
    expect(a.created).toBe(true);
    expect(a.title).toBe("Set 4");
    expect(a.problems.map((p) => p.id)).toEqual(["q2", "q4"]);
    const empty = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "", problemIds: [], pathway: [] });
    expect(activeAssignment(empty).problems).toHaveLength(4);
    expect(activeAssignment(empty).title).toBe("Roots of a quadratic — Set 3");
  });
});

describe("class advances", () => {
  it("starting an advance sets a one-minute deadline; pending until then, due for a minute after", async () => {
    const { GRACE_MS, isDue, isPending } = await import("./classroom");
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "advance/start", kind: "force-submit", at: 1000 });
    expect(c.advance).toEqual({ id: "force-submit@1000", kind: "force-submit", deadline: 1000 + GRACE_MS });
    expect(isPending(c, 1000)).toBe(true);
    expect(isPending(c, 1000 + GRACE_MS)).toBe(false);
    expect(isDue(c, 1000 + GRACE_MS - 1)).toBe(false);
    expect(isDue(c, 1000 + GRACE_MS)).toBe(true);
    expect(isDue(c, 1000 + GRACE_MS * 2)).toBe(false);
    expect(classroomReducer(c, { type: "advance/clear" }).advance).toBeNull();
    expect(isPending(INITIAL_CLASSROOM, 5)).toBe(false);
  });
});
