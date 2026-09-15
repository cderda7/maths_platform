import { describe, expect, it } from "vitest";
import { CLASS_HOMEWORK_STORY, HOMEWORKS, SAM_HOMEWORK_STORY, type HomeworkDef } from "@/data/homeworks";
import { STORY } from "@/data/story";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { classroomCards, teacherHomeworkColumn } from "./classroomCards";
import { DEMO_PATHWAY, demoSend, homeworkSkip, teacherSkip } from "./demo";
import { dayLabel, dueOrder } from "./dueDate";
import { homeworkDoneCount, homeworkStatus } from "./homeworks";
import { INITIAL_SESSION, type StudentSession } from "./session";

const now = 1_700_000_000_000;
const [HW1, HW2] = HOMEWORKS;

/** The teacher's Classroom as it stands: Past's cards and the column beside them. */
function column(c: ClassroomState, session: StudentSession | null = INITIAL_SESSION, today?: string) {
  const { live, past } = classroomCards(c, session, now);
  return { live: live.map((k) => k.id), past: past.map((k) => k.id), pieces: teacherHomeworkColumn(past, c, today) };
}
const brief = (pieces: ReturnType<typeof teacherHomeworkColumn>) =>
  pieces.map((p) => (p.kind === "empty" ? { empty: p.setIds, row: p.row } : { id: p.id, state: p.state, row: p.row, span: p.span, sets: p.setIds, done: `${p.done}/${p.total}`, opensAfter: p.opensAfter }));

describe("the class's homework history (ticket 305)", () => {
  it("holds Homework 1 and 2 for all twenty students, Sam's his own story", () => {
    expect(Object.keys(CLASS_HOMEWORK_STORY).sort()).toEqual(Object.keys(STORY).sort());
    expect(Object.keys(CLASS_HOMEWORK_STORY)).toHaveLength(20);
    expect(CLASS_HOMEWORK_STORY.sam).toBe(SAM_HOMEWORK_STORY);
    for (const r of Object.values(CLASS_HOMEWORK_STORY)) expect(Object.keys(r).sort()).toEqual(["hw-1", "hw-2"]);
  });

  it("every finishing day is a real day of 2026 as the cards write it, after the homework was set and before the demo's today", () => {
    for (const r of Object.values(CLASS_HOMEWORK_STORY))
      for (const [id, { finishedOn }] of Object.entries(r)) {
        if (finishedOn === null) continue;
        const [, day, mon] = /^\w{3} (\d{1,2}) (\w{3})$/.exec(finishedOn)!;
        const iso = `2026-${mon === "Aug" ? "08" : "09"}-${day.padStart(2, "0")}`;
        expect(dayLabel(iso)).toBe(finishedOn);
        expect(dueOrder(finishedOn)).toBeLessThan(dueOrder("Thu 10 Sep"));
        // Homework 2 opened after Homework 1 was due.
        if (id === "hw-2") expect(dueOrder(finishedOn)).toBeGreaterThan(dueOrder(HW1.due));
      }
  });

  it("follows the arcs: the students whose sets end short miss, everyone who hands in every set is on time", () => {
    const missed = (hw: HomeworkDef) => Object.entries(CLASS_HOMEWORK_STORY).filter(([, r]) => homeworkStatus(hw, r[hw.id], "Thu 10 Sep") === "missed").map(([id]) => id);
    expect(missed(HW1)).toEqual(["tomas", "liam", "grace"]);
    expect(missed(HW2)).toEqual(["sam", "jordan", "tomas", "liam", "grace", "oliver"]);
    // Everyone who handed in all ten on every set before Homework 2's due date did both on time, bar Sam (his story).
    const full = Object.entries(STORY).filter(([id, s]) => id !== "sam" && s.done.slice(0, 5).every((n) => n === 10)).map(([id]) => id);
    for (const id of full) expect([...missed(HW1), ...missed(HW2)]).not.toContain(id);
  });
});

describe("the class count (ticket 305)", () => {
  it("counts who finished by the due date: late finishers do not count", () => {
    expect(homeworkDoneCount(HW1)).toEqual({ done: 17, total: 20 });
    expect(homeworkDoneCount(HW2)).toEqual({ done: 14, total: 20 });
    // Jordan finished Homework 2 on Tue 8 Sep, the day after it was due.
    const onlyJordan = { jordan: CLASS_HOMEWORK_STORY.jordan };
    expect(homeworkDoneCount(HW2, onlyJordan)).toEqual({ done: 0, total: 1 });
  });

  it("before the due date counts so far: a record dated after today does not count yet", () => {
    const hw3: HomeworkDef = { kind: "homework", id: "hw-3", n: 3, name: "Homework 3", due: "Mon 14 Sep", day: "2026-09-14" };
    expect(homeworkDoneCount(hw3)).toEqual({ done: 0, total: 20 });
    const records = { a: { "hw-3": { finishedOn: "Wed 9 Sep" } }, b: { "hw-3": { finishedOn: "Sat 12 Sep" } }, c: { "hw-3": { finishedOn: null } } };
    expect(homeworkDoneCount(hw3, records, "Thu 10 Sep")).toEqual({ done: 1, total: 3 });
    expect(homeworkDoneCount(hw3, records, "Mon 14 Sep")).toEqual({ done: 2, total: 3 });
    expect(homeworkDoneCount(hw3, records, "Tue 15 Sep")).toEqual({ done: 2, total: 3 });
  });
});

