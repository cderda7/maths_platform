"use client";

import { useState } from "react";
import HintCard from "@/components/HintCard";
import type { HintTerm, PracticeProblem } from "@/data/types";
import { hintAnchor } from "@/lib/hint";

/**
 * The hints shown on a problem, as the practice pad reads them (ticket 312 shares it between Q** and a set question back on
 * itself): the cards in the order given, where each card's linked words point (0 the question, k the k-th line of the working
 * on screen), the terms to wrap at each piece and the one lit. `lineCount` is how many lines of working are on screen.
 */
export function useHints(p: Pick<PracticeProblem, "hints">, shown: readonly number[], lineCount: number) {
  const hints = shown.map((i) => p.hints[i]).filter((h) => h !== undefined);
  const anchors = hints.map((h) => hintAnchor(h, lineCount));
  const terms = hints.flatMap((h) => h.terms ?? []);
  const termsAt = (k: number) => hints.flatMap((h, i) => (anchors[i] === k ? (h.terms ?? []) : []));
  /** The hint word under the pointer; lights its fragments while it stays there. */
  const [lit, setLit] = useState<HintTerm | null>(null);
  const litTerm = lit && terms.includes(lit) ? lit : undefined;
  const litAnchor = litTerm ? anchors[hints.findIndex((h) => h.terms?.includes(litTerm))] : 0;
  /** The lit term goes only to the piece its hint points at: the same fragment elsewhere stays unlit. */
  const litAt = (k: number) => (litTerm && litAnchor === k ? litTerm : undefined);
  /** Earlier hints collapse to a line; these are the ones opened back up. */
  const [reopened, setReopened] = useState<number[]>([]);
  const toggle = (i: number) => setReopened((r) => (r.includes(i) ? r.filter((x) => x !== i) : [...r, i]));
  return { hints, anchors, termsAt, litAt, litAnchor, litTerm, setLit, reopened, toggle, shown };
}

/** The hint cards themselves, latest open with "Talk it through", earlier ones collapsed until opened. `lineWord` names the working's lines in the note ("your line 2"; on Q**, where some lines are given, "line 2"). */
export function HintCards({ p, h, onTalk, lineWord = "your line" }: { p: Pick<PracticeProblem, "hints">; h: ReturnType<typeof useHints>; onTalk?: () => void; lineWord?: string }) {
  return (
    <>
      {h.hints.map((hint, i) => (
        <HintCard
          key={h.shown[i]}
          hint={hint}
          label={p.hints.length > 1 ? `Hint ${i + 1}` : "Hint"}
          note={h.anchors[i] > 0 ? `${lineWord} ${h.anchors[i]}` : undefined}
          lit={h.litTerm ?? null}
          onLit={h.setLit}
          collapsed={i < h.hints.length - 1 && !h.reopened.includes(h.shown[i])}
          onToggle={i < h.hints.length - 1 ? () => h.toggle(h.shown[i]) : undefined}
          onTalk={i === h.hints.length - 1 ? onTalk : undefined}
          className={i === 0 ? "mt-5" : "mt-2"}
        />
      ))}
    </>
  );
}
