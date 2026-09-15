import { describe, expect, it } from "vitest";
import { classroomReducer, GRACE_MS, INITIAL_CLASSROOM, type ClassroomState, type SentHomework } from "./classroom";
import { DEMO_PATHWAY, demoSend, teacherSkip } from "./demo";
import { classHomeworks, futureHomeworks, homeworkColumn, homeworkForSet, homeworkOpened, homeworkSets, MISSED_NOTE, MISSED_NOTE_CURRENT, missedNote, openHomeworks, openHomeworksFor, psetDueNote } from "./homeworks";
import { INITIAL_SESSION } from "./session";
import { studentClassroom, studentHomeworkHref } from "./studentClassroom";

const now = 1_700_000_000_000;
const HW3: SentHomework = { id: "hw-3", n: 3, name: "Homework 3", due: "2026-09-14", questions: [], sentAt: now };
const send = (c: ClassroomState, at = now): ClassroomState => classroomReducer(c, { type: "homework/send", homework: { ...HW3, sentAt: at } });
const psetSent = (c: ClassroomState = INITIAL_CLASSROOM): ClassroomState => classroomReducer(c, demoSend(DEMO_PATHWAY, now));
/** The teacher's end lesson: the minute's grace started, then the lesson ended at its deadline (`EndLesson`, `StudentShell`). */
const endLesson = (c: ClassroomState, at = now + 5_000): ClassroomState => {
  const started = classroomReducer(c, { type: "advance/start", kind: "end-lesson", at });
  return classroomReducer(started, { type: "lesson/end", at: at + GRACE_MS });
};
/** Problem Set 6 sent with a due date picked on Create. */
const sendDue = (c: ClassroomState, due: string, at = now): ClassroomState => {
  const a = demoSend(DEMO_PATHWAY, at);
  return a.type === "assignment/create" ? classroomReducer(c, { ...a, due }) : c;
};
const sent3 = (c: ClassroomState) => c.homeworks?.find((h) => h.id === "hw-3");

describe("the Future panel (ticket 292)", () => {
  it("before Send nothing is scheduled: no Future homework, To do holds no homework", () => {
    expect(futureHomeworks(INITIAL_CLASSROOM)).toEqual([]);
    expect(futureHomeworks(psetSent())).toEqual([]);
    expect(studentClassroom(INITIAL_CLASSROOM, INITIAL_SESSION, now).todo).toEqual([]);
  });

  it("sent before Problem Set 6's lesson ends, Homework 3 waits for it, whether or not Problem Set 6 is sent yet", () => {
    for (const c of [send(INITIAL_CLASSROOM), send(psetSent()), psetSent(send(INITIAL_CLASSROOM))]) {
      expect(openHomeworks(c)).toBe(c);
      expect(homeworkOpened({ id: "hw-3" }, c)).toBe(false);
      expect(futureHomeworks(c)).toEqual([{ id: "hw-3", name: "Homework 3", due: "Mon 14 Sep", opensAfter: "Problem Set 6" }]);
      expect(studentClassroom(c, INITIAL_SESSION, now).todo.filter((k) => k.kind === "homework")).toEqual([]);
      expect(missedNote({ id: "hw-2" }, c)).toBe(MISSED_NOTE);
    }
  });

  it("its HW3 cell beside Problem Set 5 is muted and not open", () => {
    const c = send(INITIAL_CLASSROOM);
    const column = homeworkColumn(studentClassroom(c, INITIAL_SESSION, now).completed, classHomeworks(c));
    expect(column[0]).toMatchObject({ kind: "homework", id: "hw-3", status: "open", opened: false, row: 0, span: 1, setIds: ["pset-5"] });
  });
});

