import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { getPickResult, getChaosPick } from '../utils/pickEngine';
import { generateShareText, generateShareCardData } from '../utils/shareUtils';
import { saveFeedbackToFirestore } from '../firebase/helpers';
import { hapticTap, hapticSuccess } from '../utils/haptics';
import { track } from '../utils/analytics';

const SPARKLE_DIRS = [
  { x: 0, y: -58 },
  { x: 41, y: -41 },
  { x: 58, y: 0 },
  { x: 41, y: 41 },
  { x: 0, y: 58 },
  { x: -41, y: 41 },
  { x: -58, y: 0 },
  { x: -41, y: -41 },
];

function SparkleEffect({ triggerKey, delayOffset = 0.4 }) {
  const [active, setActive] = useState(false);

  useEffect(() => {
    setActive(true);
    const t = setTimeout(() => setActive(false), delayOffset * 1000 + 900);
    return () => clearTimeout(t);
  }, [triggerKey]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!active) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      style={{ zIndex: 6 }}
    >
      {SPARKLE_DIRS.map((pos, i) => (
        <motion.div
          key={`${triggerKey}-${i}`}
          className="absolute"
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{
            x: pos.x,
            y: pos.y,
            scale: [0, 1.3, 0.9, 0],
            opacity: [1, 1, 0.6, 0],
          }}
          transition={{
            duration: 0.76,
            delay: delayOffset + i * 0.025,
            ease: 'easeOut',
          }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="white">
            <path d="M6.5 0L8.15 4.85L13 6.5L8.15 8.15L6.5 13L4.85 8.15L0 6.5L4.85 4.85Z" />
          </svg>
        </motion.div>
      ))}
    </div>
  );
}

function Toast({ message, onDismiss }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 2800);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-28 left-1/2 z-50 -translate-x-1/2 bg-[#1E293B] text-white text-sm font-medium px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap"
    >
      {message}
    </motion.div>
  );
}

function NoExcuseBar({ seconds, total = 10 }) {
  const pct = Math.max(0, (seconds / total)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      <div className="pt-2 px-1">
        <p className="text-xs text-center text-[#FF8C42] font-medium mb-2">
          Shuffle unlocks in {seconds}s…
        </p>
        <div className="h-1.5 bg-[#FF8C42]/20 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#FF8C42] rounded-full"
            initial={{ width: '100%' }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.92, ease: 'linear' }}
          />
        </div>
      </div>
    </motion.div>
  );
}

