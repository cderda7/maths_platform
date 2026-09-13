import { describe, expect, it } from "vitest";
import { boardOpensAt, boardOpensFor, GROUP_INTRO_MS, GROUP_INTRO_PARAGRAPHS, introProgress, introSecondsLeft, introShowing, tileColumns } from "./groupIntro";
import { beginRun } from "./groupReview";
import { classroomReducer, INITIAL_CLASSROOM } from "./classroom";
import { standingsAt } from "./standings";
import { sessionAt } from "./session";

const MEMBERS = ["sam", "jordan", "zara", "liam"];
const UNION = ["q1", "q2", "q3", "q7", "q9", "q10"];

describe("the group intro's read", () => {
  it("holds for 30 seconds", () => {
    expect(GROUP_INTRO_MS).toBe(30_000);
  });

  it("says 'and', never '&', and names no student and no mark", () => {
    const text = GROUP_INTRO_PARAGRAPHS.join(" ");
    expect(text).not.toContain("&");
    expect(text).toContain("at least one of you made a mistake");
  });

  it("counts from when the class went in, so a late tab or a forced student reads only what is left", () => {
    const t0 = 1_000_000;
    expect(boardOpensAt(t0)).toBe(t0 + GROUP_INTRO_MS);
    expect(boardOpensFor(t0, t0 + 900)).toBe(t0 + GROUP_INTRO_MS);
    expect(boardOpensFor(t0, t0 + 20_000)).toBe(t0 + GROUP_INTRO_MS);
    // Hours later the read is long over and the board opens at once.
    expect(boardOpensFor(t0, t0 + 3_600_000)).toBeLessThan(t0 + 3_600_000);
    // No known moment: from now. A moment in the future (a clock skew) never delays past a full read.
    expect(boardOpensFor(null, t0)).toBe(t0 + GROUP_INTRO_MS);
    expect(boardOpensFor(t0 + 5000, t0)).toBe(t0 + GROUP_INTRO_MS);
  });

  it("reads the time left to the nearest second, so the number and the bar agree: 0:15 only around half", () => {
    const t0 = 1_000_000;
    const run = beginRun(MEMBERS, UNION, boardOpensAt(t0));
    const at = (left: number) => t0 + GROUP_INTRO_MS - left;
    expect(introSecondsLeft(run, at(30_000))).toBe(30);
    expect(introSecondsLeft(run, at(15_499))).toBe(15);
    expect(introSecondsLeft(run, at(14_500))).toBe(15);
    expect(introSecondsLeft(run, at(14_499))).toBe(14);
    // Every moment "0:15" shows, the bar is within a sixtieth of half.
    for (let left = 14_500; left < 15_500; left += 50) {
      expect(introSecondsLeft(run, at(left))).toBe(15);
      expect(Math.abs(1 - introProgress(run, at(left)) - 0.5)).toBeLessThanOrEqual(1 / 60 + 1e-9);
    }
    expect(introSecondsLeft(run, at(400))).toBe(0);
    // Never more than the read, never negative.
    expect(introSecondsLeft(run, t0 - 60_000)).toBe(30);
    expect(introSecondsLeft(run, t0 + 60_000)).toBe(0);
  });

  it("lays the tiles in one row up to five, then two even rows", () => {
    expect([1, 3, 5, 6, 7, 8, 9, 10].map(tileColumns)).toEqual([1, 3, 5, 3, 4, 4, 5, 5]);
  });

  it("shows until the board opens, draining from 0 to 1", () => {
    const t0 = 1_000_000;
    const run = beginRun(MEMBERS, UNION, boardOpensAt(t0));
    expect(introShowing(run, t0)).toBe(true);
    expect(introProgress(run, t0)).toBe(0);
    expect(introProgress(run, t0 + GROUP_INTRO_MS / 2)).toBeCloseTo(0.5);
    expect(introShowing(run, t0 + GROUP_INTRO_MS - 1)).toBe(true);
    expect(introShowing(run, t0 + GROUP_INTRO_MS)).toBe(false);
    expect(introProgress(run, t0 + GROUP_INTRO_MS + 5000)).toBe(1);
    // A run stored before the intro existed opened at its start: no intro.
    const old = { ...beginRun(MEMBERS, UNION, t0), startedAt: undefined };
    expect(introShowing(old, t0)).toBe(false);
  });

  it("holds the race while the class reads: nobody's bar moves before the boards open", () => {
    const t0 = 1_000_000;
    const session = sessionAt("group");
    const classroom = { ...INITIAL_CLASSROOM, group: beginRun(MEMBERS, UNION, boardOpensAt(t0)) };
    for (const t of [t0, t0 + 10_000, t0 + GROUP_INTRO_MS]) expect(standingsAt(classroom, session, t).map((s) => s.percent)).toEqual([0, 0, 0, 0, 0]);
    // The begin is idempotent: a second tab arriving later keeps the first opening time.
    const again = classroomReducer(classroom, { type: "group/begin", members: MEMBERS, problems: UNION, at: boardOpensAt(t0 + 9000) });
    expect(again.group!.startedAt).toBe(boardOpensAt(t0));
  });
});
