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
export type Placement = { columns: string; rows: number; cells: Cell[] };

const area = (r1: number, c1: number, r2: number, c2: number) => `${r1} / ${c1} / ${r2} / ${c2}`;

/**
 * Where the chosen panes go, the whole window and nothing scrolling. Beside: one window-high
 * column per pane. Stacked: the student over the teacher in a left column of three fifths, each
 * half the height, and the board down the right at two fifths, the whole height; without the
 * board the left column is the width, without the others the board is.
 */
export function placeFor(panes: readonly PaneId[], layout: Layout): Placement {
  const shown = ordered(panes);
  if (layout === "beside") {
    return { columns: `repeat(${Math.max(1, shown.length)}, minmax(0, 1fr))`, rows: 1, cells: shown.map((id, i) => ({ id, area: area(1, i + 1, 2, i + 2) })) };
  }
  const left = shown.filter((id) => id !== "board");
  const board = shown.includes("board");
  if (!board) return { columns: "minmax(0, 1fr)", rows: Math.max(1, left.length), cells: left.map((id, i) => ({ id, area: area(i + 1, 1, i + 2, 2) })) };
  if (!left.length) return { columns: "minmax(0, 1fr)", rows: 1, cells: [{ id: "board", area: area(1, 1, 2, 2) }] };
  return {
    columns: "minmax(0, 3fr) minmax(0, 2fr)",
    rows: left.length,
    cells: [...left.map((id, i) => ({ id, area: area(i + 1, 1, i + 2, 2) })), { id: "board", area: area(1, 2, left.length + 1, 3) }],
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
