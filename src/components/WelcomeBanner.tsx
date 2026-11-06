import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useGame } from '../context/GameContext';

const STORAGE_KEY = 'kotoba_welcome_dismissed_v1';

/**
 * One-glance value proposition for first-time visitors (also the page's <h1>).
 * Returning players get a visually hidden <h1> instead, so the page always has one.
 */
export const WelcomeBanner: React.FC<{ showHero?: boolean }> = ({ showHero = true }) => {
  const { stats, uiLanguage } = useGame();
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === '1';
    } catch {
      return false;
    }
  });

  const isNewPlayer = stats.xp === 0 && !stats.lastActiveDate;
  const ja = uiLanguage === 'ja';

  if (!showHero || !isNewPlayer || dismissed) {
    return <h1 className="sr-only">KotobaQuest: learn Japanese with daily games</h1>;
  }

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  };

  return (
    <section className="relative mb-3 sm:mb-4 rounded-2xl border border-rose-500/20 bg-gradient-to-r from-rose-500/10 via-slate-900/60 to-slate-900/40 px-4 py-3 sm:px-6 sm:py-4">
      <h1 className="text-base sm:text-xl font-extrabold text-white tracking-tight pr-7">
        {ja ? '毎日1問のゲームで、日本語が身につく' : 'Learn Japanese by playing one puzzle a day'}
      </h1>
      <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
        {ja
          ? 'ワードル・タイピング・漢字の書き順・単語カード。無料、登録不要。ネパール語の解説つき。'
          : 'Wordle, typing, kanji stroke order and flashcards. Free, no sign-up, with Nepali explanations.'}
      </p>
      <p className="text-[11px] sm:text-xs text-rose-300 font-semibold mt-1.5">
        {ja ? '↓ まずは今日のワードルから' : '↓ Start with today\'s puzzle below. Type in romaji, no Japanese keyboard needed.'}
      </p>
      <button
        onClick={dismiss}
        aria-label="Dismiss"
        className="absolute top-2.5 right-2.5 p-1 rounded text-slate-500 hover:text-slate-200"
      >
        <X className="w-4 h-4" />
      </button>
    </section>
  );
};
