"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeacherChrome from "../../TeacherChrome";
import PathwayMap from "./PathwayMap";
import M from "@/components/Math";
import { Button, Card, Eyebrow, H1 } from "@/components/ui";
import { DifficultyTag, LeafChip } from "@/components/Tag";
import { ASSIGNMENT, PROBLEMS, unitLabel } from "@/data/assignment";
import type { Pathway } from "@/data/types";
import { dispatchClassroom } from "@/lib/classroom-store";
import { leavesTouched } from "@/lib/hierarchy";
import { DEFAULT_PATHWAY } from "@/lib/pathway";
import { inferUnitFromProblems, inferUnitFromText, UNIT_TITLES } from "@/lib/unit";

/** Create the assignment: title, problems from the bank, and the review pathway on the map. */
export default function NewAssignment() {
  const router = useRouter();
  const [title, setTitle] = useState(ASSIGNMENT.title);
  const [chosen, setChosen] = useState<string[]>(PROBLEMS.map((p) => p.id));
  const [pathway, setPathway] = useState<Pathway>(DEFAULT_PATHWAY);
  const [note, setNote] = useState("");
  const [reassessed, setReassessed] = useState<1 | 2 | 3 | 4 | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const toggle = (id: string) => {
    setChosen((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c, id]));
    setConfirmed(false);
  };
  const chosenProblems = PROBLEMS.filter((p) => chosen.includes(p.id));
  const inferred = reassessed ?? inferUnitFromProblems(chosenProblems);
  const ready = chosen.length > 0 && title.trim().length > 0 && confirmed;

  const reassess = () => {
    setReassessed(inferUnitFromText(note));
    setConfirmed(false);
  };
  const create = () => {
    if (!ready) return;
    dispatchClassroom({ type: "assignment/create", title: title.trim(), problemIds: PROBLEMS.map((p) => p.id).filter((id) => chosen.includes(id)), pathway, unit: inferred });
    router.push("/teacher");
  };

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {unitLabel(ASSIGNMENT.unit)}
      </Eyebrow>
      <H1 className="mt-3">New assignment</H1>

      <div className="mt-8 grid grid-cols-[420px_1fr] gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <Eyebrow>Title</Eyebrow>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-[14.5px] text-ink outline-none focus:border-accent"
              aria-label="Title"
              data-title
            />
            <div className="mt-3 text-[12.5px] text-ink-muted">
              {ASSIGNMENT.className} · due {ASSIGNMENT.due}
            </div>
          </Card>
          <Card className="p-5">
            <Eyebrow>Problems</Eyebrow>
            <ul className="mt-3 space-y-1.5">
              {PROBLEMS.map((p) => {
                const on = chosen.includes(p.id);
                return (
                  <li key={p.id}>
                    <button
                      type="button"
                      onClick={() => toggle(p.id)}
                      aria-pressed={on}
                      data-problem={p.id}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left transition-colors ${on ? "border-line bg-paper" : "border-dashed border-line-strong bg-transparent opacity-60"}`}
                    >
                      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[11px] ${on ? "bg-ink text-white" : "border border-line-strong text-ink-muted"}`}>{on ? "✓" : "+"}</span>
                      <span className="w-7 text-[13px] font-medium text-ink">{p.label}</span>
                      <span className="min-w-0 flex-1 overflow-hidden whitespace-nowrap text-[13.5px] text-ink">
                        <M tex={p.tex} />
                      </span>
                      <DifficultyTag d={p.difficulty} className="shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {leavesTouched(chosenProblems)
                .filter((l) => !l.startsWith("communication."))
                .map((id) => (
                  <LeafChip key={id} id={id} />
                ))}
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6" data-unit-focus>
            <div className="flex items-center justify-between">
              <Eyebrow>Unit focus</Eyebrow>
              {reassessed !== null && <span className="text-[11.5px] text-ink-muted">reassessed from your note</span>}
            </div>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <div className="font-display text-[22px] text-ink" data-unit-inferred>
                  Unit {inferred}
                </div>
                <div className="text-[13px] text-ink-soft">{UNIT_TITLES[inferred]}</div>
              </div>
              <Button variant={confirmed ? "accent" : "secondary"} onClick={() => setConfirmed(true)} aria-pressed={confirmed} data-unit-confirm>
                {confirmed ? "✓ Confirmed" : "Confirm"}
              </Button>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Not quite? describe the focus"
                aria-label="Describe the focus"
                className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-3 py-2 text-[13.5px] text-ink outline-none focus:border-accent"
                data-unit-note
              />
              <Button variant="ghost" onClick={reassess} disabled={!note.trim()} data-unit-reassess>
                Reassess
              </Button>
            </div>
          </Card>
          <Card className="p-6">
            <Eyebrow>Review pathway</Eyebrow>
            <div className="mt-4">
              <PathwayMap value={pathway} onChange={setPathway} />
            </div>
          </Card>
          <div className="flex items-center justify-end gap-3">
            <Button size="lg" disabled={!ready} onClick={create} data-create>
              Create
            </Button>
          </div>
        </div>
      </div>
    </TeacherChrome>
  );
}
