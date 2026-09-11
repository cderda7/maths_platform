import { describe, expect, it } from "vitest";
import { ALL_PANES, DEFAULT_SIZES, dragStep, frameFor, MIN_SHARE, PANES, parseLayout, parsePanes, parseSizes, placeFor, resetSize, resize, serialisePanes, togglePane, type Design, type Drag } from "./split";
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
  it("beside is one window-high column per pane, weighted, with a divider in every gutter", () => {
    const p = placeFor(["student", "teacher", "board"], "beside");
    expect(p.columns).toBe("minmax(0, 1fr) 12px minmax(0, 1fr) 12px minmax(0, 1fr)");
    expect(p.rows).toBe("minmax(0, 1fr)");
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "1 / 3 / 2 / 4" },
      { id: "board", area: "1 / 5 / 2 / 6" },
    ]);
    expect(p.dividers).toEqual([
      { key: "student-teacher", axis: "column", area: "1 / 2 / 2 / 3", adjust: "weights", before: "student", after: "teacher" },
      { key: "teacher-board", axis: "column", area: "1 / 4 / 2 / 5", adjust: "weights", before: "teacher", after: "board" },
    ]);
    expect(placeFor(["student", "board"], "beside", { ...DEFAULT_SIZES, weights: { student: 3, teacher: 1, board: 1 } }).columns).toBe("minmax(0, 3fr) 12px minmax(0, 1fr)");
  });
  it("stacked with all three: student over teacher at the column share, the board down the right, two dividers", () => {
    const p = placeFor(["student", "teacher", "board"], "stacked");
    expect(p.columns).toBe("minmax(0, 0.6fr) 12px minmax(0, 0.4fr)");
    expect(p.rows).toBe("minmax(0, 0.5fr) 12px minmax(0, 0.5fr)");
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "3 / 1 / 4 / 2" },
      { id: "board", area: "1 / 3 / 4 / 4" },
    ]);
    expect(p.dividers).toEqual([
      { key: "student-teacher", axis: "row", area: "2 / 1 / 3 / 2", adjust: "row", before: "student", after: "teacher" },
      { key: "left-board", axis: "column", area: "1 / 2 / 4 / 3", adjust: "column", before: "teacher", after: "board" },
    ]);
  });
  it("stacked uses the presenter's sizes", () => {
    const p = placeFor(["student", "teacher", "board"], "stacked", { ...DEFAULT_SIZES, column: 0.7, row: 0.3 });
    // Shares are rounded, so 1 − 0.7 reads as 0.3, not 0.30000000000000004.
    expect(p.columns).toBe("minmax(0, 0.7fr) 12px minmax(0, 0.3fr)");
    expect(p.rows).toBe("minmax(0, 0.3fr) 12px minmax(0, 0.7fr)");
  });
  it("stacked without the board: full-width rows and one row divider", () => {
    const p = placeFor(["student", "teacher"], "stacked");
    expect(p.columns).toBe("minmax(0, 1fr)");
    expect(p.rows).toBe("minmax(0, 0.5fr) 12px minmax(0, 0.5fr)");
    expect(p.cells).toEqual([
      { id: "student", area: "1 / 1 / 2 / 2" },
      { id: "teacher", area: "3 / 1 / 4 / 2" },
    ]);
    expect(p.dividers.map((d) => d.key)).toEqual(["student-teacher"]);
  });
  it("stacked with one pane beside the board: one row on the left, the board on the right, one column divider", () => {
    const p = placeFor(["board", "teacher"], "stacked");
    expect(p.rows).toBe("minmax(0, 1fr)");
    expect(p.cells).toEqual([
      { id: "teacher", area: "1 / 1 / 2 / 2" },
      { id: "board", area: "1 / 3 / 2 / 4" },
    ]);
    expect(p.dividers).toEqual([{ key: "left-board", axis: "column", area: "1 / 2 / 2 / 3", adjust: "column", before: "teacher", after: "board" }]);
  });
  it("a single pane takes the window in either layout, no dividers", () => {
    for (const layout of ["stacked", "beside"] as const) {
      for (const id of ALL_PANES) {
        const p = placeFor([id], layout);
        expect(p.cells).toEqual([{ id, area: "1 / 1 / 2 / 2" }]);
        expect(p.dividers).toEqual([]);
      }
    }
  });
});

