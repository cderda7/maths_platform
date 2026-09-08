"use client";

import { useEffect, useRef, useState } from "react";
import M from "@/components/Math";
import StepTrace, { MarkerLegend } from "@/components/StepTrace";
import { HelpPicker, HelpContentView, type HelpKind } from "@/components/HelpPicker";
import { Button, Card, Eyebrow, Avatar } from "@/components/ui";
import { DifficultyTag, SubskillChip, STATUS_WORD } from "@/components/Tag";
import { CHAT_SCRIPT, CHAT_PROBLEM_ID, HELP_Q4 } from "@/data/chat";
import { PROBLEM_MAP } from "@/data/problems";
import { SUBSKILL_MAP } from "@/data/subskills";
import { BrandMark } from "@/components/Brand";

export default function TutorScreen({ initialTurn = 1, initialHelp = null }: { initialTurn?: number; initialHelp?: HelpKind | null }) {
  const problem = PROBLEM_MAP[CHAT_PROBLEM_ID];
  const [shown, setShown] = useState(Math.min(Math.max(initialTurn, 1), CHAT_SCRIPT.length)); // number of script turns visible
  const [typing, setTyping] = useState(false);
  const [help, setHelp] = useState<HelpKind | null>(initialHelp);
  const [helpUsed, setHelpUsed] = useState<HelpKind[]>(initialHelp ? [initialHelp] : []);
  // Draft is derived from the next scripted student turn unless the user has edited it for this turn.
  const [draftEdit, setDraftEdit] = useState<{ forShown: number; text: string } | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const visible = CHAT_SCRIPT.slice(0, shown);
  const nextTurn = CHAT_SCRIPT[shown];
  const trace = [...visible].reverse().find((t) => t.trace)?.trace ?? [];
  const surfaced = [...visible].reverse().find((t) => t.surfaced)?.surfaced ?? [];
  const offerHelp = visible.some((t) => t.offerHelp) && shown <= CHAT_SCRIPT.findIndex((t) => t.offerHelp) + 1;
  const done = shown >= CHAT_SCRIPT.length;

  const draft = draftEdit?.forShown === shown ? draftEdit.text : nextTurn?.role === "student" ? nextTurn.text : "";

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [shown, typing, help]);

  const send = () => {
    if (!nextTurn || nextTurn.role !== "student" || typing) return;
    setShown((n) => n + 1);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setShown((n) => n + 1);
    }, 900);
  };

  const pick = (k: HelpKind) => {
    setHelp(k);
    setHelpUsed((u) => (u.includes(k) ? u : [...u, k]));
  };

  const reset = () => {
    setShown(1);
    setHelp(null);
    setHelpUsed([]);
    setTyping(false);
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Roots of a quadratic — Set 3 · {problem.label}</Eyebrow>
          <h1 className="font-display text-[34px] leading-tight mt-1 text-ink">Talk it through</h1>
        </div>
        <button onClick={reset} className="text-[12px] text-ink-muted hover:text-ink underline underline-offset-2">restart conversation</button>
      </div>

      <Card className="mt-6 p-5 flex flex-wrap items-center gap-4">
        <DifficultyTag d={problem.difficulty} />
        <span className="text-[14px] text-ink-soft">{problem.stem}</span>
        <span className="math-lg"><M tex={problem.tex!} /></span>
        <span className="ml-auto flex gap-1.5">
          {problem.prereqs.map((p) => <SubskillChip key={p} id={p} />)}
        </span>
      </Card>

      <div className="mt-5 grid lg:grid-cols-[1fr_1fr] gap-5 items-start">
        {/* Chat panel */}
        <Card className="flex flex-col h-[640px] overflow-hidden">
          <div className="flex items-center gap-2.5 px-5 py-3 border-b border-line">
            <BrandMark className="h-5 w-5" />
            <div className="text-[13px] font-medium text-ink">Tutor</div>
            <div className="text-[11.5px] text-ink-muted">asks before it tells</div>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {visible.map((t, i) => (
              <div key={i} className={`flex gap-2.5 rise ${t.role === "student" ? "justify-end" : ""}`}>
                {t.role === "tutor" && <span className="mt-1 grid place-items-center h-6 w-6 rounded-full bg-accent-soft shrink-0"><BrandMark className="h-3.5 w-3.5" /></span>}
                <div
                  className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-[13.5px] leading-relaxed ${
                    t.role === "student" ? "bg-ink text-white rounded-br-md" : "bg-cream-deep text-ink rounded-bl-md"
                  }`}
                >
                  {t.text}
                  {t.tex && <div className="mt-1.5"><M tex={t.tex} /></div>}
                </div>
                {t.role === "student" && <Avatar initials="JW" size="mt-1 h-6 w-6 text-[9.5px]" />}
              </div>
            ))}
            {offerHelp && !typing && (
              <div className="pl-9 space-y-3 rise">
                <HelpPicker onPick={pick} picked={help} />
                {help && <HelpContentView kind={help} help={HELP_Q4} />}
              </div>
            )}
            {typing && (
              <div className="flex gap-2.5">
                <span className="mt-1 grid place-items-center h-6 w-6 rounded-full bg-accent-soft shrink-0"><BrandMark className="h-3.5 w-3.5" /></span>
                <div className="rounded-2xl rounded-bl-md bg-cream-deep px-3.5 py-3 flex gap-1">
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
                  <span className="typing-dot h-1.5 w-1.5 rounded-full bg-ink-muted" />
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-line p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={draft}
                onChange={(e) => setDraftEdit({ forShown: shown, text: e.target.value })}
                rows={2}
                placeholder={done ? "Conversation complete — restart to run it again." : "Type your next line of working…"}
                disabled={done || typing}
                className="flex-1 resize-none rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-muted disabled:opacity-60"
              />
              <Button onClick={send} disabled={done || typing || nextTurn?.role !== "student"}>Send</Button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[11px] text-ink-muted">
              <span>Scripted for the mockup — the reply is prefilled; press Send to advance.</span>
              <span className="whitespace-nowrap ml-4">📷 attach a photo of working</span>
            </div>
          </div>
        </Card>

        {/* Live evaluation panel */}
        <Card className="flex flex-col h-[640px] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3 border-b border-line">
            <div className="flex items-center gap-2.5">
              <span className="h-2 w-2 rounded-full bg-sound animate-pulse" />
              <div className="text-[13px] font-medium text-ink">Live evaluation</div>
              <div className="text-[11.5px] text-ink-muted">updates as you talk</div>
            </div>
            <span className="text-[11px] text-ink-muted">{trace.length} step{trace.length === 1 ? "" : "s"} so far</span>
          </div>
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-6">
            <section>
              <Eyebrow>Working so far</Eyebrow>
              <div className="mt-3">
                {trace.length ? <StepTrace steps={trace} compact animate /> : <div className="text-[13px] text-ink-muted">Nothing yet.</div>}
              </div>
              <MarkerLegend />
            </section>

            <section>
              <Eyebrow>What the conversation has surfaced</Eyebrow>
              <ul className="mt-3 space-y-2">
                {surfaced.map((s) => (
                  <li key={s.id} className="flex items-start gap-2.5 rise">
                    <SubskillChip id={s.id} status={s.status} className="shrink-0" />
                    <div className="text-[12.5px] text-ink-soft leading-snug">
                      <span className="text-ink-muted">{STATUS_WORD[s.status]}</span>
                      {s.note && <span> · {s.note}</span>}
                    </div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <Eyebrow>Help used</Eyebrow>
              <div className="mt-2 text-[12.5px] text-ink-soft">
                {helpUsed.length === 0
                  ? "None yet."
                  : helpUsed.map((h) => (h === "example" ? "Parallel example" : h === "hint" ? "Ways-in hint" : "Short video")).join(" · ")}
                <span className="text-ink-muted"> — noted, not penalised.</span>
              </div>
            </section>

            {done && (
              <section className="rounded-xl border border-sound-line bg-sound-soft px-4 py-3 text-[13px] text-ink rise">
                Complete. The only slip was in reading off the signs, and you caught it yourself. The exact-form justification at the end is the kind of thing that shows up in {SUBSKILL_MAP.fractions.name.toLowerCase()} on your teacher's view.
              </section>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
