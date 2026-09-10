import type { GroupId, LeafId } from "@/data/taxonomy";

/**
 * The escalation counter from the spec, keyed by taxonomy group (a monic slip then a non-monic
 * slip are two instances of "expanding & factorising"):
 *   1st instance of a mistake in a group -> no-op
 *   2nd instance                        -> trigger isolated practice, reset the count
 *   2nd instance again after a reset    -> trigger practice AND raise the caution flag
 * "I need help" runs the identical trigger path, so a self-identified practice
 * counts as an entry exactly like a detected one. The leaves slipped on since the last practice
 * are kept, so the practice can go to the most fundamental of them. Pure: the session feeds it,
 * the UI reads the result.
 */
export interface EscalationState {
  /** Mistakes seen since the last practice on that group. */
  counts: Partial<Record<GroupId, number>>;
  /** Leaves slipped on since the last practice on that group, first slip first. */
  slips: Partial<Record<GroupId, LeafId[]>>;
  /** How many times practice has been triggered for that group. */
  entries: Partial<Record<GroupId, number>>;
  /** Groups the teacher should be cautioned about: practice triggered a second time. */
  caution: GroupId[];
}

export const INITIAL_ESCALATION: EscalationState = { counts: {}, slips: {}, entries: {}, caution: [] };

export interface EscalationResult {
  state: EscalationState;
  /** On a trigger: the leaves slipped on in this group since its last practice (this one included). */
  slipped: LeafId[];
  /** True when this event should open the isolated-practice prompt. */
  trigger: boolean;
  /** True when this event raised the caution flag (it may already have been raised earlier). */
  cautioned: boolean;
}

/** A detected mistake on `group` (on `leaf`, when known). Practice triggers on the second instance since the last practice. */
export function recordMistake(state: EscalationState, group: GroupId, leaf?: LeafId): EscalationResult {
  const n = (state.counts[group] ?? 0) + 1;
  const prior = state.slips[group] ?? [];
  const slipped = leaf && !prior.includes(leaf) ? [...prior, leaf] : prior;
  const counted = { ...state, counts: { ...state.counts, [group]: n }, slips: { ...state.slips, [group]: slipped } };
  if (n < 2) return { state: counted, slipped, trigger: false, cautioned: false };
  return trigger(counted, group);
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
      slips: { ...state.slips, [group]: [] },
      entries: { ...state.entries, [group]: entries },
      caution: cautioned ? [...state.caution, group] : state.caution,
    },
    slipped: state.slips[group] ?? [],
    trigger: true,
    cautioned,
  };
}
