import { describe, expect, it } from "vitest";
import { ASSIGNMENT } from "@/data/assignment";
import { ARRIVAL_FADE_MS, arriving, EMPTY_HOLD, holdAbovePointer, holdKey, type HoldState } from "./arrivals";
import { assignmentBundle } from "./assignments";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import type { MistakeRow, ProblemMistakes } from "./mistakes";
import { mistakesByProblem } from "./mistakes";
import { streamEvents } from "./stream";

const P = ASSIGNMENT.problems;
const ORDER = P.map((p) => p.id);
const row = (id: string, arrivedAt?: number): MistakeRow => ({ id, name: id, initials: id.slice(0, 2), live: false, lines: [], slips: [], arrivedAt });
const card = (i: number, rows: MistakeRow[], right = 0): ProblemMistakes => ({ problem: P[i], rows, right, pending: 0 });
const ids = (s: HoldState) => s.problems.map((p) => `${p.problem.id}:${p.rows.map((r) => r.id).join(",")}`);

describe("arrivals held above the pointer (ticket 189)", () => {
  it("off the list every change shows at once", () => {
    const s = holdAbovePointer([card(0, [row("a")]), card(2, [row("b")])], EMPTY_HOLD, 0, ORDER, 10);
    expect(ids(s)).toEqual(["q1:a", "q3:b"]);
    expect(s.problems[0].wrong).toBe(1);
  });

  it("a card at or above the pointer keeps its names, while its counts tick; the cards below update", () => {
    const before = holdAbovePointer([card(0, [row("a")]), card(2, [row("b")])], EMPTY_HOLD, 0, ORDER, 10);
    const s = holdAbovePointer([card(0, [row("a"), row("c", 20)], 5), card(2, [row("b"), row("d", 20)])], before, 1, ORDER, 20);
    expect(ids(s)).toEqual(["q1:a", "q3:b,d"]);
    expect(s.problems[0]).toMatchObject({ right: 5, wrong: 2 });
    expect(s.held).toEqual({ q1: ["c"] });
  });

  it("no new card goes in above the pointer; one below it does", () => {
    const before = holdAbovePointer([card(0, [row("a")]), card(4, [row("b")])], EMPTY_HOLD, 0, ORDER, 10);
    const s = holdAbovePointer([card(0, [row("a")]), card(1, [row("x", 20)]), card(4, [row("b")]), card(6, [row("y", 20)])], before, 1, ORDER, 20);
    // The pointer on Q1's card: Q2 goes in under it, below the pointer, and Q7 at the end.
    expect(ids(s)).toEqual(["q1:a", "q2:x", "q5:b", "q7:y"]);
    // The pointer on Q5's card: Q2 would push it down, so Q2 waits.
    expect(ids(holdAbovePointer([card(0, [row("a")]), card(1, [row("x", 20)]), card(4, [row("b")])], before, 2, ORDER, 20))).toEqual(["q1:a", "q5:b"]);
    expect(holdAbovePointer([card(0, [row("a")]), card(1, [row("x", 20)]), card(4, [row("b")])], before, 2, ORDER, 20).held).toEqual({ q2: ["x"] });
  });

  it("when the pointer moves on, the held names land and glow from that moment, not from their submission", () => {
    const before = holdAbovePointer([card(0, [row("a")])], EMPTY_HOLD, 0, ORDER, 10);
    const held = holdAbovePointer([card(0, [row("a"), row("c", 20)])], before, 1, ORDER, 20);
    const later = 20 + ARRIVAL_FADE_MS * 3;
    const released = holdAbovePointer([card(0, [row("a"), row("c", 20)])], held, 0, ORDER, later);
    expect(ids(released)).toEqual(["q1:a,c"]);
    expect(released.problems[0].rows[1].arrivedAt).toBe(later);
    expect(arriving(released.problems[0].rows[1].arrivedAt, later + 1000)).toBe(true);
    // The stamp holds for the glow, then the row is its own again.
    const next = holdAbovePointer([card(0, [row("a"), row("c", 20)])], released, 0, ORDER, later + 1000);
    expect(next.problems[0].rows[1].arrivedAt).toBe(later);
    const done = holdAbovePointer([card(0, [row("a"), row("c", 20)])], next, 0, ORDER, later + ARRIVAL_FADE_MS);
    expect(done.problems[0].rows[1].arrivedAt).toBe(20);
  });

  it("the glow runs for ARRIVAL_FADE_MS from the arrival and never for a fixed row", () => {
    expect(arriving(undefined, 5)).toBe(false);
    expect(arriving(1000, 1000)).toBe(true);
    expect(arriving(1000, 1000 + ARRIVAL_FADE_MS - 1)).toBe(true);
    expect(arriving(1000, 1000 + ARRIVAL_FADE_MS)).toBe(false);
  });

  it("the key changes only when what is shown changes", () => {
    const a = holdAbovePointer([card(0, [row("a")])], EMPTY_HOLD, 0, ORDER, 10);
    expect(holdKey(holdAbovePointer([card(0, [row("a")])], a, 0, ORDER, 11))).toBe(holdKey(a));
    expect(holdKey(holdAbovePointer([card(0, [row("a")], 1)], a, 0, ORDER, 11))).not.toBe(holdKey(a));
  });

  it("over the real stream with the pointer resting on the first card, nothing on it changes until the pointer leaves", () => {
    const T0 = 1_700_000_000_000;
    const c = classroomReducer(INITIAL_CLASSROOM, { type: "assignment/create", title: ASSIGNMENT.title, problemIds: ORDER, pathway: ["individual"], at: T0 });
    const b = assignmentBundle("pset-2", c)!;
    let s = holdAbovePointer(mistakesByProblem(null, b, T0 + 60_000), EMPTY_HOLD, 0, ORDER, T0 + 60_000);
    const first = ids(s)[0];
    for (const e of streamEvents(b.classmates, P)) {
      if (e.at <= 60_000) continue;
      s = holdAbovePointer(mistakesByProblem(null, b, T0 + e.at), s, 1, ORDER, T0 + e.at);
      expect(ids(s)[0]).toBe(first);
    }
    const end = holdAbovePointer(mistakesByProblem(null, b, T0 + 3_600_000), s, 0, ORDER, T0 + 3_600_000);
    expect(ids(end)).toEqual(mistakesByProblem(null, b, T0 + 3_600_000).map((p) => `${p.problem.id}:${p.rows.map((r) => r.id).join(",")}`));
  });
});
