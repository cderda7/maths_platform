"use client";

import { useState } from "react";
import M from "@/components/Math";
import StepTrace, { MarkerLegend } from "@/components/StepTrace";
import ConfidenceCheck from "@/components/ConfidenceCheck";
import { Button, Card, Eyebrow, H2, Avatar } from "@/components/ui";
import { DifficultyTag, SubskillChip, STATUS_WORD } from "@/components/Tag";
import { FLOWS } from "@/data/flows";
import { PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";
import { STUDENT_MAP } from "@/data/students";
import type { Confidence, FlowStage, NextStep } from "@/data/types";

type StudentId = "priya" | "jordan";
type Phase = "working" | "evaluated";

interface StudentState {
  stage: number;
  phase: Phase;
  confidence: Confidence | null;
  finished: boolean;
}

const initial = (): StudentState => ({ stage: 0, phase: "working", confidence: null, finished: false });

const CONF_ORDER: Confidence[] = ["not sure", "a bit unsure", "fairly sure", "certain"];

function calibrationNote(conf: Confidence, stage: FlowStage) {
  const hasSlip = stage.evaluation.steps.some((s) => s.marker === "slip");
  const hasShaky = stage.evaluation.steps.some((s) => s.marker === "shaky");
  const idx = CONF_ORDER.indexOf(conf);
  if (!hasSlip && !hasShaky) {
    if (idx <= 1) return `You said "${conf}" — and every step held. Worth remembering next time this type comes up.`;
    return `You said "${conf}" and the working agrees.`;
  }
  if (hasSlip) {
    if (idx >= 2) return `You said "${conf}". One step didn't hold — the check that would have caught it is quick, and it's the thing to add.`;
    return `You said "${conf}", and you were right to pause. The method was fine; one line needs another look.`;
  }
  if (idx >= 2) return `You said "${conf}". The idea holds; one step was rushed.`;
  return `You said "${conf}". The reasoning is sound — the uncertainty was in the last algebra step, not the idea.`;
}

function NextStepCard({ next, onGo, onStay }: { next: NextStep; onGo: () => void; onStay?: () => void }) {
  const target = next.targetProblemId ? PROBLEM_MAP[next.targetProblemId] : null;
  const tone = next.kind === "sidestep" ? "soft" : "paper";
  return (
    <Card tone={tone} className="p-6 rise">
      <Eyebrow className={next.kind === "sidestep" ? "text-accent-deep" : ""}>
        {next.kind === "advance" && "Next"}
        {next.kind === "sidestep" && "A natural next step"}
        {next.kind === "stretch" && "If you want to"}
        {next.kind === "finish" && "For now"}
      </Eyebrow>
      <H2 className="mt-1.5">{next.title}</H2>
      <p className="mt-2 text-[14px] text-ink-soft leading-relaxed max-w-prose">{next.body}</p>
      {target && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-line bg-paper px-4 py-3">
          <span className="text-[12px] text-ink-muted">{target.kind === "prereq" ? "Warm-up" : target.label}</span>
          <DifficultyTag d={target.difficulty} />
          <span className="text-[13px] text-ink-soft">{target.stem}</span>
          {target.tex && <M tex={target.tex} />}
          <span className="ml-auto text-[12px] text-ink-muted">~{target.minutes} min</span>
        </div>
      )}
      <div className="mt-5 flex flex-wrap gap-2">
        {next.kind !== "finish" ? (
          <>
            <Button variant={next.kind === "sidestep" ? "accent" : "primary"} onClick={onGo}>
              {next.kind === "sidestep" ? "Do the warm-up" : next.kind === "stretch" ? "Try Q6" : `Open ${target?.label ?? "next"}`}
            </Button>
            {(next.kind === "sidestep" || next.kind === "stretch") && onStay && (
              <Button variant="ghost" onClick={onStay}>
                {next.kind === "sidestep" ? "Go straight to Q3 instead" : "Stay in order"}
              </Button>
            )}
          </>
        ) : (
          <Button variant="secondary" onClick={onGo}>Back to the set</Button>
        )}
      </div>
    </Card>
  );
}

export interface WorkFlowInit {
  who?: StudentId;
  stage?: number;
  phase?: Phase;
  confidence?: Confidence;
}

