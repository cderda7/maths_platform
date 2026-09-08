import Brand from "@/components/Brand";
import { Avatar, Card, Eyebrow, H1 } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { ASSIGNMENT, DEMO_STUDENT } from "@/data/assignment";
import { PREREQ_IDS, SUBSKILL_MAP, TARGET_ID } from "@/data/subskills";

const COLUMNS = [...PREREQ_IDS, TARGET_ID];

export default function TeacherHome() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-paper/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <Brand href="/teacher" />
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[13.5px] font-medium text-accent-deep">Class</span>
          </div>
          <div className="flex items-center gap-3 text-[13px] text-ink-soft">
            <span>{ASSIGNMENT.teacher}</span>
            <Avatar initials="MO" />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-12">
        <Eyebrow>
          {ASSIGNMENT.className} · {ASSIGNMENT.unit}
        </Eyebrow>
        <H1 className="mt-3">Where the class is</H1>
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-ink-soft">
          {ASSIGNMENT.title}, due {ASSIGNMENT.due}. Dots show which prerequisite skills each student's working has leaned on and how those steps held up. There are no marks here.
        </p>

        <Card className="mt-10 overflow-hidden">
          <table className="w-full text-left text-[14px]">
            <thead>
              <tr className="border-b border-line text-[11px] uppercase tracking-[0.12em] text-ink-muted">
                <th className="px-6 py-4 font-semibold">Student</th>
                {COLUMNS.map((id) => (
                  <th key={id} className="px-3 py-4 text-center font-semibold">
                    {SUBSKILL_MAP[id].short}
                  </th>
                ))}
                <th className="px-6 py-4 font-semibold">Set</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <Avatar initials={DEMO_STUDENT.initials} />
                    <span className="font-medium text-ink">{DEMO_STUDENT.name}</span>
                  </div>
                </td>
                {COLUMNS.map((id) => (
                  <td key={id} className="px-3 py-5 text-center">
                    <StatusDot status="unseen" size="h-2.5 w-2.5" />
                  </td>
                ))}
                <td className="px-6 py-5 text-ink-soft">
                  0/{ASSIGNMENT.problems.length}
                  <div className="text-[12px] text-ink-muted">Not started</div>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex items-center justify-between border-t border-line px-6 py-3 text-[12.5px] text-ink-muted">
            <span className="flex items-center gap-4">
              {(["secure", "developing", "gap", "unseen"] as const).map((s) => (
                <span key={s} className="flex items-center gap-1.5">
                  <StatusDot status={s} /> {STATUS_WORD[s]}
                </span>
              ))}
            </span>
            <span>Based on how each step held, not on answers.</span>
          </div>
        </Card>
      </main>
    </div>
  );
}
