"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { assignmentHref, studentRecord } from "@/lib/assignments";
import TeacherChrome, { TEACHER_ZOOM } from "../TeacherChrome";
import FitText from "@/components/FitText";
import { WorkLines, WorkPanel } from "@/components/HierarchyDrill";
import M from "@/components/Math";
import OutcomeTiles from "@/components/OutcomeTiles";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import SkillColumns from "@/components/SkillColumns";
import StatusKey from "@/components/StatusKey";
import { DifficultyTag } from "@/components/Tag";
import { DEMO_STUDENT } from "@/data/assignment";
import { groupName, type LeafId } from "@/data/taxonomy";
import { useClassroom } from "@/lib/classroom-store";
import { commentaryFor } from "@/lib/commentary";
import { columnsOf, labelSentence, OUTCOME_LABEL, outcomeOf, recordReviews, reportFacts, sessionReviews, shownVersions, unsolvedOf, type Reviews, type ShownVersion } from "@/lib/report";
import { pressWork, type ReportWork } from "@/lib/reportWork";
import { classmateEvidence, hierarchyFor, leavesBehind, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { useBatchedSession } from "@/lib/store";
import { useEscape } from "@/components/useEscape";
import { BackButton, useAssignmentBundle } from "../AssignmentContext";

/**
 * The individual view: one student, opened from their name on the class view (`student` from
 * the page's `?student=`; the demo student when absent or unknown). Skills on the left as the
 * class view's full dot view (see dot skills): one column per category, every group's skills out,
 * and fixed that way, nothing to open or close (ticket 169); a skill still shows its work. On the right
 * the platform's commentary as a few ideas in a light-blue bubble, and beneath it what the
 * student wrote back in a white box with a purple border. Clicking an idea lights only the
 * skills behind it; the same idea again shows everything. On a finished set (ticket 187)
 * everyone, Sam included, is their record on it: their notes and their words.
 * The page sits at 125% of the teacher side's size (ticket 227).
 *
 * Beneath the skills, What happened (ticket 243): the student report's Q tiles, a column per review stage,
 * ★ on the live student's starred problems, and a line of how sure they were (with practice and caution on
 * the live set). A tile or a skill row shows its working in the skills card's place, the card keeping its
 * size; a problem's versions sit side by side, only those that tell its story (`shownVersions`). The key
 * sits at the foot of the right column, level with What happened. The page fits a laptop with nothing to scroll.
 */
export const REPORT_ZOOM = TEACHER_ZOOM * 1.25;

export default function TeacherReport({ student, work = null, from = null }: { student: string | null; work?: string | null; from?: string | null }) {
  return (
    <TeacherChrome zoom={REPORT_ZOOM}>
      <ReportBody student={student} work={work} from={from} />
    </TeacherChrome>
  );
}

/**
 * The report under whatever chrome holds it, for the set in the nearest `AssignmentContext`. `back` (ticket 237): shown
 * from a later set's history, the way back is a pulsing button above the eyebrow and there is no "← Class view" to this set.
 * From the student's holistic page (ticket 251) `work` opens on that problem's working and `from` is the holistic page,
 * which the back button returns to in place of "← Class view".
 */
export function ReportBody({ student, back, work: initialWork = null, from = null }: { student: string | null; back?: { href: string; label: string }; work?: string | null; from?: string | null }) {
  const { session } = useBatchedSession(2000);
  const assignment = useAssignmentBundle();
  const classroom = useClassroom();
  const { problems, pathway } = assignment;
  // The set's record of the student: a classmate's, or Sam's on a finished set; none for Sam on the live set, who is his session.
  const classmate = studentRecord(assignment, student ?? DEMO_STUDENT.id) ?? assignment.sam ?? undefined;
  const who = classmate ?? DEMO_STUDENT;
  const live = !classmate;
  const [idea, setIdea] = useState<number | null>(null);
  const [work, setWork] = useState<ReportWork>(() => (initialWork && problems.some((p) => p.id === initialWork) ? { kind: "problem", id: initialWork } : null));

  const evidence: Evidence = classmate ? classmateEvidence(classmate, problems) : session ? sessionEvidence(session) : { lines: {}, submitted: false, caution: [] };
  const full = hierarchyFor(evidence, assignment);
  const commentary = commentaryFor(who.id, session, classmate);
  const chosen = idea !== null ? commentary.ideas[idea] : undefined;
  const result = chosen ? restrictTo(full, leavesBehind(chosen.problems, evidence.lines, problems)) : full;
  const facts = live && session ? reportFacts(session) : null;
  const nothing = live && !session;
  const reviews: Reviews = classmate ? recordReviews(classmate, problems) : session ? sessionReviews(session, classroom.group, problems) : {};
  const columns = columnsOf(reviews, pathway, problems);
  const unsolved = unsolvedOf(reviews, pathway, problems);
  const openProblem = work?.kind === "problem" ? problems.find((p) => p.id === work.id) : undefined;
  // The line under the tiles: how sure they were before starting, and on the live set what practice and caution the run brought.
  const notes = nothing ? [] : [classmate ? labelSentence(classmate.confidence) : facts!.confidence, ...(facts?.practices ?? [])];
  const caution = facts?.caution ?? [];

  useEffect(() => {
    if (!work) return;
    const onPress = (e: MouseEvent) => {
      if (!(e.target instanceof Element) || !e.target.closest(KEEPS_WORK)) setWork(null);
    };
    document.addEventListener("click", onPress, true);
    return () => document.removeEventListener("click", onPress, true);
  }, [work]);
  // Escape closes the one opened last (ticket 247): the working, or the commentary idea's filter.
  useEscape(idea !== null, () => setIdea(null));
  useEscape(work !== null, () => setWork(null));

  return (
    <>
      {back && (
        <Link
          href={back.href}
          className="pulse-loop relative mb-4 inline-flex items-center rounded-md bg-accent-dark px-3.5 py-1.5 text-[14px] font-semibold text-white transition-colors hover:bg-accent-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          data-history-return
        >
          ← {back.label}
        </Link>
      )}
      {/* "← Class view" above the eyebrow (ticket 266), the Class View's own "← Edexia Classroom" button: unzoomed back to the Class View's
          scale, and raised by what the report's larger bar and top padding add (ticket 268: 20.2 screen px, 28 of the button's px), so the
          two sit in the same spot on screen, measured from the top of the window. */}
      {!back && (
        <div style={{ zoom: TEACHER_ZOOM / REPORT_ZOOM, marginTop: -28, "--back-zoom": TEACHER_ZOOM } as CSSProperties}>
          {from ? (
            <BackButton href={from} data-report-back="holistic">
              Holistic Assessment
            </BackButton>
          ) : (
            <BackButton href={assignmentHref(assignment.id, "class")} data-back-to-class data-report-back="class">
              Class view
            </BackButton>
          )}
        </div>
      )}
      <Eyebrow className={back ? undefined : "mt-[9.6px]"}>
        {assignment.className} · {assignment.title}
      </Eyebrow>
      {/* Flush under the eyebrow beneath the button (ticket 266): the name's tall line box keeps the air, and the button's row costs the page almost no height. */}
      <div className={`flex items-center gap-4${back ? " mt-3" : ""}`}>
        <Avatar initials={who.initials} size="h-12 w-12 text-[15px]" />
        <div>
          <H1>{who.name}</H1>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_440px] gap-6">
        <div className="space-y-4">
          <Card data-hierarchy>
            {/* The working takes the skills' place (ticket 243): the skills stay laid out underneath, hidden, so the card keeps its size and nothing below moves. */}
            <div className="relative">
              <div className={work ? "invisible" : ""} aria-hidden={work ? true : undefined} data-skills>
                <Eyebrow className="px-5 pt-5">Skills</Eyebrow>
                {nothing ? (
                  <p className="mt-3 px-5 text-[13.5px] text-ink-muted">Nothing yet</p>
                ) : (
                  <SkillColumns
                    key={idea ?? "all"}
                    result={result}
                    lines={evidence.lines}
                    problems={problems}
                    mode="expanded"
                    locked
                    pickedLeaf={work?.kind === "skill" ? work.leaf : null}
                    onPickLeaf={(leaf) => setWork((w) => pressWork(w, { kind: "skill", leaf }))}
                  />
                )}
              </div>
              {work && (
                <div className="absolute inset-0 overflow-y-auto p-5" data-report-work={work.kind === "problem" ? work.id : work.leaf}>
                  <div data-work-content>
                    <div className="flex items-start justify-between gap-4">
                      {openProblem ? (
                        <div className="min-w-0">
                          <Eyebrow>{OUTCOME_LABEL[outcomeOf(openProblem.id, reviews[openProblem.id], pathway)]}</Eyebrow>
                          <div className="mt-2 flex min-w-0 items-center gap-2.5">
                            <span className="font-display text-[18px] text-ink">{openProblem.label}</span>
                            <DifficultyTag d={openProblem.difficulty} />
                            <span className="block min-w-0 flex-1 text-ink-soft">
                              <FitText max={13} fitKey={openProblem.tex}>
                                <M tex={openProblem.tex} />
                              </FitText>
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div />
                      )}
                      <button type="button" onClick={() => setWork(null)} className="shrink-0 text-[13.5px] text-accent-deep hover:underline" data-work-close>
                        ← Skills
                      </button>
                    </div>
                    {openProblem ? (
                      <Versions problem={openProblem.id} versions={shownVersions(openProblem.id, reviews[openProblem.id], pathway)} onGoTo={(leaf) => setWork({ kind: "skill", leaf })} />
                    ) : work.kind === "skill" ? (
                      <div className="-mt-5">
                        <WorkPanel leaf={work.leaf} lines={evidence.lines} problems={problems} status={full.leaves[work.leaf] ?? "unseen"} wide onGoTo={(leaf) => setWork({ kind: "skill", leaf })} />
                      </div>
                    ) : null}
                    {openProblem && unsolved.some((p) => p.id === openProblem.id) && <p className="mt-2 text-[12px] leading-snug text-ink-muted">Not solved in group review</p>}
                  </div>
                </div>
              )}
            </div>
          </Card>

          <Card className="px-5 py-4" data-outcomes>
            {/* The notes share the eyebrow's row, right-aligned, so the card is no taller than the tiles need. */}
            <div className="flex items-baseline justify-between gap-6">
              <Eyebrow className="shrink-0">What happened</Eyebrow>
              {notes.length > 0 && (
                <p className="flex min-w-0 flex-wrap justify-end gap-x-4 gap-y-0.5 text-right text-[12.5px] text-ink-muted" data-report-notes>
                  {notes.map((n, i) => (
                    <span key={i}>{n}</span>
                  ))}
                  {caution.length > 0 && (
                    <span className="text-gap" data-caution>
                      Caution · {caution.map((id) => groupName(id).name.toLowerCase()).join(", ")} · practice twice
                    </span>
                  )}
                </p>
              )}
            </div>
            {nothing ? (
              <p className="mt-2 text-[13.5px] text-ink-muted">Nothing yet</p>
            ) : (
              <OutcomeTiles
                columns={columns}
                unsolved={unsolved}
                open={work?.kind === "problem" ? work.id : null}
                onPress={(id) => setWork((w) => pressWork(w, { kind: "problem", id }))}
                describe={() => "see their working"}
                starred={live && session ? session.stars : []}
                lit={chosen ? chosen.problems : null}
                noteFloor={TEACHER_NOTE_FLOOR}
              />
            )}
          </Card>
        </div>

        <div className="flex flex-col gap-3">
          <div className="rounded-2xl rounded-tl-md border border-standout-line bg-standout-soft px-6 py-4" data-commentary>
            <Eyebrow className="text-standout">Commentary</Eyebrow>
            {commentary.ideas.length === 0 ? (
              <p className="mt-3 text-[14px] text-ink-muted">{nothing ? "Nothing yet" : "Nothing to note"}</p>
            ) : (
              <ul className="mt-2 space-y-1">
                {commentary.ideas.map((it, n) => {
                  const active = idea === n;
                  return (
                    <li key={n}>
                      <button
                        type="button"
                        onClick={() => setIdea(active ? null : n)}
                        aria-pressed={active}
                        title="Show only the skills behind this"
                        className={`w-full rounded-xl px-3 py-1 text-left text-[15px] leading-snug transition-colors ${active ? "bg-paper text-ink shadow-card" : "text-ink hover:bg-paper/70"}`}
                        data-idea={n}
                      >
                        <span className="lowercase">{it.text}</span>
                        <span className="ml-2 text-[12px] uppercase tracking-wide text-standout">{it.problems.map((id) => problems.find((p) => p.id === id)?.label ?? id).join(" ")}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <div className="rounded-2xl border-2 border-accent bg-paper px-6 py-4" data-clarification>
            <Eyebrow className="text-accent-deep">In their words</Eyebrow>
            {commentary.clarification ? (
              <blockquote className="font-display mt-2 text-[19px] leading-snug text-ink" data-reflection>
                “{commentary.clarification}”
              </blockquote>
            ) : (
              <p className="mt-3 text-[14px] text-ink-muted">Not sent yet</p>
            )}
          </div>
          {/* The key at the column's foot, level with What happened's (ticket 243). */}
          <div className="mt-auto px-6" data-report-key>
            <Eyebrow>Key</Eyebrow>
            <StatusKey className="mt-3" split />
          </div>
        </div>
      </div>
    </>
  );
}

/** Incorrect's narrowest with the not-solved note: wide enough for "Q7 not solved in group review" on one line, keeping the card one row shorter. */
const TEACHER_NOTE_FLOOR = 190;

/** What keeps the working open when pressed: the working itself, a Q tile, a skill row. */
const KEEPS_WORK = "[data-work-content], [data-work-tile], [data-hierarchy] button[data-node]";

/** A problem's versions side by side, first submission on the left (ticket 243), each fitted to its column. */
function Versions({ problem, versions, onGoTo }: { problem: string; versions: ShownVersion[]; onGoTo: (leaf: LeafId) => void }) {
  return (
    <div className="mt-4 grid gap-3" style={{ gridTemplateColumns: `repeat(${versions.length}, minmax(0, 1fr))` }} data-versions={versions.length}>
      {versions.map((v) => (
        <section key={v.kind} className="min-w-0 rounded-xl border border-line bg-paper p-3" data-version={v.kind}>
          <Eyebrow>{v.label}</Eyebrow>
          <WorkLines problem={problem} texs={v.lines} onGoTo={onGoTo} narrow />
        </section>
      ))}
    </div>
  );
}
