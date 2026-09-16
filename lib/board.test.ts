import { describe, expect, it } from "vitest";
import { boardContent } from "./board";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { skipFixture, SKIP_TARGETS } from "./demo";
import { sessionAt } from "./session";
import { CLASSMATES } from "@/data/classmates";
import { DEMO_STUDENT } from "@/data/assignment";
import type { Pathway } from "@/data/types";

const now = 1_700_000_000_000;
const created = (pathway: Pathway, title = "Set 4") => classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title, problemIds: ["q1", "q2", "q3", "q4"], pathway, at: now });

describe("what the board shows per stage", () => {
  it("is blank before any assignment is sent: the class alone, no set named (ticket 264)", () => {
    const b = boardContent(INITIAL_CLASSROOM, null);
    expect(b).toEqual({ kind: "blank", className: "11 Methods", title: "" });
    expect(boardContent(null, null).kind).toBe("blank");
  });

  it("follows the demo's skips: blank through individual review and the gate, the standings during group review, the board while projecting, holding once group review is over", () => {
    const kinds = { start: "blank", "warm-up": "blank", working: "blank", "indiv review": "blank", "class wait": "blank", "group review": "group", "class review": "whole-class", report: "holding", homework: "holding" } as const;
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
    let { classroom } = skipFixture("class review", now);
    const { session } = skipFixture("class review", now);
    const first = boardContent(classroom, session);
    if (first.kind !== "whole-class") throw new Error("expected the board");
    expect(first.problem.id).toBe(classroom.wholeClass!.problems[0]);
    expect(first.index).toBe(0);
    expect(first.total).toBe(2);
    expect(first.view).toBe("unmarked");
    expect(first.teacherInk).toEqual([]);
    expect(first.step).toBe("examples");
    expect(first.reveal).toBe(0);
    expect(first.last).toBe(false);
    expect(first.examples.length).toBeGreaterThanOrEqual(2);
    for (const e of first.examples) {
      expect(e.letter).toMatch(/^[ABC]$/);
      expect(Object.keys(e).sort()).toEqual(["letter", "lines"]);
    }

    classroom = classroomReducer(classroom, { type: "wc/marks", on: true });
    classroom = classroomReducer(classroom, { type: "wc/stroke", problem: first.problem.id, stroke: [{ x: 1, y: 2 }] });
    const marked = boardContent(classroom, session);
    if (marked.kind !== "whole-class") throw new Error("expected the board");
    expect(marked.view).toBe("marked");
    expect(marked.teacherInk).toEqual([[{ x: 1, y: 2 }]]);
    // A mark over an example (ticket 330) is on the board's slide, not its pad, and Undo / Clear count it.
    classroom = classroomReducer(classroom, { type: "wc/stroke", problem: first.problem.id, stroke: { anchor: "A/0", points: [{ x: 1, y: 0.5 }] } });
    const withMark = boardContent(classroom, session);
    if (withMark.kind !== "whole-class") throw new Error("expected the board");
    expect(withMark.teacherInk).toEqual([[{ x: 1, y: 2 }]]);
    expect(withMark.markup).toEqual([{ anchor: "A/0", points: [{ x: 1, y: 0.5 }] }]);
    expect(withMark.inkCount).toBe(2);

    // The board's one control: on through the question's steps, Q* a line at a time (ticket 344).
    classroom = classroomReducer(classroom, { type: "wc/next" });
    const worked = boardContent(classroom, session);
    if (worked.kind !== "whole-class") throw new Error("expected the board");
    expect(worked.step).toBe("worked");
    expect(worked.reveal).toBe(0);
    expect(worked.pair?.worked.id).toBe(`${first.problem.id}-star`);
    classroom = classroomReducer(classroom, { type: "wc/next" });
    const revealed = boardContent(classroom, session);
    if (revealed.kind !== "whole-class") throw new Error("expected the board");
    expect(revealed.reveal).toBe(1);

    // The countdown's move: the next question, back on its examples.
    classroom = classroomReducer(classroom, { type: "wc/advance", id: "a" });
    const second = boardContent(classroom, session);
    if (second.kind !== "whole-class") throw new Error("expected the board");
    expect(second.step).toBe("examples");
    expect(second.reveal).toBe(0);
    expect(second.last).toBe(true);
    expect(second.index).toBe(1);
    expect(second.problem.id).toBe(classroom.wholeClass!.problems[1]);
    expect(second.view).toBe("unmarked");
    expect(second.teacherInk).toEqual([]);
    expect(second.markup).toEqual([]);
  });

  it("goes blank when the teacher ends the session, whatever the student is doing", () => {
    const { classroom, session } = skipFixture("class review", now);
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
    expect(Object.keys(boardContent(skipFixture("report", now).classroom, sessionAt("report")))).toEqual(["kind", "className", "title", "standings"]);
    expect(Object.keys(boardContent(skipFixture("group review", now).classroom, sessionAt("group")))).toEqual(["kind", "className", "title", "standings"]);
  });

  it("during group review: five standings, the demo group live with the pen; once the run is done the same standings hold, final", () => {
    const { classroom, session } = skipFixture("group review", now);
    const live = boardContent(classroom, session, now);
    if (live.kind !== "group") throw new Error("expected the race");
    expect(live.standings).toHaveLength(5);
    expect(live.standings.map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
    expect(live.standings.find((s) => s.live)?.pen).toBe("sam");
    // Every row names its members' first names and no surname: four, and amber three with Chloe absent (ticket 250).
    for (const s of live.standings) {
      expect(s.names).toHaveLength(s.colour === "amber" ? 3 : 4);
      for (const n of s.names) expect(n).not.toContain(" ");
    }
    const done = boardContent({ ...classroom, group: { ...classroom.group!, done: true } }, session, now);
    expect(done.kind).toBe("holding");
    // The report jump: the run long finished, everyone across the line, three medals.
    const held = boardContent(skipFixture("report", now).classroom, sessionAt("report"), now);
    if (held.kind !== "holding") throw new Error("expected the final standings");
    expect(held.standings.map((s) => s.percent)).toEqual([100, 100, 100, 100, 100]);
    expect(held.standings.map((s) => s.medal)).toEqual(["gold", "silver", "bronze", null, null]);
    // Projecting replaces the standings; ending goes blank.
    expect(boardContent(skipFixture("class review", now).classroom, session, now).kind).toBe("whole-class");
  });
});
