import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import type { Pathway } from "@/data/types";
import { canTeacherSkip, DEMO_PATHWAY, deepLinkClassroom, skipFixture, SKIP_STARTED_AGO_MS, SKIP_TARGETS, TEACHER_SKIP_LABEL, TEACHER_SKIP_TARGETS, teacherSkip, type DemoState, type TeacherSkipTarget } from "./demo";
import { classroomReducer, INITIAL_CLASSROOM, isDue, isPending, isProjecting, type ClassroomState } from "./classroom";
import { currentClassStage } from "./classStage";
import { classroomCards } from "./classroomCards";
import { studentClassroom, studentSection } from "./studentClassroom";
import { boardContent } from "./board";
import { assignmentIds } from "./assignments";
import { DEFAULT_PATHWAY } from "./pathway";
import { DEMO_REFLECTION, INITIAL_SESSION } from "./session";
import { classReadiness, LAST_ARRIVAL_MS } from "./readiness";
import { boardOpensAt, introShowing } from "./groupIntro";
import { runStartedAt, visitsOf } from "./groupReview";

describe("skip-to fixtures", () => {
  const now = 1_700_000_000_000;

  it("every target lands on its stage with the three-stage pathway and, except whole-class, no projection", () => {
    const stages = { start: "overview", "warm-up": "warmup-chat", working: "working", "indiv review": "feedback", "class wait": "class-wait", "group review": "group", "class review": "frozen", report: "report", homework: "homework" } as const;
    for (const t of SKIP_TARGETS) {
      const { session, classroom } = skipFixture(t, now);
      expect(session.stage, t).toBe(stages[t]);
      expect(classroom.assignment?.pathway, t).toEqual(["individual", "group", "whole-class"]);
      expect(isProjecting(classroom), t).toBe(t === "class review");
    }
    expect(skipFixture("start", now).session).toEqual(INITIAL_SESSION);
  });

  it("what Sam submitted is the same at every review stage", () => {
    const a = skipFixture("indiv review", now).session.lines;
    for (const t of ["class wait", "group review", "class review", "report", "homework"] as const) expect(skipFixture(t, now).session.lines).toEqual(a);
  });

  it("the group-review jump begins the whiteboard run on the union with the agreed pen order", () => {
    const { classroom } = skipFixture("group review", now);
    // Ticket 278: every problem a member did not get right, Liam's never-reached Q4–Q10 included, so all ten.
    expect(classroom.group?.problems).toEqual(["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"]);
    // The simulation's fixed pens (tickets 228, 278): Sam writes Q1 and Q7, both of Q7's visits.
    expect(classroom.group?.pen).toEqual({ q1: "sam", q2: "zara", q3: "jordan", q4: "liam", q5: "jordan", q6: "zara", q7: "sam", q8: "jordan", q9: "liam", q10: "zara" });
    expect(visitsOf({ ...classroom.group!, left: ["q7"] }).map((v) => v.pen)).toEqual(["sam", "zara", "jordan", "liam", "jordan", "zara", "sam", "jordan", "liam", "zara", "sam"]);
    expect(classroom.group?.index).toBe(0);
    // The jump lands on the intro: the class has just gone in and the board opens once it is read (ticket 220).
    expect(introShowing(classroom.group!, now)).toBe(true);
    expect(runStartedAt(classroom.group!)).toBe(boardOpensAt(now));
  });

  it("the class-wait jump has Sam just arrived and the count climbing; the later jumps have everyone in", () => {
    const wait = skipFixture("class wait", now).classroom;
    expect(classReadiness(wait, now).handedIn).toBe(1);
    expect(classReadiness(wait, now).started).toBe(false);
    expect(classReadiness(wait, now + LAST_ARRIVAL_MS).started).toBe(true);
    for (const t of ["group review", "class review", "report"] as const) expect(classReadiness(skipFixture(t, now).classroom, now).started, t).toBe(true);
  });

  it("the whole-class jump projects the two most-struggled problems with examples, the grace already over", () => {
    const { classroom } = skipFixture("class review", now);
    expect(classroom.wholeClass?.problems).toHaveLength(2);
    for (const id of classroom.wholeClass!.problems) expect(classroom.wholeClass!.examples[id].length).toBeGreaterThanOrEqual(2);
    expect(isPending(classroom, now)).toBe(false);
    expect(isDue(classroom, now)).toBe(true);
  });
});

