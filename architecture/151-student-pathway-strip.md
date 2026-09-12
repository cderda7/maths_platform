# 151 · The student's header carries the review pathway

Route: `/student` (every stage).

## Files touched

| File | What it does |
|---|---|
| `lib/classStage.ts` | `pathwayStages(c, session, now)`: the pathway's stages as over / current / ahead, no counts; `classStages` (the teacher's card) adds the counts on top. |
| `app/student/PathwayStrip.tsx` | The horizontal strip: a pill per stage with an arrow between, over dark blue / white, current light blue with the purple ring, ahead light blue; `aria-current="step"`. |
| `app/student/StudentChrome.tsx` | Renders the strip in the header's right-hand group, 24 px before the name, on every screen. |
| `app/student/StudentApp.tsx` | Computes the stages from the classroom store, the session and the clock; passes them to the chrome. |
| `lib/classStage.test.ts` | The strip's stages equal the card's minus counts at every skip target. |

## How it connects

```
 classroom store ──┐
 student session ──┼──▶ currentClassStage(c, session, now) ──▶ pathwayStages() ──┬──▶ classStages() + stageDone()  ──▶ /teacher Pathway card (ticket 129)
 useNow()        ──┘        (working · individual · group · whole-class)         │        (N/20 done, start group now)
                                                                                  └──▶ StudentApp ──▶ StudentChrome ──▶ PathwayStrip
                                                                                                                          │
   header:  [Edexia · Maths]  crumb …………………………  [indiv working] → [indiv review] → [group review] → [class review]  Sam Okonkwo (SO)
                                                    over: bg-standout, white   current: bg-standout-soft + ring-accent   ahead: bg-standout-soft
```

## Verified by

vitest (424), eslint, tsc, `next build`; a headless run (`strip149.mjs`): a student tab walks the demo strip from the overview to class review, a teacher tab ends the session, then the peers and history deep links and the `wc` and `none` pathways; at every step the strip is inside the header and vertically centred, clear of the crumb and 24 px from the name, its pills in one row at the same coordinates on every screen, the ring (a shadow) only on the current pill, the colours as specified, the states as the teacher's card shows them.
