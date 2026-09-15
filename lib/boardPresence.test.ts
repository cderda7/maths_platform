import { describe, expect, it } from "vitest";
import { boardMoments, boardOpen, cues, GONE_MS, placement, projectorScreen, type ScreenLike } from "./boardPresence";
import { classroomReducer, INITIAL_CLASSROOM, type ClassroomState } from "./classroom";
import { skipFixture } from "./demo";

const now = 1_700_000_000_000;

describe("whether a board is open (ticket 333)", () => {
  it("is open while any board has beaten within GONE_MS, closed after", () => {
    expect(boardOpen(new Map(), now)).toBe(false);
    expect(boardOpen(new Map([["a", now - 900]]), now)).toBe(true);
    expect(boardOpen(new Map([["a", now - GONE_MS]]), now)).toBe(false);
    expect(boardOpen(new Map([["a", now - GONE_MS - 10], ["b", now - 100]]), now)).toBe(true);
  });
});

describe("the moments the board is for", () => {
  it("names none before class review, group review or a diagnostic", () => {
    expect(boardMoments(INITIAL_CLASSROOM)).toEqual([]);
    expect(boardMoments(null)).toEqual([]);
    expect(boardMoments(skipFixture("working", now).classroom)).toEqual([]);
  });

  it("names class review while projecting and group review while it runs", () => {
    expect(boardMoments(skipFixture("class review", now).classroom)).toContain("whole-class");
    expect(boardMoments(skipFixture("group review", now).classroom)).toEqual(["group"]);
  });

  it("names each diagnostic push on its own, and none once it is withdrawn", () => {
    const pushed = classroomReducer(INITIAL_CLASSROOM, { type: "diagnostic/push", steps: ["d-factor-check"], at: now });
    expect(boardMoments(pushed)).toEqual([`diagnostic@${now}`]);
    const withdrawn = classroomReducer(pushed, { type: "diagnostic/withdraw", at: now + 5 });
    expect(boardMoments(withdrawn)).toEqual([]);
  });

  it("names no group review once it is done", () => {
    const c = skipFixture("group review", now).classroom as ClassroomState;
    expect(boardMoments({ ...c, group: c.group && { ...c.group, done: true } })).toEqual([]);
  });
});

describe("when the Present board pill pulses", () => {
  it("pulses when a moment appears and no board is open", () => {
    expect(cues([], ["whole-class"], false)).toBe(true);
    expect(cues([], ["group"], false)).toBe(true);
    expect(cues(["whole-class"], ["whole-class", "diagnostic@1"], false)).toBe(true);
    expect(cues(["diagnostic@1"], ["diagnostic@2"], false)).toBe(true);
  });

  it("never pulses while a board is open", () => {
    expect(cues([], ["whole-class"], true)).toBe(false);
  });

  it("never pulses on the first look in a page (a reload mid class review)", () => {
    expect(cues(undefined, ["whole-class"], false)).toBe(false);
  });

  it("never pulses for a moment already live: the next problem, a diagnostic ending back onto class review, a moment ending", () => {
    expect(cues(["whole-class"], ["whole-class"], false)).toBe(false);
    expect(cues(["whole-class", "diagnostic@1"], ["whole-class"], false)).toBe(false);
    expect(cues(["group"], [], false)).toBe(false);
  });
});

describe("where Present opens the board", () => {
  const laptop: ScreenLike = { availLeft: 0, availTop: 25, availWidth: 1440, availHeight: 875, isPrimary: true };
  const projector: ScreenLike = { availLeft: 1440, availTop: 0, availWidth: 1920, availHeight: 1080, isPrimary: false };

  it("picks the screen the laptop's window is not on", () => {
    expect(projectorScreen([laptop, projector], laptop)).toBe(projector);
  });

  it("picks the non-primary screen first when the window is on neither (or unknown)", () => {
    const third: ScreenLike = { ...projector, availLeft: 3360, isPrimary: true };
    expect(projectorScreen([laptop, third, projector], null)).toBe(projector);
  });

  it("picks the laptop's screen when the teacher's window sits on the projector", () => {
    expect(projectorScreen([laptop, projector], projector)).toBe(laptop);
  });

  it("finds none with one screen, matching the current screen by area as well as identity", () => {
    expect(projectorScreen([laptop], laptop)).toBeNull();
    expect(projectorScreen([{ ...laptop }], laptop)).toBeNull();
  });

  it("sizes the popup to the screen's available area", () => {
    expect(placement(projector)).toBe("popup,left=1440,top=0,width=1920,height=1080");
  });
});
