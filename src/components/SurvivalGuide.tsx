import React, { useRef, useState } from 'react';
import { SURVIVAL_CATEGORIES, SurvivalCategory } from '../data/survivalPhrases';
import { NEPALI_SURVIVAL_MAP } from '../data/nepaliData';
import { useGame } from '../context/GameContext';
import { getTranslation } from '../utils/i18n';
import { speakJapanese } from '../utils/audio';
import { useReducedMotion } from '../utils/useReducedMotion';
import { useSubview } from '../utils/subview';
import { ACCENTS, Accent, ChoiceTile, PinnedBackBar } from './ChoiceGrid';
import {
  Volume2,
  Copy,
  Check,
  Search,
  Briefcase,
  Sparkles,
  Utensils,
  TrainFront,
  ShoppingBag,
  HeartHandshake,
  UtensilsCrossed,
  Compass
} from 'lucide-react';

type Phrase = SurvivalCategory['phrases'][number];

/** Category icons are named in the data; this maps the names to components. */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Briefcase,
  Sparkles,
  Utensils,
  Train: TrainFront,
  ShoppingBag,
  HeartHandshake,
  UtensilsCrossed
};

/** Per-category look, in the same style as the home tiles. */
const LOOK: Record<string, { glyph: string; accent: Accent }> = {
  business: { glyph: '職', accent: ACCENTS.sky },
  teinei: { glyph: '礼', accent: ACCENTS.purple },
  dining: { glyph: '食', accent: ACCENTS.amber },
  transit: { glyph: '駅', accent: ACCENTS.emerald },
  konbini: { glyph: '店', accent: ACCENTS.pink },
  polite: { glyph: '助', accent: ACCENTS.rose },
  restaurant: { glyph: '接', accent: ACCENTS.orange }
};
const DEFAULT_LOOK = { glyph: '話', accent: ACCENTS.slate };

