import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserStats, SRSItem, Achievement, JLPTLevel, UILanguage } from '../types';
import { calculateLevelFromXP, calculateNextSRS, FlashcardRating } from '../utils/srsLogic';
import { countMastered, createInitialStats, migrateStats, recordActivity, rollOverDay } from '../utils/statsLogic';
import { playSuccessChime, playVictoryFanfare, setSoundEffectsEnabled } from '../utils/audio';

const STORAGE_KEY_STATS = 'kotoba_user_stats_v1';
const STORAGE_KEY_SRS = 'kotoba_srs_items_v1';
const STORAGE_KEY_SETTINGS = 'kotoba_settings_v1';
const STORAGE_KEY_JLPT = 'kotoba_jlpt_level_v1';
const STORAGE_KEY_LANG = 'kotoba_ui_lang_v1';
const STORAGE_KEY_THEME = 'kotoba_theme_v1';

export type ThemeMode = 'dark' | 'light';

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach_first_step',
    title: 'First Step',
    titleJa: 'はじめの一歩',
    description: 'Earn your first 20 XP in any game mode.',
    descriptionJa: 'いずれかのモードで最初の20 XPを獲得する。',
    icon: 'Footprints',
    targetCount: 20,
    currentCount: (s) => s.xp
  },
  {
    id: 'ach_wordle_master',
    title: 'Wordle Wizard',
    titleJa: '言葉の魔術師',
    description: 'Solve 3 Japanese Wordle puzzles.',
    descriptionJa: '日本語ワードルを3問クリアする。',
    icon: 'Sparkles',
    targetCount: 3,
    currentCount: (s) => s.wordlesCompleted
  },
  {
    id: 'ach_typing_ninja',
    title: 'Typing Ninja',
    titleJa: '電光石火',
    description: 'Score at least 150 points in Typing Dojo.',
    descriptionJa: 'タイピング道場で150点以上を獲得する。',
    icon: 'Zap',
    targetCount: 150,
    currentCount: (s) => s.typingHighScore
  },
  {
    id: 'ach_kanji_blacksmith',
    title: 'Kanji Blacksmith',
    titleJa: '鍛冶職人',
    description: 'Craft 5 Kanji from radicals in Kanji Forge.',
    descriptionJa: '漢字フォージで部首から5つの漢字を鍛造する。',
    icon: 'Hammer',
    targetCount: 5,
    currentCount: (s) => s.kanjiCrafted
  },
  {
    id: 'ach_vocab_scholar',
    title: 'Daily Scholar',
    titleJa: '勉学の日々',
    description: 'Master 10 vocabulary words via Flashcards.',
    descriptionJa: '単語カードで10個の単語を完全習得する。',
    icon: 'BookOpen',
    targetCount: 10,
    currentCount: (s) => s.wordsMastered
  }
];

function readJSON<T>(key: string): T | null {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : null;
  } catch {
    return null;
  }
}

interface Settings {
  soundEnabled: boolean;
  showFurigana: boolean;
  showRomaji: boolean;
  showNepali?: boolean;
}

