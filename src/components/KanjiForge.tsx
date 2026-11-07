import React, { useState, useEffect, useRef, useCallback } from 'react';
import { KanjiWritingItem } from '../data/kanjiStrokeData';
import { useContentPack } from '../data/contentPack';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { playTaikoBeat, playSuccessChime, speakJapanese } from '../utils/audio';
import confetti from 'canvas-confetti';
import { 
  RotateCcw, 
  Volume2, 
  ArrowRight,
  BookOpen,
  Eye,
  EyeOff,
  Compass,
  Undo2,
  CheckCircle2,
  Sparkles,
  Play,
  PenTool
} from 'lucide-react';

interface Point {
  x: number;
  y: number;
}

const EMPTY_KANJI: KanjiWritingItem = {
  id: '',
  kanji: '',
  meaning: '',
  onyomi: [],
  kunyomi: [],
  level: 'N5',
  Complexity: 'Basic',
  strokeRuleSummary: '',
  basicBlocks: [],
  strokes: [],
  examples: []
};

export const KanjiForge: React.FC = () => {
  const { settings, recordKanjiCrafted, currentJLPT, uiLanguage, toggleNepali } = useGame();
  const t = getTranslation(uiLanguage);
  const { pack, ready } = useContentPack(currentJLPT);

  // Hand-written kanji first (they have Nepali meanings), then the generated
  // ones for this level, ordered by how common the character is.
  const orderedKanjiPool = pack.kanji;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'board' | 'codex'>('board');

  // Coach Mode: Dotted line of the letter for the user to follow
  const [coachEnabled, setCoachEnabled] = useState<boolean>(true);
  // Start Points Mode: Show numbered starting points for strokes (especially helpful for complex Kanji)
  const [showStartPoints, setShowStartPoints] = useState<boolean>(true);
  const [showAllStarts, setShowAllStarts] = useState<boolean>(false);

  // Current stroke index (0-based)
  const [currentStrokeIdx, setCurrentStrokeIdx] = useState<number>(0);
  // User-drawn strokes on the 0..100 coordinate grid
  const [userStrokes, setUserStrokes] = useState<Point[][]>([]);
  const [activePoints, setActivePoints] = useState<Point[]>([]);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [masteredIds, setMasteredIds] = useState<string[]>([]);
  const [strokeHintMessage, setStrokeHintMessage] = useState<string | null>(null);
  const [isAnimatingDemo, setIsAnimatingDemo] = useState<boolean>(false);

  const svgBoardRef = useRef<SVGSVGElement | null>(null);

  // Placeholder for the first paint before this level's kanji have loaded;
  // the early return below means it never reaches the board.
  const currentItem: KanjiWritingItem =
    orderedKanjiPool[activeIndex % Math.max(1, orderedKanjiPool.length)] ?? EMPTY_KANJI;
  const totalStrokes = currentItem.strokes.length;
  const activeStrokeStep = currentItem.strokes[Math.min(currentStrokeIdx, totalStrokes - 1)];

  // Reset board when Kanji or JLPT changes
  useEffect(() => {
    setActiveIndex(0);
    setCurrentStrokeIdx(0);
    setUserStrokes([]);
    setActivePoints([]);
    setIsCompleted(false);
    setStrokeHintMessage(null);
  }, [currentJLPT]);

  const resetBoard = useCallback(() => {
    setCurrentStrokeIdx(0);
    setUserStrokes([]);
    setActivePoints([]);
    setIsCompleted(false);
    setStrokeHintMessage(null);
  }, []);

  const selectKanjiIndex = (idx: number) => {
    setActiveIndex(idx);
    setCurrentStrokeIdx(0);
    setUserStrokes([]);
    setActivePoints([]);
    setIsCompleted(false);
    setStrokeHintMessage(null);
    setActiveTab('board');
  };

  // Convert pointer event to 0..100 SVG coordinate space
  const getBoardCoords = (e: React.PointerEvent<SVGSVGElement>): Point | null => {
    const svg = svgBoardRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return null;
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    return { x, y };
  };

  const handlePointerDown = (e: React.PointerEvent<SVGSVGElement>) => {
    if (isCompleted || isAnimatingDemo) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const pt = getBoardCoords(e);
    if (!pt) return;
    setIsDrawing(true);
    setActivePoints([pt]);
    setStrokeHintMessage(null);
  };

  const handlePointerMove = (e: React.PointerEvent<SVGSVGElement>) => {
    if (!isDrawing || isCompleted) return;
    e.preventDefault();
    const pt = getBoardCoords(e);
    if (!pt) return;
    setActivePoints(prev => {
      if (prev.length === 0) return [pt];
      const last = prev[prev.length - 1];
      const dist = Math.hypot(pt.x - last.x, pt.y - last.y);
      if (dist < 1.2) return prev;
      return [...prev, pt];
    });
  };

  const finishStroke = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);

    if (activePoints.length < 2) {
      setActivePoints([]);
      return;
    }

    const startPt = activePoints[0];
    const endPt = activePoints[activePoints.length - 1];
    const strokeLength = activePoints.reduce((acc, pt, idx) => {
      if (idx === 0) return 0;
      return acc + Math.hypot(pt.x - activePoints[idx - 1].x, pt.y - activePoints[idx - 1].y);
    }, 0);

    // Ignore tiny accidental taps
    if (strokeLength < 5) {
      setActivePoints([]);
      return;
    }

    // Check proximity to expected start point so we can give helpful coaching feedback
    const expected = currentItem.strokes[currentStrokeIdx];
    if (expected) {
      const startDist = Math.hypot(startPt.x - expected.startX, startPt.y - expected.startY);
      const reverseDist = Math.hypot(startPt.x - expected.endX, startPt.y - expected.endY);

      // If user started very close to the end point and drew backwards, gently coach them
      if (startDist > 34 && reverseDist < 22 && endPt && Math.hypot(endPt.x - expected.startX, endPt.y - expected.startY) < 28) {
        playTaikoBeat();
        setStrokeHintMessage(
          uiLanguage === 'ja'
            ? `逆方向です！番号 ${expected.num} の丸印（始点）から書き始めましょう。`
            : `Start from circle #${expected.num}! Follow the stroke direction (${expected.instruction}).`
        );
        setActivePoints([]);
        return;
      }
    }

    // Accept the stroke and advance
    playTaikoBeat();
    const nextStrokes = [...userStrokes, activePoints];
    setUserStrokes(nextStrokes);
    setActivePoints([]);

    if (currentStrokeIdx + 1 >= totalStrokes) {
      // Completed all strokes!
      setIsCompleted(true);
      playSuccessChime();
      speakJapanese(currentItem.kanji);
      if (!masteredIds.includes(currentItem.id)) {
        setMasteredIds(prev => [...prev, currentItem.id]);
        recordKanjiCrafted();
      }
      confetti({ particleCount: 65, spread: 60, origin: { y: 0.6 } });
    } else {
      setCurrentStrokeIdx(prev => prev + 1);
    }
  }, [
    isDrawing,
    activePoints,
    currentItem,
    currentStrokeIdx,
    totalStrokes,
    userStrokes,
    masteredIds,
    recordKanjiCrafted,
    uiLanguage
  ]);

  const handleUndoStroke = () => {
    if (userStrokes.length === 0) return;
    playTaikoBeat();
    setUserStrokes(prev => prev.slice(0, -1));
    setCurrentStrokeIdx(prev => Math.max(0, prev - 1));
    setIsCompleted(false);
    setStrokeHintMessage(null);
  };

  const handleDemoAnimation = () => {
    if (isAnimatingDemo) return;
    setIsAnimatingDemo(true);
    setTimeout(() => {
      setIsAnimatingDemo(false);
    }, 1200);
  };

  const handleNextKanji = () => {
    selectKanjiIndex((activeIndex + 1) % orderedKanjiPool.length);
  };

  // Convert an array of Points into a smooth SVG polyline/path string
  const pointsToSvgPath = (pts: Point[]): string => {
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  };

  if (orderedKanjiPool.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-2 sm:px-4 py-10 text-center text-sm text-slate-400" data-testid="kanji-loading">
        {ready ? t.kanji.noneForLevel : t.kanji.loading}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="kanji-forge-view">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 pb-3 sm:pb-4 border-b border-slate-800/80 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center justify-between sm:justify-start gap-2">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight whitespace-nowrap">
              {uiLanguage === 'ja' ? '漢字書き順ボード' : 'Kanji Writing Board'}
            </h2>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/30 whitespace-nowrap">
              {currentItem.level} · {currentItem.Complexity}
            </span>
          </div>
          <div className="flex items-center justify-between sm:justify-start gap-1.5 text-xs text-slate-400 mt-1">
            <span className="truncate">
              {uiLanguage === 'ja'
                ? '指やマウスで書き順通りに練習'
                : 'Write with finger or mouse · Guided stroke order'}
            </span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="shrink-0 font-medium text-slate-300">{masteredIds.length}/{orderedKanjiPool.length} {t.kanji.mastered}</span>
          </div>
        </div>

        {/* Mode & Nepali Controls */}
        <div className="flex items-center justify-between sm:justify-end gap-2">
          <button
            onClick={toggleNepali}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-colors whitespace-nowrap ${
              settings.showNepali
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Nepali Meaning (नेपाली अर्थ)"
          >
            नेपाली: {settings.showNepali ? 'ON' : 'OFF'}
          </button>

          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('board')}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'board' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PenTool className="w-3.5 h-3.5 text-rose-400" />
              <span>{uiLanguage === 'ja' ? '練習ボード' : 'Writing Board'}</span>
            </button>
            <button
              onClick={() => setActiveTab('codex')}
              className={`px-2.5 sm:px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'codex' ? 'bg-slate-800 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>{t.kanji.kanjiCodex}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Kanji Character Selector Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 scrollbar-none">
        {orderedKanjiPool.map((item, idx) => {
          const isCurrent = item.id === currentItem.id;
          const isDone = masteredIds.includes(item.id);
          return (
            <button
              key={item.id}
              onClick={() => selectKanjiIndex(idx)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 shrink-0 transition-all ${
                isCurrent
                  ? 'bg-rose-500 text-white border-rose-400 shadow-sm'
                  : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <span className="text-base font-black font-['Kosugi_Maru']">{item.kanji}</span>
              <span className="text-[11px] opacity-90">{item.meaning.split('/')[0].trim()}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-black/20 font-mono">
                {item.strokes.length}s
              </span>
              {isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />}
            </button>
          );
        })}
      </div>

      {activeTab === 'board' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-start">
          
          {/* Left Column (7 cols): Interactive Finger Writing Grid Board & Coach Controls */}
          <div className="lg:col-span-7 flex flex-col items-center bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 sm:p-6 shadow-md">
            
            {/* Top Bar Above Grid: Coach Dotted Line Toggle + Start Points Toggle */}
            <div className="w-full flex flex-wrap items-center justify-between gap-1.5 mb-3">
              <div className="flex items-center gap-1.5">
                {/* Coach Toggle Button (Dotted Line Guide) */}
                <button
                  type="button"
                  onClick={() => setCoachEnabled(prev => !prev)}
                  data-testid="coach-dotted-toggle"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    coachEnabled
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Toggle dotted line coach guide on the writing board"
                >
                  {coachEnabled ? <Eye className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <EyeOff className="w-3.5 h-3.5 shrink-0" />}
                  <span>
                    {uiLanguage === 'ja'
                      ? `コーチ点線: ${coachEnabled ? 'ON' : 'OFF'}`
                      : `Coach Line: ${coachEnabled ? 'ON' : 'OFF'}`}
                  </span>
                </button>

                {/* Stroke Start Marker Toggle */}
                <button
                  type="button"
                  onClick={() => setShowStartPoints(prev => !prev)}
                  data-testid="stroke-start-toggle"
                  className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 whitespace-nowrap transition-colors ${
                    showStartPoints
                      ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                  }`}
                  title="Display where to start each stroke"
                >
                  <Compass className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span>
                    {uiLanguage === 'ja'
                      ? `始点: ${showStartPoints ? 'ON' : 'OFF'}`
                      : `Start Point: ${showStartPoints ? 'ON' : 'OFF'}`}
                  </span>
                </button>
              </div>

              {/* All Start Numbers Toggle for Complex Kanji */}
              <button
                type="button"
                onClick={() => setShowAllStarts(prev => !prev)}
                className={`px-2 py-1.5 rounded-lg text-[11px] font-semibold border whitespace-nowrap transition-colors ${
                  showAllStarts
                    ? 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                }`}
              >
                {showAllStarts ? `All (1–${totalStrokes})` : 'Current Only'}
              </button>
            </div>

            {/* Active Stroke Instruction Banner */}
            <div className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-800/90 mb-3 flex items-center justify-between gap-2">
              {!isCompleted ? (
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-6 h-6 rounded-full bg-rose-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {currentStrokeIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[11px] font-bold text-rose-400 uppercase tracking-wider">
                      Stroke {currentStrokeIdx + 1} of {totalStrokes} · {activeStrokeStep.componentLabel}
                    </div>
                    <p className="text-xs text-slate-200 truncate font-medium">
                      {activeStrokeStep.instruction}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>
                    {uiLanguage === 'ja'
                      ? `「${currentItem.kanji}」全${totalStrokes}画クリア！ (+35 XP)`
                      : `Completed "${currentItem.kanji}" (${totalStrokes} strokes)! +35 XP`}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={handleDemoAnimation}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 shrink-0 border border-slate-700"
                title="Watch stroke animation"
              >
                <Play className="w-3 h-3 fill-amber-300" />
                <span>Demo</span>
              </button>
            </div>

            {strokeHintMessage && (
              <div className="w-full px-3 py-1.5 mb-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium text-center">
                {strokeHintMessage}
              </div>
            )}

            {/* Traditional 4-Quadrant Japanese Calligraphy Writing Grid Board (Masume) */}
            <div className="relative w-full max-w-[320px] sm:max-w-[360px] aspect-square rounded-2xl bg-slate-950 border-2 border-slate-700/90 shadow-inner overflow-hidden select-none">
              <svg
                ref={svgBoardRef}
                viewBox="0 0 100 100"
                data-testid="kanji-writing-canvas"
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={finishStroke}
                onPointerCancel={finishStroke}
                className="w-full h-full touch-none cursor-crosshair"
              >
                {/* 4-Quadrant Genkō Yōshi Practice Grid Lines */}
                <line x1="50" y1="0" x2="50" y2="100" stroke="#334155" strokeWidth="0.6" strokeDasharray="2.5 2.5" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="#334155" strokeWidth="0.6" strokeDasharray="2.5 2.5" />
                <line x1="0" y1="0" x2="100" y2="100" stroke="#1e293b" strokeWidth="0.4" strokeDasharray="2 3" />
                <line x1="100" y1="0" x2="0" y2="100" stroke="#1e293b" strokeWidth="0.4" strokeDasharray="2 3" />
                <rect x="6" y="6" width="88" height="88" fill="none" stroke="#1e293b" strokeWidth="0.5" rx="3" />

                {/* COACH MODE: Small Dotted Line of the Kanji Letter for User to Follow */}
                {coachEnabled && (
                  <g data-testid="coach-dotted-guide">
                    {currentItem.strokes.map((st, idx) => {
                      const isDone = idx < currentStrokeIdx;
                      const isCurrent = idx === currentStrokeIdx && !isCompleted;
                      if (isDone) return null;
                      return (
                        <path
                          key={st.num}
                          d={st.path}
                          fill="none"
                          stroke={isCurrent ? '#fbbf24' : '#64748b'}
                          strokeWidth={isCurrent ? '3.2' : '2.2'}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeDasharray={isCurrent ? '2.5 3.5' : '1.8 3.2'}
                          opacity={isCurrent ? 0.85 : 0.4}
                        />
                      );
                    })}
                  </g>
                )}

                {/* Demo Stroke Animation Overlay */}
                {isAnimatingDemo && activeStrokeStep && (
                  <path
                    d={activeStrokeStep.path}
                    fill="none"
                    stroke="#f43f5e"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.9"
                  />
                )}

                {/* Completed Reference Strokes (Clean Calligraphy Ink) */}
                {currentItem.strokes.slice(0, currentStrokeIdx).map(st => (
                  <path
                    key={`done-${st.num}`}
                    d={st.path}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="4.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity="0.35"
                  />
                ))}

                {/* User's Own Finger/Stylus Drawn Strokes */}
                {userStrokes.map((pts, idx) => (
                  <path
                    key={`user-${idx}`}
                    d={pointsToSvgPath(pts)}
                    fill="none"
                    stroke={isCompleted ? '#34d399' : '#f8fafc'}
                    strokeWidth="5.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                ))}

                {/* Active Finger Stroke Currently Being Drawn */}
                {activePoints.length > 1 && (
                  <path
                    d={pointsToSvgPath(activePoints)}
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="5.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                )}

                {/* STROKE START MARKERS: Shows where to start the stroke from basic to complex */}
                {showStartPoints && !isCompleted && (
                  <g data-testid="stroke-start-markers">
                    {currentItem.strokes.map((st, idx) => {
                      const isCurrent = idx === currentStrokeIdx;
                      if (!isCurrent && !showAllStarts) return null;
                      if (idx < currentStrokeIdx && !showAllStarts) return null;

                      return (
                        <g key={`start-${st.num}`}>
                          {/* Pulsing ring on current stroke start */}
                          {isCurrent && (
                            <circle
                              cx={st.startX}
                              cy={st.startY}
                              r="6.2"
                              fill="none"
                              stroke="#f43f5e"
                              strokeWidth="1.2"
                              opacity="0.75"
                            />
                          )}
                          <circle
                            cx={st.startX}
                            cy={st.startY}
                            r={isCurrent ? '4.2' : '3.2'}
                            fill={isCurrent ? '#f43f5e' : '#334155'}
                            stroke="#ffffff"
                            strokeWidth="0.7"
                          />
                          <text
                            x={st.startX}
                            y={st.startY + 1.3}
                            textAnchor="middle"
                            fill="#ffffff"
                            fontSize={isCurrent ? '4.2' : '3.4'}
                            fontWeight="bold"
                          >
                            {st.num}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                )}
              </svg>

              {/* Corner Watermark Indicator */}
              <div className="absolute bottom-2 right-2.5 pointer-events-none text-[10px] font-mono text-slate-500">
                {currentStrokeIdx}/{totalStrokes} strokes
              </div>
            </div>

            {/* Bottom Board Controls: Undo, Clear, Audio, Next Kanji */}
            <div className="w-full flex items-center justify-between gap-2 mt-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleUndoStroke}
                  disabled={userStrokes.length === 0}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <Undo2 className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'ja' ? '1画戻す' : 'Undo'}</span>
                </button>

                <button
                  type="button"
                  onClick={resetBoard}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{uiLanguage === 'ja' ? '消去' : 'Clear'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => speakJapanese(currentItem.kanji)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 transition-colors"
                  title="Listen to Kanji pronunciation"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              <button
                type="button"
                onClick={handleNextKanji}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
              >
                <span>{uiLanguage === 'ja' ? '次の漢字' : 'Next Kanji'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Column (5 cols): Where to Start from Basic (Radical Breakdown & Stroke Sequence) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            
            {/* Kanji Meaning, Readings & Nepali Card */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-3xl font-black text-rose-400 font-['Kosugi_Maru'] shrink-0">
                    {currentItem.kanji}
                  </div>
                  <div>
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {currentItem.meaning}
                    </h3>
                    {settings.showNepali && currentItem.meaningNe && (
                      <div className="text-xs font-semibold text-emerald-400 mt-0.5">
                        नेपाली: {currentItem.meaningNe}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-slate-400 font-mono mt-1">
                      <span>On: <strong className="text-slate-200">{currentItem.onyomi.join(', ')}</strong></span>
                      <span>Kun: <strong className="text-slate-200">{currentItem.kunyomi.join(', ')}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Where to Start from Basic: Radical-by-Radical Order Guide for Complex Kanjis */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>
                    {uiLanguage === 'ja'
                      ? '基本パーツからの書き順ガイド'
                      : 'Where to Start (Basic → Complex)'}
                  </span>
                </h4>
                <span className="text-[11px] text-slate-400 font-mono">
                  {totalStrokes} Strokes
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3">
                {currentItem.strokeRuleSummary}
              </p>

              {/* Ordered Basic Building Blocks */}
              <div className="space-y-2 mb-3">
                {currentItem.basicBlocks.map(block => (
                  <div
                    key={block.step}
                    className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-2.5"
                  >
                    <div className="w-9 h-9 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 font-black font-['Kosugi_Maru'] text-sm flex items-center justify-center shrink-0">
                      {block.radical}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-white">
                          {block.name}
                        </span>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-amber-300 border border-slate-800">
                          Strokes {block.strokeRange}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {block.startRule}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Interactive Step-by-Step Stroke Selector */}
              <div>
                <div className="text-[11px] font-semibold text-slate-400 mb-1.5">
                  {uiLanguage === 'ja'
                    ? '画数ステップ（タップして始点を確認）:'
                    : 'Tap any stroke number to jump & inspect its starting point:'}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentItem.strokes.map((st, idx) => {
                    const isDone = idx < currentStrokeIdx;
                    const isCurrent = idx === currentStrokeIdx && !isCompleted;
                    return (
                      <button
                        key={st.num}
                        type="button"
                        onClick={() => {
                          setCurrentStrokeIdx(idx);
                          setIsCompleted(false);
                        }}
                        className={`w-7 h-7 rounded-lg text-xs font-bold font-mono flex items-center justify-center border transition-all ${
                          isCurrent
                            ? 'bg-rose-500 text-white border-rose-400 scale-105 shadow-sm'
                            : isDone
                            ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                        }`}
                        title={`Stroke ${st.num}: ${st.instruction}`}
                      >
                        {st.num}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Vocabulary Compounds */}
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-4 sm:p-5">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                {t.kanji.compounds}
              </span>
              <div className="space-y-1.5">
                {currentItem.examples.map((ex, i) => (
                  <div
                    key={i}
                    onClick={() => speakJapanese(ex.word)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-white font-['Kosugi_Maru'] text-sm">
                        {ex.word}
                      </span>
                      <span className="text-rose-300 ml-1.5 font-['Kosugi_Maru']">
                        ({ex.reading})
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-slate-200 font-medium">{ex.meaning}</div>
                      {settings.showNepali && ex.meaningNe && (
                        <div className="text-[11px] text-emerald-400">{ex.meaningNe}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      ) : (
        /* Kanji Codex Overview */
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 sm:p-6">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-800">
            <span className="font-semibold text-white">{t.kanji.discoveredCharacters}</span>
            <span>{masteredIds.length} of {orderedKanjiPool.length} {t.kanji.mastered}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {orderedKanjiPool.map((item, idx) => {
              const isUnlocked = masteredIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => selectKanjiIndex(idx)}
                  className="p-3.5 rounded-xl border bg-slate-900/80 border-slate-800 hover:border-rose-500/40 transition-colors cursor-pointer flex items-center gap-3.5"
                >
                  <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-300 border border-rose-500/20 flex items-center justify-center text-2xl font-black font-['Kosugi_Maru'] shrink-0">
                    {item.kanji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white truncate">
                        {item.meaning}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                        {item.level}
                      </span>
                    </div>
                    {settings.showNepali && item.meaningNe && (
                      <div className="text-[11px] text-emerald-400 truncate mt-0.5">
                        {item.meaningNe}
                      </div>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>{item.strokes.length} Strokes · {item.Complexity}</span>
                      {isUnlocked && (
                        <span className="text-emerald-400 font-semibold">✓ Practiced</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
};