export const SurvivalGuide: React.FC = () => {
  const { settings, uiLanguage, toggleNepali } = useGame();
  const t = getTranslation(uiLanguage);
  const ja = uiLanguage === 'ja';
  const reducedMotion = useReducedMotion();

  // The open category lives in ?cat= so the back button and shared links work
  const { value: catId, open: openSub, close: closeCategory } = useSubview('cat');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const headRef = useRef<HTMLDivElement>(null);

  const activeCategory = catId ? SURVIVAL_CATEGORIES.find(c => c.id === catId) ?? null : null;

  const openCategory = (id: string) => {
    setSearchQuery('');
    openSub(id);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const query = searchQuery.trim().toLowerCase();
  const searchResults: Array<{ phrase: Phrase; category: SurvivalCategory }> = query
    ? SURVIVAL_CATEGORIES.flatMap(category =>
        category.phrases
          .filter(
            p =>
              p.japanese.includes(searchQuery.trim()) ||
              p.kana.includes(searchQuery.trim()) ||
              p.romaji.toLowerCase().includes(query) ||
              p.english.toLowerCase().includes(query) ||
              (p.register?.toLowerCase().includes(query) ?? false) ||
              (NEPALI_SURVIVAL_MAP[p.id]?.includes(searchQuery.trim()) ?? false)
          )
          .map(phrase => ({ phrase, category }))
      )
    : [];

  const nepaliToggle = (
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
  );

  const renderPhrase = (phrase: Phrase, index: number, category?: SurvivalCategory) => (
    <div
      key={phrase.id}
      onClick={() => speakJapanese(phrase.japanese)}
      style={reducedMotion ? undefined : { animationDelay: `${Math.min(index, 8) * 40}ms` }}
      className="kq-rise bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-colors cursor-pointer"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {(phrase.register || category) && (
            <div className="text-[11px] font-semibold text-rose-400 mb-1">
              {category && (
                <span className={(LOOK[category.id] ?? DEFAULT_LOOK).accent.text}>
                  {ja ? category.titleJa : category.title}
                  {phrase.register ? ' · ' : ''}
                </span>
              )}
              {phrase.register}
            </div>
          )}

          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-lg font-bold text-white font-['Kosugi_Maru'] tracking-wide">
              {phrase.japanese}
            </span>
            {settings.showFurigana && phrase.kana !== phrase.japanese && (
              <span className="text-xs text-slate-400 font-['Kosugi_Maru']">({phrase.kana})</span>
            )}
          </div>

          {settings.showRomaji && (
            <div className="text-xs font-mono text-amber-300 font-medium mt-0.5">{phrase.romaji}</div>
          )}

          <div className="text-xs sm:text-sm font-medium text-slate-200 mt-1.5">{phrase.english}</div>

          {settings.showNepali && NEPALI_SURVIVAL_MAP[phrase.id] && (
            <div className="text-xs font-semibold text-emerald-400 mt-1">
              नेपाली: {NEPALI_SURVIVAL_MAP[phrase.id]}
            </div>
          )}

          <div className="mt-2 text-xs text-slate-400 flex items-start gap-1.5 italic">
            <span className="text-slate-500 font-semibold not-italic">{t.survival.tip}:</span>
            <span>{phrase.tip}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              speakJapanese(phrase.japanese);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={t.survival.audio}
            aria-label={t.survival.audio}
          >
            <Volume2 className="w-4 h-4 text-rose-400" />
          </button>
          <button
            type="button"
            onClick={e => {
              e.stopPropagation();
              handleCopy(phrase.id, phrase.japanese);
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={t.survival.copy}
            aria-label={t.survival.copy}
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
  );

  // ---------------------------------------------------------------- category
  if (activeCategory) {
    const look = LOOK[activeCategory.id] ?? DEFAULT_LOOK;
    const Icon = ICONS[activeCategory.icon] ?? Compass;
    return (
      <div className="max-w-2xl mx-auto px-2 sm:px-4 pb-2 sm:pb-4" data-testid="survival-guide-view">
        <PinnedBackBar
          label={t.survival.allSituations}
          title={ja ? activeCategory.titleJa : activeCategory.title}
          onBack={closeCategory}
          headRef={headRef}
          testId="phrase-back"
        />

        <div ref={headRef} className="flex items-start gap-3 pb-4 border-b border-slate-800/80 mb-4 sm:mb-5">
          <span className={`w-11 h-11 rounded-xl ${look.accent.tint} flex items-center justify-center shrink-0`}>
            <Icon className={`w-5 h-5 ${look.accent.text}`} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">
              {ja ? activeCategory.titleJa : activeCategory.title}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
              {ja ? activeCategory.descriptionJa : activeCategory.description}
            </p>
            <p className="text-[11px] text-slate-500 font-semibold mt-1.5">
              {activeCategory.phrases.length} {t.survival.phrases}
            </p>
          </div>
          {nepaliToggle}
        </div>

        <div className="space-y-3" data-testid="phrase-list">
          {activeCategory.phrases.map((p, i) => renderPhrase(p, i))}
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------- grid
  const count = SURVIVAL_CATEGORIES.length;
  // An odd one out at the end of both the 2- and 3-column grids gets a full row
  const lastIsWide = count % 2 === 1 && count % 3 === 1;

  return (
    <div className="max-w-2xl mx-auto px-2 sm:px-4 py-2 sm:py-4" data-testid="survival-guide-view">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end justify-between gap-3 pb-3 sm:pb-4 border-b border-slate-800/80 mb-4 sm:mb-5">
        <div>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight">{t.survival.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5 sm:mt-1">{t.survival.subtitle}</p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {nepaliToggle}
          <div className="relative flex-1 sm:w-56">
            <label htmlFor="phrase-search" className="sr-only">
              {t.survival.searchPlaceholder}
            </label>
            <input
              id="phrase-search"
              type="search"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={t.survival.searchPlaceholder}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-700"
            />
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {query ? (
        <div className="space-y-3" data-testid="phrase-search-results">
          {searchResults.length === 0 ? (
            <p className="text-center py-12 text-slate-500 text-xs">
              {t.survival.noResults} “{searchQuery.trim()}”
            </p>
          ) : (
            searchResults.map(({ phrase, category }, i) => renderPhrase(phrase, i, category))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3" data-testid="phrase-categories">
          {SURVIVAL_CATEGORIES.map((cat, i) => {
            const look = LOOK[cat.id] ?? DEFAULT_LOOK;
            return (
              <ChoiceTile
                key={cat.id}
                title={ja ? cat.titleJa : cat.title}
                meta={`${cat.phrases.length} ${t.survival.phrases}`}
                glyph={look.glyph}
                icon={ICONS[cat.icon] ?? Compass}
                accent={look.accent}
                index={i}
                onClick={() => openCategory(cat.id)}
                testId={`phrase-cat-${cat.id}`}
                wideClass={lastIsWide && i === count - 1 ? 'col-span-2 sm:col-span-3' : undefined}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
