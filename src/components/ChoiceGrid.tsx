import React, { useEffect, useState } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useReducedMotion } from '../utils/useReducedMotion';

/**
 * Accent colours for choice tiles. Tailwind only ships class names it can see
 * written out, so every combination is spelled in full here.
 */
export const ACCENTS = {
  sky: { text: 'text-sky-400', tint: 'bg-sky-500/15' },
  purple: { text: 'text-purple-400', tint: 'bg-purple-500/15' },
  amber: { text: 'text-amber-400', tint: 'bg-amber-500/15' },
  emerald: { text: 'text-emerald-400', tint: 'bg-emerald-500/15' },
  pink: { text: 'text-pink-400', tint: 'bg-pink-500/15' },
  rose: { text: 'text-rose-400', tint: 'bg-rose-500/15' },
  orange: { text: 'text-orange-400', tint: 'bg-orange-500/15' },
  indigo: { text: 'text-indigo-400', tint: 'bg-indigo-500/15' },
  slate: { text: 'text-slate-300', tint: 'bg-slate-500/15' }
} as const;
export type Accent = (typeof ACCENTS)[keyof typeof ACCENTS];

interface ChoiceTileProps {
  title: string;
  /** Second line, e.g. "26 phrases" */
  meta?: React.ReactNode;
  /** Large faded character behind the tile */
  glyph: string;
  icon?: React.ComponentType<{ className?: string }>;
  /** Short text shown in the icon box instead of an icon (e.g. い) */
  iconText?: string;
  accent: Accent;
  index: number;
  onClick: () => void;
  testId: string;
  /** Full-row tile; pass the col-span classes that match the grid */
  wideClass?: string;
  /** Top-right corner, e.g. a status pill */
  badge?: React.ReactNode;
}

/** A tile in the same style as the home screen's. */
export const ChoiceTile: React.FC<ChoiceTileProps> = ({
  title,
  meta,
  glyph,
  icon: Icon,
  iconText,
  accent,
  index,
  onClick,
  testId,
  wideClass,
  badge
}) => {
  const reducedMotion = useReducedMotion();
  const wide = Boolean(wideClass);
  return (
    <button
      type="button"
      onClick={onClick}
      data-testid={testId}
      style={reducedMotion ? undefined : { animationDelay: `${Math.min(index, 10) * 45}ms` }}
      className={`kq-rise relative overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800 text-left p-4 flex
        hover:border-slate-700 hover:bg-slate-900 active:scale-[.97]
        transition-[background-color,border-color,transform] duration-150 motion-reduce:transition-none ${
          wide ? `${wideClass} items-center gap-3.5 h-[86px]` : 'flex-col justify-between h-[136px]'
        }`}
    >
      <span
        aria-hidden="true"
        className={`absolute font-['Kosugi_Maru'] leading-none select-none opacity-[0.11] text-[72px] ${accent.text} ${
          wide ? 'right-3 -bottom-5' : '-right-1 -bottom-4'
        }`}
      >
        {glyph}
      </span>

      <span className={`w-8 h-8 rounded-[10px] ${accent.tint} flex items-center justify-center shrink-0`}>
        {Icon ? (
          <Icon className={`w-[17px] h-[17px] ${accent.text}`} />
        ) : (
          <span className={`text-sm font-bold font-['Kosugi_Maru'] ${accent.text}`}>{iconText}</span>
        )}
      </span>

      {badge && <span className="absolute top-3.5 right-3.5">{badge}</span>}

      <span className="relative min-w-0">
        <span className="block text-[15px] font-bold text-white leading-snug">{title}</span>
        {meta && <span className="block text-xs font-semibold text-slate-400 mt-1">{meta}</span>}
      </span>
    </button>
  );
};

interface PinnedBackBarProps {
  label: string;
  /** Name shown beside the button once the page heading has scrolled away */
  title: string;
  onBack: () => void;
  /** The page heading; when it scrolls under the bar, the title appears */
  headRef: React.RefObject<HTMLElement | null>;
  testId: string;
  /** Negative margins that stretch the bar to the page container's edges */
  bleed?: string;
  right?: React.ReactNode;
}

/** A "‹ back" bar pinned directly under the top bar while you scroll. */
export const PinnedBackBar: React.FC<PinnedBackBarProps> = ({
  label,
  title,
  onBack,
  headRef,
  testId,
  bleed = '-mx-2 sm:-mx-4 px-2 sm:px-4',
  right
}) => {
  const barRef = React.useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const check = () => {
      const bar = barRef.current?.getBoundingClientRect();
      const head = headRef.current?.getBoundingClientRect();
      setCompact(Boolean(bar && head && head.bottom <= bar.bottom));
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [headRef]);

  return (
    <div
      ref={barRef}
      data-testid={`${testId}-bar`}
      style={{ top: 'var(--kq-nav-h, 57px)' }}
      className={`sticky z-30 ${bleed} py-2 mb-2 bg-slate-950/90 backdrop-blur-md border-b transition-colors duration-200 motion-reduce:transition-none ${
        compact ? 'border-slate-800/80' : 'border-transparent'
      }`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onBack}
          data-testid={testId}
          className="flex items-center gap-1 h-9 pl-1.5 pr-3 rounded-full border border-slate-800 bg-slate-900/80 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 shrink-0 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {label}
        </button>
        <span
          aria-hidden={!compact}
          data-testid={`${testId}-title`}
          className={`flex-1 text-sm font-bold text-white truncate transition-opacity duration-200 motion-reduce:transition-none ${
            compact ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {title}
        </span>
        {right}
      </div>
    </div>
  );
};
