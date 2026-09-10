"use client";

import { useEffect, useRef, useState } from "react";
import { Button, Eyebrow } from "@/components/ui";
import { warmupSeed, type SessionAction, type StudentSession } from "@/lib/session";
import { concernTranscript } from "@/lib/warmup";

/**
 * The concerns chat, between the confidence answer and the warm-up: one question per skill the
 * student ticked, in the order they ticked them, each answered in the student's own words. The
 * last answer starts the warm-up; nothing else is on the screen.
 */
export default function WarmupChatScreen({ session, dispatch }: { session: StudentSession; dispatch: (a: SessionAction) => void }) {
  const transcript = concernTranscript(warmupSeed(session), session.warmup.messages);
  const [draft, setDraft] = useState("");
  const end = useRef<HTMLLIElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
    box.current?.focus();
  }, [transcript.length]);
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    dispatch({ type: "warmup/say", text: t });
    setDraft("");
  };

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col px-9 py-9" data-warmup-chat>
      <Eyebrow>Warm-up</Eyebrow>
      <ol className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1" data-chat>
        {transcript.map((m, i) => (
          <li key={i} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`} data-from={m.from}>
            <span className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-snug ${m.from === "student" ? "bg-ink text-white" : "border border-line bg-paper text-ink"}`}>{m.text}</span>
          </li>
        ))}
        <li ref={end} aria-hidden />
      </ol>
      <div className="mt-4 flex items-end gap-2 border-t border-line pt-4">
        <textarea
          ref={box}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={2}
          placeholder="in your own words…"
          aria-label="Your concerns"
          className="min-h-[56px] flex-1 resize-none rounded-2xl border border-line bg-paper px-4 py-3 text-[15px] text-ink placeholder:text-ink-muted focus:border-ink-muted focus:outline-none"
        />
        <Button variant="accent" size="lg" onClick={send} disabled={draft.trim() === ""} data-send>
          send
        </Button>
      </div>
    </div>
  );
}
