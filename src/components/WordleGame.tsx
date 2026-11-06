import React, { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { WORDLE_WORDS } from '../data/wordleWords';
import { NEPALI_WORDLE_MAP } from '../data/nepaliData';
import { evaluateWordleGuess, isWordleWon, computeKeyboardStatus } from '../utils/wordleLogic';
import { romajiToHiragana } from '../utils/typingLogic';
import { getTranslation } from '../utils/i18n';
import { WordleWord, WordleTileState } from '../types';
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
  Keyboard
} from 'lucide-react';

const MAX_ATTEMPTS = 6;

const QWERTY_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M']
];

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
  
  const [targetLength, setTargetLength] = useState<3 | 4>(3);
  const [currentWord, setCurrentWord] = useState<WordleWord>(() => {
    const levelPool = WORDLE_WORDS.filter(w => w.jlpt === currentJLPT && Array.from(w.kana).length === 3);
    if (levelPool.length > 0) return levelPool[0];
    const fallback = WORDLE_WORDS.filter(w => Array.from(w.kana).length === 3);
    return fallback[0] || WORDLE_WORDS[0];
  });

  const [guesses, setGuesses] = useState<string[][]>([]);
  const [currentInput, setCurrentInput] = useState<string[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showHint, setShowHint] = useState<boolean>(false);
  const [revealedResultModal, setRevealedResultModal] = useState<boolean>(false);
  const [romajiBuffer, setRomajiBuffer] = useState<string>('');
  const [keyboardMode, setKeyboardMode] = useState<'romaji' | 'kana'>('romaji');
  const [imgError, setImgError] = useState<boolean>(false);

  const targetChars = Array.from(currentWord.kana);

  const startNewGame = useCallback((length: 3 | 4 = targetLength) => {
    let pool = WORDLE_WORDS.filter(w => w.jlpt === currentJLPT && Array.from(w.kana).length === length);
    if (pool.length === 0) {
      pool = WORDLE_WORDS.filter(w => Array.from(w.kana).length === length);
    }
    // Try to pick a different word than the current one if pool has > 1
    const candidates = pool.length > 1 ? pool.filter(w => w.id !== currentWord.id) : pool;
    const randomIndex = Math.floor(Math.random() * candidates.length);
    const chosen = candidates[randomIndex] || pool[0];
    
    setTargetLength(length);
    setCurrentWord(chosen);
    setGuesses([]);
    setCurrentInput([]);
    setGameStatus('playing');
    setShowHint(false);
    setRevealedResultModal(false);
    setRomajiBuffer('');
    setImgError(false);
  }, [targetLength, currentJLPT, currentWord.id]);

  // Update puzzle when currentJLPT changes
  useEffect(() => {
    let pool = WORDLE_WORDS.filter(w => w.jlpt === currentJLPT && Array.from(w.kana).length === targetLength);
    if (pool.length === 0) {
      pool = WORDLE_WORDS.filter(w => Array.from(w.kana).length === targetLength);
    }
    const chosen = pool[0] || WORDLE_WORDS[0];
    setCurrentWord(chosen);
    setGuesses([]);
    setCurrentInput([]);
    setGameStatus('playing');
    setShowHint(false);
    setRevealedResultModal(false);
    setRomajiBuffer('');
    setImgError(false);
  }, [currentJLPT, targetLength]);

  const handleCharInput = useCallback((char: string) => {
    if (gameStatus !== 'playing') return;

    if (char === 'ENTER') {
      if (currentInput.length !== targetLength) return;

      playCardFlipSound();
      const newGuesses = [...guesses, currentInput];
      setGuesses(newGuesses);
      setRomajiBuffer('');

      const evaluation = evaluateWordleGuess(targetChars, currentInput);
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
      } else {
        // Clear currentInput so the single row shows the evaluated feedback until next key press
        setCurrentInput([]);
      }
      return;
    }

    if (char === 'BACKSPACE') {
      if (currentInput.length > 0) {
        setCurrentInput(prev => prev.slice(0, -1));
        setRomajiBuffer('');
        playCardFlipSound();
      }
      return;
    }

    if (currentInput.length < targetLength) {
      playCardFlipSound();
      setCurrentInput(prev => [...prev, char]);
    }
  }, [gameStatus, currentInput, targetLength, guesses, targetChars, recordWordleWin, addXP, currentWord.kana]);

  const handleRomajiKey = useCallback((letter: string) => {
    if (gameStatus !== 'playing') return;
    const next = romajiBuffer + letter.toLowerCase();
    const converted = romajiToHiragana(next);

    if (converted !== next) {
      const chars = Array.from(converted);
      const newKana = chars[chars.length - 1];
      handleCharInput(newKana);
      setRomajiBuffer('');
    } else {
      setRomajiBuffer(next);
    }
  }, [gameStatus, romajiBuffer, handleCharInput]);

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
    <div className="max-w-2xl mx-auto px-4 py-3" data-testid="wordle-view">
      
      {/* Editorial Header Section */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-slate-800/80 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {t.wordle.title}
          </h2>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{currentJLPT} · {targetLength} {t.wordle.kanaLength}</span>
            <span aria-hidden="true">·</span>
            <span>{MAX_ATTEMPTS - guesses.length} {t.wordle.attemptsLeft}</span>
            <span aria-hidden="true">·</span>
            <span>{t.wordle.inputInstructions}</span>
          </div>
        </div>

        {/* Clean Controls Strip */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            <button
              onClick={() => startNewGame(3)}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetLength === 3 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              3 {t.wordle.kanaLength}
            </button>
            <button
              onClick={() => startNewGame(4)}
              className={`px-2.5 py-1 rounded transition-colors ${
                targetLength === 4 ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              4 {t.wordle.kanaLength}
            </button>
          </div>

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
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors ${
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
            onClick={() => startNewGame(targetLength)}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-800 transition-colors"
            title={t.wordle.newPuzzle}
            aria-label={t.wordle.newPuzzle}
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Visual Picture Prompt Card — Gives Players Clear Visual Context to Guess From */}
      <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden mb-5 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-12 items-stretch">
          {/* Picture Frame */}
          <div className="sm:col-span-5 relative h-44 sm:h-auto min-h-[160px] bg-slate-950 overflow-hidden">
            {!imgError ? (
              <img
                src={currentWord.imageUrl}
                alt={currentWord.english}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-rose-950/60 via-slate-900 to-indigo-950/60 p-4 text-center">
                <span className="text-4xl font-black text-rose-400/80 font-['Kosugi_Maru']">
                  {currentWord.kanji || '言葉'}
                </span>
                <span className="text-xs text-slate-400 mt-1">{currentWord.english}</span>
              </div>
            )}
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-sm border border-slate-800 text-[11px] font-semibold text-slate-300">
              {currentWord.category || 'Vocabulary'} · {currentJLPT}
            </div>
          </div>

          {/* Clue & Target Prompt */}
          <div className="sm:col-span-7 p-4 sm:p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400">
                  {uiLanguage === 'ja' ? '写真から日本語を当てよう' : 'Guess the Japanese Word'}
                </span>
                <button
                  onClick={() => speakJapanese(currentWord.kana)}
                  className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors"
                  title="Listen to pronunciation hint"
                >
                  <Volume2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>{t.wordle.audio}</span>
                </button>
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
                {currentWord.english}
              </h3>

              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {currentWord.hint}
              </p>

              {/* Nepali Meaning & Example Section (Shown when Nepali toggle is ON) */}
              {settings.showNepali && nepaliData && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-800/70 space-y-1 text-xs">
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 shrink-0">
                      नेपाली अर्थ:
                    </span>
                    <span className="font-semibold text-slate-200">
                      {nepaliData.meaningNe}
                    </span>
                  </div>
                  {nepaliData.exampleNe && (
                    <p className="text-slate-400 leading-relaxed">
                      <span className="text-emerald-400/90 font-medium">उदाहरण: </span>
                      {nepaliData.exampleNe}
                    </p>
                  )}
                  {nepaliData.grammarNote && (
                    <p className="text-[11px] text-slate-500 italic">
                      💡 {nepaliData.grammarNote}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>
                {uiLanguage === 'ja'
                  ? `かな ${targetLength}文字で入力`
                  : `Spell in ${targetLength} Kana boxes below`}
              </span>
              {showHint && (
                <span className="font-mono text-amber-300 font-semibold">
                  {t.wordle.soundsLike}: "{targetChars[0]}..." ({currentWord.romaji.slice(0, 2)}...)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Single Active Wordle Row (3 Columns for 3 Kana, 4 Columns for 4 Kana — No Unnecessary Extra Grids) */}
      <div className="flex flex-col items-center mb-5">
        <div
          className="grid gap-3 select-none"
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
                className={`w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center rounded-2xl border-2 transition-all duration-150 ${bgClass}`}
              >
                {char ? (
                  <span className="text-3xl sm:text-4xl font-black font-['Kosugi_Maru']">
                    {char}
                  </span>
                ) : solvedGhost ? (
                  <span className="text-2xl sm:text-3xl font-bold font-['Kosugi_Maru'] text-emerald-500/35">
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
          <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-xs">
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
              <span className="text-slate-400 ml-1">
                · {uiLanguage === 'ja' ? '続けて入力して再挑戦' : 'Type any key to try again'}
              </span>
            )}
          </div>
        )}
      </div>

      {romajiBuffer && (
        <div className="text-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 font-mono text-xs">
            <span>Romaji:</span>
            <span className="font-bold text-white uppercase">{romajiBuffer}</span>
          </span>
        </div>
      )}

      {/* Input Mode Selector Bar */}
      <div className="flex items-center justify-between mb-3 text-xs text-slate-400">
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg">
          <button
            onClick={() => setKeyboardMode('romaji')}
            className={`px-2.5 py-1 rounded transition-colors flex items-center gap-1 font-semibold ${
              keyboardMode === 'romaji' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span>{t.wordle.romajiInput}</span>
          </button>
          <button
            onClick={() => setKeyboardMode('kana')}
            className={`px-2.5 py-1 rounded transition-colors font-semibold ${
              keyboardMode === 'kana' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t.wordle.kanaGrid}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-600 inline-block" />
            {t.wordle.correct}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
            {t.wordle.present}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-slate-800 inline-block" />
            {t.wordle.absent}
          </span>
        </div>
      </div>

      {/* Keyboard Area */}
      <div className="bg-slate-900/60 border border-slate-800/80 p-3 sm:p-4 rounded-2xl shadow-lg">
        {keyboardMode === 'romaji' ? (
          <div className="flex flex-col gap-1.5 max-w-md mx-auto">
            {QWERTY_ROWS.map((row, rIndex) => (
              <div key={rIndex} className="flex justify-center gap-1">
                {row.map(letter => (
                  <button
                    key={letter}
                    onClick={() => handleRomajiKey(letter)}
                    disabled={gameStatus !== 'playing'}
                    className="flex-1 h-10 min-w-[28px] max-w-[38px] rounded-lg bg-slate-800 hover:bg-slate-700 active:bg-slate-600 border border-slate-700/60 text-slate-200 font-bold text-xs sm:text-sm font-mono transition-colors flex items-center justify-center select-none"
                  >
                    {letter}
                  </button>
                ))}
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleCharInput('ENTER')}
                disabled={currentInput.length !== targetLength || gameStatus !== 'playing'}
                className="px-5 h-10 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <span>{t.wordle.enter}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleCharInput('BACKSPACE')}
                disabled={currentInput.length === 0 || gameStatus !== 'playing'}
                className="px-4 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-slate-300 border border-slate-700/80 text-xs font-semibold transition-all flex items-center gap-1"
                aria-label="Delete character"
              >
                <Delete className="w-4 h-4" />
                <span className="hidden sm:inline">{t.wordle.delete}</span>
              </button>

              <button
                onClick={() => speakJapanese(currentWord.kana)}
                className="px-3 h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/80 text-xs transition-colors flex items-center gap-1"
                title={t.wordle.audio}
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5 overflow-x-auto pb-1">
            {KANA_VOWEL_ROWS.map((row, rIdx) => (
              <div key={rIdx} className="flex items-center justify-center gap-1">
                <span className="w-5 text-[11px] font-bold text-slate-500 font-mono text-center">
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
                      className={`h-9 w-8 sm:w-9 rounded-lg border text-xs sm:text-sm font-semibold font-['Kosugi_Maru'] transition-colors flex items-center justify-center select-none ${keyStyle}`}
                    >
                      {char}
                    </button>
                  );
                })}
              </div>
            ))}

            <div className="flex justify-center gap-2 mt-2 pt-2 border-t border-slate-800/80">
              <button
                onClick={() => handleCharInput('ENTER')}
                disabled={currentInput.length !== targetLength || gameStatus !== 'playing'}
                className="px-5 h-9 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white font-bold text-xs shadow-sm"
              >
                {t.wordle.enter}
              </button>
              <button
                onClick={() => handleCharInput('BACKSPACE')}
                disabled={currentInput.length === 0 || gameStatus !== 'playing'}
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
            </div>

            <div className="text-xs text-slate-400 mb-5">
              <span>+{gameStatus === 'won' ? '50' : '10'} {t.wordle.xpEarned}</span>
              <span aria-hidden="true"> · </span>
              <span>{currentJLPT} level</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setRevealedResultModal(false)}
                className="flex-1 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700"
              >
                {t.wordle.reviewBoard}
              </button>
              <button
                onClick={() => startNewGame(targetLength)}
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
