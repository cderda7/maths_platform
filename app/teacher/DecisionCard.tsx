"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { PathwayStop } from "@/components/PathwayStop";
import ProblemQuestion from "@/components/ProblemQuestion";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import type { Pathway, ReviewStage } from "@/data/types";
import { assignmentBundle, assignmentStages } from "@/lib/assignments";
import { pathwayOf } from "@/lib/classroom";
import { dispatchClassroom, getClassroom, useClassroom } from "@/lib/classroom-store";
import { CLASS_STAGE_WORD, type ClassStageId } from "@/lib/classStage";
import { lessonDecision, type DecisionView } from "@/lib/decision";
import { answerMoved, answerPathway } from "@/lib/decisionState";
import { everyGroupEmpty, listWords, moveAnswer, moveConfirmSentence, SUGGESTED, type QuestionTally, type SplitEvidence } from "@/lib/splitReview";
import { nextStageOnCard, REVIEW_ORDER, STAGE_DESCRIPTION, STAGE_WORD } from "@/lib/pathway";
import { changedPathway, liveLocks, switchStage, type PathwayLocks } from "@/lib/pathwayChange";
import type { StudentSession } from "@/lib/session";
import { getSnapshot, useBatchedSession, useNow } from "@/lib/store";

/**
 * The lesson's decision on the teacher's screens (ticket 335): one card, mounted once in `TeacherChrome`, so it follows the
 * teacher across Edexia Classroom and the live set's Class View and Mistakes. See DECISION_LOG.md, 2026-09-15 (the decision card).
 *
 * "Most students are close to finishing. Let's discuss what's next." comes up when more than half of the room has submitted
 * the question 70% of the way through the set (`lessonDecision`, `lib/decision.ts`), with the evidence ("10 of 19 here have
 * submitted Q7"), the planned pathway as the strip's pills with what each stage does, and Keep and Later. It slides in once
 * from the bottom-right corner of the scroll region, the corner clear of the pathway strip (top right, on the back button's
 * line) and of the split's diagnostic flyout and work panel (the left column), with no backdrop, so every press elsewhere
 * lands where it would. It covers what is under it and nothing moves: it is laid over the page, never in its flow. At 400
 * layout px, 16 in from the region's edges (its right edge on Reset demo's below it), it stays clear of Class View's roster at
 * 1280 px and wider (the roster ends 437 layout px from the window's right edge there), so it never lies over a roster row.
 *
 * - **Keep** answers it: the card and the dot go, and it never comes back.
 * - **Later** tucks it into a dot on the strip's current pill (`BackLine`) and on the live set's Classroom card
 *   (`Classroom`); pressing the dot opens it again (from the Classroom, on the set's Mistakes tab).
 * - **Ignored**: when the class leaves individual working with it unanswered (force submit, everyone handing in) the plan
 *   runs as it was and nothing asks again.
 * - **Change** (ticket 336), between Later and Keep, turns the card's pathway into the pathway line's toggles in place: the
 *   working and every review a student in the room has entered in ink (locked, `liveLocks` in `lib/pathwayChange.ts`), every
 *   other review a toggle in Create's look (on in accent with a ✓, off dashed with its description faded), each stage's
 *   description beside it; Later and Done. **Done** resolves the choice against the locks at that moment (a review a student
 *   entered while the teacher was choosing stays as it was) and answers the decision: `change` with the pathway, which the
 *   classroom writes to the assignment in the same step, or `keep` when it is the pathway as planned. Both strips follow at
 *   once, and every student reads it at their next transition. See DECISION_LOG.md, 2026-09-16 (changing the pathway live).
 */

/** Which decisions this tab has slid in, by lesson and kind: a card seen once appears in place when the teacher moves between screens or opens it from the dot. */
const slid = new Set<string>();

/** The live set's decision as the teacher screens read it; null until Sam's session and the clock have arrived (before that the class would read as fresh). */
export function useLessonDecision(session: StudentSession | null, ready: boolean): DecisionView | null {
  const classroom = useClassroom();
  const now = useNow();
  if (!ready || now === 0) return null;
  const set = assignmentBundle(ASSIGNMENT.id, classroom);
  if (!set || set.kind !== "live") return null;
  return lessonDecision(classroom, set, session, now);
}

/** What a stage does, under its pill on the card: Create's line (`STAGE_DESCRIPTION`), and the working's own. */
const WHAT_HAPPENS: Record<ClassStageId, string> = { working: "students finish the set and hand it in", ...STAGE_DESCRIPTION };

