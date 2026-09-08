"use client";

import M from "@/components/Math";
import type { HelpContent } from "@/data/chat";

export type HelpKind = "example" | "hint" | "video";

const OPTIONS: { kind: HelpKind; label: string; blurb: string; icon: string }[] = [
  { kind: "example", label: "Show me a similar example", blurb: "A parallel problem, worked. Different numbers.", icon: "≡" },
  { kind: "hint", label: "Give me a hint", blurb: "A few questions to get you started. No answer.", icon: "?" },
  { kind: "video", label: "Play a short video", blurb: "The idea, in under two minutes.", icon: "▶" },
];

export function HelpPicker({ onPick, picked }: { onPick: (k: HelpKind) => void; picked: HelpKind | null }) {
  return (
    <div className="rounded-2xl border border-accent-line bg-accent-soft/60 p-4">
      <div className="text-[12.5px] text-ink">Want another way in?</div>
      <div className="mt-2.5 grid gap-1.5">
        {OPTIONS.map((o, i) => (
          <button
            key={o.kind}
            onClick={() => onPick(o.kind)}
            className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
              picked === o.kind ? "border-ink bg-ink text-white" : "border-line bg-paper hover:border-ink-muted"
            }`}
          >
            <span className={`grid place-items-center h-7 w-7 rounded-full text-[12px] ${picked === o.kind ? "bg-white/15" : "bg-accent-soft text-accent-deep"}`}>{o.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="block text-[13px] font-medium">{o.label}</span>
              <span className={`block text-[11.5px] ${picked === o.kind ? "text-white/70" : "text-ink-muted"}`}>{o.blurb}</span>
            </span>
            {i === 0 && picked !== o.kind && <span className="text-[10.5px] text-accent-deep">suggested</span>}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HelpContentView({ kind, help }: { kind: HelpKind; help: HelpContent }) {
  if (kind === "example") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-4 rise">
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-muted font-semibold">{help.example.title}</div>
        <p className="mt-1.5 text-[13px] text-ink-soft">{help.example.intro}</p>
        <ol className="mt-3 space-y-2.5">
          {help.example.steps.map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 w-4 text-[11px] text-ink-muted tabular-nums">{i + 1}</span>
              <div>
                <div><M tex={s.tex} /></div>
                <div className="text-[12px] text-ink-muted mt-0.5">{s.note}</div>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[13px] text-ink border-t border-line pt-3">{help.example.outro}</p>
      </div>
    );
  }
  if (kind === "hint") {
    return (
      <div className="rounded-2xl border border-line bg-paper p-4 rise">
        <div className="text-[11px] uppercase tracking-[0.12em] text-ink-muted font-semibold">{help.hint.title}</div>
        <p className="mt-1.5 text-[13px] text-ink-soft">{help.hint.intro}</p>
        <ul className="mt-3 space-y-2">
          {help.hint.waysIn.map((w, i) => (
            <li key={i} className="flex items-start gap-3 rounded-xl border border-line bg-cream/60 px-3 py-2.5 text-[13px] text-ink leading-snug">
              <span className="grid place-items-center h-5 w-5 shrink-0 rounded-full bg-accent-soft text-accent-deep text-[11px]">{i + 1}</span>
              {w}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="rounded-2xl border border-line bg-paper p-4 rise">
      <div className="text-[11px] uppercase tracking-[0.12em] text-ink-muted font-semibold">Video · {help.video.duration}</div>
      <div className="mt-2 aspect-video rounded-xl bg-ink relative overflow-hidden">
        <div className="absolute inset-0 hero-glow opacity-60" />
        <div className="absolute inset-0 grid place-items-center">
          <span className="grid place-items-center h-12 w-12 rounded-full bg-white/90 text-ink text-[16px] pl-1">▶</span>
        </div>
        <div className="absolute left-4 right-4 bottom-3 text-white/90 text-[12.5px] font-medium">{help.video.title}</div>
        <div className="absolute left-4 right-4 bottom-1.5 h-0.5 bg-white/20"><div className="h-full w-[3%] bg-white/80" /></div>
      </div>
      <ul className="mt-3 space-y-1">
        {help.video.chapters.map((c) => (
          <li key={c.at} className="flex gap-3 text-[12.5px]"><span className="text-ink-muted tabular-nums w-8">{c.at}</span><span className="text-ink-soft">{c.label}</span></li>
        ))}
      </ul>
      <p className="mt-3 text-[12.5px] text-ink-muted border-t border-line pt-3">{help.video.note}</p>
    </div>
  );
}
