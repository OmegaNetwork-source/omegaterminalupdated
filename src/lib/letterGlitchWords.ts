export const LETTER_GLITCH_WORDS = [
  "OMEGA",
  "DeFi",
  "Web3",
  "ETH",
  "BTC",
  "SOL",
  "Ω",
] as const;

export type LetterGlitchWord = (typeof LETTER_GLITCH_WORDS)[number];

export const normalizeLetterGlitchWord = (word: string) =>
  word.trim().toLowerCase();