/**
 * The dot a tucked decision leaves (ticket 335): the accent on a ring of paper, laid over the bottom corner of the strip's current
 * pill or the live Classroom card without taking room. Its press area reaches 8 px past the dot. `size` is its diameter in
 * layout px.
 */
export function DecisionDot({ view, onPress, size = 12, className = "" }: { view: DecisionView; onPress: () => void; size?: number; className?: string }) {
  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={`Most students are close to finishing: ${view.evidence.submitted} of ${view.evidence.present} here have submitted ${view.evidence.question}. Open the decision`}
      title="Most students are close to finishing"
      className={`relative block rounded-full bg-accent ring-2 ring-paper transition-colors before:absolute before:-inset-2 before:rounded-full before:content-[''] hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${className}`}
      style={{ width: size, height: size }}
      data-decision-dot={view.kind}
    />
  );
}

/** The card's host in the teacher chrome: raises the decision when it comes due and shows the card while it is open. */
export default function DecisionHost() {
  const { session, updatedAt } = useBatchedSession(3000);
  const view = useLessonDecision(session, updatedAt !== null);
  const raise = view && !view.stored && !view.lapsed ? view.due : null;
  // Stored by the first render that sees it due; from then on `raise` is null. The reducer keeps a decision already stored, so two tabs raising at once agree.
  useEffect(() => {
    if (raise) dispatchClassroom({ type: "decision/raise", due: raise });
  }, [raise]);
  if (!view || view.shown !== "card") return null;
  return (
    <div className="pointer-events-none absolute right-4 bottom-4 z-40 flex justify-end" data-decision-layer>
      <DecisionCard view={view} session={session} />
    </div>
  );
}

