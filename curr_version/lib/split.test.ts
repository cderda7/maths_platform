import { describe, expect, it } from "vitest";
import { ALL_PANES, frameFor, gridFor, PANES, parseLayout, parsePanes, serialisePanes, togglePane } from "./split";
import { DEVICE_W, STAGE_MARGIN } from "./ipad";

describe("parsePanes", () => {
  it("returns null when absent or naming nothing", () => {
    expect(parsePanes(undefined)).toBeNull();
    expect(parsePanes("")).toBeNull();
    expect(parsePanes("projector,nope")).toBeNull();
  });
  it("keeps page order, drops unknown names, collapses repeats", () => {
    expect(parsePanes("board, student")).toEqual(["student", "board"]);
    expect(parsePanes("teacher,teacher,x")).toEqual(["teacher"]);
    expect(parsePanes("board,teacher,student")).toEqual([...ALL_PANES]);
  });
  it("round-trips through serialisePanes", () => {
    for (const s of ["student", "student,teacher", "teacher,board", "student,teacher,board"]) expect(serialisePanes(parsePanes(s)!)).toBe(s);
    expect(serialisePanes(["board", "student"])).toBe("student,board");
  });
});

describe("togglePane", () => {
  it("adds in page order and removes", () => {
    expect(togglePane(["student"], "board")).toEqual(["student", "board"]);
    expect(togglePane(["board"], "student")).toEqual(["student", "board"]);
    expect(togglePane(["student", "teacher", "board"], "teacher")).toEqual(["student", "board"]);
  });
  it("never empties the view", () => {
    expect(togglePane(["teacher"], "teacher")).toEqual(["teacher"]);
  });
  it("does not mutate its input", () => {
    const panes: ("student" | "teacher")[] = ["student", "teacher"];
    togglePane(panes, "student");
    expect(panes).toEqual(["student", "teacher"]);
  });
});

describe("layout", () => {
  it("parses stacked, defaults to beside", () => {
    expect(parseLayout("stacked")).toBe("stacked");
    expect(parseLayout("sideways")).toBe("beside");
    expect(parseLayout(undefined)).toBe("beside");
  });
  it("beside is one column per pane", () => {
    expect(gridFor(1, "beside")).toEqual({ columns: 1, spanLast: false });
    expect(gridFor(2, "beside")).toEqual({ columns: 2, spanLast: false });
    expect(gridFor(3, "beside")).toEqual({ columns: 3, spanLast: false });
  });
  it("stacked is rows, with three as two over one", () => {
    expect(gridFor(1, "stacked")).toEqual({ columns: 1, spanLast: false });
    expect(gridFor(2, "stacked")).toEqual({ columns: 1, spanLast: false });
    expect(gridFor(3, "stacked")).toEqual({ columns: 2, spanLast: true });
  });
});

describe("frameFor", () => {
  it("scales a narrow pane down to the design width and keeps the pane's aspect", () => {
    const f = frameFor({ width: 640, height: 450 }, { width: 1280 });
    expect(f.scale).toBe(0.5);
    expect(f.width).toBe(1280);
    expect(f.height).toBe(900);
  });
  it("never scales up: a wide pane gets a frame of its own size", () => {
    expect(frameFor({ width: 1600, height: 900 }, { width: 1280 })).toEqual({ scale: 1, width: 1600, height: 900 });
  });
  it("fits a screen-filling design to a short pane's height, keeping the pane's width", () => {
    // A 1900 × 405 pane for a 1440 × 810 board: width alone would allow scale 1 and crop the bottom half.
    expect(frameFor({ width: 1900, height: 405 }, { width: 1440, height: 810 })).toEqual({ scale: 0.5, width: 3800, height: 810 });
    // A tall, narrow pane is still limited by width.
    expect(frameFor({ width: 720, height: 1000 }, { width: 1440, height: 810 }).scale).toBe(0.5);
  });
  it("is safe before the pane has been measured", () => {
    expect(frameFor({ width: 0, height: 0 }, { width: 1280 })).toEqual({ scale: 1, width: 0, height: 0 });
  });
  it("gives the student pane the stage's own margin, so the device lands at scale 1 inside", () => {
    expect(PANES.find((p) => p.id === "student")!.design).toEqual({ width: DEVICE_W + STAGE_MARGIN });
  });
  it("only the board, which fills its screen, has a design height", () => {
    expect(PANES.filter((p) => p.design.height).map((p) => p.id)).toEqual(["board"]);
  });
});
