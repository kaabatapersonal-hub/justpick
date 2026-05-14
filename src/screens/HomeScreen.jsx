import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { getPickResult, getChaosPick, getDailyChallenge } from '../utils/pickEngine';
import { calculateStreak, updateStats as computeStats, formatStreakMessage } from '../utils/statsUtils';
import { savePickToFirestore } from '../firebase/helpers';
import { hapticTap, hapticSuccess } from '../utils/haptics';

const MOODS = [
  { id: 'hungry',      label: 'Hungry',      emoji: '🍽️' },
  { id: 'lazy',        label: 'Lazy',         emoji: '😴' },
  { id: 'adventurous', label: 'Adventurous',  emoji: '🗺️' },
  { id: 'broke',       label: 'Broke',        emoji: '💸' },
  { id: 'productive',  label: 'Productive',   emoji: '💪' },
];

const BUDGETS = [
  { id: 'free',   label: 'Free',   emoji: '🆓' },
  { id: 'low',    label: 'Budget', emoji: '💰' },
  { id: 'medium', label: 'Mid',    emoji: '💳' },
];

const TIMES = [
  { id: 'quick', label: 'Quick (<30min)', emoji: '⚡' },
  { id: 'long',  label: 'Long (1h+)',     emoji: '😌' },
];

const CATEGORIES = [
  { id: 'food',     label: 'Food',     emoji: '🍔' },
  { id: 'activity', label: 'Activity', emoji: '🎯' },
];

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning ☀️';
  if (hour >= 12 && hour < 17) return 'Good afternoon 👋';
  if (hour >= 17 && hour < 22) return 'Good evening 🌆';
  return 'Late night? 🌙';
}

// ── No Excuse Timer ───────────────────────────────────────────────────────────
function NoExcuseTimer({ onComplete }) {
  const [seconds, setSeconds] = useState(30);

  useEffect(() => {
    if (seconds <= 0) { onComplete(); return; }
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds, onComplete]);

  const r = 18;
  const circ = 2 * Math.PI * r;
  const dash = ((seconds / 30) * 100 / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60">No Excuse Mode — commit in</p>
      <svg width="52" height="52" className="-rotate-90">
        <circle cx="26" cy="26" r={r} fill="none" stroke="rgba(255,140,66,0.2)" strokeWidth="3" />
        <circle cx="26" cy="26" r={r} fill="none" stroke="#FF8C42" strokeWidth="3"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </svg>
      <span className="text-2xl font-bold text-[#FF8C42] -mt-11">{seconds}</span>
    </div>
  );
}

