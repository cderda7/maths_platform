/**
 * Bookkeeping for simulated recognition. Strokes arrive in bursts; when a burst ends (pen up,
 * then idle) the next scripted line is revealed and remembers how many strokes existed at that
 * moment. Undo pops strokes; any line revealed after the surviving stroke count is withdrawn.
 * Pure, so the timing lives in the component and the rules live here.
 */
export interface RevealedLine {
  tex: string;
  /** Total strokes on the pad when this line was revealed. */
  strokeCount: number;
}

/** The next line to reveal for this burst, or null if the script is exhausted or nothing new was drawn. */
export function nextLine(script: string[], revealed: RevealedLine[], strokeCount: number): RevealedLine | null {
  const last = revealed[revealed.length - 1];
  if (last && strokeCount <= last.strokeCount) return null;
  if (strokeCount === 0) return null;
  const tex = script[revealed.length];
  return tex === undefined ? null : { tex, strokeCount };
}

/** Lines that still stand once only `strokeCount` strokes remain. */
export function afterUndo(revealed: RevealedLine[], strokeCount: number): RevealedLine[] {
  return revealed.filter((l) => l.strokeCount <= strokeCount);
}

/** Every scripted line has been revealed: the working is finished, as far as the pad can read it. */
export function scriptDone(script: string[], revealed: RevealedLine[]): boolean {
  return script.length > 0 && revealed.length >= script.length;
}
