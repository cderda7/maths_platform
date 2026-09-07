"use client";

import { useState } from "react";
import Link from "next/link";
import M from "@/components/Math";
import { Button, Card, Eyebrow, H1, Avatar } from "@/components/ui";
import { DifficultyTag, StatusDot, STATUS_WORD } from "@/components/Tag";
import StepTrace from "@/components/StepTrace";
import { STUDENT_MAP, STUDENTS } from "@/data/students";
import { SUBSKILLS } from "@/data/subskills";
import { PROBLEM_MAP } from "@/data/problems";
import { HINT_SUGGESTIONS, JORDAN_CHECKINS, JORDAN_HIGHLIGHTS } from "@/data/teacher";
import { FLOWS } from "@/data/flows";

export default function StudentDetail({ studentId }: { studentId: string }) {
  const s = STUDENT_MAP[studentId];
  const isJordan = studentId === "jordan";
  const [hintFor, setHintFor] = useState<string>("q3");
  const [hint, setHint] = useState("");
  const [sent, setSent] = useState<{ problemId: string; text: string }[]>([]);
  const q2 = FLOWS.jordan[1].evaluation;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <Avatar initials={s.initials} size="h-14 w-14 text-[16px]" />
          <div>
            <Eyebrow>11 Methods B · Roots of a quadratic — Set 3</Eyebrow>
            <H1 className="mt-1 text-[36px] md:text-[40px]">{s.name}</H1>
            <div className="mt-1 text-[13px] text-ink-muted">{s.progress.done} of {s.progress.total} done · last active {s.lastActive}</div>
          </div>
        </div>
        <div className="flex items-center gap-1 text-[12.5px]">
          <span className="text-ink-muted mr-1">Other students:</span>
          {STUDENTS.filter((x) => x.id !== studentId).slice(0, 4).map((x) => (
            <Link key={x.id} href={`/teacher/students/${x.id}`} className="rounded-full border border-line px-2.5 py-1 text-ink-soft hover:text-ink hover:border-ink-muted">{x.name.split(" ")[0]}</Link>
          ))}
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_380px] gap-6 items-start">
        <div className="space-y-5">
          <Card className="p-6">
            <Eyebrow>Prerequisite skills</Eyebrow>
            <ul className="mt-3 grid sm:grid-cols-2 gap-x-6 gap-y-3">
              {SUBSKILLS.map((k) => (
                <li key={k.id} className="flex items-start gap-2.5">
                  <StatusDot status={s.subskills[k.id]} size="mt-1.5 h-2.5 w-2.5" />
                  <div>
                    <div className="text-[13.5px] text-ink">{k.name} <span className="text-[11.5px] text-ink-muted">· {STATUS_WORD[s.subskills[k.id]]}</span></div>
                    <div className="text-[12px] text-ink-muted">{k.description}</div>
                  </div>
                </li>
              ))}
            </ul>
            {s.flag && (
              <div className="mt-4 rounded-xl border border-shaky-line bg-shaky-soft px-4 py-2.5 text-[13px] text-ink">
                <span className="font-medium">Most recent flag · </span>{s.flag}
              </div>
            )}
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <Eyebrow>Confidence signal</Eyebrow>
              <span className="text-[12px] text-ink-muted">{s.confidenceSignal === "over" ? "over-sure" : s.confidenceSignal === "under" ? "under-sure" : s.confidenceSignal}</span>
            </div>
            <p className="mt-2 text-[13.5px] text-ink-soft leading-relaxed">{s.confidenceNote}</p>
            {isJordan && (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-[12.5px]">
                  <thead>
                    <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-ink-muted">
                      <th className="py-1.5 pr-4 font-semibold">Item</th>
                      <th className="py-1.5 pr-4 font-semibold">Said before</th>
                      <th className="py-1.5 font-semibold">Working</th>
                    </tr>
                  </thead>
                  <tbody>
                    {JORDAN_CHECKINS.map((c) => {
                      const p = PROBLEM_MAP[c.problemId];
                      return (
                        <tr key={c.problemId} className="border-t border-line">
                          <td className="py-2 pr-4 text-ink">{p.kind === "prereq" ? "Warm-up" : p.label} <DifficultyTag d={p.difficulty} className="ml-1" /></td>
                          <td className="py-2 pr-4 text-ink-soft">{c.before}</td>
                          <td className="py-2 inline-flex items-center gap-1.5 text-ink-soft"><StatusDot status={c.outcome} />{c.outcome === "sound" ? "every step held" : c.outcome === "slip" ? "one slip" : "one shaky step"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>

          {isJordan && (
            <>
              <Card className="p-6">
                <Eyebrow>Chat and evaluation highlights</Eyebrow>
                <ul className="mt-3 space-y-3">
                  {JORDAN_HIGHLIGHTS.map((h, i) => (
                    <li key={i} className="rounded-xl border border-line bg-cream/50 px-4 py-3">
                      <div className="flex items-center gap-2 text-[11.5px] text-ink-muted">
                        <span className="text-ink font-medium">{PROBLEM_MAP[h.problemId].label}</span>
                        <span>· {h.who === "student" ? s.name.split(" ")[0] : "tutor"}</span>
                      </div>
                      <blockquote className="mt-1 text-[13.5px] text-ink">“{h.quote}”</blockquote>
                      <div className="mt-1 text-[12.5px] text-ink-soft">{h.note}</div>
                    </li>
                  ))}
                </ul>
              </Card>

              <Card className="p-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Eyebrow>Working · Q2</Eyebrow>
                  <DifficultyTag d="simple familiar" />
                  <span className="text-[13px]"><M tex={PROBLEM_MAP.q2.tex!} /></span>
                  <span className="ml-auto text-[11.5px] text-ink-muted">the step the flag came from</span>
                </div>
                <div className="mt-4"><StepTrace steps={q2.steps} compact /></div>
              </Card>
            </>
          )}
        </div>

        <div className="space-y-4 lg:sticky lg:top-20">
          <Card className="p-5">
            <Eyebrow>Write a classwide hint</Eyebrow>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">Shown to every student on that problem, before the tutor's own ways in.</p>
            <div className="mt-3">
              <label className="text-[11px] uppercase tracking-[0.12em] font-semibold text-ink-muted">Problem</label>
              <select value={hintFor} onChange={(e) => setHintFor(e.target.value)} className="mt-1.5 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink">
                {["q1", "q2", "q3", "q4", "q5", "q6", "q7"].map((id) => (
                  <option key={id} value={id}>{PROBLEM_MAP[id].label} · {PROBLEM_MAP[id].difficulty}</option>
                ))}
              </select>
            </div>
            <textarea
              value={hint}
              onChange={(e) => setHint(e.target.value)}
              rows={4}
              placeholder={hintFor === "q3" ? "e.g. Before you use the null factor law, ask: what does the product equal?" : "A question, not an answer, tends to work best."}
              className="mt-3 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-muted"
            />
            <div className="mt-3 flex items-center gap-3">
              <Button className="shrink-0 whitespace-nowrap" disabled={!hint.trim()} onClick={() => { setSent((x) => [{ problemId: hintFor, text: hint.trim() }, ...x]); setHint(""); }}>Post to class</Button>
              <span className="text-[11.5px] text-ink-muted">Hints are phrased as questions where possible.</span>
            </div>
            {sent.length > 0 && (
              <ul className="mt-4 space-y-2 border-t border-line pt-3">
                {sent.map((h, i) => (
                  <li key={i} className="rounded-lg border border-accent-line bg-accent-soft/60 px-3 py-2 text-[12.5px] text-ink rise">
                    <span className="font-medium">{PROBLEM_MAP[h.problemId].label} · </span>{h.text}
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-5" tone="plain">
            <Eyebrow>Might need a hint</Eyebrow>
            <ul className="mt-2 space-y-3">
              {HINT_SUGGESTIONS.map((h) => {
                const p = PROBLEM_MAP[h.problemId];
                return (
                  <li key={h.problemId} className="text-[12.5px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <button onClick={() => setHintFor(h.problemId)} className="text-ink font-medium hover:text-accent-deep">{p.label}</button>
                      <DifficultyTag d={p.difficulty} />
                      <span className={`text-[11px] rounded-full px-2 py-px ${h.kind === "might need a hint" ? "bg-shaky-soft text-shaky" : "bg-note-soft text-note"}`}>{h.kind}</span>
                    </div>
                    <div className="mt-1 text-ink-soft">{h.why}</div>
                    <div className="mt-0.5 text-ink-muted">{h.evidence}</div>
                  </li>
                );
              })}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
