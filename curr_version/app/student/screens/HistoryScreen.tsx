"use client";

import { useRef, useState } from "react";
import M from "@/components/Math";
import { Button, Eyebrow } from "@/components/ui";
import { DifficultyTag } from "@/components/Tag";
import { useAssignment } from "@/lib/classroom-store";
import type { StudentSession } from "@/lib/session";
import { alignVersions, versionsOf, type AlignedProblem, type Version } from "@/lib/versions";

const time = (ms: number) => (ms > 0 ? new Date(ms).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "");

/**
 * A reviewed assignment. By default only the final working shows. Picking an earlier version from
 * the dropdown opens it in a side panel that scrolls line for line with the final version.
 */
export default function HistoryScreen({ session, onBack }: { session: StudentSession; onBack: () => void }) {
  const versions = versionsOf(session);
  const final = versions.find((v) => v.id === "final")!;
  const [compare, setCompare] = useState<Version["id"] | "none">("none");
  const other = compare === "none" ? null : versions.find((v) => v.id === compare)!;
  const aligned = alignVersions(other ?? final, final);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const syncing = useRef(false);

  const sync = (from: HTMLDivElement | null, to: HTMLDivElement | null) => {
    if (!from || !to || syncing.current) return;
    syncing.current = true;
    to.scrollTop = from.scrollTop;
    requestAnimationFrame(() => (syncing.current = false));
  };

  return (
    <div className="flex h-full min-h-0 flex-col px-9 py-6">
      <div className="flex items-end justify-between">
        <div>
          <Eyebrow>{useAssignment().title} · reviewed</Eyebrow>
          <h1 className="font-display mt-1.5 text-[26px] leading-tight text-ink">Your working</h1>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-[13px] text-ink-soft">
            Compare
            <select
              value={compare}
              onChange={(e) => setCompare(e.target.value as Version["id"] | "none")}
              className="rounded-full border border-line-strong bg-paper px-3 py-1.5 text-[13px] text-ink"
              aria-label="Earlier version"
            >
              <option value="none">Final only</option>
              {versions
                .filter((v) => v.id !== "final")
                .map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.label} · {time(v.at)}
                  </option>
                ))}
            </select>
          </label>
          <Button variant="secondary" onClick={onBack}>
            ← Report
          </Button>
        </div>
      </div>
      <div className={`mt-4 grid min-h-0 flex-1 gap-4 ${other ? "grid-cols-2" : "grid-cols-1"}`}>
        {other && <Column version={other} side="left" aligned={aligned} refEl={leftRef} onScroll={() => sync(leftRef.current, rightRef.current)} comparing />}
        <Column version={final} side="right" aligned={aligned} refEl={rightRef} onScroll={() => sync(rightRef.current, leftRef.current)} comparing={!!other} />
      </div>
    </div>
  );
}

function Column({
  version,
  side,
  aligned,
  refEl,
  onScroll,
  comparing,
}: {
  version: Version;
  side: "left" | "right";
  aligned: AlignedProblem[];
  refEl: React.RefObject<HTMLDivElement | null>;
  onScroll: () => void;
  comparing: boolean;
}) {
  return (
    <div className="flex min-h-0 flex-col" data-version={version.id}>
      <div className="flex items-baseline justify-between px-1 pb-2">
        <span className="text-[13.5px] font-medium text-ink">{version.label}</span>
        <span className="text-[12px] text-ink-muted">{time(version.at)}</span>
      </div>
      <div ref={refEl} onScroll={onScroll} className="min-h-0 flex-1 overflow-y-auto rounded-2xl border border-line bg-paper" data-scroll={side}>
        {aligned.map((a) => (
          <section key={a.problem.id} className="border-b border-line px-4 py-3 last:border-b-0">
            <div className="flex h-8 items-center gap-3">
              <span className="font-display text-[18px] text-ink">{a.problem.label}</span>
              <DifficultyTag d={a.problem.difficulty} />
              {comparing && a.changed && version.id === "final" && <span className="text-[11.5px] text-accent-deep">reworked</span>}
            </div>
            <ol className="mt-1 space-y-1.5">
              {a.rows.map((r, i) => {
                const l = side === "left" ? r.left : r.right;
                return (
                  <li key={i} className={`flex h-11 items-center rounded-lg border px-3 text-[16px] ${l ? "border-line bg-cream/60 text-ink" : "border-transparent"}`}>
                    {l && <M tex={l.tex} />}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </div>
  );
}
