"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Button, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { useReorder } from "@/components/useReorder";
import { ASSIGNMENT, PROBLEM_MAP } from "@/data/assignment";
import { dispatchClassroom, useClassroom } from "@/lib/classroom-store";
import { useAssignmentBundle } from "../AssignmentContext";
import { FOLLOW_MODE_WORD, type FollowMode } from "@/lib/classroom";
import { candidatesFor, MAX_EXAMPLES, optionOf, optionsFor, problemsByStruggle, suggestExamples, type ExampleRef, type PickerContext } from "@/lib/examples";
import ExamplePicker from "./ExamplePicker";
import { moveItem } from "@/lib/reorder";
import { useBatchedSession } from "@/lib/store";

const PRECHECK = 3;

/**
 * The private setup for whole-class review: which problems, and which 2–3 examples per problem.
 * An example is chosen by mistake, not by name (ticket 148): the suggestion is the correct working
 * then the most common exact mistakes, and each slot's menu lists the problem's mistakes with
 * their counts. Names and correctness show here and nowhere near the projector. What the students' screens do
 * (frozen or write with me) starts unchosen: both options empty, Project faded until one is picked;
 * pressing it anyway turns its label to "select one" and flashes the two options light blue once.
 * The problem list ranks by how many struggled, for choosing; the example cards on the right
 * stand in the order the class will see, the assignment's by default, and a press held on a
 * card drags it to another place in that order (ticket 150, `useReorder`).
 */
export default function WholeClassSetup() {
  const router = useRouter();
  const { session } = useBatchedSession(3000);
  const assignment = useAssignmentBundle();
  const { problems, newSkills } = assignment;
  const ctx: PickerContext = { newSkills, group: useClassroom().group ?? null };
  const ranked = problemsByStruggle(session).filter((r) => problems.some((p) => p.id === r.problem.id));
  const [chosen, setChosen] = useState<string[] | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ExampleRef[]>>({});
  /** What the students' screens do: no default (ticket 146), the teacher picks one before Project comes on. */
  const [mode, setMode] = useState<FollowMode | null>(null);
  /** How many times Project was pressed with no mode chosen: the button reads "select one" and the options flash (each press restarts the flash). */
  const [nudge, setNudge] = useState(0);
  const chosenIds = chosen ?? ranked.slice(0, PRECHECK).map((r) => r.problem.id);
  const toggle = (id: string) => setChosen(chosenIds.includes(id) ? chosenIds.filter((x) => x !== id) : [...chosenIds, id]);
  const examplesFor = (pid: string) => overrides[pid] ?? suggestExamples(candidatesFor(pid, session), MAX_EXAMPLES, ctx);
  /** Every problem in the order the class will see them: the assignment's until the teacher drags a card. An unticked problem keeps its place for when it is ticked again. */
  const [order, setOrder] = useState<string[]>(() => ASSIGNMENT.problems.map((p) => p.id));
  const ordered = order.filter((id) => chosenIds.includes(id));
  const reorder = useReorder({
    count: ordered.length,
    name: (i) => PROBLEM_MAP[ordered[i]]?.label ?? `Problem ${i + 1}`,
    onMove: (from, to) => {
      // The chosen cards move among themselves; the unticked keep their slots in the full order.
      const moved = moveItem(ordered, from, to);
      setOrder((o) => {
        let k = 0;
        return o.map((id) => (chosenIds.includes(id) ? moved[k++] : id));
      });
    },
  });

  const swap = (pid: string, at: number, ref: ExampleRef) => {
    const next = [...examplesFor(pid)];
    next[at] = ref;
    setOverrides((o) => ({ ...o, [pid]: next }));
  };

  const project = () => {
    if (!mode) return;
    const examples = Object.fromEntries(ordered.map((id) => [id, examplesFor(id)]));
    dispatchClassroom({ type: "wc/setup", problems: ordered, examples, mode });
    dispatchClassroom({ type: "wc/project" });
    router.push("/teacher/board");
  };

  return (
    <TeacherChrome>
      <Eyebrow>
        {assignment.className} · {assignment.title}
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
              const flash = !mode && nudge > 0;
              return (
                <button
                  key={`${m}:${nudge}`}
                  type="button"
                  onClick={() => setMode(m)}
                  aria-pressed={on}
                  data-mode={m}
                  data-flash={flash || undefined}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-ink bg-paper" : "border-line bg-paper hover:border-ink-muted"} ${flash ? "choose-flash" : ""}`}
                >
                  <span className={`grid h-4 w-4 shrink-0 place-items-center rounded-full border ${on ? "border-ink" : "border-line-strong"}`} aria-hidden>
                    {on && <span className="h-2 w-2 rounded-full bg-ink" />}
                  </span>
                  <span className="text-[13.5px] font-medium text-ink">{FOLLOW_MODE_WORD[m]}</span>
                  <span className="min-w-0 flex-1 text-[12px] text-ink-muted">{detail}</span>
                </button>
              );
            })}
          </div>
          <p className="mt-2 text-[12px] text-ink-muted">{mode ? "You can change this per problem from the board." : "Choose one to project."}</p>
          <div className="mt-5 flex justify-end">
            {/* With no mode chosen the button looks off but still takes the press: it answers "select one" and the options flash. Truly off only with no problem checked. */}
            <Button
              size="lg"
              disabled={ordered.length === 0}
              aria-disabled={!mode || undefined}
              className={mode ? "" : "opacity-40"}
              onClick={() => (mode ? project() : setNudge((n) => n + 1))}
              data-project
              data-nudged={(!mode && nudge > 0) || undefined}
            >
              {!mode && nudge > 0 ? "select one" : "Project"}
            </Button>
          </div>
        </Card>

        <div className="space-y-4" data-wc-order={ordered.join(" ")} data-dragging={reorder.drag ? reorder.drag.from + 1 : undefined}>
          {ordered.map((pid, i) => {
            const p = PROBLEM_MAP[pid];
            const cands = candidatesFor(pid, session);
            const options = optionsFor(cands, ctx);
            const refs = examplesFor(pid);
            /** The options already in a slot: no menu offers them again (ticket 157). */
            const taken = refs.flatMap((r) => { const o = optionOf(options, r.studentId); return o ? [o.key] : []; });
            return (
              <div key={pid} {...reorder.item(i)}>
              <Card className="overflow-hidden" data-wc-examples={pid} data-wc-slot={reorder.slot(i) + 1}>
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
                    return <ExamplePicker key={r.studentId} letter={"ABC"[i]} candidate={c} options={options} taken={taken} onPick={(ref) => swap(pid, i, ref)} />;
                  })}
                </div>
              </Card>
              </div>
            );
          })}
          <p className="sr-only" aria-live="polite" data-announce>
            {reorder.announced}
          </p>
        </div>
      </div>
    </TeacherChrome>
  );
}
