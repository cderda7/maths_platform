import { describe, expect, it } from "vitest";
import { ALL_PANES, frameFor, PANES, parseLayout, parsePanes, placeFor, serialisePanes, togglePane, type Design } from "./split";
import { DEVICE_H, DEVICE_W, STAGE_MARGIN } from "./ipad";

const design = (id: string) => PANES.find((p) => p.id === id)!.design;

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

describe("parseLayout", () => {
  it("parses beside, defaults to stacked", () => {
    expect(parseLayout("beside")).toBe("beside");
    expect(parseLayout("sideways")).toBe("stacked");
    expect(parseLayout(undefined)).toBe("stacked");
  });
});

describe("placeFor", () => {
  it("beside is one window-high column per pane", () => {
    const p = placeFor(["student", "teacher", "board"], "beside");
    expect(p.columns).toBe("repeat(3, minmax(0, 1fr))");
    expect(p.rows).toBe(1);
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "1 / 2 / 2 / 3" },
      { id: "board", area: "1 / 3 / 2 / 4" },
    ]);
    expect(placeFor(["board"], "beside").columns).toBe("repeat(1, minmax(0, 1fr))");
  });
  it("stacked with all three: student over teacher at three fifths, the board down the right at two fifths", () => {
    const p = placeFor(["student", "teacher", "board"], "stacked");
    expect(p.columns).toBe("minmax(0, 3fr) minmax(0, 2fr)");
    expect(p.rows).toBe(2);
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "2 / 1 / 3 / 2" },
      { id: "board", area: "1 / 2 / 3 / 3" },
    ]);
  });
  it("stacked without the board: full-width rows, each half the height", () => {
    const p = placeFor(["student", "teacher"], "stacked");
    expect(p.columns).toBe("minmax(0, 1fr)");
    expect(p.rows).toBe(2);
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "2 / 1 / 3 / 2" },
    ]);
  });
  it("stacked with one pane beside the board: one row on the left, the board on the right", () => {
    const p = placeFor(["board", "teacher"], "stacked");
    expect(p.rows).toBe(1);
    expect(p.cells).toEqual([
      { id: "teacher", area: "1 / 1 / 2 / 2" },
      { id: "board", area: "1 / 2 / 2 / 3" },
    ]);
  });
  it("a single pane takes the window in either layout", () => {
    for (const layout of ["stacked", "beside"] as const) {
      for (const id of ALL_PANES) {
        const p = placeFor([id], layout);
        expect(p.rows).toBe(1);
        expect(p.cells).toEqual([{ id, area: "1 / 1 / 2 / 2" }]);
      }
    }
  });
});

describe("frameFor", () => {
  const fill: Design = { width: 1280, fit: "fill" };
  const ipad: Design = { width: 1264, height: 904, fit: "fill" };
  const board: Design = { width: 1440, height: 810, fit: "letterbox" };
  it("fill: scales a narrow pane down to the design width and keeps the pane's aspect", () => {
    expect(frameFor({ width: 640, height: 450 }, fill)).toEqual({ scale: 0.5, width: 1280, height: 900, left: 0, top: 0 });
  });
  it("fill: never scales up, a wide pane gets a frame of its own size", () => {
    expect(frameFor({ width: 1600, height: 900 }, fill)).toEqual({ scale: 1, width: 1600, height: 900, left: 0, top: 0 });
  });
  it("fill with a height: a short, wide pane is fitted by height and still covers its width", () => {
    // Half the iPad's height: the frame is twice the pane's width at half scale, so the stage centres the device in it.
    expect(frameFor({ width: 1900, height: 452 }, ipad)).toEqual({ scale: 0.5, width: 3800, height: 904, left: 0, top: 0 });
    // A tall, narrow pane is limited by width.
    expect(frameFor({ width: 632, height: 1000 }, ipad).scale).toBe(0.5);
  });
  it("letterbox: a portrait pane gets the widest 16:9 box, centred vertically", () => {
    const f = frameFor({ width: 720, height: 1200 }, board);
    expect(f.scale).toBe(0.5);
    expect(f.width).toBe(1440);
    expect(f.height).toBe(810);
    expect(f.left).toBe(0);
    expect(f.top).toBe((1200 - 405) / 2);
  });
  it("letterbox: a wide pane gets the tallest 16:9 box, centred horizontally", () => {
    const f = frameFor({ width: 1900, height: 405 }, board);
    expect(f.scale).toBe(0.5);
    expect(f.width).toBe(1440);
    expect(f.top).toBe(0);
    expect(f.left).toBe((1900 - 720) / 2);
  });
  it("letterbox: a pane bigger than the design grows the frame rather than scaling up", () => {
    const f = frameFor({ width: 2880, height: 1620 }, board);
    expect(f.scale).toBe(1);
    expect(f.width).toBe(2880);
    expect(f.height).toBe(1620);
  });
  it("is safe before the pane has been measured", () => {
    expect(frameFor({ width: 0, height: 0 }, fill)).toEqual({ scale: 1, width: 0, height: 0, left: 0, top: 0 });
  });
  it("the student pane fills, at the stage's own width and height, so the device lands at scale 1 inside", () => {
    expect(design("student")).toEqual({ width: DEVICE_W + STAGE_MARGIN, height: DEVICE_H + STAGE_MARGIN, fit: "fill" });
  });
  it("the teacher view, which scrolls, is the one surface without a design height; the board is the one letterboxed", () => {
    expect(PANES.filter((p) => !p.design.height).map((p) => p.id)).toEqual(["teacher"]);
    expect(PANES.filter((p) => p.design.fit === "letterbox").map((p) => p.id)).toEqual(["board"]);
  });
});
