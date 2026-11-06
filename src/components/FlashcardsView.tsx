import React, { useState, useEffect } from 'react';
import { VOCAB_LIST } from '../data/vocabData';
import { NEPALI_VOCAB_MAP } from '../data/nepaliData';
import { VocabWord } from '../types';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import {
  FlashcardRating,
  buildReviewQueue,
  calculateNextSRS,
  formatInterval,
  nextReviewDateKey
} from '../utils/srsLogic';
import { addDaysToKey, localDateKey } from '../utils/dateUtils';
import { playCardFlipSound, playSuccessChime, speakJapanese } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Volume2, 
  RotateCw, 
  Check, 
  RotateCcw
} from 'lucide-react';

export const FlashcardsView: React.FC = () => {
  const { settings, srsItems, recordCardReviewed, currentJLPT, uiLanguage, toggleNepali } = useGame();
  const t = getTranslation(uiLanguage);

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [deck, setDeck] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [cardsReviewedThisSession, setCardsReviewedThisSession] = useState<number>(0);
  // Practice mode reviews cards ahead of schedule without changing their SRS schedule
  const [practiceMode, setPracticeMode] = useState<boolean>(false);
  const [sessionKey, setSessionKey] = useState<number>(0);
  const [queueCounts, setQueueCounts] = useState<{ due: number; fresh: number }>({ due: 0, fresh: 0 });
  const [nextDueKey, setNextDueKey] = useState<string | null>(null);

  // Build the session once per filter/level/session change. srsItems is read
  // here on purpose but not a dependency: rating a card must not reshuffle
  // the session that is in progress.
  useEffect(() => {
    let filtered = VOCAB_LIST.filter(w => !currentJLPT || w.jlpt === currentJLPT);
    if (filtered.length === 0) {
      filtered = VOCAB_LIST;
    }
    if (categoryFilter !== 'all') {
      const byCat = filtered.filter(w => w.category === categoryFilter);
      if (byCat.length > 0) {
        filtered = byCat;
      }
    }

    if (practiceMode) {
      setDeck(filtered);
      setQueueCounts({ due: 0, fresh: 0 });
    } else {
      const { queue, dueCount, newCount } = buildReviewQueue(filtered, srsItems);
      setDeck(queue);
      setQueueCounts({ due: dueCount, fresh: newCount });
    }
    setNextDueKey(nextReviewDateKey(filtered, srsItems));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  }, [categoryFilter, currentJLPT, practiceMode, sessionKey]);

  const currentWord: VocabWord | undefined = deck[currentIndex];
  const srsData = currentWord ? srsItems[currentWord.id] : undefined;
  const nepaliVocab = currentWord ? NEPALI_VOCAB_MAP[currentWord.id] : undefined;

  const handleFlip = () => {
    playCardFlipSound();
    setIsFlipped(prev => !prev);
  };

  const handleRating = (rating: FlashcardRating) => {
    if (!currentWord) return;

    recordCardReviewed(currentWord.id, rating, { updateSchedule: !practiceMode });
    setCardsReviewedThisSession(prev => prev + 1);

    if (rating === 'easy' || rating === 'good') {
      playSuccessChime();
    } else {
      playCardFlipSound();
    }

    setIsFlipped(false);

    // "Again" brings the card back at the end of this session
    const nextDeck = rating === 'again' ? [...deck, currentWord] : deck;
    if (rating === 'again') {
      setDeck(nextDeck);
    }

    if (currentIndex + 1 < nextDeck.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsCompleted(true);
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
  };

  // Start a fresh session from the current schedule (only cards still due)
  const restartDeck = () => {
    setSessionKey(k => k + 1);
    setCardsReviewedThisSession(0);
  };

  const startPractice = () => {
    setPracticeMode(true);
    setCardsReviewedThisSession(0);
  };

  const exitPractice = () => {
    setPracticeMode(false);
    setCardsReviewedThisSession(0);
  };

  const formatDueDay = (key: string) => {
    const today = localDateKey();
    if (key <= today) return t.flashcards.today;
    if (key === addDaysToKey(today, 1)) return t.flashcards.tomorrow;
    const [y, m, d] = key.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(uiLanguage === 'ja' ? 'ja-JP' : 'en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  // Interval preview for each rating button, from this card's real schedule
  const previewInterval = (rating: FlashcardRating) => {
    if (!currentWord || practiceMode) return '';
    const next = calculateNextSRS(srsData ?? { wordId: currentWord.id }, rating);
    return formatInterval(next.intervalDays, uiLanguage);
  };

  const isCaughtUp = !isCompleted && deck.length === 0;

  const categories = [
    { id: 'all', label: t.categories.all },
    { id: 'food', label: t.categories.food },
    { id: 'travel', label: t.categories.travel },
    { id: 'daily', label: t.categories.daily },
    { id: 'verbs', label: t.categories.verbs },
    { id: 'adjectives', label: t.categories.adjectives }
  ];

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="flashcards-view">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800/80 mb-4 sm:mb-6">
        <div className="flex items-baseline justify-between sm:block">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {t.flashcards.title}
            </h2>
            {uiLanguage === 'ja' && (
              <span className="text-sm font-['Kosugi_Maru'] text-rose-400">
                単語カード
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:mt-1">
            <span className="hidden sm:inline">{t.flashcards.subtitle} ·</span>
            <span>JLPT {currentJLPT}</span>
            <span aria-hidden="true">·</span>
            {practiceMode ? (
              <span className="text-amber-300">{t.flashcards.practiceShort}</span>
            ) : (
              <span>
                {queueCounts.due} {t.flashcards.dueLabel} · {queueCounts.fresh} {t.flashcards.newLabel}
              </span>
            )}
          </div>
        </div>

        {/* Unboxed Counter + Nepali Toggle */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <button
            onClick={toggleNepali}
            className={`px-2.5 py-1 rounded-lg border text-xs font-bold transition-colors ${
              settings.showNepali
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Nepali Meaning & Examples"
          >
            नेपाली: {settings.showNepali ? 'ON' : 'OFF'}
          </button>

          {!isCompleted && deck.length > 0 && (
            <div className="text-xs text-slate-400 font-medium">
              {t.flashcards.cardOf} <strong className="text-white">{currentIndex + 1}</strong> {t.flashcards.of} {deck.length}
            </div>
          )}
        </div>
      </div>

      {/* Clean Category Filter Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-4 sm:mb-6 scrollbar-none">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategoryFilter(cat.id)}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              categoryFilter === cat.id
                ? 'bg-slate-800 text-white font-bold border border-slate-700/80'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {practiceMode && (
        <div className="flex items-center justify-between gap-2 mb-3 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
          <span>{t.flashcards.practiceMode}</span>
          <button onClick={exitPractice} className="font-semibold underline underline-offset-2 hover:text-white shrink-0">
            {t.flashcards.backToReviews}
          </button>
        </div>
      )}

      {isCaughtUp ? (
        /* Nothing due: all caught up */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center my-6">
          <h3 className="text-xl font-bold text-white mb-2">{t.flashcards.caughtUp}</h3>
          <p className="text-xs text-slate-400 mb-6">
            {nextDueKey
              ? `${t.flashcards.nextReview}: ${formatDueDay(nextDueKey)}`
              : t.flashcards.caughtUpBody}
          </p>
          <button
            onClick={startPractice}
            className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm"
          >
            {t.flashcards.practiceAnyway}
          </button>
        </div>
      ) : !isCompleted && currentWord ? (
        <div className="flex flex-col items-center">
          
          {/* Main Study Card */}
          <div
            onClick={handleFlip}
            className="w-full min-h-[260px] sm:min-h-[340px] bg-slate-900/40 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 sm:p-8 shadow-sm cursor-pointer relative flex flex-col justify-between transition-colors select-none"
          >
            {/* Unboxed Top Metadata */}
            <div className="flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="capitalize">{currentWord.category}</span>
                <span aria-hidden="true">·</span>
                <span>JLPT {currentWord.jlpt}</span>
              </div>

              {srsData?.status === 'mastered' && (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Mastered</span>
                </span>
              )}
            </div>

            {/* Front vs Back Presentation */}
            {!isFlipped ? (
              /* Front: Japanese */
              <div className="my-auto py-6 text-center">
                <div className="flex flex-col items-center justify-center">
                  {settings.showFurigana && currentWord.kanji !== currentWord.kana && (
                    <span className="text-sm font-semibold text-rose-300 font-['Kosugi_Maru'] mb-1">
                      {currentWord.kana}
                    </span>
                  )}
                  <div className="text-5xl sm:text-6xl font-black text-white font-['Kosugi_Maru'] tracking-wide">
                    {currentWord.kanji || currentWord.kana}
                  </div>
                </div>

                {settings.showRomaji && (
                  <div className="text-sm font-mono text-amber-300 mt-3 font-semibold">
                    {currentWord.romaji}
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    speakJapanese(currentWord.kana);
                  }}
                  className="mt-6 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors border border-slate-700/60"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>Audio</span>
                </button>
              </div>
            ) : (
              /* Back: English & Nepali Meaning & Example */
              <div className="my-auto py-4 text-center animate-in fade-in duration-150">
                <h3 className="text-2xl font-bold text-white mb-1">
                  {currentWord.english}
                </h3>

                {settings.showNepali && nepaliVocab && (
                  <div className="text-sm font-semibold text-emerald-400 mb-2">
                    नेपाली: {nepaliVocab.meaningNe}
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-2 text-rose-300 font-['Kosugi_Maru'] text-sm mb-4">
                  <span>{currentWord.kanji}</span>
                  <span>({currentWord.kana})</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(currentWord.kana);
                    }}
                    className="p-1 text-slate-400 hover:text-white"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Example Sentence */}
                <div className="bg-slate-950/70 rounded-xl p-4 border border-slate-800/80 text-left">
                  <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                    <span>Example</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        speakJapanese(currentWord.exampleJa);
                      }}
                      className="text-slate-400 hover:text-white flex items-center gap-1"
                    >
                      <Volume2 className="w-3 h-3" />
                      <span>Listen</span>
                    </button>
                  </div>
                  <p className="text-sm font-bold text-white font-['Kosugi_Maru']">
                    {currentWord.exampleJa}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    "{currentWord.exampleEn}"
                  </p>

                  {settings.showNepali && nepaliVocab?.exampleNe && (
                    <div className="mt-2 pt-2 border-t border-slate-800/80 text-xs">
                      <p className="text-emerald-400 font-medium">
                        नेपाली उदाहरण: "{nepaliVocab.exampleNe}"
                      </p>
                      {nepaliVocab.grammarNote && (
                        <p className="text-[11px] text-slate-400 mt-1 italic">
                          💡 {nepaliVocab.grammarNote}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {currentWord.notes && (
                  <p className="text-xs text-slate-400 mt-3 italic">
                    💡 {currentWord.notes}
                  </p>
                )}
              </div>
            )}

            {/* Bottom cue */}
            <div className="flex items-center justify-center text-xs text-slate-500 gap-1.5 pt-3 border-t border-slate-800/60">
              <RotateCw className="w-3 h-3" />
              <span>{t.flashcards.tapToFlip}</span>
            </div>
          </div>

          {/* Action Row */}
          <div className="w-full mt-4">
            {isFlipped ? (
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-semibold text-slate-500 text-center uppercase tracking-wider">
                  {t.flashcards.rateRecall}
                </span>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => handleRating('again')}
                    className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-red-500/30 text-red-400 font-semibold text-xs text-center transition-colors"
                  >
                    <span className="block">{t.flashcards.again}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{previewInterval('again')}</span>
                  </button>
                  <button
                    onClick={() => handleRating('hard')}
                    className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-amber-500/30 text-amber-400 font-semibold text-xs text-center transition-colors"
                  >
                    <span className="block">{t.flashcards.hard}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{previewInterval('hard')}</span>
                  </button>
                  <button
                    onClick={() => handleRating('good')}
                    className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-sky-500/30 text-sky-400 font-semibold text-xs text-center transition-colors"
                  >
                    <span className="block">{t.flashcards.good}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{previewInterval('good')}</span>
                  </button>
                  <button
                    onClick={() => handleRating('easy')}
                    className="py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-emerald-500/30 text-emerald-400 font-semibold text-xs text-center transition-colors"
                  >
                    <span className="block">{t.flashcards.easy}</span>
                    <span className="text-[10px] text-slate-500 font-normal">{previewInterval('easy')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={handleFlip}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold border border-slate-800 transition-colors"
              >
                {t.flashcards.revealMeaning}
              </button>
            )}
          </div>

        </div>
      ) : (
        /* Finished State */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center my-6">
          <h3 className="text-xl font-bold text-white mb-2">{t.flashcards.deckCompleted}</h3>
          <p className="text-xs text-slate-400 mb-6">
            You reviewed {cardsReviewedThisSession || deck.length} cards in this session · JLPT {currentJLPT}.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={restartDeck}
              className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.flashcards.reviewAgain}</span>
            </button>
            <button
              onClick={() => {
                setCategoryFilter('all');
                restartDeck();
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              {t.flashcards.allCategories}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
