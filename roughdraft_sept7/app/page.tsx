import Link from "next/link";
import { Card, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";

export default function Home() {
  return (
    <div className="hero-glow">
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-14 text-center">
        <h1 className="font-display text-[52px] md:text-[72px] leading-[1.02] text-ink">
          Maths feedback that follows
          <br />
          the working, <span className="text-accent">step by step.</span>
        </h1>
        <p className="mt-7 text-[15px] text-ink-muted">
          Calibrated to <span className="text-ink font-medium">QCE Mathematical Methods</span>
          <span className="mx-2">·</span>
          Year 11, Unit 1
          <span className="mx-2">·</span>
          <span className="text-ink-soft">one topic, done well: roots of a quadratic</span>
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <DifficultyTag d="simple familiar" />
          <DifficultyTag d="simple unfamiliar" />
          <DifficultyTag d="complex familiar" />
          <DifficultyTag d="complex unfamiliar" />
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-20 grid md:grid-cols-2 gap-6">
        <Link href="/student" className="group">
          <Card className="p-7 h-full transition-shadow group-hover:shadow-lift">
            <Eyebrow>Student</Eyebrow>
            <h2 className="font-display text-[30px] mt-2 text-ink">Work through the set</h2>
            <p className="mt-3 text-[14px] text-ink-soft leading-relaxed">
              Practice landing, a differentiated-pacing flow for two sample students, a tutor chat
              beside a live evaluation, confidence check-ins, and a transparent view of what your
              teacher sees.
            </p>
            <ul className="mt-5 space-y-1.5 text-[13px] text-ink-muted">
              <li>Practice · Working through · Tutor · Check-in · What your teacher sees</li>
            </ul>
            <div className="mt-6 text-accent-deep text-[13.5px] font-medium">Open as Jordan Whitlock →</div>
          </Card>
        </Link>
        <Link href="/teacher" className="group">
          <Card className="p-7 h-full transition-shadow group-hover:shadow-lift">
            <Eyebrow>Teacher</Eyebrow>
            <h2 className="font-display text-[30px] mt-2 text-ink">See where the class is</h2>
            <p className="mt-3 text-[14px] text-ink-soft leading-relaxed">
              A roster with prerequisite-subskill flags, an assignment builder that breaks each
              problem into the skills it leans on, and a student view with chat highlights and a
              place to write a classwide hint.
            </p>
            <ul className="mt-5 space-y-1.5 text-[13px] text-ink-muted">
              <li>Class · New assignment · Student detail</li>
            </ul>
            <div className="mt-6 text-accent-deep text-[13.5px] font-medium">Open as Ms Okafor →</div>
          </Card>
        </Link>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-4 text-[13px]">
          {[
            ["Thinking stays with the student", "Examples are parallel problems, hints are questions, videos explain the idea and not the item."],
            ["More than one way in", "Every hint offers several starting points. Working is judged on whether each step holds, not on matching a model answer."],
            ["No points, streaks or badges", "Progress is described in the language of the maths: which steps held, which skills a problem leans on, and what to try next."],
          ].map(([h, b]) => (
            <div key={h} className="rounded-xl border border-line bg-paper/60 p-5">
              <div className="font-medium text-ink">{h}</div>
              <div className="mt-1.5 text-ink-muted leading-relaxed">{b}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
