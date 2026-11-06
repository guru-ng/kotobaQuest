import React, { useState } from 'react';
import { SURVIVAL_CATEGORIES } from '../data/survivalPhrases';
import { NEPALI_SURVIVAL_MAP } from '../data/nepaliData';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { speakJapanese } from '../utils/audio';
import { 
  Volume2, 
  Copy, 
  Check, 
  Search
} from 'lucide-react';

export const SurvivalGuide: React.FC = () => {
  const { settings, uiLanguage, toggleNepali } = useGame();
  const t = getTranslation(uiLanguage);

  const [selectedCatId, setSelectedCatId] = useState<string>('business');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const activeCategory = SURVIVAL_CATEGORIES.find(c => c.id === selectedCatId) || SURVIVAL_CATEGORIES[0];

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const displayedPhrases = searchQuery.trim()
    ? SURVIVAL_CATEGORIES.flatMap(c => c.phrases).filter(p => 
        p.japanese.includes(searchQuery) ||
        p.romaji.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.english.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.register && p.register.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : activeCategory.phrases;

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="survival-guide-view">
      
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800/80 mb-4 sm:mb-5">
        <div>
          <div className="flex items-center justify-between sm:justify-start gap-3">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {t.survival.title}
            </h2>
            {uiLanguage === 'ja' && (
              <span className="text-sm font-['Kosugi_Maru'] text-rose-400">
                サバイバル日本語
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 sm:mt-1">
            <span>{t.survival.subtitle}</span>
            <span aria-hidden="true" className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">Business, Teineigo & Travel</span>
          </div>
        </div>

        {/* Clean Search Input & Nepali Toggle */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={toggleNepali}
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-bold shrink-0 transition-colors ${
              settings.showNepali
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
            }`}
            title="Toggle Nepali Meaning (नेपाली अर्थ)"
          >
            नेपाली: {settings.showNepali ? 'ON' : 'OFF'}
          </button>

          <div className="relative flex-1 sm:w-52">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.survival.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* Category Selection: Dropdown on Mobile (<sm), Segmented Bar on Tablet/Desktop (sm+) */}
      {!searchQuery && (
        <div className="mb-4 sm:mb-5">
          {/* Mobile Category Dropdown */}
          <div className="sm:hidden mb-2">
            <label htmlFor="survival-cat-select" className="sr-only">Select Situation Category</label>
            <select
              id="survival-cat-select"
              value={selectedCatId}
              onChange={(e) => setSelectedCatId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white focus:outline-none focus:border-rose-500"
            >
              {SURVIVAL_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {uiLanguage === 'ja' ? cat.titleJa : cat.title}
                </option>
              ))}
            </select>
          </div>

          {/* Desktop/Tablet Segmented Bar */}
          <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
            {SURVIVAL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCatId(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCatId === cat.id
                    ? 'bg-rose-500 text-white font-bold shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {uiLanguage === 'ja' ? cat.titleJa : cat.title}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 mt-1.5 sm:mt-2">
            {uiLanguage === 'ja' ? activeCategory.descriptionJa : activeCategory.description}
          </p>
        </div>
      )}

      {/* Phrases List with Clean Spacing & Subtle Hairline Borders */}
      <div className="space-y-3">
        {displayedPhrases.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No matching phrases found for "{searchQuery}".
          </div>
        ) : (
          displayedPhrases.map(phrase => (
            <div
              key={phrase.id}
              onClick={() => speakJapanese(phrase.japanese)}
              className="bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  
                  {/* Register Tag + Japanese phrase */}
                  {phrase.register && (
                    <div className="text-[11px] font-semibold text-rose-400 mb-1">
                      {phrase.register}
                    </div>
                  )}

                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-lg font-bold text-white font-['Kosugi_Maru'] tracking-wide">
                      {phrase.japanese}
                    </span>
                    {settings.showFurigana && phrase.kana !== phrase.japanese && (
                      <span className="text-xs text-slate-400 font-['Kosugi_Maru']">
                        ({phrase.kana})
                      </span>
                    )}
                  </div>

                  {/* Romaji */}
                  {settings.showRomaji && (
                    <div className="text-xs font-mono text-amber-300 font-medium mt-0.5">
                      {phrase.romaji}
                    </div>
                  )}

                  {/* English */}
                  <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1.5">
                    {phrase.english}
                  </div>

                  {/* Nepali Translation (When Nepali Toggle is ON) */}
                  {settings.showNepali && NEPALI_SURVIVAL_MAP[phrase.id] && (
                    <div className="text-xs font-semibold text-emerald-400 mt-1">
                      नेपाली: {NEPALI_SURVIVAL_MAP[phrase.id]}
                    </div>
                  )}

                  {/* Etiquette Tip */}
                  <div className="mt-2 text-xs text-slate-400 flex items-start gap-1.5 italic">
                    <span className="text-slate-500 font-semibold not-italic">{t.survival.tip}:</span>
                    <span>{phrase.tip}</span>
                  </div>
                </div>

                {/* Quiet action icons */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      speakJapanese(phrase.japanese);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title={t.survival.audio}
                  >
                    <Volume2 className="w-4 h-4 text-rose-400" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(phrase.id, phrase.japanese);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title={t.survival.copy}
                  >
                    {copiedId === phrase.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