// ── Filter Bottom Sheet ───────────────────────────────────────────────────────
function FilterSheet({ open, onClose, budget, time, onApply }) {
  const [localBudget, setLocalBudget] = useState(budget);
  const [localTime, setLocalTime] = useState(time);

  // Sync when sheet opens
  useEffect(() => {
    if (open) {
      setLocalBudget(budget);
      setLocalTime(time);
    }
  }, [open, budget, time]);

  const handleApply = () => {
    onApply(localBudget, localTime);
    onClose();
  };

  const handleClear = () => {
    onApply(null, null);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.15}
            onDragEnd={(_, info) => { if (info.offset.y > 80) onClose(); }}
            className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white dark:bg-[#1E293B] rounded-t-3xl px-5 pt-4 pb-8 shadow-2xl"
          >
            {/* Drag handle */}
            <div className="w-10 h-1 bg-gray-200 dark:bg-gray-600 rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <p className="font-bold text-base text-[#1E293B] dark:text-[#F8FAFC]">Refine your pick</p>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {/* Budget */}
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1E293B]/40 dark:text-[#F8FAFC]/40 mb-2">
              Budget
            </p>
            <div className="flex gap-2 mb-5">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  onClick={() => setLocalBudget(localBudget === b.id ? null : b.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    localBudget === b.id
                      ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                      : 'bg-gray-50 dark:bg-[#0F172A] border-gray-200 dark:border-gray-700 text-[#1E293B] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span>{b.emoji}</span><span>{b.label}</span>
                </button>
              ))}
            </div>

            {/* Time */}
            <p className="text-xs font-semibold uppercase tracking-wider text-[#1E293B]/40 dark:text-[#F8FAFC]/40 mb-2">
              Time
            </p>
            <div className="flex gap-2 mb-7">
              {TIMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setLocalTime(localTime === t.id ? null : t.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
                    localTime === t.id
                      ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                      : 'bg-gray-50 dark:bg-[#0F172A] border-gray-200 dark:border-gray-700 text-[#1E293B] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span>{t.emoji}</span><span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 text-sm font-semibold text-[#1E293B]/60 dark:text-[#F8FAFC]/60"
              >
                Clear filters
              </button>
              <button
                onClick={handleApply}
                className="flex-1 py-3 rounded-2xl bg-[#FF8C42] text-white text-sm font-bold"
              >
                Apply
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────
function ChaosButton({ onPress, disabled }) {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onPress}
      disabled={disabled}
      className="w-full py-3 rounded-2xl border border-dashed border-[#FF8C42]/50 text-sm font-medium text-[#FF8C42]/80 hover:text-[#FF8C42] transition-colors disabled:opacity-50"
    >
      🎰 Chaos Pick — surprise me
    </motion.button>
  );
}

function DailyChallenge({ challenge, onAccept, disabled }) {
  return (
    <div
      className="rounded-3xl p-5 overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #FF8C42 0%, #FFD166 100%)' }}
    >
      <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-1">Daily Challenge</p>
      <p className="font-black text-white text-lg leading-snug">{challenge.label}</p>
      <p className="text-sm text-white/80 mt-1 leading-snug">{challenge.description}</p>
      <motion.button
        whileTap={{ scale: 0.95 }}
        onClick={onAccept}
        disabled={disabled}
        className="mt-4 px-5 py-2.5 bg-white text-[#FF8C42] text-sm font-bold rounded-2xl shadow-sm disabled:opacity-60"
      >
        Accept Challenge →
      </motion.button>
    </div>
  );
}

// ── Simple Mode ───────────────────────────────────────────────────────────────
function SimpleMode({
  greeting, hasStreak, streak, selectedMood, setMood,
  selectedCategory, setCategory, selectedBudget, selectedTime,
  setBudget, setTime, isLoading, noExcuseCountdown, onPickPress,
  onChaos, onChallengeAccept, dailyChallenge, noExcuseMode,
  toggleNoExcuseMode, onNoExcuseComplete,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const activeFilterCount = (selectedBudget ? 1 : 0) + (selectedTime ? 1 : 0);

  const handleApplyFilters = (budget, time) => {
    setBudget(budget);
    setTime(time);
  };

  return (
    <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-2xl font-black text-[#1E293B] dark:text-[#F8FAFC]">{greeting}</h2>
        {hasStreak && (
          <p className="text-sm text-[#FF8C42] font-semibold mt-1">{formatStreakMessage(streak)}</p>
        )}
      </motion.div>

      {/* Mood selector */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }} className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E293B]/40 dark:text-[#F8FAFC]/40">How are you feeling?</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setMood(selectedMood === m.id ? null : m.id)}
              className={`flex-shrink-0 flex flex-col items-center justify-center gap-1 w-[72px] h-[72px] rounded-2xl border text-xs font-medium transition-colors ${
                selectedMood === m.id
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC] shadow-sm'
              }`}
              style={selectedMood === m.id ? { background: 'linear-gradient(135deg, #FF8C42, #FFD166)', boxShadow: '0 4px 12px rgba(255,140,66,0.3)' } : {}}
            >
              <span className="text-xl">{m.emoji}</span>
              <span>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* Category toggle */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }} className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#1E293B]/40 dark:text-[#F8FAFC]/40">What do you want?</p>
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map((cat) => (
            <motion.button
              key={cat.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setCategory(selectedCategory === cat.id ? null : cat.id)}
              className={`flex items-center justify-center gap-2 rounded-2xl border font-semibold text-sm transition-colors ${
                selectedCategory === cat.id
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
              }`}
              style={{
                height: '56px',
                ...(selectedCategory === cat.id ? { background: 'linear-gradient(135deg, #FF8C42, #FFD166)' } : {}),
              }}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.label}</span>
            </motion.button>
          ))}
        </div>

        {/* Filters link */}
        <button
          onClick={() => setSheetOpen(true)}
          className={`flex items-center gap-1 text-xs font-medium mt-1 transition-colors ${
            activeFilterCount > 0 ? 'text-[#FF8C42]' : 'text-[#1E293B]/40 dark:text-[#F8FAFC]/40'
          }`}
        >
          <span>⚙️</span>
          <span>Filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ''}</span>
          <span>→</span>
        </button>
      </motion.div>

      {/* Pick button */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <AnimatePresence mode="wait">
          {noExcuseCountdown ? (
            <motion.div key="countdown" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-[#1E293B] rounded-3xl border border-[#FF8C42]/30 shadow-sm">
              <NoExcuseTimer onComplete={onNoExcuseComplete} />
            </motion.div>
          ) : (
            <motion.button
              key="pick-btn"
              whileTap={{ scale: 0.97 }}
              onClick={onPickPress}
              disabled={isLoading}
              className="w-full rounded-3xl text-white text-xl font-black disabled:opacity-70 flex items-center justify-center"
              style={{
                height: '60px',
                background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B1A 100%)',
                boxShadow: '0 8px 32px rgba(255,140,66,0.35)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} className="inline-block">⚙️</motion.span>
                  Picking…
                </span>
              ) : (
                'Just Pick for Me 🎲'
              )}
            </motion.button>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Chaos Pick */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
        <ChaosButton onPress={onChaos} disabled={isLoading} />
      </motion.div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }}>
        <DailyChallenge challenge={dailyChallenge} onAccept={onChallengeAccept} disabled={isLoading} />
      </motion.div>

      {/* No Excuse floating toggle */}
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

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        budget={selectedBudget}
        time={selectedTime}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

// ── My Mode ───────────────────────────────────────────────────────────────────
function MyMode({
  greeting, hasStreak, streak, myModePrefs, setMood,
  selectedCategory, setCategory, selectedBudget, selectedTime,
  setBudget, setTime, isLoading, onMyModePick, onChaos,
  onChallengeAccept, dailyChallenge,
}) {
  const [sheetOpen, setSheetOpen] = useState(false);

  const handleApplyFilters = (budget, time) => {
    setBudget(budget);
    setTime(time);
  };

  const lastMoodObj = MOODS.find((m) => m.id === myModePrefs.lastMood);
  const lastCatObj = CATEGORIES.find((c) => c.id === myModePrefs.lastCategory) ?? CATEGORIES[0];
  const lastBudgetObj = BUDGETS.find((b) => b.id === myModePrefs.lastBudget);
  const lastTimeObj = TIMES.find((t) => t.id === myModePrefs.lastTime);

  return (
    <div className="px-4 pt-4 space-y-5 max-w-lg mx-auto">
      {/* Greeting */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
        <h2 className="text-2xl font-black text-[#1E293B] dark:text-[#F8FAFC]">{greeting}</h2>
        <p className="text-xs text-[#FF8C42] font-medium mt-1">Based on your style ✦</p>
        {hasStreak && (
          <p className="text-sm text-[#FF8C42] font-semibold mt-0.5">{formatStreakMessage(streak)}</p>
        )}
      </motion.div>

      {/* My Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.05 }}
        className="bg-white dark:bg-[#1E293B] rounded-3xl p-4 shadow-sm border border-[#1E293B]/5 dark:border-[#F8FAFC]/5"
      >
        <p className="text-xs font-bold uppercase tracking-wider text-[#1E293B]/40 dark:text-[#F8FAFC]/40 mb-3">Your usual pick</p>

        {[
          { label: 'Mood',     value: lastMoodObj ? `${lastMoodObj.emoji} ${lastMoodObj.label}` : 'Any mood' },
          { label: 'Category', value: `${lastCatObj.emoji} ${lastCatObj.label}` },
          { label: 'Budget',   value: lastBudgetObj ? `${lastBudgetObj.emoji} ${lastBudgetObj.label}` : 'Any budget' },
          { label: 'Time',     value: lastTimeObj ? `${lastTimeObj.emoji} ${lastTimeObj.label}` : 'Any time' },
        ].map((row) => (
          <div key={row.label} className="flex items-center justify-between py-1.5 border-b border-[#1E293B]/5 dark:border-[#F8FAFC]/5 last:border-0">
            <span className="text-xs text-[#1E293B]/40 dark:text-[#F8FAFC]/40 w-16">{row.label}</span>
            <span className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC] flex-1">{row.value}</span>
            <button
              onClick={() => setSheetOpen(true)}
              className="text-xs text-[#FF8C42] font-medium"
            >
              Change
            </button>
          </div>
        ))}
      </motion.div>

      {/* One-tap pick button */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.1 }}>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onMyModePick}
          disabled={isLoading}
          className="w-full rounded-3xl text-white disabled:opacity-70 flex flex-col items-center justify-center"
          style={{
            height: '72px',
            background: 'linear-gradient(135deg, #FF8C42 0%, #FF6B1A 100%)',
            boxShadow: '0 8px 36px rgba(255,140,66,0.45)',
          }}
        >
          {isLoading ? (
            <span className="flex items-center gap-2 text-lg font-black">
              <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} className="inline-block">⚙️</motion.span>
              Picking…
            </span>
          ) : (
            <>
              <span className="text-xl font-black">Pick for me ✦</span>
              <span className="text-xs text-white/75 mt-0.5">Using your usual preferences</span>
            </>
          )}
        </motion.button>
      </motion.div>

      {/* Chaos Pick */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.15 }}>
        <ChaosButton onPress={onChaos} disabled={isLoading} />
      </motion.div>

      {/* Daily Challenge */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.2 }}>
        <DailyChallenge challenge={dailyChallenge} onAccept={onChallengeAccept} disabled={isLoading} />
      </motion.div>

      {/* Quick mood change row */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, delay: 0.25 }} className="space-y-2 pb-2">
        <p className="text-xs text-[#1E293B]/40 dark:text-[#F8FAFC]/40 font-medium">Not feeling it? Change your mood →</p>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {MOODS.map((m) => (
            <motion.button
              key={m.id}
              whileTap={{ scale: 0.93 }}
              onClick={() => setMood(m.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                myModePrefs.lastMood === m.id
                  ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                  : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
              }`}
            >
              <span>{m.emoji}</span><span>{m.label}</span>
            </motion.button>
          ))}
        </div>
      </motion.div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        budget={selectedBudget}
        time={selectedTime}
        onApply={handleApplyFilters}
      />
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2200);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.95 }}
      className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 bg-[#1E293B] text-white text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap"
    >
      {message}
    </motion.div>
  );
}

// ── Main HomeScreen ───────────────────────────────────────────────────────────
export default function HomeScreen() {
  const navigate = useNavigate();

  const {
    currentUser = null,
    selectedMood = null, setMood,
    selectedCategory = null, setCategory,
    selectedBudget = null, setBudget,
    selectedTime = null, setTime,
    noExcuseMode = false, toggleNoExcuseMode,
    streak = { current: 0, longest: 0, lastPickDate: null }, updateStreak,
    stats = { totalPicks: 0, moodFrequency: {}, topSuggestions: [] }, updateStats,
    history = [], addToHistory,
    setResult,
    appMode = 'simple',
    myModePrefs = { lastMood: null, lastCategory: 'food', lastBudget: null, lastTime: null, pickCount: 0 },
    updateMyModePrefs,
  } = useApp();

  const [isLoading, setIsLoading] = useState(false);
  const [noExcuseCountdown, setNoExcuseCountdown] = useState(false);
  const [toast, setToast] = useState(null);
  const [prevAppMode, setPrevAppMode] = useState(appMode);

  const dailyChallenge = getDailyChallenge() ?? {
    label: 'Try something new today 🎯',
    description: 'Step outside your comfort zone.',
    mood: 'adventurous',
    category: 'activity',
  };

  const hasStreak = (streak?.current ?? 0) >= 1;
  const greeting = getGreeting();

  // Show toast on mode transition
  useEffect(() => {
    if (prevAppMode !== appMode) {
      setToast(appMode === 'mymode' ? '✦ My Mode activated' : 'Back to Simple Mode');
      setPrevAppMode(appMode);
    }
  }, [appMode, prevAppMode]);

  const finishPick = useCallback((pick) => {
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
    updateMyModePrefs({
      lastMood: selectedMood,
      lastCategory: selectedCategory,
      lastBudget: selectedBudget,
      lastTime: selectedTime,
    });

    savePickToFirestore(currentUser?.uid, {
      pickId: pick.id, name: pick.name, category: pick.category,
      mood: selectedMood, budget: selectedBudget,
      time: selectedTime, timestamp: new Date(),
    }).catch(() => {});

    setTimeout(() => {
      setIsLoading(false);
      hapticSuccess();
      window.scrollTo(0, 0);
      navigate('/result');
    }, 600);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMood, selectedCategory, selectedBudget, selectedTime, stats, streak, history]);

  const triggerPick = (mode = 'normal', overrides = {}) => {
    if (isLoading) return;
    hapticTap();
    setIsLoading(true);

    const category = overrides.category ?? selectedCategory ?? 'food';
    const mood     = overrides.mood     ?? selectedMood;
    const budget   = overrides.budget   ?? selectedBudget;
    const time     = overrides.time     ?? selectedTime;

    let pick;
    if (mode === 'chaos') {
      pick = getChaosPick();
    } else {
      pick = getPickResult({
        mood, category, budget, time,
        history: Array.isArray(history) ? history : [],
      });
    }

    if (!pick) { setIsLoading(false); return; }
    finishPick(pick);
  };

  // My Mode one-tap pick — uses saved prefs
  const handleMyModePick = () => {
    triggerPick('normal', {
      mood:     myModePrefs.lastMood,
      category: myModePrefs.lastCategory ?? 'food',
      budget:   myModePrefs.lastBudget,
      time:     myModePrefs.lastTime,
    });
  };

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

  const handleChallengeAccept = () => {
    setMood(dailyChallenge.mood);
    setCategory(dailyChallenge.category);
    triggerPick('normal', {
      mood:     dailyChallenge.mood,
      category: dailyChallenge.category,
    });
  };

  // My Mode mood quick-change — update prefs + context
  const handleMyModeMoodChange = (moodId) => {
    setMood(moodId);
    updateMyModePrefs({
      lastMood:     moodId,
      lastCategory: myModePrefs.lastCategory,
      lastBudget:   myModePrefs.lastBudget,
      lastTime:     myModePrefs.lastTime,
    });
  };

  const sharedProps = {
    greeting, hasStreak, streak,
    selectedMood, setMood,
    selectedCategory, setCategory,
    selectedBudget, selectedTime,
    setBudget, setTime,
    isLoading,
    onChaos: () => triggerPick('chaos'),
    onChallengeAccept: handleChallengeAccept,
    dailyChallenge,
  };

  return (
    <div className="relative min-h-full pb-8">
      <AnimatePresence mode="wait">
        {appMode === 'mymode' ? (
          <motion.div
            key="mymode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <MyMode
              {...sharedProps}
              myModePrefs={myModePrefs}
              setMood={handleMyModeMoodChange}
              onMyModePick={handleMyModePick}
            />
          </motion.div>
        ) : (
          <motion.div
            key="simple"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <SimpleMode
              {...sharedProps}
              noExcuseCountdown={noExcuseCountdown}
              onPickPress={handlePickPress}
              noExcuseMode={noExcuseMode}
              toggleNoExcuseMode={toggleNoExcuseMode}
              onNoExcuseComplete={handleNoExcuseComplete}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {toast && <Toast key={toast} message={toast} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
