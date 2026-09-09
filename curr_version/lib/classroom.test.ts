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
