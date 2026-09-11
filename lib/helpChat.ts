import type Anthropic from "@anthropic-ai/sdk";
import { PRACTICES } from "@/data/practice";
import { studentLeafName } from "@/data/taxonomy";
import type { ChatMessage, Hint, PracticeProblem } from "@/data/types";

/**
 * The help chat on the practice pad: the fourth option under "I need help", a conversation with
 * a tutor that only ever hints. Everything here is pure (the prompt, the transcript, the request
 * shape, the rendering of a reply), so the rules the tutor is held to are readable and tested;
 * `app/api/help-chat/route.ts` sends it to the model and `components/HelpChat.tsx` shows it.
 * See DECISION_LOG.md, "The help chat is the one live model call".
 */

/** The model the tutor runs on. */
export const HELP_CHAT_MODEL = "claude-opus-5";

/** Room for a reply: the tutor is held to a few sentences, so this is a ceiling, not a target. */
export const HELP_CHAT_MAX_TOKENS = 2048;

/** The tutor's fixed first line, shown by the pad when the chat opens; the student's first message answers it. Not stored. */
export const CHAT_OPENER = "What's got you stuck?";

/**
 * The tutor's line when the pad opens the chat on a hint: the student asked for another hint
 * while their lines had not moved past what hint `n` (as numbered on the pad) asks for. Said by
 * the pad for the tutor and stored in the chat, so it is there on a reopen and the brief can see
 * it; `HINT_OPENER_START` is how the brief and the pad recognise one.
 */
export const HINT_OPENER_START = "Let's talk more about hint ";
export const hintOpener = (n: number): string => `${HINT_OPENER_START}${n} before another one. What is it asking you to do here, in your own words?`;

/** What the chat opened with, as the student saw it: the pad's stored tutor line when there is one first, else the fixed opener. */
export const chatOpener = (messages: ChatMessage[]): string => (messages[0]?.from === "tutor" ? messages[0].text : CHAT_OPENER);

/** What the tutor says when the model declines the turn, so the student is never left with an empty bubble. */
export const CHAT_DECLINED = "Let's stay with the problem. Tell me the last line you're sure about.";

/** The pad's practice problem with this id: a first problem or its follow-up. */
export function findPractice(id: string): PracticeProblem | null {
  for (const p of Object.values(PRACTICES)) {
    if (!p) continue;
    if (p.id === id) return p;
    if (p.followUp?.id === id) return p.followUp;
  }
  return null;
}

/** What the pad sends for one turn: the problem, the lines read so far, and the chat so far, the student's newest message last. */
export interface HelpChatRequest {
  problem: string;
  lines: string[];
  messages: ChatMessage[];
}

const isMessage = (m: unknown): m is ChatMessage =>
  !!m && typeof m === "object" && ((m as ChatMessage).from === "student" || (m as ChatMessage).from === "tutor") && typeof (m as ChatMessage).text === "string";

/** A request body checked field by field, or null. The transcript must end with the student. */
export function parseHelpChatRequest(raw: unknown): HelpChatRequest | null {
  if (!raw || typeof raw !== "object") return null;
  const { problem, lines, messages } = raw as Record<string, unknown>;
  if (typeof problem !== "string") return null;
  if (!Array.isArray(lines) || !lines.every((l) => typeof l === "string")) return null;
  if (!Array.isArray(messages) || !messages.every(isMessage)) return null;
  const last = messages[messages.length - 1];
  if (!last || last.from !== "student" || last.text.trim() === "") return null;
  return { problem, lines: lines as string[], messages: messages as ChatMessage[] };
}

/**
 * The tutor's brief for one problem. The reference working and the pad's own hint are in it so
 * the tutor knows the ground; the rules below are what make it a hint chat rather than an answer
 * machine, and what make it offer a choice of ways in before it settles on one.
 */
