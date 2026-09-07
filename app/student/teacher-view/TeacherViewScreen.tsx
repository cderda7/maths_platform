"use client";

import { useState } from "react";
import { Button, Card, Eyebrow, Avatar } from "@/components/ui";
import { StatusDot, STATUS_WORD } from "@/components/Tag";
import { SUBSKILL_MAP } from "@/data/subskills";
import { JORDAN_REPORT } from "@/data/teacher";
import { STUDENT_MAP } from "@/data/students";

export default function TeacherViewScreen() {
  const me = STUDENT_MAP.jordan;
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState<string | null>(null);

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <div>
        <Eyebrow>Transparency</Eyebrow>
        <h1 className="font-display text-[34px] leading-tight mt-1 text-ink">What your teacher sees</h1>
        <p className="mt-2 text-[14px] text-ink-muted max-w-prose">
          This is the report Edexia sends to Ms Okafor for this set, word for word. Nothing is sent that isn't on this page. You can add your own note underneath, and it goes with it.
        </p>
      </div>

      <div className="mt-6 grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-line bg-cream/60 flex items-center gap-3">
            <Avatar initials={me.initials} />
            <div>
              <div className="text-[13.5px] font-medium text-ink">{me.name}</div>
              <div className="text-[12px] text-ink-muted">{JORDAN_REPORT.assignment} · sent to Ms Okafor as it updates</div>
            </div>
            <span className="ml-auto text-[11px] rounded-full border border-line px-2.5 py-0.5 text-ink-muted bg-paper">exactly as the teacher sees it</span>
          </div>

          <div className="px-6 py-5 space-y-6">
            <section>
              <Eyebrow>Skills this set leaned on</Eyebrow>
              <ul className="mt-3 divide-y divide-line">
                {JORDAN_REPORT.observations.map((o) => (
                  <li key={o.id} className="py-3 grid sm:grid-cols-[220px_1fr] gap-2">
                    <div className="flex items-start gap-2 text-[13px] text-ink">
                      <StatusDot status={o.status} size="mt-1.5 h-2 w-2" />
                      <div>
                        <div>{SUBSKILL_MAP[o.id].name}</div>
                        <div className="text-[11px] text-ink-muted">{STATUS_WORD[o.status]}</div>
                      </div>
                    </div>
                    <div className="text-[13px] text-ink-soft leading-relaxed">{o.text}</div>
                  </li>
                ))}
              </ul>
            </section>

            <section>
              <Eyebrow>Confidence</Eyebrow>
              <p className="mt-2 text-[13px] text-ink-soft leading-relaxed">{JORDAN_REPORT.confidence}</p>
            </section>

            <section>
              <Eyebrow>From the tutor chat</Eyebrow>
              <ul className="mt-2 space-y-1.5">
                {JORDAN_REPORT.chat.map((c) => (
                  <li key={c} className="text-[13px] text-ink-soft leading-relaxed flex gap-2"><span className="text-accent">–</span>{c}</li>
                ))}
              </ul>
              <p className="mt-2 text-[12px] text-ink-muted">Your actual messages aren't sent — just these highlights.</p>
            </section>

            <section>
              <Eyebrow>Help</Eyebrow>
              <p className="mt-2 text-[13px] text-ink-soft">{JORDAN_REPORT.help}</p>
            </section>

            {saved && (
              <section className="rise">
                <Eyebrow>Note from {me.name.split(" ")[0]}</Eyebrow>
                <blockquote className="mt-2 rounded-xl border border-accent-line bg-accent-soft/60 px-4 py-3 text-[13.5px] text-ink leading-relaxed">
                  {saved}
                </blockquote>
              </section>
            )}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <Eyebrow>Add your own note</Eyebrow>
            <p className="mt-1.5 text-[12.5px] text-ink-muted">Anything you'd want Ms Okafor to know that the working doesn't show.</p>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={5}
              placeholder="e.g. I get the factorising now but I still second-guess the signs when there's a minus in c."
              className="mt-3 w-full resize-none rounded-xl border border-line bg-paper px-3 py-2.5 text-[13.5px] text-ink placeholder:text-ink-muted"
            />
            <div className="mt-3 flex items-center gap-3">
              <Button disabled={!note.trim()} onClick={() => { setSaved(note.trim()); setNote(""); }}>Send with the report</Button>
              {saved && <span className="text-[12px] text-sound">Added</span>}
            </div>
          </Card>

          <Card className="p-5" tone="plain">
            <Eyebrow>Not reported</Eyebrow>
            <ul className="mt-2 space-y-1.5">
              {JORDAN_REPORT.notReported.map((n) => (
                <li key={n} className="text-[12.5px] text-ink-soft flex gap-2"><span className="text-ink-muted">–</span>{n}</li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
