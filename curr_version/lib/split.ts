import { DEVICE_W, STAGE_MARGIN } from "./ipad";

/**
 * The split view: the student iPad, the teacher view and the projected board in one tab, any one,
 * two or all three of them. Each pane is an iframe of the real route, laid out at that surface's
 * design width and scaled down to fit its pane; the stores sync the panes as they sync tabs.
 * Pure helpers here; `app/split/SplitView.tsx` renders them.
 */
export type PaneId = "student" | "teacher" | "board";
export type Layout = "beside" | "stacked";

/**
 * A surface and the viewport it is designed for. `design.height` is set only for a surface that
 * fills its screen rather than scrolling (the board), so a wide, short pane scales it to fit its
 * height instead of cropping it.
 */
export type Design = { width: number; height?: number };
export type Pane = { id: PaneId; label: string; href: string; design: Design };

/** The three surfaces in the order they sit on the page. */
export const PANES: readonly Pane[] = [
  // The stage's own margin included, so the device sits inside its pane at scale 1 on the stage's terms; the
  // stage fits the device to its height itself.
  { id: "student", label: "Student", href: "/student", design: { width: DEVICE_W + STAGE_MARGIN } },
  // A small laptop: the teacher's 0.8 zoom makes it 1600 layout px, enough for the dashboard's columns, and
  // close to the iPad's width so the panes land at about the same scale. It scrolls, so no height.
  { id: "teacher", label: "Teacher", href: "/teacher", design: { width: 1280 } },
  // A projector at 16:9. Narrower and the example lines wrap.
  { id: "board", label: "Board", href: "/teacher/board", design: { width: 1440, height: 810 } },
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

export const parseLayout = (raw: string | undefined): Layout => (raw === "stacked" ? "stacked" : "beside");

/**
 * The grid for n panes. Beside: one column per pane. Stacked: one pane per row, except that
 * three panes go two on top and the third across the bottom (the board, in page order).
 */
export function gridFor(count: number, layout: Layout): { columns: number; spanLast: boolean } {
  if (layout === "beside" || count <= 1) return { columns: Math.max(1, count), spanLast: false };
  if (count === 2) return { columns: 1, spanLast: false };
  return { columns: 2, spanLast: true };
}

/**
 * The iframe for a pane of the given size: laid out at its design width (and height, when the
 * design has one) when the pane is smaller, and scaled down to fit; at the pane's own size when
 * the pane is at least as large. The frame always covers the pane exactly once scaled.
 */
export function frameFor(pane: { width: number; height: number }, design: Design): { scale: number; width: number; height: number } {
  if (pane.width <= 0 || pane.height <= 0) return { scale: 1, width: 0, height: 0 };
  const scale = Math.min(1, pane.width / design.width, design.height ? pane.height / design.height : 1);
  return { scale, width: pane.width / scale, height: pane.height / scale };
}
