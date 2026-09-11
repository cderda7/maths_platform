# 72: The offer callout: the pitch, the count, and the attention cues

**What to build:** The two buttons from ticket 71 sit in a callout card that rises into place above the empty Submit spot. Its first line is the tutor's question naming the ticked skills: "Warm up on factorising & the discriminant first?" (or "Warm up before the set?" when the student said "not confident" without ticking skills). A muted second line sizes the commitment: one short problem per ticked skill, "2 short problems, then the set", or "a few short problems, then the set" with none ticked. The callout slides up and fades in over about 200 ms, pulses one accent ring once it lands, and the answer list above dims to half opacity so the callout is the only fully inked thing. No scrim, no modal.

**Blocked by:** 71 (the buttons this dresses).

**Status:** done

**Triage:** `ready-for-agent`

---

## Problem Statement

A student who has just tapped Submit expects the whole screen to change and may already be looking away. The offer has to catch the eye where it appears, say what it is for in the tutor's voice, and make the size of the warm-up plain, without becoming a modal that interrupts.

## Solution

A pure helper composes the two lines from the confidence answer (the skill words as the confidence list shows them, "a & b" / "a, b, & c"), unit-tested. The callout is a bordered card, right-aligned, with the lines and the two buttons; a keyframe animation slides it up and fades it in, then a single ring pulse; the answer list gets a dimmed, non-interactive state. FUTURE_FEATURES gains the teacher switch for the offer and the mid-set re-offer; DECISION_LOG records the fork-on-the-same-screen choice.

## Acceptance

- [x] First line: "Warm up on {skills} first?" with the ticked skills in tick order, "a & b" / "a, b, & c"; "Warm up before the set?" with none
- [x] Second line: "{n} short problem(s), then the set" for n ticked skills; "a few short problems, then the set" with none
- [x] Callout slides up and fades in (~200 ms), one accent ring pulse after landing; answer list at half opacity and not interactive
- [x] Neither button occupies the old Submit spot; the callout's bottom edge sits above it
- [x] FUTURE_FEATURES and DECISION_LOG entries; vitest, eslint, tsc, `next build`, browser check; architecture note and root docs
