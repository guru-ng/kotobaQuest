import { useCallback, useEffect, useState } from 'react';
import type { GameMode } from '../types';

/**
 * Each game opens on a grid of choices; the chosen one lives in its own URL
 * parameter so the back button, refresh and shared links all work.
 */
export const SUBVIEW_PARAM: Record<GameMode, string> = {
  survival: 'cat',
  flashcards: 'deck',
  typing: 'set',
  kanji: 'k',
  wordle: 'play'
};

const readParam = (param: string) =>
  typeof window === 'undefined' ? null : new URLSearchParams(window.location.search).get(param);

const MARK = 'kqSub';

export function useSubview(param: string) {
  const [value, setValue] = useState<string | null>(() => readParam(param));

  useEffect(() => {
    const onPop = () => setValue(readParam(param));
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, [param]);

  /** Go into a choice. Adds a history entry, so Back returns to the grid. */
  const open = useCallback(
    (next: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, next);
      window.history.pushState({ [MARK]: param }, '', url);
      setValue(next);
      window.scrollTo({ top: 0 });
    },
    [param]
  );

  /** Switch to a sibling choice (next kanji, another puzzle) without a new history entry. */
  const replace = useCallback(
    (next: string) => {
      const url = new URL(window.location.href);
      url.searchParams.set(param, next);
      window.history.replaceState(window.history.state, '', url);
      setValue(next);
    },
    [param]
  );

  /** Back to the grid. */
  const close = useCallback(() => {
    if (window.history.state?.[MARK] === param) {
      // Opened from the grid: step back so history doesn't pile up
      window.history.back();
    } else {
      // Opened from a shared link: there is nothing to step back to
      const url = new URL(window.location.href);
      url.searchParams.delete(param);
      window.history.replaceState(null, '', url);
      setValue(null);
    }
    window.scrollTo({ top: 0 });
  }, [param]);

  return { value, open, replace, close };
}
