import { describe, expect, it } from "vitest";
import type { Pathway } from "@/data/types";
import { classroomReducer, endLessonAwaited, GRACE_MS, INITIAL_CLASSROOM, isDue, isPending, lessonOver, STALE_MS, type ClassroomState } from "./classroom";
import { canEndLesson, canForce, classStages, currentClassStage, endsLesson, otherAdvancePending, type ClassStageId } from "./classStage";
import { classroomCards } from "./classroomCards";
import { boardContent } from "./board";
import { studentSection } from "./studentClassroom";
import { teacherSkip, type DemoState } from "./demo";
import { DEFAULT_ENV, ENDED_LESSON_TEXT, INITIAL_SESSION, sessionAt, sessionReducer, type StudentSession } from "./session";

/** Ticket 273: the teacher's "end lesson" on a pathway whose last stage is not class review. */
const now = 1_700_000_000_000;
const PROBLEMS = ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"];
const created = (pathway: Pathway): DemoState => ({ classroom: classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Problem Set 6", problemIds: PROBLEMS, pathway, at: now, startedAt: now }), session: INITIAL_SESSION });
const done = (s: DemoState) => teacherSkip("done", s.classroom, s.session, now);
/** The class on the pathway's last stage, by the presenter's "students done" from the set sent. */
const onLast = (pathway: Pathway): DemoState => {
  let s = created(pathway);
  for (let i = 0; i < pathway.length; i++) s = done(s);
  return s;
};
const card = (s: DemoState, at = now) => {
  const cards = classroomCards(s.classroom, s.session, at);
  return [...cards.live, ...cards.past].find((k) => k.id === "pset-6") ?? null;
};
const start = (c: ClassroomState, at = now) => classroomReducer(c, { type: "advance/start", kind: "end-lesson", at });
const envOf = (c: ClassroomState) => ({ ...DEFAULT_ENV, pathway: c.assignment?.pathway ?? DEFAULT_ENV.pathway });
/** What a student tab and the teacher's tab do when the minute is out. */
const land = (s: DemoState): DemoState => {
  const a = s.classroom.advance!;
  return { classroom: classroomReducer(s.classroom, { type: "lesson/end", at: a.deadline }), session: sessionReducer(s.session, { type: "advance/apply", id: a.id, kind: a.kind, at: a.deadline }, envOf(s.classroom)) };
};

describe("end lesson (ticket 273)", () => {
  it("goes only on the pathway's last stage, never on class review", () => {
    const where = (pathway: Pathway) => (["working", "individual", "group", "whole-class"] as ClassStageId[]).filter((id) => endsLesson(id, created(pathway).classroom));
    expect(where(["individual", "group"])).toEqual(["group"]);
    expect(where(["individual"])).toEqual(["individual"]);
    expect(where(["group"])).toEqual(["group"]);
    expect(where([])).toEqual(["working"]);
    expect(where(["individual", "group", "whole-class"])).toEqual([]);
    expect(where(["group", "whole-class"])).toEqual([]);
    expect(where(["whole-class"])).toEqual([]);
  });

  it("can start only while the class is on that stage: not before, not once over, not while a minute already runs", () => {
    for (const pathway of [["individual", "group"], ["individual"], ["group"], []] as Pathway[]) {
      let s = created(pathway);
      const last: ClassStageId = pathway[pathway.length - 1] ?? "working";
      for (let i = 0; i < pathway.length; i++) {
        const id = currentClassStage(s.classroom, s.session, now)!;
        expect(canEndLesson(id, s.classroom, s.session, now), `${pathway} ${id}`).toBe(false);
        s = done(s);
      }
      expect(currentClassStage(s.classroom, s.session, now), pathway.join()).toBe(last);
      expect(canEndLesson(last, s.classroom, s.session, now), pathway.join()).toBe(true);
      // Its own minute running: the pill has given way to the countdown.
      expect(canEndLesson(last, start(s.classroom), s.session, now + 1000)).toBe(false);
      // A force submit's minute running: wait for it (or Cancel it).
      const forced = classroomReducer(s.classroom, { type: "advance/start", kind: "force-group", at: now });
      expect(canEndLesson(last, forced, s.session, now + 1000)).toBe(false);
      expect(canEndLesson(last, forced, s.session, now + GRACE_MS)).toBe(true);
      // Over: no current stage.
      const over = land({ classroom: start(s.classroom), session: s.session });
      expect(canEndLesson(last, over.classroom, over.session, now + GRACE_MS)).toBe(false);
    }
  });

  it("stays on once everyone is done with the stage, where force submit has nothing left to do", () => {
    const s = onLast(["individual", "group"]);
    const finished = classroomReducer(s.classroom, { type: "group/end", at: now });
    expect(canForce("group", finished, s.session)).toBe(false);
    expect(canEndLesson("group", finished, s.session, now)).toBe(true);
    const reported: StudentSession = { ...s.session, stage: "report" };
    expect(canEndLesson("group", finished, reported, now)).toBe(true);
  });

  it("force submit waits while end lesson's minute runs, and end lesson's own pending is not another's", () => {
    const c = start(onLast(["individual", "group"]).classroom);
    expect(otherAdvancePending(c, now + 1000, "force-group")).toBe(true);
    expect(otherAdvancePending(c, now + 1000, "end-lesson")).toBe(false);
    expect(otherAdvancePending(c, now + GRACE_MS, "force-group")).toBe(false);
  });

  it("the grace: a minute from the press, pending until then and due after, Cancel takes it back with nothing ended", () => {
    const s = onLast(["individual", "group"]);
    const c = start(s.classroom);
    expect(c.advance).toEqual({ id: `end-lesson@${now}`, kind: "end-lesson", deadline: now + GRACE_MS });
    expect(isPending(c, now + GRACE_MS - 1)).toBe(true);
    expect(isDue(c, now + GRACE_MS - 1)).toBe(false);
    expect(isDue(c, now + GRACE_MS)).toBe(true);
    // Nothing moves during the minute.
    expect(lessonOver(c)).toBe(false);
    expect(currentClassStage(c, s.session, now + GRACE_MS - 1)).toBe("group");
    expect(card({ classroom: c, session: s.session })?.section).toBe("live");
    const cancelled = classroomReducer(c, { type: "advance/clear" });
    expect(cancelled.advance).toBeNull();
    expect(canEndLesson("group", cancelled, s.session, now + 1000)).toBe(true);
  });

  it("once the minute is out: the lesson over at the deadline, the set in Past, the board blank, the group run ended where it stands, Sam on his report", () => {
    for (const pathway of [["individual", "group"], ["individual"], ["group"], []] as Pathway[]) {
      const s = onLast(pathway);
      const at = now + GRACE_MS;
      const ended = land({ classroom: start(s.classroom), session: s.session });
      expect(ended.classroom.lessonEndedAt, pathway.join()).toBe(at);
      expect(lessonOver(ended.classroom)).toBe(true);
      expect(currentClassStage(ended.classroom, ended.session, at)).toBeNull();
      expect(classStages(ended.classroom, ended.session, at).every((x) => x.state === "over")).toBe(true);
      expect(card(ended, at)).toMatchObject({ section: "past", status: "done" });
      expect(boardContent(ended.classroom, ended.session, at).kind).toBe("blank");
      expect(ended.session.stage, pathway.join()).toBe("report");
      expect(ended.session.notice).toBe(ENDED_LESSON_TEXT);
      // His report to write: the set stays in his To do until he sends it.
      expect(studentSection("pset-6", ended.classroom, ended.session, at)).toBe("todo");
      if (pathway.includes("group")) {
        expect(s.classroom.group?.done).toBe(false);
        expect(ended.classroom.group).toMatchObject({ done: true, endedAt: at });
      }
    }
  });

  it("a student tab waits for the advance, not its own group done, while end lesson is still to be applied to it", () => {
    const s = onLast(["individual", "group"]);
    const c = classroomReducer(start(s.classroom), { type: "lesson/end", at: now + GRACE_MS });
    const id = c.advance!.id;
    expect(endLessonAwaited(c, [], now + 1000)).toBe(true);
    expect(endLessonAwaited(c, [], now + GRACE_MS - 500)).toBe(true);
    expect(endLessonAwaited(c, [], now + GRACE_MS + STALE_MS - 1)).toBe(true);
    expect(endLessonAwaited(c, [id], now + GRACE_MS)).toBe(false);
    // Too late to apply: group done moves the student on as before.
    expect(endLessonAwaited(c, [], now + GRACE_MS + STALE_MS)).toBe(false);
    expect(endLessonAwaited(classroomReducer(s.classroom, { type: "advance/start", kind: "force-group", at: now }), [], now)).toBe(false);
    expect(endLessonAwaited(s.classroom, [], now)).toBe(false);
  });

  it("lesson/end is idempotent and keeps the first moment; a group run already done keeps its own end", () => {
    const s = onLast(["individual", "group"]);
    const once = classroomReducer(s.classroom, { type: "lesson/end", at: 5 });
    expect(classroomReducer(once, { type: "lesson/end", at: 9 })).toBe(once);
    const finished = classroomReducer(s.classroom, { type: "group/end", at: 3 });
    expect(classroomReducer(finished, { type: "lesson/end", at: 5 }).group).toBe(finished.group);
    // Class review's End already ended it.
    const wc = { ...INITIAL_CLASSROOM, wholeClass: { problems: [], examples: {}, slide: 0, view: "unmarked" as const, status: "ended" as const, modes: {}, ink: {} } };
    expect(classroomReducer(wc, { type: "lesson/end", at: 5 })).toBe(wc);
    // A new set sent starts without it.
    const again = classroomReducer(once, { type: "assignment/create", title: "t", problemIds: PROBLEMS, pathway: ["individual"], at: now });
    expect(again.lessonEndedAt).toBeUndefined();
  });

  it("a student still in the lesson lands on the report with the work as it stands; one past it only records the id", () => {
    const apply = (s: StudentSession) => sessionReducer(s, { type: "advance/apply", id: "e1", kind: "end-lesson", at: 42 }, { ...DEFAULT_ENV, pathway: ["individual", "group"] });
    for (const stage of ["overview", "confidence", "working"] as const) {
      const s = apply(sessionAt(stage));
      expect(s.stage, stage).toBe("report");
      expect(s.handedInAt, stage).toBe(42);
      expect(s.notAttempted.length, stage).toBeGreaterThan(0);
      expect(s.notice).toBe(ENDED_LESSON_TEXT);
    }
    const correcting = apply(sessionAt("feedback"));
    expect([correcting.stage, correcting.reworkedAt]).toEqual(["report", 42]);
    expect(correcting.handedInAt).toBe(sessionAt("feedback").handedInAt);
    for (const stage of ["class-wait", "waiting", "group"] as const) expect(apply(sessionAt(stage)).stage, stage).toBe("report");
    for (const stage of ["report", "homework"] as const) {
      const s = apply(sessionAt(stage));
      expect(s.stage, stage).toBe(stage);
      expect(s.notice).toBe(sessionAt(stage).notice);
      expect(s.appliedAdvances).toEqual(["e1"]);
    }
    // Applied once by id.
    const twice = apply(apply(sessionAt("group")));
    expect(twice.appliedAdvances).toEqual(["e1"]);
  });
});
