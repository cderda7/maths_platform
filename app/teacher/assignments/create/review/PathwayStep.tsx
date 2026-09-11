"use client";

import PathwayMap from "../../PathwayMap";
import UnitFocus from "../../UnitFocus";
import { Button, Card, Eyebrow } from "@/components/ui";
import type { Pathway } from "@/data/types";
import type { ReviewedQuestion, ReviewState } from "@/lib/review";
import { inferUnitFromReviewed } from "@/lib/review";

/**
 * The pathway step, the last before Create: the unit focus (the inferred unit, standing unless
 * the teacher describes the focus and reassesses; nothing to confirm, ticket 123) above the
 * review-pathway map (the same map the old create screen has, on a screen of its own). Create is
 * on throughout.
 */
export default function PathwayStep({ final, review, onChange, onBack, onCreate }: { final: ReviewedQuestion[]; review: ReviewState; onChange: (patch: Partial<ReviewState>) => void; onBack: () => void; onCreate: () => void }) {
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
      <div className="fixed bottom-16 right-6 z-30 flex items-center gap-3">
        <Button variant="ghost" onClick={onBack} data-back>
          Back
        </Button>
        <Button size="lg" onClick={onCreate} className="shadow-lift" data-create>
          Create
        </Button>
      </div>
    </div>
  );
}
