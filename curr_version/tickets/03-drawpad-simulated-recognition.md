# 03: Drawpad with simulated line-by-line recognition

**What to build:** The student writes their solution by hand on a drawpad inside the iPad frame using mouse or trackpad. Beside the canvas a transcription column fills in line by line as they write: on each stroke completion (pen-up followed by a short idle), the next pre-authored "recognised" line for the current problem appears, typeset. The audience should not be able to tell the recognition is scripted. Undo removes the last stroke and, if a line was revealed for it, the line. Clear resets the problem. The scripted recognition fixture covers all four demo problems, including the wrong lines needed by later tickets.

**Blocked by:** 01 (Scaffold, iPad stage, demo assignment fixture).

**Status:** done

- [x] Pointer-event drawpad (mouse, trackpad and touch) with smooth ink, no scroll-jank inside the frame
- [x] Recognised lines appear progressively, timed to stroke completion, in a transcription column with a subtle "recognising…" state between strokes
- [x] Recognition script per problem: an ordered list of lines the demo will "recognise", including the scripted wrong lines
- [x] Undo and clear behave as described; per-problem canvas state survives moving between problems
- [x] Problem navigation within the set (next / previous) inside the frame
- [x] Architecture note written and folded into `ARCHITECTURE.md`