describe("deep links into the student app send Problem Set 6 first (ticket 264)", () => {
  const now = 1_700_000_000_000;
  const sent = (c: ClassroomState) => assignmentIds(c).includes("pset-6");

  it("a named stage sends the set when nothing is sent, under the default pathway, live for an hour like a skip", () => {
    const c = deepLinkClassroom(INITIAL_CLASSROOM, { explicit: true, pathway: null }, now);
    expect(sent(c)).toBe(true);
    expect(c.assignment?.pathway).toEqual(DEFAULT_PATHWAY);
    expect(c.assignment?.startedAt).toBe(now - SKIP_STARTED_AGO_MS);
    expect(c.assignment?.goal).toBe(ASSIGNMENT.goal);
  });

  it("a set already sent stays as it is", () => {
    const created = skipFixture("working", now - 5000).classroom;
    expect(deepLinkClassroom(created, { explicit: true, pathway: null }, now)).toBe(created);
  });

  it("?pathway= sends the set with that pathway, live from now, whatever is there", () => {
    const c = deepLinkClassroom(skipFixture("working", now - 5000).classroom, { explicit: false, pathway: ["whole-class"] }, now);
    expect(c.assignment?.pathway).toEqual(["whole-class"]);
    expect(c.assignment?.startedAt).toBe(now);
  });

  it("a plain link sends nothing: Problem Set 6 stays out of Sam's Classroom", () => {
    expect(deepLinkClassroom(INITIAL_CLASSROOM, { explicit: false, pathway: null }, now)).toBe(INITIAL_CLASSROOM);
  });

  it("every skip sends the set", () => {
    for (const t of SKIP_TARGETS) expect(sent(skipFixture(t, now).classroom), t).toBe(true);
  });
});

