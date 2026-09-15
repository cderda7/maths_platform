"use client";

import { useEffect, useState } from "react";
import { StagePill } from "@/components/StagePill";
import { Button, Eyebrow } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { assignmentBundle, assignmentStages } from "@/lib/assignments";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { stagePillState, type ClassStageId } from "@/lib/classStage";
import { lessonDecision, type DecisionView } from "@/lib/decision";
import { STAGE_DESCRIPTION } from "@/lib/pathway";
import type { StudentSession } from "@/lib/session";
import { useBatchedSession, useNow } from "@/lib/store";

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
 * - Ticket 336's **Change** goes between Later and Keep (`data-decision-change-slot`).
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
  const set = assignmentBundle(ASSIGNMENT.id, classroom);
  const stages = set ? assignmentStages(set, classroom, session, now) : [];
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
      <div className="mt-6 flex items-center justify-end gap-3">
        <Button variant="secondary" onClick={() => dispatchClassroom({ type: "decision/tuck", due: view.due })} data-decision-later>
          Later
        </Button>
        {/* Ticket 336's Change goes here, between Later and Keep. */}
        <span className="contents" data-decision-change-slot />
        <Button onClick={() => dispatchClassroom({ type: "decision/answer", due: view.due, answer: { kind: "keep" }, at: Date.now() })} data-decision-keep>
          Keep
        </Button>
      </div>
    </section>
  );
}
