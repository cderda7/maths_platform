"use client";

import PracticePad from "@/components/PracticePad";
import { Button, Eyebrow } from "@/components/ui";
import { studentLeafName } from "@/data/taxonomy";
import { warmupLadder } from "@/lib/ladder";
import { warmupFocus, warmupPhase, warmupStep, type SessionAction, type StudentSession } from "@/lib/session";
import { warmupSequence } from "@/lib/warmup";
import { CompletionStep, StepLine, StepTitle, WorkedStep } from "./PracticeSteps";

/** The warm-up's three steps, as the step line names them. */
const STEP_NAMES = ["Example", "Your turn", "On your own"] as const;

/**
 * The warm-up: the focus skills one at a time, easiest first, each in three steps (ticket 313), the same screens as help on
 * a set question (`PracticeSteps.tsx`): the skill's practice problem as a worked example with the chat beside it; its
 * completion problem, the skill's lines blank for the student to write, each marked; then its follow-up alone on the pad,
 * with hint, chat and "see the example again". The strip under the title is the sequence as buttons, one per skill: dark
 * blue once the student is on it or has been on it (finished or not), light until then; a tap opens that skill on the step
 * it was left on. "Next skill" and "Skip to the set" are at every step.
 */
export default function PracticeScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const w = session.warmup;
  const sequence = warmupSequence(warmupFocus(session));
  const skill = warmupStep(session);
  const ladder = warmupLadder(skill);
  const phase = warmupPhase(session);
  const remaining = sequence.filter((q, i) => i !== w.step && !w.done.includes(q.id)).length;
  const skip = () => dispatch({ type: "practice/finish" });
  /** Leaves this skill: the next one never opened, or the set once every skill has been. */
  const done = () => dispatch({ type: "warmup/skill-done", at: Date.now() });
  const next = () => dispatch({ type: "warmup/next", at: Date.now() });
  const doneLabel = remaining === 0 ? "On to the set" : "Next skill →";

  const chips = (
    <div className="mt-3 flex flex-wrap gap-1.5" data-sequence>
      {sequence.map((q, i) => {
        const state = i === w.step ? "current" : w.done.includes(q.id) ? "done" : "todo";
        const dark = state !== "todo";
        return (
          <button
            type="button"
            key={q.id}
            onClick={() => dispatch({ type: "warmup/goto", step: i, at: Date.now() })}
            aria-current={state === "current" ? "step" : undefined}
            data-leaf={q.leaf}
            data-state={state}
            className={`rounded-full border px-2.5 py-0.5 text-[11.5px] transition-colors ${dark ? "border-standout bg-standout text-white" : "border-standout-line bg-standout-soft text-standout hover:bg-standout-line/60"} ${state === "current" ? "ring-2 ring-standout-line ring-offset-1 ring-offset-cream" : ""}`}
          >
            {studentLeafName(q.leaf).short}
          </button>
        );
      })}
    </div>
  );
  const footer = (
    <>
      {remaining > 0 && (
        <Button variant="ghost" onClick={skip} className="whitespace-nowrap">
          Skip to the set
        </Button>
      )}
      <Button variant="accent" onClick={done} data-done className="whitespace-nowrap">
        {doneLabel}
      </Button>
    </>
  );
  const lead = (at: 1 | 2 | 3) => (
    <>
      <Eyebrow>Warm-up</Eyebrow>
      <StepLine names={STEP_NAMES} at={at} />
    </>
  );
  const head = (at: 1 | 2, title: string) => (
    <>
      {lead(at)}
      <StepTitle title={title} />
      {chips}
    </>
  );
  const key = `${skill.id}:${phase}`;

  // Every practice problem in the bank has its completion problem and follow-up (a test holds it); a practice without them would be the pad alone.
  if (!ladder) return <PracticePad key={key} run={w} runKey="warmup" first={skill} dispatch={dispatch} title="Warm-up" header={chips} footer={footer} finished={null} />;
  if (phase === "worked")
    return (
      <div className="h-full" data-warmup-step="worked">
        <WorkedStep
          key={key}
          head={head(1, "Example")}
          question={ladder.worked}
          practice={ladder.worked}
          run={w}
          runKey="warmup"
          dispatch={dispatch}
          footer={footer}
          next={
            <Button size="lg" onClick={next} data-warmup-next>
              Your turn →
            </Button>
          }
        />
      </div>
    );
  if (phase === "completion")
    return (
      <div className="h-full" data-warmup-step="completion">
        <CompletionStep
          key={key}
          head={head(2, "Your turn")}
          question={ladder.completion}
          practice={ladder.completion}
          blanks={ladder.blanks}
          worked={ladder.worked}
          run={w}
          runKey="warmup"
          dispatch={dispatch}
          footer={footer}
          done={
            <>
              That&rsquo;s every line. Now one on your own.
              <span className="mt-3 flex justify-end">
                <Button size="lg" onClick={next} data-warmup-next>
                  On your own →
                </Button>
              </span>
            </>
          }
        />
      </div>
    );
  return (
    <div className="h-full" data-warmup-step="alone">
      <PracticePad key={key} run={w} runKey="warmup" first={ladder.alone} dispatch={dispatch} title="On your own" lead={lead(3)} header={chips} exampleAgain={ladder.worked} footer={footer} finished={null} />
    </div>
  );
}
