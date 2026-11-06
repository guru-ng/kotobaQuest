import { JLPTLevel, WordleTileState, WordleWord } from '../types';
import { dayDiff } from './dateUtils';

/** Puzzle #1 is the day the site launched. */
export const WORDLE_LAUNCH_DATE = '2026-11-06';

const STORAGE_KEY = 'kotoba_wordle_v1';

export type WordleGameStatus = 'playing' | 'won' | 'lost';
export type WordleMode = 'daily' | 'practice';

export interface SavedWordleGame {
  wordId: string;
  guesses: string[][];
  status: WordleGameStatus;
}

/** Saved progress for one level + length combination, e.g. "N5-3". */
export interface SavedWordleSlot {
  mode: WordleMode;
  daily?: SavedWordleGame;
  practice?: SavedWordleGame;
}

interface SavedWordleStore {
  date: string;
  slots: Record<string, SavedWordleSlot>;
}

export const wordleSlotKey = (level: JLPTLevel, length: number) => `${level}-${length}`;

/** 32-bit FNV-1a hash: tiny, stable across browsers. */
export function hashString(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** Words for a level and kana length, falling back to any level if that level has none. */
export function getWordlePool(words: WordleWord[], level: JLPTLevel, length: number): WordleWord[] {
  const byLength = words.filter(w => Array.from(w.kana).length === length);
  const byLevel = byLength.filter(w => w.jlpt === level);
  return byLevel.length > 0 ? byLevel : byLength;
}

/** Same word for everyone on the same local day, level and length. */
export function pickDailyWord<T>(pool: T[], dateKey: string, salt: string): T | undefined {
  if (pool.length === 0) return undefined;
  return pool[hashString(`${dateKey}|${salt}`) % pool.length];
}

/** Random practice word, avoiding the given ids when possible. */
export function pickPracticeWord<T extends { id: string }>(pool: T[], avoidIds: string[]): T | undefined {
  const candidates = pool.filter(w => !avoidIds.includes(w.id));
  const from = candidates.length > 0 ? candidates : pool;
  return from[Math.floor(Math.random() * from.length)];
}

export function wordlePuzzleNumber(dateKey: string): number {
  const diff = dayDiff(WORDLE_LAUNCH_DATE, dateKey);
  return Number.isNaN(diff) ? 1 : Math.max(1, diff + 1);
}

function isSavedGame(value: unknown): value is SavedWordleGame {
  if (!value || typeof value !== 'object') return false;
  const g = value as SavedWordleGame;
  return (
    typeof g.wordId === 'string' &&
    Array.isArray(g.guesses) &&
    g.guesses.every(row => Array.isArray(row) && row.every(ch => typeof ch === 'string')) &&
    (g.status === 'playing' || g.status === 'won' || g.status === 'lost')
  );
}

/** Today's saved slot, or null (progress from earlier days is discarded). */
export function loadWordleSlot(dateKey: string, slot: string): SavedWordleSlot | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const store = JSON.parse(raw) as SavedWordleStore;
    if (store?.date !== dateKey || !store.slots) return null;
    const saved = store.slots[slot];
    if (!saved) return null;
    return {
      mode: saved.mode === 'practice' ? 'practice' : 'daily',
      daily: isSavedGame(saved.daily) ? saved.daily : undefined,
      practice: isSavedGame(saved.practice) ? saved.practice : undefined
    };
  } catch {
    return null;
  }
}

export function saveWordleSlot(dateKey: string, slot: string, data: SavedWordleSlot): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    let store: SavedWordleStore = { date: dateKey, slots: {} };
    if (raw) {
      const parsed = JSON.parse(raw) as SavedWordleStore;
      if (parsed?.date === dateKey && parsed.slots) store = parsed;
    }
    store.slots[slot] = data;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch {
    // storage unavailable (private mode etc.): progress just won't persist
  }
}

const TILE_EMOJI: Record<WordleTileState, string> = {
  correct: '🟩',
  present: '🟨',
  absent: '⬛',
  empty: '⬜'
};

/** Spoiler-free result grid, Wordle style. */
export function buildWordleShareText(opts: {
  mode: WordleMode;
  dateKey: string;
  level: JLPTLevel;
  length: number;
  evaluations: WordleTileState[][];
  won: boolean;
  maxAttempts: number;
  url?: string;
}): string {
  const score = opts.won ? `${opts.evaluations.length}/${opts.maxAttempts}` : `X/${opts.maxAttempts}`;
  const title =
    opts.mode === 'daily'
      ? `KotobaQuest Wordle #${wordlePuzzleNumber(opts.dateKey)}`
      : 'KotobaQuest Wordle (practice)';
  const grid = opts.evaluations.map(row => row.map(state => TILE_EMOJI[state]).join('')).join('\n');
  const lines = [`${title} · ${opts.level} · ${opts.length} kana · ${score}`, '', grid];
  if (opts.url) lines.push('', opts.url);
  return lines.join('\n');
}
