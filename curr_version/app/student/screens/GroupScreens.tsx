"use client";

import M from "@/components/Math";
import { Avatar, Button, Card, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { groupPlan } from "@/lib/group";
import type { SessionAction, StudentSession } from "@/lib/session";

function Members({ members, me }: { members: { id: string; name: string; initials: string }[]; me: string }) {
  return (
    <ul className="flex flex-nowrap gap-2">
      {members.map((m) => (
        <li key={m.id} className="flex items-center gap-2 rounded-full border border-line bg-paper py-1 pl-1 pr-3 text-[13px] text-ink">
          <Avatar initials={m.initials} size="h-6 w-6 text-[10px]" />
          {m.id === me ? "You" : m.name}
        </li>
      ))}
    </ul>
  );
}

/** Phase one: the problems every member got right, passed over quickly. */
export function GroupPassScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const g = groupPlan(session);
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-8">
      <Eyebrow>Group review · quick pass</Eyebrow>
      <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">
        {g.quickPass.length === 0 ? "Nothing to pass over quickly" : `Everyone got ${g.quickPass.map((p) => p.label).join(" and ")}`}
      </h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Your group is the three people whose slips overlap with yours most. First, the problems all four of you got right: a quick look at the last line each, then on to what's worth talking about.
      </p>
      <div className="mt-4">
        <Members members={g.members} me="sam" />
      </div>

      <div className="mt-6 space-y-3">
        {g.quickPass.map((p) => (
          <Card key={p.id} className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-display text-[22px] text-ink">{p.label}</span>
                <DifficultyTag d={p.difficulty} />
              </div>
              <span className="math-lg text-ink">
                <M tex={p.tex} />
              </span>
            </div>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-secure-line bg-secure-soft px-4 py-3">
              <span className="text-[13px] text-ink-soft">All four of you landed on</span>
              <span className="text-[17px] text-ink">
                <M tex={p.solution[p.solution.length - 1].tex} />
              </span>
            </div>
            <p className="mt-3 text-[12.5px] text-ink-muted">Anything one of you did differently on the way there is worth thirty seconds. Then move on.</p>
          </Card>
        ))}
        {g.quickPass.length === 0 && (
          <Card className="p-5 text-[14px] text-ink-soft">No problem was right for all four of you, so everything goes to the discussion.</Card>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[12.5px] text-ink-muted">
          {g.discussion.problems.length} {g.discussion.problems.length === 1 ? "problem" : "problems"} to talk through next.
        </span>
        <Button size="lg" onClick={() => dispatch({ type: "group/discuss" })}>
          On to the discussion →
        </Button>
      </div>
    </div>
  );
}

const PROMPTS = [
  "Where did each of you go wrong? Is it the same place?",
  "What's the one check that would have caught it?",
  "Rewrite the line that went wrong, together.",
];

/** Phase two: the union of wrongs. No correctness markers, only one shared count. */
export function GroupDiscussScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const g = groupPlan(session);
  const d = g.discussion;
  const allTalked = d.problems.every((p) => session.talked.includes(p.id));
  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-8">
      <Eyebrow>Group review · discussion</Eyebrow>
      <h1 className="font-display mt-2 text-[30px] leading-tight text-ink">Between the four of you, these went wrong</h1>
      <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">
        Nobody's work is marked here. Across the group that's {d.totalWrong} slips over {d.problems.length} problems: you've each gotten about {d.perMember} of these wrong. Talk each one through and tick it off.
      </p>
      <div className="mt-3">
        <Members members={g.members} me="sam" />
      </div>

      <ol className="mt-5 space-y-2.5" data-discussion>
        {d.problems.map((p) => {
          const talked = session.talked.includes(p.id);
          return (
            <li key={p.id}>
              <Card className={`px-5 py-4 ${talked ? "border-accent-line" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-display text-[22px] text-ink">{p.label}</span>
                    <DifficultyTag d={p.difficulty} />
                    <span className="ml-2 text-[18px] text-ink">
                      <M tex={p.tex} />
                    </span>
                  </div>
                  <Button variant={talked ? "accent" : "secondary"} className="whitespace-nowrap" onClick={() => dispatch({ type: "group/talked", problem: p.id })} aria-pressed={talked}>
                    {talked ? "✓ Talked through" : "Talked through"}
                  </Button>
                </div>
                <ul className="mt-2.5 grid grid-cols-3 gap-2">
                  {PROMPTS.map((q) => (
                    <li key={q} className="rounded-lg border border-line bg-cream-deep/50 px-3 py-1.5 text-[12px] leading-snug text-ink-soft">
                      {q}
                    </li>
                  ))}
                </ul>
              </Card>
            </li>
          );
        })}
      </ol>

      <div className="mt-auto flex items-center justify-between pt-6">
        <span className="text-[12.5px] text-ink-muted">Your report is next, with the same colours your teacher sees.</span>
        <Button size="lg" variant={allTalked ? "accent" : "primary"} onClick={() => dispatch({ type: "group/done" })}>
          Finish group review →
        </Button>
      </div>
    </div>
  );
}
