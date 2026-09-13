"use client";

import { useState } from "react";
import Link from "next/link";
import { assignmentHref, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import SkillColumns from "@/components/SkillColumns";
import StatusKey from "@/components/StatusKey";
import { DEMO_STUDENT, PROBLEMS } from "@/data/assignment";
import { CLASSMATE_MAP } from "@/data/classmates";
import { groupName } from "@/data/taxonomy";
import { commentaryFor } from "@/lib/commentary";
import { reportFacts } from "@/lib/report";
import { classmateEvidence, hierarchyFor, leavesBehind, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { useBatchedSession } from "@/lib/store";
import { useAssignmentBundle } from "../AssignmentContext";

/**
 * The individual view: one student, opened from their name on the class view (`student` from
 * the page's `?student=`; the demo student when absent or unknown). Skills on the left as the
 * class view's full dot view (see dot skills): one column per category, every group's skills out,
 * and fixed that way, nothing to open or close (ticket 169); a skill still shows its work. On the right
 * the platform's commentary as a few ideas in a light-blue bubble, and beneath it what the
 * student wrote back in a white box with a purple border. Clicking an idea lights only the
 * skills behind it; the same idea again shows everything. The demo student's report facts and
 * group-review notes follow beneath the skills; a classmate has none.
 */
export default function TeacherReport({ student }: { student: string | null }) {
  const { session } = useBatchedSession(2000);
  const assignment = useAssignmentBundle();
  const { problems, unitNumber: unit } = assignment;
  const classmate = student && student !== DEMO_STUDENT.id ? CLASSMATE_MAP[student] : undefined;
  const who = classmate ?? DEMO_STUDENT;
  const live = !classmate;
  const [idea, setIdea] = useState<number | null>(null);

  const evidence: Evidence = classmate ? classmateEvidence(classmate, problems) : session ? sessionEvidence(session) : { lines: {}, submitted: false, caution: [] };
  const full = hierarchyFor(evidence, problems);
  const commentary = commentaryFor(who.id, session);
  const chosen = idea !== null ? commentary.ideas[idea] : undefined;
  const result = chosen ? restrictTo(full, leavesBehind(chosen.problems, evidence.lines, problems)) : full;
  const facts = live && session ? reportFacts(session) : null;
  const nothing = live && !session;

  return (
    <TeacherChrome>
      <Eyebrow>
        {assignment.className} · {assignment.title}
      </Eyebrow>
      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={who.initials} size="h-12 w-12 text-[15px]" />
          <div>
            <H1>{who.name}</H1>
          </div>
        </div>
        <Link href={assignmentHref(LIVE_ASSIGNMENT_ID, "class")} className="text-[13.5px] text-accent-deep hover:underline">
          ← Class view
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_440px] gap-6">
        <div className="space-y-5">
          <Card data-hierarchy>
            <Eyebrow className="px-5 pt-5">Skills</Eyebrow>
            {nothing ? <p className="mt-3 px-5 text-[13.5px] text-ink-muted">Nothing yet</p> : <SkillColumns key={idea ?? "all"} result={result} lines={evidence.lines} problems={problems} unit={unit} mode="expanded" locked />}
            <StatusKey className="mx-5 mb-5 max-w-xs border-t border-line pt-3" />
          </Card>

          {live && (
            <div className="grid grid-cols-2 gap-5">
              <Card className="p-5">
                <Eyebrow>What happened</Eyebrow>
                {facts ? (
                  <ul className="mt-2 space-y-1.5 text-[13.5px] text-ink-soft">
                    <li>{facts.confidence}</li>
                    <li>
                      {facts.slipped} of {facts.total} problems with a slip
                    </li>
                    <li>{facts.reworked.length ? `Reworked ${facts.reworked.join(", ")}` : "No rework yet"}</li>
                    {facts.practices.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                    {facts.caution.length > 0 && (
                      <li className="text-gap" data-caution>
                        Caution · {facts.caution.map((id) => groupName(id).name.toLowerCase()).join(", ")} · practice twice
                      </li>
                    )}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13.5px] text-ink-muted">Nothing yet</p>
                )}
              </Card>
              <Card className="p-5">
                <Eyebrow>In group review</Eyebrow>
                {facts && facts.groupNotes.length > 0 ? (
                  <ul className="mt-2 space-y-2" data-group-notes>
                    {facts.groupNotes.map((n) => (
                      <li key={n.label} className="text-[13.5px] text-ink" data-group-note={n.label}>
                        <span className="font-medium">{n.label}</span> <span className="text-ink-muted">· {n.prompt === "own" ? "their own mistake" : "their peers' likely mistake"}</span>
                        <p className="mt-0.5 text-ink-soft">“{n.text}”</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13.5px] text-ink-muted">Nothing written yet</p>
                )}
                <Eyebrow className="mt-5">Starred</Eyebrow>
                {facts && facts.stars.length > 0 ? (
                  <ul className="mt-2 space-y-1.5">
                    {facts.stars.map((label) => {
                      const p = PROBLEMS.find((q) => q.label === label)!;
                      return (
                        <li key={label} className="flex items-center gap-2 text-[13.5px] text-ink">
                          <span aria-hidden>★</span> {label}
                          <span className="text-ink-muted">
                            <M tex={p.tex} />
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="mt-2 text-[13.5px] text-ink-muted">None</p>
                )}
              </Card>
            </div>
          )}
        </div>

        <div className="space-y-4 self-start">
          <div className="rounded-2xl rounded-tl-md border border-standout-line bg-standout-soft px-6 py-5" data-commentary>
            <Eyebrow className="text-standout">Commentary</Eyebrow>
            {commentary.ideas.length === 0 ? (
              <p className="mt-3 text-[14px] text-ink-muted">{nothing ? "Nothing yet" : "Nothing to note"}</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {commentary.ideas.map((it, n) => {
                  const active = idea === n;
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => setIdea(active ? null : n)}
                        aria-pressed={active}
                        title="Show only the skills behind this"
                        className={`w-full rounded-xl px-3 py-2 text-left text-[15px] leading-snug transition-colors ${active ? "bg-paper text-ink shadow-card" : "text-ink hover:bg-paper/70"}`}
                        data-idea={n}
                      >
                        <span className="lowercase">{it.text}</span>
                        <span className="ml-2 text-[12px] uppercase tracking-wide text-standout">{it.problems.map((id) => PROBLEMS.find((p) => p.id === id)?.label ?? id).join(" ")}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border-2 border-accent bg-paper px-6 py-5" data-clarification>
            <Eyebrow className="text-accent-deep">In their words</Eyebrow>
            {commentary.clarification ? (
              <blockquote className="font-display mt-3 text-[21px] leading-snug text-ink" data-reflection>
                “{commentary.clarification}”
              </blockquote>
            ) : (
              <p className="mt-3 text-[14px] text-ink-muted">Not sent yet</p>
            )}
          </div>
        </div>
      </div>
    </TeacherChrome>
  );
}
