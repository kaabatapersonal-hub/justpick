const CATEGORY_EMOJI = {
  food: '🍽️',
  activity: '🎯',
};

/**
 * Returns a ready-to-share text string for native share sheets or clipboard copy.
 */
export function generateShareText(pick, mood) {
  const emoji = CATEGORY_EMOJI[pick.category] ?? '✨';
  return [
    'I stopped overthinking and let JustPick decide 😭',
    `Today's pick: ${pick.name} ${emoji}`,
    `Mood: ${mood} — and it was exactly right 🔥`,
    'Try it: justpick-app.netlify.app',
  ].join('\n');
}

/**
 * Returns a plain data object that the share card UI component reads from.
 */
export function generateShareCardData(pick, mood, streak) {
  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return {
    title: pick.name,
    message: pick.fun_message,
    mood,
    streak: streak?.current ?? 0,
    date: today,
    appName: 'JustPick',
    appUrl: 'justpick-app.netlify.app',
  };
}
