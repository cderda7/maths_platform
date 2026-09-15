import type { PathwayStage } from "@/lib/classStage";
import { PathwayPills } from "@/components/StagePill";

/**
 * The review pathway in the student's header (ticket 151): one pill per stage with an arrow between, drawn by the same
 * pills as the teacher's strip (ticket 334, `components/StagePill.tsx`). Stages over are the lit skill button's blue with
 * white text, the current one is light blue ringed in purple, stages ahead light blue. The student's stages carry no
 * counts, so the teacher's fourth state (finished but still current) never shows here. Not interactive: it says where
 * the class is; it takes nobody anywhere.
 */
export default function PathwayStrip({ stages }: { stages: PathwayStage[] }) {
  return <PathwayPills stages={stages} size="ipad" />;
}
