import type { GroupId } from "@/data/taxonomy";

/**
 * The escalation counter from the spec, keyed by taxonomy group (a monic slip then a non-monic
 * slip are two instances of "expanding & factorising"):
 *   1st instance of a mistake in a group -> no-op
 *   2nd instance                        -> trigger isolated practice, reset the count
 *   2nd instance again after a reset    -> trigger practice AND raise the caution flag
 * "I need help" runs the identical trigger path, so a self-identified practice counts as an entry
 * exactly like a detected one. Pure: the session feeds it, the UI reads the result.
 */
export interface EscalationState {
  /** Mistakes seen since the last practice on that group. */
  counts: Partial<Record<GroupId, number>>;
  /** How many times practice has been triggered for that group. */
  entries: Partial<Record<GroupId, number>>;
  /** Groups the teacher should be cautioned about: practice triggered a second time. */
  caution: GroupId[];
}

export const INITIAL_ESCALATION: EscalationState = { counts: {}, entries: {}, caution: [] };

export interface EscalationResult {
  state: EscalationState;
  /** True when this event should open the isolated-practice prompt. */
  trigger: boolean;
  /** True when this event raised the caution flag (it may already have been raised earlier). */
  cautioned: boolean;
}

/** A detected mistake on `group`. */
export function recordMistake(state: EscalationState, group: GroupId): EscalationResult {
  const n = (state.counts[group] ?? 0) + 1;
  if (n < 2) return { state: { ...state, counts: { ...state.counts, [group]: n } }, trigger: false, cautioned: false };
  return trigger(state, group);
}

/** The student asked for help on `group`. Identical to a detected second instance. */
export function requestHelp(state: EscalationState, group: GroupId): EscalationResult {
  return trigger(state, group);
}

function trigger(state: EscalationState, group: GroupId): EscalationResult {
  const entries = (state.entries[group] ?? 0) + 1;
  const cautioned = entries >= 2 && !state.caution.includes(group);
  return {
    state: {
      counts: { ...state.counts, [group]: 0 },
      entries: { ...state.entries, [group]: entries },
      caution: cautioned ? [...state.caution, group] : state.caution,
    },
    trigger: true,
    cautioned,
  };
}
