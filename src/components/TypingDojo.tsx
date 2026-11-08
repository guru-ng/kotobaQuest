import React, { useState, useEffect, useRef, useCallback } from 'react';
import { VOCAB_LIST } from '../data/vocabData';
import { NEPALI_VOCAB_MAP } from '../data/nepaliData';
import { VocabWord } from '../types';
import { checkTypingProgress, calculateTypingWPM, calculateTypingAccuracy, romajiToHiragana } from '../utils/typingLogic';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { playTaikoBeat, playSuccessChime, speakJapanese } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Flame, 
  RotateCcw, 
  Volume2, 
  Play
} from 'lucide-react';

type DojoCategory = 'all' | 'food' | 'travel' | 'verbs' | 'daily';

export const TypingDojo: React.FC = () => {
  const { settings, recordTypingScore, currentJLPT, uiLanguage } = useGame();
  const t = getTranslation(uiLanguage);

  const [category, setCategory] = useState<DojoCategory>('food');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [wordsCompleted, setWordsCompleted] = useState<number>(0);
  const [totalKeystrokes, setTotalKeystrokes] = useState<number>(0);
  const [correctKeystrokes, setCorrectKeystrokes] = useState<number>(0);

  const [wordPool, setWordPool] = useState<VocabWord[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const getFilteredWords = useCallback(() => {
    let pool = VOCAB_LIST.filter(w => !currentJLPT || w.jlpt === currentJLPT);
    if (pool.length === 0) {
      pool = VOCAB_LIST;
    }
    if (category !== 'all') {
      const byCat = pool.filter(w => w.category === category);
      if (byCat.length > 0) {
        pool = byCat;
      }
    }
    return [...pool].sort(() => Math.random() - 0.5);
  }, [category, currentJLPT]);

  const startGame = useCallback(() => {
    const list = getFilteredWords();
    setWordPool(list);
    setCurrentIndex(0);
    setInputValue('');
    setScore(0);
    setStreak(0);
    setWordsCompleted(0);
    setTotalKeystrokes(0);
    setCorrectKeystrokes(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsGameOver(false);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  }, [getFilteredWords]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsPlaying(false);
            setIsGameOver(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    if (isGameOver) {
      recordTypingScore(score);
      if (score >= 120) {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    }
  }, [isGameOver, recordTypingScore, score]);

  const currentWord = wordPool[currentIndex] || VOCAB_LIST[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPlaying || isGameOver) return;

    const val = e.target.value;
    setInputValue(val);
    setTotalKeystrokes(prev => prev + 1);

    const progress = checkTypingProgress(val, currentWord.kana, currentWord.romaji);

    if (progress.isPartialMatch) {
      setCorrectKeystrokes(prev => prev + 1);
    }

    if (progress.isComplete) {
      playSuccessChime();
      playTaikoBeat();
      speakJapanese(currentWord.kana);

      const multiplier = streak >= 6 ? 2.5 : streak >= 3 ? 1.5 : 1;
      const points = Math.round(15 * multiplier);

      setScore(prev => prev + points);
      setStreak(prev => prev + 1);
      setWordsCompleted(prev => prev + 1);
      setInputValue('');

      if (currentIndex + 1 < wordPool.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setWordPool(getFilteredWords());
        setCurrentIndex(0);
      }
    }
  };

  const elapsedSeconds = 60 - timeLeft;
  const currentWPM = calculateTypingWPM(correctKeystrokes, Math.max(1, elapsedSeconds));
  const accuracy = calculateTypingAccuracy(correctKeystrokes, totalKeystrokes);

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="typing-dojo-view">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800/80 mb-4 sm:mb-6">
        <div className="flex items-baseline justify-between sm:block">
          <div className="flex items-center gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {t.typing.title}
            </h2>
            {uiLanguage === 'ja' && (
              <span className="text-sm font-['Kosugi_Maru'] text-rose-400">
                タイピング道場
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 sm:mt-1">
            <span className="hidden sm:inline">{t.typing.subtitle} ·</span>
            <span>{currentJLPT}</span>
            <span aria-hidden="true">·</span>
            <span>Romaji / Kana</span>
          </div>
        </div>

        {/* Clean Category Segmented Controls */}
        {!isPlaying && (
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-semibold overflow-x-auto">
            {(['food', 'travel', 'verbs', 'daily', 'all'] as DojoCategory[]).map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex-1 sm:flex-initial px-2.5 py-1 rounded capitalize transition-colors whitespace-nowrap ${
                  category === cat
                    ? 'bg-slate-800 text-white font-bold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {t.categories[cat] || cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {!isPlaying && !isGameOver ? (
        /* Clean Zen Start Card */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 sm:p-12 text-center my-4 sm:my-6">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto mb-4 text-2xl font-black font-['Kosugi_Maru']">
            道
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
            {t.typing.speedPractice}
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mb-6 sm:mb-8 leading-relaxed">
            {t.typing.instructions}
          </p>

          <button
            onClick={startGame}
            className="px-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-2 mx-auto"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>{t.typing.startSession}</span>
          </button>
        </div>
      ) : isPlaying ? (
        /* Clean Active Arena */
        <div className="flex flex-col gap-4 sm:gap-6">
          
          {/* Unboxed Single-Row Typographic HUD */}
          <div className="flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-400 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase text-[10px] sm:text-[11px] tracking-wider">{t.typing.score}</span>
              <span className="text-white font-bold tabular-nums text-sm sm:text-base">{score}</span>
            </div>
            
            <div className="flex items-center gap-1 text-amber-400">
              <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="font-bold tabular-nums">{streak}x</span>
              <span className="hidden xs:inline text-slate-500 text-xs">{t.typing.streak}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 uppercase text-[10px] sm:text-[11px] tracking-wider">{t.typing.speed}</span>
              <span className="text-white font-bold tabular-nums text-sm sm:text-base">{currentWPM}</span>
              <span className="text-slate-500 text-[11px]">{t.typing.wpm}</span>
            </div>

            <div className="flex items-center gap-1 font-mono">
              <span className={`text-sm sm:text-base font-bold tabular-nums ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-slate-200'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>

          {/* Target Word Focus Area */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 sm:p-12 text-center flex flex-col items-center">
            
            {/* Japanese Characters */}
            <div className="mb-1 sm:mb-2">
              <div className="text-4xl sm:text-6xl font-black text-white font-['Kosugi_Maru'] tracking-wide">
                {currentWord.kanji || currentWord.kana}
              </div>
              {currentWord.kanji && (
                <div className="text-base sm:text-lg font-bold text-rose-400 mt-1 sm:mt-2 font-['Kosugi_Maru']">
                  {currentWord.kana}
                </div>
              )}
            </div>

            {/* Romaji Hint */}
            {settings.showRomaji && (
              <div className="font-mono text-sm tracking-wider text-amber-300 mt-2">
                {currentWord.romaji}
              </div>
            )}

            {/* English & Nepali Definition */}
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              "{currentWord.english}"
            </p>
            {settings.showNepali && NEPALI_VOCAB_MAP[currentWord.id] && (
              <p className="text-xs text-emerald-400 font-medium mt-0.5">
                नेपाली: {NEPALI_VOCAB_MAP[currentWord.id].meaningNe}
              </p>
            )}

            {/* Clean Input Field */}
            <div className="w-full max-w-sm mt-8">
              <div className="relative">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Type romaji (e.g. sushi)..."
                  autoFocus
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-rose-400 focus:outline-none text-white text-lg font-bold text-center tracking-wider shadow-inner placeholder:text-slate-600 font-mono"
                />
                <button
                  type="button"
                  onClick={() => speakJapanese(currentWord.kana)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-1"
                  title="Speak"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Always rendered so the panel doesn't jump on the first
                  keystroke of each word. */}
              <div className="text-xs text-slate-500 mt-2 font-mono h-4" aria-live="polite">
                {inputValue && (
                  <>
                    {t.typing.converting}: <span className="text-rose-300 font-bold">{romajiToHiragana(inputValue)}</span>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsPlaying(false);
                setIsGameOver(true);
              }}
              className="text-xs text-slate-500 hover:text-slate-300"
            >
              {t.typing.endEarly}
            </button>
          </div>

        </div>
      ) : (
        /* Summary Screen */
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 sm:p-10 text-center my-6">
          <h3 className="text-xl font-bold text-white mb-1">
            {t.typing.sessionSummary}
          </h3>
          <p className="text-xs text-slate-400 mb-6">
            Completed in 60 seconds · JLPT {currentJLPT}
          </p>

          {/* Unboxed Clean Metric Tally */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-800/80 mb-6 text-center">
            <div>
              <span className="text-xs text-slate-500 block">{t.typing.score}</span>
              <span className="text-2xl font-bold text-rose-400 tabular-nums">{score}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">{t.typing.wordsCleared}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{wordsCompleted}</span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">{t.typing.speed}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{currentWPM} <span className="text-xs font-normal text-slate-500">{t.typing.wpm}</span></span>
            </div>
            <div>
              <span className="text-xs text-slate-500 block">{t.typing.accuracy}</span>
              <span className="text-2xl font-bold text-white tabular-nums">{accuracy}%</span>
            </div>
          </div>

          <p className="text-xs text-slate-400 mb-6">
            +{Math.round(score * 0.2)} XP added to your learning profile
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={startGame}
              className="px-5 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.typing.playAgain}</span>
            </button>
            <button
              onClick={() => {
                setIsGameOver(false);
                setIsPlaying(false);
              }}
              className="px-5 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700"
            >
              {t.typing.backToMenu}
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
