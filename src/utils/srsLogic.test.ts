import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextSRS, calculateLevelFromXP } from './srsLogic';

test('srs: again resets interval and streak', () => {
  const current = {
    wordId: 'taberu',
    intervalDays: 4,
    streak: 3,
    easeFactor: 2.5,
    reviewsCount: 3,
  };
  const updated = calculateNextSRS(current, 'again', new Date('2026-11-05T00:00:00Z'));
  assert.equal(updated.intervalDays, 0);
  assert.equal(updated.streak, 0);
  assert.equal(updated.reviewsCount, 4);
  assert.equal(updated.status, 'learning');
});

test('srs: easy advances interval significantly and promotes to mastered', () => {
  const current = {
    wordId: 'mizu',
    intervalDays: 3,
    streak: 3,
    easeFactor: 2.5,
    reviewsCount: 3,
  };
  const updated = calculateNextSRS(current, 'easy', new Date('2026-11-05T00:00:00Z'));
  assert.equal(updated.streak, 4);
  assert.ok(updated.intervalDays >= 7);
  assert.equal(updated.status, 'mastered');
});

test('srs: level from XP calculates thresholds accurately', () => {
  const lvl1 = calculateLevelFromXP(50);
  assert.equal(lvl1.level, 1);
  assert.equal(lvl1.title, 'White Belt Explorer');
  assert.equal(lvl1.progressPercent, 50);

  const lvl2 = calculateLevelFromXP(100);
  assert.equal(lvl2.level, 2);
  assert.equal(lvl2.title, 'Kana Apprentice');

  const lvl4 = calculateLevelFromXP(550);
  assert.equal(lvl4.level, 4);
  assert.equal(lvl4.title, 'Kanji Crafter');
});
