"use client";

import PracticePad from "@/components/PracticePad";
import { Button } from "@/components/ui";
import { studentLeafName } from "@/data/taxonomy";
import { warmupFocus, warmupStep, type SessionAction, type StudentSession } from "@/lib/session";
import { warmupSequence } from "@/lib/warmup";

/**
 * The warm-up: the focus skills one at a time, easiest first, each on the pad. The strip above
 * the problem is the sequence as buttons, one per skill: dark blue once the student is on it or
 * has worked through it, light until then; a tap opens that skill.
 */
export default function PracticeScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const w = session.warmup;
  const sequence = warmupSequence(warmupFocus(session));
  const first = warmupStep(session);
  const remaining = sequence.filter((q, i) => i !== w.step && !w.done.includes(q.id)).length;
  const skip = () => dispatch({ type: "practice/finish" });
  /** Finishes this skill: the next one not yet done, or the set once every skill is. */
  const done = () => dispatch({ type: "warmup/skill-done" });
  const doneLabel = remaining === 0 ? "On to the set" : "Next skill →";

  return (
    <PracticePad
      run={w}
      runKey="warmup"
      first={first}
      dispatch={dispatch}
      title="Warm-up"
      header={
        <div className="mt-3 flex flex-wrap justify-center gap-1.5" data-sequence>
          {sequence.map((q, i) => {
            const state = i === w.step ? "current" : w.done.includes(q.id) ? "done" : "todo";
            const dark = state !== "todo";
            return (
              <button
                type="button"
                key={q.id}
                onClick={() => dispatch({ type: "warmup/goto", step: i })}
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
      }
      footer={
        <>
          {remaining > 0 && (
            <Button variant="ghost" onClick={skip}>
              Skip to the set
            </Button>
          )}
          <Button variant="accent" onClick={done} data-done>
            {doneLabel}
          </Button>
        </>
      }
      finished={
        <Button size="lg" variant="accent" onClick={done}>
          {doneLabel}
        </Button>
      }
    />
  );
}
