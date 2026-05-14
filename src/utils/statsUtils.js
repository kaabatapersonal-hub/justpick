/**
 * Updates the streak based on when the user last made a pick.
 * Returns a new streak object — never mutates the original.
 */
export function calculateStreak(streak, lastPickDate) {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  if (!lastPickDate) {
    return {
      current: 1,
      longest: Math.max(1, streak.longest ?? 0),
      lastPickDate: today,
    };
  }

  // Already picked today — no change
  if (lastPickDate === today) return streak;

  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterday = yesterdayDate.toISOString().split('T')[0];

  if (lastPickDate === yesterday) {
    // Consecutive day
    const newCurrent = streak.current + 1;
    return {
      current: newCurrent,
      longest: Math.max(newCurrent, streak.longest ?? 0),
      lastPickDate: today,
    };
  }

  // Gap > 1 day — streak resets but longest is preserved
  return {
    current: 1,
    longest: streak.longest ?? 0,
    lastPickDate: today,
  };
}

/**
 * Returns an updated stats object after a pick is made.
 * Safe against topSuggestions being initialised as {} instead of [].
 */
export function updateStats(stats, pick, mood) {
  const moodFrequency = { ...stats.moodFrequency };
  if (mood) {
    moodFrequency[mood] = (moodFrequency[mood] ?? 0) + 1;
  }

  // Guard: context initialises topSuggestions as {} — normalise to []
  const topSuggestions = Array.isArray(stats.topSuggestions)
    ? stats.topSuggestions.map((s) => ({ ...s }))
    : [];

  const existing = topSuggestions.find((s) => s.id === pick.id);
  if (existing) {
    existing.count += 1;
  } else {
    topSuggestions.push({ id: pick.id, name: pick.name, count: 1 });
  }

  topSuggestions.sort((a, b) => b.count - a.count);

  return {
    totalPicks: (stats.totalPicks ?? 0) + 1,
    moodFrequency,
    topSuggestions: topSuggestions.slice(0, 10),
  };
}

/**
 * Returns the mood string with the highest frequency.
 * Returns null if no picks have been made yet.
 */
export function getTopMood(moodFrequency) {
  if (!moodFrequency || Object.keys(moodFrequency).length === 0) return null;

  let topMood = null;
  let maxCount = 0;

  for (const [mood, count] of Object.entries(moodFrequency)) {
    if (count > maxCount) {
      maxCount = count;
      topMood = mood;
    }
  }

  return maxCount > 0 ? topMood : null;
}

/**
 * Returns a human-readable, fun streak message based on the current streak count.
 */
export function formatStreakMessage(streak) {
  const n = streak.current;

  if (!n || n === 0) return 'Make your first pick to start a streak 🎯';
  if (n === 1) return 'Day 1 of not overthinking 🎯';
  if (n === 2) return "Day 2 — you're on a roll 🔥";
  if (n >= 3 && n <= 6) return `Day ${n} streak! Keep going 💪`;
  if (n === 7) return "One week in. You're committed 🏆";
  if (n >= 8 && n <= 13) return `Day ${n} — seriously impressive 🔥`;
  if (n === 14) return "Two weeks! JustPick is part of you now 😄";
  return `Day ${n} — you don't make decisions anymore. JustPick does. 👑`;
}
