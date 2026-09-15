import { describe, expect, it } from "vitest";
import { HOMEWORKS, SAM_HOMEWORK_STORY, type HomeworkDef } from "@/data/homeworks";
import { STORY_SETS } from "@/data/story";
import { INITIAL_CLASSROOM } from "./classroom";
import { skipFixture } from "./demo";
import { dayLabel, DEMO_TODAY } from "./dueDate";
import { coveredSetIds, homeworkColumn, homeworkForDue, homeworkStatus } from "./homeworks";
import { INITIAL_SESSION } from "./session";
import { studentClassroom } from "./studentClassroom";

const now = 1_700_000_000_000;
const hw = (n: number, day: string): HomeworkDef => ({ kind: "homework", id: `hw-${n}`, n, name: `Homework ${n}`, due: dayLabel(day), day });
const SETS = STORY_SETS.map((s) => ({ id: s.id, due: s.due }));
const HW3 = hw(3, "2026-09-14");
const DEMO_DAY = dayLabel(DEMO_TODAY);

describe("homework coverage by date (ticket 290)", () => {
  it("a homework covers the sets due on or after the previous homework's due date and before its own", () => {
    expect(HOMEWORKS.map((h) => [h.name, h.due])).toEqual([
      ["Homework 1", "Tue 1 Sep"],
      ["Homework 2", "Mon 7 Sep"],
    ]);
    const all = [...HOMEWORKS, HW3];
    expect(coveredSetIds(HOMEWORKS[0], SETS, all)).toEqual(["pset-1", "pset-2"]);
    expect(coveredSetIds(HOMEWORKS[1], SETS, all)).toEqual(["pset-3", "pset-4"]);
    // The fixtures' frozen sets (ticket 292) are the date rule's.
    const undated = all.map((h) => ({ ...h, setIds: undefined }));
    expect(HOMEWORKS.map((h) => [...(h.setIds ?? [])])).toEqual(HOMEWORKS.map((h) => coveredSetIds(h, SETS, undated)));
    // Homework 3 (ticket 291) covers Problem Sets 5 and 6.
    expect(coveredSetIds(HW3, SETS, all)).toEqual(["pset-5", "pset-6"]);
  });

  it("a set due on a homework's own due date is the next homework's; one past every homework is in none", () => {
    expect(homeworkForDue("Tue 1 Sep")?.id).toBe("hw-2");
    expect(homeworkForDue("Mon 31 Aug")?.id).toBe("hw-1");
    expect(homeworkForDue("Mon 7 Sep")).toBeUndefined();
    expect(homeworkForDue("Thu 10 Sep")).toBeUndefined();
    expect(homeworkForDue("someday")).toBeUndefined();
    // Every set in at most one homework, whatever order the list comes in.
    const reversed = [HW3, ...HOMEWORKS].reverse();
    const owners = SETS.map((s) => [...HOMEWORKS, HW3].filter((h) => coveredSetIds(h, [s], reversed).length > 0).length);
    expect(owners).toEqual([1, 1, 1, 1, 1, 1]);
  });
});

describe("homework status", () => {
  it("Sam: Homework 1 completed on time, Homework 2 missed", () => {
    expect(homeworkStatus(HOMEWORKS[0], SAM_HOMEWORK_STORY["hw-1"], DEMO_DAY)).toBe("completed");
    expect(homeworkStatus(HOMEWORKS[1], SAM_HOMEWORK_STORY["hw-2"], DEMO_DAY)).toBe("missed");
  });

  it("open until the due date passes; finished on the due date is on time", () => {
    const h = HOMEWORKS[1];
    expect(homeworkStatus(h, { finishedOn: null }, "Fri 4 Sep")).toBe("open");
    expect(homeworkStatus(h, { finishedOn: null }, "Mon 7 Sep")).toBe("open");
    expect(homeworkStatus(h, undefined, "Mon 7 Sep")).toBe("open");
    expect(homeworkStatus(h, { finishedOn: "Mon 7 Sep" }, "Mon 7 Sep")).toBe("completed");
    expect(homeworkStatus(h, { finishedOn: null }, "Tue 8 Sep")).toBe("missed");
    expect(homeworkStatus(h, undefined, "Tue 8 Sep")).toBe("missed");
  });

  it("missed is final: finishing after the due date never turns it completed", () => {
    const h = HOMEWORKS[1];
    expect(homeworkStatus(h, { finishedOn: "Tue 8 Sep" }, "Tue 8 Sep")).toBe("missed");
    expect(homeworkStatus(h, { finishedOn: "Wed 9 Sep" }, "Mon 14 Sep")).toBe("missed");
  });
});

