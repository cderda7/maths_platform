"use client";

import { useState } from "react";
import M from "@/components/Math";
import ConfidenceCheck from "@/components/ConfidenceCheck";
import { Button, Card, Eyebrow, H2 } from "@/components/ui";
import { DifficultyTag, StatusDot } from "@/components/Tag";
import { PROBLEM_MAP } from "@/data/problems";
import { JORDAN_CHECKINS } from "@/data/teacher";
import type { Confidence } from "@/data/types";

const REASONS = [
  "I've seen this type before",
  "Not sure which method to use",
  "The fractions",
  "The signs",
  "I know the method, just slow",
  "Don't know what the question is asking",
];

const AFTER = ["Easier than I expected", "About what I expected", "Harder than I expected"];

export default function CheckInScreen() {
  const problem = PROBLEM_MAP.q5;
  const [conf, setConf] = useState<Confidence | null>(null);
  const [reasons, setReasons] = useState<string[]>([]);
  const [stage, setStage] = useState<"before" | "after" | "done">("before");
  const [after, setAfter] = useState<string | null>(null);

  const toggle = (r: string) => setReasons((rs) => (rs.includes(r) ? rs.filter((x) => x !== r) : [...rs, r]));

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div>
        <Eyebrow>Roots of a quadratic — Set 3 · Q5</Eyebrow>
        <h1 className="font-display text-[34px] leading-tight mt-1 text-ink">A quick check-in</h1>
        <p className="mt-2 text-[14px] text-ink-muted max-w-prose">
          Thirty seconds before and after a problem. Not marked, not scored — it just puts your feeling next to your working so you can see whether they agree.
        </p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6 items-start">
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-display text-[22px]">Q5</span>
              <DifficultyTag d={problem.difficulty} />
              <span className="ml-auto text-[12px] text-ink-muted">~{problem.minutes} min</span>
            </div>
            <p className="mt-3 text-[15px] text-ink-soft">{problem.stem}</p>
            <div className="mt-3 text-[18px]"><M tex={problem.tex!} display /></div>
          </Card>

          {stage === "before" && (
            <Card className="p-6 rise">
              <ConfidenceCheck value={conf} onChange={setConf} prompt="Before you start — how sure are you about this one?" compact />
              <div className="mt-5 text-[13px] text-ink">What makes it feel that way? <span className="text-ink-muted">(optional)</span></div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {REASONS.map((r) => (
                  <button
                    key={r}
                    onClick={() => toggle(r)}
                    className={`rounded-full border px-3 py-1 text-[12.5px] transition-colors ${
                      reasons.includes(r) ? "bg-accent-soft border-accent-line text-accent-deep" : "bg-paper border-line text-ink-soft hover:border-ink-muted"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              <div className="mt-6 flex items-center gap-3">
                <Button disabled={!conf} onClick={() => setStage("after")}>Start the problem</Button>
                <span className="text-[12px] text-ink-muted">You can change your mind after.</span>
              </div>
            </Card>
          )}

          {stage === "after" && (
            <Card className="p-6 rise">
              <div className="text-[12px] text-ink-muted">…a few minutes later, after checking your working…</div>
              <H2 className="mt-2">How did that go, compared with what you expected?</H2>
              <div className="mt-4 grid sm:grid-cols-3 gap-2">
                {AFTER.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAfter(a)}
                    className={`rounded-xl border px-3 py-3 text-[13px] ${after === a ? "bg-ink text-white border-ink" : "bg-paper border-line text-ink-soft hover:border-ink-muted"}`}
                  >
                    {a}
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2">
                <Button disabled={!after} onClick={() => setStage("done")}>Done</Button>
                <Button variant="ghost" onClick={() => setStage("before")}>Back</Button>
              </div>
            </Card>
          )}

          {stage === "done" && (
            <Card className="p-6 rise" tone="soft">
              <Eyebrow className="text-accent-deep">Noted</Eyebrow>
              <p className="mt-2 text-[14px] text-ink leading-relaxed">
                You went in <span className="font-medium">{conf}</span>
                {reasons.length > 0 && <> because of: {reasons.map((r) => r.toLowerCase()).join(", ")}</>}. Afterwards it felt{" "}
                <span className="font-medium">{after?.toLowerCase()}</span>.
              </p>
              <p className="mt-2 text-[13px] text-ink-soft">
                That's the whole check-in. Over a set it builds a picture of when your instincts are right — which is useful to know in an exam, when there's no one to ask.
              </p>
              <div className="mt-4">
                <Button variant="secondary" onClick={() => { setStage("before"); setConf(null); setReasons([]); setAfter(null); }}>Run it again</Button>
              </div>
            </Card>
          )}
        </div>

        <Card className="p-5">
          <Eyebrow>Your check-ins this set</Eyebrow>
          <p className="mt-1.5 text-[12px] text-ink-muted">What you said before, and how the working went.</p>
          <ol className="mt-4 space-y-3">
            {JORDAN_CHECKINS.map((c) => {
              const p = PROBLEM_MAP[c.problemId];
              return (
                <li key={c.problemId} className="flex items-center gap-3 text-[12.5px]">
                  <span className="w-16 shrink-0 whitespace-nowrap text-ink font-medium">{p.kind === "prereq" ? "Warm-up" : p.label}</span>
                  <span className="flex-1 text-ink-soft">{c.before}</span>
                  <span className="inline-flex items-center gap-1.5 text-ink-muted">
                    <StatusDot status={c.outcome} />
                    {c.outcome === "sound" ? "held" : c.outcome === "slip" ? "one slip" : "one shaky step"}
                  </span>
                </li>
              );
            })}
          </ol>
          <div className="mt-4 border-t border-line pt-3 text-[12.5px] text-ink-soft leading-relaxed">
            Your feeling and your working have been getting closer together across the set. The one to notice: Q2, where "certain" met a slip that a quick expand-back check would have caught.
          </div>
        </Card>
      </div>
    </div>
  );
}
