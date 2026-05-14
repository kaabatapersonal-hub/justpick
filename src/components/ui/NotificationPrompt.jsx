import { motion } from 'framer-motion';

export default function NotificationPrompt({ onAccept, onDismiss }) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/40"
        onClick={onDismiss}
      />

      {/* Sheet */}
      <motion.div
        initial={{ y: 300, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 300, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 bg-white dark:bg-[#1E293B] rounded-t-3xl p-6 shadow-2xl"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-300 dark:bg-white/20 rounded-full mx-auto mb-6" />

        {/* Bell */}
        <motion.p
          animate={{ rotate: [0, -15, 15, -15, 15, 0] }}
          transition={{ repeat: 2, duration: 1 }}
          className="text-5xl text-center select-none"
        >
          🔔
        </motion.p>

        {/* Title */}
        <p className="text-xl font-black text-center mt-3 text-[#1E293B] dark:text-[#F8FAFC]">
          Never miss the best pick 🎯
        </p>

        {/* Subtitle */}
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-2 leading-relaxed">
          Get a nudge at lunch and dinner.<br />One tap — JustPick decides.
        </p>

        {/* Buttons */}
        <div className="mt-6">
          <button
            onClick={onAccept}
            className="w-full h-12 rounded-xl text-white font-bold text-sm"
            style={{ background: 'linear-gradient(135deg, #FF8C42, #FF6B1A)' }}
          >
            🔔 Yes, remind me
          </button>
          <button
            onClick={onDismiss}
            className="w-full mt-2 py-3 text-gray-400 text-sm"
          >
            No thanks
          </button>
        </div>
      </motion.div>
    </>
  );
}
