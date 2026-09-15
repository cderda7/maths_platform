"use client";

import { useMemo, useRef, useState } from "react";
import QuestionGrid from "./QuestionGrid";
import M from "@/components/Math";
import QuestionView from "@/components/QuestionView";
import { DifficultyTag } from "@/components/Tag";
import { Button, Card } from "@/components/ui";
import type { ProposedQuestion, Recommendation } from "@/data/review";
import type { DraftQuestion } from "@/lib/classroom";
import { parseQuestion } from "@/lib/mathInput";
import { additionOption, allAnswered, applyReview, recommendationsFor, type ActiveRecommendation, type Answer, type ReviewState } from "@/lib/review";
import { hasPathway, type CreateKind } from "@/lib/createPipeline";
import { CREATE_BAR, CREATE_BAR_CLEARANCE } from "../createBar";

/**
 * The recommendations step: the assessment's cards in a row above the grid, each with Accept
 * and Keep as is; an answered card collapses to one line with Undo, and the grid beneath shows
 * the set as the answers leave it (a changed tile's maths swapped, a removed tile gone, an added tile in a removed
 * one's slot, else at the end, ticket 272). "Finalise set" is on once every card has an answer either way; a press while it
 * waits sends one ring out from each unanswered card instead (ticket 248). A homework (ticket 291) has no pathway after
 * Refine, so the same button reads Create and sends it.
 */
export default function RecommendationsStep({
  kind,
  questions,
  review,
  onAnswer,
  onTryAnother,
  onBack,
  onFinalise,
}: {
  kind: CreateKind;
  questions: DraftQuestion[];
  review: ReviewState;
  onAnswer: (id: string, answer: Answer | null) => void;
  onTryAnother: () => void;
  onBack: () => void;
  onFinalise: () => void;
}) {
  const active = useMemo(() => recommendationsFor(questions, kind), [questions, kind]);
  const final = useMemo(() => applyReview(questions, review, kind), [questions, review, kind]);
  const ready = allAnswered(active, review.answers);
  const position = (id: string | undefined) => `Q${questions.findIndex((q) => q.id === id) + 1}`;
  /** Where an accepted addition sits in the set (ticket 272: in a removed question's slot, else last); null when it is last. */
  const placed = (recId: string) => {
    const i = final.findIndex((q) => q.id === `added-${recId}`);
    return i < 0 || i === final.length - 1 ? null : `Q${i + 1}`;
  };
  const cards = useRef<HTMLDivElement>(null);
  /** Presses on the waiting Finalise; each one remounts the unanswered cards' ring so it plays again (ticket 248). */
  const [nudge, setNudge] = useState(0);
  const finalise = () => {
    if (ready) return onFinalise();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    cards.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
    setNudge((n) => n + 1);
  };
  return (
    <div className={CREATE_BAR_CLEARANCE} data-recommendations-step>
      {active.length === 0 ? (
        <p className="mt-8 text-[14px] text-ink-muted" data-no-recommendations>
          Nothing to change: the set reads well as it is.
        </p>
      ) : (
        <div ref={cards} className="mt-8 grid scroll-mt-8 grid-cols-3 gap-4" data-recommendations>
          {active.map((a) => (
            <RecommendationCard key={a.rec.id} nudge={nudge} active={a} label={position(a.targetId)} placed={placed(a.rec.id)} target={questions.find((q) => q.id === a.targetId)} answer={review.answers[a.rec.id] ?? null} addition={review.addition} onAnswer={(ans) => onAnswer(a.rec.id, ans)} onTryAnother={onTryAnother} />
          ))}
        </div>
      )}
      <QuestionGrid items={final.map((q) => ({ id: q.id, text: q.text, stem: q.stem, tex: q.tex, figureUrl: q.figureUrl, difficulty: q.difficulty, origin: q.origin }))} />
      <div className={CREATE_BAR}>
        <Button variant="secondary" size="lg" onClick={onBack} className="shadow-lift" data-back>
          Back
        </Button>
        <Button size="lg" onClick={finalise} aria-disabled={!ready || undefined} className={`shadow-lift ${ready ? "" : "opacity-40"}`} data-finalise>
          {hasPathway(kind) ? "Finalise set" : "Create"}
        </Button>
      </div>
    </div>
  );
}

function RecommendationCard({ nudge, active, label, placed, target, answer, addition, onAnswer, onTryAnother }: { nudge: number; active: ActiveRecommendation; label: string; placed: string | null; target: DraftQuestion | undefined; answer: Answer | null; addition: number; onAnswer: (a: Answer | null) => void; onTryAnother: () => void }) {
  const rec = active.rec;
  const title = rec.kind === "change" ? `Change ${label}` : rec.kind === "remove" ? `Remove ${label}` : "Add a problem";
  const option = rec.kind === "add" ? additionOption(rec.options, addition) : null;
  return (
    <Card className="relative flex flex-col p-5" data-recommendation={rec.id} data-answer={answer ?? undefined} data-kind={rec.kind}>
      {nudge > 0 && !answer && <span key={nudge} className="ring-once pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden data-ring={nudge} />}
      <h2 className="font-display text-[24px] leading-tight text-ink">{title}</h2>
      {answer ? (
        <p className="mt-4 text-[14px] text-ink" data-answered>
          {answer === "accept" ? <Outcome rec={rec} label={label} placed={placed} option={option} /> : "Kept as is."}{" "}
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
            {/* An ink edge (ticket 248) so Keep as is reads as a choice beside Accept, not a dismiss link. An inset ring, not a border, so the pill
                stays Accept's height; inline because a colour utility would race ghost's own text colour. */}
            <Button variant="ghost" onClick={() => onAnswer("keep")} style={{ boxShadow: "inset 0 0 0 1px var(--color-ink)", color: "var(--color-ink)" }} data-keep>
              Keep as is
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}

function Outcome({ rec, label, placed, option }: { rec: Recommendation; label: string; placed: string | null; option: ProposedQuestion | null }) {
  if (rec.kind === "change")
    return (
      <>
        Accepted · {label} is now <M tex={rec.to.tex} />.
      </>
    );
  if (rec.kind === "remove") return <>Accepted · {label} removed.</>;
  return (
    <>
      Accepted · added as {placed ?? "the last problem"}{option ? <>, <M tex={option.tex} /></> : null}.
    </>
  );
}
