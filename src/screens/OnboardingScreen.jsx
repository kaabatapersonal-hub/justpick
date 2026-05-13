import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';

const MOODS = [
  {
    id: 'lazy',
    label: 'Lazy',
    emoji: '😴',
    description: 'Low energy. Minimum effort.',
    from: '#667eea',
    to: '#764ba2',
  },
  {
    id: 'broke',
    label: 'Broke',
    emoji: '💸',
    description: 'Budget mode activated.',
    from: '#f093fb',
    to: '#f5576c',
  },
  {
    id: 'adventurous',
    label: 'Adventurous',
    emoji: '🎉',
    description: "Let's try something new.",
    from: '#4facfe',
    to: '#00f2fe',
  },
  {
    id: 'productive',
    label: 'Productive',
    emoji: '🧠',
    description: 'Time to get things done.',
    from: '#43e97b',
    to: '#38f9d7',
  },
  {
    id: 'hungry',
    label: 'Hungry',
    emoji: '😋',
    description: 'Feed me. Now.',
    from: '#fa709a',
    to: '#fee140',
  },
];

const TIMER_DURATION = 1500;
const RING_RADIUS = 32;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export default function OnboardingScreen({ isSwipeMode = false }) {
  const navigate = useNavigate();
  const { setMood, setFirstTimeDone } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerProgress, setTimerProgress] = useState(0);
  // 0 = idle, 1 = card scale-up, 2 = white flash
  const [exitPhase, setExitPhase] = useState(0);
  const [cardWidth, setCardWidth] = useState(
    () => Math.min(typeof window !== 'undefined' ? window.innerWidth : 430, 430)
  );

  const containerRef = useRef(null);
  const x = useMotionValue(0);
  // Guard against double-select (button tap + timer firing simultaneously)
  const isSelectingRef = useRef(false);
  const timerRafRef = useRef(null);

  // Measure actual rendered width once mounted
  useEffect(() => {
    if (containerRef.current) {
      const w = containerRef.current.offsetWidth;
      setCardWidth(w);
      // Snap x to the correct position with the real width
      x.set(-currentIndex * w);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select timer — restarts every time currentIndex changes
  useEffect(() => {
    let raf;
    let cancelled = false;
    setTimerProgress(0);
    const start = Date.now();

    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / TIMER_DURATION, 1);
      setTimerProgress(progress);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        timerRafRef.current = raf;
      } else {
        // Auto-select current mood when timer completes
        triggerSelect(MOODS[currentIndex]);
      }
    };

    raf = requestAnimationFrame(tick);
    timerRafRef.current = raf;

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
    };
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard arrow-key navigation
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'ArrowRight') goTo(Math.min(currentIndex + 1, MOODS.length - 1));
      if (e.key === 'ArrowLeft') goTo(Math.max(currentIndex - 1, 0));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  const cancelTimer = () => cancelAnimationFrame(timerRafRef.current);

  const goTo = (newIndex) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= MOODS.length) return;
    cancelTimer();
    setCurrentIndex(newIndex);
    animate(x, -newIndex * cardWidth, { type: 'spring', stiffness: 280, damping: 28 });
  };

  const handleDragEnd = (_, { velocity, offset }) => {
    const threshold = cardWidth * 0.22;
    const didSwipeLeft = velocity.x < -250 || offset.x < -threshold;
    const didSwipeRight = velocity.x > 250 || offset.x > threshold;

    if (didSwipeLeft && currentIndex < MOODS.length - 1) {
      goTo(currentIndex + 1);
    } else if (didSwipeRight && currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      // Snap back to current card
      animate(x, -currentIndex * cardWidth, { type: 'spring', stiffness: 280, damping: 28 });
    }
  };

  const triggerSelect = (mood) => {
    if (isSelectingRef.current) return;
    isSelectingRef.current = true;
    cancelTimer();

    setMood(mood.id);
    if (!isSwipeMode) setFirstTimeDone();

    // Phase 1: card scales up
    setExitPhase(1);
    // Phase 2: white flash expands
    setTimeout(() => setExitPhase(2), 180);
    // Navigate after flash covers screen
    setTimeout(() => navigate('/'), 640);
  };

  const handleSkip = () => {
    cancelTimer();
    if (!isSwipeMode) setFirstTimeDone();
    navigate('/');
  };

  return (
    // Navy surround on desktop so it looks like a phone frame
    <div className="fixed inset-0 bg-[#1E293B] flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-[430px] h-full overflow-hidden"
      >
        {/* ── Top bar ──────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-6 pt-12 pointer-events-none">
          <div className="pointer-events-auto">
            {isSwipeMode ? (
              <button
                onClick={handleSkip}
                className="text-white/70 text-sm font-medium"
              >
                ← Back
              </button>
            ) : (
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl leading-tight">JustPick</span>
                <span className="text-white/70 text-sm mt-0.5">How are you feeling?</span>
              </div>
            )}
          </div>

          {!isSwipeMode && (
            <button
              onClick={handleSkip}
              className="text-white/60 text-sm pointer-events-auto mt-1"
            >
              Skip →
            </button>
          )}
        </div>

        {/* ── Swipeable card track ──────────────────────────── */}
        <motion.div
          className="absolute inset-0 flex items-stretch"
          style={{ x, width: cardWidth * MOODS.length }}
          drag="x"
          dragConstraints={{
            left: -(MOODS.length - 1) * cardWidth,
            right: 0,
          }}
          dragElastic={0.06}
          dragMomentum={false}
          onDragEnd={handleDragEnd}
        >
          {MOODS.map((mood, i) => (
            <div
              key={mood.id}
              aria-label={mood.label}
              style={{
                width: cardWidth,
                background: `linear-gradient(135deg, ${mood.from} 0%, ${mood.to} 100%)`,
                transform:
                  exitPhase >= 1 && i === currentIndex ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.18s ease-out',
              }}
              className="h-full flex-shrink-0 flex flex-col items-center justify-center"
            >
              {/* Floating emoji */}
              <motion.div
                className="text-9xl select-none"
                animate={{ y: [0, -14, 0] }}
                transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              >
                {mood.emoji}
              </motion.div>

              <h2 className="text-4xl font-bold text-white mt-6">{mood.label}</h2>
              <p className="text-white/80 text-lg mt-3 text-center px-10">
                {mood.description}
              </p>

              {/* Select button + circular progress ring */}
              <div className="mt-14 relative flex items-center justify-center">
                {/* Ring only renders on the active card */}
                {i === currentIndex && (
                  <svg
                    className="absolute pointer-events-none"
                    width={90}
                    height={90}
                    style={{ transform: 'rotate(-90deg)' }}
                    aria-hidden="true"
                  >
                    {/* Track */}
                    <circle
                      cx={45}
                      cy={45}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="rgba(255,255,255,0.25)"
                      strokeWidth={3}
                    />
                    {/* Progress arc */}
                    <circle
                      cx={45}
                      cy={45}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="white"
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeDasharray={RING_CIRCUMFERENCE}
                      strokeDashoffset={RING_CIRCUMFERENCE * (1 - timerProgress)}
                    />
                  </svg>
                )}

                <motion.button
                  className="bg-white text-[#FF8C42] font-bold px-8 py-4 rounded-full shadow-lg"
                  animate={{ scale: [1, 1.045, 1] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                  // Stop pointer events from propagating to the drag handler
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => triggerSelect(mood)}
                >
                  Pick this mood
                </motion.button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Dot indicators ───────────────────────────────── */}
        <div className="absolute bottom-10 left-0 right-0 z-20 flex items-center justify-center gap-2 pointer-events-none">
          {MOODS.map((_, i) => (
            <motion.button
              key={i}
              aria-label={`Go to ${MOODS[i].label}`}
              className="h-2 rounded-full bg-white pointer-events-auto"
              animate={{
                width: i === currentIndex ? 24 : 8,
                opacity: i === currentIndex ? 1 : 0.4,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        {/* ── Exit white-flash overlay ─────────────────────── */}
        <AnimatePresence>
          {exitPhase === 2 && (
            <motion.div
              className="absolute inset-0 z-50 bg-white"
              initial={{ opacity: 0, scale: 0.15, borderRadius: '50%' }}
              animate={{ opacity: 1, scale: 2, borderRadius: '0%' }}
              transition={{ duration: 0.42, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
