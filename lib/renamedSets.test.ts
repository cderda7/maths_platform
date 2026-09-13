import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { DEFAULT_GROUPS } from "@/data/groups";
import { PS5_ASSIGNMENT } from "@/data/pset5/assignment";
import { DEMO_DRAFT_TITLE } from "@/data/draft-seed";
import nextConfig from "@/next.config";
import { assignmentBundle, assignmentIds, isAssignmentId } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM, migrateClassroom, type ClassroomState } from "./classroom";
import { generatedDraft } from "./draft";
import { parseDay } from "./history";
import { categoryHistory } from "./setHistory";
import { currentSetId, currentSetTitle, RENAMED_SET_IDS, RENAMED_SET_TITLES } from "./renamedSets";

const now = 1_700_000_000_000;

describe("the sets renamed (ticket 208)", () => {
  it("Problem Set 2 is Problem Set 6 and Problem Set 1 is Problem Set 5, under their new ids and dates; pset-1 and pset-2 are the real Problem Sets 1 and 2 now (tickets 211, 212)", () => {
    expect(ASSIGNMENT).toMatchObject({ id: "pset-6", title: "PROBLEM SET 6 — ROOTS OF A QUADRATIC", due: "Thu 10 Sep" });
    expect(PS5_ASSIGNMENT).toMatchObject({ id: "pset-5", title: "PROBLEM SET 5 — FEATURES OF A PARABOLA", due: "Mon 7 Sep" });
    expect(PS5_ASSIGNMENT.problems.map((p) => p.id)).toEqual(Array.from({ length: 10 }, (_, i) => `ps5-q${i + 1}`));
    expect(DEMO_DRAFT_TITLE).toBe("Problem Set 6 — Roots of a quadratic");
    expect(isAssignmentId("pset-2")).toBe(true);
    expect(assignmentBundle("pset-2", INITIAL_CLASSROOM)).toMatchObject({ name: "Problem Set 2 — Rationalising and expanding with surds", due: "Fri 28 Aug" });
    expect(isAssignmentId("pset-1")).toBe(true);
    expect(assignmentBundle("pset-1", INITIAL_CLASSROOM)).toMatchObject({ name: "Problem Set 1 — Surds", due: "Tue 25 Aug" });
  });

  it("maps every old seeded title to the new one, no id any more, and leaves anything else alone", () => {
    expect(RENAMED_SET_IDS).toEqual({});
    expect(currentSetId("pset-2")).toBe("pset-2");
    expect(currentSetId("pset-1")).toBe("pset-1");
    expect(currentSetId("pset-6")).toBe("pset-6");
    expect(currentSetTitle("PROBLEM SET 2 — ROOTS OF A QUADRATIC")).toBe(ASSIGNMENT.title);
    expect(currentSetTitle("Problem Set 2 — Roots of a quadratic")).toBe(DEMO_DRAFT_TITLE);
    expect(currentSetTitle("Quadratics quiz")).toBe("Quadratics quiz");
    expect(Object.keys(RENAMED_SET_TITLES)).toHaveLength(2);
  });

  it("redirects nothing: every old id is a real set's id now (tickets 211, 212)", async () => {
    expect(await nextConfig.redirects!()).toEqual([]);
  });

  it("a classroom stored before the rename loads under the new ids and titles, with its groups and progress; seating stored under pset-1 and pset-2 stays Problem Sets 1 and 2's", () => {
    const created = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "PROBLEM SET 2 — ROOTS OF A QUADRATIC", problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], goal: ASSIGNMENT.goal, at: now });
    const moved = classroomReducer(created, { type: "groups/move", student: "jordan", to: "mint", assignment: "pset-6" });
    const liveGroups = moved.assignmentGroups!["pset-6"];
    const ps2Groups = classroomReducer(INITIAL_CLASSROOM, { type: "groups/move", student: "noah", to: "sky", assignment: "pset-2" }).assignmentGroups!["pset-2"];
    const ps1Groups = classroomReducer(INITIAL_CLASSROOM, { type: "groups/move", student: "priya", to: "sky", assignment: "pset-1" }).assignmentGroups!["pset-1"];
    const old: ClassroomState = { ...moved, draft: { ...generatedDraft(now), title: "Problem Set 2 — Roots of a quadratic" }, assignmentGroups: { "pset-6": liveGroups, "pset-2": ps2Groups, "pset-1": ps1Groups }, arrivals: { sam: now } };
    const read = migrateClassroom(JSON.parse(JSON.stringify(old)));
    expect(Object.keys(read.assignmentGroups!).sort()).toEqual(["pset-1", "pset-2", "pset-6"]);
    expect(read.assignment!.title).toBe(ASSIGNMENT.title);
    expect(read.draft!.title).toBe(DEMO_DRAFT_TITLE);
    expect(read.arrivals).toEqual({ sam: now });
    expect(read.assignment!.startedAt).toBe(now);
    expect(assignmentIds(read).slice(0, 2)).toEqual(["pset-6", "pset-5"]);
    const live = assignmentBundle("pset-6", read)!;
    expect(live).toMatchObject({ name: "Problem Set 6 — Roots of a quadratic", title: ASSIGNMENT.title });
    expect(live.groups.mint).toContain("jordan");
    expect(assignmentBundle("pset-1", read)!.groups.sky).toContain("priya");
    expect(assignmentBundle("pset-5", read)!.groups.sky).not.toContain("priya");
    expect(assignmentBundle("pset-2", read)!.groups.sky).toContain("noah");
    expect(live.groups.sky).not.toContain("noah");
  });

  it("a teacher's own title is kept, every set's seating stays under its own id, and a current classroom comes back as it is", () => {
    const created = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Quadratics quiz", problemIds: ["q1"], pathway: ["individual"], at: now });
    const mixed: ClassroomState = { ...created, assignmentGroups: { "pset-2": DEFAULT_GROUPS, "pset-6": { ...DEFAULT_GROUPS, mint: ["jordan"] } } };
    const read = migrateClassroom(mixed);
    expect(read.assignment!.title).toBe("Quadratics quiz");
    expect(read.assignmentGroups).toEqual(mixed.assignmentGroups);
    expect(migrateClassroom(created)).toBe(created);
    expect(migrateClassroom(INITIAL_CLASSROOM)).toBe(INITIAL_CLASSROOM);
  });

  it("every history date on Problem Set 5 sits before its Mon 7 Sep", () => {
    for (const p of categoryHistory(PS5_ASSIGNMENT.id, "mia", "algebra")) expect(parseDay(p.date)!, p.date).toBeLessThan(parseDay("Mon 7 Sep")!);
  });
});