export default function ResultScreen() {
  const navigate = useNavigate();
  const {
    currentResult, setResult,
    selectedMood = null,
    selectedCategory = null,
    selectedBudget = null,
    selectedTime = null,
    shufflesLeft = 3, decrementShuffles, resetShuffles,
    noExcuseMode = false,
    streak = { current: 0, longest: 0, lastPickDate: null },
    history = [],
    currentUser = null,
  } = useApp();

  const [shuffleKey, setShuffleKey] = useState(0);
  const [sparkleKey, setSparkleKey] = useState(0);
  const [isAccepting, setIsAccepting] = useState(false);
  const [shakeBtn, setShakeBtn] = useState(false);
  const [shuffleSpinning, setShuffleSpinning] = useState(false);
  // 'idle' | 'counting' | 'ready'
  const [noExcusePhase, setNoExcusePhase] = useState('idle');
  const [noExcuseTimerLeft, setNoExcuseTimerLeft] = useState(0);
  const [toast, setToast] = useState(null);
  const [feedback, setFeedback] = useState(() =>
    currentResult ? (localStorage.getItem(`feedback_${currentResult.id}`) ?? null) : null
  );
  const toastIdRef = useRef(0);

  // Reset feedback display when the picked item changes
  useEffect(() => {
    if (!currentResult) return;
    setFeedback(localStorage.getItem(`feedback_${currentResult.id}`) ?? null);
  }, [currentResult?.id]);

  // No Excuse countdown tick
  useEffect(() => {
    if (noExcusePhase !== 'counting' || noExcuseTimerLeft <= 0) return;
    const t = setTimeout(() => {
      const next = noExcuseTimerLeft - 1;
      setNoExcuseTimerLeft(next);
      if (next === 0) setNoExcusePhase('ready');
    }, 1000);
    return () => clearTimeout(t);
  }, [noExcusePhase, noExcuseTimerLeft]);

  const showToast = (msg) => {
    const id = ++toastIdRef.current;
    setToast({ message: msg, id });
  };

  // ── Null guard ─────────────────────────────────────────────────────────────
  if (!currentResult) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-4 px-6">
        <p className="text-6xl">🤔</p>
        <p className="text-xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">No pick yet!</p>
        <p className="text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 text-center max-w-xs">
          Go back and let JustPick decide something for you.
        </p>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/')}
          className="mt-2 px-6 py-3 bg-[#FF8C42] text-white font-bold rounded-2xl shadow-md"
        >
          Make a pick →
        </motion.button>
      </div>
    );
  }

  // ── Derived values ─────────────────────────────────────────────────────────
  const isFood = currentResult.category === 'food';
  const gradFrom = isFood ? '#FF8C42' : '#4facfe';
  const gradTo = isFood ? '#FFD166' : '#00f2fe';
  const cardGradient = `linear-gradient(135deg, ${gradFrom} 0%, ${gradTo} 100%)`;
  const shareCardData = generateShareCardData(currentResult, selectedMood, streak);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleAccept = () => {
    track('pick_accepted');
    hapticSuccess();
    setIsAccepting(true);
    setTimeout(() => {
      resetShuffles();
      window.scrollTo(0, 0);
      navigate('/');
    }, 480);
  };

  const handleShuffle = () => {
    hapticTap();
    if (shufflesLeft <= 0) {
      setShakeBtn(true);
      setTimeout(() => setShakeBtn(false), 600);
      showToast('No more shuffles 😅');
      return;
    }

    if (noExcuseMode) {
      if (noExcusePhase === 'idle') {
        setNoExcusePhase('counting');
        setNoExcuseTimerLeft(10);
        return;
      }
      if (noExcusePhase === 'counting') {
        showToast(`Locked for ${noExcuseTimerLeft}s 🔒`);
        return;
      }
      // phase === 'ready': fall through and execute shuffle
    }

    const category = selectedCategory || 'food';
    const newPick = getPickResult({
      mood: selectedMood,
      category,
      budget: selectedBudget,
      time: selectedTime,
      history: Array.isArray(history) ? history : [],
    });

    if (!newPick) {
      showToast('No more options 😅');
      return;
    }

    track('pick_shuffled', { shuffles_remaining: shufflesLeft - 1 });
    decrementShuffles();
    if (noExcuseMode) setNoExcusePhase('idle');

    setShuffleSpinning(true);
    setTimeout(() => setShuffleSpinning(false), 440);

    setResult(newPick);
    setShuffleKey((k) => k + 1);
    setSparkleKey((k) => k + 1);
  };

  const handleChaos = () => {
    track('chaos_pick');
    const pick = getChaosPick();
    if (!pick) return;
    setResult(pick);
    setShuffleKey((k) => k + 1);
    setSparkleKey((k) => k + 1);
  };

  const handleShare = async () => {
    track('share_pick', { category: currentResult.category });
    const text = generateShareText(currentResult, selectedMood);
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'JustPick decided for me',
          text,
          url: 'https://justpick-app.netlify.app',
        });
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(text);
        showToast('Copied to clipboard! 📋');
      } catch {
        showToast('Share not supported on this device 😅');
      }
    }
  };

  const handleFeedback = (type) => {
    const key = `feedback_${currentResult.id}`;
    const next = feedback === type ? null : type;
    if (next) track('feedback_given', { type: next, pick: currentResult.name });
    if (next) {
      localStorage.setItem(key, next);
    } else {
      localStorage.removeItem(key);
    }
    setFeedback(next);
    if (next) {
      saveFeedbackToFirestore(currentUser?.uid, {
        pickId: currentResult.id,
        feedback: next,
        timestamp: new Date(),
      }).catch(() => {});
    }
  };

  // ── Shuffle button label ───────────────────────────────────────────────────
  const getShuffleBtnContent = () => {
    if (noExcusePhase === 'counting') return `🔒 Locked for ${noExcuseTimerLeft}s`;
    if (noExcusePhase === 'ready') return '🔓 Shuffle unlocked — tap now';
    return (
      <>
        <span className={shuffleSpinning ? 'inline-block animate-spin' : 'inline-block'}>
          🔀
        </span>
        {` Try again (${shufflesLeft} left)`}
      </>
    );
  };

  return (
    <div className="flex flex-col pb-10">
      {/* ── Section 1: Result card hero ──────────────────────────────────────── */}
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.04 }}
        className="relative overflow-hidden rounded-b-[2.5rem] shadow-2xl"
        style={{
          background: cardGradient,
          minHeight: '48vh',
          backgroundImage: `${cardGradient}, radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: 'auto, 20px 20px',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={shuffleKey}
            initial={{ x: shuffleKey === 0 ? 0 : '65%', opacity: shuffleKey === 0 ? 1 : 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-65%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 310, damping: 28 }}
            className="flex flex-col items-center justify-center px-6 py-12 min-h-[48vh] gap-4"
          >
            {/* Category icon — bounce in */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 430, damping: 15, delay: 0.1 }}
              className="text-5xl"
            >
              {isFood ? '🍽️' : '🎯'}
            </motion.div>

            {/* Result name + sparkle */}
            <div className="relative flex items-center justify-center w-full">
              <SparkleEffect
                triggerKey={sparkleKey}
                delayOffset={shuffleKey === 0 ? 0.4 : 0.15}
              />
              <motion.h1
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.2 }}
                className="text-4xl font-black text-white text-center leading-tight px-2 relative"
                style={{ zIndex: 7 }}
              >
                {currentResult.name}
              </motion.h1>
            </div>

            {/* Fun message */}
            <motion.p
              initial={{ y: 14, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.38, delay: 0.5 }}
              className="text-sm text-white/85 text-center max-w-[280px] leading-snug"
            >
              {currentResult.fun_message}
            </motion.p>

            {/* Mood pill */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.62 }}
              className="px-3 py-1 rounded-full bg-white/20 text-white/90 text-xs font-medium"
            >
              {selectedMood ? `${selectedMood} mood` : 'no mood filter'}
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* ── Sections 2–6 ─────────────────────────────────────────────────────── */}
      <div className="px-4 pt-5 space-y-4 max-w-lg mx-auto w-full">
        {/* Section 2: Action buttons */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-2.5"
        >
          {/* Accept */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            animate={isAccepting ? { scale: [1, 1.08, 0.96, 1] } : {}}
            transition={{ duration: 0.35 }}
            onClick={handleAccept}
            className="w-full py-4 rounded-2xl bg-white dark:bg-[#1E293B] font-bold text-lg shadow-sm border border-[#FF8C42]/20"
            style={{ color: isAccepting ? '#22c55e' : '#FF8C42' }}
          >
            {isAccepting ? '✅ Done!' : '✅ This is the one'}
          </motion.button>

          {/* Shuffle */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            animate={shakeBtn ? { x: [-7, 7, -5, 5, -3, 0] } : {}}
            transition={shakeBtn ? { duration: 0.38 } : {}}
            onClick={handleShuffle}
            className={`w-full py-3.5 rounded-2xl border-2 font-semibold text-sm transition-colors ${
              shufflesLeft <= 0
                ? 'border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500'
                : noExcusePhase === 'ready'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-orange-400 text-orange-500'
            }`}
          >
            {getShuffleBtnContent()}
          </motion.button>

          {/* No Excuse countdown bar */}
          <AnimatePresence>
            {noExcusePhase === 'counting' && noExcuseTimerLeft > 0 && (
              <NoExcuseBar key="no-excuse-bar" seconds={noExcuseTimerLeft} />
            )}
          </AnimatePresence>

          {/* Chaos pick — hidden in no excuse mode */}
          <AnimatePresence>
            {!noExcuseMode && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleChaos}
                className="w-full py-2.5 text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 hover:text-[#FF8C42] transition-colors"
              >
                🎰 Something completely different
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Section 4: Share card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="space-y-2.5"
        >
          {/* Screenshot-ready share card */}
          <div className="rounded-2xl overflow-hidden shadow-md">
            <div className="p-4" style={{ background: cardGradient }}>
              <p className="text-white/70 text-xs font-medium mb-3 tracking-wide">
                JustPick decided for me 🎲
              </p>
              <p className="text-white font-black text-2xl leading-tight">
                {shareCardData.title}
              </p>
              <p className="text-white/80 text-sm mt-1 leading-snug">
                {shareCardData.message}
              </p>
            </div>
            <div
              className="flex items-center justify-between px-4 py-2.5 text-xs text-white/70"
              style={{ background: 'rgba(0,0,0,0.2)' }}
            >
              {shareCardData.streak > 0 ? (
                <span>🔥 {shareCardData.streak} day streak</span>
              ) : <span />}
              <span>{shareCardData.mood ? shareCardData.mood : ''}</span>
              <span>{shareCardData.date}</span>
            </div>
            <div
              className="text-center py-1.5 text-xs text-white/50"
              style={{ background: 'rgba(0,0,0,0.3)' }}
            >
              justpick-app.netlify.app
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="w-full rounded-xl text-white font-bold text-sm shadow-md flex items-center justify-center"
            style={{
              height: '48px',
              background: 'linear-gradient(135deg, #FF8C42, #FF6B1A)',
            }}
          >
            📤 Share this pick
          </motion.button>
        </motion.div>

        {/* Section 5: Like / Dislike */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="space-y-2"
        >
          <p className="text-xs text-center text-[#1E293B]/50 dark:text-[#F8FAFC]/50">Was this a good pick?</p>
          <div className="flex gap-2">
            {[
              { type: 'like', label: '👍 Good pick', activeClass: 'bg-green-500 text-white border-green-500' },
              { type: 'dislike', label: '👎 Not great', activeClass: 'bg-red-400 text-white border-red-400' },
            ].map(({ type, label, activeClass }) => (
              <motion.button
                key={type}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleFeedback(type)}
                className={`flex-1 py-2.5 rounded-2xl border text-sm font-semibold transition-all ${
                  feedback === type
                    ? activeClass
                    : 'border-gray-200 dark:border-gray-700 text-[#1E293B]/50 dark:text-[#F8FAFC]/50'
                }`}
              >
                {label}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Section 6: Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="text-center pb-2"
        >
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 hover:text-[#FF8C42] transition-colors"
          >
            ← Pick again
          </button>
        </motion.div>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <Toast key={toast.id} message={toast.message} onDismiss={() => setToast(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
