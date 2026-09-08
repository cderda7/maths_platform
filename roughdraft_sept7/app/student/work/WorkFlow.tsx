"use client";

import { useState } from "react";
import M from "@/components/Math";
import StepTrace, { MarkerLegend } from "@/components/StepTrace";
import ConfidenceCheck from "@/components/ConfidenceCheck";
import WorkingEditor from "./WorkingEditor";
import { Button, Card, Eyebrow, H2, Avatar } from "@/components/ui";
import { DifficultyTag, SubskillChip, STATUS_WORD } from "@/components/Tag";
import { FLOWS } from "@/data/flows";
import { PROBLEMS, PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";
import { STUDENT_MAP } from "@/data/students";
import type { Confidence, Evaluation, NextStep } from "@/data/types";
import { evaluateAttempt, nextCoreAfter, toPlain } from "@/lib/evaluate";

/** Priya and Jordan follow scripted flows; Sam hasn't started, so every line is typed and evaluated live. */
type StudentId = "priya" | "jordan" | "sam";
type Phase = "working" | "evaluated";
const STUDENT_IDS: StudentId[] = ["priya", "jordan", "sam"];
const isScripted = (id: StudentId): id is "priya" | "jordan" => id !== "sam";

interface StudentState {
  /** Problem ids visited on this path, in order. The last one is current. */
  path: string[];
  phase: Phase;
  confidence: Confidence | null;
  finished: boolean;
  /** Live only: typed working and its evaluation, per problem. */
  lines: Record<string, string[]>;
  evals: Record<string, Evaluation>;
  checks: Record<string, number>;
}

const CORE_IDS = PROBLEMS.filter((p) => p.kind === "core").map((p) => p.id);
const firstProblem = (who: StudentId) => (isScripted(who) ? FLOWS[who][0].problemId : CORE_IDS[0]);
const initial = (who: StudentId): StudentState => ({
  path: [firstProblem(who)],
  phase: "working",
  confidence: null,
  finished: false,
  lines: {},
  evals: {},
  checks: {},
});

const CONF_ORDER: Confidence[] = ["not sure", "a bit unsure", "fairly sure", "certain"];

function calibrationNote(conf: Confidence, evaluation: Evaluation) {
  const hasSlip = evaluation.steps.some((s) => s.marker === "slip");
  const hasShaky = evaluation.steps.some((s) => s.marker === "shaky");
  const hasUnclear = evaluation.steps.some((s) => s.marker === "unclear");
  const idx = CONF_ORDER.indexOf(conf);
  if (hasUnclear && !hasSlip) {
    return `You said "${conf}". Some of the working isn't on the page yet, so neither of us can tell — add the missing moves and check again.`;
  }
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
  const stayLabel = onStay && next.kind === "sidestep" ? `Go straight to ${next.title.replace(/^A quick one before /, "")} instead` : "Stay in order";
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
                {stayLabel}
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
  /** Live student only: typed lines to start with, optionally already checked (phase=evaluated). */
  lines?: string[];
  /** Live student only: which core problem the typed lines belong to (default q1). */
  problem?: string;
}

export default function WorkFlow({ init = {} }: { init?: WorkFlowInit }) {
  const [who, setWho] = useState<StudentId>(init.who ?? "jordan");
  const [states, setStates] = useState<Record<StudentId, StudentState>>(() => {
    const base = { priya: initial("priya"), jordan: initial("jordan"), sam: initial("sam") };
    const w = init.who ?? "jordan";
    if (isScripted(w)) {
      const flow = FLOWS[w];
      const stage = Math.min(Math.max(init.stage ?? 0, 0), flow.length - 1);
      const phase = init.phase ?? "working";
      base[w] = {
        ...initial(w),
        path: flow.slice(0, stage + 1).map((s) => s.problemId),
        phase,
        confidence: init.confidence ?? (phase === "evaluated" ? flow[stage].confidence : null),
      };
    } else if (init.lines?.length) {
      // Land on the requested core problem with the earlier ones on the path (unevaluated).
      const core = CORE_IDS.includes(init.problem ?? "") ? (init.problem as string) : firstProblem(w);
      const path = CORE_IDS.slice(0, CORE_IDS.indexOf(core) + 1);
      const confidence = init.confidence ?? (init.phase === "evaluated" ? "fairly sure" : null);
      const evaluated = init.phase === "evaluated";
      base[w] = {
        ...initial(w),
        path,
        phase: evaluated ? "evaluated" : "working",
        confidence,
        lines: { [core]: init.lines },
        evals: evaluated ? { [core]: evaluateAttempt(PROBLEM_MAP[core], init.lines, { visited: path.slice(0, -1), evals: {} }) } : {},
        checks: evaluated ? { [core]: 1 } : {},
      };
    }
    return base;
  });

  const st = states[who];
  const student = STUDENT_MAP[who];
  const samUntouched =
    Object.keys(states.sam.evals).length === 0 && !Object.values(states.sam.lines).some((ls) => ls.some((l) => l.trim() !== ""));
  const current = st.path[st.path.length - 1];
  const problem = PROBLEM_MAP[current];
  const live = !isScripted(who);
  const scriptedStage = isScripted(who) ? FLOWS[who].find((s) => s.problemId === current) : undefined;
  const evaluation: Evaluation | undefined = live ? st.evals[current] : scriptedStage?.evaluation;
  const lines = st.lines[current] ?? [""];
  const hasWorking = live ? lines.some((l) => l.trim() !== "") : true;
  const checks = st.checks[current] ?? 0;

  const update = (patch: Partial<StudentState>) => setStates((s) => ({ ...s, [who]: { ...s[who], ...patch } }));
  const reset = () => setStates((s) => ({ ...s, [who]: initial(who) }));

  const check = () => {
    if (live) {
      const visited = st.path.slice(0, -1);
      const ev = evaluateAttempt(problem, lines, { visited, evals: st.evals });
      update({ phase: "evaluated", evals: { ...st.evals, [current]: ev }, checks: { ...st.checks, [current]: checks + 1 } });
    } else {
      update({ phase: "evaluated" });
    }
  };
  const revise = () => update({ phase: "working" });
  const goTo = (target: string | null | undefined) => {
    if (!target || (isScripted(who) && !FLOWS[who].some((s) => s.problemId === target))) return update({ finished: true });
    update({ path: [...st.path, target], phase: "working", confidence: null });
  };
  const stay = () => goTo(nextCoreAfter(current, st.path));

  const prefill = (kind: "sound" | "misstep") => {
    const m = problem.missteps?.[0];
    const plain =
      kind === "sound" || !m
        ? problem.solution.map((s) => toPlain(s.tex))
        : [...problem.solution.slice(0, problem.solution.findIndex((s) => s.subskill === m.subskill)).map((s) => toPlain(s.tex)), toPlain(m.tex), ...(m.then ?? []).map((t) => toPlain(t.tex))];
    update({ lines: { ...st.lines, [current]: plain } });
  };

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
            {STUDENT_IDS.map((id) => (
              <button
                key={id}
                onClick={() => setWho(id)}
                className={`flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-[12.5px] ${who === id ? "bg-ink text-white" : "text-ink-soft"}`}
              >
                <Avatar initials={STUDENT_MAP[id].initials} size="h-6 w-6 text-[10px]" />
                {STUDENT_MAP[id].name.split(" ")[0]}
                {id === "sam" && samUntouched && (
                  <span className={`text-[10.5px] ${who === id ? "text-white/70" : "text-ink-muted"}`}>· not started</span>
                )}
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
        {st.path.map((id, i) => {
          const p = PROBLEM_MAP[id];
          const isCurrent = i === st.path.length - 1 && !st.finished;
          const side = p.kind === "prereq";
          return (
            <div key={`${id}-${i}`} className="flex items-center gap-2 shrink-0">
              {i > 0 && <span className="h-px w-6 bg-line-strong" />}
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[12px] ${
                  isCurrent
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
            {who === "jordan" && "Four items, one detour. The factorising check you picked up in the warm-up showed up again in Q3 without being asked for. Q4 is next when you come back."}
            {who === "priya" && "Four items including the stretch. The only thing to look at again is the last line of Q6 — k² = 36 has two answers."}
            {who === "sam" && finishedNote(st)}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Eyebrow>Your working</Eyebrow>
                {st.phase === "working" && !live && (
                  <span className="text-[11.5px] text-ink-muted">sample working prefilled · typed or photographed in the real thing</span>
                )}
                {st.phase === "working" && live && (
                  <span className="text-[11.5px] text-ink-muted">
                    {checks > 0 ? `checked ${checks === 1 ? "once" : `${checks} times`} · edit and check again` : "one line per move · photographed in the real thing"}
                  </span>
                )}
                {st.phase === "evaluated" && live && (
                  <button onClick={revise} className="text-[12px] text-accent-deep underline underline-offset-2">
                    edit and check again
                  </button>
                )}
              </div>

              {st.phase === "working" ? (
                <div className="mt-4">
                  {live ? (
                    <WorkingEditor lines={lines} onChange={(l) => update({ lines: { ...st.lines, [current]: l } })} onSubmit={hasWorking && st.confidence ? check : undefined} />
                  ) : (
                    <ol className="space-y-2">
                      {evaluation!.steps.map((s, i) => (
                        <li key={i} className="flex items-center gap-3 rounded-lg border border-line bg-cream/60 px-3 py-2">
                          <span className="w-5 text-[11px] text-ink-muted tabular-nums">{i + 1}</span>
                          <span className="math-lg"><M tex={s.tex} /></span>
                        </li>
                      ))}
                      <li className="flex items-center gap-3 rounded-lg border border-dashed border-line-strong px-3 py-2 text-[13px] text-ink-muted">
                        <span className="w-5 text-[11px] tabular-nums">{evaluation!.steps.length + 1}</span>
                        <span>add a line…</span>
                      </li>
                    </ol>
                  )}

                  <div className="mt-6">
                    <ConfidenceCheck value={st.confidence} onChange={(c) => update({ confidence: c })} />
                    {!st.confidence && scriptedStage && (
                      <button
                        onClick={() => update({ confidence: scriptedStage.confidence })}
                        className="mt-2 text-[11.5px] text-accent-deep underline underline-offset-2"
                      >
                        pick what {student.name.split(" ")[0]} picked ("{scriptedStage.confidence}")
                      </button>
                    )}
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <Button onClick={check} disabled={!st.confidence || !hasWorking}>Check my working</Button>
                    <span className="text-[12px] text-ink-muted">
                      {!hasWorking ? "Write at least one line first." : !st.confidence ? "Pick how sure you are, then check." : "Checks each step, not just the answer."}
                    </span>
                  </div>
                  {live && (
                    <div className="mt-4 border-t border-line pt-3 text-[11.5px] text-ink-muted">
                      <span className="font-medium text-ink-soft">For reviewers (design note): </span>
                      <button onClick={() => prefill("sound")} className="text-accent-deep underline underline-offset-2">prefill a sound attempt</button>
                      {problem.missteps?.length ? (
                        <>
                          {" · "}
                          <button onClick={() => prefill("misstep")} className="text-accent-deep underline underline-offset-2">prefill a common misstep</button>
                        </>
                      ) : null}
                      {" · or type your own. Lines the checker can't follow are marked “can't tell yet”, not wrong."}
                    </div>
                  )}
                </div>
              ) : (
                <div className="mt-4">
                  <StepTrace steps={evaluation!.steps} animate />
                  <div className="mt-2 rounded-xl border border-line bg-cream/70 px-4 py-3 text-[13.5px] text-ink leading-relaxed">
                    {evaluation!.summary}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <MarkerLegend />
                    {live && evaluation!.reached === false && (
                      <Button variant="secondary" onClick={revise}>Keep going</Button>
                    )}
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
                  {evaluation!.exercised.length === 0 ? (
                    <p className="mt-3 text-[12.5px] text-ink-soft leading-snug">Nothing yet — none of the lines could be followed, so no subskill has been seen.</p>
                  ) : (
                    <ul className="mt-3 space-y-2.5">
                      {evaluation!.exercised.map((e) => (
                        <li key={e.id} className="flex items-start gap-2.5">
                          <SubskillChip id={e.id} status={e.status} className="shrink-0" />
                          <div className="text-[12.5px] text-ink-soft leading-snug">
                            <span className="text-ink-muted">{STATUS_WORD[e.status]}</span>
                            {e.note && <span> · {e.note}</span>}
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                  {st.confidence && (
                    <div className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-soft leading-relaxed">
                      <span className="text-ink-muted">Check-in · </span>
                      {calibrationNote(st.confidence, evaluation!)}
                    </div>
                  )}
                </Card>
                <NextStepCard
                  next={evaluation!.next}
                  onGo={() => goTo(evaluation!.next.targetProblemId)}
                  onStay={evaluation!.next.kind === "sidestep" || evaluation!.next.kind === "stretch" ? stay : undefined}
                />
                {evaluation!.next.reason && (
                  <div className="text-[11.5px] text-ink-muted px-1">
                    <span className="font-medium text-ink-soft">Why this was offered (design note): </span>
                    {evaluation!.next.reason}
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

function finishedNote(st: StudentState) {
  const items = st.path.length;
  const detours = st.path.filter((id) => PROBLEM_MAP[id].kind === "prereq").length;
  const evals = Object.values(st.evals);
  const slips = evals.filter((e) => e.steps.some((s) => s.marker === "slip")).length;
  const shaky = evals.filter((e) => e.steps.some((s) => s.marker === "shaky")).length;
  const parts = [
    `${items} item${items === 1 ? "" : "s"}${detours ? `, ${detours} detour${detours === 1 ? "" : "s"}` : ""}.`,
    slips ? `${slips} had a line that didn't hold — each one has a note saying what to check.` : "No line failed to hold.",
    shaky ? `${shaky} had a step that was right but not shown.` : "",
    "Whatever's left in the set is there when you come back.",
  ];
  return parts.filter(Boolean).join(" ");
}
