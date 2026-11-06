import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialStats, migrateStats, recordActivity, rollOverDay } from './statsLogic';
import { addDaysToKey, dayDiff, localDateKey } from './dateUtils';
import { Achievement, SRSItem } from '../types';

const at = (y: number, m: number, d: number, h = 12) => new Date(y, m - 1, d, h);

const firstStep: Achievement = {
  id: 'ach_first_step',
  title: 'First Step',
  description: '',
  icon: '',
  targetCount: 20,
  currentCount: s => s.xp
};

test('date: local date key uses the local calendar day, not UTC', () => {
  // 8am local is still "yesterday" in UTC for UTC+ zones; the key must not care
  assert.equal(localDateKey(at(2026, 11, 7, 8)), '2026-11-07');
  assert.equal(dayDiff('2026-11-06', '2026-11-07'), 1);
  assert.equal(dayDiff('2026-12-31', '2027-01-01'), 1);
  assert.ok(Number.isNaN(dayDiff('', '2026-11-07')));
  assert.equal(addDaysToKey('2026-11-30', 1), '2026-12-01');
});

test('stats: new players start at zero', () => {
  const s = createInitialStats();
  assert.equal(s.xp, 0);
  assert.equal(s.streakDays, 0);
  assert.equal(s.todayStudiedCount, 0);
  assert.equal(s.wordsMastered, 0);
  assert.equal(s.lastActiveDate, '');
});

test('stats: first activity starts a 1-day streak', () => {
  const s = recordActivity(createInitialStats(), 1, at(2026, 11, 7));
  assert.equal(s.streakDays, 1);
  assert.equal(s.lastActiveDate, '2026-11-07');
  assert.equal(s.todayStudiedCount, 1);
});

test('stats: same-day activity only adds to today count', () => {
  let s = recordActivity(createInitialStats(), 1, at(2026, 11, 7, 9));
  s = recordActivity(s, 1, at(2026, 11, 7, 22));
  assert.equal(s.streakDays, 1);
  assert.equal(s.todayStudiedCount, 2);
});

test('stats: next-day activity extends streak and resets today count', () => {
  let s = recordActivity(createInitialStats(), 3, at(2026, 11, 7));
  s = recordActivity(s, 1, at(2026, 11, 8));
  assert.equal(s.streakDays, 2);
  assert.equal(s.todayStudiedCount, 1);
});

test('stats: a skipped day restarts the streak', () => {
  let s = recordActivity(createInitialStats(), 1, at(2026, 11, 7));
  s = recordActivity(s, 1, at(2026, 11, 8));
  s = recordActivity(s, 1, at(2026, 11, 10));
  assert.equal(s.streakDays, 1);
});

test('stats: rollOverDay breaks a stale streak without recording activity', () => {
  let s = recordActivity(createInitialStats(), 2, at(2026, 11, 7));
  s = { ...s, streakDays: 5 };

  const nextDay = rollOverDay(s, at(2026, 11, 8));
  assert.equal(nextDay.streakDays, 5, 'streak survives until the end of the next day');
  assert.equal(nextDay.todayStudiedCount, 0);
  assert.equal(nextDay.lastActiveDate, '2026-11-07');

  const later = rollOverDay(s, at(2026, 11, 10));
  assert.equal(later.streakDays, 0);

  assert.equal(rollOverDay(s, at(2026, 11, 7)), s, 'unchanged object on the same day');
});

test('stats: v1 saves lose the fake demo numbers', () => {
  const legacy = {
    xp: 60, level: 1, streakDays: 3, lastActiveDate: '2026-11-06', dailyGoalWords: 10,
    todayStudiedCount: 5, wordsMastered: 2, typingHighScore: 0, wordlesCompleted: 0,
    kanjiCrafted: 0, unlockedAchievements: ['ach_first_step']
  };
  const srs: Record<string, SRSItem> = {
    n5_1: { wordId: 'n5_1', intervalDays: 1, easeFactor: 2.5, reviewsCount: 1, streak: 1, nextReviewDate: '2026-11-07T21:22:00.803Z', status: 'learning' }
  };
  const s = migrateStats(legacy, srs, [firstStep]);
  assert.equal(s.version, 2);
  assert.equal(s.xp, 15);
  assert.equal(s.streakDays, 0);
  assert.equal(s.todayStudiedCount, 0);
  assert.equal(s.wordsMastered, 0);
  assert.deepEqual(s.unlockedAchievements, [], 'badge earned only via the fake 45 XP is removed');
});

test('stats: current-version saves are kept as they are', () => {
  const saved = { ...recordActivity(createInitialStats(), 1, at(2026, 11, 7)), xp: 300 };
  const s = migrateStats(saved, {}, [firstStep]);
  assert.equal(s.xp, 300);
  assert.equal(s.streakDays, 1);
});

test('stats: missing or corrupt saves fall back to a fresh start', () => {
  assert.deepEqual(migrateStats(null, {}, []), createInitialStats());
  assert.deepEqual(migrateStats('oops', {}, []), createInitialStats());
});
