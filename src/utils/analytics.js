/**
 * Thin wrapper around Umami's window.umami.track().
 * Safe to call even before Umami has loaded — calls are silently dropped.
 *
 * Usage:
 *   track('pick_made', { category: 'food', mood: 'lazy' });
 *   track('share_pick');
 */
export function track(event, props = {}) {
  try {
    if (typeof window !== 'undefined' && window.umami) {
      window.umami.track(event, props);
    }
  } catch {
    // Never let analytics errors surface to the user
  }
}