describe("resize", () => {
  const all = ["student", "teacher", "board"] as const;
  const column = placeFor(all, "stacked").dividers.find((d) => d.adjust === "column")!;
  const row = placeFor(all, "stacked").dividers.find((d) => d.adjust === "row")!;
  const [st, tb] = placeFor(all, "beside").dividers;
  it("moves the stacked splits by the dragged fraction", () => {
    expect(resize(DEFAULT_SIZES, column, 0.1, all).column).toBeCloseTo(0.7);
    expect(resize(DEFAULT_SIZES, row, -0.2, all).row).toBeCloseTo(0.3);
  });
  it("keeps every share above the minimum", () => {
    expect(resize(DEFAULT_SIZES, column, 0.9, all).column).toBe(1 - MIN_SHARE);
    expect(resize(DEFAULT_SIZES, row, -0.9, all).row).toBe(MIN_SHARE);
  });
  it("beside: moves weight between the two panes either side, the rest untouched", () => {
    const s = resize(DEFAULT_SIZES, st, 0.1, all);
    // Total weight 3; a tenth of the extent is 0.3 of weight.
    expect(s.weights.student).toBeCloseTo(1.3);
    expect(s.weights.teacher).toBeCloseTo(0.7);
    expect(s.weights.board).toBe(1);
    // Another 0.3 off the teacher would take it under the minimum (0.45 of 3), so it stops there.
    const t = resize(s, tb, -0.1, all);
    expect(t.weights.teacher).toBeCloseTo(MIN_SHARE * 3);
    expect(t.weights.board).toBeCloseTo(1.25);
    expect(t.weights.student).toBeCloseTo(1.3);
  });
  it("beside: neither neighbour goes under the minimum share of the shown total", () => {
    const s = resize(DEFAULT_SIZES, st, 5, all);
    expect(s.weights.teacher).toBeCloseTo(MIN_SHARE * 3);
    expect(s.weights.student).toBeCloseTo(2 - MIN_SHARE * 3);
    const t = resize(DEFAULT_SIZES, st, -5, all);
    expect(t.weights.student).toBeCloseTo(MIN_SHARE * 3);
  });
  it("resetSize restores one dimension and leaves the others", () => {
    const moved = { column: 0.8, row: 0.2, weights: { student: 2, teacher: 0.5, board: 0.5 } };
    expect(resetSize(moved, column)).toEqual({ ...moved, column: 0.6 });
    expect(resetSize(moved, row)).toEqual({ ...moved, row: 0.5 });
    expect(resetSize(moved, st)).toEqual({ ...moved, weights: { student: 1, teacher: 1, board: 0.5 } });
  });
  it("parseSizes takes valid stored sizes and falls back per part", () => {
    expect(parseSizes(undefined)).toEqual(DEFAULT_SIZES);
    expect(parseSizes({ column: 0.7, row: "x", weights: { student: 2, board: -1 } })).toEqual({ column: 0.7, row: 0.5, weights: { student: 2, teacher: 1, board: 1 } });
    expect(parseSizes({ column: 0.99 }).column).toBe(0.6);
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
  it("the teacher pane is a 1280 × 800 laptop: a short pane shrinks it, a big pane is filled at scale 1", () => {
    const teacher = design("teacher");
    expect(teacher).toEqual({ width: 1280, height: 800, fit: "fill" });
    // The stacked layout's default: half a laptop-high window, the laptop at half scale across the pane.
    expect(frameFor({ width: 1900, height: 400 }, teacher)).toEqual({ scale: 0.5, width: 3800, height: 800, left: 0, top: 0 });
    // A pane at least the laptop's size takes the teacher at full size, nothing letterboxed.
    expect(frameFor({ width: 1900, height: 1000 }, teacher)).toEqual({ scale: 1, width: 1900, height: 1000, left: 0, top: 0 });
  });
  it("is safe before the pane has been measured", () => {
    expect(frameFor({ width: 0, height: 0 }, fill)).toEqual({ scale: 1, width: 0, height: 0, left: 0, top: 0 });
  });
  it("the student pane fills, at the stage's own width and height, so the device lands at scale 1 inside", () => {
    expect(design("student")).toEqual({ width: DEVICE_W + STAGE_MARGIN, height: DEVICE_H + STAGE_MARGIN, fit: "fill" });
  });
  it("every surface has a design height, so a short pane shrinks it rather than cropping it; the board is the one letterboxed", () => {
    expect(PANES.filter((p) => !p.design.height).map((p) => p.id)).toEqual([]);
    expect(PANES.filter((p) => p.design.fit === "letterbox").map((p) => p.id)).toEqual(["board"]);
    expect(PANES.map((p) => p.href)).toEqual(["/student", "/teacher", "/board"]);
  });
});

describe("dragStep", () => {
  const divider = placeFor(["student", "teacher", "board"], "stacked").dividers.find((d) => d.key === "left-board")!;
  const shown = ["student", "teacher", "board"] as const;
  const drag: Drag = { divider, pointerId: 7, x: 600, y: 300, from: DEFAULT_SIZES, extent: 1000, sizes: DEFAULT_SIZES };
  const ev = (type: string, clientX: number, buttons = 1, pointerId = 7) => ({ type, pointerId, buttons, clientX, clientY: 300 });

  it("moves with the pointer while the primary button is held", () => {
    expect(dragStep(drag, ev("pointermove", 700), shown)).toEqual({ kind: "move", sizes: { ...DEFAULT_SIZES, column: 0.7 } });
    expect(dragStep(drag, ev("pointermove", 500, 3), shown)).toEqual({ kind: "move", sizes: { ...DEFAULT_SIZES, column: 0.5 } });
  });
  it("ends at the release point on pointerup", () => {
    expect(dragStep(drag, ev("pointerup", 650, 0), shown)).toEqual({ kind: "end", sizes: { ...DEFAULT_SIZES, column: 0.65 } });
  });
  it("ends at the sizes last shown when a move arrives with the button up: the release was missed", () => {
    const last = { ...DEFAULT_SIZES, column: 0.55 };
    expect(dragStep({ ...drag, sizes: last }, ev("pointermove", 900, 0), shown)).toEqual({ kind: "end", sizes: last });
    // The right button alone does not count as holding the handle.
    expect(dragStep({ ...drag, sizes: last }, ev("pointermove", 900, 2), shown)).toEqual({ kind: "end", sizes: last });
  });
  it("ends at the sizes last shown on pointercancel", () => {
    const last = { ...DEFAULT_SIZES, column: 0.4 };
    expect(dragStep({ ...drag, sizes: last }, ev("pointercancel", 100, 0), shown)).toEqual({ kind: "end", sizes: last });
  });
  it("ignores another pointer", () => {
    expect(dragStep(drag, ev("pointermove", 900, 1, 8), shown)).toEqual({ kind: "ignore" });
    expect(dragStep(drag, ev("pointerup", 900, 0, 8), shown)).toEqual({ kind: "ignore" });
  });
  it("reads the row axis from clientY", () => {
    const row = placeFor(["student", "teacher"], "stacked").dividers[0];
    expect(dragStep({ ...drag, divider: row }, { type: "pointermove", pointerId: 7, buttons: 1, clientX: 0, clientY: 400 }, shown)).toEqual({ kind: "move", sizes: { ...DEFAULT_SIZES, row: 0.6 } });
  });
});
