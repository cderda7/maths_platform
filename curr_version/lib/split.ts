import { DEVICE_H, DEVICE_W, STAGE_MARGIN } from "./ipad";

/**
 * The split view: the student iPad, the teacher view and the projected board in one tab, any one,
 * two or all three of them, fitted to the window. Each pane is an iframe of the real route, laid
 * out at that surface's design viewport and scaled down to fit its pane; the stores sync the panes
 * as they sync tabs. Pure helpers here; `app/split/SplitView.tsx` renders them.
 */
export type PaneId = "student" | "teacher" | "board";
export type Layout = "stacked" | "beside";

/**
 * A surface and the viewport it is designed for. `height` is set for a surface with a natural
 * height (the iPad, the board's 16:9 slide), so a pane never crops it. `fit` says what to do with
 * the pane's spare room: `fill` lays the surface out over the whole pane (the iPad stage centres
 * the device itself and paints its glow to the edges); `letterbox` keeps the design's aspect and
 * centres it, cream around it (the board is a projector image, not a page).
 */
export type Design = { width: number; height?: number; fit: "fill" | "letterbox" };
export type Pane = { id: PaneId; label: string; href: string; design: Design };

/** The three surfaces in the order they sit on the page. */
export const PANES: readonly Pane[] = [
  // The stage's own margin included, so the device sits inside its pane at scale 1 on the stage's terms.
  { id: "student", label: "Student", href: "/student", design: { width: DEVICE_W + STAGE_MARGIN, height: DEVICE_H + STAGE_MARGIN, fit: "fill" } },
  // A small laptop: the teacher's 0.8 zoom makes it 1600 layout px, enough for the dashboard's columns, and
  // close to the iPad's width so the panes land at about the same scale. It scrolls, so no height.
  { id: "teacher", label: "Teacher", href: "/teacher", design: { width: 1280, fit: "fill" } },
  // A projector at 16:9. Narrower and the example lines wrap.
  { id: "board", label: "Board", href: "/teacher/board", design: { width: 1440, height: 810, fit: "letterbox" } },
];

export const ALL_PANES: readonly PaneId[] = PANES.map((p) => p.id);

const isPaneId = (s: string): s is PaneId => ALL_PANES.includes(s as PaneId);

/** Page order, whatever order the ids came in. */
const ordered = (ids: Iterable<PaneId>): PaneId[] => {
  const set = new Set(ids);
  return ALL_PANES.filter((id) => set.has(id));
};

/**
 * `?panes=student,teacher` → the named panes in page order; unknown names are dropped, repeats
 * collapse. `null` when the parameter is absent or names nothing, so the caller can fall back.
 */
export function parsePanes(raw: string | undefined): PaneId[] | null {
  if (raw === undefined) return null;
  const ids = raw.split(",").map((s) => s.trim()).filter(isPaneId);
  return ids.length ? ordered(ids) : null;
}

export const serialisePanes = (panes: readonly PaneId[]): string => ordered(panes).join(",");

/** Switch a pane on or off. The last pane stays: the view is never empty. */
export function togglePane(panes: readonly PaneId[], id: PaneId): PaneId[] {
  if (panes.includes(id)) return panes.length === 1 ? [...panes] : ordered(panes.filter((p) => p !== id));
  return ordered([...panes, id]);
}

/** Stacked unless the URL says beside. */
export const parseLayout = (raw: string | undefined): Layout => (raw === "beside" ? "beside" : "stacked");

/** A pane's cell as a CSS `grid-area`: row start / column start / row end / column end. */
export type Cell = { id: PaneId; area: string };

/**
 * A draggable boundary in a gutter track. `adjust` names what it moves: the stacked layout's
 * `column` split (left column against the board) or `row` split (student against teacher), or the
 * `weights` of the two panes either side of it when beside. `before`/`after` are those panes.
 */
export type Divider = { key: string; axis: "column" | "row"; area: string; adjust: "column" | "row" | "weights"; before: PaneId; after: PaneId };
export type Placement = { columns: string; rows: string; cells: Cell[]; dividers: Divider[] };

/**
 * The presenter's sizes, kept with the pane choice: the stacked layout's left-column share and
 * student-row share, and a weight per pane for the side-by-side columns. Dividers move them;
 * no share ever goes under `MIN_SHARE`, so a pane can be made small but never lost.
 */
export type Sizes = { column: number; row: number; weights: Record<PaneId, number> };
export const DEFAULT_SIZES: Sizes = { column: 0.6, row: 0.5, weights: { student: 1, teacher: 1, board: 1 } };
export const MIN_SHARE = 0.15;
/** The gutter track between panes, in px; the divider handle lives in it. */
export const GUTTER = 12;

const clampShare = (v: number) => Math.min(1 - MIN_SHARE, Math.max(MIN_SHARE, v));
const area = (r1: number, c1: number, r2: number, c2: number) => `${r1} / ${c1} / ${r2} / ${c2}`;
/** Pane tracks separated by gutter tracks: `a` → lines 1–2, gutter 2–3, `b` → lines 3–4 … */
const tracks = (shares: number[]) => shares.map((s) => `minmax(0, ${Number(s.toFixed(4))}fr)`).join(` ${GUTTER}px `);
const paneLine = (i: number) => 2 * i + 1;

/**
 * Where the chosen panes go, the whole window and nothing scrolling, with a divider in every
 * gutter. Beside: one window-high column per pane, widths by weight. Stacked: the student over
 * the teacher in a left column (`sizes.column` of the width, the student `sizes.row` of its
 * height) and the board down the right, the whole height; without the board the left column is
 * the width, without the others the board is.
 */
