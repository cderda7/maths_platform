import { describe, expect, it } from "vitest";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import type { Pathway } from "@/data/types";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { canForce, classStages, currentClassStage, FORCE_KIND, pathwayStages, stagePillState, type ClassStageId } from "./classStage";
import { DEMO_PATHWAY, demoSend, skipFixture, teacherSkip } from "./demo";
import { allPathways, nextStage } from "./pathway";
import { ARRIVAL_OFFSETS_MS, CLASS_SIZE, LAST_ARRIVAL_MS } from "./readiness";

/** The class the counts are over: twenty, less Chloe, absent on Problem Set 6 (ticket 250). */
const PRESENT = CLASS_SIZE - 1;
import { INITIAL_SESSION, sessionAt, type StudentSession } from "./session";

const now = 1_700_000_000_000;
const words = (c: ClassroomState, s: Parameters<typeof classStages>[1]) => classStages(c, s, now).map((x) => `${x.word}:${x.state}${x.done === null ? "" : ` ${x.done}/${x.total}`}`);

describe("the class's stage on the pathway", () => {
  it("names every stage of the pathway, the working first", () => {
    const { classroom } = skipFixture("start", now);
    expect(classStages(classroom, null, now).map((s) => s.word)).toEqual(["indiv working", "indiv review", "group review", "class review"]);
    expect(classStages(INITIAL_CLASSROOM, null, now).map((s) => s.id)).toEqual(["working", "individual", "group", "whole-class"]);
  });

  it("starts on the working, counting the classmates who have handed the set in, whole or in part", () => {
    const { classroom, session } = skipFixture("working", now);
    const finished = CLASSMATES.filter((m) => m.done > 0).length;
    expect(finished).toBe(CLASSMATES.length - 1);
    expect(words(classroom, session)).toEqual([`indiv working:current ${finished}/${PRESENT}`, "indiv review:ahead", "group review:ahead", "class review:ahead"]);
  });

  it("moves to individual review when the live student hands in; the working is over", () => {
    const { classroom, session } = skipFixture("indiv review", now);
    expect(currentClassStage(classroom, session, now)).toBe("individual");
    expect(words(classroom, session)).toEqual([`indiv working:over`, `indiv review:current 0/${PRESENT}`, "group review:ahead", "class review:ahead"]);
  });

  it("counts the class in at the gate while individual review is current", () => {
    const { classroom, session } = skipFixture("class wait", now);
    expect(words(classroom, session)[1]).toBe(`indiv review:current 1/${PRESENT}`);
    const first = Math.min(...Object.values(ARRIVAL_OFFSETS_MS));
    expect(classStages(classroom, session, now + first)[1].done).toBe(2);
    // Everyone in: the gate opens and group review is the stage, nothing done yet.
    const later = now + LAST_ARRIVAL_MS;
    expect(classStages(classroom, session, later).map((s) => s.state)).toEqual(["over", "over", "current", "ahead"]);
  });

  it("counts the members of finished groups during group review", () => {
    const { classroom, session } = skipFixture("group review", now);
    const stages = classStages(classroom, session, now);
    expect(stages.map((s) => s.state)).toEqual(["over", "over", "current", "ahead"]);
    const atStart = stages[2].done!;
    const tenMinutes = classStages(classroom, session, now + 10 * 60_000)[2].done!;
    expect(tenMinutes).toBeGreaterThan(atStart);
    expect(tenMinutes).toBeLessThanOrEqual(PRESENT);
  });

  it("is class review while the teacher projects, with no per-student count, and nothing once the session ends", () => {
    const { classroom, session } = skipFixture("class review", now);
    expect(words(classroom, session)).toEqual(["indiv working:over", "indiv review:over", "group review:over", "class review:current"]);
    const ended = classroomReducer(classroom, { type: "wc/end" });
    expect(currentClassStage(ended, session, now)).toBeNull();
    expect(classStages(ended, session, now).map((s) => s.state)).toEqual(["over", "over", "over", "over"]);
  });

  it("gives the student's header strip the same stages, without the counts (ticket 151)", () => {
    for (const target of ["start", "working", "indiv review", "class wait", "group review", "class review", "report"] as const) {
      const { classroom, session } = skipFixture(target, now);
      const strip = pathwayStages(classroom, session, now);
      expect(strip).toEqual(classStages(classroom, session, now).map(({ id, word, state }) => ({ id, word, state })));
      expect(strip.map((s) => s.word)).toEqual(["indiv working", "indiv review", "group review", "class review"]);
      expect(strip.filter((s) => s.state === "current").length).toBeLessThanOrEqual(1);
    }
    expect(pathwayStages(skipFixture("working", now).classroom, skipFixture("working", now).session, now).map((s) => s.state)).toEqual(["current", "ahead", "ahead", "ahead"]);
    expect(pathwayStages(skipFixture("group review", now).classroom, skipFixture("group review", now).session, now).map((s) => s.state)).toEqual(["over", "over", "current", "ahead"]);
    expect(pathwayStages(skipFixture("class review", now).classroom, skipFixture("class review", now).session, now).map((s) => s.state)).toEqual(["over", "over", "over", "current"]);
  });

  it("force submit: one advance kind per stage the students work through, enabled while the live student is on it", () => {
    expect(FORCE_KIND).toEqual({ working: "force-submit", individual: "force-review", group: "force-group", "whole-class": null });
    const { classroom } = skipFixture("start", now);
    // The working: before any session, and up to the working; not once handed in.
    expect(canForce("working", classroom, null)).toBe(true);
    for (const stage of ["overview", "confidence", "warmup-chat", "practice", "working"] as const) expect(canForce("working", classroom, sessionAt(stage)), stage).toBe(true);
    expect(canForce("working", classroom, sessionAt("feedback"))).toBe(false);
    // Individual review: correcting or waiting at the gate.
    expect(canForce("individual", classroom, sessionAt("feedback"))).toBe(true);
    expect(canForce("individual", classroom, sessionAt("class-wait"))).toBe(true);
    expect(canForce("individual", classroom, sessionAt("working"))).toBe(false);
    expect(canForce("individual", classroom, sessionAt("group"))).toBe(false);
    expect(canForce("individual", classroom, null)).toBe(false);
    // Group review: on the board, until the run is done.
    const group = skipFixture("group review", now);
    expect(canForce("group", group.classroom, group.session)).toBe(true);
    expect(canForce("group", classroomReducer(group.classroom, { type: "group/end", at: now }), group.session)).toBe(false);
    expect(canForce("group", group.classroom, sessionAt("waiting"))).toBe(false);
    // Class review: never; and nothing while the teacher projects.
    const wc = skipFixture("class review", now);
    expect(canForce("whole-class", wc.classroom, wc.session)).toBe(false);
    expect(canForce("group", wc.classroom, sessionAt("group"))).toBe(false);
  });

  it("skips stages the pathway lacks", () => {
    let c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "t", problemIds: ASSIGNMENT.problems.map((p) => p.id), pathway: ["whole-class"], at: now });
    expect(classStages(c, sessionAt("waiting"), now).map((s) => `${s.id}:${s.state}`)).toEqual(["working:current", "whole-class:ahead"]);
    c = classroomReducer(c, { type: "wc/setup", problems: [ASSIGNMENT.problems[0].id], examples: {}, mode: "frozen" });
    c = classroomReducer(c, { type: "wc/project", at: now });
    expect(classStages(c, sessionAt("frozen"), now).map((s) => `${s.id}:${s.state}`)).toEqual(["working:over", "whole-class:current"]);
    expect(DEMO_PATHWAY).toEqual(["individual", "group", "whole-class"]);
  });
});

