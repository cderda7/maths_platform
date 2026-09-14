"use client";

import Link from "next/link";
import TeacherChrome from "../TeacherChrome";
import { BackButton } from "../AssignmentContext";
import { CategoryChip, StatusDot } from "@/components/Tag";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { ASSIGNMENT } from "@/data/assignment";
import { categoryName } from "@/data/taxonomy";
import type { Status } from "@/data/types";
import { assignmentHref, assignmentReportHref, HOLISTIC_HREF, holisticHref } from "@/lib/assignments";
import { useClassroom } from "@/lib/classroom-store";
import { holisticView, type HabitRef, type HolisticSet, type HolisticStatus, type HolisticView } from "@/lib/holistic";
import { useBatchedSession, useNow } from "@/lib/store";

/**
 * A student across every set (ticket 251): the story sheet's line for them, the set × category grid (sets down since
 * ticket 269), and the habits behind every result short of secure under their category, each naming its set and
 * problems and opening that working on the set's report. A set's row head opens the student's report on that set.
 *
 * One page, two routes: `/teacher/students/<id>` (Back to Holistic Assessment's tiles, ticket 252) and
 * `/teacher/a/<set>/students/<id>` (`set`: Back to that set's Class View, under its tabs). Only Back differs.
 * The live set is read as its Class View reads it (`lib/holistic.ts`): the classroom, Sam's session in its 3 s
 * batches and the clock; until those have arrived the grid and habits wait, so the live row never flashes in.
 */
export default function HolisticPage({ student, set }: { student: string; set?: string }) {
  const classroom = useClassroom();
  const { session, updatedAt } = useBatchedSession(3000);
  const now = useNow();
  const ready = updatedAt !== null && now > 0;
  const view = holisticView(student, { classroom, session, now });
  if (!view) return <TeacherChrome>{null}</TeacherChrome>;
  const here = holisticHref(student, set);
  return (
    <TeacherChrome>
      <div data-holistic={student} data-holistic-ready={ready || undefined}>
        {set ? (
          <BackButton href={assignmentHref(set, "class")} data-holistic-back={assignmentHref(set, "class")}>
            Class View
          </BackButton>
        ) : (
          <BackButton href={HOLISTIC_HREF} data-holistic-back={HOLISTIC_HREF}>
            Holistic Assessment
          </BackButton>
        )}
        <Eyebrow className="mt-3">{ASSIGNMENT.className} · Holistic Assessment</Eyebrow>
        <div className="mt-3 flex items-center gap-4">
          <Avatar initials={view.student.initials} size="h-14 w-14 text-[17px]" />
          <H1>{view.student.name}</H1>
        </div>
        <p className="mt-4 max-w-[1180px] text-[19px] leading-relaxed text-ink-soft" data-holistic-summary>
          {view.summary}
        </p>
        {ready && (
          <>
            <Grid view={view} from={here} />
            <Habits view={view} from={here} />
          </>
        )}
      </div>
    </TeacherChrome>
  );
}

/** The set column's width, layout px: "PS6 Thu 10 Sep · live" and the longest topic on one line, with its padding. */
const SET_COL = 400;

/**
 * Sets down, categories across (ticket 269; ticket 251 had them the other way). Each category heads its column with
 * the Class View's chip, centred over its cells; every cell pads 12 px a side, so every result is one width. A set's
 * head pads 18 px left and its link 6 inside, so "PS1" starts where "SET" does.
 */
