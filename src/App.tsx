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
import { CreditsModal } from './components/CreditsModal';
import { GameMode } from './types';
import { Sparkles, Trophy, X } from 'lucide-react';

const MainApp: React.FC = () => {
  const { newAchievementUnlocked, clearAchievementNotification, uiLanguage } = useGame();
  
  const [activeTab, setActiveTab] = useState<GameMode>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as GameMode;
      if (['wordle', 'typing', 'kanji', 'flashcards', 'survival'].includes(tabParam)) {
        return tabParam;
      }
    }
    return 'wordle';
  });

  const [isAchievementsOpen, setIsAchievementsOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);

  // Keep the URL in step with the open mode so refresh / back / sharing keep your place
  useEffect(() => {
    const url = new URL(window.location.href);
    if (activeTab === 'wordle') url.searchParams.delete('tab');
    else url.searchParams.set('tab', activeTab);
    if (url.href !== window.location.href) window.history.replaceState(null, '', url);
  }, [activeTab]);

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
        onSelectTab={setActiveTab} 
        onOpenAchievements={() => setIsAchievementsOpen(true)} 
      />

      {/* Main Content Area with Responsive Mobile Whitespace */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-2 sm:px-6 lg:px-8 py-3 sm:py-6">
        <WelcomeBanner showHero={activeTab === 'wordle'} />
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
