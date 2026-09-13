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
  it("Problem Set 2 is Problem Set 6 and Problem Set 1 is Problem Set 5, under their new ids and dates", () => {
    expect(ASSIGNMENT).toMatchObject({ id: "pset-6", title: "PROBLEM SET 6 — ROOTS OF A QUADRATIC", due: "Thu 10 Sep" });
    expect(PS5_ASSIGNMENT).toMatchObject({ id: "pset-5", title: "PROBLEM SET 5 — FEATURES OF A PARABOLA", due: "Mon 7 Sep" });
    expect(PS5_ASSIGNMENT.problems.map((p) => p.id)).toEqual(Array.from({ length: 10 }, (_, i) => `ps5-q${i + 1}`));
    expect(DEMO_DRAFT_TITLE).toBe("Problem Set 6 — Roots of a quadratic");
    expect(isAssignmentId("pset-2")).toBe(false);
    expect(isAssignmentId("pset-1")).toBe(false);
  });

  it("maps every old id and seeded title to the new one, and leaves anything else alone", () => {
    expect(RENAMED_SET_IDS).toEqual({ "pset-2": "pset-6", "pset-1": "pset-5" });
    expect(currentSetId("pset-2")).toBe(ASSIGNMENT.id);
    expect(currentSetId("pset-1")).toBe(PS5_ASSIGNMENT.id);
    expect(currentSetId("pset-6")).toBe("pset-6");
    expect(Object.values(RENAMED_SET_IDS).every(isAssignmentId)).toBe(true);
    expect(currentSetTitle("PROBLEM SET 2 — ROOTS OF A QUADRATIC")).toBe(ASSIGNMENT.title);
    expect(currentSetTitle("Problem Set 2 — Roots of a quadratic")).toBe(DEMO_DRAFT_TITLE);
    expect(currentSetTitle("Quadratics quiz")).toBe("Quadratics quiz");
    expect(Object.keys(RENAMED_SET_TITLES)).toHaveLength(2);
  });

  it("redirects the old routes, the landing and every tab, to the new id", async () => {
    const rules = await nextConfig.redirects!();
    expect(rules).toEqual([
      { source: "/teacher/a/pset-2", destination: "/teacher/a/pset-6", permanent: false },
      { source: "/teacher/a/pset-2/:path*", destination: "/teacher/a/pset-6/:path*", permanent: false },
      { source: "/teacher/a/pset-1", destination: "/teacher/a/pset-5", permanent: false },
      { source: "/teacher/a/pset-1/:path*", destination: "/teacher/a/pset-5/:path*", permanent: false },
    ]);
  });

  it("a classroom stored before the rename loads under the new ids and titles, with its groups and progress", () => {
    const created = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "PROBLEM SET 2 — ROOTS OF A QUADRATIC", problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["individual", "group"], goal: ASSIGNMENT.goal, at: now });
    const moved = classroomReducer(created, { type: "groups/move", student: "jordan", to: "mint", assignment: "pset-6" });
    const liveGroups = moved.assignmentGroups!["pset-6"];
    const ps5Groups = classroomReducer(INITIAL_CLASSROOM, { type: "groups/move", student: "priya", to: "sky", assignment: "pset-5" }).assignmentGroups!["pset-5"];
    const old: ClassroomState = { ...moved, draft: { ...generatedDraft(now), title: "Problem Set 2 — Roots of a quadratic" }, assignmentGroups: { "pset-2": liveGroups, "pset-1": ps5Groups }, arrivals: { sam: now } };
    const read = migrateClassroom(JSON.parse(JSON.stringify(old)));
    expect(Object.keys(read.assignmentGroups!).sort()).toEqual(["pset-5", "pset-6"]);
    expect(read.assignment!.title).toBe(ASSIGNMENT.title);
    expect(read.draft!.title).toBe(DEMO_DRAFT_TITLE);
    expect(read.arrivals).toEqual({ sam: now });
    expect(read.assignment!.startedAt).toBe(now);
    expect(assignmentIds(read).slice(0, 2)).toEqual(["pset-6", "pset-5"]);
    const live = assignmentBundle("pset-6", read)!;
    expect(live).toMatchObject({ name: "Problem Set 6 — Roots of a quadratic", title: ASSIGNMENT.title });
    expect(live.groups.mint).toContain("jordan");
    expect(assignmentBundle("pset-5", read)!.groups.sky).toContain("priya");
  });

  it("a teacher's own title is kept, a copy already under a new id wins, and a current classroom comes back as it is", () => {
    const created = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Quadratics quiz", problemIds: ["q1"], pathway: ["individual"], at: now });
    const mixed: ClassroomState = { ...created, assignmentGroups: { "pset-2": DEFAULT_GROUPS, "pset-6": { ...DEFAULT_GROUPS, mint: ["jordan"] } } };
    const read = migrateClassroom(mixed);
    expect(read.assignment!.title).toBe("Quadratics quiz");
    expect(read.assignmentGroups).toEqual({ "pset-6": { ...DEFAULT_GROUPS, mint: ["jordan"] } });
    expect(migrateClassroom(created)).toBe(created);
    expect(migrateClassroom(INITIAL_CLASSROOM)).toBe(INITIAL_CLASSROOM);
  });

  it("every simulated history date still sits before Problem Set 5's Mon 7 Sep", () => {
    for (const p of categoryHistory(PS5_ASSIGNMENT, "mia", "algebra", "solid")) expect(parseDay(p.date)!, p.date).toBeLessThan(parseDay("Mon 7 Sep")!);
  });
});
