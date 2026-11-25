/**
 * The launch animation lives in index.html so it paints before any script
 * loads. Once the app has drawn, this fades it out — but never before the
 * stamp has landed, so it is never cut off half-way.
 */
const INTRO_MS = 700; // stamp + wordmark (index.html keyframes)
const HOLD_MS = 200; // a beat to read it

export function hideSplash(): void {
  const el = document.getElementById('kq-splash');
  const html = document.documentElement;
  if (!el) return;
  if (!html.classList.contains('kq-splash-on')) {
    el.remove();
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const start = (window as Window & { __kqSplashStart?: number }).__kqSplashStart ?? 0;
  const wait = Math.max(0, start + (reduce ? 300 : INTRO_MS + HOLD_MS) - performance.now());
  window.setTimeout(() => {
    el.classList.add('kq-splash-out');
    window.setTimeout(
      () => {
        el.remove();
        html.classList.remove('kq-splash-on');
      },
      reduce ? 0 : 220
    );
  }, wait);
}
