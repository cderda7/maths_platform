import { describe, expect, it } from "vitest";
import { HOMEWORK_RECOMMENDATIONS } from "@/data/review";
import { classroomReducer, INITIAL_CLASSROOM, lessonOver, type ClassroomState } from "./classroom";
import { created, homeworkSent } from "./create";
import { HOMEWORK_SKIP_TARGETS, homeworkSkip, homeworkSkipsShown, keepHomeworkStarted, readyHomework, skipFixture, SKIP_TARGETS, teacherSkip, type DemoState } from "./demo";
import { generatedHomeworkDraft } from "./draft";
import { classHomeworks, futureHomeworks, homeworkColumn, MISSED_NOTE, MISSED_NOTE_CURRENT, openHomeworks } from "./homeworks";
import { missedNote } from "./homeworkList";
import { draftKey, type ReviewState } from "./review";
import { INITIAL_SESSION } from "./session";
import { studentClassroom, studentSection } from "./studentClassroom";

const now = 1_700_000_000_000;
const started = (c: ClassroomState = INITIAL_CLASSROOM, at = now - 60_000): ClassroomState => classroomReducer(c, { type: "homework/start", at });
const fresh: DemoState = { classroom: started(), session: INITIAL_SESSION };
/** The store's write: every change goes out through `openHomeworks` (`setClassroom`, `setLesson`). */
const stored = (s: DemoState): DemoState => ({ ...s, classroom: openHomeworks(s.classroom) });
const skip = (t: (typeof HOMEWORK_SKIP_TARGETS)[number], s: DemoState, at = now) => stored(homeworkSkip(t, s.classroom, s.session, at));
const hw3 = (c: ClassroomState) => c.homeworks?.find((h) => h.id === "hw-3");

/** +Homework walked for real: Generate, Refine with every recommendation accepted, Create (`ReviewAssignment`). */
function walkedSend(c: ClassroomState, at = now): ClassroomState {
  const draft = generatedHomeworkDraft(c, at);
  const review: ReviewState = { step: "recommendations", forDraft: draftKey(draft.questions), labels: {}, answers: Object.fromEntries(HOMEWORK_RECOMMENDATIONS.map((r) => [r.id, "accept"])), addition: 0, pathway: null };
  const drafted = classroomReducer(classroomReducer(c, { type: "draft/set", draft, kind: "homework" }), { type: "review/set", review, kind: "homework" });
  return openHomeworks(homeworkSent(drafted, at));
}

// The demo's moments, reached by the teacher's own jumps.
const working: DemoState = { classroom: created(teacherSkip("send", fresh.classroom, fresh.session, now).classroom, now), session: INITIAL_SESSION };
const completed = stored(teacherSkip("completed", working.classroom, working.session, now));

describe("showing the homework jumps (ticket 295)", () => {
  it("a fresh demo offers none; the first +Homework press shows them, later presses keep its moment", () => {
    expect(homeworkSkipsShown(INITIAL_CLASSROOM)).toBe(false);
    expect(homeworkSkipsShown(null)).toBe(false);
    const once = started(INITIAL_CLASSROOM, 5);
    expect(homeworkSkipsShown(once)).toBe(true);
    expect(started(once, 9)).toBe(once);
    expect(HOMEWORK_SKIP_TARGETS).toEqual(["send homework", "homework open"]);
  });

  it("Reset demo hides them", () => {
    expect(homeworkSkipsShown(classroomReducer(started(), { type: "reset" }))).toBe(false);
  });

  it("they stay through everything else: the teacher's jumps, Create's new lesson, both homework jumps", () => {
    for (const t of ["send", "done", "completed"] as const) expect(homeworkSkipsShown(teacherSkip(t, working.classroom, working.session, now).classroom), t).toBe(true);
    expect(homeworkSkipsShown(working.classroom)).toBe(true);
    for (const t of HOMEWORK_SKIP_TARGETS) expect(homeworkSkipsShown(skip(t, working).classroom), t).toBe(true);
  });

  it("Sam's skips rebuild the demo from nothing but carry the mark; with no mark they add none", () => {
    for (const t of SKIP_TARGETS) {
      const rebuilt = skipFixture(t, now).classroom;
      expect(homeworkSkipsShown(keepHomeworkStarted(fresh.classroom, rebuilt)), t).toBe(true);
      expect(keepHomeworkStarted(fresh.classroom, rebuilt).homeworkStartedAt, t).toBe(fresh.classroom.homeworkStartedAt);
      expect(keepHomeworkStarted(INITIAL_CLASSROOM, rebuilt), t).toBe(rebuilt);
    }
  });
});

