"use client";

import { useEffect, useRef, useState } from "react";
import M from "@/components/Math";
import { Button, Eyebrow } from "@/components/ui";
import type { ChatMessage, PracticeProblem } from "@/data/types";
import { chatOpener, chatSegments } from "@/lib/helpChat";
import type { RunKey, SessionAction } from "@/lib/session";

/** What the tutor's bubble says when a turn fails. Shown, never stored. */
const NOT_CONNECTED = "The chat isn't connected on this device.";
const FAILED = "I lost that one. Say it again?";

/**
 * The help chat, in the pad's right column under the read-back (the student's lines stay in view): the tutor's opener,
 * the chat so far on this problem, the reply streaming in, and a box to write in. Each line said
 * is dispatched into the run as it happens, so the chat survives a reload and a reopen; a reply
 * lands on the problem it was asked on even if the pad has moved to the follow-up. Mount one per
 * problem (key it by the problem id): unmounting drops the turn in flight. While the worked
 * example plays, the chat is headed "Question about a step?", opens by asking which step, has no
 * close (there is no read-back to go back to) and sends the number of steps on screen with each
 * turn, so the tutor may explain those and only those.
 */
export default function HelpChat({
  problem,
  lines,
  messages,
  runKey,
  dispatch,
  onClose,
  exampleShown,
  className = "",
}: {
  problem: PracticeProblem;
  /** The lines the pad has read on this problem, as TeX. */
  lines: string[];
  messages: ChatMessage[];
  runKey: RunKey;
  dispatch: (a: SessionAction) => void;
  /** Back to the read-back; absent beside the worked example, which has no read-back to go back to. */
  onClose?: () => void;
  /** Set while the worked example is playing beside the chat: how many of its steps are on screen. */
  exampleShown?: number;
  /** Extra classes on the outer box: the pad's top border when the chat sits under the read-as lines. */
  className?: string;
}) {
  const example = exampleShown !== undefined;
  const [draft, setDraft] = useState("");
  /** The reply streaming in: "" once the turn is sent, the text so far after that, null between turns. */
  const [pending, setPending] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const inFlight = useRef<AbortController | null>(null);
  const end = useRef<HTMLLIElement>(null);
  const box = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages.length, pending, note]);
  useEffect(() => {
    // Beside the worked example the student's next tap is "Next step", so the box waits for them.
    if (!example) box.current?.focus();
    return () => inFlight.current?.abort();
  }, [example]);

  const send = async () => {
    const text = draft.trim();
    if (!text || pending !== null) return;
    setDraft("");
    setNote(null);
    const said: ChatMessage = { from: "student", text };
    dispatch({ type: "run/chat", run: runKey, problem: problem.id, message: said });
    const ctl = new AbortController();
    inFlight.current = ctl;
    setPending("");
    let reply = "";
    try {
      const res = await fetch("/api/help-chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ problem: problem.id, lines, messages: [...messages, said], ...(example ? { shown: exampleShown } : {}) }),
        signal: ctl.signal,
      });
      if (!res.ok || !res.body) {
        setNote(res.status === 503 ? NOT_CONNECTED : FAILED);
        return;
      }
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { value, done } = await reader.read();
        if (done) break;
        reply += decoder.decode(value, { stream: true });
        setPending(reply);
      }
      reply = (reply + decoder.decode()).trim();
      if (reply) dispatch({ type: "run/chat", run: runKey, problem: problem.id, message: { from: "tutor", text: reply } });
      else setNote(FAILED);
    } catch {
      if (!ctl.signal.aborted) setNote(FAILED);
    } finally {
      if (inFlight.current === ctl) {
        inFlight.current = null;
        if (!ctl.signal.aborted) setPending(null);
      }
    }
  };

  // The pad's own tutor line (the chat opened on a hint) is stored first and is the opener; otherwise the fixed one for where the chat is, never stored.
  const transcript: ChatMessage[] = messages[0]?.from === "tutor" ? messages : [{ from: "tutor", text: chatOpener(messages, example) }, ...messages];
  const tutor = "border border-line bg-paper text-ink";
  const student = "bg-ink text-white";
  return (
    <div className={`flex min-h-0 flex-1 flex-col ${className}`} data-help-chat data-example-chat={example ? "" : undefined}>
      <div className="flex items-center justify-between">
        <Eyebrow>{example ? "Question about a step?" : "Chat"}</Eyebrow>
        {onClose && (
          <button type="button" onClick={onClose} className="text-[12.5px] text-ink-soft hover:text-ink" data-chat-close>
            close
          </button>
        )}
      </div>
      {/* The bubbles gather at the foot, just above the box to write in; a long chat scrolls. The empty first item takes the slack. */}
      <ol className="mt-3 flex min-h-0 flex-1 flex-col space-y-2 overflow-y-auto pr-1" data-chat>
        <li className="mt-auto" aria-hidden />
        {transcript.map((m, i) => (
          <li key={i} className={`flex ${m.from === "student" ? "justify-end" : "justify-start"}`} data-from={m.from}>
            <span className={`max-w-[92%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${m.from === "student" ? student : tutor}`}>
              <ChatText text={m.text} />
            </span>
          </li>
        ))}
        {pending !== null && (
          <li className="flex justify-start" data-from="tutor" data-pending>
            <span className={`max-w-[92%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug ${tutor}`}>
              {pending ? <ChatText text={pending} /> : <span className="animate-pulse text-ink-muted">…</span>}
            </span>
          </li>
        )}
        {note && (
          <li className="flex justify-start" data-from="tutor" data-note>
            <span className={`max-w-[92%] rounded-2xl px-3.5 py-2 text-[14px] leading-snug text-ink-soft ${tutor}`}>{note}</span>
          </li>
        )}
        <li ref={end} aria-hidden />
      </ol>
      <div className="mt-3 flex items-end gap-2">
        <textarea
          ref={box}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          rows={2}
          placeholder="in your own words…"
          aria-label="Your message to the tutor"
          className="min-h-[52px] flex-1 resize-none rounded-2xl border border-line bg-paper px-3.5 py-2.5 text-[14px] text-ink placeholder:text-ink-muted focus:border-ink-muted focus:outline-none"
        />
        <Button variant="accent" onClick={() => void send()} disabled={draft.trim() === "" || pending !== null} data-send>
          send
        </Button>
      </div>
    </div>
  );
}

/** A chat line with its maths typeset: `$x^2$` in a reply is a KaTeX span, the rest is text. */
function ChatText({ text }: { text: string }) {
  return (
    <>
      {chatSegments(text).map((seg, i) => (seg.tex ? <M key={i} tex={seg.text} /> : <span key={i}>{seg.text}</span>))}
    </>
  );
}
