import { describe, expect, it } from "vitest";
import { ALL_PANES, columnsFor, frameFor, PANES, parseLayout, parsePanes, rowHeight, serialisePanes, togglePane } from "./split";
import { DEVICE_H, DEVICE_W, STAGE_MARGIN } from "./ipad";

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
  it("parses beside, defaults to stacked", () => {
    expect(parseLayout("beside")).toBe("beside");
    expect(parseLayout("sideways")).toBe("stacked");
    expect(parseLayout(undefined)).toBe("stacked");
  });
  it("beside is one column per pane", () => {
    expect(columnsFor(1, "beside")).toBe(1);
    expect(columnsFor(2, "beside")).toBe(2);
    expect(columnsFor(3, "beside")).toBe(3);
  });
  it("stacked is one full-width row per pane", () => {
    expect(columnsFor(1, "stacked")).toBe(1);
    expect(columnsFor(2, "stacked")).toBe(1);
    expect(columnsFor(3, "stacked")).toBe(1);
  });
});

describe("rowHeight", () => {
  const student = PANES.find((p) => p.id === "student")!.design;
  const teacher = PANES.find((p) => p.id === "teacher")!.design;
  const board = PANES.find((p) => p.id === "board")!.design;
  it("gives the iPad its full height when the row is wide enough", () => {
    expect(rowHeight(student, 1900, 1100)).toBe(DEVICE_H + STAGE_MARGIN);
  });
  it("shrinks a natural-height surface with a narrow row", () => {
    // Half the iPad's design width: half its height.
    expect(rowHeight(student, (DEVICE_W + STAGE_MARGIN) / 2, 1100)).toBe(Math.round((DEVICE_H + STAGE_MARGIN) / 2));
    expect(rowHeight(board, 720, 1100)).toBe(405);
  });
  it("never exceeds the window", () => {
    expect(rowHeight(student, 1900, 600)).toBe(600);
    expect(rowHeight(board, 1900, 500)).toBe(500);
  });
  it("gives a scrolling surface the window", () => {
    expect(rowHeight(teacher, 1900, 1100)).toBe(1100);
    expect(rowHeight(teacher, 600, 700)).toBe(700);
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
    expect(PANES.find((p) => p.id === "student")!.design).toEqual({ width: DEVICE_W + STAGE_MARGIN, height: DEVICE_H + STAGE_MARGIN });
  });
  it("the teacher view, which scrolls, is the one surface without a design height", () => {
    expect(PANES.filter((p) => !p.design.height).map((p) => p.id)).toEqual(["teacher"]);
  });
});