export default function WorkFlow({ init = {} }: { init?: WorkFlowInit }) {
  const [who, setWho] = useState<StudentId>(init.who ?? "jordan");
  const [states, setStates] = useState<Record<StudentId, StudentState>>(() => {
    const base = { priya: initial(), jordan: initial() };
    const w = init.who ?? "jordan";
    const stage = Math.min(Math.max(init.stage ?? 0, 0), FLOWS[w].length - 1);
    const phase = init.phase ?? "working";
    base[w] = {
      stage,
      phase,
      confidence: init.confidence ?? (phase === "evaluated" ? FLOWS[w][stage].confidence : null),
      finished: false,
    };
    return base;
  });
  const st = states[who];
  const flow = FLOWS[who];
  const stage = flow[st.stage];
  const problem = PROBLEM_MAP[stage.problemId];
  const student = STUDENT_MAP[who];

  const update = (patch: Partial<StudentState>) =>
    setStates((s) => ({ ...s, [who]: { ...s[who], ...patch } }));

  const check = () => update({ phase: "evaluated" });
  const advance = () => {
    if (st.stage + 1 < flow.length) update({ stage: st.stage + 1, phase: "working", confidence: null });
    else update({ finished: true });
  };
  const reset = () => setStates((s) => ({ ...s, [who]: initial() }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      {/* Header row: title + sample-student toggle */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Roots of a quadratic — Set 3</Eyebrow>
          <h1 className="font-display text-[34px] leading-tight mt-1 text-ink">Working through</h1>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[12px] text-ink-muted">View as</span>
          <div className="flex rounded-full border border-line-strong p-0.5 bg-paper">
            {(["priya", "jordan"] as StudentId[]).map((id) => (
              <button
                key={id}
                onClick={() => setWho(id)}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-[12.5px] ${who === id ? "bg-ink text-white" : "text-ink-soft"}`}
              >
                <Avatar initials={STUDENT_MAP[id].initials} size="h-6 w-6 text-[10px]" />
                {STUDENT_MAP[id].name.split(" ")[0]}
              </button>
            ))}
          </div>
          <button onClick={reset} className="text-[12px] text-ink-muted hover:text-ink underline underline-offset-2">
            restart
          </button>
        </div>
      </div>

      {/* Path so far */}
      <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-1">
        {flow.slice(0, st.finished ? flow.length : st.stage + 1).map((s, i) => {
          const p = PROBLEM_MAP[s.problemId];
          const current = i === st.stage && !st.finished;
          const side = p.kind === "prereq";
          return (
            <div key={i} className="flex items-center gap-2 shrink-0">
              {i > 0 && <span className="h-px w-6 bg-line-strong" />}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${
                  current
                    ? "border-ink bg-ink text-white"
                    : side
                      ? "border-accent-line bg-accent-soft text-accent-deep"
                      : "border-line bg-paper text-ink"
                }`}
              >
                {side ? "Warm-up · " + SUBSKILL_MAP[p.subskill].short : p.label}
              </span>
            </div>
          );
        })}
        {!st.finished && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="h-px w-6 bg-line-strong" />
            <span className="inline-flex items-center rounded-full border border-dashed border-line-strong px-3 py-1 text-[12px] text-ink-muted">
              {st.phase === "evaluated" ? "next" : "…"}
            </span>
            <span className="ml-1 text-[11.5px] text-ink-muted">the path is decided as you go, not in advance</span>
          </div>
        )}
      </div>

      {st.finished ? (
        <Card className="mt-8 p-8 rise">
          <Eyebrow>Set 3 · {student.name}</Eyebrow>
          <H2 className="mt-2">That's a good place to stop for today.</H2>
          <p className="mt-3 text-[14px] text-ink-soft max-w-prose leading-relaxed">
            {who === "jordan"
              ? "Four items, one detour. The factorising check you picked up in the warm-up showed up again in Q3 without being asked for. Q4 is next when you come back."
              : "Four items including the stretch. The only thing to look at again is the last line of Q6 — k² = 36 has two answers."}
          </p>
          <div className="mt-5 flex gap-2">
            <Button variant="secondary" onClick={reset}>Run it again</Button>
            <a href="/student/teacher-view" className="inline-flex items-center rounded-full px-4 py-2 text-[13.5px] text-accent-deep font-medium">
              See what your teacher sees →
            </a>
          </div>
        </Card>
      ) : (
        <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
          {/* Problem + working */}
          <div className="space-y-5">
            <Card className="p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-display text-[22px] text-ink">{problem.kind === "prereq" ? "Warm-up" : problem.label}</span>
                <DifficultyTag d={problem.difficulty} />
                {problem.kind === "prereq" && (
                  <span className="text-[12px] text-ink-muted">{SUBSKILL_MAP[problem.subskill].name}</span>
                )}
                <span className="ml-auto text-[12px] text-ink-muted">~{problem.minutes} min</span>
              </div>
              <p className="mt-3 text-[15px] text-ink-soft leading-relaxed">{problem.stem}</p>
              {problem.tex && (
                <div className="mt-3 text-[18px]">
                  <M tex={problem.tex} display />
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <Eyebrow>Your working</Eyebrow>
                {st.phase === "working" && (
                  <span className="text-[11.5px] text-ink-muted">sample working prefilled · typed or photographed in the real thing</span>
                )}
              </div>

              {st.phase === "working" ? (
                <div className="mt-4">
                  <ol className="space-y-2">
                    {stage.evaluation.steps.map((s, i) => (
                      <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-cream/60 px-3 py-2">
                        <span className="w-5 text-[11px] text-ink-muted tabular-nums">{i + 1}</span>
                        <span className="math-lg"><M tex={s.tex} /></span>
                      </li>
                    ))}
                    <li className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2 text-[13px] text-ink-muted">
                      <span className="w-5 text-[11px] tabular-nums">{stage.evaluation.steps.length + 1}</span>
                      <span>add a line…</span>
                    </li>
                  </ol>

                  <div className="mt-6">
                    <ConfidenceCheck value={st.confidence} onChange={(c) => update({ confidence: c })} />
                    {!st.confidence && (
                      <button
                        onClick={() => update({ confidence: stage.confidence })}
                        className="mt-2 text-[11.5px] text-accent-deep underline underline-offset-2"
                      >
                        pick what {student.name.split(" ")[0]} picked ("{stage.confidence}")
                      </button>
                    )}
                  </div>

                  <div className="mt-5 flex items-center gap-3">
                    <Button onClick={check} disabled={!st.confidence}>Check my working</Button>
                    <span className="text-[12px] text-ink-muted">Checks each step, not just the answer.</span>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <StepTrace steps={stage.evaluation.steps} animate />
                  <div className="mt-2 rounded-xl border border-line bg-cream/70 px-4 py-3 text-[13.5px] text-ink leading-relaxed">
                    {stage.evaluation.summary}
                  </div>
                  <div className="mt-4">
                    <MarkerLegend />
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right rail */}
          <div className="space-y-4 lg:sticky lg:top-20">
            {st.phase === "working" ? (
              <Card className="p-5" tone="plain">
                <Eyebrow>This problem leans on</Eyebrow>
                <ul className="mt-3 space-y-2">
                  {[problem.subskill, ...problem.prereqs].filter((v, i, a) => a.indexOf(v) === i).map((s) => (
                    <li key={s} className="text-[13px]">
                      <div className="text-ink">{SUBSKILL_MAP[s].name}</div>
                      <div className="text-[12px] text-ink-muted">{SUBSKILL_MAP[s].description}</div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 text-[12px] text-ink-muted border-t border-line pt-3">
                  Stuck? The <a href="/student/tutor" className="text-accent-deep underline underline-offset-2">tutor</a> will ask you questions rather than show you the answer.
                </div>
              </Card>
            ) : (
              <>
                <Card className="p-5">
                  <Eyebrow>What this showed</Eyebrow>
                  <ul className="mt-3 space-y-2.5">
                    {stage.evaluation.exercised.map((e) => (
                      <li key={e.id} className="flex items-start gap-2.5">
                        <SubskillChip id={e.id} status={e.status} className="shrink-0" />
                        <div className="text-[12.5px] text-ink-soft leading-snug">
                          <span className="text-ink-muted">{STATUS_WORD[e.status]}</span>
                          {e.note && <span> · {e.note}</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                  {st.confidence && (
                    <div className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-soft leading-relaxed">
                      <span className="text-ink-muted">Check-in · </span>
                      {calibrationNote(st.confidence, stage)}
                    </div>
                  )}
                </Card>
                <NextStepCard
                  next={stage.evaluation.next}
                  onGo={advance}
                  onStay={stage.evaluation.next.kind === "sidestep" || stage.evaluation.next.kind === "stretch" ? () => {
                    // Skip the detour/stretch stage
                    if (st.stage + 2 < flow.length) update({ stage: st.stage + 2, phase: "working", confidence: null });
                    else update({ finished: true });
                  } : undefined}
                />
                {stage.evaluation.next.reason && (
                  <div className="text-[11.5px] text-ink-muted px-1">
                    <span className="font-medium text-ink-soft">Why this was offered (design note): </span>
                    {stage.evaluation.next.reason}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