describe("the Classroom's homework column", () => {
  it("before Problem Set 6 is done: empty beside PS5, HW2 missed over PS4–PS3, HW1 completed over PS2–PS1", () => {
    const { completed } = studentClassroom(INITIAL_CLASSROOM, INITIAL_SESSION, now);
    expect(homeworkColumn(completed)).toEqual([
      { kind: "empty", row: 0, span: 1, setIds: ["pset-5"] },
      { kind: "homework", id: "hw-2", n: 2, name: "Homework 2", due: "Mon 7 Sep", status: "missed", submitted: null, opened: true, row: 1, span: 2, setIds: ["pset-4", "pset-3"] },
      { kind: "homework", id: "hw-1", n: 1, name: "Homework 1", due: "Tue 1 Sep", status: "completed", submitted: "Mon 31 Aug", opened: true, row: 3, span: 2, setIds: ["pset-2", "pset-1"] },
    ]);
  });

  it("a cell carries the day it was handed in: a late one stays missed with its submitted date, never handed in reads null (ticket 307)", () => {
    const { completed } = studentClassroom(INITIAL_CLASSROOM, INITIAL_SESSION, now);
    const late = homeworkColumn(completed, HOMEWORKS, { "hw-1": { finishedOn: "Mon 31 Aug" }, "hw-2": { finishedOn: "Wed 9 Sep" } });
    expect(late[1]).toMatchObject({ id: "hw-2", status: "missed", submitted: "Wed 9 Sep" });
    expect(homeworkColumn(completed, HOMEWORKS, {})[2]).toMatchObject({ id: "hw-1", status: "missed", submitted: null });
  });

  it("with Problem Set 6 Completed it gets its own empty space too, and the cells move down a row", () => {
    const { classroom, session } = skipFixture("homework", now);
    const pieces = homeworkColumn(studentClassroom(classroom, session, now).completed);
    expect(pieces.map((p) => [p.kind, p.row, p.span, p.setIds])).toEqual([
      ["empty", 0, 1, ["pset-6"]],
      ["empty", 1, 1, ["pset-5"]],
      ["homework", 2, 2, ["pset-4", "pset-3"]],
      ["homework", 4, 2, ["pset-2", "pset-1"]],
    ]);
  });

  it("a cell spans only its Completed sets, and a homework with none has no cell", () => {
    const cards = [
      { id: "pset-4", due: "Fri 4 Sep" },
      { id: "pset-2", due: "Fri 28 Aug" },
    ];
    expect(homeworkColumn(cards).map((p) => [p.kind, p.row, p.span, p.setIds])).toEqual([
      ["homework", 0, 1, ["pset-4"]],
      ["homework", 1, 1, ["pset-2"]],
    ]);
    // Problem Sets 1 and 2 not Completed: no Homework 1 cell at all.
    expect(homeworkColumn([{ id: "pset-3", due: "Tue 1 Sep" }]).map((p) => (p.kind === "homework" ? p.id : p.kind))).toEqual(["hw-2"]);
    expect(homeworkColumn([{ id: "pset-5", due: "Mon 7 Sep" }])).toEqual([{ kind: "empty", row: 0, span: 1, setIds: ["pset-5"] }]);
    expect(homeworkColumn([])).toEqual([]);
  });
});