describe("the homework column beside the teacher's Past (ticket 305)", () => {
  it("a fresh demo: Homework 2 beside Problem Sets 4 and 3, Homework 1 beside 2 and 1, an empty space beside Problem Set 5", () => {
    const { live, past, pieces } = column(INITIAL_CLASSROOM);
    expect(live).toEqual([]);
    expect(past).toEqual(["pset-5", "pset-4", "pset-3", "pset-2", "pset-1"]);
    expect(brief(pieces)).toEqual([
      { empty: ["pset-5"], row: 0 },
      { id: "hw-2", state: "over", row: 1, span: 2, sets: ["pset-4", "pset-3"], done: "14/20", opensAfter: null },
      { id: "hw-1", state: "over", row: 3, span: 2, sets: ["pset-2", "pset-1"], done: "17/20", opensAfter: null },
    ]);
  });

  it("Homework 3 sent before Problem Set 6: beside Problem Set 5 alone, sent, opening after Problem Set 6", () => {
    const { classroom } = homeworkSkip("send homework", INITIAL_CLASSROOM, INITIAL_SESSION, now);
    const { pieces } = column(classroom);
    expect(brief(pieces)[0]).toEqual({ id: "hw-3", state: "sent", row: 0, span: 1, sets: ["pset-5"], done: "0/20", opensAfter: "Problem Set 6" });
    expect(pieces).toHaveLength(3);
  });

  it("while Problem Set 6 is Live the column stays beside Past: Homework 3 spans Problem Set 5 alone", () => {
    const sent = homeworkSkip("send homework", INITIAL_CLASSROOM, INITIAL_SESSION, now).classroom;
    const withPs6 = classroomReducer(sent, demoSend(DEMO_PATHWAY, now));
    const { live, past, pieces } = column(withPs6);
    expect(live).toEqual(["pset-6"]);
    expect(past[0]).toBe("pset-5");
    expect(brief(pieces)[0]).toMatchObject({ id: "hw-3", state: "sent", row: 0, span: 1, sets: ["pset-5"], opensAfter: "Problem Set 6" });
    // No piece names a Live set.
    expect(pieces.flatMap((p) => p.setIds)).not.toContain("pset-6");
  });

  it("once Problem Set 6 moves to Past, Homework 3 opens and spans Problem Sets 6 and 5, its count so far 0/20", () => {
    const { classroom, session } = homeworkSkip("homework open", INITIAL_CLASSROOM, INITIAL_SESSION, now);
    const { live, past, pieces } = column(classroom, session);
    expect(live).toEqual([]);
    expect(past.slice(0, 2)).toEqual(["pset-6", "pset-5"]);
    expect(brief(pieces)).toEqual([
      { id: "hw-3", state: "open", row: 0, span: 2, sets: ["pset-6", "pset-5"], done: "0/20", opensAfter: null },
      { id: "hw-2", state: "over", row: 2, span: 2, sets: ["pset-4", "pset-3"], done: "14/20", opensAfter: null },
      { id: "hw-1", state: "over", row: 4, span: 2, sets: ["pset-2", "pset-1"], done: "17/20", opensAfter: null },
    ]);
  });

  it("Problem Set 6 in Past with no homework sent: an empty space beside Problem Sets 6 and 5 each", () => {
    const { classroom, session } = teacherSkip("completed", INITIAL_CLASSROOM, INITIAL_SESSION, now);
    const { past, pieces } = column(classroom, session);
    expect(past.slice(0, 2)).toEqual(["pset-6", "pset-5"]);
    expect(brief(pieces).slice(0, 2)).toEqual([
      { empty: ["pset-6"], row: 0 },
      { empty: ["pset-5"], row: 1 },
    ]);
  });

  it("reads the class, never one student: a cell carries no student's status", () => {
    for (const p of column(INITIAL_CLASSROOM).pieces) expect(Object.keys(p)).not.toContain("status");
  });

  it("a homework past its due date reads over; before it, open once opened", () => {
    const { classroom, session } = homeworkSkip("homework open", INITIAL_CLASSROOM, INITIAL_SESSION, now);
    expect(column(classroom, session, "Mon 14 Sep").pieces[0]).toMatchObject({ id: "hw-3", state: "open" });
    expect(column(classroom, session, "Tue 15 Sep").pieces[0]).toMatchObject({ id: "hw-3", state: "over" });
  });
});
