"use client";

import DiagnosticStem from "@/components/DiagnosticStem";
import FitText from "@/components/FitText";
import M from "@/components/Math";
import { Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { questionFor } from "@/lib/diagnostic";
import { useEscape } from "@/components/useEscape";
import { chainPosition, currentIndex, isRevealed, type DiagnosticRun } from "@/lib/diagnosticChain";

/**
 * A live diagnostic chain from the teacher, over whatever the student was doing (ticket 241): the current step, "1st of 3"
 * on a longer chain. The first tap is the answer and cannot be changed: that option holds a neutral highlight with
 * "Waiting for the class…". Once the step is revealed (everyone in, or force submit) the right option turns green and the
 * student's own highlight goes; nothing marks a pick wrong. There is no way back to the work: the modal stays until the
 * teacher's back to work ends the chain, and the next step replaces this one. Everything comes from the stored run, so a
 * reload lands on the same state.
 */
export default function DiagnosticModal({ run, now, absent, onAnswer }: { run: DiagnosticRun; now: number; /** The live set's absent students (ticket 250): the step closes once everyone else has answered. */ absent: readonly string[]; onAnswer: (option: string) => void }) {
  const index = currentIndex(run);
  const d = questionFor(run.steps[index]);
  // Escape does nothing here, and closes nothing under it (ticket 247).
  useEscape(!!d, null);
  if (!d) return null;
  const mine = run.answers[d.id]?.option ?? null;
  const revealed = isRevealed(run, index, now, absent);
  const position = chainPosition(run, index);
  const open = mine === null && !revealed;
  return (
    <div className="absolute inset-0 z-30 grid place-items-center bg-ink/40 p-10 backdrop-blur-[2px]" role="dialog" aria-modal data-diagnostic={d.id} data-revealed={revealed || undefined}>
      <div className="w-[600px] rounded-3xl bg-paper p-8 shadow-lift">
        <div className="flex items-baseline justify-between gap-4">
          <Eyebrow>Quick check from {ASSIGNMENT.teacher}</Eyebrow>
          {position && (
            <Eyebrow className="shrink-0">
              <span data-chain-position>{position}</span>
            </Eyebrow>
          )}
        </div>
        <h2 className="font-display mt-2 text-balance text-[26px] leading-tight text-ink">
          <DiagnosticStem question={d} />
        </h2>
        <ul className="mt-5 grid grid-cols-2 gap-2.5">
          {d.options.map((o) => {
            const picked = !revealed && mine === o.id;
            const correct = revealed && o.id === d.correct;
            const tone = picked ? "border-ink bg-ink text-white" : correct ? "border-secure-line bg-secure-soft text-ink" : `border-line bg-paper text-ink ${open ? "hover:border-ink-muted" : ""}`;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => open && onAnswer(o.id)}
                  disabled={!open}
                  aria-pressed={picked}
                  className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-[18px] transition-colors disabled:cursor-default ${tone}`}
                  data-option={o.id}
                  data-picked={picked || undefined}
                  data-correct={correct || undefined}
                >
                  <span className={`shrink-0 text-[12px] font-semibold uppercase ${picked ? "text-white/70" : "text-ink-muted"}`}>{o.id}</span>
                  {/* A long option (a sentence in maths) scales to its button rather than running out of it. */}
                  <span className="min-w-0 flex-1">
                    <FitText max={18} fitKey={`${d.id}:${o.id}`}>
                      <M tex={o.tex} />
                    </FitText>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {/* One line under the options, its height held so nothing moves when the words come and go. */}
        <p className="mt-5 flex h-6 items-center justify-end gap-2 text-[15px] text-ink-soft" data-chain-status>
          {mine !== null && !revealed && (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-accent" aria-hidden />
              Waiting for the class…
            </>
          )}
        </p>
      </div>
    </div>
  );
}
