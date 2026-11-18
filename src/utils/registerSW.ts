/**
 * Registers the service worker that makes KotobaQuest work offline.
 *
 * A waiting worker is never activated behind the learner's back: the page is
 * told instead, so it can offer a reload. Applying mid-session would swap the
 * JS under a puzzle in progress.
 */
export function registerServiceWorker(onUpdateReady: (applyUpdate: () => void) => void): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  if (!import.meta.env.PROD) return;

  const start = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      const offer = (worker: ServiceWorker) => {
        let reloading = false;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloading) return;
          reloading = true;
          window.location.reload();
        });
        onUpdateReady(() => worker.postMessage('SKIP_WAITING'));
      };

      if (registration.waiting && navigator.serviceWorker.controller) {
        offer(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          // A controller already present means this is an update, not a first install
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            offer(installing);
          }
        });
      });
    } catch {
      // No service worker: the app still works, just not offline.
    }
  };

  // Effects can run after 'load' has already fired, in which case a listener
  // would never see it and the worker would never register.
  if (document.readyState === 'complete') start();
  else window.addEventListener('load', start, { once: true });
}
