import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { WORDLE_WORDS } from '../data/wordleWords';
import { NEPALI_WORDLE_MAP } from '../data/nepaliData';
import { evaluateWordleGuess, isWordleWon, computeKeyboardStatus } from '../utils/wordleLogic';
import { flushRomajiInput, stepRomajiInput } from '../utils/typingLogic';
import { getTranslation } from '../utils/i18n';
import { JLPTLevel, WordleWord, WordleTileState } from '../types';
import { localDateKey } from '../utils/dateUtils';
import {
  WordleGameStatus,
  WordleMode,
  buildWordleShareText,
  getWordlePool,
  loadWordleSlot,
  pickDailyWord,
  pickPracticeWord,
  saveWordleSlot,
  wordlePuzzleNumber,
  wordleSlotKey
} from '../utils/wordleDaily';
import { useGame } from '../context/GameContext';
import { playSuccessChime, playCardFlipSound, speakJapanese } from '../utils/audio';
import { 
  RotateCcw, 
  Volume2, 
  CheckCircle2, 
  XCircle, 
  Lightbulb, 
  ArrowRight,
  Delete,
  Keyboard,
  Share2
} from 'lucide-react';

const MAX_ATTEMPTS = 6;

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

interface ResolvedGame {
  date: string;
  slot: string;
  length: 3 | 4;
  mode: WordleMode;
  word: WordleWord;
  guesses: string[][];
  status: WordleGameStatus;
}

/**
 * Today's game for a level + length: the saved practice game if the player was
 * in one, otherwise the daily puzzle (restoring any guesses already made today).
 */
function resolveGame(level: JLPTLevel, length: 3 | 4, forceDaily = false): ResolvedGame {
  const date = localDateKey();
  const slot = wordleSlotKey(level, length);
  const pool = getWordlePool(WORDLE_WORDS, level, length);
  const dailyWord = pickDailyWord(pool, date, slot) ?? WORDLE_WORDS[0];
  const saved = loadWordleSlot(date, slot);
  const validRows = (word: WordleWord, rows: string[][]) =>
    rows.filter(row => row.length === Array.from(word.kana).length).slice(0, MAX_ATTEMPTS);

  if (!forceDaily && saved?.mode === 'practice' && saved.practice) {
    const word = pool.find(w => w.id === saved.practice!.wordId);
    if (word) {
      return { date, slot, length, mode: 'practice', word, guesses: validRows(word, saved.practice.guesses), status: saved.practice.status };
    }
  }

  if (saved?.daily && saved.daily.wordId === dailyWord.id) {
    return { date, slot, length, mode: 'daily', word: dailyWord, guesses: validRows(dailyWord, saved.daily.guesses), status: saved.daily.status };
  }

  return { date, slot, length, mode: 'daily', word: dailyWord, guesses: [], status: 'playing' };
}

const KANA_VOWEL_ROWS = [
  { label: 'A', chars: ['あ', 'か', 'さ', 'た', 'な', 'は', 'ま', 'や', 'ら', 'わ'] },
  { label: 'I', chars: ['い', 'き', 'し', 'ち', 'に', 'ひ', 'み', 'り'] },
  { label: 'U', chars: ['う', 'く', 'す', 'つ', 'ぬ', 'ふ', 'む', 'ゆ', 'る', 'ん'] },
  { label: 'E', chars: ['え', 'け', 'せ', 'て', 'ね', 'へ', 'め', 'れ'] },
  { label: 'O', chars: ['お', 'こ', 'そ', 'と', 'の', 'ほ', 'も', 'よ', 'ろ', 'を'] }
];

