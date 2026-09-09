"use client";

import { useEffect, useRef, useState } from "react";
import ProblemCard from "@/components/ProblemCard";
import { Button, Eyebrow } from "@/components/ui";
import { categoryName, categoryOf, leafName, type CategoryId, type LeafId } from "@/data/taxonomy";
import { useAssignment } from "@/lib/classroom-store";
import { categoriesTouched, leavesTouched } from "@/lib/hierarchy";
import { warmupFocus, type SessionAction, type StudentSession } from "@/lib/session";
import type { WarmupMessage } from "@/lib/warmup";

const FIRST_PROMPT = "let's figure out what skills to warm up on. first, select problems that you don't feel confident in.";

/**
 * The warm-up chooser. Left: the problems, selectable, over the set's skills by category. Right: a
 * short chat that asks for a selection, then for the student's own words; the two combine into a
 * focus (light blue) and one warm-up problem.
 */
export default function WarmupPickScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const { problems } = useAssignment();
  const w = session.warmup;
  const focus = warmupFocus(session);
  const skills = leavesTouched(problems).filter((l) => !l.startsWith("communication."));
  const byCategory = categoriesTouched(problems)
    .filter((c) => c !== "communication")
    .map((c) => ({ c, leaves: skills.filter((l) => categoryOf(l) === c) }))
    .filter((g) => g.leaves.length > 0);
  const picked = problems.filter((p) => w.selected.includes(p.id)).map((p) => p.label);
  const said = w.messages.some((m) => m.from === "student");

  const transcript: WarmupMessage[] = [{ from: "tutor", text: FIRST_PROMPT }];
  if (picked.length > 0 && !said) transcript.push({ from: "tutor", text: `${picked.join(", ")}. now say in your own words what you want to warm up on.` });
  transcript.push(...w.messages);

  return (
    <div className="grid h-full min-h-0 grid-cols-2" data-warmup-pick>
      <div className="flex min-h-0 flex-col border-r border-line">
        <section className="flex min-h-0 flex-1 flex-col px-7 pt-6">
          <Eyebrow>Problems</Eyebrow>
          <ol className="mt-3 grid min-h-0 grid-cols-2 gap-3 overflow-y-auto pb-3">
            {problems.map((p) => (
              <li key={p.id}>
                <ProblemCard problem={p} selected={w.selected.includes(p.id)} onToggle={() => dispatch({ type: "warmup/select", problem: p.id })} highlight={focus} />
              </li>
            ))}
          </ol>
        </section>
        <section className="max-h-[42%] shrink-0 overflow-y-auto border-t border-line px-7 py-4" data-skills>
          <Eyebrow>Skills</Eyebrow>
          <div className="mt-2.5 space-y-2">
            {byCategory.map(({ c, leaves }) => (
              <SkillRow key={c} category={c} leaves={leaves} focus={focus} />
            ))}
          </div>
        </section>
      </div>

      <Chat transcript={transcript} canSend={picked.length > 0 || said} focus={focus} onSay={(text) => dispatch({ type: "warmup/say", text })} onBegin={() => dispatch({ type: "warmup/begin" })} />
    </div>
  );
}

function SkillRow({ category, leaves, focus }: { category: CategoryId; leaves: LeafId[]; focus: LeafId[] }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-[88px] shrink-0 pt-1.5 text-[10.5px] uppercase tracking-wide text-ink-muted">{categoryName(category).name}</span>
      <ul className="flex flex-wrap justify-center gap-1.5">
        {leaves.map((id) => {
          const on = focus.includes(id);
          return (
            <li key={id} data-skill={id} data-focus={on || undefined} className={`rounded-full border px-2.5 py-[3px] text-[12px] transition-colors ${on ? "border-standout-line bg-standout-soft text-standout" : "border-line bg-paper text-ink-soft"}`}>
              {leafName(id).name}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Chat({ transcript, canSend, focus, onSay, onBegin }: { transcript: WarmupMessage[]; canSend: boolean; focus: LeafId[]; onSay: (t: string) => void; onBegin: () => void }) {
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLLIElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [transcript.length]);
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    onSay(t);
    setDraft("");
  };
  return (
    <section className="flex min-h-0 flex-col px-7 py-6" data-chat>
      <Eyebrow>Warm-up</Eyebrow>
      <ol className="mt-3 min-h-0 flex-1 space-y-2.5 overflow-y-auto pr-1">
        {transcript.map((m, i) => (
          <li key={i} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`} data-from={m.from}>
            <span className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[14.5px] leading-snug ${m.from === "student" ? "bg-ink text-white" : "border border-line bg-paper text-ink"}`}>{m.text}</span>
          </li>
        ))}
        <li ref={end} aria-hidden />
      </ol>
      <div className="mt-3 flex items-end gap-2 border-t border-line pt-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          disabled={!canSend}
          rows={2}
          placeholder={canSend ? "in your own words…" : "select a problem first"}
          aria-label="Say what you want to warm up on"
          className="min-h-[52px] flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-2.5 text-[14.5px] text-ink placeholder:text-ink-muted focus:border-ink-muted focus:outline-none disabled:opacity-60"
        />
        <Button variant="secondary" onClick={send} disabled={!canSend || draft.trim() === ""}>
          send
        </Button>
      </div>
      <div className="mt-3 flex justify-end">
        <Button variant="accent" size="lg" onClick={onBegin} disabled={focus.length === 0} data-begin>
          warm up on these →
        </Button>
      </div>
    </section>
  );
}
