import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { classStages, currentClassStage } from "./classStage";
import { DEMO_PATHWAY, skipFixture } from "./demo";
import { ARRIVAL_OFFSETS_MS, CLASS_SIZE, LAST_ARRIVAL_MS } from "./readiness";
import { sessionAt } from "./session";

const N = ASSIGNMENT.problems.length;
const now = 1_700_000_000_000;
const words = (c: ClassroomState, s: Parameters<typeof classStages>[1]) => classStages(c, s, now, N).map((x) => `${x.word}:${x.state}${x.done === null ? "" : ` ${x.done}/${x.total}`}`);

describe("the class's stage on the pathway", () => {
  it("names every stage of the pathway, the working first", () => {
    const { classroom } = skipFixture("start", now);
    expect(classStages(classroom, null, now, N).map((s) => s.word)).toEqual(["indiv working", "indiv review", "group review", "class review"]);
    expect(classStages(INITIAL_CLASSROOM, null, now, N).map((s) => s.id)).toEqual(["working", "individual", "group"]);
  });

  it("starts on the working, counting the classmates who have finished the set", () => {
    const { classroom, session } = skipFixture("working", now);
    const finished = CLASSMATES.filter((m) => m.done >= N).length;
    expect(words(classroom, session)).toEqual([`indiv working:current ${finished}/${CLASS_SIZE}`, "indiv review:ahead", "group review:ahead", "class review:ahead"]);
  });

  it("moves to individual review when the live student hands in; the working is over", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    expect(currentClassStage(classroom, session, now)).toBe("individual");
    expect(words(classroom, session)).toEqual([`indiv working:over`, `indiv review:current 0/${CLASS_SIZE}`, "group review:ahead", "class review:ahead"]);
  });

  it("counts the class in at the gate while individual review is current", () => {
    const { classroom, session } = skipFixture("class wait", now);
    expect(words(classroom, session)[1]).toBe(`indiv review:current 1/${CLASS_SIZE}`);
    const first = Math.min(...Object.values(ARRIVAL_OFFSETS_MS));
    expect(classStages(classroom, session, now + first, N)[1].done).toBe(2);
    // Everyone in: the gate opens and group review is the stage, nothing done yet.
    const later = now + LAST_ARRIVAL_MS;
    expect(classStages(classroom, session, later, N).map((s) => s.state)).toEqual(["over", "over", "current", "ahead"]);
  });

  it("counts the members of finished groups during group review", () => {
    const { classroom, session } = skipFixture("group review", now);
    const stages = classStages(classroom, session, now, N);
    expect(stages.map((s) => s.state)).toEqual(["over", "over", "current", "ahead"]);
    const atStart = stages[2].done!;
    const tenMinutes = classStages(classroom, session, now + 10 * 60_000, N)[2].done!;
    expect(tenMinutes).toBeGreaterThan(atStart);
    expect(tenMinutes).toBeLessThanOrEqual(CLASS_SIZE);
  });

  it("is class review while the teacher projects, with no per-student count, and nothing once the session ends", () => {
    const { classroom, session } = skipFixture("class review", now);
    expect(words(classroom, session)).toEqual(["indiv working:over", "indiv review:over", "group review:over", "class review:current"]);
    const ended = classroomReducer(classroom, { type: "wc/end" });
    expect(currentClassStage(ended, session, now)).toBeNull();
    expect(classStages(ended, session, now, N).map((s) => s.state)).toEqual(["over", "over", "over", "over"]);
  });

  it("skips stages the pathway lacks", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "t", problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["whole-class"], at: now });
    expect(classStages(c, sessionAt("waiting"), now, N).map((s) => `${s.id}:${s.state}`)).toEqual(["working:current", "whole-class:ahead"]);
    c = classroomReducer(c, { type: "wc/setup", problems: [ASSIGNMENT.problems[0].id], examples: {}, mode: "frozen" });
    c = classroomReducer(c, { type: "wc/project", at: now });
    expect(classStages(c, sessionAt("frozen"), now, N).map((s) => `${s.id}:${s.state}`)).toEqual(["working:over", "whole-class:current"]);
    expect(DEMO_PATHWAY).toEqual(["individual", "group", "whole-class"]);
  });
});
