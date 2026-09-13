"use client";

import PathwayMap from "../../PathwayMap";
import UnitFocus from "../../UnitFocus";
import SeatingBoard from "../../../groups/SeatingBoard";
import { Button, Card, Eyebrow } from "@/components/ui";
import { GROUP_SIZE, type GroupColour, type SeatingGroups } from "@/data/groups";
import type { Pathway } from "@/data/types";
import type { ReviewedQuestion, ReviewState } from "@/lib/review";
import { inferUnitFromReviewed } from "@/lib/review";

/**
 * The pathway step, the last before Create: the unit focus (the inferred unit, standing unless
 * the teacher describes the focus and reassesses; nothing to confirm, ticket 123) above the
 * review-pathway map (the same map the old create screen has, on a screen of its own). Create is
 * on throughout.
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
  const inferred = inferUnitFromReviewed(final);
  return (
    <div className="pb-24" data-pathway-step>
      <div className="mt-8 max-w-[980px] space-y-4">
        <UnitFocus inferred={inferred} reassessed={review.unit ?? null} onReassess={(u) => onChange({ unit: u })} />
        <Card className="p-6">
          <Eyebrow>Review pathway</Eyebrow>
          <div className="mt-4">
            <PathwayMap value={review.pathway} onChange={(p: Pathway) => onChange({ pathway: p })} />
          </div>
        </Card>
      </div>
      {review.pathway.includes("group") && (
        <Card className="mt-4 p-6" data-confirm-groups>
          <div className="flex items-baseline justify-between gap-6">
            <Eyebrow>Confirm groups</Eyebrow>
            <span className="text-[12.5px] text-ink-muted">From the class&apos;s default groups. Drag a student to a colour for this assignment only. Groups of {GROUP_SIZE}; any other size is flagged.</span>
          </div>
          <div className="mt-4">
            <SeatingBoard groups={groups} onMove={onMoveGroup} scope="new" minHeight={240} />
          </div>
        </Card>
      )}
      <div className="fixed bottom-16 right-6 z-30 flex items-center gap-3">
        <Button variant="secondary" size="lg" onClick={onBack} className="shadow-lift" data-back>
          Back
        </Button>
        <Button size="lg" onClick={onCreate} className="shadow-lift" data-create>
          Create
        </Button>
      </div>
    </div>
  );
}
