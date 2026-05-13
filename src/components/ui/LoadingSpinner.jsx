import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-[#FFF9F0] dark:bg-[#0F172A] flex flex-col items-center justify-center gap-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
        className="w-10 h-10 rounded-full border-4 border-[#FF8C42]/20 border-t-[#FF8C42]"
      />
      <p className="text-sm font-semibold text-[#FF8C42]">JustPick</p>
    </div>
  );
}
