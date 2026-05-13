import { suggestions } from '../data/suggestions.js';
import { dailyChallenges } from '../data/dailyChallenges.js';

/**
 * Returns one suggestion matching all provided filters.
 * Falls back progressively if the filtered pool is too small.
 */
export function getPickResult({ mood, category, budget, time, history = [] }) {
  // Step 1 — category is required
  let pool = suggestions.filter((s) => s.category === category);

  // Step 2 — apply optional filters
  if (mood) pool = pool.filter((s) => s.mood_tags.includes(mood));
  if (budget) pool = pool.filter((s) => s.budget_level === budget);
  if (time) pool = pool.filter((s) => s.time_required === time);

  // Step 3 — avoid last 3 picks
  const recentIds = history.slice(0, 3).map((h) => h.id);
  let candidates = pool.filter((s) => !recentIds.includes(s.id));

  // Fallback A — relax to last 1 pick only
  if (candidates.length === 0) {
    const lastId = history.slice(0, 1).map((h) => h.id);
    candidates = pool.filter((s) => !lastId.includes(s.id));
  }

  // Fallback B — use category-only pool (ignore all filters)
  if (candidates.length === 0) {
    candidates = suggestions.filter((s) => s.category === category);
  }

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}

/**
 * Returns a random suggestion for the given category, ignoring all other filters.
 * Used by the bottom-nav quick-pick shortcut.
 */
export function getQuickPick(category) {
  const pool = suggestions.filter((s) => s.category === category);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Returns a completely random suggestion regardless of category or filters.
 */
export function getChaosPick() {
  return suggestions[Math.floor(Math.random() * suggestions.length)];
}

/**
 * Returns today's daily challenge by rotating through the array using
 * the current day of the year.
 */
export function getDailyChallenge() {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - startOfYear) / (1000 * 60 * 60 * 24));
  return dailyChallenges[dayOfYear % dailyChallenges.length];
}

/**
 * Checks whether the user is allowed to reshuffle.
 * Returns { allowed: boolean, reason: string | null }
 */
export function validateShuffleAllowed(shufflesLeft, noExcuseMode, noExcuseTimer) {
  if (shufflesLeft <= 0) {
    return { allowed: false, reason: 'no_shuffles' };
  }
  if (noExcuseMode && noExcuseTimer > 0) {
    return { allowed: false, reason: 'no_excuse' };
  }
  return { allowed: true, reason: null };
}
