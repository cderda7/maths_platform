import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { homeworkSkip } from "./demo";
import { classHomeworks, homeworkColumn, openHomeworks } from "./homeworks";
import { flasher, HW_INSIGHT_MESSAGE, HW_INSIGHT_MS, studentCellShowsInsight } from "./hwInsight";
import { INITIAL_SESSION } from "./session";
import { studentClassroom } from "./studentClassroom";

describe("homework cell insight placeholder (ticket 324)", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("reads the user's words exactly and lasts about two and a half seconds", () => {
    expect(HW_INSIGHT_MESSAGE).toBe("HW insight scoped in FUTURE_FEATURES");
    expect(HW_INSIGHT_MS).toBe(2500);
  });

  it("shows the pressed cell, then clears after the timer", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-2");
    expect(seen).toEqual(["hw-2"]);
    vi.advanceTimersByTime(HW_INSIGHT_MS - 1);
    expect(seen).toEqual(["hw-2"]);
    vi.advanceTimersByTime(1);
    expect(seen).toEqual(["hw-2", null]);
  });

  it("restarts the timer when the same cell is pressed again", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-1");
    vi.advanceTimersByTime(2000);
    f.press("hw-1");
    vi.advanceTimersByTime(2000);
    expect(seen.at(-1)).toBe("hw-1");
    vi.advanceTimersByTime(500);
    expect(seen).toEqual(["hw-1", "hw-1", null]);
  });

  it("moves to another cell, with one clear at the end", () => {
    const seen: (string | null)[] = [];
    const f = flasher<string>((s) => seen.push(s));
    f.press("hw-1");
    vi.advanceTimersByTime(1000);
    f.press("hw-3");
    vi.advanceTimersByTime(HW_INSIGHT_MS);
    expect(seen).toEqual(["hw-1", "hw-3", null]);
  });

  it("never clears after dispose", () => {
    const show = vi.fn();
    const f = flasher<string>(show);
    f.press("hw-2");
    f.dispose();
    vi.advanceTimersByTime(HW_INSIGHT_MS * 2);
    expect(show).toHaveBeenCalledTimes(1);
  });
});

describe("which of Sam's homework cells show the placeholder (ticket 326)", () => {
  const now = 1_700_000_000_000;
  const fresh = classroomReducer(INITIAL_CLASSROOM, { type: "homework/start", at: now - 60_000 });
  const jump = (t: "send homework" | "homework open", c: ClassroomState) => openHomeworks(homeworkSkip(t, c, INITIAL_SESSION, now).classroom);
  const cells = (c: ClassroomState) =>
    Object.fromEntries(
      homeworkColumn(studentClassroom(c, INITIAL_SESSION, now).completed, classHomeworks(c)).flatMap((p) => (p.kind === "homework" ? [[p.id, studentCellShowsInsight(p)]] : [])),
    );

  it("fresh: HW1 completed and HW2 missed both show it", () => {
    expect(cells(fresh)).toEqual({ "hw-1": true, "hw-2": true });
  });

  it("Homework 3 sent and waiting in the Future panel: its cell shows it too", () => {
    expect(cells(jump("send homework", fresh))).toEqual({ "hw-3": true, "hw-2": true, "hw-1": true });
  });

  it("Homework 3 open: its cell opens the homework instead, the others still show it", () => {
    expect(cells(jump("homework open", fresh))).toEqual({ "hw-3": false, "hw-2": true, "hw-1": true });
  });

  it("the rule by state: only an open homework's opened cell goes somewhere", () => {
    expect(studentCellShowsInsight({ status: "completed", opened: true })).toBe(true);
    expect(studentCellShowsInsight({ status: "missed", opened: true })).toBe(true);
    expect(studentCellShowsInsight({ status: "open", opened: false })).toBe(true);
    expect(studentCellShowsInsight({ status: "open", opened: true })).toBe(false);
  });
});