export const WordleGame: React.FC = () => {
  const { settings, currentJLPT, uiLanguage, toggleNepali, recordWordleWin, addXP } = useGame();
  const t = getTranslation(uiLanguage);
  
  const [initialGame] = useState<ResolvedGame>(() => resolveGame(currentJLPT, 3));
  const [targetLength, setTargetLength] = useState<3 | 4>(initialGame.length);
  const [currentWord, setCurrentWord] = useState<WordleWord>(initialGame.word);
  const [mode, setMode] = useState<WordleMode>(initialGame.mode);
  const [slot, setSlot] = useState<string>(initialGame.slot);
  const [gameDate, setGameDate] = useState<string>(initialGame.date);
  const [shareFeedback, setShareFeedback] = useState<string | null>(null);

  const [guesses, setGuesses] = useState<string[][]>(initialGame.guesses);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<WordleGameStatus>(initialGame.status);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [revealedResultModal, setRevealedResultModal] = useState<boolean>(false);
  const [romajiBuffer, setRomajiBuffer] = useState<string>('');
  const [keyboardMode, setKeyboardMode] = useState<'romaji' | 'kana'>('romaji');
  const [imgError, setImgError] = useState<boolean>(false);

  const targetChars = Array.from(currentWord.kana);

  const applyGame = useCallback((game: ResolvedGame) => {
    setTargetLength(game.length);
    setCurrentWord(game.word);
    setMode(game.mode);
    setSlot(game.slot);
    setGameDate(game.date);
    setGuesses(game.guesses);
    setGameStatus(game.status);
    setCurrentInput([]);
    setShowHint(false);
    setRevealedResultModal(false);
    setRomajiBuffer('');
    setImgError(false);
    setShareFeedback(null);
  }, []);

  // Switching length (or level) opens that combination's daily puzzle / saved game
  const selectLength = (length: 3 | 4) => applyGame(resolveGame(currentJLPT, length));

  const backToDaily = () => applyGame(resolveGame(currentJLPT, targetLength, true));

  // "New puzzle" / "Next word": a random practice word (not today's daily)
  const startNewGame = () => {
    const date = localDateKey();
    const practiceSlot = wordleSlotKey(currentJLPT, targetLength);
    const pool = getWordlePool(WORDLE_WORDS, currentJLPT, targetLength);
    const daily = pickDailyWord(pool, date, practiceSlot);
    const avoid = [currentWord.id, ...(daily ? [daily.id] : [])];
    const word = pickPracticeWord(pool, avoid) ?? currentWord;
    applyGame({ date, slot: practiceSlot, length: targetLength, mode: 'practice', word, guesses: [], status: 'playing' });
  };

  // Load the right puzzle when the JLPT level changes (also runs on mount)
  useEffect(() => {
    applyGame(resolveGame(currentJLPT, targetLength));
  }, [currentJLPT]); // targetLength intentionally omitted: length changes go through selectLength

  // Persist progress so a reload doesn't wipe (or replay) today's puzzle
  useEffect(() => {
    const entry = { wordId: currentWord.id, guesses, status: gameStatus };
    const existing = loadWordleSlot(gameDate, slot) ?? { mode };
    saveWordleSlot(
      gameDate,
      slot,
      mode === 'daily' ? { ...existing, mode, daily: entry } : { ...existing, mode, practice: entry }
    );
  }, [gameDate, slot, mode, currentWord.id, guesses, gameStatus]);

  const handleShare = async () => {
    const text = buildWordleShareText({
      mode,
      dateKey: gameDate,
      level: currentJLPT,
      length: targetLength,
      evaluations: guesses.map(g => evaluateWordleGuess(targetChars, g)),
      won: gameStatus === 'won',
      maxAttempts: MAX_ATTEMPTS,
      url: typeof window !== 'undefined' ? window.location.origin : undefined
    });
    try {
      if (typeof navigator.share === 'function') {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShareFeedback(t.wordle.copied);
      setTimeout(() => setShareFeedback(null), 2000);
    } catch {
      // share sheet dismissed or clipboard blocked
    }
  };

  const handleCharInput = useCallback((char: string) => {
    if (gameStatus !== 'playing') return;

    if (char === 'ENTER') {
      // A trailing "n" still waiting in the romaji buffer counts as ん on submit
      const guess = [...currentInput, ...flushRomajiInput(romajiBuffer)];
      if (guess.length !== targetLength) return;

      playCardFlipSound();
      const newGuesses = [...guesses, guess];
      setGuesses(newGuesses);
      setRomajiBuffer('');

      const evaluation = evaluateWordleGuess(targetChars, guess);
      // Clear the typed row so it shows the coloured result of this guess
      setCurrentInput([]);

      if (isWordleWon(evaluation)) {
        setGameStatus('won');
        recordWordleWin();
        playSuccessChime();
        speakJapanese(currentWord.kana);
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setTimeout(() => setRevealedResultModal(true), 800);
      } else if (newGuesses.length >= MAX_ATTEMPTS) {
        setGameStatus('lost');
        addXP(10);
        setTimeout(() => setRevealedResultModal(true), 800);
      }
      return;
    }

    if (char === 'BACKSPACE') {
      if (romajiBuffer) {
        // Undo the pending romaji letter first
        setRomajiBuffer(prev => prev.slice(0, -1));
        playCardFlipSound();
      } else if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
        playCardFlipSound();
      }
      return;
    }

    if (currentInput.length < targetLength) {
      playCardFlipSound();
      setRomajiBuffer('');
      setCurrentInput(prev => [...prev, char].slice(0, targetLength));
    }
  }, [gameStatus, currentInput, romajiBuffer, targetLength, guesses, targetChars, recordWordleWin, addXP, currentWord.kana]);

  const handleRomajiKey = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;
    const { kana, pending } = stepRomajiInput(romajiBuffer + letter.toLowerCase());
    const room = targetLength - currentInput.length;

    if (kana.length > 0 && room > 0) {
      playCardFlipSound();
      setCurrentInput(prev => [...prev, ...kana].slice(0, targetLength));
    }
    // Keep waiting on an incomplete syllable only if there's still a box for it
    setRomajiBuffer(room - kana.length > 0 ? pending : '');
  }, [gameStatus, romajiBuffer, currentInput.length, targetLength]);

  // Kana that would be submitted right now (typed boxes + any pending "n")
  const pendingGuessLength = currentInput.length + flushRomajiInput(romajiBuffer).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      if (e.key === 'Enter') {
        e.preventDefault();
        handleCharInput('ENTER');
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleCharInput('BACKSPACE');
        return;
      }

      if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleRomajiKey(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput, handleRomajiKey]);

  const keyboardStatus = computeKeyboardStatus(guesses, targetChars);

  // Determine what to display in the single 1-row grid (3 columns for 3 Kana, 4 columns for 4 Kana)
  const lastGuess = guesses.length > 0 ? guesses[guesses.length - 1] : null;
  const lastEvaluation = lastGuess ? evaluateWordleGuess(targetChars, lastGuess) : null;
  const showingLastEvaluation = currentInput.length === 0 && lastGuess !== null;

  // Track any positions already solved in previous attempts to show a subtle helper placeholder
  const solvedPositions = targetChars.map((targetChar, idx) =>
    guesses.some(g => g[idx] === targetChar) ? targetChar : null
  );

  const nepaliData = NEPALI_WORDLE_MAP[currentWord.id];

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-3" data-testid="wordle-view">
      
      {/* Editorial Header Section — Compact & Aligned on Mobile */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 border-b border-slate-800/80 mb-3 sm:mb-5">
        <div className="flex items-baseline justify-between sm:block">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
            {t.wordle.title}
          </h2>
          <div className="flex flex-wrap items-center justify-end sm:justify-start gap-x-1.5 gap-y-0.5 text-[11px] sm:text-xs text-slate-400 sm:mt-1">
            {mode === 'daily' ? (
              <span className="font-semibold text-rose-300">
                {t.wordle.daily} #{wordlePuzzleNumber(gameDate)}
              </span>
            ) : (
              <button
                onClick={backToDaily}
                className="font-semibold text-amber-300 hover:text-white underline underline-offset-2"
                title={t.wordle.backToDaily}
              >
                {t.wordle.practice} · {t.wordle.backToDaily}
              </button>
            )}
            <span aria-hidden="true">·</span>
            <span>{currentJLPT} · {targetLength} {t.wordle.kanaLength}</span>
            <span aria-hidden="true">·</span>
            <span>{MAX_ATTEMPTS - guesses.length} {t.wordle.attemptsLeft}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{t.wordle.inputInstructions}</span>
          </div>
        </div>

        {/* Clean Controls Strip — Full-width balanced bar on mobile */}
        <div className="flex items-center justify-between sm:justify-end gap-1.5 sm:gap-2">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => selectLength(3)}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetLength === 3 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 {t.wordle.kanaLength}
            </button>
            <button
              onClick={() => selectLength(4)}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetLength === 4 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4 {t.wordle.kanaLength}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleNepali}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 transition-colors ${
                settings.showNepali
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
              }`}
              title="Toggle Nepali Meaning & Examples (नेपाली उदाहरण)"
            >
              <span>नेपाली</span>
            </button>

            <button
              onClick={() => setShowHint(prev => !prev)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1 transition-colors ${
                showHint 
                  ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' 
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
              title="Toggle First-Kana Hint"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.wordle.hint}</span>
            </button>

            <button
              onClick={startNewGame}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
              title={t.wordle.newPuzzle}
              aria-label={t.wordle.newPuzzle}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Visual Picture Prompt Card — Compact on Mobile so Keyboard Stays in Viewport */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden mb-3.5 sm:mb-5 shadow-md">
        <div className="grid grid-cols-12 items-stretch">
          {/* Picture Frame: 4 cols on mobile, 5 cols on sm+ */}
          <div className="col-span-4 sm:col-span-5 relative min-h-[120px] sm:min-h-[160px] bg-slate-950 overflow-hidden">
            {!imgError ? (
              <img
                src={currentWord.imageUrl}
                alt={currentWord.english}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950/60 via-slate-900 to-indigo-950/60 p-3 text-center">
                {/* Without the photo, don't fall back to the answer's kanji until the game is over */}
                <span className="text-2xl sm:text-4xl font-black text-rose-400/80 font-['Kosugi_Maru']">
                  {gameStatus === 'playing' ? '？' : currentWord.kanji || '言葉'}
                </span>
                <span className="text-[11px] text-slate-400 mt-1">{currentWord.english}</span>
              </div>
            )}
            <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-slate-950/85 backdrop-blur-sm border border-slate-800 text-[10px] sm:text-[11px] font-semibold text-slate-300">
              {currentWord.category || 'Vocab'} · {currentJLPT}
            </div>
          </div>

          {/* Clue & Target Prompt: 8 cols on mobile, 7 cols on sm+ */}
          <div className="col-span-8 sm:col-span-7 p-3 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-rose-400 truncate">
                  {uiLanguage === 'ja' ? '写真から日本語を当てよう' : 'Guess the Japanese Word'}
                </span>
                <button
                  onClick={() => speakJapanese(currentWord.kana)}
                  className="text-[11px] sm:text-xs text-slate-400 hover:text-white flex items-center gap-1 shrink-0 transition-colors"
                  title="Listen to pronunciation hint"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden xs:inline">{t.wordle.audio}</span>
                </button>
              </div>

              <h3 className="text-base sm:text-xl font-bold text-white mt-0.5 sm:mt-1 leading-snug">
                {currentWord.english}
              </h3>

              <p className="text-[11px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 leading-relaxed line-clamp-2 sm:line-clamp-none">
                {currentWord.hint}
              </p>

              {/* Nepali meaning often transliterates the answer (e.g. साकुरा = さくら),
                  so it stays hidden until the puzzle is over */}
              {settings.showNepali && nepaliData && gameStatus === 'playing' && (
                <p className="mt-2 pt-2 border-t border-slate-800/70 text-[11px] sm:text-xs text-emerald-400/80">
                  {t.wordle.nepaliLocked}
                </p>
              )}

              {/* Nepali Meaning & Example Section (Shown when Nepali toggle is ON) */}
              {settings.showNepali && nepaliData && gameStatus !== 'playing' && (
                <div className="mt-2 pt-2 border-t border-slate-800/70 space-y-0.5 sm:space-y-1 text-[11px] sm:text-xs">
                  <div className="flex flex-wrap items-baseline gap-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                      नेपाली:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {nepaliData.meaningNe}
                    </span>
                  </div>
                  {nepaliData.exampleNe && (
                    <p className="text-slate-400 leading-snug line-clamp-2 sm:line-clamp-none">
                      <span className="text-emerald-400/90 font-medium">उदाहरण: </span>
                      {nepaliData.exampleNe}
                    </p>
                  )}
                  {nepaliData.grammarNote && (
                    <p className="hidden sm:block text-[11px] text-slate-500 italic">
                      💡 {nepaliData.grammarNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-2 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-1 text-[11px] sm:text-xs text-slate-400">
              <span>
                {uiLanguage === 'ja'
                  ? `かな ${targetLength}文字`
                  : `Spell in ${targetLength} Kana boxes`}
              </span>
              {showHint && (
                <span className="font-mono text-amber-300 font-semibold">
                  "{targetChars[0]}..." ({currentWord.romaji.slice(0, 2)}...)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Single Active Wordle Row (3 Columns for 3 Kana, 4 Columns for 4 Kana — No Unnecessary Extra Grids) */}
      <div className="flex flex-col items-center mb-3.5 sm:mb-5">
        <div
          className="grid gap-2.5 sm:gap-3 select-none"
          style={{ gridTemplateColumns: `repeat(${targetLength}, minmax(0, 1fr))` }}
          data-testid="wordle-active-row"
        >
          {Array.from({ length: targetLength }).map((_, colIndex) => {
            const char = showingLastEvaluation
              ? lastGuess![colIndex] || ''
              : currentInput[colIndex] || '';

            const state: WordleTileState = showingLastEvaluation && lastEvaluation
              ? lastEvaluation[colIndex]
              : 'empty';

            const solvedGhost = !char && solvedPositions[colIndex] ? solvedPositions[colIndex] : null;

            let bgClass = 'bg-slate-900/80 border-slate-700/80 text-slate-100';
            if (state === 'correct') {
              bgClass = 'bg-emerald-600 border-emerald-500 text-white font-bold shadow-md';
            } else if (state === 'present') {
              bgClass = 'bg-amber-500 border-amber-400 text-slate-950 font-bold shadow-md';
            } else if (state === 'absent') {
              bgClass = 'bg-slate-950 border-slate-800 text-slate-500';
            } else if (char) {
              bgClass = 'bg-slate-800 border-rose-400 text-white scale-105 shadow-sm';
            }

            return (
              <div
                key={colIndex}
                className={`w-14 h-14 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded-xl sm:rounded-2xl border-2 transition-all duration-150 ${bgClass}`}
              >
                {char ? (
                  <span className="text-2xl sm:text-4xl font-black font-['Kosugi_Maru']">
                    {char}
                  </span>
                ) : solvedGhost ? (
                  <span className="text-xl sm:text-3xl font-bold font-['Kosugi_Maru'] text-emerald-500/35">
                    {solvedGhost}
                  </span>
                ) : (
                  <span className="text-xs font-mono text-slate-600">
                    {colIndex + 1}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Compact inline feedback if player made previous attempts (no bulky extra grid rows) */}
        {guesses.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 text-xs">
            <span className="text-slate-500">
              {uiLanguage === 'ja' ? '履歴:' : 'Tries:'}
            </span>
            {guesses.map((g, idx) => {
              const evalRow = evaluateWordleGuess(targetChars, g);
              return (
                <div
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 border border-slate-800 font-['Kosugi_Maru']"
                >
                  {g.map((ch, cIdx) => {
                    const st = evalRow[cIdx];
                    const color =
                      st === 'correct'
                        ? 'text-emerald-400 font-bold'
                        : st === 'present'
                        ? 'text-amber-400 font-bold'
                        : 'text-slate-500';
                    return (
                      <span key={cIdx} className={color}>
                        {ch}
                      </span>
                    );
                  })}
                </div>
              );
            })}
            {gameStatus === 'playing' && showingLastEvaluation && (
              <span className="text-slate-400 ml-1 text-[11px]">
                · {uiLanguage === 'ja' ? '続けて入力して再挑戦' : 'Type any key to try again'}
              </span>
            )}
          </div>
        )}

        {/* Finished (also after a reload): share or move on */}
        {gameStatus !== 'playing' && !revealedResultModal && (
          <div className="flex items-center justify-center gap-2 mt-3">
            <button
              onClick={handleShare}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareFeedback ?? t.wordle.share}</span>
            </button>
            <button
              onClick={startNewGame}
              className="px-3.5 py-2 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <span>{t.wordle.nextWord}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {romajiBuffer && (
        <div className="text-center mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs">
            <span>Romaji:</span>
            <span className="font-bold text-white uppercase">{romajiBuffer}</span>
          </span>
        </div>
      )}

      {/* Input Mode Selector Bar */}
      <div className="flex items-center justify-between gap-2 mb-2.5 text-xs text-slate-400">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg shrink-0">
          <button
            onClick={() => setKeyboardMode('romaji')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-semibold whitespace-nowrap ${
              keyboardMode === 'romaji' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5 shrink-0" />
            <span>{t.wordle.romajiInput}</span>
          </button>
          <button
            onClick={() => setKeyboardMode('kana')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold whitespace-nowrap ${
              keyboardMode === 'kana' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.wordle.kanaGrid}
          </button>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-emerald-600 inline-block" />
            {t.wordle.correct}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-amber-500 inline-block" />
            {t.wordle.present}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-sm bg-slate-800 inline-block" />
            {t.wordle.absent}
          </span>
        </div>
      </div>

      {/* Keyboard Area — Zero Horizontal Overflow on Mobile */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-2 sm:p-4 rounded-2xl shadow-lg">
        {keyboardMode === 'romaji' ? (
          <div className="flex flex-col gap-1.5 max-w-md mx-auto">
            {QWERTY_ROWS.map((row, rIndex) => (
              <div key={rIndex} className="flex justify-center gap-1">
                {row.map(letter => (
                  <button
                    key={letter}
                    onClick={() => handleRomajiKey(letter)}
                    disabled={gameStatus !== 'playing'}
                    className="flex-1 min-w-0 h-9 sm:h-10 max-w-[38px] rounded-md sm:rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/60 text-slate-200 font-bold text-xs sm:text-sm font-mono transition-colors flex items-center justify-center select-none"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-1.5 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleCharInput('ENTER')}
                disabled={pendingGuessLength !== targetLength || gameStatus !== 'playing'}
                className="px-4 sm:px-5 h-9 sm:h-10 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{t.wordle.enter}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleCharInput('BACKSPACE')}
                disabled={(currentInput.length === 0 && !romajiBuffer) || gameStatus !== 'playing'}
                className="px-3.5 sm:px-4 h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-all flex items-center gap-1"
                aria-label="Delete character"
              >
                <Delete className="w-4 h-4" />
                <span className="hidden sm:inline">{t.wordle.delete}</span>
              </button>

              <button
                onClick={() => speakJapanese(currentWord.kana)}
                className="px-3 h-9 sm:h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 text-xs transition-colors flex items-center gap-1"
                title={t.wordle.audio}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1 sm:gap-1.5 max-w-md mx-auto">
            {KANA_VOWEL_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center justify-center gap-1">
                <span className="w-4 text-[10px] sm:text-[11px] font-bold text-slate-500 font-mono text-center shrink-0">
                  {row.label}
                </span>
                {row.chars.map(char => {
                  const status = keyboardStatus[char];
                  let keyStyle = 'bg-slate-800 text-slate-200 hover:bg-slate-700 border-slate-700/60';
                  if (status === 'correct') {
                    keyStyle = 'bg-emerald-600 text-white border-emerald-500';
                  } else if (status === 'present') {
                    keyStyle = 'bg-amber-500 text-slate-950 font-bold border-amber-400';
                  } else if (status === 'absent') {
                    keyStyle = 'bg-slate-950 text-slate-600 border-slate-900 opacity-50';
                  }

                  return (
                    <button
                      key={char}
                      onClick={() => handleCharInput(char)}
                      disabled={gameStatus !== 'playing'}
                      className={`flex-1 min-w-0 h-8 sm:h-9 max-w-[36px] rounded-md sm:rounded-lg border text-xs sm:text-sm font-semibold font-['Kosugi_Maru'] transition-colors flex items-center justify-center select-none ${keyStyle}`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-1.5 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleCharInput('ENTER')}
                disabled={pendingGuessLength !== targetLength || gameStatus !== 'playing'}
                className="px-5 h-9 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white font-bold text-xs shadow-sm"
              >
                {t.wordle.enter}
              </button>
              <button
                onClick={() => handleCharInput('BACKSPACE')}
                disabled={(currentInput.length === 0 && !romajiBuffer) || gameStatus !== 'playing'}
                className="px-4 h-9 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700 text-xs font-semibold"
              >
                {t.wordle.delete}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Result Modal */}
      {revealedResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
            
            <div className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-3">
              {gameStatus === 'won' ? (
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              ) : (
                <XCircle className="w-10 h-10 text-rose-400" />
              )}
            </div>

            <h3 className="text-lg font-bold text-white">
              {gameStatus === 'won' ? t.wordle.correctGuess : t.wordle.gameOver}
            </h3>
            
            <p className="text-xs text-slate-400 mt-0.5">
              {gameStatus === 'won' 
                ? `${t.wordle.solvedIn} ${guesses.length} ${t.wordle.attempts}`
                : t.wordle.hereIsWord}
            </p>

            <div className="my-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col items-center">
              {currentWord.kanji && (
                <div className="text-3xl font-black text-rose-400 font-['Kosugi_Maru'] mb-1">
                  {currentWord.kanji}
                </div>
              )}
              <div className="text-xl font-bold text-white flex items-center gap-1.5 font-['Kosugi_Maru']">
                <span>{currentWord.kana}</span>
                <button
                  onClick={() => speakJapanese(currentWord.kana)}
                  className="p-1 text-slate-400 hover:text-white"
                  title={t.wordle.audio}
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>
              <div className="text-xs font-mono text-amber-300 mt-0.5">
                {currentWord.romaji}
              </div>
              <div className="text-xs font-medium text-slate-300 mt-2">
                "{currentWord.english}"
              </div>
              {settings.showNepali && nepaliData && (
                <div className="text-xs font-semibold text-emerald-400 mt-1">
                  नेपाली: {nepaliData.meaningNe}
                </div>
              )}
            </div>

            <div className="text-xs text-slate-400 mb-5">
              <span>+{gameStatus === 'won' ? '50' : '10'} {t.wordle.xpEarned}</span>
              <span aria-hidden="true"> · </span>
              <span>{currentJLPT} level</span>
            </div>

            <button
              onClick={handleShare}
              className="w-full mb-2 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{shareFeedback ?? t.wordle.share}</span>
            </button>

            <div className="flex gap-2">
              <button
                onClick={() => setRevealedResultModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                {t.wordle.reviewBoard}
              </button>
              <button
                onClick={startNewGame}
                className="flex-1 py-2.5 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-sm"
              >
                {t.wordle.nextWord}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
