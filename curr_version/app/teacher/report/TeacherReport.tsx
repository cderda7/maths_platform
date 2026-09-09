"use client";

import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import M from "@/components/Math";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import HierarchyDrill from "@/components/HierarchyDrill";
import StatusKey from "@/components/StatusKey";
import { ASSIGNMENT, DEMO_STUDENT, PROBLEMS } from "@/data/assignment";
import { groupName } from "@/data/taxonomy";
import { reportFacts } from "@/lib/report";
import { sessionEvidence, sessionHierarchy } from "@/lib/hierarchy";
import { useBatchedSession } from "@/lib/store";
import { useAssignment } from "@/lib/classroom-store";

/** The demo student's report as the teacher sees it: subskill summary left, reflection right. */
export default function TeacherReport() {
  const { session } = useBatchedSession(2000);
  const { problems, unit } = useAssignment();
  const facts = session ? reportFacts(session) : null;
  const sent = !!session?.reportSent;

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {useAssignment().title}
      </Eyebrow>
      <div className="mt-3 flex items-end justify-between">
        <div className="flex items-center gap-4">
          <Avatar initials={DEMO_STUDENT.initials} size="h-12 w-12 text-[15px]" />
          <div>
            <H1>{DEMO_STUDENT.name}</H1>
          </div>
        </div>
        <Link href="/teacher" className="text-[13.5px] text-accent-deep hover:underline">
          ← Where the class is
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-[1fr_440px] gap-6">
        <div className="space-y-5">
          <Card className="p-5" data-hierarchy>
            <Eyebrow>Skills</Eyebrow>
            <div className="mt-3">
              {session ? <HierarchyDrill result={sessionHierarchy(session, problems)} lines={sessionEvidence(session).lines} problems={problems} unit={unit} /> : <p className="text-[13.5px] text-ink-muted">Nothing yet</p>}
            </div>
            <StatusKey className="mt-4 max-w-xs border-t border-line pt-3" />
          </Card>

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
              <Eyebrow>Starred</Eyebrow>
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
        </div>

        <Card className={`self-start p-6 ${sent ? "" : "border-dashed"}`}>
          <Eyebrow>In their words</Eyebrow>
          {sent ? (
            <>
              <blockquote className="font-display mt-3 text-[21px] leading-snug text-ink" data-reflection>
                {session?.reflection.trim() ? `“${session.reflection.trim()}”` : "Sent without a reflection."}
              </blockquote>
            </>
          ) : (
            <p className="mt-3 text-[14px] text-ink-muted">Not sent yet</p>
          )}
        </Card>
      </div>
    </TeacherChrome>
  );
}