interface GameContextType {
  stats: UserStats;
  settings: Settings;
  srsItems: Record<string, SRSItem>;
  currentJLPT: JLPTLevel;
  uiLanguage: UILanguage;
  theme: ThemeMode;
  setJLPT: (level: JLPTLevel) => void;
  setUILanguage: (lang: UILanguage) => void;
  toggleUILanguage: () => void;
  toggleTheme: () => void;
  addXP: (amount: number, reason?: string) => void;
  recordWordleWin: () => void;
  recordTypingScore: (score: number) => void;
  recordKanjiCrafted: () => void;
  recordCardReviewed: (wordId: string, rating: FlashcardRating, options?: { updateSchedule?: boolean }) => void;
  toggleSound: () => void;
  toggleFurigana: () => void;
  toggleRomaji: () => void;
  toggleNepali: () => void;
  resetProgress: () => void;
  newAchievementUnlocked: Achievement | null;
  clearAchievementNotification: () => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const GameProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stats, setStats] = useState<UserStats>(() => {
    const savedSrs = readJSON<Record<string, SRSItem>>(STORAGE_KEY_SRS) ?? {};
    const savedStats = readJSON<unknown>(STORAGE_KEY_STATS);
    return rollOverDay(migrateStats(savedStats, savedSrs, ACHIEVEMENTS));
  });

  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { soundEnabled: true, showFurigana: true, showRomaji: true, showNepali: true, ...parsed };
      }
    } catch {
      // ignore
    }
    return { soundEnabled: true, showFurigana: true, showRomaji: true, showNepali: true };
  });

  const [currentJLPT, setCurrentJLPTState] = useState<JLPTLevel>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_JLPT);
      if (saved && ['N5', 'N4', 'N3', 'N2', 'N1'].includes(saved)) {
        return saved as JLPTLevel;
      }
    } catch {}
    return 'N5';
  });

  const [uiLanguage, setUILanguageState] = useState<UILanguage>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && (saved === 'en' || saved === 'ja')) {
        return saved as UILanguage;
      }
    } catch {}
    return 'en';
  });

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  const [srsItems, setSrsItems] = useState<Record<string, SRSItem>>(
    () => readJSON<Record<string, SRSItem>>(STORAGE_KEY_SRS) ?? {}
  );

  const [newAchievementUnlocked, setNewAchievementUnlocked] = useState<Achievement | null>(null);

  // Reset the daily counter / broken streak when the app is reopened on a new day
  useEffect(() => {
    const refreshDay = () => setStats(prev => rollOverDay(prev));
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refreshDay();
    };
    window.addEventListener('focus', refreshDay);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refreshDay);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  // Sync sound settings with audio engine
  useEffect(() => {
    setSoundEffectsEnabled(settings.soundEnabled);
  }, [settings.soundEnabled]);

  // Persist state
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_STATS, JSON.stringify(stats));
    } catch {}
  }, [stats]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_SRS, JSON.stringify(srsItems));
    } catch {}
  }, [srsItems]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_JLPT, currentJLPT);
    } catch {}
  }, [currentJLPT]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_LANG, uiLanguage);
    } catch {}
  }, [uiLanguage]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('light-theme', theme === 'light');
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const setJLPT = (level: JLPTLevel) => {
    setCurrentJLPTState(level);
  };

  const setUILanguage = (lang: UILanguage) => {
    setUILanguageState(lang);
  };

  const toggleUILanguage = () => {
    setUILanguageState(prev => (prev === 'en' ? 'ja' : 'en'));
  };

  const toggleTheme = () => {
    setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const isFirstMount = React.useRef(true);

  // Check achievements whenever stats update
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    ACHIEVEMENTS.forEach(ach => {
      if (!stats.unlockedAchievements.includes(ach.id)) {
        if (ach.currentCount(stats) >= ach.targetCount) {
          setStats(prev => ({
            ...prev,
            unlockedAchievements: [...prev.unlockedAchievements, ach.id]
          }));
          setNewAchievementUnlocked(ach);
          playVictoryFanfare();
        }
      }
    });
  }, [stats]);

  const addXP = (amount: number) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const levelInfo = calculateLevelFromXP(newXP);
      // Any XP counts as practising today (keeps the streak alive)
      return {
        ...recordActivity(prev, 0),
        xp: newXP,
        level: levelInfo.level
      };
    });
  };

  const recordWordleWin = () => {
    addXP(50);
    setStats(prev => ({
      ...recordActivity(prev, 1),
      wordlesCompleted: prev.wordlesCompleted + 1
    }));
  };

  const recordTypingScore = (score: number) => {
    addXP(Math.round(score * 0.2));
    setStats(prev => ({
      ...recordActivity(prev, 1),
      typingHighScore: Math.max(prev.typingHighScore, score)
    }));
  };

  const recordKanjiCrafted = () => {
    addXP(35);
    setStats(prev => ({
      ...recordActivity(prev, 1),
      kanjiCrafted: prev.kanjiCrafted + 1
    }));
  };

  const recordCardReviewed = (
    wordId: string,
    rating: FlashcardRating,
    options: { updateSchedule?: boolean } = {}
  ) => {
    const { updateSchedule = true } = options;
    addXP(rating === 'again' ? 5 : 15);

    if (!updateSchedule) {
      // Practice-ahead reviews earn XP but don't move the card's schedule
      setStats(prev => recordActivity(prev, 1));
      return;
    }

    const current = srsItems[wordId] || { wordId };
    const updated = calculateNextSRS(current, rating);
    const nextItems = { ...srsItems, [wordId]: updated };

    setSrsItems(prev => ({
      ...prev,
      [wordId]: updated
    }));

    setStats(prev => ({
      ...recordActivity(prev, 1),
      wordsMastered: countMastered(nextItems)
    }));
  };

  const toggleSound = () => {
    setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }));
  };

  const toggleFurigana = () => {
    setSettings(prev => ({ ...prev, showFurigana: !prev.showFurigana }));
  };

  const toggleRomaji = () => {
    setSettings(prev => ({ ...prev, showRomaji: !prev.showRomaji }));
  };

  const toggleNepali = () => {
    setSettings(prev => ({ ...prev, showNepali: !prev.showNepali }));
  };

  const resetProgress = () => {
    setStats(createInitialStats());
    setSrsItems({});
  };

  const clearAchievementNotification = () => {
    setNewAchievementUnlocked(null);
  };

  return (
    <GameContext.Provider
      value={{
        stats,
        settings,
        srsItems,
        currentJLPT,
        uiLanguage,
        theme,
        setJLPT,
        setUILanguage,
        toggleUILanguage,
        toggleTheme,
        addXP,
        recordWordleWin,
        recordTypingScore,
        recordKanjiCrafted,
        recordCardReviewed,
        toggleSound,
        toggleFurigana,
        toggleRomaji,
        toggleNepali,
        resetProgress,
        newAchievementUnlocked,
        clearAchievementNotification
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
