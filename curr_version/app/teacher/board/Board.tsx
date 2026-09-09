"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import M from "@/components/Math";
import { BrandMark } from "@/components/Brand";
import { PROBLEM_MAP } from "@/data/assignment";
import { currentSlide } from "@/lib/classroom";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { boardExamples } from "@/lib/examples";
import { useBatchedSession } from "@/lib/store";

/**
 * The projected board. One slide per chosen problem: the statement and 2–3 anonymous examples
 * with "n/m students". No names, no avatars, no ink, no verdicts anywhere on this route; the
 * control strip is prev · position · next · End.
 */
export default function Board() {
  const router = useRouter();
  const classroom = useClassroom();
  const { session } = useBatchedSession(3000);
  const slide = currentSlide(classroom);

  if (!slide) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream text-center">
        <div>
          <p className="text-[15px] text-ink-muted">No session projecting</p>
          <Link href="/teacher/whole-class" className="mt-3 inline-block text-[14px] text-accent-deep hover:underline">
            Set up →
          </Link>
        </div>
      </div>
    );
  }

  const p = PROBLEM_MAP[slide.problemId];
  const examples = boardExamples(classroom.wholeClass?.examples[slide.problemId] ?? [], slide.problemId, session);
  const end = () => {
    dispatchClassroom({ type: "wc/end" });
    router.push("/teacher");
  };

  return (
    <div className="flex min-h-screen flex-col bg-cream" data-board data-slide={slide.index} data-view={slide.view}>
      <header className="flex items-center justify-between px-10 py-6">
        <div className="flex items-center gap-4">
          <BrandMark />
          <span className="font-display text-[34px] text-ink">{p.label}</span>
        </div>
        <div className="math-lg text-[30px] text-ink">
          <M tex={p.tex} />
        </div>
      </header>
      <p className="px-10 text-[20px] text-ink-soft">{p.stem}</p>

      <main className={`mt-6 grid flex-1 gap-6 px-10 ${examples.length === 3 ? "grid-cols-3" : "grid-cols-2"}`} data-examples>
        {examples.map((e) => (
          <section key={e.letter} className="flex flex-col rounded-3xl border border-line bg-paper p-7 shadow-card" data-example={e.letter}>
            <div className="flex items-baseline justify-between">
              <span className="font-display text-[44px] leading-none text-ink">{e.letter}</span>
              <span className="text-[18px] text-ink-soft" data-count>
                {e.count}/{e.denominator} students
              </span>
            </div>
            <ol className="mt-6 space-y-3">
              {e.lines.map((tex, i) => (
                <li key={i} className="rounded-2xl border border-line bg-cream/50 px-5 py-4 text-[26px] text-ink">
                  <M tex={tex} />
                </li>
              ))}
            </ol>
          </section>
        ))}
      </main>

      <footer className="flex items-center justify-between px-10 py-6">
        <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[16px] text-ink hover:border-ink-muted disabled:opacity-30" onClick={() => dispatchClassroom({ type: "wc/prev" })} disabled={slide.index === 0 && slide.view === "unmarked"} data-prev>
          ← Previous
        </button>
        <span className="text-[16px] text-ink-muted" data-position>
          problem {slide.index + 1} of {slide.total}
        </span>
        <div className="flex items-center gap-3">
          <button type="button" className="rounded-full border border-line bg-paper px-5 py-2.5 text-[16px] text-ink hover:border-ink-muted" onClick={end} data-end>
            End
          </button>
          <button type="button" className="rounded-full bg-ink px-6 py-2.5 text-[16px] font-medium text-white hover:bg-ink-soft disabled:opacity-30" onClick={() => dispatchClassroom({ type: "wc/next" })} disabled={slide.index >= slide.total - 1} data-next>
            Next →
          </button>
        </div>
      </footer>
    </div>
  );
}
