import Link from "next/link";
import { Card, Eyebrow, H1, Avatar } from "@/components/ui";
import { StatusDot, SubskillChip } from "@/components/Tag";
import { STUDENTS } from "@/data/students";
import { PREREQ_IDS, SUBSKILL_MAP } from "@/data/subskills";
import { ASSIGNMENT } from "@/data/problems";
import { CLASS_PATTERNS } from "@/data/teacher";
import type { GapStatus } from "@/data/types";

const SIGNAL: Record<string, { word: string; cls: string }> = {
  calibrated: { word: "calibrated", cls: "text-sound" },
  over: { word: "over-sure", cls: "text-shaky" },
  under: { word: "under-sure", cls: "text-note" },
  mixed: { word: "mixed", cls: "text-ink-muted" },
};

function cell(status: GapStatus) {
  return (
    <span className="inline-flex items-center justify-center" title={status}>
      <StatusDot status={status} size="h-2.5 w-2.5" />
    </span>
  );
}

export default function ClassDashboard() {
  const flagged = STUDENTS.filter((s) => s.flag);
  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <Eyebrow>{ASSIGNMENT.className} · {ASSIGNMENT.unit}</Eyebrow>
          <H1 className="mt-2">Where the class is</H1>
          <p className="mt-3 max-w-xl text-[15px] text-ink-soft leading-relaxed">
            {ASSIGNMENT.title}, due {ASSIGNMENT.due}. Flags show which prerequisite skills each student's working has leaned on, and how those steps held up. There are no marks here.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/teacher/assignments/new" className="inline-flex items-center rounded-full bg-ink text-white px-4 py-2 text-[13.5px] font-medium hover:bg-ink-soft">
            New assignment
          </Link>
        </div>
      </div>

      <div className="mt-8 grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-[0.1em] text-ink-muted border-b border-line">
                  <th className="px-4 py-3 font-semibold">Student</th>
                  {PREREQ_IDS.map((id) => (
                    <th key={id} className="px-1.5 py-3 font-semibold text-center text-[10px]" title={SUBSKILL_MAP[id].name}>
                      {SUBSKILL_MAP[id].short}
                    </th>
                  ))}
                  <th className="px-1.5 py-3 font-semibold text-center text-[10px]">Roots</th>
                  <th className="px-3 py-3 font-semibold text-[10px]">Confidence</th>
                  <th className="px-3 py-3 font-semibold text-[10px]">Set</th>
                </tr>
              </thead>
              <tbody>
                {STUDENTS.map((s) => (
                  <tr key={s.id} className="border-b border-line last:border-0 hover:bg-cream/70">
                    <td className="px-4 py-3">
                      <Link href={`/teacher/students/${s.id}`} className="flex items-center gap-3 group">
                        <Avatar initials={s.initials} />
                        <div>
                          <div className="text-ink font-medium group-hover:text-accent-deep">{s.name}</div>
                          {s.flag && <div className="text-[11.5px] text-ink-muted max-w-[170px] truncate">{s.flag}</div>}
                        </div>
                      </Link>
                    </td>
                    {PREREQ_IDS.map((id) => (
                      <td key={id} className="px-1.5 py-3 text-center">{cell(s.subskills[id])}</td>
                    ))}
                    <td className="px-1.5 py-3 text-center">{cell(s.subskills.roots)}</td>
                    <td className={`px-3 py-3 text-[12px] whitespace-nowrap ${SIGNAL[s.confidenceSignal].cls}`}>{SIGNAL[s.confidenceSignal].word}</td>
                    <td className="px-3 py-3 text-[12px] text-ink-muted whitespace-nowrap">
                      <div className="text-ink">{s.progress.done}/{s.progress.total}</div>
                      <div className="text-[11px]">{s.lastActive.replace("Today, ", "")}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-3 border-t border-line flex flex-wrap gap-x-5 gap-y-1 text-[11.5px] text-ink-muted">
            <span className="inline-flex items-center gap-1.5"><StatusDot status="secure" /> secure</span>
            <span className="inline-flex items-center gap-1.5"><StatusDot status="developing" /> developing</span>
            <span className="inline-flex items-center gap-1.5"><StatusDot status="gap" /> gap</span>
            <span className="inline-flex items-center gap-1.5"><StatusDot status="unseen" /> not seen yet</span>
            <span className="ml-auto">Based on how each step held, not on answers.</span>
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <Eyebrow>Patterns across the class</Eyebrow>
            <ul className="mt-3 space-y-3">
              {CLASS_PATTERNS.map((p) => (
                <li key={p.text} className="text-[13px] leading-snug">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-[22px] text-ink leading-none">{p.count}</span>
                    <span className="text-[11px] text-ink-muted">of {p.of}</span>
                  </div>
                  <div className="mt-1 text-ink-soft">{p.text}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <SubskillChip id={p.subskill} />
                    <Link href="/teacher/students/jordan" className="text-[11.5px] text-accent-deep">write a hint →</Link>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="p-5" tone="plain">
            <Eyebrow>Worth a look</Eyebrow>
            <ul className="mt-2 space-y-1.5">
              {flagged.slice(0, 4).map((s) => (
                <li key={s.id} className="text-[12.5px]">
                  <Link href={`/teacher/students/${s.id}`} className="text-ink hover:text-accent-deep font-medium">{s.name}</Link>
                  <span className="text-ink-muted"> — {s.flag}</span>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
