import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWordleShareText,
  getWordlePool,
  hashString,
  loadWordleSlot,
  pickDailyWord,
  pickPracticeWord,
  saveWordleSlot,
  wordlePuzzleNumber
} from './wordleDaily';
import { WORDLE_WORDS } from '../data/wordleWords';

// Minimal localStorage for node
const memory = new Map<string, string>();
(globalThis as any).localStorage = {
  getItem: (k: string) => (memory.has(k) ? memory.get(k)! : null),
  setItem: (k: string, v: string) => void memory.set(k, v),
  removeItem: (k: string) => void memory.delete(k),
  clear: () => memory.clear()
};

test('wordle daily: same day + slot always gives the same word', () => {
  const pool = getWordlePool(WORDLE_WORDS, 'N5', 3);
  const a = pickDailyWord(pool, '2026-11-07', 'N5-3');
  const b = pickDailyWord(pool, '2026-11-07', 'N5-3');
  assert.ok(a);
  assert.equal(a, b);
  assert.equal(hashString('abc'), hashString('abc'));
});

test('wordle daily: puzzle changes across days (not always the first word)', () => {
  const pool = getWordlePool(WORDLE_WORDS, 'N5', 3);
  const ids = new Set<string>();
  for (let d = 1; d <= 30; d++) {
    const key = `2026-12-${String(d).padStart(2, '0')}`;
    ids.add(pickDailyWord(pool, key, 'N5-3')!.id);
  }
  assert.ok(ids.size > 1, 'more than one word over a month');
});

test('wordle daily: pool respects level and kana length with fallback', () => {
  const pool = getWordlePool(WORDLE_WORDS, 'N5', 4);
  assert.ok(pool.length > 0);
  assert.ok(pool.every(w => Array.from(w.kana).length === 4 && w.jlpt === 'N5'));
  assert.equal(getWordlePool([], 'N5', 3).length, 0);
});

test('wordle daily: practice word avoids the given ids when possible', () => {
  const pool = getWordlePool(WORDLE_WORDS, 'N5', 3);
  for (let i = 0; i < 20; i++) {
    const w = pickPracticeWord(pool, [pool[0].id, pool[1].id]);
    assert.ok(w && w.id !== pool[0].id && w.id !== pool[1].id);
  }
});

test('wordle daily: puzzle numbers count from launch day', () => {
  assert.equal(wordlePuzzleNumber('2026-11-06'), 1);
  assert.equal(wordlePuzzleNumber('2026-11-07'), 2);
});

test('wordle daily: progress is saved per day and slot', () => {
  memory.clear();
  saveWordleSlot('2026-11-07', 'N5-3', {
    mode: 'daily',
    daily: { wordId: 'n5_3_sakura', guesses: [['か', 'ら', 'て']], status: 'playing' }
  });
  const today = loadWordleSlot('2026-11-07', 'N5-3');
  assert.equal(today?.daily?.guesses.length, 1);
  assert.equal(loadWordleSlot('2026-11-07', 'N5-4'), null);
  assert.equal(loadWordleSlot('2026-11-08', 'N5-3'), null, 'old days are discarded');
});

test('wordle daily: share text is spoiler-free', () => {
  const text = buildWordleShareText({
    mode: 'daily',
    dateKey: '2026-11-07',
    level: 'N5',
    length: 3,
    evaluations: [
      ['absent', 'present', 'absent'],
      ['correct', 'correct', 'correct']
    ],
    won: true,
    maxAttempts: 6,
    url: 'https://kotobaquestapp.snjv.club'
  });
  assert.match(text, /KotobaQuest Wordle #2 · N5 · 3 kana · 2\/6/);
  assert.match(text, /⬛🟨⬛\n🟩🟩🟩/);
  assert.doesNotMatch(text, /さくら|sakura/);
});
