import Link from "next/link";
import Brand from "@/components/Brand";
import { Card, Eyebrow, H1 } from "@/components/ui";
import ResetDemo from "@/components/ResetDemo";
import { ASSIGNMENT, DEMO_STUDENT, unitLabel } from "@/data/assignment";

export default function Home() {
  return (
    <div className="min-h-screen hero-glow">
      <header className="mx-auto max-w-5xl px-6 py-6">
        <Brand />
      </header>
      <main className="mx-auto max-w-5xl px-6 pt-10 pb-20">
        <Eyebrow>{ASSIGNMENT.className} · {unitLabel(ASSIGNMENT.unit)}</Eyebrow>
        <H1 className="mt-3 max-w-3xl">One student, one teacher, one live loop.</H1>
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-ink-soft">
          Open the student side in one tab, the teacher side in another, and the board on the projector. As {DEMO_STUDENT.name} works through{" "}
          <em>{ASSIGNMENT.title}</em> on the iPad, the teacher's laptop moves with them; the board wakes for whole-class review.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <Link href="/student" className="group">
            <Card className="p-7 h-full transition-shadow group-hover:shadow-lift">
              <Eyebrow>Student · iPad</Eyebrow>
              <div className="mt-3 font-display text-[30px] leading-tight text-ink">{DEMO_STUDENT.name}</div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                A landscape iPad rendered in the browser. Draw with a mouse or trackpad; the working is read line by line as it's written.
              </p>
              <div className="mt-6 text-[14px] font-medium text-accent-deep group-hover:underline">Open the iPad →</div>
            </Card>
          </Link>
          <Link href="/teacher" className="group">
            <Card className="p-7 h-full transition-shadow group-hover:shadow-lift">
              <Eyebrow>Teacher · Laptop</Eyebrow>
              <div className="mt-3 font-display text-[30px] leading-tight text-ink">{ASSIGNMENT.teacher}</div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Full width on a laptop, no frame. Where the class is: each subskill as it's leaned on, a caution flag when a student is about to loop back, and the final report.
              </p>
              <div className="mt-6 text-[14px] font-medium text-accent-deep group-hover:underline">Open the teacher view →</div>
            </Card>
          </Link>
          <Link href="/board" className="group" data-board-link>
            <Card className="p-7 h-full transition-shadow group-hover:shadow-lift">
              <Eyebrow>Smartboard</Eyebrow>
              <div className="mt-3 font-display text-[30px] leading-tight text-ink">The projector</div>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
                Opened once at the start of the lesson and left up. Blank until whole-class review, then the class's examples and the teacher's working; nothing on it to press.
              </p>
              <div className="mt-6 text-[14px] font-medium text-accent-deep group-hover:underline">Open the board →</div>
            </Card>
          </Link>
        </div>

        <p className="mt-8 text-[14px] text-ink-soft">
          Or{" "}
          <Link href="/split" className="font-medium text-accent-deep hover:underline" data-split-link>
            see the iPad, the teacher view and the board in one tab →
          </Link>
        </p>

        <p className="mt-10 text-[12.5px] text-ink-muted">Design demo · simulated recognition, evaluation and classmates · nothing leaves this browser</p>
        <ResetDemo />
      </main>
    </div>
  );
}