describe("the teacher's presenter jumps (ticket 263)", () => {
  const now = 1_700_000_000_000;
  const fresh: DemoState = { classroom: INITIAL_CLASSROOM, session: INITIAL_SESSION };
  const apply = (t: TeacherSkipTarget, s: DemoState, at = now) => teacherSkip(t, s.classroom, s.session, at);
  // Every starting stage of the demo pathway, reached by the jumps themselves.
  const working = apply("send", fresh);
  const indiv = apply("done", working);
  const group = apply("done", indiv);
  const classReview = apply("done", group);
  const completed = apply("done", classReview);
  const STARTS: Record<string, DemoState> = { "not sent": fresh, working, "individual review": indiv, "group review": group, "class review": classReview, completed };
  const stage = (s: DemoState, at = now) => currentClassStage(s.classroom, s.session, at);
  const card = (s: DemoState) => {
    const cards = classroomCards(s.classroom, s.session, now);
    return [...cards.live, ...cards.past].find((k) => k.id === "pset-6") ?? null;
  };
  const section = (s: DemoState) => studentSection("pset-6", s.classroom, s.session, now);
  const board = (s: DemoState) => boardContent(s.classroom, s.session, now).kind;

  it("the labels read as agreed", () => {
    expect(TEACHER_SKIP_TARGETS.map((t) => TEACHER_SKIP_LABEL[t])).toEqual(["send assignment", "students done with current stage", "activity completed"]);
  });

  it("send assignment, from every stage: PS6 live now under the demo pathway, the stream from zero, Sam at his start with PS6 in To do", () => {
    for (const [name, s] of Object.entries(STARTS)) {
      const r = apply("send", s);
      expect(r.classroom.assignment?.pathway, name).toEqual(DEMO_PATHWAY);
      expect(r.classroom.assignment?.startedAt, name).toBe(now);
      expect(r.session, name).toEqual(INITIAL_SESSION);
      expect(stage(r), name).toBe("working");
      expect(card(r), name).toMatchObject({ section: "live", status: "live", submitted: 0 });
      expect(studentClassroom(r.classroom, r.session, now).todo.map((k) => [k.id, k.action]), name).toEqual([["pset-6", "start"]]);
      // A new lesson: nothing an earlier one left.
      for (const k of ["arrivals", "group", "diagnostics", "lessonEndedAt"] as const) expect(r.classroom[k], `${name} ${k}`).toBeUndefined();
      expect([r.classroom.advance, r.classroom.wholeClass], name).toEqual([null, null]);
      expect(board(r), name).toBe("blank");
    }
  });

  it("students done is off before the set is sent and changes nothing there", () => {
    expect(canTeacherSkip("done", INITIAL_CLASSROOM)).toBe(false);
    expect(canTeacherSkip("send", INITIAL_CLASSROOM) && canTeacherSkip("completed", INITIAL_CLASSROOM)).toBe(true);
    for (const s of [working, indiv, group, classReview, completed]) expect(canTeacherSkip("done", s.classroom)).toBe(true);
    expect(apply("done", fresh)).toEqual(fresh);
  });

  it("students done steps the class, Sam, the Classroom cards, his Classroom and the board through every stage of the demo pathway", () => {
    const steps = [working, indiv, group, classReview, completed];
    expect(steps.map((s) => stage(s))).toEqual(["working", "individual", "group", "whole-class", null]);
    expect(steps.map((s) => s.session.stage)).toEqual(["overview", "feedback", "group", "frozen", "homework"]);
    expect(steps.map((s) => card(s)?.section)).toEqual(["live", "live", "live", "live", "past"]);
    expect(steps.map((s) => card(s)?.status)).toEqual(["live", "in review", "in review", "in review", "done"]);
    expect(steps.map(section)).toEqual(["todo", "todo", "todo", "todo", "completed"]);
    expect(steps.map(board)).toEqual(["blank", "blank", "group", "whole-class", "blank"]);
  });

  it("each done lands where Sam's own skip to that stage does: the same work, the same class", () => {
    expect(indiv.session).toEqual(skipFixture("indiv review", now).session);
    expect(group.session).toEqual(skipFixture("group review", now).session);
    expect(classReview.session).toEqual(skipFixture("class review", now).session);
    expect({ ...completed.session, homeworkAt: 0 }).toEqual({ ...skipFixture("homework", now).session, homeworkAt: 0 });
    expect(completed.session.homeworkAt).toBe(now);
    // Working over: everyone who started has handed in, and the stream is at its end.
    expect(card(indiv)?.submitted).toBe(card(skipFixture("indiv review", now))?.submitted);
    expect(indiv.classroom.assignment!.startedAt).toBeLessThanOrEqual(now - SKIP_STARTED_AGO_MS);
    // Group review at its intro, everyone through the gate, the agreed pens.
    expect(classReadiness(group.classroom, now).started).toBe(true);
    expect(introShowing(group.classroom.group!, now)).toBe(true);
    expect(group.classroom.group).toEqual(skipFixture("group review", now).classroom.group);
    // Class review projected from the suggested setup with the grace over, group review behind it finished.
    expect(classReview.classroom.wholeClass?.problems).toEqual(skipFixture("class review", now).classroom.wholeClass?.problems);
    expect(isProjecting(classReview.classroom) && isDue(classReview.classroom, now) && !isPending(classReview.classroom, now)).toBe(true);
    expect(classReview.classroom.group?.done).toBe(true);
  });

  it("activity completed, from every stage: every stage over, reports and reflections in, PS6 in Past and in Sam's Completed", () => {
    for (const [name, s] of Object.entries(STARTS)) {
      const r = apply("completed", s);
      expect(stage(r), name).toBeNull();
      expect(r.classroom.assignment, name).not.toBeNull();
      expect(card(r), name).toMatchObject({ section: "past", status: "done" });
      expect(section(r), name).toBe("completed");
      expect(r.session.reportSent && r.session.reflection === DEMO_REFLECTION && r.session.stage === "homework", name).toBe(true);
      expect(r.classroom.wholeClass?.status, name).toBe("ended");
      expect(r.classroom.group?.done, name).toBe(true);
      expect(r.classroom.advance, name).toBeNull();
      expect(board(r), name).toBe("blank");
    }
    // Not sent: it sends the set first, as Sam's skips do.
    expect(apply("completed", fresh).classroom.assignment?.pathway).toEqual(DEMO_PATHWAY);
  });

  it("repeats change nothing: send again at the same moment, completed again, done on a completed lesson", () => {
    for (const [name, s] of Object.entries(STARTS)) {
      const sent = apply("send", s);
      expect(apply("send", sent), name).toEqual(sent);
      const done = apply("completed", s);
      expect(apply("completed", done, now + 60_000), name).toEqual(done);
      expect(apply("done", done, now + 60_000), name).toEqual(done);
    }
  });

  it("absences are respected: the teacher's marks stay, the gate and group review run on the class in the room", () => {
    // Chloe back, Liam (Sam's group) away.
    let c = classroomReducer(working.classroom, { type: "absence/set", assignment: "pset-6", student: "chloe", absent: false });
    c = classroomReducer(c, { type: "absence/set", assignment: "pset-6", student: "liam", absent: true });
    let s: DemoState = { classroom: c, session: working.session };
    const seen: string[] = [];
    for (let i = 0; i < 4; i++) {
      s = apply("done", s);
      expect(s.classroom.absences?.["pset-6"]).toEqual(["liam"]);
      seen.push(String(stage(s)));
    }
    expect(seen).toEqual(["individual", "group", "whole-class", "null"]);
    const g = apply("done", apply("done", { classroom: c, session: working.session }));
    expect(classReadiness(g.classroom, now).total).toBe(19);
    expect(g.classroom.group?.members).not.toContain("liam");
    expect(g.classroom.group?.members).toContain("sam");
    // The default list, untouched: Chloe away, Sam's group whole.
    expect(classReadiness(group.classroom, now).total).toBe(19);
    expect(group.classroom.group?.members).toEqual(["sam", "jordan", "zara", "liam"]);
    // Completing leaves the class in the room as it was.
    expect(apply("completed", { classroom: c, session: working.session }).classroom.absences?.["pset-6"]).toEqual(["liam"]);
  });

  it("the pathway in force is the teacher's: Create's choice is stepped through as it is, its last stage ending the lesson", () => {
    const created = (pathway: Pathway): DemoState => ({ classroom: classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: "Problem Set 6", problemIds: ["q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8", "q9", "q10"], pathway, at: now, startedAt: now }), session: INITIAL_SESSION });
    const walk = (pathway: Pathway) => {
      let s = created(pathway);
      const out: [string | null, string, string | undefined, string][] = [];
      for (let i = 0; i <= pathway.length; i++) {
        s = apply("done", s);
        expect(s.classroom.assignment?.pathway).toEqual(pathway);
        out.push([stage(s), s.session.stage, card(s)?.section, board(s)]);
      }
      return out;
    };
    expect(walk(["individual", "group"])).toEqual([
      ["individual", "feedback", "live", "blank"],
      ["group", "group", "live", "group"],
      [null, "homework", "past", "blank"],
    ]);
    expect(walk(["group"])).toEqual([
      ["group", "group", "live", "group"],
      [null, "homework", "past", "blank"],
    ]);
    expect(walk(["whole-class"])).toEqual([
      ["whole-class", "frozen", "live", "whole-class"],
      [null, "homework", "past", "blank"],
    ]);
    expect(walk([])).toEqual([[null, "homework", "past", "blank"]]);
    // Without individual review Sam's work is as handed in: nothing reworked.
    expect(apply("done", created(["group"])).session.rework).toEqual({});
    // A lesson without class review ends outright.
    const ended = apply("completed", created(["individual"]));
    expect(ended.classroom.lessonEndedAt).toBe(now);
    expect(ended.classroom.wholeClass).toBeNull();
  });

  it("a class review the teacher has set up is the one projected; a group run under way is finished", () => {
    const setup = classroomReducer(group.classroom, { type: "wc/setup", problems: ["q5"], examples: { q5: [] }, mode: "write-with-me" });
    const r = apply("done", { classroom: setup, session: group.session });
    expect(r.classroom.wholeClass).toMatchObject({ problems: ["q5"], status: "active", modes: { q5: "write-with-me" } });
    expect(r.classroom.group?.done).toBe(true);
    expect(r.session.stage).toBe("frozen");
  });

  it("a set sent through the teacher's Create starts a new lesson too", () => {
    const again = classroomReducer(completed.classroom, { type: "assignment/create", title: "Problem Set 6", problemIds: ["q1"], pathway: ["individual"], at: now });
    expect(stage({ classroom: again, session: INITIAL_SESSION })).toBe("working");
    expect([again.group, again.arrivals, again.lessonEndedAt, again.wholeClass]).toEqual([undefined, undefined, undefined, null]);
    expect(again.absences).toEqual(completed.classroom.absences);
  });
});
