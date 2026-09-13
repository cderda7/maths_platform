import type { MistakeRow, ProblemMistakes } from "./mistakes";

/**
 * Arrivals on the Mistakes tab while the class streams in (ticket 189). Two rules, both pure here:
 *
 * 1. A name that has just arrived glows faintly and fades (`ARRIVAL_FADE_MS`), keyed on when it
 *    arrived (`MistakeRow.arrivedAt`), so a reload never replays an old arrival.
 * 2. Nothing moves under the pointer. A new name appends to the end of its cluster, but a new
 *    working is a new column, which narrows its neighbours, and a new problem card pushes the cards
 *    below it down. So while the pointer is over the list, every card whose top is at or above the
 *    pointer keeps the names it shows (`holdAbovePointer`), and no new card is put in above the
 *    pointer; the counts beside a held card still tick (their width never changes). Cards below the
 *    pointer update at once. When the pointer moves on, the held names land, glowing from that moment.
 *
 * See DECISION_LOG.md, 2026-09-13 (arrivals held above the pointer).
 */

/** How long an arrived name glows before it has faded out. */
export const ARRIVAL_FADE_MS = 8000;

/** A problem card as shown: its rows may be held, its counts are the latest (`wrong` is the latest number of rows). */
export type ShownProblem = ProblemMistakes & { wrong: number };

export interface HoldState {
  problems: ShownProblem[];
  /** Row ids waiting in a held card (or a card not yet shown above the pointer), by problem id. */
  held: Record<string, string[]>;
  /** When a held row was finally shown, by `problem:row`: its glow starts then, not at its submission. */
  released: Record<string, number>;
}

export const EMPTY_HOLD: HoldState = { problems: [], held: {}, released: {} };

const rowKey = (problemId: string, r: Pick<MistakeRow, "id">) => `${problemId}:${r.id}`;

/**
 * The cards to show now. `latest` is the list as the data has it (problems in set order); `prev` what was
 * shown last; `guarded` how many of the shown cards have their top at or above the pointer (0 when the
 * pointer is off the list); `order` the set's problem ids, to place a new card; `now` stamps a release.
 */
export function holdAbovePointer(latest: readonly ProblemMistakes[], prev: HoldState, guarded: number, order: readonly string[], now: number): HoldState {
  const g = Math.max(0, Math.min(guarded, prev.problems.length));
  const at = (id: string) => order.indexOf(id);
  const latestById = new Map(latest.map((p) => [p.problem.id, p]));
  const top: ShownProblem[] = prev.problems.slice(0, g).map((p) => {
    const l = latestById.get(p.problem.id);
    return l ? { ...l, rows: p.rows, wrong: l.rows.length } : p;
  });
  const boundary = g > 0 ? at(prev.problems[g - 1].problem.id) : -1;
  const held: Record<string, string[]> = {};
  for (const l of latest) {
    if (at(l.problem.id) > boundary) continue;
    const shown = top.find((t) => t.problem.id === l.problem.id)?.rows ?? [];
    const waiting = l.rows.filter((r) => !shown.some((s) => s.id === r.id)).map((r) => r.id);
    if (waiting.length) held[l.problem.id] = waiting;
  }
  const released: Record<string, number> = {};
  // Keep a release stamp while its glow runs.
  for (const [k, t] of Object.entries(prev.released)) if (now - t < ARRIVAL_FADE_MS) released[k] = t;
  const rest: ShownProblem[] = latest
    .filter((p) => at(p.problem.id) > boundary)
    .map((p) => {
      const was = prev.held[p.problem.id] ?? [];
      for (const id of was) if (!(rowKey(p.problem.id, { id }) in released)) released[rowKey(p.problem.id, { id })] = now;
      const rows = p.rows.map((r) => {
        const stamp = released[rowKey(p.problem.id, r)];
        return stamp !== undefined && (r.arrivedAt === undefined || stamp > r.arrivedAt) ? { ...r, arrivedAt: stamp } : r;
      });
      return { ...p, rows, wrong: p.rows.length };
    });
  return { problems: [...top, ...rest], held, released };
}

/** A fingerprint of what a hold state shows, so the view stores a new one only when something changed. */
export function holdKey(s: HoldState): string {
  const cards = s.problems.map((p) => `${p.problem.id}[${p.rows.map((r) => `${r.id}@${r.arrivedAt ?? ""}`).join(",")}]${p.right}/${p.wrong}/${p.pending}`).join(";");
  return `${cards}|${JSON.stringify(s.held)}|${Object.keys(s.released).sort().join(",")}`;
}

/** Whether a name's glow is still running at `now`. */
export const arriving = (arrivedAt: number | undefined, now: number): boolean => arrivedAt !== undefined && now - arrivedAt >= -1000 && now - arrivedAt < ARRIVAL_FADE_MS;
