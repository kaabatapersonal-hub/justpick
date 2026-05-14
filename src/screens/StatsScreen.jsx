import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { getTopMood, formatStreakMessage } from '../utils/statsUtils';
import { suggestions } from '../data/suggestions.js';

const MOODS_LIST = [
  { id: 'lazy', emoji: '😴', label: 'Lazy' },
  { id: 'broke', emoji: '💸', label: 'Broke' },
  { id: 'adventurous', emoji: '🗺️', label: 'Adventurous' },
  { id: 'productive', emoji: '💪', label: 'Productive' },
  { id: 'hungry', emoji: '🍽️', label: 'Hungry' },
];

const MOOD_SUBTITLES = {
  lazy: 'You value rest. Respect. 😴',
  broke: 'Budget king/queen 👑💸',
  adventurous: 'Always seeking something new 🎉',
  productive: 'Getting things done 🧠',
  hungry: 'Foodie at heart 😋',
};

function useCountUp(target, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (target === 0) {
      setCount(0);
      return;
    }
    const startTime = Date.now();
    let raf;
    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return count;
}

const sectionVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.08 },
  }),
};

export default function StatsScreen() {
  const navigate = useNavigate();
  const { stats, streak, history, resetAll } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);

  const totalPicks = stats?.totalPicks ?? 0;
  const moodFrequency = stats?.moodFrequency ?? {};
  const topSuggestions = Array.isArray(stats?.topSuggestions) ? stats.topSuggestions : [];

  const animatedCount = useCountUp(totalPicks);

  const topMood = getTopMood(moodFrequency);
  const currentStreak = streak?.current ?? 0;
  const longestStreak = streak?.longest ?? 0;

  const safeHistory = Array.isArray(history) ? history : [];
  const foodCount = safeHistory.filter((h) => h.category === 'food').length;
  const activityCount = safeHistory.filter((h) => h.category === 'activity').length;

  const totalMoodPicks = Object.values(moodFrequency).reduce((a, b) => a + b, 0);

  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 300);
    return () => clearTimeout(t);
  }, []);

  const handleReset = () => {
    resetAll();
    setShowConfirm(false);
  };

  const getPickCategory = (pick) => {
    const found = suggestions.find((s) => s.id === pick.id);
    return found?.category ?? 'activity';
  };

  return (
    <div className="relative min-h-full pb-10">
      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Back */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors"
        >
          ← Back
        </motion.button>

        {/* Section 1: Hero */}
        <motion.div
          custom={0}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="rounded-3xl p-6 text-center shadow-md"
          style={{ background: 'linear-gradient(135deg, #FF8C42, #FFD166)' }}
        >
          {totalPicks === 0 ? (
            <>
              <p className="text-5xl mt-1">🎯</p>
              <p className="text-lg font-bold text-white mt-3">Make your first pick!</p>
              <p className="text-xs text-white/80 mt-1">Your stats will appear here</p>
            </>
          ) : (
            <>
              <p className="text-7xl font-bold text-white leading-none">{animatedCount}</p>
              <p className="text-sm text-white/80 mt-2">decisions made</p>
              <p className="text-xs text-white/70 mt-1">
                {totalPicks === 1 ? 'First pick made! Keep going 🎯' : `${totalPicks} decisions and counting 💪`}
              </p>
            </>
          )}
        </motion.div>

        {/* Section 2: Streak */}
        <motion.div
          custom={1}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 border-l-4 border-[#FF8C42] shadow-sm"
        >
          <div className="flex items-center gap-4">
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-[#FF8C42]">🔥 {currentStreak}</p>
              <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 mt-0.5">day streak</p>
            </div>
            <div className="w-px h-12 bg-[#1E293B]/10 dark:bg-[#F8FAFC]/10" />
            <div className="flex-1 text-center">
              <p className="text-3xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">🏆 {longestStreak}</p>
              <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 mt-0.5">personal best</p>
            </div>
          </div>
          <p className="text-sm italic text-[#1E293B]/50 dark:text-[#F8FAFC]/50 text-center mt-3">
            {formatStreakMessage(streak ?? { current: 0 })}
          </p>
        </motion.div>

        {/* Section 3: Top Mood */}
        <motion.div
          custom={2}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 text-center shadow-sm"
        >
          {topMood ? (
            <>
              <p className="text-5xl">
                {MOODS_LIST.find((m) => m.id === topMood)?.emoji ?? '🤔'}
              </p>
              <p className="text-xs uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40 mt-2">
                Your go-to mood
              </p>
              <p className="text-xl font-bold text-[#1E293B] dark:text-[#F8FAFC] mt-1">
                {MOODS_LIST.find((m) => m.id === topMood)?.label ?? topMood}
              </p>
              <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 mt-1">
                {MOOD_SUBTITLES[topMood] ?? ''}
              </p>
            </>
          ) : (
            <>
              <p className="text-5xl">🎭</p>
              <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 mt-3">
                No mood selected yet — start picking!
              </p>
            </>
          )}
        </motion.div>

        {/* Section 4: Mood Breakdown */}
        <motion.div
          custom={3}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 space-y-3 shadow-sm"
        >
          <p className="font-bold text-sm text-[#1E293B] dark:text-[#F8FAFC]">Mood breakdown</p>
          {MOODS_LIST.map((mood) => {
            const count = moodFrequency[mood.id] ?? 0;
            const pct = totalMoodPicks > 0 ? (count / totalMoodPicks) * 100 : 0;
            const isTop = mood.id === topMood;
            return (
              <div key={mood.id} className="flex items-center gap-3">
                <span className="text-sm w-28 flex-shrink-0 text-[#1E293B] dark:text-[#F8FAFC]">
                  {mood.emoji} {mood.label}
                </span>
                <div className="flex-1 h-2 bg-[#1E293B]/10 dark:bg-[#F8FAFC]/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: barsVisible ? `${pct}%` : '0%' }}
                    transition={{ duration: 0.7, ease: 'easeOut' }}
                    className={`h-full rounded-full ${
                      isTop ? 'bg-[#FF8C42]' : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                </div>
                <span className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50 w-5 text-right flex-shrink-0">
                  {count}
                </span>
              </div>
            );
          })}
        </motion.div>

        {/* Section 5: Top Picks */}
        <motion.div
          custom={4}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="bg-white dark:bg-[#1E293B] rounded-3xl p-5 space-y-3 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="font-bold text-sm text-[#1E293B] dark:text-[#F8FAFC]">Your top picks 🏆</p>
            <button
              onClick={() => navigate('/history')}
              className="text-xs text-[#FF8C42] font-medium"
            >
              See all →
            </button>
          </div>
          {topSuggestions.slice(0, 3).length > 0 ? (
            topSuggestions.slice(0, 3).map((pick, idx) => (
              <div key={pick.id ?? idx} className="flex items-center gap-3">
                <span className="w-7 h-7 flex items-center justify-center rounded-full bg-[#FF8C42] text-white text-xs font-bold flex-shrink-0">
                  {idx + 1}
                </span>
                <div className="flex-1">
                  <p className="font-bold text-sm text-[#1E293B] dark:text-[#F8FAFC]">{pick.name}</p>
                  <p className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50">
                    picked {pick.count} {pick.count === 1 ? 'time' : 'times'}
                  </p>
                </div>
                <span className="text-lg">
                  {getPickCategory(pick) === 'food' ? '🍽️' : '🎯'}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 text-center py-2">
              Keep picking to see your favorites!
            </p>
          )}
        </motion.div>

        {/* Section 6: Category Split */}
        <motion.div
          custom={5}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="grid grid-cols-2 gap-3"
        >
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl">🍔</p>
            <p className="font-bold text-xl text-[#1E293B] dark:text-[#F8FAFC] mt-1">{foodCount}</p>
            <p className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50">Food picks</p>
            {totalPicks > 0 && (
              <p className="text-xs text-[#FF8C42] font-medium mt-0.5">
                {Math.round((foodCount / totalPicks) * 100)}%
              </p>
            )}
          </div>
          <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 text-center shadow-sm">
            <p className="text-2xl">🎯</p>
            <p className="font-bold text-xl text-[#1E293B] dark:text-[#F8FAFC] mt-1">{activityCount}</p>
            <p className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50">Activity picks</p>
            {totalPicks > 0 && (
              <p className="text-xs text-[#FF8C42] font-medium mt-0.5">
                {Math.round((activityCount / totalPicks) * 100)}%
              </p>
            )}
          </div>
        </motion.div>

        {/* Section 7: Reset */}
        <motion.div
          custom={6}
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="text-center pt-2 pb-2"
        >
          <button
            onClick={() => setShowConfirm(true)}
            className="text-sm text-[#1E293B]/30 dark:text-[#F8FAFC]/30 hover:text-red-400 dark:hover:text-red-400 transition-colors"
          >
            Reset all stats
          </button>
        </motion.div>
      </div>

      {/* Reset confirmation dialog */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl p-6 w-full max-w-sm shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold text-lg text-[#1E293B] dark:text-[#F8FAFC] text-center">
                Are you sure?
              </p>
              <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 text-center mt-2">
                This will clear all your JustPick history.
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-3 rounded-2xl border border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-semibold"
                >
                  Reset
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
