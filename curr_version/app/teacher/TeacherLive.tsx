"use client";

import TeacherChrome from "./TeacherChrome";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { CLASSMATES } from "@/data/classmates";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";
import type { Confidence, SubskillId, SubskillStatus } from "@/data/types";
import { useBatchedSession, useNow } from "@/lib/store";
import { problemsStarted, subskillStatuses } from "@/lib/status";
import type { StudentSession } from "@/lib/session";

const COLUMNS: SubskillId[] = [...PREREQ_IDS, TARGET_ID];

const UNSEEN = Object.fromEntries(COLUMNS.map((id) => [id, "unseen"])) as Record<SubskillId, SubskillStatus>;

function confidenceWord(c: Confidence | null): { text: string; tone: string } {
  if (!c) return { text: "—", tone: "text-ink-muted" };
  if (c.level === "confident") return { text: "confident", tone: "text-secure" };
  if (c.level === "low") return { text: "low", tone: "text-standout" };
  return { text: `low: ${SUBSKILL_MAP[c.subskill].short.toLowerCase()}`, tone: "text-standout" };
}

function stageWord(s: StudentSession): string {
  if (s.overlay) return `Practising ${SUBSKILL_MAP[s.overlay].short.toLowerCase()}`;
  if (s.prompt) return `Offered ${SUBSKILL_MAP[s.prompt.subskill].short.toLowerCase()} practice`;
  switch (s.stage) {
    case "overview":
      return "Reading the set";
    case "practice":
      return "Warming up";
    case "confidence":
      return "Confidence check";
    case "working":
      return `On ${ASSIGNMENT.problems[s.problemIndex].label}`;
    case "feedback":
      return "Handed in";
    default:
      return s.stage;
  }
}

function ago(ms: number | null, now: number): string {
  if (ms === null || now === 0) return "";
  const s = Math.max(0, Math.round((now - ms) / 1000));
  return s <= 1 ? "just now" : `${s}s ago`;
}

