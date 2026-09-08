import type { SubskillId } from "@/data/types";

/**
 * The subskill-instance counter from the spec:
 *   1st instance of a subskill mistake  -> no-op
 *   2nd instance                        -> trigger isolated practice, reset the count
 *   2nd instance again after a reset    -> trigger practice AND raise the caution flag
 * "I need help" runs the identical trigger path, so a self-identified practice counts as an entry
 * exactly like a detected one. Pure: the session feeds it, the UI reads the result.
 */
export interface EscalationState {
  /** Mistakes seen since the last practice on that subskill. */
  counts: Partial<Record<SubskillId, number>>;
  /** How many times practice has been triggered for that subskill. */
  entries: Partial<Record<SubskillId, number>>;
  /** Subskills the teacher should be cautioned about: practice triggered a second time. */
  caution: SubskillId[];
}

export const INITIAL_ESCALATION: EscalationState = { counts: {}, entries: {}, caution: [] };

export interface EscalationResult {
  state: EscalationState;
  /** True when this event should open the isolated-practice prompt. */
  trigger: boolean;
  /** True when this event raised the caution flag (it may already have been raised earlier). */
  cautioned: boolean;
}

/** A detected mistake on `subskill`. */
export function recordMistake(state: EscalationState, subskill: SubskillId): EscalationResult {
  const n = (state.counts[subskill] ?? 0) + 1;
  if (n < 2) return { state: { ...state, counts: { ...state.counts, [subskill]: n } }, trigger: false, cautioned: false };
  return trigger(state, subskill);
}

/** The student asked for help on `subskill`. Identical to a detected second instance. */
export function requestHelp(state: EscalationState, subskill: SubskillId): EscalationResult {
  return trigger(state, subskill);
}

function trigger(state: EscalationState, subskill: SubskillId): EscalationResult {
  const entries = (state.entries[subskill] ?? 0) + 1;
  const cautioned = entries >= 2 && !state.caution.includes(subskill);
  return {
    state: {
      counts: { ...state.counts, [subskill]: 0 },
      entries: { ...state.entries, [subskill]: entries },
      caution: cautioned ? [...state.caution, subskill] : state.caution,
    },
    trigger: true,
    cautioned,
  };
}
