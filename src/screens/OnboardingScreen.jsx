import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, animate, useMotionValue } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import MoodIllustration from '../components/ui/MoodIllustration';

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
// Pixels of the next card visible on the right edge
const PEEK = 26;

export default function OnboardingScreen({ isSwipeMode = false }) {
  const navigate = useNavigate();
  const { setMood, setFirstTimeDone } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [timerProgress, setTimerProgress] = useState(0);
  // 0 = idle  1 = card scale-up  2 = white flash
  const [exitPhase, setExitPhase] = useState(0);
  const [cardWidth, setCardWidth] = useState(
    () => Math.min(typeof window !== 'undefined' ? window.innerWidth : 430, 430)
  );
  // Swipe hint fades after the first deliberate swipe
  const [hasSwipedOnce, setHasSwipedOnce] = useState(false);

  const containerRef = useRef(null);
  const x = useMotionValue(0);
  // Prevents double-select (button tap racing against timer)
  const isSelectingRef = useRef(false);
  const timerRafRef = useRef(null);
  // Prevents setState calls after unmount
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Measure actual rendered container width once on mount
  useEffect(() => {
    if (!containerRef.current) return;
    const w = containerRef.current.offsetWidth;
    setCardWidth(w);
    x.set(-currentIndex * (w - PEEK));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Auto-select timer — restarts on every card change
  useEffect(() => {
    let raf;
    let cancelled = false;
    if (mountedRef.current) setTimerProgress(0);
    const start = Date.now();

    const tick = () => {
      if (cancelled) return;
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / TIMER_DURATION, 1);
      if (mountedRef.current) setTimerProgress(progress);
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
        timerRafRef.current = raf;
      } else {
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

  // Effective card width leaves PEEK pixels for the next card to show through
  const effectiveCardWidth = cardWidth - PEEK;

  const goTo = (newIndex) => {
    if (newIndex === currentIndex || newIndex < 0 || newIndex >= MOODS.length) return;
    cancelTimer();
    setHasSwipedOnce(true);
    setCurrentIndex(newIndex);
    animate(x, -newIndex * effectiveCardWidth, { type: 'spring', stiffness: 280, damping: 28 });
  };

  const handleDragEnd = (_, { velocity, offset }) => {
    const threshold = effectiveCardWidth * 0.22;
    const didSwipeLeft = velocity.x < -250 || offset.x < -threshold;
    const didSwipeRight = velocity.x > 250 || offset.x > threshold;

    if (didSwipeLeft && currentIndex < MOODS.length - 1) {
      goTo(currentIndex + 1);
    } else if (didSwipeRight && currentIndex > 0) {
      goTo(currentIndex - 1);
    } else {
      // Not enough — snap back
      animate(x, -currentIndex * effectiveCardWidth, {
        type: 'spring',
        stiffness: 280,
        damping: 28,
      });
    }
  };

  const triggerSelect = (mood) => {
    if (isSelectingRef.current) return;
    isSelectingRef.current = true;
    cancelTimer();
    setMood(mood.id);

    // Phase 1: scale the card up
    if (mountedRef.current) setExitPhase(1);
    // Phase 2: white flash expands from centre
    setTimeout(() => {
      if (mountedRef.current) setExitPhase(2);
    }, 180);
    // FIX: setFirstTimeDone() is called here — right before navigate —
    // NOT at the top of this function. Calling it early flips isFirstTime=false
    // in context, which makes App.jsx immediately unmount this screen via its
    // route guard, cutting off the exit animation before it can play.
    setTimeout(() => {
      if (!isSwipeMode) setFirstTimeDone();
      navigate('/');
    }, 640);
  };

  const handleSkip = () => {
    cancelTimer();
    if (!isSwipeMode) setFirstTimeDone();
    navigate('/');
  };

  return (
    // Navy background on desktop gives a phone-frame look
    <div className="fixed inset-0 bg-[#1E293B] flex items-center justify-center">
      <div
        ref={containerRef}
        className="relative w-full max-w-[430px] h-full overflow-hidden"
      >
        {/* ── Top bar ─────────────────────────────────────── */}
        <div className="absolute top-0 left-0 right-0 z-20 flex items-start justify-between px-6 pt-12 pointer-events-none">
          {/* Left side */}
          <div className="pointer-events-auto">
            {isSwipeMode ? (
              <button onClick={handleSkip} className="text-white/70 text-sm font-medium">
                ← Back
              </button>
            ) : (
              <div className="flex flex-col">
                <span className="text-white font-bold text-2xl leading-tight">JustPick</span>
                <span className="text-white/70 text-sm mt-0.5">How are you feeling?</span>
              </div>
            )}
          </div>

          {/* Right side: card counter + skip */}
          <div className="flex flex-col items-end gap-1 pointer-events-auto">
            <span className="text-white/60 text-xs font-medium tabular-nums">
              {currentIndex + 1} / {MOODS.length}
            </span>
            {!isSwipeMode && (
              <button onClick={handleSkip} className="text-white/60 text-sm mt-0.5">
                Skip →
              </button>
            )}
          </div>
        </div>

        {/* ── Swipeable card track ─────────────────────────── */}
        <motion.div
          className="absolute inset-0 flex items-stretch"
          style={{ x, width: MOODS.length * effectiveCardWidth }}
          drag="x"
          dragConstraints={{
            left: -(MOODS.length - 1) * effectiveCardWidth,
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
                width: effectiveCardWidth,
                background: `linear-gradient(135deg, ${mood.from} 0%, ${mood.to} 100%)`,
                transform:
                  exitPhase >= 1 && i === currentIndex ? 'scale(1.05)' : 'scale(1)',
                transition: 'transform 0.18s ease-out',
              }}
              className="h-full flex-shrink-0 flex flex-col items-center justify-center px-6"
            >
              {/* SVG illustration (replaces plain emoji as main visual) */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <MoodIllustration mood={mood} />
              </motion.div>

              <h2 className="text-4xl font-bold text-white mt-7">{mood.label}</h2>
              <p className="text-white/80 text-lg mt-2 text-center">{mood.description}</p>

              {/* Select button + circular progress ring */}
              <div className="mt-10 relative flex items-center justify-center">
                {/* Ring renders only for the active card */}
                {i === currentIndex && (
                  <svg
                    className="absolute pointer-events-none"
                    width={90}
                    height={90}
                    style={{ transform: 'rotate(-90deg)' }}
                    aria-hidden="true"
                  >
                    {/* Background track */}
                    <circle
                      cx={45}
                      cy={45}
                      r={RING_RADIUS}
                      fill="none"
                      stroke="rgba(255,255,255,0.22)"
                      strokeWidth={3}
                    />
                    {/* Progress fill */}
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
                  // Stop the pointer event from bubbling to the drag handler
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => triggerSelect(mood)}
                >
                  Pick this mood
                </motion.button>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Swipe hint (fades after first swipe) ─────────── */}
        <AnimatePresence>
          {!hasSwipedOnce && (
            <motion.div
              key="swipe-hint"
              className="absolute z-20 left-0 right-0 flex flex-col items-center gap-2 pointer-events-none"
              style={{ bottom: 72 }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              {/* Sliding hand icon */}
              <motion.span
                className="text-2xl"
                initial={{ x: 0 }}
                animate={{ x: [-24, 12, -24] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', delay: 0.8 }}
              >
                👆
              </motion.span>

              {/* Arrow + text row */}
              <div className="flex items-center gap-2">
                <motion.span
                  className="text-white/70 text-lg"
                  animate={{ x: [-5, 5, -5] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  ←
                </motion.span>
                <span className="text-white/65 text-xs font-medium tracking-wide">
                  Swipe to explore moods
                </span>
                <motion.span
                  className="text-white/70 text-lg"
                  animate={{ x: [5, -5, 5] }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                >
                  →
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Dot indicators ───────────────────────────────── */}
        <div
          className="absolute bottom-8 left-0 right-0 z-20 flex items-center justify-center gap-2.5 pointer-events-none"
        >
          {MOODS.map((_, i) => (
            <motion.button
              key={i}
              aria-label={`Go to ${MOODS[i].label}`}
              className="h-2.5 rounded-full bg-white pointer-events-auto"
              animate={{
                width: i === currentIndex ? 28 : 9,
                opacity: i === currentIndex ? 1 : 0.5,
                scale: i === currentIndex ? 1 : [1, 1.25, 1],
              }}
              transition={
                i === currentIndex
                  ? { type: 'spring', stiffness: 400, damping: 30 }
                  : {
                      width: { type: 'spring', stiffness: 400, damping: 30 },
                      scale: { duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: i * 0.18 },
                    }
              }
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
              animate={{ opacity: 1, scale: 2.5, borderRadius: '0%' }}
              transition={{ duration: 0.44, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
