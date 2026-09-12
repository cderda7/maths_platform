"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Button, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, LeafChip } from "@/components/Tag";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { dispatchClassroom, useAssignment } from "@/lib/classroom-store";
import { FOLLOW_MODE_WORD, type FollowMode } from "@/lib/classroom";
import { candidatesFor, MAX_EXAMPLES, problemsByStruggle, suggestExamples, type Bucket, type ExampleRef } from "@/lib/examples";
import { useBatchedSession } from "@/lib/store";

const PRECHECK = 3;

/**
 * The private setup for whole-class review: which problems, and which 2–3 examples per problem.
 * Names and correctness show here and nowhere near the projector.
 */
export default function WholeClassSetup() {
  const router = useRouter();
  const { session } = useBatchedSession(3000);
  const { problems } = useAssignment();
  const ranked = problemsByStruggle(session).filter((r) => problems.some((p) => p.id === r.problem.id));
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ExampleRef[]>>({});
  const [mode, setMode] = useState<FollowMode>("frozen");
  const chosenIds = chosen ?? ranked.slice(0, PRECHECK).map((r) => r.problem.id);
  const toggle = (id: string) => setChosen(chosenIds.includes(id) ? chosenIds.filter((x) => x !== id) : [...chosenIds, id]);
  const examplesFor = (pid: string) => overrides[pid] ?? suggestExamples(candidatesFor(pid, session));
  const ordered = ASSIGNMENT.problems.map((p) => p.id).filter((id) => chosenIds.includes(id));

  const swap = (pid: string, at: number, studentId: string) => {
    const next = [...examplesFor(pid)];
    next[at] = { studentId, problemId: pid };
    setOverrides((o) => ({ ...o, [pid]: next }));
  };

  const project = () => {
    const examples = Object.fromEntries(ordered.map((id) => [id, examplesFor(id)]));
    dispatchClassroom({ type: "wc/setup", problems: ordered, examples, mode });
    dispatchClassroom({ type: "wc/project" });
    router.push("/teacher/board");
  };

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <H1 className="mt-3">Class review</H1>

      <div className="mt-8 grid grid-cols-[380px_1fr] gap-6">
        <Card className="self-start p-5">
          <Eyebrow>Problems</Eyebrow>
          <ul className="mt-3 space-y-1.5">
            {ranked.map(({ problem: p, struggled, handedIn }) => {
              const on = chosenIds.includes(p.id);
              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onClick={() => toggle(p.id)}
                    aria-pressed={on}
                    data-wc-problem={p.id}
                    className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-line bg-paper" : "border-dashed border-line-strong bg-transparent opacity-60"}`}
                  >
                    <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${on ? "bg-ink text-white" : "border border-line-strong text-ink-muted"}`}>{on ? "✓" : "+"}</span>
                    <span className="w-7 text-[13px] font-medium text-ink">{p.label}</span>
                    <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[13.5px] text-ink">
                      <M tex={p.tex} />
                    </span>
                    <span className="shrink-0 text-[12.5px] text-ink-muted" data-struggled>
                      {struggled}/{handedIn} struggled
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <Eyebrow className="mt-6">Student screens</Eyebrow>
          <div className="mt-2 space-y-1.5" data-mode-choice>
            {(
              [
                { m: "frozen", detail: "their pad mirrors what you write on the board" },
                { m: "write-with-me", detail: "their pad is live; they copy your working" },
              ] as { m: FollowMode; detail: string }[]
            ).map(({ m, detail }) => {
              const on = mode === m;
              return (
                <button key={m} type="button" onClick={() => setMode(m)} aria-pressed={on} data-mode={m} className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-ink bg-paper" : "border-line bg-paper hover:border-ink-muted"}`}>
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? "border-ink" : "border-line-strong"}`} aria-hidden>
                    {on && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <span className="text-[13.5px] font-medium text-ink">{FOLLOW_MODE_WORD[m]}</span>
                  <span className="min-w-0 flex-1 text-[12px] text-ink-muted">{detail}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-ink-muted">You can change this per problem from the board.</p>
          <div className="mt-5 flex justify-end">
            <Button size="lg" disabled={ordered.length === 0} onClick={project} data-project>
              Project
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          {ordered.map((pid) => {
            const p = PROBLEM_MAP[pid];
            const cands = candidatesFor(pid, session);
            const refs = examplesFor(pid);
            return (
              <Card key={pid} className="overflow-hidden" data-wc-examples={pid}>
                <div className="flex items-center gap-4 border-b border-line px-6 py-3">
                  <span className="font-display text-[22px] text-ink">{p.label}</span>
                  <DifficultyTag d={p.difficulty} />
                  <span className="math-lg text-ink">
                    <M tex={p.tex} />
                  </span>
                  <span className="ml-auto text-[12.5px] text-ink-muted">
                    {refs.length} of {MAX_EXAMPLES} examples
                  </span>
                </div>
                <div className={`grid gap-0 divide-x divide-line ${refs.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                  {refs.map((r, i) => {
                    const c = cands.find((x) => x.studentId === r.studentId);
                    if (!c) return null;
                    const others = cands.filter((x) => !refs.some((rr) => rr.studentId === x.studentId) || x.studentId === c.studentId);
                    return (
                      <div key={r.studentId} className="px-5 py-4" data-example={i}>
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-display text-[18px] text-ink">{"ABC"[i]}</span>
                          <BucketTag bucket={c.bucket} />
                        </div>
                        <select
                          value={c.studentId}
                          onChange={(e) => swap(pid, i, e.target.value)}
                          className="mt-2 w-full rounded-full border border-line-strong bg-paper px-3 py-1.5 text-[13px] text-ink"
                          aria-label={`Example ${"ABC"[i]}`}
                          data-swap
                        >
                          {others.map((o) => (
                            <option key={o.studentId} value={o.studentId}>
                              {o.name}
                            </option>
                          ))}
                        </select>
                        <ol className="mt-3 space-y-1.5">
                          {c.lines.map((tex, n) => (
                            <li key={n} className="rounded-lg border border-line bg-cream/60 px-3 py-1.5 text-[14px] text-ink">
                              <M tex={tex} />
                            </li>
                          ))}
                        </ol>
                      </div>
                    );
                  })}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </TeacherChrome>
  );
}

function BucketTag({ bucket }: { bucket: Bucket }) {
  if (bucket === "correct") return <span className="rounded-full border border-secure-line bg-secure-soft px-2 py-0.5 text-[11.5px] text-secure">correct</span>;
  return <LeafChip id={bucket} className="border-wrong-line bg-wrong-soft text-wrong" />;
}