describe("send homework (ticket 295)", () => {
  it("sends Homework 3 as the walked Create sends it: the generated ten as Refine leaves them, due Mon 14 Sep, the draft cleared", () => {
    for (const s of [fresh, working]) {
      const r = skip("send homework", s);
      expect(r.classroom).toEqual(walkedSend(s.classroom));
      expect(hw3(r.classroom)).toMatchObject({ id: "hw-3", n: 3, name: "Homework 3", due: "2026-09-14", sentAt: now });
      expect(hw3(r.classroom)?.questions).toHaveLength(10);
      expect([r.classroom.homeworkDraft, r.classroom.homeworkReview]).toEqual([null, null]);
      expect(readyHomework(s.classroom, now).draft.due).toBe("2026-09-14");
    }
  });

  it("nothing else moves: the set, the lesson and Sam's session stay as they are", () => {
    const r = skip("send homework", working);
    const { homeworks, homeworkDraft, homeworkReview, ...rest } = r.classroom;
    void [homeworks, homeworkDraft, homeworkReview];
    expect(rest).toEqual(working.classroom);
    expect(r.session).toBe(working.session);
    expect(skip("send homework", { ...fresh, session: null as never }).session).toEqual(INITIAL_SESSION);
  });

  it("lands in Sam's Future panel, waiting for Problem Set 6 whether or not it is sent; nothing in To do, HW2's note says next", () => {
    for (const s of [fresh, working]) {
      const { classroom, session } = skip("send homework", s);
      expect(futureHomeworks(classroom)).toEqual([{ id: "hw-3", name: "Homework 3", due: "Mon 14 Sep", opensAfter: "Problem Set 6" }]);
      expect(studentClassroom(classroom, session, now).todo.filter((k) => k.kind === "homework")).toEqual([]);
      expect(missedNote({ id: "hw-2" }, classroom, session)).toBe(MISSED_NOTE);
      expect(homeworkColumn(studentClassroom(classroom, session, now).completed, classHomeworks(classroom))[0]).toMatchObject({ id: "hw-3", opened: false });
    }
  });

  it("pressed again, or after the teacher sent their own, it is Homework 3 again, never Homework 4", () => {
    const twice = skip("send homework", skip("send homework", working), now + 1000);
    expect(twice.classroom.homeworks?.map((h) => [h.id, h.sentAt])).toEqual([["hw-3", now + 1000]]);
    const own = walkedSend(working.classroom, now - 500);
    expect(skip("send homework", { ...working, classroom: own }).classroom.homeworks?.map((h) => h.id)).toEqual(["hw-3"]);
  });

  it("after Problem Set 6's lesson has ended it opens at once, as a real send then does", () => {
    const r = skip("send homework", completed, now + 1000);
    expect(r.classroom).toEqual(walkedSend(completed.classroom, now + 1000));
    expect(hw3(r.classroom)).toMatchObject({ openedAt: now + 1000, setIds: ["pset-5", "pset-6"] });
  });
});

describe("homework open (ticket 295)", () => {
  /** The real flow: Homework 3 sent from +Homework (unless it is), then the lesson brought to its end ("activity completed"), both through the store. */
  const realOpen = (s: DemoState): DemoState => {
    const sent = { ...s, classroom: hw3(s.classroom) ? s.classroom : walkedSend(s.classroom) };
    return stored(teacherSkip("completed", sent.classroom, sent.session, now));
  };

  it("from every moment, lands where sending and ending the lesson land: Homework 3 open with Problem Sets 5 and 6, first in To do, its cell open, HW2's note current", () => {
    const moments: Record<string, DemoState> = { "nothing sent": fresh, working, "homework sent": skip("send homework", working), completed };
    for (const [name, s] of Object.entries(moments)) {
      const r = skip("homework open", s);
      expect(r, name).toEqual(realOpen(s));
      expect(lessonOver(r.classroom), name).toBe(true);
      expect(hw3(r.classroom), name).toMatchObject({ setIds: ["pset-5", "pset-6"] });
      expect(futureHomeworks(r.classroom), name).toEqual([]);
      const sections = studentClassroom(r.classroom, r.session, now);
      expect(sections.todo[0], name).toMatchObject({ kind: "homework", id: "hw-3", action: "open" });
      expect(studentSection("pset-6", r.classroom, r.session, now), name).toBe("completed");
      expect(homeworkColumn(sections.completed, classHomeworks(r.classroom))[0], name).toMatchObject({ kind: "homework", id: "hw-3", opened: true, setIds: ["pset-6", "pset-5"] });
      expect(missedNote({ id: "hw-2" }, r.classroom, r.session), name).toBe(MISSED_NOTE_CURRENT);
    }
  });

  it("a homework already sent stands as the teacher sent it: its ten, its due date, its moment", () => {
    const own = homeworkSent(
      classroomReducer(
        classroomReducer(working.classroom, { type: "draft/set", draft: { ...generatedHomeworkDraft(working.classroom, now), due: "2026-09-13" }, kind: "homework" }),
        { type: "review/set", review: { step: "recommendations", forDraft: draftKey(generatedHomeworkDraft(working.classroom, now).questions), labels: {}, answers: Object.fromEntries(HOMEWORK_RECOMMENDATIONS.map((r) => [r.id, "keep"])), addition: 0, pathway: null }, kind: "homework" },
      ),
      now - 9_000,
    );
    const r = skip("homework open", { ...working, classroom: own });
    expect({ ...hw3(r.classroom), openedAt: undefined, setIds: undefined }).toEqual({ ...hw3(own), openedAt: undefined, setIds: undefined });
    expect(hw3(r.classroom)?.due).toBe("2026-09-13");
  });

  it("a completed lesson stays as it was, only Homework 3 added", () => {
    const r = skip("homework open", completed, now + 5000);
    const { homeworks, homeworkDraft, homeworkReview, ...rest } = r.classroom;
    void [homeworks, homeworkDraft, homeworkReview];
    expect(rest).toEqual(completed.classroom);
    expect(r.session).toEqual(completed.session);
  });
});