describe("opening (ticket 292)", () => {
  it("the teacher's end lesson opens it when its minute runs out, not before; stamped at that moment, sets frozen", () => {
    const live = send(psetSent());
    const grace = classroomReducer(live, { type: "advance/start", kind: "end-lesson", at: now + 5_000 });
    expect(openHomeworks(grace)).toBe(grace);
    const ended = openHomeworks(endLesson(live));
    expect(sent3(ended)).toMatchObject({ openedAt: now + 5_000 + GRACE_MS, setIds: ["pset-5", "pset-6"] });
    expect(futureHomeworks(ended)).toEqual([]);
    // Every tab that applies the same change stamps the same moment; opening twice changes nothing.
    expect(openHomeworks(endLesson(live))).toEqual(ended);
    expect(openHomeworks(ended)).toBe(ended);
  });

  it("class review ended and the presenter's activity completed open it too", () => {
    const live = send(psetSent());
    const wc = classroomReducer(classroomReducer(classroomReducer(live, { type: "wc/setup", problems: ["q1"], examples: {} }), { type: "wc/project", at: now }), { type: "wc/end" });
    expect(homeworkOpened({ id: "hw-3" }, wc)).toBe(true);
    for (const c of [live, send(INITIAL_CLASSROOM)]) {
      const done = teacherSkip("completed", c, INITIAL_SESSION, now + 10_000).classroom;
      expect(homeworkOpened({ id: "hw-3" }, done), "activity completed").toBe(true);
      expect(sent3(openHomeworks(done))?.setIds).toEqual(["pset-5", "pset-6"]);
    }
  });

  it("sent after the lesson has ended, it opens at once, at its sending", () => {
    const c = openHomeworks(send(endLesson(psetSent()), now + 200_000));
    expect(sent3(c)).toMatchObject({ openedAt: now + 200_000, setIds: ["pset-5", "pset-6"] });
  });

  it("open: first in To do with OPEN, its cell opens it, and HW2's note reads current HW", () => {
    const c = endLesson(send(psetSent()));
    const todo = studentClassroom(c, INITIAL_SESSION, now).todo;
    expect(todo[0]).toEqual({ kind: "homework", id: "hw-3", name: "Homework 3", due: "Mon 14 Sep", section: "todo", action: "open", href: null });
    expect(studentHomeworkHref("hw-3")).toBe("/student/homework/hw-3");
    expect(missedNote({ id: "hw-2" }, c)).toBe(MISSED_NOTE_CURRENT);
    expect(homeworkColumn([{ id: "pset-6", due: "Thu 10 Sep" }, { id: "pset-5", due: "Mon 7 Sep" }], classHomeworks(c))[0]).toMatchObject({ id: "hw-3", opened: true, row: 0, span: 2 });
  });

  it("past its due date it leaves To do (missed, ticket 290) and HW2's note goes back to next HW", () => {
    const c = endLesson(send(psetSent()));
    expect(openHomeworksFor(c, {}, "Tue 15 Sep")).toEqual([]);
    expect(missedNote({ id: "hw-2" }, c, {}, "Tue 15 Sep")).toBe(MISSED_NOTE);
    expect(openHomeworksFor(c, { "hw-3": { finishedOn: "Sat 12 Sep" } }, "Sat 12 Sep")).toEqual([]);
  });
});

describe("freeze at opening (ticket 292)", () => {
  const open = openHomeworks(endLesson(send(psetSent())));

  it("a set created after opening goes to the next homework, never into the open one", () => {
    const list = classHomeworks(open);
    const pset7 = { id: "pset-7", due: "Fri 11 Sep" };
    expect(homeworkForSet(pset7, list)).toBeUndefined();
    const hw4 = { kind: "homework" as const, id: "hw-4", n: 4, name: "Homework 4", due: "Mon 21 Sep", day: "2026-09-21" };
    expect(homeworkForSet(pset7, [...list, hw4])?.id).toBe("hw-4");
    // Before opening the same date is Homework 3's.
    expect(homeworkForSet(pset7, classHomeworks(send(psetSent())))?.id).toBe("hw-3");
    // Create's note for a set due inside it.
    expect(psetDueNote("2026-09-11", open)).toBe("Mistakes from this set go into Homework 4");
    expect(psetDueNote("2026-09-11", send(psetSent()))).toBeNull();
  });

  it("its sets stay put: a new lesson for Problem Set 6 (the ended lesson gone, a later due date) leaves Homework 3 open with the same sets", () => {
    const resent = openHomeworks(sendDue(open, "2026-09-18", now + 400_000));
    expect(resent.lessonEndedAt).toBeUndefined();
    expect(sent3(resent)).toEqual(sent3(open));
    expect(homeworkForSet({ id: "pset-6", due: "Fri 18 Sep" }, classHomeworks(resent))?.id).toBe("hw-3");
    expect(futureHomeworks(resent)).toEqual([]);
  });

  it("a Problem Set 6 due on or after Homework 3's date is not its set, so Homework 3 covers Problem Set 5 alone and opens at once", () => {
    const late = sendDue(INITIAL_CLASSROOM, "2026-09-15");
    expect(homeworkSets(late).map((s) => [s.id, s.due, s.lessonOver])).toContainEqual(["pset-6", "Tue 15 Sep", false]);
    expect(sent3(openHomeworks(send(late)))?.setIds).toEqual(["pset-5"]);
  });
});
