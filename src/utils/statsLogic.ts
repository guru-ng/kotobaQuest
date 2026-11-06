import { Achievement, SRSItem, UserStats } from '../types';
import { dayDiff, localDateKey } from './dateUtils';
import { calculateLevelFromXP } from './srsLogic';

export const STATS_VERSION = 2;

/** v1 seeded every new player with 45 XP, so legacy saves carry that bonus. */
const LEGACY_SEED_XP = 45;

/** A brand-new player starts at zero: no fake streak, XP or mastered words. */
export function createInitialStats(): UserStats {
  return {
    version: STATS_VERSION,
    xp: 0,
    level: 1,
    streakDays: 0,
    lastActiveDate: '',
    dailyGoalWords: 10,
    todayStudiedCount: 0,
    wordsMastered: 0,
    typingHighScore: 0,
    wordlesCompleted: 0,
    kanjiCrafted: 0,
    unlockedAchievements: []
  };
}

export function countMastered(srsItems: Record<string, SRSItem>): number {
  return Object.values(srsItems).filter(item => item?.status === 'mastered').length;
}

/**
 * Brings saved stats up to the current schema.
 *
 * v1 saves started from hard-coded demo values (45 XP, 3-day streak, 4 studied
 * today, 2 mastered) and never updated the streak, so those numbers are
 * stripped out and recomputed from real data where possible.
 */
export function migrateStats(
  raw: unknown,
  srsItems: Record<string, SRSItem>,
  achievements: Achievement[]
): UserStats {
  const base = createInitialStats();
  if (!raw || typeof raw !== 'object') return base;

  const saved = raw as Partial<UserStats>;
  const merged: UserStats = {
    ...base,
    ...saved,
    unlockedAchievements: Array.isArray(saved.unlockedAchievements) ? saved.unlockedAchievements : []
  };

  if ((saved.version ?? 1) >= STATS_VERSION) return merged;

  const xp = Math.max(0, (Number(saved.xp) || 0) - LEGACY_SEED_XP);
  const migrated: UserStats = {
    ...merged,
    version: STATS_VERSION,
    xp,
    level: calculateLevelFromXP(xp).level,
    streakDays: 0,
    lastActiveDate: '',
    todayStudiedCount: 0,
    wordsMastered: countMastered(srsItems)
  };

  // Drop badges that were only reached thanks to the fake starting numbers.
  migrated.unlockedAchievements = merged.unlockedAchievements.filter(id => {
    const ach = achievements.find(a => a.id === id);
    return !ach || ach.currentCount(migrated) >= ach.targetCount;
  });

  return migrated;
}

/**
 * Applies the calendar to stats when no activity has happened yet today:
 * the daily counter resets, and a streak that skipped a day is broken.
 * Returns the same object when nothing changes (safe to use in setState).
 */
export function rollOverDay(stats: UserStats, now: Date = new Date()): UserStats {
  const today = localDateKey(now);
  if (stats.lastActiveDate === today) return stats;

  const gap = stats.lastActiveDate ? dayDiff(stats.lastActiveDate, today) : NaN;
  const streakDays = gap === 1 ? stats.streakDays : 0;

  if (streakDays === stats.streakDays && stats.todayStudiedCount === 0) return stats;
  return { ...stats, streakDays, todayStudiedCount: 0 };
}

/**
 * Records study activity for today: extends the streak when the last activity
 * was yesterday, restarts it after a gap, and counts `studied` items toward
 * today's goal.
 */
export function recordActivity(stats: UserStats, studied = 1, now: Date = new Date()): UserStats {
  const today = localDateKey(now);
  let streakDays = stats.streakDays;
  let todayStudiedCount = stats.todayStudiedCount;

  if (stats.lastActiveDate !== today) {
    const gap = stats.lastActiveDate ? dayDiff(stats.lastActiveDate, today) : NaN;
    streakDays = gap === 1 ? streakDays + 1 : 1;
    todayStudiedCount = 0;
  }

  return {
    ...stats,
    streakDays: Math.max(1, streakDays),
    lastActiveDate: today,
    todayStudiedCount: todayStudiedCount + studied
  };
}
