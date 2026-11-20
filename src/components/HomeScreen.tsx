import React, { useEffect, useState } from 'react';
import { Gamepad2, Keyboard, Layers, PenLine, Compass, Flame } from 'lucide-react';
import { GameMode } from '../types';
import { useGame } from '../context/GameContext';
import { useContentPack } from '../data/contentPack';
import { useReducedMotion } from '../utils/useReducedMotion';
import { SURVIVAL_CATEGORIES } from '../data/survivalPhrases';
import { getTranslation } from '../utils/i18n';
import { buildReviewQueue, calculateLevelFromXP } from '../utils/srsLogic';
import { localDateKey } from '../utils/dateUtils';
import { loadWordleSlot, wordleSlotKey } from '../utils/wordleDaily';

interface HomeScreenProps {
  onSelectTab: (tab: GameMode) => void;
}

interface Tile {
  id: GameMode;
  /** Kana or kanji shown large and faded behind the tile */
  glyph: string;
  label: string;
  status: string;
  /** True when there is something waiting, which colours the status line */
  pending: boolean;
  icon: React.ReactNode;
  accent: string;
  tint: string;
  wide?: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onSelectTab }) => {
  const { stats, settings, srsItems, currentJLPT, uiLanguage, toggleNepali } = useGame();
  const t = getTranslation(uiLanguage);
  const { pack, ready } = useContentPack(currentJLPT);
  const level = calculateLevelFromXP(stats.xp);
  const reducedMotion = useReducedMotion();
  // The XP bar grows from empty on arrival rather than appearing already full
  const [barFilled, setBarFilled] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setBarFilled(true), 80);
    return () => clearTimeout(id);
  }, []);
  const ja = uiLanguage === 'ja';

  const { dueCount, newCount } = buildReviewQueue(pack.vocab, srsItems);

  // Today's daily puzzle, read straight from the saved game
  const daily = loadWordleSlot(localDateKey(), wordleSlotKey(currentJLPT, 3))?.daily;
  const wordleStatus = !daily || daily.status === 'playing'
    ? (daily?.guesses.length ? t.home.puzzleStarted : t.home.puzzleReady)
    : daily.status === 'won'
      ? `${t.home.solvedIn} ${daily.guesses.length} ${t.home.tries}`
      : t.home.puzzleDone;

  const loading = ready ? '' : '…';

  const tiles: Tile[] = [
    {
      id: 'wordle',
      glyph: '語',
      label: t.modes.wordle,
      status: wordleStatus,
      pending: !daily || daily.status === 'playing',
      icon: <Gamepad2 className="w-[17px] h-[17px] text-rose-400" />,
      accent: 'text-rose-400',
      tint: 'bg-rose-500/15'
    },
    {
      id: 'flashcards',
      glyph: '札',
      label: t.modes.flashcards,
      status: ready ? `${dueCount} ${t.home.due}, ${newCount} ${t.home.fresh}` : loading,
      pending: dueCount > 0 || newCount > 0,
      icon: <Layers className="w-[17px] h-[17px] text-emerald-400" />,
      accent: 'text-emerald-400',
      tint: 'bg-emerald-500/15'
    },
    {
      id: 'kanji',
      glyph: '書',
      label: t.modes.kanji,
      status: ready ? `${stats.kanjiCrafted} ${t.home.of} ${pack.kanji.length} ${t.home.practised}` : loading,
      pending: false,
      icon: <PenLine className="w-[17px] h-[17px] text-sky-400" />,
      accent: 'text-sky-400',
      tint: 'bg-sky-500/15'
    },
    {
      id: 'typing',
      glyph: '速',
      label: t.modes.typing,
      status: stats.typingHighScore > 0 ? `${t.home.best} ${stats.typingHighScore}` : t.home.notPlayed,
      pending: false,
      icon: <Keyboard className="w-[17px] h-[17px] text-amber-400" />,
      accent: 'text-amber-400',
      tint: 'bg-amber-500/15'
    },
    {
      id: 'survival',
      glyph: '旅',
      label: t.modes.survival,
      status: `${SURVIVAL_CATEGORIES.length} ${t.home.situations}`,
      pending: false,
      icon: <Compass className="w-[17px] h-[17px] text-purple-400" />,
      accent: 'text-purple-400',
      tint: 'bg-purple-500/15',
      wide: true
    }
  ];

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="home-screen">

      <div className="px-2 sm:px-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          {ja ? level.jpTitle : level.title}
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-rose-500 rounded-full transition-[width] duration-700 ease-out motion-reduce:transition-none"
              style={{ width: `${barFilled || reducedMotion ? level.progressPercent : 0}%` }}
            />
          </div>
          <span className="text-xs font-bold text-slate-400 tabular-nums shrink-0">
            {stats.xp} / {level.xpForNextLevel} XP
          </span>
        </div>

        <div className="flex items-center gap-2 mt-4 mb-4">
          <button
            onClick={toggleNepali}
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors ${
              settings.showNepali
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Nepali Meaning & Examples (नेपाली उदाहरण)"
          >
            नेपाली
          </button>
          {stats.streakDays > 0 && (
            <span className="ml-auto flex items-center gap-1.5 text-amber-400">
              <Flame className="w-4 h-4 fill-amber-400" />
              <span className="text-sm font-extrabold tabular-nums">{stats.streakDays}</span>
              <span className="text-xs font-semibold text-slate-400">{t.home.dayStreak}</span>
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {tiles.map((tile, i) => (
          <button
            key={tile.id}
            onClick={() => onSelectTab(tile.id)}
            data-testid={`home-tile-${tile.id}`}
            style={reducedMotion ? undefined : { animationDelay: `${i * 55}ms` }}
            className={`kq-rise relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 text-left p-4 flex
              hover:border-slate-700 hover:bg-slate-900 active:scale-[.97]
              transition-[background-color,border-color,transform] duration-150 motion-reduce:transition-none ${
              tile.wide
                ? 'col-span-2 items-center gap-3.5 h-[86px]'
                : 'flex-col justify-between h-[156px]'
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute font-['Kosugi_Maru'] leading-none select-none opacity-[0.11] ${tile.accent} ${
                tile.wide ? 'right-3 -bottom-5 text-[76px]' : '-right-1 -bottom-[18px] text-[76px]'
              }`}
            >
              {tile.glyph}
            </span>

            <span className={`w-8 h-8 rounded-[10px] ${tile.tint} flex items-center justify-center shrink-0`}>
              {tile.icon}
            </span>

            <span className="relative">
              <span className="block text-[15px] font-bold text-white">{tile.label}</span>
              <span
                className={`flex items-center gap-1.5 text-xs font-semibold mt-1 ${tile.pending ? tile.accent : 'text-slate-400'}`}
              >
                {tile.pending && (
                  <span
                    aria-hidden="true"
                    className="kq-dot w-1.5 h-1.5 rounded-full bg-current shrink-0"
                  />
                )}
                {tile.status}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
