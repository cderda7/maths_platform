"use client";

import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { assignmentHref, assignmentStages, setClassReview, studentRecord, LIVE_ASSIGNMENT_ID } from "@/lib/assignments";
import { movedToClassReview } from "@/lib/decisionState";
import TeacherChrome, { TEACHER_ZOOM } from "../TeacherChrome";
import { WorkLines, WorkPanel } from "@/components/HierarchyDrill";
import ProblemQuestion from "@/components/ProblemQuestion";
import OutcomeTiles, { PRACTICE_DOT } from "@/components/OutcomeTiles";
import ClassReviewExamples from "@/components/ClassReviewExamples";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import SkillColumns from "@/components/SkillColumns";
import StatusKey from "@/components/StatusKey";
import { DifficultyTag } from "@/components/Tag";
import { DEMO_STUDENT } from "@/data/assignment";
import { groupName } from "@/data/taxonomy";
import { useClassroom } from "@/lib/classroom-store";
import { commentaryFor } from "@/lib/commentary";
import { columnsOf, labelSentence, OUTCOME_LABEL, outcomeOf, recordReviews, reportFacts, reportPathway, reviewStagesOver, sessionReviews, shownVersions, type OutcomeColumn, type Reviews, type ShownVersion } from "@/lib/report";
import { afterPracticeText, reportPracticeMarks, warmUpText } from "@/lib/practiceMarks";
import { pressWork, type ReportWork } from "@/lib/reportWork";
import { classmateEvidence, hierarchyFor, leavesBehind, restrictTo, sessionEvidence, type Evidence } from "@/lib/hierarchy";
import { useBatchedSession, useNow } from "@/lib/store";
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
    <TeacherChrome zoom={REPORT_ZOOM} fill>
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
  const now = useNow();
  const { problems } = assignment;
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
  // A record shows a review stage's versions once the class has finished that stage (ticket 244): all of them on a finished set.
  const over = reviewStagesOver(assignmentStages(assignment, classroom, session, now));
  // What class review covered (ticket 282): a finished set's record, the live set's board once class review is over; its column shows only then.
  const classReview = setClassReview(assignment, classroom, session);
  const pathway = reportPathway(assignment.pathway, classReview);
  // The questions the teacher moved to class review (ticket 337) are the live set's own: no group worked them, and class review covered them.
  const moved = assignment.id === LIVE_ASSIGNMENT_ID ? movedToClassReview(classroom) : [];
  const reviews: Reviews = classmate ? recordReviews(classmate, problems, over, classReview, moved) : session ? sessionReviews(session, classroom.group, problems, classReview, moved) : {};
  const columns = columnsOf(reviews, pathway, problems);
  const openProblem = work?.kind === "problem" ? problems.find((p) => p.id === work.id) : undefined;
  // Practice the student took on the live set (ticket 317): a marker on each question it came before, and the warm-up named once.
  const marks = reportPracticeMarks(assignment, classmate ?? null, session, now);
  const markers = Object.fromEntries(problems.flatMap((p) => { const text = afterPracticeText(marks.questions[p.id]); return text ? [[p.id, text]] : []; }));
  const markedLabels = problems.filter((p) => markers[p.id]).map((p) => p.label);
  const warmUp = warmUpText(marks.warmUp);
  // The line beside What happened: how sure they were before starting, the warm-up that followed, and on the live set any offer declined and caution.
  const notes = nothing ? [] : [classmate ? labelSentence(classmate.confidence) : facts!.confidence, ...(warmUp ? [warmUp] : []), ...(facts?.practices ?? [])];
  const caution = facts?.caution ?? [];

  // The page fills the laptop's height (ticket 244): the skills card takes whatever height the page leaves, so the
  // working that opens in its place has room for a problem's versions without scrolling. A style write, not state.
  const gridRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const grid = gridRef.current;
    const card = grid?.querySelector<HTMLElement>("[data-hierarchy]");
    const scroll = grid?.closest<HTMLElement>("[data-teacher-scroll]");
    if (!grid || !card || !scroll) return;
    const fill = () => {
      card.style.minHeight = "";
      // The frame's content, not its scrollHeight, which never reads less than the frame itself.
      const slack = scroll.clientHeight - ((scroll.firstElementChild as HTMLElement | null)?.offsetHeight ?? scroll.scrollHeight);
      // A pixel short of the frame: offsetHeight rounds, and a fractional pixel over would scroll.
      if (slack > 1) card.style.minHeight = `${card.offsetHeight + slack - 1}px`;
    };
    fill();
    const observer = new ResizeObserver(fill);
    // Whatever sizes the page apart from the card itself: the frame, the heading above the grid (its display font loads
    // late), the skills, What happened, the right column's boxes.
    const above = [...(grid.parentElement?.children ?? [])].filter((el) => el !== grid);
    for (const el of [scroll, ...above, ...grid.querySelectorAll("[data-skills], [data-outcomes], [data-commentary], [data-clarification], [data-report-key]")]) observer.observe(el);
    void document.fonts?.ready.then(fill);
    return () => observer.disconnect();
  }, [student, assignment.id, nothing]);

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

      <div ref={gridRef} className="mt-5 grid grid-cols-[1fr_440px] gap-6">
        <div className="flex flex-col gap-4">
          <Card className="flex flex-1 flex-col" data-hierarchy>
            {/* The working takes the skills' place (ticket 243): the skills stay laid out underneath, hidden, so the card keeps its size and nothing below moves. */}
            <div className="relative flex-1">
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
                          {/* The result, and beside it on its line the practice the question came after (ticket 317). */}
                          <div className="flex items-baseline gap-2.5 whitespace-nowrap">
                            <Eyebrow>{OUTCOME_LABEL[outcomeOf(openProblem.id, reviews[openProblem.id], pathway)]}</Eyebrow>
                            {markers[openProblem.id] && (
                              <span className="text-[12.5px] leading-none text-ink-muted" data-after-practice={openProblem.id}>
                                {markers[openProblem.id]}
                              </span>
                            )}
                          </div>
                          <div className="mt-2 flex min-w-0 items-baseline gap-2.5">
                            <span className="shrink-0 font-display text-[18px] text-ink">{openProblem.label}</span>
                            <span className="shrink-0 self-center">
                              <DifficultyTag d={openProblem.difficulty} />
                            </span>
                            {/* The whole question (ticket 271): the stem's words wrap, the expression never splits. */}
                            <p className="min-w-0 flex-1 text-[13px] leading-snug text-ink" data-work-question={openProblem.id}>
                              <ProblemQuestion problem={openProblem} />
                            </p>
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
                      <Versions problem={openProblem.id} versions={shownVersions(openProblem.id, reviews[openProblem.id], pathway)} />
                    ) : work.kind === "skill" ? (
                      <div className="-mt-5">
                        <WorkPanel leaf={work.leaf} lines={evidence.lines} problems={problems} status={full.leaves[work.leaf] ?? "unseen"} wide />
                      </div>
                    ) : null}
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
                  {/* The tiles' dot, read once (ticket 317): which questions came after practice; the working names the skill. */}
                  {markedLabels.length > 0 && (
                    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap" data-practice-legend>
                      <span className={`${PRACTICE_DOT} self-center`} aria-hidden />
                      {markedLabels.join(", ")} after practice
                    </span>
                  )}
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
                open={work?.kind === "problem" ? work.id : null}
                onPress={(id) => setWork((w) => pressWork(w, { kind: "problem", id }))}
                describe={() => "see their working"}
                starred={live && session ? session.stars : []}
                marked={markers}
                lit={chosen ? chosen.problems : null}
                noteFloor={teacherNoteFloor}
                noteInLabel
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
                        className={`w-full rounded-xl px-3 py-[3px] text-left text-[15px] leading-snug transition-colors ${active ? "bg-paper text-ink shadow-card" : "text-ink hover:bg-paper/70"}`}
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

