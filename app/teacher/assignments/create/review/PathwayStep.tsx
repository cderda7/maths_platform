"use client";

import { useRef, useState } from "react";
import PathwayMap from "../../PathwayMap";
import NewSkills from "../../NewSkills";
import SeatingBoard from "../../../groups/SeatingBoard";
import { Button, Card, Eyebrow } from "@/components/ui";
import { DIAGNOSTIC_CHIP } from "../../../DiagnosticCard";
import { GROUP_SIZE, type GroupColour, type SeatingGroups } from "@/data/groups";
import type { Pathway } from "@/data/types";
import { LIVE_ASSIGNMENT_ID, recentSets } from "@/lib/assignments";
import { RECENT_SETS } from "@/lib/newSkills";
import { reviewNewSkills, type ReviewedQuestion, type ReviewState } from "@/lib/review";
import { CREATE_BAR, CREATE_BAR_CLEARANCE } from "../createBar";

/**
 * The pathway step, the last before Create: the set's New skills (inferred from the class's last two
 * sets, standing unless the teacher switches one; nothing to confirm, tickets 123 and 209) above the
 * review-pathway line. The pathway starts undecided (ticket 246): Create looks off and says "Choose a review pathway
 * first" until the teacher switches a stop on or picks No review, and a press on it then scrolls to the pathway card
 * and sends one ring out from it instead of creating (the pattern of the whole-class setup's Project).
 *
 * Ticket 188: while the pathway has group review, "Confirm groups" follows the map: the groups this
 * assignment will seat, pre-filled from the class defaults, a student moved by drag or the chip's
 * menu as on the Groups page (`SeatingBoard`). A move changes this new assignment's groups only;
 * Create freezes them. Nothing here has to be confirmed before Create.
 */
export default function PathwayStep({
  final,
  review,
  groups,
  onChange,
  onMoveGroup,
  onBack,
  onCreate,
}: {
  final: ReviewedQuestion[];
  review: ReviewState;
  /** The groups the new assignment will freeze: the teacher's moves here on top of the class defaults. */
  groups: SeatingGroups;
  onChange: (patch: Partial<ReviewState>) => void;
  onMoveGroup: (student: string, to: GroupColour) => void;
  onBack: () => void;
  onCreate: () => void;
}) {
  const skills = reviewNewSkills(final, review, recentSets(LIVE_ASSIGNMENT_ID, RECENT_SETS));
  const waiting = review.pathway === null;
  const card = useRef<HTMLDivElement>(null);
  /** Presses on the waiting Create; each one remounts the ring so it plays again. */
  const [nudge, setNudge] = useState(0);
  const create = () => {
    if (!waiting) return onCreate();
    const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    card.current?.scrollIntoView({ block: "nearest", behavior: still ? "auto" : "smooth" });
    setNudge((n) => n + 1);
  };
  return (
    <div className={CREATE_BAR_CLEARANCE} data-pathway-step>
      <div className="mt-8 max-w-[980px] space-y-4">
        <NewSkills candidates={skills.candidates} chosen={skills.chosen} changed={skills.changed} onChange={(next) => onChange({ newSkills: next ?? undefined })} />
        <div ref={card} className="scroll-mb-40">
          <Card className="relative p-6" data-pathway-card>
            {nudge > 0 && <span key={nudge} className="ring-once pointer-events-none absolute inset-0 rounded-[inherit]" aria-hidden data-ring={nudge} />}
            <Eyebrow className={DIAGNOSTIC_CHIP}>Review pathway</Eyebrow>
            <p className="mt-3 max-w-[720px] text-[13px] leading-snug text-ink-soft">Switch on the reviews students go through after working. They always run in this order.</p>
            <div className="mt-5">
              <PathwayMap value={review.pathway} onChange={(p: Pathway | null) => onChange({ pathway: p })} />
            </div>
          </Card>
        </div>
      </div>
      {review.pathway?.includes("group") && (
        <Card className="mt-4 p-6" data-confirm-groups>
          <div className="flex items-baseline justify-between gap-6">
            <Eyebrow className={`${DIAGNOSTIC_CHIP} shrink-0`}>Confirm groups</Eyebrow>
            <span className="text-[12.5px] text-ink-muted">From the class&apos;s default groups. Drag a student to a colour for this assignment only. Groups of {GROUP_SIZE}; any other size is flagged.</span>
          </div>
          <div className="mt-4">
            <SeatingBoard groups={groups} onMove={onMoveGroup} scope="new" minHeight={240} />
          </div>
        </Card>
      )}
      <div className={CREATE_BAR}>
        {waiting && (
          <span className="mr-1 text-[13px] text-ink-muted" data-create-waiting>
            Choose a review pathway first
          </span>
        )}
        <Button variant="secondary" size="lg" onClick={onBack} className="shadow-lift" data-back>
          Back
        </Button>
        <Button size="lg" onClick={create} aria-disabled={waiting || undefined} className={`shadow-lift ${waiting ? "opacity-40" : ""}`} data-create>
          Create
        </Button>
      </div>
    </div>
  );
}