export function placeFor(panes: readonly PaneId[], layout: Layout, sizes: Sizes = DEFAULT_SIZES): Placement {
  const shown = ordered(panes);
  if (layout === "beside") {
    const cells = shown.map((id, i) => ({ id, area: area(1, paneLine(i), 2, paneLine(i) + 1) }));
    const dividers: Divider[] = shown.slice(1).map((id, i) => ({ key: `${shown[i]}-${id}`, axis: "column", area: area(1, paneLine(i) + 1, 2, paneLine(i) + 2), adjust: "weights", before: shown[i], after: id }));
    return { columns: tracks(shown.map((id) => sizes.weights[id])), rows: "minmax(0, 1fr)", cells, dividers };
  }
  const left = shown.filter((id) => id !== "board");
  const board = shown.includes("board");
  const row = clampShare(sizes.row);
  const rowShares = left.length === 2 ? [row, 1 - row] : [1];
  const rowDividers: Divider[] = left.length === 2 ? [{ key: "student-teacher", axis: "row", area: area(2, 1, 3, 2), adjust: "row", before: left[0], after: left[1] }] : [];
  const leftCells = left.map((id, i) => ({ id, area: area(paneLine(i), 1, paneLine(i) + 1, 2) }));
  if (!board) return { columns: "minmax(0, 1fr)", rows: tracks(rowShares), cells: leftCells, dividers: rowDividers };
  if (!left.length) return { columns: "minmax(0, 1fr)", rows: "minmax(0, 1fr)", cells: [{ id: "board", area: area(1, 1, 2, 2) }], dividers: [] };
  const column = clampShare(sizes.column);
  const lastRow = paneLine(left.length - 1) + 1;
  return {
    columns: tracks([column, 1 - column]),
    rows: tracks(rowShares),
    cells: [...leftCells, { id: "board", area: area(1, 3, lastRow, 4) }],
    dividers: [...rowDividers, { key: "left-board", axis: "column", area: area(1, 2, lastRow, 3), adjust: "column", before: left[left.length - 1], after: "board" }],
  };
}

/**
 * The sizes after a divider is dragged by `delta`, a fraction of the axis's resizable extent
 * (the grid's width or height less its gutters). The stacked splits move directly; a beside
 * divider moves weight from the pane after it to the pane before it, both kept above
 * `MIN_SHARE` of the shown panes' total.
 */
export function resize(sizes: Sizes, divider: Divider, delta: number, shown: readonly PaneId[]): Sizes {
  if (divider.adjust === "column") return { ...sizes, column: clampShare(sizes.column + delta) };
  if (divider.adjust === "row") return { ...sizes, row: clampShare(sizes.row + delta) };
  const total = shown.reduce((sum, id) => sum + sizes.weights[id], 0);
  const before = sizes.weights[divider.before];
  const after = sizes.weights[divider.after];
  const min = MIN_SHARE * total;
  const shift = Math.max(min - before, Math.min(after - min, delta * total));
  return { ...sizes, weights: { ...sizes.weights, [divider.before]: before + shift, [divider.after]: after - shift } };
}

/** A divider's dimension back to its default; the others keep theirs. */
export function resetSize(sizes: Sizes, divider: Divider): Sizes {
  if (divider.adjust === "column") return { ...sizes, column: DEFAULT_SIZES.column };
  if (divider.adjust === "row") return { ...sizes, row: DEFAULT_SIZES.row };
  return { ...sizes, weights: { ...sizes.weights, [divider.before]: DEFAULT_SIZES.weights[divider.before], [divider.after]: DEFAULT_SIZES.weights[divider.after] } };
}

/** Stored sizes, checked: any missing or malformed part falls back to its default. */
export function parseSizes(raw: unknown): Sizes {
  const o = (raw ?? {}) as Partial<{ column: unknown; row: unknown; weights: Partial<Record<PaneId, unknown>> }>;
  const share = (v: unknown, d: number) => (typeof v === "number" && v >= MIN_SHARE && v <= 1 - MIN_SHARE ? v : d);
  const weight = (v: unknown, d: number) => (typeof v === "number" && v > 0 && Number.isFinite(v) ? v : d);
  const w = o.weights ?? {};
  return {
    column: share(o.column, DEFAULT_SIZES.column),
    row: share(o.row, DEFAULT_SIZES.row),
    weights: { student: weight(w.student, 1), teacher: weight(w.teacher, 1), board: weight(w.board, 1) },
  };
}

export type Frame = { scale: number; width: number; height: number; left: number; top: number };

/**
 * The iframe for a pane of the given size. `fill`: laid out at its design width (and height, when
 * the design has one) when the pane is smaller, scaled down to fit, and covering the pane exactly;
 * at the pane's own size when the pane is at least as large. `letterbox`: the largest box of the
 * design's aspect that fits, centred, never scaled up past 1 (a bigger pane gets a bigger frame).
 */
export function frameFor(pane: { width: number; height: number }, design: Design): Frame {
  if (pane.width <= 0 || pane.height <= 0) return { scale: 1, width: 0, height: 0, left: 0, top: 0 };
  if (design.fit === "letterbox" && design.height) {
    const boxW = Math.min(pane.width, (pane.height * design.width) / design.height);
    const boxH = (boxW * design.height) / design.width;
    const scale = Math.min(1, boxW / design.width);
    return { scale, width: boxW / scale, height: boxH / scale, left: (pane.width - boxW) / 2, top: (pane.height - boxH) / 2 };
  }
  const scale = Math.min(1, pane.width / design.width, design.height ? pane.height / design.height : 1);
  return { scale, width: pane.width / scale, height: pane.height / scale, left: 0, top: 0 };
}
