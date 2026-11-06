import React, { useState, useEffect } from 'react';
import { RADICALS_LIST, KANJI_PUZZLES } from '../data/kanjiData';
import { KanjiPuzzle } from '../types';
import { canCraftKanji } from '../utils/kanjiLogic';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { playTaikoBeat, playSuccessChime, speakJapanese } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  Sparkles, 
  X, 
  RotateCcw, 
  Volume2, 
  ArrowRight,
  BookOpen
} from 'lucide-react';

export const KanjiForge: React.FC = () => {
  const { recordKanjiCrafted, currentJLPT, uiLanguage } = useGame();
  const t = getTranslation(uiLanguage);

  const [activePuzzleIndex, setActivePuzzleIndex] = useState<number>(0);
  const [selectedRadicals, setSelectedRadicals] = useState<string[]>([]);
  const [craftStatus, setCraftStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [craftedList, setCraftedList] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'forge' | 'codex'>('forge');
  const [selectedCodexKanji, setSelectedCodexKanji] = useState<KanjiPuzzle | null>(null);

  const filteredPuzzles = KANJI_PUZZLES.filter(p => p.level === currentJLPT);
  const puzzlePool = filteredPuzzles.length > 0 ? filteredPuzzles : KANJI_PUZZLES;

  useEffect(() => {
    setActivePuzzleIndex(0);
    setSelectedRadicals([]);
    setCraftStatus('idle');
  }, [currentJLPT]);

  const currentPuzzle = puzzlePool[activePuzzleIndex % puzzlePool.length] || KANJI_PUZZLES[0];

  const handleAddRadical = (symbol: string) => {
    if (selectedRadicals.length >= 4) return;
    playTaikoBeat();
    setSelectedRadicals(prev => [...prev, symbol]);
    setCraftStatus('idle');
  };

  const handleRemoveRadical = (index: number) => {
    setSelectedRadicals(prev => prev.filter((_, i) => i !== index));
    setCraftStatus('idle');
  };

  const handleClearCrucible = () => {
    setSelectedRadicals([]);
    setCraftStatus('idle');
  };

  const handleForge = () => {
    if (selectedRadicals.length === 0) return;

    const isMatch = canCraftKanji(selectedRadicals, currentPuzzle.radicals);

    if (isMatch) {
      setCraftStatus('success');
      playSuccessChime();
      speakJapanese(currentPuzzle.kanji);

      if (!craftedList.includes(currentPuzzle.id)) {
        setCraftedList(prev => [...prev, currentPuzzle.id]);
        recordKanjiCrafted();
      }

      confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    } else {
      setCraftStatus('failed');
      playTaikoBeat();
    }
  };

  const handleNextPuzzle = () => {
    setSelectedRadicals([]);
    setCraftStatus('idle');
    if (activePuzzleIndex + 1 < puzzlePool.length) {
      setActivePuzzleIndex(prev => prev + 1);
    } else {
      setActivePuzzleIndex(0);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-4" data-testid="kanji-forge-view">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {t.kanji.title}
            </h2>
            {uiLanguage === 'ja' && (
              <span className="text-sm font-['Kosugi_Maru'] text-rose-400">
                漢字フォージ
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{t.kanji.subtitle}</span>
            <span aria-hidden="true">·</span>
            <span>JLPT {currentJLPT}</span>
            <span aria-hidden="true">·</span>
            <span>{craftedList.length}/{puzzlePool.length} {t.kanji.mastered}</span>
          </div>
        </div>

        {/* Clean Segmented Tab Switch */}
        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-semibold self-end sm:self-auto">
          <button
            onClick={() => setActiveTab('forge')}
            className={`px-3 py-1.5 rounded transition-colors ${
              activeTab === 'forge' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {t.kanji.synthesisForge}
          </button>
          <button
            onClick={() => setActiveTab('codex')}
            className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
              activeTab === 'codex' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>{t.kanji.kanjiCodex}</span>
          </button>
        </div>
      </div>

      {activeTab === 'forge' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Zone: Target Quest & Synthesis Crucible (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            {/* Quest Card */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                <span className="font-semibold text-rose-400">
                  {t.kanji.quest} #{activePuzzleIndex + 1}
                </span>
                <span>{currentPuzzle.radicals.length} {t.kanji.radicalsRequired}</span>
              </div>

              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl font-black text-rose-300 font-['Kosugi_Maru'] shrink-0">
                  {craftStatus === 'success' || craftedList.includes(currentPuzzle.id) ? (
                    currentPuzzle.kanji
                  ) : (
                    <span className="text-slate-600 font-mono">?</span>
                  )}
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white">
                    {t.kanji.target}: {currentPuzzle.meaning}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1">
                    {t.kanji.ingredients}: <span className="text-amber-300 font-medium">{currentPuzzle.radicalNames.join(' + ')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* The Crucible */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4 text-xs font-semibold text-slate-300">
                <span>{t.kanji.theCrucible}</span>
                {selectedRadicals.length > 0 && (
                  <button
                    onClick={handleClearCrucible}
                    className="text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{t.kanji.reset}</span>
                  </button>
                )}
              </div>

              {/* Slots */}
              <div className="flex items-center justify-center gap-3 py-6 min-h-[90px] bg-slate-950/70 rounded-xl border border-slate-800 mb-5">
                {selectedRadicals.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">
                    {t.kanji.emptyCruciblePrompt}
                  </span>
                ) : (
                  selectedRadicals.map((rad, idx) => (
                    <div
                      key={idx}
                      className="group relative w-14 h-14 rounded-xl bg-slate-800 border border-amber-500/40 flex items-center justify-center text-2xl font-black text-amber-300 font-['Kosugi_Maru'] cursor-pointer hover:border-rose-400 transition-all select-none"
                      onClick={() => handleRemoveRadical(idx)}
                      title="Remove radical"
                    >
                      <span>{rad}</span>
                      <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  ))
                )}
              </div>

              {craftStatus === 'failed' && (
                <p className="text-xs text-rose-400 text-center mb-4">
                  {t.kanji.failedPrompt}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleForge}
                  disabled={selectedRadicals.length === 0}
                  className="flex-1 py-3 rounded-lg bg-rose-500 hover:bg-rose-600 disabled:opacity-30 text-white font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.kanji.forgeButton}</span>
                </button>

                {craftStatus === 'success' && (
                  <button
                    onClick={handleNextPuzzle}
                    className="px-4 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-all"
                  >
                    <span>{t.kanji.nextRecipe}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Success Details Box */}
            {craftStatus === 'success' && (
              <div className="bg-slate-900/60 border border-emerald-500/30 rounded-2xl p-5 animate-in fade-in duration-150">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex flex-col items-center justify-center font-['Kosugi_Maru'] shrink-0">
                    <span className="text-3xl font-black">{currentPuzzle.kanji}</span>
                    <button
                      onClick={() => speakJapanese(currentPuzzle.kanji)}
                      className="text-emerald-400 hover:text-emerald-200 mt-0.5"
                    >
                      <Volume2 className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>{currentPuzzle.meaning}</span>
                      <span className="text-xs text-emerald-400 font-normal">· {t.kanji.mastered} (+35 XP)</span>
                    </h4>

                    <div className="flex gap-4 text-xs text-slate-400 mt-2 font-mono">
                      <span>On: <strong className="text-slate-200">{currentPuzzle.onyomi.join(', ')}</strong></span>
                      <span>Kun: <strong className="text-slate-200">{currentPuzzle.kunyomi.join(', ')}</strong></span>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 italic bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                      💡 {currentPuzzle.mnemonic}
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right Zone: Radicals Palette (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
              <span className="font-semibold text-slate-200">{t.kanji.radicalsPalette}</span>
              <span>{RADICALS_LIST.length} {t.kanji.elements}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1">
              {RADICALS_LIST.map(rad => {
                const isSelected = selectedRadicals.includes(rad.symbol);
                return (
                  <button
                    key={rad.id}
                    onClick={() => handleAddRadical(rad.symbol)}
                    className={`p-2.5 rounded-xl border text-left transition-colors flex items-center gap-2.5 ${
                      isSelected
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                        : 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200'
                    }`}
                  >
                    <span className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center text-lg font-black text-rose-300 font-['Kosugi_Maru'] shrink-0">
                      {rad.symbol}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-bold truncate">
                        {rad.symbol} {rad.name.split(' ')[0]}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {rad.meaning}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      ) : (
        /* Codex View */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
            <span className="font-semibold text-white">{t.kanji.discoveredCharacters}</span>
            <span>{craftedList.length} of {KANJI_PUZZLES.length} {t.kanji.unlocked}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {KANJI_PUZZLES.map(puzzle => {
              const isUnlocked = craftedList.includes(puzzle.id);
              return (
                <div
                  key={puzzle.id}
                  onClick={() => setSelectedCodexKanji(puzzle)}
                  className={`p-3.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-3 ${
                    isUnlocked
                      ? 'bg-slate-900 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl font-black font-['Kosugi_Maru'] ${
                    isUnlocked ? 'bg-rose-500/10 text-rose-300 border border-rose-500/20' : 'bg-slate-900 text-slate-700'
                  }`}>
                    {isUnlocked ? puzzle.kanji : '?'}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-white truncate">
                      {isUnlocked ? puzzle.meaning : 'Locked Character'}
                    </h4>
                    <span className="text-[11px] text-slate-500 truncate block">
                      Radicals: {puzzle.radicals.join(' + ')}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {selectedCodexKanji && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-150">
              <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative">
                <button
                  onClick={() => setSelectedCodexKanji(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-3xl font-black font-['Kosugi_Maru'] flex items-center justify-center">
                    {selectedCodexKanji.kanji}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedCodexKanji.meaning}
                    </h3>
                    <div className="text-xs text-slate-400 font-mono mt-0.5">
                      JLPT {selectedCodexKanji.level} · {selectedCodexKanji.strokeCount} Strokes
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-lg border border-slate-800 text-xs text-slate-300 mb-4">
                  💡 {selectedCodexKanji.mnemonic}
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 block mb-1">{t.kanji.compounds}:</span>
                  {selectedCodexKanji.examples.map((ex, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800/80 text-xs">
                      <span className="font-bold text-rose-300">{ex.word} ({ex.reading})</span>
                      <span className="text-slate-400">{ex.meaning}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