/**
 * A column's narrowest with the not-attempted note, which sits on its second label line so the card is no taller (tickets 244,
 * 282): the label itself on one line (its measured width at 12 px, `LABEL_WIDTH`), and "Q10 not attempted" with one "Q10, "
 * more for each further problem.
 */
const LABEL_WIDTH: Record<OutcomeColumn["id"], number> = { first: 100, individual: 184, group: 158, covered: 142, wrong: 56 };
const teacherNoteFloor = (c: OutcomeColumn): number => Math.max(LABEL_WIDTH[c.id], 108 + 30 * (c.notAttempted.length - 1));

/** What keeps the working open when pressed: the working itself, a Q tile, a skill row. */
const KEEPS_WORK = "[data-work-content], [data-work-tile], [data-hierarchy] button[data-node]";

/** The most columns a problem's versions share one row in (ticket 282). */
const MAX_VERSION_COLUMNS = 4;

/** A problem's versions side by side, first submission on the left (ticket 243), each fitted to its column. */
function Versions({ problem, versions }: { problem: string; versions: ShownVersion[] }) {
  // A problem too long for the card (Set 4's nine-line worded problem at 1280) is scaled down as a whole until it fits,
  // never scrolled and never wrapped (ticket 244): the maths keeps its lines, only smaller. A style write, not state.
  const ref = useRef<HTMLDivElement>(null);
  const fitKey = JSON.stringify(versions);
  useLayoutEffect(() => {
    const grid = ref.current;
    const panel = grid?.closest<HTMLElement>("[data-report-work]");
    if (!grid || !panel) return;
    const fit = () => {
      grid.style.zoom = "";
      const full = panel.scrollHeight;
      if (full <= panel.clientHeight) return;
      // The panel's height is the fixed header plus the versions times their zoom: two readings give both, in the panel's own units.
      grid.style.zoom = "0.9";
      const scaled = full - panel.scrollHeight;
      if (scaled <= 0) return;
      const versionsHeight = scaled / 0.1;
      let zoom = Math.max(0.6, (panel.clientHeight - (full - versionsHeight) - 1) / versionsHeight);
      grid.style.zoom = String(zoom);
      // Rows round to whole pixels: step down until nothing is left over.
      while (panel.scrollHeight > panel.clientHeight && zoom > 0.6) grid.style.zoom = String((zoom -= 0.01));
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(panel);
    return () => observer.disconnect();
  }, [problem, fitKey]);
  // Class review's pane (ticket 282) takes a column per example beside the other versions while the row holds four columns at
  // most; past that each column would be too narrow for a line and its chip, so the pane takes a row of its own beneath them.
  const pane = versions.find((v) => v.examples);
  const others = versions.length - (pane ? 1 : 0);
  const ownRow = !!pane && others + pane.examples!.length > MAX_VERSION_COLUMNS;
  const columns = ownRow ? others : others + (pane?.examples?.length ?? 0);
  return (
    <div ref={ref} className="mt-4 grid gap-3" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }} data-versions={versions.length}>
      {versions.map((v) => (
        <section key={v.kind} className="min-w-0 rounded-xl border border-line bg-paper p-3" style={v.examples ? { gridColumn: ownRow ? "1 / -1" : `span ${v.examples.length}` } : undefined} data-version={v.kind}>
          <Eyebrow>{v.label}</Eyebrow>
          {v.examples ? <ClassReviewExamples problem={problem} examples={v.examples} /> : <WorkLines problem={problem} texs={v.lines} narrow />}
        </section>
      ))}
    </div>
  );
}
