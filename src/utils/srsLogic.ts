import { SRSItem } from '../types';

export type FlashcardRating = 'again' | 'hard' | 'good' | 'easy';

/**
 * Calculates updated SRS metadata based on modified SuperMemo (SM-2) principles
 */
export function calculateNextSRS(
  current: Partial<SRSItem> & { wordId: string },
  rating: FlashcardRating,
  now: Date = new Date()
): SRSItem {
  let intervalDays = current.intervalDays ?? 0;
  let easeFactor = current.easeFactor ?? 2.5;
  let reviewsCount = (current.reviewsCount ?? 0) + 1;
  let streak = current.streak ?? 0;

  switch (rating) {
    case 'again':
      intervalDays = 0; // review today
      streak = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
      break;

    case 'hard':
      intervalDays = intervalDays === 0 ? 1 : Math.max(1, Math.round(intervalDays * 1.2));
      streak += 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      break;

    case 'good':
      if (intervalDays === 0) {
        intervalDays = 1;
      } else if (intervalDays === 1) {
        intervalDays = 3;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor);
      }
      streak += 1;
      break;

    case 'easy':
      if (intervalDays === 0) {
        intervalDays = 4;
      } else if (intervalDays === 1) {
        intervalDays = 6;
      } else {
        intervalDays = Math.round(intervalDays * easeFactor * 1.3);
      }
      streak += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      break;
  }

  const nextDate = new Date(now.getTime());
  nextDate.setDate(nextDate.getDate() + intervalDays);

  const status = streak >= 4 || intervalDays >= 7 ? 'mastered' : 'learning';

  return {
    wordId: current.wordId,
    intervalDays,
    easeFactor: Number(easeFactor.toFixed(2)),
    reviewsCount,
    streak,
    lastReviewedDate: now.toISOString(),
    nextReviewDate: nextDate.toISOString(),
    status
  };
}

export interface LevelInfo {
  level: number;
  title: string;
  jpTitle: string;
  currentXP: number;
  xpForCurrentLevel: number;
  xpForNextLevel: number;
  progressPercent: number;
}

const LEVEL_THRESHOLDS = [
  { level: 1, xp: 0, title: 'White Belt Explorer', jpTitle: '白帯の旅人' },
  { level: 2, xp: 100, title: 'Kana Apprentice', jpTitle: '仮名の見習い' },
  { level: 3, xp: 250, title: 'Tokyo Traveler', jpTitle: '東京ナビゲーター' },
  { level: 4, xp: 500, title: 'Kanji Crafter', jpTitle: '漢字の鍛冶屋' },
  { level: 5, xp: 900, title: 'Izakaya Regular', jpTitle: '居酒屋の常連' },
  { level: 6, xp: 1400, title: 'Fluent Ronin', jpTitle: '流暢な浪人' },
  { level: 7, xp: 2000, title: 'Kotoba Grandmaster', jpTitle: '言葉の達人' },
];

export function calculateLevelFromXP(xp: number): LevelInfo {
  let currentTier = LEVEL_THRESHOLDS[0];
  let nextTier = LEVEL_THRESHOLDS[1];

  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i].xp) {
      currentTier = LEVEL_THRESHOLDS[i];
      nextTier = LEVEL_THRESHOLDS[i + 1] ?? {
        level: currentTier.level + 1,
        xp: currentTier.xp + 800,
        title: 'Legendary Sensei',
        jpTitle: '伝説の先生'
      };
    } else {
      break;
    }
  }

  const range = nextTier.xp - currentTier.xp;
  const earnedInRange = Math.max(0, xp - currentTier.xp);
  const progressPercent = Math.min(100, Math.round((earnedInRange / range) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    jpTitle: currentTier.jpTitle,
    currentXP: xp,
    xpForCurrentLevel: currentTier.xp,
    xpForNextLevel: nextTier.xp,
    progressPercent
  };
}
