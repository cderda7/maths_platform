"use client";

import { LeafChip } from "@/components/Tag";
import { Button, Eyebrow } from "@/components/ui";
import { useEscape } from "@/components/useEscape";
import type { LeafId } from "@/data/taxonomy";
import type { Problem } from "@/data/types";
import { asPractice, ladderFor } from "@/lib/ladder";
import type { SessionAction, StudentSession } from "@/lib/session";
import { CompletionStep, StepLine, StepTitle, WorkedStep } from "./PracticeSteps";

/**
 * Help on a set question in three steps (ticket 312), over the working screen: Q* worked (step 1), Q** with the named
 * skill's lines blank for the student to write (step 2), then back on Q (the working screen itself, step 3). Q*'s worked
 * example also opens again from back on Q. "Back to Qn" is at every step and leaves the student's own lines on Q as they
 * were; Escape is the same. The session holds the step, so a reload lands on it. The steps' screens are shared with the
 * warm-up (`PracticeSteps.tsx`, ticket 313).
 */
export default function HelpLadder({ session, problem, dispatch }: { session: StudentSession; problem: Problem; dispatch: (a: SessionAction) => void }) {
  const view = session.ladder;
  const leaf = session.overlay;
  const back = () => dispatch({ type: "overlay/done", at: Date.now() });
  // Escape is "Back to Qn" (ticket 247); a help card open over the step closes first.
  useEscape(!!view && !!leaf, back);
  const ladder = view && leaf ? ladderFor(view.problem, leaf) : null;
  if (!view || !leaf || !ladder) return null;
  const backButton = (
    <Button size="lg" variant="accent" onClick={back} data-done className="whitespace-nowrap">
      Back to {problem.label} →
    </Button>
  );
  const run = session.overlayRun;
  const worked = asPractice(ladder.worked, leaf);
  return (
    <div className="absolute inset-0 z-20 bg-cream" data-overlay data-ladder={view.step}>
      {view.step === "completion" ? (
        <CompletionStep
          head={<Head problem={problem} at={2} title="Your turn" leaf={leaf} />}
          question={ladder.completion}
          practice={asPractice(ladder.completion, leaf)}
          blanks={ladder.blanks}
          worked={worked}
          run={run}
          runKey="overlay"
          dispatch={dispatch}
          footer={backButton}
          done={<>That&rsquo;s every line. On to {problem.label} when you&rsquo;re ready.</>}
        />
      ) : (
        <WorkedStep
          head={<Head problem={problem} at={1} title="Example" />}
          question={ladder.worked}
          practice={worked}
          run={run}
          runKey="overlay"
          again={view.step === "again"}
          dispatch={dispatch}
          footer={backButton}
          next={
            <Button size="lg" onClick={() => dispatch({ type: "ladder/next", at: Date.now() })} data-ladder-next>
              Your turn →
            </Button>
          }
        />
      )}
    </div>
  );
}

/** The left column's head on either step: which question the help is for, the steps, the title and the skill (on Q**; beside Q* the worked example's card names it). */
function Head({ problem, at, title, leaf }: { problem: Problem; at: 1 | 2; title: string; leaf?: LeafId }) {
  return (
    <>
      <Eyebrow>Help with {problem.label}</Eyebrow>
      <StepLine names={["Example", "Your turn", problem.label]} at={at} />
      <StepTitle title={title} />
      {leaf && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          <LeafChip student id={leaf} />
        </div>
      )}
    </>
  );
}
