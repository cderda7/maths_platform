"use client";

import { useState } from "react";
import M from "@/components/Math";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import type { Diagnostic } from "@/data/diagnostic";
import { questionFor } from "@/lib/diagnostic";

/** A diagnostic pushed by the teacher, over whatever the student was doing. Answer, then straight back. */
export default function DiagnosticModal({ questionId, question, onAnswer }: { questionId: string; question?: Diagnostic; onAnswer: (option: string) => void }) {
  const d = questionFor(questionId, question);
  const [pick, setPick] = useState<string | null>(null);
  if (!d) return null;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-ink/40 p-10 backdrop-blur-[2px]" role="dialog" aria-modal data-diagnostic>
      <div className="w-[600px] rounded-3xl bg-paper p-8 shadow-lift">
        <Eyebrow>Quick check from {ASSIGNMENT.teacher}</Eyebrow>
        <h2 className="font-display mt-2 text-[26px] leading-tight text-ink">
          {d.stem}
          {d.tex ? (
            <>
              {" "}
              <span className="whitespace-nowrap">
                <M tex={d.tex} />?
              </span>
            </>
          ) : (
            "?"
          )}
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {d.options.map((o) => {
            const on = pick === o.id;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => setPick(o.id)}
                  aria-pressed={on}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[18px] transition-colors ${on ? "border-ink bg-ink text-white" : "border-line bg-paper text-ink hover:border-ink-muted"}`}
                  data-option={o.id}
                >
                  <span className={`text-[12px] font-semibold uppercase ${on ? "text-white/70" : "text-ink-muted"}`}>{o.id}</span>
                  <M tex={o.tex} />
                </button>
              </li>
            );
          })}
        </ul>
        <div className="mt-6 flex justify-end">
          <Button size="lg" hit disabled={!pick} onClick={() => pick && onAnswer(pick)} data-send>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
