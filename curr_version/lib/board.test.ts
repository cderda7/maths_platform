import { describe, expect, it } from "vitest";
import { boardContent, boardWord } from "./board";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture, SKIP_TARGETS } from "./demo";
import { sessionAt } from "./session";
import { CLASSMATES } from "@/data/classmates";
import { DEMO_STUDENT } from "@/data/assignment";
import type { Pathway } from "@/data/types";

const now = 1_700_000_000_000;
const created = (pathway: Pathway, title = "Set 4") => classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title, problemIds: ["q1", "q2", "q3", "q4"], pathway, at: now });

describe("what the board shows per stage", () => {
  it("is blank before any assignment exists: the class and the fixture title, nothing else", () => {
    const b = boardContent(INITIAL_CLASSROOM, null);
    expect(b).toEqual({ kind: "blank", className: "11 Methods B", title: "ROOTS OF A QUADRATIC — SET 3" });
    expect(boardContent(null, null).kind).toBe("blank");
    expect(boardWord(b)).toBe("blank");
  });

  it("follows the demo's skips: blank through individual and group review, the board while projecting, holding once group review is over", () => {
    const kinds = { start: "blank", "warm-up": "blank", working: "blank", "indiv review": "blank", "class wait": "blank", "group review": "blank", "whole-class review": "whole-class", report: "holding" } as const;
    for (const t of SKIP_TARGETS) {
      const { session, classroom } = skipFixture(t, now);
      expect(boardContent(classroom, session).kind, t).toBe(kinds[t]);
    }
  });

  it("shows the created assignment's title", () => {
    expect(boardContent(created(["individual"]), sessionAt("working")).title).toBe("Set 4");
  });

  it("holds after group review only when the pathway has a group stage", () => {
    // Three stages: group review hands over to the waiting screen; that is the holding moment.
    expect(boardContent(created(["individual", "group", "whole-class"]), sessionAt("waiting")).kind).toBe("holding");
    expect(boardContent(created(["individual", "group", "whole-class"]), sessionAt("group")).kind).toBe("blank");
    // Group review last: the report follows it, and the standings hold there.
    expect(boardContent(created(["group"]), sessionAt("report")).kind).toBe("holding");
    expect(boardContent(created(["individual", "group"]), sessionAt("peers")).kind).toBe("holding");
    // No group review anywhere: nothing to hold.
    expect(boardContent(created(["individual"]), sessionAt("report")).kind).toBe("blank");
    expect(boardContent(created(["individual", "whole-class"]), sessionAt("waiting")).kind).toBe("blank");
    expect(boardContent(created([]), sessionAt("report")).kind).toBe("blank");
    // A setup that hasn't been projected yet is still the teacher not having advanced.
    const setup = classroomReducer(created(["group", "whole-class"]), { type: "wc/setup", problems: ["q2"], examples: { q2: [] } });
    expect(boardContent(setup, sessionAt("waiting")).kind).toBe("holding");
  });

  it("while projecting: the slide, its examples with counts, the view and the teacher's ink, following the controls", () => {
    let { classroom } = skipFixture("whole-class review", now);
    const { session } = skipFixture("whole-class review", now);
    const first = boardContent(classroom, session);
    if (first.kind !== "whole-class") throw new Error("expected the board");
    expect(first.problem.id).toBe(classroom.wholeClass!.problems[0]);
    expect(first.index).toBe(0);
    expect(first.total).toBe(2);
    expect(first.view).toBe("unmarked");
    expect(first.teacherInk).toEqual([]);
    expect(first.examples.length).toBeGreaterThanOrEqual(2);
    for (const e of first.examples) {
      expect(e.letter).toMatch(/^[ABC]$/);
      expect(e.count).toBeGreaterThan(0);
      expect(e.denominator).toBeGreaterThanOrEqual(e.count);
    }
    expect(boardWord(first)).toBe(`${first.problem.label} · 1 of 2`);

    classroom = classroomReducer(classroom, { type: "wc/marks", on: true });
    classroom = classroomReducer(classroom, { type: "wc/stroke", problem: first.problem.id, stroke: [{ x: 1, y: 2 }] });
    const marked = boardContent(classroom, session);
    if (marked.kind !== "whole-class") throw new Error("expected the board");
    expect(marked.view).toBe("marked");
    expect(marked.teacherInk).toEqual([[{ x: 1, y: 2 }]]);
    expect(boardWord(marked)).toBe(`${first.problem.label} · 1 of 2 · marks`);

    classroom = classroomReducer(classroom, { type: "wc/next" });
    const second = boardContent(classroom, session);
    if (second.kind !== "whole-class") throw new Error("expected the board");
    expect(second.index).toBe(1);
    expect(second.problem.id).toBe(classroom.wholeClass!.problems[1]);
    expect(second.view).toBe("unmarked");
    expect(second.teacherInk).toEqual([]);
  });

  it("goes blank when the teacher ends the session, whatever the student is doing", () => {
    const { classroom, session } = skipFixture("whole-class review", now);
    const ended = classroomReducer(classroom, { type: "wc/end" });
    expect(boardContent(ended, session).kind).toBe("blank");
    expect(boardContent(ended, sessionAt("report")).kind).toBe("blank");
  });

  it("names no student in any state", () => {
    const names = [DEMO_STUDENT.name, ...CLASSMATES.map((c) => c.name)];
    for (const t of SKIP_TARGETS) {
      const { session, classroom } = skipFixture(t, now);
      const text = JSON.stringify(boardContent(classroom, session));
      for (const n of names) expect(text, `${t}: ${n}`).not.toContain(n);
    }
    expect(Object.keys(boardContent(skipFixture("report", now).classroom, sessionAt("report")))).toEqual(["kind", "className", "title"]);
  });
});
