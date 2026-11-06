import React from 'react';
import { useGame } from '../context/GameContext';
import { calculateLevelFromXP } from '../utils/srsLogic';
import { getTranslation } from '../utils/i18n';
import { GameMode, JLPTLevel } from '../types';
import { 
  Volume2, 
  VolumeX, 
  Trophy, 
  Sparkles,
  Flame,
  Globe,
  Sun,
  Moon
} from 'lucide-react';

interface NavbarProps {
  activeTab: GameMode;
  onSelectTab: (tab: GameMode) => void;
  onOpenAchievements: () => void;
}

const JLPT_LEVELS: JLPTLevel[] = ['N5', 'N4', 'N3', 'N2', 'N1'];

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onSelectTab, onOpenAchievements }) => {
  const { 
    stats, 
    settings, 
    currentJLPT, 
    uiLanguage, 
    theme,
    setJLPT, 
    toggleUILanguage, 
    toggleTheme,
    toggleSound, 
    toggleFurigana, 
    toggleRomaji,
    toggleNepali
  } = useGame();

  const t = getTranslation(uiLanguage);
  const levelInfo = calculateLevelFromXP(stats.xp);

  const navLinks: Array<{ id: GameMode; label: string }> = [
    { id: 'wordle', label: t.modes.wordle },
    { id: 'typing', label: t.modes.typing },
    { id: 'kanji', label: t.modes.kanji },
    { id: 'flashcards', label: t.modes.flashcards },
    { id: 'survival', label: t.modes.survival }
  ];

  return (
    <header className="bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          
          {/* Zone 1: Single-element Brand Wordmark (No hardcoded Japanese letters in English mode) */}
          <div className="flex items-center gap-3 shrink-0">
            <button 
              onClick={() => onSelectTab('wordle')}
              className="flex items-center gap-2 text-left group focus:outline-none"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center text-sm shadow-sm select-none">
                KQ
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">
                Kotoba<span className="text-rose-400">Quest</span>
              </span>
            </button>
          </div>

          {/* Zone 2: Clean 5-Mode Navigation Links */}
          <nav aria-label="Game Modes" className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => {
              const isActive = activeTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => onSelectTab(link.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-sm border border-slate-700/80 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: JLPT Level Selector, Language Switch, Stats & Actions */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            
            {/* JLPT Level Selector (N5 - N1) */}
            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
              <span className="hidden sm:inline-block px-1.5 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                JLPT
              </span>
              {JLPT_LEVELS.map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setJLPT(lvl)}
                  title={`Select JLPT ${lvl}`}
                  className={`px-2 py-0.5 rounded text-xs transition-colors font-bold ${
                    currentJLPT === lvl
                      ? 'bg-rose-500 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>

            {/* Language Toggle Button (EN | 日本語) */}
            <button
              onClick={toggleUILanguage}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 transition-colors"
              title="Toggle UI Language (English / 日本語)"
            >
              <Globe className="w-3.5 h-3.5 text-slate-400" />
              <span>{uiLanguage === 'en' ? 'EN' : '日本語'}</span>
            </button>

            {/* Unboxed Typographic Stats */}
            <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-400">
              <span className="flex items-center gap-1 text-amber-400" title={`${stats.streakDays} Day Streak`}>
                <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold tabular-nums">{stats.streakDays}d</span>
              </span>
              <span aria-hidden="true" className="text-slate-700">·</span>
              <span className="flex items-center gap-1 text-slate-300" title="Total XP">
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span className="font-bold tabular-nums">{stats.xp}</span>
                <span className="text-slate-500 text-[11px]">XP</span>
              </span>
            </div>

            {/* Quick Nepali, Furigana, Romaji, Theme, Sound & Achievements */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
              <button
                onClick={toggleNepali}
                aria-label={settings.showNepali ? 'Nepali examples ON' : 'Nepali examples OFF'}
                title={settings.showNepali ? 'Nepali Examples (नेपाली): ON' : 'Nepali Examples (नेपाली): OFF'}
                className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
                  settings.showNepali
                    ? 'text-emerald-400 bg-emerald-500/15 border border-emerald-500/30'
                    : 'text-slate-500 hover:text-slate-300 border border-transparent'
                }`}
              >
                नेपाली
              </button>

              <button
                onClick={toggleFurigana}
                aria-label={settings.showFurigana ? 'Furigana is ON' : 'Furigana is OFF'}
                title={settings.showFurigana ? 'Furigana: ON' : 'Furigana: OFF'}
                className={`px-1.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  settings.showFurigana 
                    ? 'text-rose-400 bg-rose-500/10 border border-rose-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {uiLanguage === 'en' ? 'Furi' : 'ふり'}
              </button>

              <button
                onClick={toggleRomaji}
                aria-label={settings.showRomaji ? 'Romaji hints ON' : 'Romaji hints OFF'}
                title={settings.showRomaji ? 'Romaji: ON' : 'Romaji: OFF'}
                className={`px-1.5 py-1 rounded text-[11px] font-bold transition-colors font-mono ${
                  settings.showRomaji 
                    ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                ABC
              </button>

              <button
                onClick={toggleTheme}
                aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-400 transition-colors"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-500" />
                )}
              </button>

              <button
                onClick={toggleSound}
                aria-label={settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                title={settings.soundEnabled ? 'Sound: ON' : 'Sound: MUTED'}
              >
                {settings.soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-slate-300" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-600" />
                )}
              </button>

              <button
                onClick={onOpenAchievements}
                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 transition-colors"
                title={t.nav.achievements}
                aria-label={t.nav.achievements}
              >
                <Trophy className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex lg:hidden items-center gap-1 py-2 border-t border-slate-900 overflow-x-auto scrollbar-none">
          {navLinks.map(link => {
            const isActive = activeTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => onSelectTab(link.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-bold border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
