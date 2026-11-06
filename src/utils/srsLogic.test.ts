import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateNextSRS, calculateLevelFromXP, buildReviewQueue, isDue, nextReviewDateKey, formatInterval } from './srsLogic';

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

test('srs: review queue has due cards first (most overdue first), then new, and skips future cards', () => {
  const now = new Date(2026, 10, 10, 9); // 10 Nov, 9am local
  const cards = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }];
  const item = (id: string, next: Date) => ({
    wordId: id, intervalDays: 1, easeFactor: 2.5, reviewsCount: 1, streak: 1,
    nextReviewDate: next.toISOString(), status: 'learning' as const
  });
  const srs = {
    a: item('a', new Date(2026, 10, 20)),      // future: excluded
    b: item('b', new Date(2026, 10, 10, 21)),  // later today: due today
    c: item('c', new Date(2026, 10, 8))        // overdue
  };
  const { queue, dueCount, newCount } = buildReviewQueue(cards, srs, now);
  assert.deepEqual(queue.map(c => c.id), ['c', 'b', 'd']);
  assert.equal(dueCount, 2);
  assert.equal(newCount, 1);
  assert.equal(isDue(srs.a, now), false);
  assert.equal(nextReviewDateKey(cards, srs), '2026-11-08');
});

test('srs: interval labels match the real schedule', () => {
  assert.equal(calculateNextSRS({ wordId: 'x' }, 'good').intervalDays, 1);
  assert.equal(formatInterval(0), 'Now');
  assert.equal(formatInterval(1), '1d');
  assert.equal(formatInterval(45), '2mo');
  assert.equal(formatInterval(3, 'ja'), '3日');
});
