"use client";

import { useMemo } from "react";
import QuestionGrid from "./QuestionGrid";
import M from "@/components/Math";
import QuestionView from "@/components/QuestionView";
import { DifficultyTag } from "@/components/Tag";
import { Button, Card } from "@/components/ui";
import type { ProposedQuestion, Recommendation } from "@/data/review";
import type { DraftQuestion } from "@/lib/classroom";
import { parseQuestion } from "@/lib/mathInput";
import { additionOption, allAnswered, applyReview, recommendationsFor, type ActiveRecommendation, type Answer, type ReviewState } from "@/lib/review";

/**
 * The recommendations step: the assessment's cards in a row above the grid, each with Accept
 * and Keep as is; an answered card collapses to one line with Undo, and the grid beneath shows
 * the set as the answers leave it (a changed tile's maths swapped, a removed tile gone, an added
 * tile at the end). "Finalise set" is on once every card has an answer either way.
 */
export default function RecommendationsStep({
  questions,
  review,
  onAnswer,
  onTryAnother,
  onBack,
  onFinalise,
}: {
  questions: DraftQuestion[];
  review: ReviewState;
  onAnswer: (id: string, answer: Answer | null) => void;
  onTryAnother: () => void;
  onBack: () => void;
  onFinalise: () => void;
}) {
  const active = useMemo(() => recommendationsFor(questions), [questions]);
  const final = useMemo(() => applyReview(questions, review), [questions, review]);
  const ready = allAnswered(active, review.answers);
  const position = (id: string | undefined) => `Q${questions.findIndex((q) => q.id === id) + 1}`;
  return (
    <div className="pb-24" data-recommendations-step>
      {active.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-muted" data-no-recommendations>
          Nothing to change: the set reads well as it is.
        </p>
      ) : (
        <div className="mt-8 grid grid-cols-3 gap-4" data-recommendations>
          {active.map((a) => (
            <RecommendationCard key={a.rec.id} active={a} label={position(a.targetId)} target={questions.find((q) => q.id === a.targetId)} answer={review.answers[a.rec.id] ?? null} addition={review.addition} onAnswer={(ans) => onAnswer(a.rec.id, ans)} onTryAnother={onTryAnother} />
          ))}
        </div>
      )}
      <QuestionGrid items={final.map((q) => ({ id: q.id, text: q.text, difficulty: q.difficulty, origin: q.origin }))} />
      <div className="fixed bottom-16 right-6 z-30 flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} data-back>
          Back
        </Button>
        <Button size="lg" disabled={!ready} onClick={onFinalise} className="shadow-lift" data-finalise>
          Finalise set
        </Button>
      </div>
    </div>
  );
}

function RecommendationCard({ active, label, target, answer, addition, onAnswer, onTryAnother }: { active: ActiveRecommendation; label: string; target: DraftQuestion | undefined; answer: Answer | null; addition: number; onAnswer: (a: Answer | null) => void; onTryAnother: () => void }) {
  const rec = active.rec;
  const title = rec.kind === "change" ? `Change ${label}` : rec.kind === "remove" ? `Remove ${label}` : "Add a problem";
  const option = rec.kind === "add" ? additionOption(rec.options, addition) : null;
  return (
    <Card className="flex flex-col p-5" data-recommendation={rec.id} data-answer={answer ?? undefined} data-kind={rec.kind}>
      <h2 className="font-display text-[24px] leading-tight text-ink">{title}</h2>
      {answer ? (
        <p className="mt-4 text-[14px] text-ink" data-answered>
          {answer === "accept" ? <Outcome rec={rec} label={label} option={option} /> : "Kept as is."}{" "}
          <button type="button" onClick={() => onAnswer(null)} className="font-medium text-accent-deep hover:underline" data-undo>
            Undo
          </button>
        </p>
      ) : (
        <>
          <div className="mt-4">
            {rec.kind === "change" && target && (
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[17px] text-ink" data-change>
                <M tex={target.tex ?? ""} />
                <span className="text-ink-muted" aria-hidden>
                  →
                </span>
                <M tex={rec.to.tex} />
              </div>
            )}
            {rec.kind === "remove" && target && (
              <div className="rounded-xl border border-dashed border-line-strong px-4 py-3" data-target>
                <QuestionView parsed={parseQuestion(target.text)} />
              </div>
            )}
            {rec.kind === "add" && option && (
              <div className="rounded-xl border border-accent-line bg-accent-soft/40 px-4 py-3" data-proposed data-option={addition % rec.options.length}>
                <QuestionView parsed={parseQuestion(option.text)} />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <DifficultyTag d={option.difficulty} />
                  <button type="button" onClick={onTryAnother} className="text-[13px] font-medium text-accent-deep hover:underline" data-try-another>
                    Try another
                  </button>
                </div>
              </div>
            )}
          </div>
          <p className="mt-4 text-[14px] leading-snug text-ink" data-reason>
            {rec.reason}
          </p>
          {rec.evidence && (
            <p className="mt-2 text-[13px] leading-snug text-ink-muted" data-evidence>
              {rec.evidence}
            </p>
          )}
          <div className="mt-auto flex items-center gap-2 pt-5">
            <Button onClick={() => onAnswer("accept")} data-accept>
              Accept
            </Button>
            <Button variant="ghost" onClick={() => onAnswer("keep")} data-keep>
              Keep as is
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function Outcome({ rec, label, option }: { rec: Recommendation; label: string; option: ProposedQuestion | null }) {
  if (rec.kind === "change")
    return (
      <>
        Accepted · {label} is now <M tex={rec.to.tex} />.
      </>
    );
  if (rec.kind === "remove") return <>Accepted · {label} removed.</>;
  return (
    <>
      Accepted · added as the last problem{option ? <>, <M tex={option.tex} /></> : null}.
    </>
  );
}