function Grid({ view, from }: { view: HolisticView; from: string }) {
  return (
    <Card className="mt-9 overflow-clip" data-holistic-grid>
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col style={{ width: SET_COL }} />
          {view.categories.map((c) => (
            <col key={c.category} />
          ))}
        </colgroup>
        <thead>
          <tr className="border-b border-line">
            <th className="px-6 py-4 align-middle">
              <Eyebrow>Set</Eyebrow>
            </th>
            {view.categories.map((c) => (
              <th key={c.category} className="px-3 py-4 text-center align-middle" data-category-head={c.category}>
                {/* A flex box, so the chip centres on the row as a block does, level with "SET", not on a text baseline. */}
                <div className="flex justify-center">
                  <CategoryChip>{categoryName(c.category).short}</CategoryChip>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {view.sets.map((set, j) => (
            <tr key={set.id} className="border-b border-line last:border-b-0" data-holistic-row={set.id}>
              <th scope="row" className="py-1.5 pr-3 pl-4.5 align-middle font-normal">
                <SetHead set={set} href={assignmentReportHref(set.id, view.student.id, { from })} />
              </th>
              {view.categories.map((c) => (
                <td key={c.category} className="px-3 py-3" data-cell={`${c.category}:${set.id}`} data-cell-status={c.cells[j]}>
                  <Cell status={c.cells[j]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/** A set's head: its label and day, its topic in two lines at most, "live" on Sam's live set; the whole head opens the student's report on the set. */
function SetHead({ set, href }: { set: HolisticSet; href: string }) {
  return (
    <Link
      href={href}
      className="group block rounded-xl px-1.5 py-2.5 transition-colors hover:bg-accent-soft focus-visible:outline-2 focus-visible:outline-accent"
      aria-label={`${set.label}, ${set.topic}: open the report on this set`}
      data-set-head={set.id}
    >
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <span className="font-display text-[24px] leading-none text-accent-deep">{set.label}</span>
        <span className="text-[13.5px] text-ink-muted">{set.due}</span>
        {set.live && (
          <span className="ml-auto inline-flex items-center gap-1 self-center rounded-full border border-accent-line bg-paper px-2 py-0.5 text-[12px] font-medium text-accent-deep" data-live-pill>
            <span aria-hidden className="live-dot h-1.5 w-1.5 rounded-full bg-accent" />
            live
          </span>
        )}
      </span>
      <span className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-ink-soft group-hover:text-ink">{set.topic}</span>
    </Link>
  );
}

const CELL_WORD: Record<HolisticStatus, string> = { secure: "secure", solid: "solid", developing: "developing", gap: "gap", unseen: "not seen", absent: "absent", none: "—" };
const CELL_TONE: Record<HolisticStatus, string> = {
  secure: "bg-secure text-white",
  solid: "bg-solid text-white",
  developing: "bg-developing text-white",
  gap: "bg-gap text-white",
  unseen: "border border-line-strong text-ink-muted",
  absent: "bg-cream-deep text-ink-muted",
  none: "text-ink-muted",
};

/** A result as a word on its colour; not seen hollow; absent (ticket 250) grey on the cream the Class View greys a row to; "—" bare where the set does not assess the category. */
function Cell({ status }: { status: HolisticStatus }) {
  return <span className={`grid h-9 place-items-center rounded-lg text-[15px] font-semibold ${CELL_TONE[status]}`}>{CELL_WORD[status]}</span>;
}

/** A habit's refs column, layout px: two sets side by side ("PS4 · Q1, Q2, Q4" and "PS5 · Q4, Q8"), a third wrapping under. */
const REFS_COL = 304;

function Habits({ view, from }: { view: HolisticView; from: string }) {
  return (
    <section className="mt-10" aria-label="Habits" data-holistic-habits>
      <Eyebrow>Habits</Eyebrow>
      {view.habits.length === 0 ? (
        <p className="mt-3 text-[17px] text-ink-muted" data-no-habits>
          Nothing to note
        </p>
      ) : (
        <div className="mt-4 columns-2 gap-x-12">
          {view.habits.map((g) => (
            <div key={g.category} className="mb-8 break-inside-avoid" data-habit-group={g.category}>
              <h2 className="font-display text-[24px] leading-tight text-ink">{g.name}</h2>
              <ul className="mt-2">
                {g.habits.map((h) => (
                  <li key={h.text} className="flex items-baseline gap-4 border-b border-line py-2.5 last:border-b-0" data-habit={h.text}>
                    <span className="min-w-0 flex-1 text-[17px] leading-snug text-ink">{h.text}</span>
                    {/* The refs in a column of their own, so every row's first set starts on one line down the list. */}
                    <span className="flex shrink-0 flex-wrap gap-x-5 gap-y-1" style={{ width: REFS_COL }}>
                      {h.refs.map((ref) => (
                        <Ref key={ref.set} student={view.student.id} ref_={ref} from={from} />
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

/** "● PS4 · Q1, Q2": the set's result there, the set, and each problem opening the student's working on it. */
function Ref({ student, ref_, from }: { student: string; ref_: HabitRef; from: string }) {
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap text-[15px] leading-snug text-ink-soft" data-habit-ref={ref_.set} data-ref-status={ref_.status}>
      <StatusDot status={ref_.status as Status} shape="pill" />
      <span>
        {ref_.label} ·{" "}
        {ref_.problems.map((p, i) => (
          <span key={p.id}>
            {i > 0 && ", "}
            <Link href={assignmentReportHref(ref_.set, student, { work: p.id, from })} className="font-medium text-accent-deep hover:underline" data-work-link={p.id}>
              {p.label}
            </Link>
          </span>
        ))}
      </span>
    </span>
  );
}