describe("the stage pill's four states (ticket 334)", () => {
  type Point = { label: string; classroom: ClassroomState; session: StudentSession; at?: number };
  const pills = ({ classroom, session, at = now }: Point) => classStages(classroom, session, at).map((s) => `${s.id}:${stagePillState(s)}`);
  /** What the strip should read with the class on `current` (null: the lesson over), `finished` when everyone in the room is done with it. */
  const expected = (pathway: Pathway, current: ClassStageId | null, finished = false) => {
    const ids: ClassStageId[] = ["working", ...pathway];
    const at = current === null ? ids.length : ids.indexOf(current);
    return ids.map((id, i) => `${id}:${i < at ? "over" : i > at ? "ahead" : finished ? "finished" : "current"}`);
  };

  it("reads the state off the stage and its count: finished only when current and everyone in the room is done", () => {
    expect(stagePillState({ state: "over", done: null, total: 19 })).toBe("over");
    expect(stagePillState({ state: "ahead", done: null, total: 19 })).toBe("ahead");
    expect(stagePillState({ state: "current", done: 18, total: 19 })).toBe("current");
    expect(stagePillState({ state: "current", done: 19, total: 19 })).toBe("finished");
    // Class review has no per-student count, and an empty room finishes nothing.
    expect(stagePillState({ state: "current", done: null, total: 19 })).toBe("current");
    expect(stagePillState({ state: "current", done: 0, total: 0 })).toBe("current");
  });

  it("gives every stage its state at every point of the lesson, on every pathway", () => {
    const groupDone = skipFixture("report", now).classroom.group;
    expect(groupDone?.done).toBeTruthy();
    for (const pathway of allPathways()) {
      const name = pathway.join(",") || "no review";
      const sent = classroomReducer(INITIAL_CLASSROOM, demoSend(pathway, now));
      const handedIn = sessionAt(nextStage(pathway, "handed-in"));
      const points: { point: Point; strip: string[] }[] = [
        { point: { label: "fresh", classroom: sent, session: INITIAL_SESSION }, strip: expected(pathway, "working") },
        { point: { label: "working", classroom: sent, session: sessionAt("working") }, strip: expected(pathway, "working") },
      ];
      // Everyone handed in: individual review starts on the hand-in; any other next stage waits for the gate, the projection or the teacher.
      points.push({ point: { label: "everyone handed in", classroom: sent, session: handedIn }, strip: pathway.includes("individual") ? expected(pathway, "individual") : expected(pathway, "working", true) });
      if (pathway.includes("individual")) {
        const arrived = classroomReducer(sent, { type: "class/arrive", student: DEMO_STUDENT.id, at: now });
        const gate = sessionAt("class-wait");
        points.push({ point: { label: "individual review", classroom: arrived, session: gate }, strip: expected(pathway, "individual") });
        // Every correction in: group review's gate opens at once; without group review the class stays on individual review, finished.
        points.push({ point: { label: "every correction in", classroom: arrived, session: gate, at: now + LAST_ARRIVAL_MS + 10 }, strip: pathway.includes("group") ? expected(pathway, "group") : expected(pathway, "individual", true) });
      }
      // The teacher moves the class on stage by stage from the working (the presenter's "students done with current stage").
      let lesson = { classroom: sent, session: sessionAt("working") };
      for (const stage of pathway) {
        lesson = teacherSkip("done", lesson.classroom, lesson.session, now);
        points.push({ point: { label: stage, ...lesson }, strip: expected(pathway, stage) });
        if (stage === "group") points.push({ point: { label: "every group finished", classroom: { ...lesson.classroom, group: groupDone! }, session: lesson.session }, strip: expected(pathway, "group", true) });
      }
      const over = teacherSkip("completed", lesson.classroom, lesson.session, now);
      points.push({ point: { label: "lesson over", ...over }, strip: expected(pathway, null) });
      for (const { point, strip } of points) expect(pills(point), `${name}: ${point.label}`).toEqual(strip);
    }
  });

  it("never shows finished on the student's strip, which has no counts", () => {
    const { classroom } = skipFixture("report", now);
    expect(classStages(classroom, sessionAt("report"), now).map(stagePillState)).toContain("finished");
    expect(pathwayStages(classroom, sessionAt("report"), now).map((s) => s.state)).not.toContain("finished");
  });
});