function DecisionCard({ view, session }: { view: DecisionView; session: StudentSession | null }) {
  const classroom = useClassroom();
  const now = useNow();
  const key = `${classroom.assignment?.startedAt ?? classroom.assignment?.createdAt ?? 0}:${view.kind}`;
  // Lazy: whether this mount slides in, read once; the set is marked after the first paint.
  const [slide] = useState(() => !slid.has(key));
  useEffect(() => {
    slid.add(key);
  }, [key]);
  // Change's choice (ticket 336): the pathway as the toggles have it, null while the card shows the plan; `changing` is
  // whether the line is open. On a card with a split to make (ticket 337) Done closes the line and keeps the choice, so
  // one press answers the pathway and the move together.
  const [choice, setChoice] = useState<Pathway | null>(null);
  const [changing, setChanging] = useState(false);
  // The split's ticks (ticket 337): the suggestion until the teacher ticks otherwise; and whether every question is listed.
  const [ticks, setTicks] = useState<string[] | null>(null);
  const [allShown, setAllShown] = useState(false);
  // The move's confirm step (ticket 351): "Move to class review" opens it in place, live over the same ticks; Back returns
  // without losing them. Empty once every tick is removed, so unticking mid-confirm falls back to the ask.
  const [confirming, setConfirming] = useState(false);
  const set = assignmentBundle(ASSIGNMENT.id, classroom);
  const planned = set ? assignmentStages(set, classroom, session, now) : [];
  const current = pathwayOf(classroom);
  const locks: PathwayLocks = set ? liveLocks(classroom, set, session, now) : { individual: true, group: true, "whole-class": true };
  // What the toggles show: a locked stage as the pathway has it now, every other as chosen.
  const shown = choice ? changedPathway(current, choice, locks) : current;
  /** The pathway the card shows: the plan, or the choice waiting for the press that writes it (a stage switched on is ahead). */
  const stages = (["working", ...shown] as ClassStageId[]).map((id) => planned.find((st) => st.id === id) ?? { id, word: CLASS_STAGE_WORD[id], state: "ahead" as const, done: null, total: 0 });
  // The split's rows while group review is still on the pathway the card would leave: with it off there is nothing to move.
  const split = view.split && shown.includes("group") ? view.split : null;
  const ticked = (ticks ?? split?.suggestion.suggested.map((t) => t.problem) ?? []).filter((id) => !!split?.tallies.some((t) => t.problem === id));
  const answer = (pathway: Pathway | null, moved: readonly string[]) => {
    // Resolved against the class as it is at the press, not the last 3-second batch: a review someone entered since stays as it was.
    const c = getClassroom();
    const at = Date.now();
    const b = assignmentBundle(ASSIGNMENT.id, c);
    const planned = pathwayOf(c);
    const live = b ? liveLocks(c, b, getSnapshot(), at) : { individual: true, group: true, "whole-class": true };
    // Every group would sit out: the press skips group review too, where no student has entered it yet (ticket 337).
    const requested = pathway ?? planned;
    const skip = moved.length > 0 && everyGroupEmpty(c, getSnapshot(), moved) ? requested.filter((st) => st !== "group") : requested;
    // In set order, however they were ticked: the card, the setup page and the grid read them in the order the class sees them.
    const inOrder = (view.split?.tallies ?? []).map((t) => t.problem).filter((id) => moved.includes(id));
    dispatchClassroom({ type: "decision/answer", due: view.due, answer: moveAnswer(planned, skip, inOrder.length === moved.length ? inOrder : moved, live), at });
  };
  const { submitted, present, question } = view.evidence;
  const answered = view.status === "answered";
  const moved = answered && view.answer ? answerMoved(view.answer) : [];
  const answeredPathway = answered && view.answer ? answerPathway(view.answer) : null;
  // Nothing left for any group: either group review was switched off with the move, or every group sits out (ticket 332).
  const skipped = (!!answeredPathway && !answeredPathway.includes("group")) || (moved.length > 0 && everyGroupEmpty(classroom, session, moved));
  const emptyAfter = !!split && ticked.length > 0 && everyGroupEmpty(classroom, session, ticked);
  const addsClassReview = !!split && ticked.length > 0 && !shown.includes("whole-class");
  // The confirm step only holds while there is still something ticked to move; unticking everything mid-confirm falls back to the ask.
  const showConfirm = confirming && ticked.length > 0;
  const next = nextStageOnCard(shown);
  return (
    <section
      role="region"
      aria-label={answered ? "Saved for class review" : "Most students are close to finishing"}
      className={`pointer-events-auto w-[480px] rounded-2xl border border-line bg-paper p-6 shadow-lift ${slide ? "decision-in" : ""}`}
      data-decision-card={view.kind}
      data-decision-slide={slide || undefined}
      data-decision-answered={answered || undefined}
    >
      {answered ? (
        <>
          <h2 className="font-display text-[22px] leading-[1.25] text-ink" data-decision-headline>
            Saved for class review.
          </h2>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft" data-decision-moved>
            <span className="font-semibold text-ink">{listWords(moved.map((id) => PROBLEM_MAP[id]?.label ?? id))}</span> {moved.length === 1 ? "leaves" : "leave"} group review.{" "}
            {skipped ? "No group has anything left, so the class goes straight to class review." : "Every group works the rest."}
          </p>
          {!!answeredPathway && answeredPathway.includes("whole-class") && !skipped && (
            <p className="mt-2 text-[13.5px] leading-snug text-ink-muted" data-decision-added>
              Class review added after group review.
            </p>
          )}
        </>
      ) : (
        <>
          <h2 className="font-display text-[22px] leading-[1.25] text-ink" data-decision-headline>
            Most students are close to finishing.
            <br />
            Let&rsquo;s discuss what&rsquo;s next.
          </h2>
          <p className="mt-2 text-[14px] leading-snug text-ink-soft" data-decision-evidence>
            <span className="font-semibold text-ink tabular-nums">
              {view.kind === "split-review" ? `${view.split?.handedIn ?? 0} of ${view.split?.present ?? 0}` : `${submitted} of ${present}`}
            </span>{" "}
            {view.kind === "split-review" ? "here have handed in their corrections" : `here have submitted ${question}`}
          </p>
        </>
      )}
      {/* The pathway: the split card carries the close-to-finishing card's own line when that card went unanswered (ticket 337). */}
      {!answered && (view.kind === "close-to-finishing" || view.carriesPathway) && (
        <>
          {changing ? (
            <>
              <Eyebrow className="mt-5">Your pathway</Eyebrow>
              <ChangePathway pathway={shown} locks={locks} onSwitch={(stage) => setChoice(switchStage(shown, stage, locks))} />
            </>
          ) : view.kind === "split-review" ? (
            <p className="mt-4 text-[13px] leading-snug text-ink-soft" data-decision-pathway-line>
              <span className="font-semibold text-ink">Your pathway</span>{" "}
              {stages.map((st, i) => (
                <span key={st.id}>
                  {i > 0 && (
                    <span aria-hidden> → </span>
                  )}
                  <span className="whitespace-nowrap">{CLASS_STAGE_WORD[st.id]}</span>
                </span>
              ))}{" "}
              <span aria-hidden>·</span>{" "}
              <button
                type="button"
                className="text-accent-deep hover:underline"
                onClick={() => {
                  setChoice([...shown]);
                  setChanging(true);
                }}
                data-decision-change
              >
                change
              </button>
            </p>
          ) : (
            next.stage && (
              // Only the next stage (ticket 351): the current stage is already decided, and the full sequence is the strip's
              // job (top right), not this card's. A stage the pathway skips over is said plainly rather than left silent.
              <p className="mt-5 text-[14px] leading-snug text-ink-soft" data-decision-next>
                {next.skipBoth ? (
                  <>
                    Skip indiv review and group review. Move straight to <span className="font-semibold text-ink">class review</span> — {STAGE_DESCRIPTION["whole-class"]}.
                  </>
                ) : next.skipIndividual ? (
                  <>
                    Skip indiv review. Move straight to <span className="font-semibold text-ink">group review</span> — {STAGE_DESCRIPTION.group}.
                  </>
                ) : (
                  <>
                    <span className="font-semibold text-ink">Next:</span> {CLASS_STAGE_WORD[next.stage]} — {WHAT_HAPPENS[next.stage]}.
                  </>
                )}
              </p>
            )
          )}
        </>
      )}
      {/* The split itself (ticket 337): the questions fewest have right, pre-ticked, with every other one behind its own line.
          "Move to class review" opens the confirm step in place (ticket 351): the same live rows, a forward-looking heading
          naming every consequence, never a past-tense one -- nothing is decided until Confirm move is actually pressed. */}
      {!answered && !changing && split && !view.toClassReview && (
        <SplitRows
          split={split}
          ticked={ticked}
          allShown={allShown}
          onToggle={(id) => setTicks(ticked.includes(id) ? ticked.filter((x) => x !== id) : [...ticked, id])}
          onAll={() => setAllShown(true)}
          confirming={showConfirm}
          emptyAfter={emptyAfter}
          addsClassReview={addsClassReview}
        />
      )}
      {!answered && !changing && view.toClassReview && view.split && view.split.suggestion.suggested.length > 0 && (
        <p className="mt-4 text-[13.5px] leading-snug text-ink-soft" data-decision-to-class-review>
          {listWords(view.split.suggestion.suggested.map((t) => t.label))} got the fewest right{view.split.afterCorrections ? "" : " so far"} — worth covering in class review.
        </p>
      )}
      {!answered && !changing && !showConfirm && split && ticked.length > 0 && (
        <p className="mt-3 text-[13px] leading-snug text-ink-muted" data-decision-note>
          {emptyAfter ? "No group would have anything left to review." : addsClassReview ? "Adds class review after group review." : "Every group works the rest."}
        </p>
      )}
      <div className="mt-6 flex items-center justify-end gap-3" data-decision-actions>
        {answered ? (
          <>
            <Button variant="secondary" onClick={() => dispatchClassroom({ type: "decision/dismiss", due: view.due })} data-decision-close>
              Close
            </Button>
            <Link
              href="/teacher/whole-class"
              className="inline-flex items-center rounded-full bg-ink px-4 py-2 text-[13.5px] font-medium whitespace-nowrap text-white transition-colors hover:bg-ink-soft"
              onClick={() => dispatchClassroom({ type: "decision/dismiss", due: view.due })}
              data-decision-setup
            >
              Set up class review →
            </Link>
          </>
        ) : (
          <>
            {!showConfirm && (
              <Button variant="secondary" onClick={() => dispatchClassroom({ type: "decision/tuck", due: view.due })} data-decision-later>
                Later
              </Button>
            )}
            {changing ? (
              // Done (ticket 336): a card with a split to make keeps the choice and shows it, so the one press that
              // answers the decision carries the pathway and the move together (a decision is answered once).
              split || view.kind === "split-review" ? (
                <Button variant="secondary" onClick={() => setChanging(false)} data-decision-done>
                  Done
                </Button>
              ) : (
                <Button onClick={() => answer(shown, [])} data-decision-done>
                  Done
                </Button>
              )
            ) : showConfirm ? (
              // The confirm step (ticket 351): narrowed to just Back and the final press, same as Change's own Done -- a
              // decision this consequential gets one focused choice, not Later/Change sitting alongside it.
              <>
                <Button variant="secondary" onClick={() => setConfirming(false)} data-decision-back>
                  Back
                </Button>
                <Button onClick={() => answer(shown, ticked)} data-decision-confirm-move>
                  {emptyAfter ? "Confirm skip" : "Confirm move"}
                </Button>
              </>
            ) : (
              <>
                {view.kind === "close-to-finishing" && (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setChoice([...shown]);
                      setChanging(true);
                    }}
                    data-decision-change
                  >
                    Change
                  </Button>
                )}
                <Button
                  onClick={() => (ticked.length === 0 ? answer(shown, ticked) : setConfirming(true))}
                  data-decision-keep={ticked.length === 0 || undefined}
                  data-decision-move={ticked.length > 0 || undefined}
                >
                  {ticked.length === 0 ? "Keep" : emptyAfter ? "Skip to class review" : "Move to class review"}
                </Button>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
}

/**
 * The split's question rows (ticket 337): the two the fewest have right, pre-ticked and named in the question, then every
 * other question fewer than half have right under "also often wrong", then the rest behind "all questions". Every row shows
 * the whole question (`ProblemQuestion`, the whole-question rule) and how many of the room have it right. The list scrolls
 * inside the card, so opening "all questions" never pushes the buttons off the corner.
 */
function SplitRows({
  split,
  ticked,
  allShown,
  onToggle,
  onAll,
  confirming = false,
  emptyAfter = false,
  addsClassReview = false,
}: {
  split: SplitEvidence;
  ticked: readonly string[];
  allShown: boolean;
  onToggle: (id: string) => void;
  onAll: () => void;
  confirming?: boolean;
  emptyAfter?: boolean;
  addsClassReview?: boolean;
}) {
  const { suggested, often, rest } = split.suggestion;
  // The ask names the two fewest the class has right and counts the rest, so a card with everything ticked stays a sentence.
  const all = ticked.map((id) => split.tallies.find((t) => t.problem === id)!).sort((a, b) => a.correct - b.correct);
  const asked = all.slice(0, SUGGESTED);
  const more = all.length - asked.length;
  return (
    <>
      <p className="mt-4 text-[14px] leading-snug text-ink" data-split-ask>
        {confirming ? (
          // The confirm heading (ticket 351): every consequence stated plainly, and always forward-looking -- "added" would
          // read as already decided, which is exactly what this step exists to not do. The rows below stay live underneath it.
          moveConfirmSentence(all.map((t) => t.label), emptyAfter, addsClassReview)
        ) : asked.length === 0 ? (
          "Every question stays in group review."
        ) : (
          <>
            Only{" "}
            {asked.map((t, i) => (
              <span key={t.problem}>
                {i > 0 && (i === asked.length - 1 ? " and " : ", ")}
                <span className="font-semibold tabular-nums">
                  {t.correct}/{t.present}
                </span>{" "}
                {i === 0 ? "students got " : "got "}
                {t.label}
                {i === 0 ? " correct" : ""}
              </span>
            ))}
            {more > 0 ? `, with ${more} more ticked` : ""}
            {split.afterCorrections ? ". " : " so far. "}
            Remove from group review &amp; save for class review?
          </>
        )}
      </p>
      <div className="mt-3 max-h-[300px] overflow-y-auto" data-split-list>
        <ul className="space-y-1.5">
          {suggested.map((t) => (
            <SplitRow key={t.problem} tally={t} on={ticked.includes(t.problem)} onToggle={onToggle} />
          ))}
        </ul>
        {often.length > 0 && (
          <>
            <Eyebrow className="mt-4">Also often wrong</Eyebrow>
            <ul className="mt-2 space-y-1.5">
              {often.map((t) => (
                <SplitRow key={t.problem} tally={t} on={ticked.includes(t.problem)} onToggle={onToggle} />
              ))}
            </ul>
          </>
        )}
        {rest.length > 0 &&
          (allShown ? (
            <>
              <Eyebrow className="mt-4">All questions</Eyebrow>
              <ul className="mt-2 space-y-1.5">
                {rest.map((t) => (
                  <SplitRow key={t.problem} tally={t} on={ticked.includes(t.problem)} onToggle={onToggle} />
                ))}
              </ul>
            </>
          ) : (
            <button type="button" className="mt-3 text-[13px] text-accent-deep hover:underline" onClick={onAll} data-split-all>
              all questions
            </button>
          ))}
      </div>
    </>
  );
}

/** One question the teacher may move: a tick, its label, the whole question, and how many of the room have it right. */
function SplitRow({ tally, on, onToggle }: { tally: QuestionTally; on: boolean; onToggle: (id: string) => void }) {
  const problem = PROBLEM_MAP[tally.problem];
  return (
    <li>
      <button
        type="button"
        role="checkbox"
        aria-checked={on}
        onClick={() => onToggle(tally.problem)}
        data-split-row={tally.problem}
        data-on={on || undefined}
        className={`flex w-full items-start gap-2.5 rounded-xl border px-2.5 py-2 text-left transition-colors ${on ? "border-line bg-standout-soft" : "border-dashed border-line-strong bg-transparent hover:border-ink-muted"}`}
      >
        <span className={`mt-px grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full text-[10.5px] ${on ? "bg-ink text-white" : "border border-line-strong text-ink-muted"}`} aria-hidden>
          {on ? "✓" : "+"}
        </span>
        <span className="w-[22px] shrink-0 text-[12.5px] font-medium text-ink">{tally.label}</span>
        <span className="min-w-0 flex-1 text-[12.5px] leading-snug text-ink" data-split-question={tally.problem}>
          {problem ? <ProblemQuestion problem={problem} mathClass="text-[13px]" figureWidth={40} /> : tally.label}
        </span>
        <span className="shrink-0 text-[12px] whitespace-nowrap text-ink-muted tabular-nums" data-split-count={tally.problem}>
          {tally.correct}/{tally.present} correct
        </span>
      </button>
    </li>
  );
}

/** A stop's fixed size on the card: the widest word with its ✓ ("✓ indiv review") and the strip's pill height. */
const STOP_W = 136;
const STOP_H = 32;

/**
 * Change's pathway line (ticket 336): the working and the three reviews top to bottom, joined by the line's ink track with
 * an arrowhead into each stop, each stage's description beside it. Every review is always in its place, on or off, so a
 * switch changes only colours and borders.
 */
function ChangePathway({ pathway, locks, onSwitch }: { pathway: Pathway; locks: PathwayLocks; onSwitch: (stage: ReviewStage) => void }) {
  const ids: ClassStageId[] = ["working", ...REVIEW_ORDER];
  return (
    <>
      <p className="mt-2 text-[13px] leading-snug text-ink-muted">Switch any review students haven&rsquo;t started.</p>
      <ol className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] gap-x-4 gap-y-3" aria-label="Change your pathway" data-decision-change-line>
        {ids.map((id, i) => {
          const stage = id === "working" ? null : id;
          const on = !stage || pathway.includes(stage);
          const locked = !stage || locks[stage];
          const last = i === ids.length - 1;
          return (
            <li key={id} className="relative col-span-2 grid grid-cols-subgrid items-start" data-decision-change-stage={id} data-on={on || undefined} data-locked={locked || undefined}>
              {/* The track from this stop's middle to the next one's, behind the stops, and the arrowhead into this stop. */}
              {!last && <span className="absolute w-0.5 bg-ink" style={{ left: STOP_W / 2 - 1, top: STOP_H / 2, height: "calc(100% + 12px)" }} aria-hidden data-track />}
              {i > 0 && (
                <svg width={10} height={7} viewBox="0 0 10 7" className="absolute text-ink" style={{ left: STOP_W / 2 - 5, top: -9 }} aria-hidden data-arrowhead>
                  <path d="M1 1 L5 6 L9 1" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <span className="relative">
                {locked ? (
                  <PathwayStop ink size="card" width={STOP_W} height={STOP_H} title={stage ? `Students have started ${STAGE_WORD[stage]}` : undefined} data-stop={id}>
                    {CLASS_STAGE_WORD[id]}
                  </PathwayStop>
                ) : (
                  <PathwayStop on={on} off={!on} size="card" width={STOP_W} height={STOP_H} onClick={() => onSwitch(stage!)} aria-pressed={on} data-stop={id}>
                    {CLASS_STAGE_WORD[id]}
                  </PathwayStop>
                )}
              </span>
              <span className={`pt-[6px] text-[13.5px] leading-snug text-balance text-ink-soft transition-opacity ${on ? "" : "opacity-45"}`} data-stage-description={id}>
                {WHAT_HAPPENS[id]}
              </span>
            </li>
          );
        })}
      </ol>
    </>
  );
}
