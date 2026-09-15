"use client";

import { useEffect, useState } from "react";
import { PathwayStop } from "@/components/PathwayStop";
import { StagePill } from "@/components/StagePill";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import type { Pathway, ReviewStage } from "@/data/types";
import { assignmentBundle, assignmentStages } from "@/lib/assignments";
import { pathwayOf } from "@/lib/classroom";
import { dispatchClassroom, getClassroom, useClassroom } from "@/lib/classroom-store";
import { CLASS_STAGE_WORD, stagePillState, type ClassStageId } from "@/lib/classStage";
import { lessonDecision, type DecisionView } from "@/lib/decision";
import { REVIEW_ORDER, STAGE_DESCRIPTION, STAGE_WORD } from "@/lib/pathway";
import { changedPathway, liveLocks, samePathway, switchStage, type PathwayLocks } from "@/lib/pathwayChange";
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
 * The dot a tucked decision leaves (ticket 335): the accent on a ring of paper, laid over the corner of the strip's current
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
  // Change's choice while it is open (ticket 336): the pathway as the toggles have it; null while the card shows the plan.
  const [choice, setChoice] = useState<Pathway | null>(null);
  const set = assignmentBundle(ASSIGNMENT.id, classroom);
  const stages = set ? assignmentStages(set, classroom, session, now) : [];
  const current = pathwayOf(classroom);
  const locks: PathwayLocks = set ? liveLocks(classroom, set, session, now) : { individual: true, group: true, "whole-class": true };
  // What the toggles show: a locked stage as the pathway has it now, every other as chosen.
  const shown = choice ? changedPathway(current, choice, locks) : current;
  const done = () => {
    // Resolved against the class as it is at the press, not the last 3-second batch: a review someone entered since stays as it was.
    const c = getClassroom();
    const at = Date.now();
    const b = assignmentBundle(ASSIGNMENT.id, c);
    const planned = pathwayOf(c);
    const pathway = b ? changedPathway(planned, choice ?? planned, liveLocks(c, b, getSnapshot(), at)) : planned;
    dispatchClassroom({ type: "decision/answer", due: view.due, answer: samePathway(pathway, planned) ? { kind: "keep" } : { kind: "change", pathway }, at });
  };
  const { submitted, present, question } = view.evidence;
  return (
    <section
      role="region"
      aria-label="Most students are close to finishing"
      className={`pointer-events-auto w-[400px] rounded-2xl border border-line bg-paper p-6 shadow-lift ${slide ? "decision-in" : ""}`}
      data-decision-card={view.kind}
      data-decision-slide={slide || undefined}
    >
      <h2 className="font-display text-[22px] leading-[1.25] text-ink" data-decision-headline>
        Most students are close to finishing.
        <br />
        Let&rsquo;s discuss what&rsquo;s next.
      </h2>
      <p className="mt-2 text-[14px] leading-snug text-ink-soft" data-decision-evidence>
        <span className="font-semibold text-ink tabular-nums">
          {submitted} of {present}
        </span>{" "}
        here have submitted {question}
      </p>
      <Eyebrow className="mt-5">Your pathway</Eyebrow>
      {choice ? (
        <ChangePathway pathway={shown} locks={locks} onSwitch={(stage) => setChoice(switchStage(shown, stage, locks))} />
      ) : (
        <ol className="mt-3 grid grid-cols-[max-content_minmax(0,1fr)] items-center gap-x-4 gap-y-2" aria-label="Your pathway" data-decision-pathway>
          {stages.map((s) => (
            <li key={s.id} className="col-span-2 grid grid-cols-subgrid items-center" data-decision-stage={s.id}>
              <span>
                <StagePill stage={s.id} state={stagePillState(s)} size="laptop" />
              </span>
              <span className="text-[13.5px] leading-snug text-balance text-ink-soft">{WHAT_HAPPENS[s.id]}</span>
            </li>
          ))}
        </ol>
      )}
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => dispatchClassroom({ type: "decision/tuck", due: view.due })} data-decision-later>
          Later
        </Button>
        {choice ? (
          <Button onClick={done} data-decision-done>
            Done
          </Button>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setChoice([...current])} data-decision-change>
              Change
            </Button>
            <Button onClick={() => dispatchClassroom({ type: "decision/answer", due: view.due, answer: { kind: "keep" }, at: Date.now() })} data-decision-keep>
              Keep
            </Button>
          </>
        )}
      </div>
    </section>
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
