import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { getPickResult, getQuickPick, getChaosPick, getDailyChallenge } from '../utils/pickEngine';
import { calculateStreak, updateStats as computeStats, formatStreakMessage } from '../utils/statsUtils';
import { savePickToFirestore } from '../firebase/helpers';

const MOODS = [
  { id: 'hungry', label: 'Hungry', emoji: '🍽️' },
  { id: 'lazy', label: 'Lazy', emoji: '😴' },
  { id: 'adventurous', label: 'Adventurous', emoji: '🗺️' },
  { id: 'broke', label: 'Broke', emoji: '💸' },
  { id: 'productive', label: 'Productive', emoji: '💪' },
];

const BUDGETS = [
  { id: 'free', label: 'Free', emoji: '🆓' },
  { id: 'low', label: 'Budget', emoji: '💰' },
  { id: 'medium', label: 'Mid', emoji: '💳' },
];

const TIMES = [
  { id: 'quick', label: 'Quick (<30min)', emoji: '⚡' },
  { id: 'long', label: 'Long (1h+)', emoji: '🕐' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning ☀️';
  if (hour >= 12 && hour < 17) return 'Good afternoon 👋';
  if (hour >= 17 && hour < 22) return 'Good evening 🌆';
  return 'Late night? 🌙';
}

function NoExcuseTimer({ onComplete }) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) {
      onComplete();
      return;
    }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onComplete]);

  const pct = (seconds / 30) * 100;
  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60">
        No Excuse Mode — commit in
      </p>
      <svg width="52" height="52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="#FF8C42/20" strokeWidth="3" />
        <circle
          cx="26"
          cy="26"
          r={r}
          fill="none"
          stroke="#FF8C42"
          strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
        />
      </svg>
      <span className="text-2xl font-bold text-[#FF8C42] -mt-11">{seconds}</span>
    </div>
  );
}

