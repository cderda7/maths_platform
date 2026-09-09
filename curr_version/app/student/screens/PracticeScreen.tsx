"use client";

import PracticePad from "@/components/PracticePad";
import { Button } from "@/components/ui";
import { LeafChip } from "@/components/Tag";
import { warmupFocus, warmupStep, type SessionAction, type StudentSession } from "@/lib/session";
import { warmupSequence } from "@/lib/warmup";

/**
 * The warm-up: the focus skills one at a time, easiest first, each on the pad. The chip strip
 * above the problem is the sequence: the current skill dark blue, finished ones ticked.
 */
export default function PracticeScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const w = session.warmup;
  const sequence = warmupSequence(warmupFocus(session));
  const first = warmupStep(session);
  const lastStep = w.step >= sequence.length - 1;
  const skip = () => dispatch({ type: "practice/finish" });
  /** Finishes this skill: the next one, or the set after the last. */
  const done = () => dispatch({ type: "warmup/skill-done" });
  const doneLabel = lastStep ? "On to the set" : "Next skill →";

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
            const state = i < w.step ? "done" : i === w.step ? "current" : "todo";
            return (
              <LeafChip
                key={q.id}
                id={q.leaf}
                data-state={state}
                className={state === "current" ? "!border-standout !bg-standout !text-white" : "!border-standout-line !bg-standout-soft !text-standout"}
                after={state === "done" ? <span aria-label="done" className="font-semibold">✓</span> : undefined}
              />
            );
          })}
        </div>
      }
      footer={
        <>
          {!lastStep && (
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