export function helpChatSystem(p: PracticeProblem, lines: string[], messages: ChatMessage[] = []): string {
  const skill = studentLeafName(p.leaf).name;
  const opener = chatOpener(messages);
  const steps = p.steps.map((s, i) => `${i + 1}. ${s.label}: ${s.tex}`).join("\n");
  const ways = p.approaches?.length ? p.approaches.map((a) => `- ${a.name}: ${a.hint}`).join("\n") : "(one way in; the hints above name it)";
  const where = (h: Hint) => (!h.at ? "anywhere" : h.at.includes(0) ? "on a blank pad" : `after line ${h.at.join(" or ")} of the reference working`);
  const hints = p.hints.map((h, i) => `${i + 1}. (${where(h)}) ${h.text}`).join("\n");
  const written = lines.length ? lines.map((l, i) => `${i + 1}. ${l}`).join("\n") : "(nothing yet)";
  return `You are the tutor inside Edexia's maths practice pad. A Year 11 Mathematical Methods student (QCE Unit 1) is doing one short practice problem on one skill, writing by hand on the pad, and has opened a chat beside it because they are stuck. You are talking to one student in a narrow chat panel.

The problem
Skill: ${skill}
${p.stem}
${p.tex}
(TeX as the pad shows it.)

The reference working, for your eyes only. Never show it, never paste a step from it, never confirm or deny a final answer against it.
${steps}

The hints the pad already offers, one per ask, each picked for where the student's lines have got:
${hints}

Ways in at this stage. Offer these before inventing your own; each is a name and the hint that goes with it.
${ways}

What the student has written so far, one line per row, as the pad read it.
${written}

How you help
- Hints, never answers. Do not write the next line for the student, do not carry a step out, do not give a final value or a full method. The most you say is the next move, named, and why it is the move.
- Start from where the student is. Read their lines and their message before you say anything. If a line has a slip, point at that line and what to check, not at the fix.
- When more than one sensible way in exists at this stage (the ways listed, or ones you know), lay out two of them, one short sentence each, as hints not procedures, and finish by asking which one makes more sense to them. Then stay on the way they chose. Bring the other back only if they get stuck on the one they picked, or ask for it.
- Once a way is chosen, give the smallest next nudge on that path, one at a time, and check what they got before the next.
- If they ask for the answer outright, say warmly that you will not give it, then give the smallest nudge instead.
- If they are simply right, say so and stop; do not add a nudge they do not need.
- Two or three short sentences. Plain words, Australian spelling (factorise, not factorize). Maths goes inside $...$ as TeX, nothing else does. No headings, no lists, no bold.
- The chat opened with your line "${opener}"; the student's first message is their answer to it. Stay with this problem; if they ask about something else, bring them back to it.
- A line of yours beginning "${HINT_OPENER_START}" was said for you by the pad: the student asked for another hint while their lines had not moved past what that hint asks for, so the pad opened this chat instead of giving the next hint. Talk that hint through. Ask what it is asking them to do with their lines, in their own words; if they have it, send them back to the pad to write that line; if they have not, help them read the hint, one piece at a time. Do not say what the next hint would say until they have used this one.`;
}

/**
 * The transcript as the API takes it: turns from the student's first message on (the opener is in
 * the brief, not here). Two lines in a row from the same side, such as a reply and then the pad's
 * hint line for the tutor, are one turn, so the roles alternate as the API requires.
 */
export function helpChatMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  const start = messages.findIndex((m) => m.from === "student");
  if (start < 0) return [];
  const out: { role: "user" | "assistant"; content: string }[] = [];
  for (const m of messages.slice(start)) {
    const role = m.from === "student" ? "user" : "assistant";
    const prev = out[out.length - 1];
    if (prev && prev.role === role) prev.content = `${prev.content}\n\n${m.text}`;
    else out.push({ role, content: m.text });
  }
  return out;
}

/** A run of a chat line: prose, or TeX to typeset. */
export interface ChatSegment {
  text: string;
  tex?: boolean;
}

/**
 * Splits a reply into prose and the maths inside `$...$` (or `\(...\)`), for the bubble to
 * typeset. Maths never starts or ends with a space and is never followed by a digit, so "$5 and
 * $x$" is a price and one term, and an unclosed `$` is left as text.
 */
export function chatSegments(text: string): ChatSegment[] {
  const out: ChatSegment[] = [];
  const re = /\$(?!\s)([^$\n]+?)(?<!\s)\$(?!\d)|\\\((.+?)\\\)/g;
  let cursor = 0;
  for (const m of text.matchAll(re)) {
    if (m.index > cursor) out.push({ text: text.slice(cursor, m.index) });
    out.push({ text: (m[1] ?? m[2]).trim(), tex: true });
    cursor = m.index + m[0].length;
  }
  if (cursor < text.length) out.push({ text: text.slice(cursor) });
  return out;
}