export default function HomeScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const quickPickFired = useRef(false);

  const {
    currentUser,
    selectedMood, setMood,
    selectedCategory, setCategory,
    selectedBudget, setBudget,
    selectedTime, setTime,
    noExcuseMode, toggleNoExcuseMode,
    streak, updateStreak,
    stats, updateStats,
    history, addToHistory,
    setResult,
    isDarkMode,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [noExcuseCountdown, setNoExcuseCountdown] = useState(false);
  const dailyChallenge = getDailyChallenge();

  const triggerPick = async (mode = 'normal') => {
    if (isLoading) return;
    setIsLoading(true);

    const category = selectedCategory || 'food';
    let pick;

    if (mode === 'chaos') pick = getChaosPick();
    else if (mode === 'quick') pick = getQuickPick(category);
    else {
      pick = getPickResult({
        mood: selectedMood,
        category,
        budget: selectedBudget,
        time: selectedTime,
        history,
      });
    }

    if (!pick) {
      setIsLoading(false);
      return;
    }

    setResult(pick);
    addToHistory({
      id: pick.id,
      name: pick.name,
      category: pick.category,
      mood: selectedMood,
      timestamp: new Date().toISOString(),
    });
    updateStats(computeStats(stats, pick, selectedMood));
    updateStreak(calculateStreak(streak, streak.lastPickDate));

    savePickToFirestore(currentUser?.uid, {
      pickId: pick.id,
      name: pick.name,
      category: pick.category,
      mood: selectedMood,
      budget: selectedBudget,
      time: selectedTime,
      timestamp: new Date(),
    }).catch(() => {});

    setTimeout(() => {
      setIsLoading(false);
      navigate('/result');
    }, 600);
  };

  // Quick pick triggered from bottom nav
  useEffect(() => {
    if (location.state?.quickPick && !quickPickFired.current) {
      quickPickFired.current = true;
      triggerPick('quick');
    }
  }, [location.state]);

  const handlePickPress = () => {
    if (noExcuseMode) {
      setNoExcuseCountdown(true);
    } else {
      triggerPick('normal');
    }
  };

  const handleNoExcuseComplete = () => {
    setNoExcuseCountdown(false);
    triggerPick('normal');
  };

  const hasStreak = streak.current > 0;

  return (
    <div className="relative min-h-full pb-8">
      {/* No Excuse Mode floating toggle */}
      <div className="fixed bottom-24 right-4 z-40">
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={toggleNoExcuseMode}
          className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-sm font-semibold transition-colors ${
            noExcuseMode
              ? 'bg-[#FF8C42] text-white'
              : 'bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F8FAFC] border border-[#FF8C42]/30'
          }`}
        >
          <span>🔒</span>
          <span>{noExcuseMode ? 'No Excuse ON' : 'No Excuse'}</span>
        </motion.button>
      </div>

      <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
        {/* Section 1 — Greeting + streak */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <h2 className="text-xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
            {getGreeting()}
          </h2>
          {hasStreak && (
            <p className="text-sm text-[#FF8C42] font-medium mt-0.5">
              {formatStreakMessage(streak)}
            </p>
          )}
        </motion.div>

        {/* Section 2 — Mood selector */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40">
            How are you feeling?
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {MOODS.map((m) => (
              <motion.button
                key={m.id}
                whileTap={{ scale: 0.93 }}
                onClick={() => setMood(selectedMood === m.id ? null : m.id)}
                className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-2xl border text-sm font-medium transition-colors ${
                  selectedMood === m.id
                    ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                    : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
                }`}
              >
                <span className="text-xl">{m.emoji}</span>
                <span>{m.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Section 3 — Category toggle */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="space-y-2"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40">
            What do you want?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'food', label: 'Food', emoji: '🍔' },
              { id: 'activity', label: 'Activity', emoji: '🎯' },
            ].map((cat) => (
              <motion.button
                key={cat.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCategory(selectedCategory === cat.id ? null : cat.id)}
                className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                    : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span>{cat.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Section 4 — Budget + Time filters */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          className="space-y-3"
        >
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40">
              Budget
            </p>
            <div className="flex gap-2">
              {BUDGETS.map((b) => (
                <motion.button
                  key={b.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setBudget(selectedBudget === b.id ? null : b.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    selectedBudget === b.id
                      ? 'bg-[#FFD166] border-[#FFD166] text-[#1E293B]'
                      : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span>{b.emoji}</span>
                  <span>{b.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40">
              Time
            </p>
            <div className="flex gap-2">
              {TIMES.map((t) => (
                <motion.button
                  key={t.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setTime(selectedTime === t.id ? null : t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                    selectedTime === t.id
                      ? 'bg-[#FFD166] border-[#FFD166] text-[#1E293B]'
                      : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span>{t.emoji}</span>
                  <span>{t.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Section 5 — Main pick button */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
        >
          <AnimatePresence mode="wait">
            {noExcuseCountdown ? (
              <motion.div
                key="countdown"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#FF8C42]/30 shadow-sm"
              >
                <NoExcuseTimer onComplete={handleNoExcuseComplete} />
              </motion.div>
            ) : (
              <motion.button
                key="pick-btn"
                whileTap={{ scale: 0.97 }}
                onClick={handlePickPress}
                disabled={isLoading}
                className="w-full py-5 rounded-3xl bg-[#FF8C42] text-white text-xl font-bold shadow-lg active:shadow-md transition-shadow disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}
                      className="inline-block"
                    >
                      ⚙️
                    </motion.span>
                    Picking…
                  </span>
                ) : (
                  'Just Pick for Me 🎲'
                )}
              </motion.button>
            )}
          </AnimatePresence>

          {/* Chaos pick */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => triggerPick('chaos')}
            disabled={isLoading}
            className="w-full mt-2 py-3 rounded-2xl border border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-sm font-medium text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors disabled:opacity-50"
          >
            🌀 Chaos Pick — ignore all filters
          </motion.button>
        </motion.div>

        {/* Section 6 — Daily Challenge */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.25 }}
          className="bg-gradient-to-br from-[#FF8C42]/10 to-[#FFD166]/10 dark:from-[#FF8C42]/20 dark:to-[#FFD166]/20 rounded-3xl p-4 border border-[#FF8C42]/20"
        >
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF8C42] mb-1">
            Daily Challenge
          </p>
          <p className="font-bold text-[#1E293B] dark:text-[#F8FAFC]">{dailyChallenge.label}</p>
          <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 mt-0.5">
            {dailyChallenge.description}
          </p>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              setMood(dailyChallenge.mood);
              setCategory(dailyChallenge.category);
              triggerPick('normal');
            }}
            disabled={isLoading}
            className="mt-3 px-4 py-2 bg-[#FF8C42] text-white text-sm font-semibold rounded-xl disabled:opacity-60"
          >
            Accept Challenge
          </motion.button>
        </motion.div>

        {/* Section 7 — Swipe Mode entry */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
        >
          <button
            onClick={() => navigate('/swipe')}
            className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white dark:bg-[#1E293B] border border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-sm text-[#1E293B] dark:text-[#F8FAFC]"
          >
            <span className="font-medium">Swipe to pick mood instead</span>
            <span className="text-[#FF8C42]">→</span>
          </button>
        </motion.div>
      </div>
    </div>
  );
}
