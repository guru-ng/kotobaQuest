import React, { useState, useRef, useEffect } from 'react';
import { useGame } from '../context/GameContext';
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
  Moon,
  ChevronDown,
  Check,
  SlidersHorizontal,
  Gamepad2,
  Keyboard,
  Hammer,
  Layers,
  Compass
} from 'lucide-react';

interface NavbarProps {
  activeTab: GameMode;
  onSelectTab: (tab: GameMode) => void;
  onOpenAchievements: () => void;
}

const JLPT_LEVELS: Array<{ level: JLPTLevel; descEn: string; descJa: string }> = [
  { level: 'N5', descEn: 'Beginner', descJa: '初級' },
  { level: 'N4', descEn: 'Elementary', descJa: '初中級' },
  { level: 'N3', descEn: 'Intermediate', descJa: '中級' },
  { level: 'N2', descEn: 'Pre-Advanced', descJa: '中上級' },
  { level: 'N1', descEn: 'Advanced', descJa: '上級' }
];

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

  const [openDropdown, setOpenDropdown] = useState<'mode' | 'jlpt' | 'options' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks: Array<{ id: GameMode; label: string; icon: React.ReactNode }> = [
    { id: 'wordle', label: t.modes.wordle, icon: <Gamepad2 className="w-3.5 h-3.5 text-rose-400" /> },
    { id: 'typing', label: t.modes.typing, icon: <Keyboard className="w-3.5 h-3.5 text-amber-400" /> },
    { id: 'kanji', label: t.modes.kanji, icon: <Hammer className="w-3.5 h-3.5 text-sky-400" /> },
    { id: 'flashcards', label: t.modes.flashcards, icon: <Layers className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'survival', label: t.modes.survival, icon: <Compass className="w-3.5 h-3.5 text-purple-400" /> }
  ];

  const activeModeObj = navLinks.find(l => l.id === activeTab) || navLinks[0];

  return (
    <header ref={navRef} className="bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 h-14 sm:h-16">
          
          {/* Left Zone: Brand + Mobile/Tablet Mode Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button 
              onClick={() => {
                onSelectTab('wordle');
                setOpenDropdown(null);
              }}
              className="flex items-center gap-2 text-left group focus:outline-none shrink-0"
            >
              <div className="w-8 h-8 rounded-lg bg-rose-500 text-white font-black flex items-center justify-center text-xs sm:text-sm shadow-sm select-none">
                KQ
              </div>
              <span className="hidden sm:inline-block font-extrabold text-base sm:text-lg text-white tracking-tight">
                Kotoba<span className="text-rose-400">Quest</span>
              </span>
            </button>

            {/* Mobile & Tablet Mode Selection Dropdown (<lg) */}
            <div className="relative xl:hidden">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => (prev === 'mode' ? null : 'mode'))}
                data-testid="mobile-mode-dropdown-btn"
                aria-expanded={openDropdown === 'mode'}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-colors"
              >
                {activeModeObj.icon}
                <span className="truncate max-w-[110px] sm:max-w-[150px]">{activeModeObj.label}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'mode' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'mode' && (
                <div
                  data-testid="mobile-mode-dropdown-menu"
                  className="absolute left-0 mt-1.5 w-52 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in duration-100"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {uiLanguage === 'ja' ? '学習モード選択' : 'Select Learning Mode'}
                  </div>
                  {navLinks.map(link => {
                    const isActive = activeTab === link.id;
                    return (
                      <button
                        key={link.id}
                        type="button"
                        onClick={() => {
                          onSelectTab(link.id);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center justify-between transition-colors ${
                          isActive
                            ? 'bg-rose-500/10 text-rose-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {link.icon}
                          <span>{link.label}</span>
                        </span>
                        {isActive && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Center Zone: Desktop 5-Mode Navigation Links (lg+) */}
          <nav aria-label="Game Modes" className="hidden xl:flex items-center gap-1">
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

          {/* Right Zone: JLPT Dropdown, Nepali & Language Controls, Theme & Options */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* JLPT Level Dropdown (Clean on both Mobile & Desktop) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => (prev === 'jlpt' ? null : 'jlpt'))}
                data-testid="jlpt-dropdown-btn"
                aria-expanded={openDropdown === 'jlpt'}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-white transition-colors"
                title="Select JLPT Level (N5 - N1)"
              >
                <span className="text-[10px] text-slate-400 uppercase font-bold">JLPT</span>
                <span className="text-rose-400 font-extrabold">{currentJLPT}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${openDropdown === 'jlpt' ? 'rotate-180' : ''}`} />
              </button>

              {openDropdown === 'jlpt' && (
                <div
                  data-testid="jlpt-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-1.5 z-50 animate-in fade-in duration-100"
                >
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    JLPT Difficulty
                  </div>
                  {JLPT_LEVELS.map(item => {
                    const isSelected = currentJLPT === item.level;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => {
                          setJLPT(item.level);
                          setOpenDropdown(null);
                        }}
                        className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition-colors ${
                          isSelected
                            ? 'bg-rose-500/10 text-rose-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[11px] font-extrabold ${
                            isSelected ? 'bg-rose-500 text-white' : 'bg-slate-800 text-slate-300'
                          }`}>
                            {item.level}
                          </span>
                          <span className="text-slate-400 text-[11px]">
                            {uiLanguage === 'ja' ? item.descJa : item.descEn}
                          </span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-rose-400" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct 1-Tap Nepali Examples Toggle Button */}
            <button
              onClick={toggleNepali}
              aria-label={settings.showNepali ? 'Nepali examples ON' : 'Nepali examples OFF'}
              title={settings.showNepali ? 'Nepali Examples (नेपाली): ON' : 'Nepali Examples (नेपाली): OFF'}
              className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-colors border ${
                settings.showNepali
                  ? 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30'
                  : 'text-slate-400 bg-slate-900 hover:text-slate-200 border-slate-800'
              }`}
            >
              नेपाली
            </button>

            {/* Desktop Controls (md+): Language, Stats, Furi, ABC, Sound */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={toggleUILanguage}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-xs font-bold text-slate-300 border border-slate-800 transition-colors"
                title="Toggle UI Language (English / 日本語)"
              >
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <span>{uiLanguage === 'en' ? 'EN' : '日本語'}</span>
              </button>

              <div className="hidden xl:flex items-center gap-2 text-xs font-medium text-slate-400 px-1">
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

              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                <button
                  onClick={toggleFurigana}
                  aria-label={settings.showFurigana ? 'Furigana is ON' : 'Furigana is OFF'}
                  title={settings.showFurigana ? 'Furigana: ON' : 'Furigana: OFF'}
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors ${
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
                  className={`px-2 py-1 rounded text-[11px] font-bold transition-colors font-mono ${
                    settings.showRomaji 
                      ? 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  ABC
                </button>

                <button
                  onClick={toggleSound}
                  aria-label={settings.soundEnabled ? 'Mute sound' : 'Enable sound'}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
                  title={settings.soundEnabled ? 'Sound: ON' : 'Sound: MUTED'}
                >
                  {settings.soundEnabled ? (
                    <Volume2 className="w-4 h-4 text-slate-300" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Theme Toggle (Visible on sm+, and inside Options menu on <sm) */}
            <button
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
              className="hidden sm:inline-flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-500" />
              )}
            </button>

            {/* Achievements Button (Visible on sm+, and inside Options menu on <sm) */}
            <button
              onClick={onOpenAchievements}
              className="hidden sm:inline-flex p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-300 transition-colors"
              title={t.nav.achievements}
              aria-label={t.nav.achievements}
            >
              <Trophy className="w-4 h-4" />
            </button>

            {/* Mobile Study Options Dropdown (<md): Houses Theme, Achievements, EN/日本語, Furigana, Romaji, Sound & Stats */}
            <div className="relative md:hidden">
              <button
                type="button"
                onClick={() => setOpenDropdown(prev => (prev === 'options' ? null : 'options'))}
                data-testid="mobile-options-dropdown-btn"
                aria-label="Study Options"
                aria-expanded={openDropdown === 'options'}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors flex items-center gap-1"
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {openDropdown === 'options' && (
                <div
                  data-testid="mobile-options-dropdown-menu"
                  className="absolute right-0 mt-1.5 w-60 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50 space-y-1 animate-in fade-in duration-100"
                >
                  {/* Stats Banner inside mobile menu */}
                  <div className="flex items-center justify-between px-2.5 py-2 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs mb-1">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{stats.streakDays}d Streak</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-200 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                      <span>{stats.xp} XP</span>
                    </span>
                  </div>

                  {/* Theme Switcher */}
                  <button
                    type="button"
                    onClick={toggleTheme}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      {theme === 'dark' ? (
                        <Sun className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Moon className="w-3.5 h-3.5 text-slate-400" />
                      )}
                      <span>Theme</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-bold capitalize">
                      {theme}
                    </span>
                  </button>

                  {/* UI Language */}
                  <button
                    type="button"
                    onClick={toggleUILanguage}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-slate-400" />
                      <span>UI Language</span>
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-rose-400 font-bold">
                      {uiLanguage === 'en' ? 'English' : '日本語'}
                    </span>
                  </button>

                  {/* Nepali Examples Toggle */}
                  <button
                    type="button"
                    onClick={toggleNepali}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Nepali Examples (नेपाली)</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      settings.showNepali ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {settings.showNepali ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Furigana Toggle */}
                  <button
                    type="button"
                    onClick={toggleFurigana}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Furigana Reading</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      settings.showFurigana ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {settings.showFurigana ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Romaji Toggle */}
                  <button
                    type="button"
                    onClick={toggleRomaji}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Romaji Hints (ABC)</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      settings.showRomaji ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {settings.showRomaji ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* Sound Effects */}
                  <button
                    type="button"
                    onClick={toggleSound}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-slate-200 hover:bg-slate-800 flex items-center justify-between"
                  >
                    <span>Audio & Sound</span>
                    <span className={`px-2 py-0.5 rounded font-bold ${
                      settings.soundEnabled ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {settings.soundEnabled ? 'ON' : 'MUTED'}
                    </span>
                  </button>

                  {/* Achievements Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      setOpenDropdown(null);
                      onOpenAchievements();
                    }}
                    className="w-full px-2.5 py-2 rounded-lg text-xs font-semibold text-amber-300 hover:bg-slate-800 flex items-center justify-between border-t border-slate-800/80 pt-2 mt-1"
                  >
                    <span className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>{t.nav.achievements}</span>
                    </span>
                    <span className="text-[10px] text-slate-400">View All →</span>
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
