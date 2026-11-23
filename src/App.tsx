import React, { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import { Navbar } from './components/Navbar';
import { WordleGame } from './components/WordleGame';
import { TypingDojo } from './components/TypingDojo';
import { KanjiForge } from './components/KanjiForge';
import { FlashcardsView } from './components/FlashcardsView';
import { SurvivalGuide } from './components/SurvivalGuide';
import { AchievementsModal } from './components/AchievementsModal';
import { WelcomeBanner } from './components/WelcomeBanner';
import { HomeScreen } from './components/HomeScreen';
import { registerServiceWorker } from './utils/registerSW';
import { getTranslation } from './utils/i18n';
import { CreditsModal } from './components/CreditsModal';
import { GameMode } from './types';
import { Sparkles, Trophy, X, RefreshCw, CloudOff } from 'lucide-react';

const MainApp: React.FC = () => {
  const { newAchievementUnlocked, clearAchievementNotification, uiLanguage } = useGame();
  
  // null = the home grid. ?tab= names an activity.
  const [activeTab, setActiveTab] = useState<GameMode | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as GameMode;
      if (['wordle', 'typing', 'kanji', 'flashcards', 'survival'].includes(tabParam)) {
        return tabParam;
      }
    }
    return null;
  });

  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(() =>
    typeof navigator !== 'undefined' ? !navigator.onLine : false
  );
  const t = getTranslation(uiLanguage);

  useEffect(() => {
    registerServiceWorker(apply => setApplyUpdate(() => apply));
  }, []);

  useEffect(() => {
    const sync = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', sync);
    window.addEventListener('offline', sync);
    return () => {
      window.removeEventListener('online', sync);
      window.removeEventListener('offline', sync);
    };
  }, []);

  // Keep the URL in step with the open mode so refresh / back / sharing keep your place
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === null) url.searchParams.delete('tab');
    else url.searchParams.set('tab', activeTab);
    // ?cat= belongs to the phrasebook only
    if (activeTab !== 'survival') url.searchParams.delete('cat');
    if (url.href !== window.location.href) window.history.pushState(null, '', url);
  }, [activeTab]);

  // The browser back button returns to the home grid
  useEffect(() => {
    const onPop = () => {
      const tab = new URLSearchParams(window.location.search).get('tab') as GameMode;
      setActiveTab(['wordle', 'typing', 'kanji', 'flashcards', 'survival'].includes(tab) ? tab : null);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  useEffect(() => {
    document.documentElement.lang = uiLanguage === 'ja' ? 'ja' : 'en';
  }, [uiLanguage]);

  useEffect(() => {
    if (newAchievementUnlocked) {
      const timer = setTimeout(() => {
        clearAchievementNotification();
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [newAchievementUnlocked, clearAchievementNotification]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Unified Top Navigation (Follows Top Bar Contract) */}
      <Navbar
        activeTab={activeTab}
        onGoHome={() => setActiveTab(null)}
        onOpenAchievements={() => setIsAchievementsOpen(true)}
      />

      {isOffline && (
        <div
          role="status"
          className="flex items-center justify-center gap-2 py-1.5 bg-slate-900 border-b border-slate-800 text-[11px] font-semibold text-slate-400"
        >
          <CloudOff className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{t.app.offline}</span>
        </div>
      )}

      {/* Main Content Area with Responsive Mobile Whitespace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
        <WelcomeBanner showHero={activeTab === null} />
        {activeTab === null && <HomeScreen onSelectTab={setActiveTab} />}
        {activeTab === 'wordle' && <WordleGame />}
        {activeTab === 'typing' && <TypingDojo />}
        {activeTab === 'kanji' && <KanjiForge />}
        {activeTab === 'flashcards' && <FlashcardsView />}
        {activeTab === 'survival' && <SurvivalGuide />}
      </main>

      {/* Quiet Achievement Notification Toast */}
      {newAchievementUnlocked && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 border border-amber-500/30 text-white p-3.5 sm:p-4 rounded-xl shadow-xl flex items-center gap-3 sm:max-w-sm animate-in slide-in-from-bottom-4 duration-200">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>Achievement Unlocked</span>
            </div>
            <h4 className="text-xs font-bold text-white truncate">{newAchievementUnlocked.title}</h4>
          </div>
          <button
            onClick={clearAchievementNotification}
            className="p-1 text-slate-500 hover:text-slate-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {applyUpdate && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:bottom-6 sm:right-6 z-50 bg-slate-900 border border-sky-500/30 text-white p-3.5 rounded-xl shadow-xl flex items-center gap-3 sm:max-w-sm">
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center shrink-0">
            <RefreshCw className="w-4 h-4" />
          </div>
          <p className="flex-1 min-w-0 text-xs text-slate-300">{t.app.updateReady}</p>
          <button
            onClick={() => applyUpdate()}
            className="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shrink-0"
          >
            {t.app.reload}
          </button>
        </div>
      )}

      {/* Achievements & Badges Modal */}
      <AchievementsModal
        isOpen={isAchievementsOpen}
        onClose={() => setIsAchievementsOpen(false)}
      />

      <CreditsModal isOpen={isCreditsOpen} onClose={() => setIsCreditsOpen(false)} />

      {/* Editorial Footer */}
      <footer className="border-t border-slate-900 py-4 sm:py-6 text-center text-xs text-slate-600">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2">
          <p>KotobaQuest · Japanese Learning Environment</p>
          <div className="flex items-center gap-2 text-slate-500 text-[11px] sm:text-xs">
            <span>JLPT N5–N1</span>
            <span aria-hidden="true">·</span>
            <span>Spaced Repetition</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsCreditsOpen(true)}
              className="underline underline-offset-2 hover:text-slate-300 transition-colors"
            >
              Data sources &amp; licences
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <GameProvider>
      <MainApp />
    </GameProvider>
  );
}