/** "Where the class is", with the demo student's row live (in batches) and classmates static. */
export default function TeacherLive() {
  const { session, updatedAt, everyMs } = useBatchedSession(3000);
  const live = session ?? null;
  const statuses = live ? subskillStatuses(live) : UNSEEN;
  const started = live ? problemsStarted(live) : 0;
  const caution = live?.escalation.caution ?? [];
  const conf = confidenceWord(live?.confidence ?? null);
  const now = useNow();

  return (
    <TeacherChrome>
      <Eyebrow>
        {ASSIGNMENT.className} · {ASSIGNMENT.unit}
      </Eyebrow>
      <H1 className="mt-3">Where the class is</H1>
      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
        {ASSIGNMENT.title}, due {ASSIGNMENT.due}. Dots show which prerequisite skills each student's working has leaned on and how those steps held up. There are no marks here.
      </p>

      <div className="mt-10 grid grid-cols-[1fr_300px] gap-6">
        <Card className="overflow-hidden">
          <table className="w-full table-fixed text-left text-[14px]">
            <colgroup>
              <col className="w-[244px]" />
              {COLUMNS.map((id) => (
                <col key={id} className="w-[74px]" />
              ))}
              <col className="w-[112px]" />
              <col />
            </colgroup>
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.06em] text-ink-muted">
                <th className="px-5 py-4 font-semibold">Student</th>
                {COLUMNS.map((id) => (
                  <th key={id} className="px-1 py-4 text-center font-semibold">
                    {SUBSKILL_MAP[id].short}
                  </th>
                ))}
                <th className="px-3 py-4 font-semibold">Confidence</th>
                <th className="px-3 py-4 font-semibold">Set</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-line bg-accent-soft/30" data-live>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <Avatar initials={DEMO_STUDENT.initials} />
                    <div>
                      <div className="flex items-center gap-2 whitespace-nowrap font-medium text-ink">
                        {DEMO_STUDENT.name}
                        <span className="inline-flex items-center gap-1 rounded-full border border-accent-line bg-paper px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent-deep">
                          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" aria-hidden /> live
                        </span>
                      </div>
                      <div className="flex items-center gap-2 whitespace-nowrap text-[12.5px] text-ink-muted">
                        {caution.length > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full border border-gap-line bg-gap-soft px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gap" data-caution>
                            <span className="h-1.5 w-1.5 rounded-full bg-gap" aria-hidden /> caution
                          </span>
                        )}
                        {live ? stageWord(live) : "Not started"}
                      </div>
                    </div>
                  </div>
                </td>
                {COLUMNS.map((id) => (
                  <td key={id} className="px-1 py-4 text-center">
                    <StatusDot status={statuses[id]} size="h-2.5 w-2.5" />
                  </td>
                ))}
                <td className={`whitespace-nowrap px-3 py-4 text-[13px] ${conf.tone}`}>{conf.text}</td>
                <td className="whitespace-nowrap px-3 py-4 text-ink-soft">
                  {started}/{ASSIGNMENT.problems.length}
                  <div className="text-[12px] text-ink-muted">{live?.stage === "feedback" ? "handed in" : started > 0 ? "in progress" : ""}</div>
                </td>
              </tr>
              {CLASSMATES.map((c) => (
                <tr key={c.id} className="border-b border-line last:border-b-0">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar initials={c.initials} />
                      <div className="min-w-0">
                        <div className="font-medium text-ink">{c.name}</div>
                        {c.note && <div className="truncate text-[12.5px] text-ink-muted">{c.note}</div>}
                      </div>
                    </div>
                  </td>
                  {COLUMNS.map((id) => (
                    <td key={id} className="px-1 py-4 text-center">
                      <StatusDot status={c.statuses[id]} size="h-2.5 w-2.5" />
                    </td>
                  ))}
                  <td className={`whitespace-nowrap px-3 py-4 text-[13px] ${c.confidence === "confident" ? "text-secure" : "text-standout"}`}>{c.confidence}</td>
                  <td className="whitespace-nowrap px-3 py-4 text-ink-soft">
                    {c.done}/{ASSIGNMENT.problems.length}
                    <div className="text-[12px] text-ink-muted">{c.when}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-line px-5 py-3 text-[12.5px] text-ink-muted">
            <span className="flex items-center gap-4">
              {(["secure", "developing", "gap", "unseen"] as const).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <StatusDot status={s} /> {STATUS_WORD[s]}
                </span>
              ))}
            </span>
            <span>
              Live row refreshes every {Math.round(everyMs / 1000)}s · updated {ago(updatedAt, now)}
            </span>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className={`p-6 ${caution.length ? "border-gap-line" : ""}`}>
            <Eyebrow className={caution.length ? "text-gap" : ""}>Worth a look</Eyebrow>
            {caution.length === 0 ? (
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                Nothing flagged. A red caution appears here if a student is about to go into practice on the same skill a second time.
              </p>
            ) : (
              <ul className="mt-3 space-y-3">
                {caution.map((id) => (
                  <li key={id} className="rounded-xl border border-gap-line bg-gap-soft px-4 py-3">
                    <div className="flex items-center gap-2 text-[14px] font-medium text-gap">
                      <span className="h-2 w-2 rounded-full bg-gap" aria-hidden />
                      {DEMO_STUDENT.name} · {SUBSKILL_MAP[id].name}
                    </div>
                    <p className="mt-1 text-[12.5px] leading-snug text-ink-soft">
                      Practice on {SUBSKILL_MAP[id].short.toLowerCase()} has come up twice. Worth a word before the next problem.
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card className="p-6">
            <Eyebrow>{DEMO_STUDENT.name} so far</Eyebrow>
            {!live || live.practices.length === 0 ? (
              <p className="mt-3 text-[13.5px] leading-relaxed text-ink-soft">
                {live?.practice === "taken" ? "Took the warm-up before starting. " : ""}
                Practice offers and help requests will be listed here as facts, not flags.
              </p>
            ) : (
              <ul className="mt-3 space-y-2 text-[13.5px] text-ink-soft">
                {live.practice === "taken" && <li>Took the warm-up before starting.</li>}
                {live.practices.map((p, i) => (
                  <li key={i}>
                    {p.reason === "help" ? "Asked for help with" : "Offered practice on"} {SUBSKILL_MAP[p.subskill].short.toLowerCase()} during{" "}
                    {ASSIGNMENT.problems.find((q) => q.id === p.problem)?.label ?? p.problem} · {p.accepted ? "took it" : "not now"}
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </TeacherChrome>
  );
}
