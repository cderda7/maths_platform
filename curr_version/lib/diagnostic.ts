import { DIAGNOSTIC_MAP } from "@/data/diagnostic";

export function isCorrect(questionId: string, option: string): boolean {
  return DIAGNOSTIC_MAP[questionId]?.correct === option;
}
