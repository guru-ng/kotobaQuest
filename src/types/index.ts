export type GameMode = 'wordle' | 'typing' | 'kanji' | 'flashcards' | 'survival';

export type JLPTLevel = 'N5' | 'N4' | 'N3' | 'N2' | 'N1';

export type UILanguage = 'en' | 'ja';

export interface VocabWord {
  id: string;
  kanji: string;
  kana: string;
  romaji: string;
  english: string;
  jlpt: JLPTLevel;
  category: 'food' | 'travel' | 'daily' | 'basics' | 'adjectives' | 'verbs' | 'business' | 'advanced';
  /** Example sentences exist on the hand-written entries; generated ones have none yet. */
  exampleJa?: string;
  exampleKana?: string;
  exampleEn?: string;
  notes?: string;
  /** True for entries produced by scripts/build-content.ts from open datasets. */
  generated?: boolean;
}

export type WordleTileState = 'correct' | 'present' | 'absent' | 'empty';

export interface WordleWord {
  id: string;
  kana: string; // The target word in Hiragana (exact 3 or 4 kana length)
  kanji?: string;
  romaji: string;
  english: string;
  hint: string;
  jlpt: JLPTLevel;
  /** Picture clue; generated words have none and fall back to a kanji card. */
  imageUrl?: string;
  category?: string;
  generated?: boolean;
}

export interface KanjiPuzzle {
  id: string;
  kanji: string;
  meaning: string;
  onyomi: string[];
  kunyomi: string[];
  radicals: string[]; // required radical IDs or symbols
  radicalNames: string[];
  mnemonic: string;
  strokeCount: number;
  level: JLPTLevel;
  examples: Array<{ word: string; reading: string; meaning: string }>;
}

export interface RadicalItem {
  id: string;
  symbol: string;
  name: string;
  meaning: string;
}

export interface SRSItem {
  wordId: string;
  intervalDays: number;
  easeFactor: number;
  reviewsCount: number;
  streak: number;
  nextReviewDate: string; // ISO date string
  lastReviewedDate?: string;
  status: 'new' | 'learning' | 'mastered';
}

export interface UserStats {
  /** Schema version of the saved stats (missing = v1, which shipped fake demo numbers). */
  version?: number;
  xp: number;
  level: number;
  streakDays: number;
  lastActiveDate: string;
  dailyGoalWords: number;
  todayStudiedCount: number;
  wordsMastered: number;
  typingHighScore: number;
  wordlesCompleted: number;
  kanjiCrafted: number;
  unlockedAchievements: string[];
}

export interface Achievement {
  id: string;
  title: string;
  titleJa?: string;
  description: string;
  descriptionJa?: string;
  icon: string;
  targetCount: number;
  currentCount: (stats: UserStats) => number;
}
