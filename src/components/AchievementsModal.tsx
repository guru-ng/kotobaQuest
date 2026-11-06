import React from 'react';
import { useGame, ACHIEVEMENTS } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { calculateLevelFromXP } from '../utils/srsLogic';
import { 
  Trophy, 
  X, 
  Footprints, 
  Zap, 
  Hammer, 
  BookOpen, 
  Sparkles, 
  CheckCircle2, 
  Lock
} from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({ isOpen, onClose }) => {
  const { stats, uiLanguage } = useGame();
  const t = getTranslation(uiLanguage);
  const levelInfo = calculateLevelFromXP(stats.xp);

  if (!isOpen) return null;

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Footprints': return <Footprints className="w-4 h-4 text-amber-400" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4 text-rose-400" />;
      case 'Zap': return <Zap className="w-4 h-4 text-yellow-400" />;
      case 'Hammer': return <Hammer className="w-4 h-4 text-indigo-400" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4 text-emerald-400" />;
      default: return <Trophy className="w-4 h-4 text-amber-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl relative max-h-[85vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-white">{t.achievements.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {stats.unlockedAchievements.length} of {ACHIEVEMENTS.length} {t.achievements.unlocked}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Level Overview (Unboxed) */}
        <div className="my-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block font-medium">{t.achievements.rankTier}</span>
              <h4 className="text-sm font-bold text-white mt-0.5">
                Level {levelInfo.level}: {levelInfo.title}
              </h4>
            </div>
            <div className="text-right">
              <span className="text-slate-400 block font-medium">{t.achievements.totalXP}</span>
              <span className="text-base font-bold text-rose-400 tabular-nums">{stats.xp}</span>
            </div>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full mt-3 overflow-hidden border border-slate-800">
            <div
              className="bg-rose-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${levelInfo.progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500 mt-1.5 font-mono">
            <span>{levelInfo.currentXP} XP</span>
            <span>{levelInfo.xpForNextLevel} {t.achievements.xpForNextLevel}</span>
          </div>
        </div>

        {/* Badges List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {ACHIEVEMENTS.map(ach => {
            const isUnlocked = stats.unlockedAchievements.includes(ach.id);
            const current = ach.currentCount(stats);
            const progress = Math.min(100, Math.round((current / ach.targetCount) * 100));

            return (
              <div
                key={ach.id}
                className={`p-3 rounded-xl border transition-colors flex items-center gap-3 ${
                  isUnlocked
                    ? 'bg-slate-950/40 border-slate-800'
                    : 'bg-slate-950/20 border-slate-900 opacity-50'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                  isUnlocked ? 'bg-slate-800 border border-slate-700' : 'bg-slate-900 border border-slate-800'
                }`}>
                  {isUnlocked ? getBadgeIcon(ach.icon) : <Lock className="w-4 h-4 text-slate-600" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-white truncate">
                      {uiLanguage === 'ja' && ach.titleJa ? ach.titleJa : ach.title}
                    </h5>
                    {isUnlocked ? (
                      <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{t.achievements.completed}</span>
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {current}/{ach.targetCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                    {uiLanguage === 'ja' && ach.descriptionJa ? ach.descriptionJa : ach.description}
                  </p>

                  {!isUnlocked && (
                    <div className="w-full bg-slate-900 h-1 rounded-full mt-2 overflow-hidden">
                      <div
                        className="bg-slate-700 h-full rounded-full transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <div className="pt-4 mt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            {t.achievements.close}
          </button>
        </div>

      </div>
    </div>
  );
};
