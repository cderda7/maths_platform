import { describe, expect, it } from "vitest";
import { DEFAULT_GROUPS } from "@/data/groups";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { created, createAction } from "./create";
import { readyDraft } from "./demo";
import { moveStudent } from "./seating";

describe("Create on the pathway step, as a pure step (ticket 272)", () => {
  const now = 1_700_000_000_000;
  const { draft, review } = readyDraft(now);
  const ready = { ...INITIAL_CLASSROOM, draft, review };

  it("nothing drafted, or no pathway chosen, creates nothing", () => {
    expect(createAction(INITIAL_CLASSROOM)).toBeNull();
    expect(createAction({ ...ready, review: { ...review, pathway: null } })).toBeNull();
    expect(createAction({ ...ready, draft: { ...draft, questions: [] } })).toBeNull();
  });

  it("the store stamps the moment unless one is given", () => {
    expect(createAction(ready)).not.toHaveProperty("at");
    expect(createAction(ready, now)).toMatchObject({ at: now });
  });

  it("seats the groups confirmed on the step, else the class defaults as they stand", () => {
    expect(created(ready, now).assignmentGroups?.["pset-6"]).toEqual(DEFAULT_GROUPS);
    const moved = moveStudent(DEFAULT_GROUPS, "sam", "mint");
    expect(created({ ...ready, review: { ...review, groups: moved } }, now).assignmentGroups?.["pset-6"]).toEqual(moved);
    const classMoved = classroomReducer(ready, { type: "groups/move", student: "sam", to: "mint" });
    expect(created(classMoved, now).assignmentGroups?.["pset-6"]).toEqual(classMoved.groups);
  });

  it("a No review pathway creates too, and the draft and its review are cleared", () => {
    const c = created({ ...ready, review: { ...review, pathway: [] } }, now);
    expect(c.assignment?.pathway).toEqual([]);
    expect([c.draft, c.review]).toEqual([null, null]);
  });
});
