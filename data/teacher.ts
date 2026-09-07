import type { SubskillId } from "./types";

export const CLASS_PATTERNS = [
  { count: 5, of: 12, text: "guessed a non-monic factor pair in Q2 without expanding back", subskill: "factoring" as SubskillId, problemId: "q2" },
  { count: 4, of: 12, text: "applied the null factor law to (x − 3)(x + 2) = 6 without rearranging", subskill: "algebra" as SubskillId, problemId: "q3" },
  { count: 3, of: 12, text: "cleared denominators in Q5 on one side only", subskill: "fractions" as SubskillId, problemId: "q5" },
  { count: 2, of: 12, text: "read the y-intercept as a root on the graphing warm-up", subskill: "graphing" as SubskillId, problemId: "p-graph" },
];

export interface HintSuggestion {
  problemId: string;
  kind: "might need a hint" | "reads as complicated";
  why: string;
  evidence: string;
}

export const HINT_SUGGESTIONS: HintSuggestion[] = [
  {
    problemId: "q3",
    kind: "might need a hint",
    why: "Four students used the null factor law on a product equal to 6.",
    evidence: "Confidence was 'certain' or 'fairly sure' for three of the four — they don't know it's a trap.",
  },
  {
    problemId: "q5",
    kind: "reads as complicated",
    why: "Median time on this item is 2.4× the estimate, with two abandons.",
    evidence: "Chat transcripts show students asking what to do with the 3/x before anything else.",
  },
  {
    problemId: "q6",
    kind: "reads as complicated",
    why: "Students report 'not sure' before starting more than on any other item.",
    evidence: "Six check-ins at 'not sure' or 'a bit unsure'; two students asked the tutor what 'exactly one solution' means.",
  },
  {
    problemId: "q7",
    kind: "might need a hint",
    why: "A negative leading coefficient in a worded problem.",
    evidence: "Only three students have reached it; two divided by 10 instead of −10.",
  },
];

export interface ChatHighlight {
  problemId: string;
  quote: string;
  who: "student" | "tutor";
  note: string;
}

export const JORDAN_HIGHLIGHTS: ChatHighlight[] = [
  {
    problemId: "q4",
    who: "student",
    quote: "oh. b = −5 and c = −1",
    note: "Caught the sign slip after one question; wasn't told.",
  },
  {
    problemId: "q4",
    who: "student",
    quote: "37 is prime so the root doesn't simplify, and 5 and 6 don't have a common factor with it so the fraction stays",
    note: "Justified the final form unprompted.",
  },
  {
    problemId: "q2",
    who: "tutor",
    quote: "Try expanding this back. What do you get for the x term?",
    note: "Student did not expand back on Q2; did on the warm-up and again on Q3.",
  },
];

export interface CheckIn {
  problemId: string;
  before: "not sure" | "a bit unsure" | "fairly sure" | "certain";
  outcome: "sound" | "slip" | "shaky";
}

export const JORDAN_CHECKINS: CheckIn[] = [
  { problemId: "q1", before: "certain", outcome: "sound" },
  { problemId: "q2", before: "certain", outcome: "slip" },
  { problemId: "p-factor", before: "fairly sure", outcome: "sound" },
  { problemId: "q3", before: "a bit unsure", outcome: "sound" },
  { problemId: "q4", before: "not sure", outcome: "shaky" },
];

/** What Edexia reports to the teacher about Jordan for this set — shown verbatim to the student too. */
export const JORDAN_REPORT = {
  studentId: "jordan",
  assignment: "Roots of a quadratic — Set 3",
  observations: [
    { id: "factoring" as SubskillId, status: "developing", text: "Non-monic factor pair guessed on Q2 without checking. Used the ac method with an expand-back check on the warm-up and Q3." },
    { id: "algebra" as SubskillId, status: "secure", text: "Rearranged Q3 correctly before factorising. One sign slip reading coefficients on Q4, self-corrected in chat." },
    { id: "fractions" as SubskillId, status: "developing", text: "Justified the exact form on Q4. Not yet seen on Q5 (clearing denominators)." },
    { id: "roots" as SubskillId, status: "developing", text: "Chooses a sensible method each time. Null factor law applied correctly, including when the product wasn't zero." },
  ],
  confidence: "Said 'certain' before Q2 (which had a slip) and 'not sure' before Q4 (which went well after one prompt). Confidence and outcome are moving closer together across the set.",
  chat: [
    "Caught the sign error on Q4 after one question — wasn't told the answer.",
    "Gave a reason for leaving √37 unsimplified without being asked.",
  ],
  help: "Used the parallel example once (Q4). Did not open the video.",
  notReported: [
    "No score, mark, or ranking.",
    "No time-on-task except where a problem was abandoned.",
    "Your own words in the chat are not sent — only the highlights above.",
  ],
};
