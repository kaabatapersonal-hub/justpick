import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { suggestions } from '../data/suggestions.js';

const MOOD_COLORS = {
  lazy: '#8B5CF6',
  broke: '#EC4899',
  adventurous: '#3B82F6',
  productive: '#10B981',
  hungry: '#FF8C42',
};

const MOOD_EMOJIS = {
  lazy: '😴',
  broke: '💸',
  adventurous: '🗺️',
  productive: '💪',
  hungry: '🍽️',
};

function formatDate(ts) {
  return new Date(ts).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

function EmptyState({ onCta }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 text-center gap-4">
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
        <circle cx="60" cy="60" r="50" stroke="#FF8C42" strokeWidth="3" strokeOpacity="0.25" />
        <rect
          x="35" y="42" width="50" height="38" rx="7"
          stroke="#FF8C42" strokeWidth="2.5" strokeOpacity="0.45" fill="none"
        />
        <line x1="45" y1="56" x2="75" y2="56" stroke="#FF8C42" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
        <line x1="45" y1="64" x2="63" y2="64" stroke="#FF8C42" strokeWidth="2" strokeOpacity="0.4" strokeLinecap="round" />
        <line x1="45" y1="72" x2="55" y2="72" stroke="#FF8C42" strokeWidth="2" strokeOpacity="0.3" strokeLinecap="round" />
      </svg>
      <p className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">No picks yet!</p>
      <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 max-w-xs">
        Start deciding and your history will show up here
      </p>
      <button
        onClick={onCta}
        className="mt-2 px-6 py-3 bg-[#FF8C42] text-white font-semibold rounded-2xl shadow-md active:scale-95 transition-transform"
      >
        Make your first pick →
      </button>
    </div>
  );
}

export default function HistoryScreen() {
  const navigate = useNavigate();
  const { history, setResult } = useApp();

  const [filter, setFilter] = useState('all');
  const [expandedKey, setExpandedKey] = useState(null);
  const [longPressItem, setLongPressItem] = useState(null);
  const longPressTimer = useRef(null);

  const safeHistory = Array.isArray(history) ? history : [];
  const totalPicks = safeHistory.length;

  const filtered =
    filter === 'all' ? safeHistory : safeHistory.filter((h) => h.category === filter);

  const getItemKey = (item) => `${item.id}-${item.timestamp}`;

  const handleLongPressStart = (item) => {
    longPressTimer.current = setTimeout(() => setLongPressItem(item), 500);
  };

  const handleLongPressEnd = () => clearTimeout(longPressTimer.current);

  const handleToggleExpand = (item) => {
    const key = getItemKey(item);
    setExpandedKey((prev) => (prev === key ? null : key));
  };

  const handlePickAgain = (item) => {
    const fullPick = suggestions.find((s) => s.id === item.id) ?? {
      id: item.id,
      name: item.name,
      category: item.category,
      mood_tags: [],
      budget_level: 'medium',
      time_required: 'quick',
      fun_message: `${item.name} — back again! 🔄`,
    };
    setResult(fullPick);
    setLongPressItem(null);
    navigate('/result');
  };

  if (safeHistory.length === 0) {
    return (
      <div className="px-4 pt-4 max-w-lg mx-auto">
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors mb-2"
        >
          ← Back
        </motion.button>
        <EmptyState onCta={() => navigate('/')} />
      </div>
    );
  }

  return (
    <div className="relative min-h-full pb-10">
      <div className="px-4 pt-4 space-y-4 max-w-lg mx-auto">
        {/* Back + Title */}
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors mb-2"
          >
            ← Back
          </button>
          <p className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">Pick History</p>
          <p className="text-sm text-[#1E293B]/50 dark:text-[#F8FAFC]/50 mt-0.5">
            {totalPicks} {totalPicks === 1 ? 'pick' : 'picks'} made
          </p>
        </motion.div>

        {/* Filter pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.08 }}
          className="flex gap-2"
        >
          {['all', 'food', 'activity'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-[#FF8C42] text-white'
                  : 'bg-white dark:bg-[#1E293B] text-[#1E293B]/60 dark:text-[#F8FAFC]/60 border border-[#1E293B]/10 dark:border-[#F8FAFC]/10'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Pick list */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.p
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-center text-[#1E293B]/50 dark:text-[#F8FAFC]/50 py-10"
              >
                No {filter} picks yet
              </motion.p>
            ) : (
              filtered.map((item, idx) => {
                const key = getItemKey(item);
                const isExpanded = expandedKey === key;
                const fullPick = suggestions.find((s) => s.id === item.id);

                return (
                  <motion.div
                    key={key}
                    layout
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ delay: idx * 0.04, duration: 0.25 }}
                    className="bg-white dark:bg-[#1E293B] rounded-2xl overflow-hidden border border-[#1E293B]/5 dark:border-[#F8FAFC]/5 shadow-sm cursor-pointer"
                    onTouchStart={() => handleLongPressStart(item)}
                    onTouchEnd={handleLongPressEnd}
                    onMouseDown={() => handleLongPressStart(item)}
                    onMouseUp={handleLongPressEnd}
                    onMouseLeave={handleLongPressEnd}
                    onClick={() => handleToggleExpand(item)}
                  >
                    {/* Main row */}
                    <div className="flex items-center gap-3 p-4">
                      {/* Category circle */}
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full flex-shrink-0 ${
                          item.category === 'food' ? 'bg-[#FF8C42]' : 'bg-blue-500'
                        }`}
                      >
                        <span className="text-lg">{item.category === 'food' ? '🍔' : '🎯'}</span>
                      </div>

                      {/* Center */}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-[#1E293B] dark:text-[#F8FAFC] truncate">
                          {item.name}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {item.mood && (
                            <span
                              className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                              style={{ backgroundColor: MOOD_COLORS[item.mood] ?? '#888' }}
                            >
                              {MOOD_EMOJIS[item.mood] ?? ''} {item.mood}
                            </span>
                          )}
                        </div>
                        {fullPick?.fun_message && (
                          <p className="text-xs text-[#1E293B]/45 dark:text-[#F8FAFC]/45 italic mt-0.5 truncate">
                            {fullPick.fun_message}
                          </p>
                        )}
                      </div>

                      {/* Right: date + expand indicator */}
                      <div className="text-right flex-shrink-0 flex flex-col items-end gap-0.5">
                        <p className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50">
                          {formatDate(item.timestamp)}
                        </p>
                        <p className="text-xs text-[#1E293B]/50 dark:text-[#F8FAFC]/50">
                          {formatTime(item.timestamp)}
                        </p>
                        <span className="text-xs text-[#1E293B]/30 dark:text-[#F8FAFC]/30 mt-0.5">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Expanded details */}
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          key="expanded"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.22 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-[#1E293B]/5 dark:border-[#F8FAFC]/5 pt-3 space-y-2">
                            {fullPick ? (
                              <>
                                <div className="flex gap-6">
                                  <div>
                                    <p className="text-xs text-[#1E293B]/40 dark:text-[#F8FAFC]/40 uppercase tracking-widest">
                                      Budget
                                    </p>
                                    <p className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC] capitalize">
                                      {fullPick.budget_level}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-[#1E293B]/40 dark:text-[#F8FAFC]/40 uppercase tracking-widest">
                                      Time
                                    </p>
                                    <p className="text-sm font-medium text-[#1E293B] dark:text-[#F8FAFC] capitalize">
                                      {fullPick.time_required}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm italic text-[#1E293B]/60 dark:text-[#F8FAFC]/60">
                                  &ldquo;{fullPick.fun_message}&rdquo;
                                </p>
                              </>
                            ) : (
                              <p className="text-sm text-[#1E293B]/40 dark:text-[#F8FAFC]/40 italic">
                                No extra details available
                              </p>
                            )}
                            <p className="text-xs text-[#1E293B]/30 dark:text-[#F8FAFC]/30 italic">
                              Hold to pick again
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Long-press action sheet */}
      <AnimatePresence>
        {longPressItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
            onClick={() => setLongPressItem(null)}
          >
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              exit={{ y: 100 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-sm bg-white dark:bg-[#1E293B] rounded-t-3xl p-6 pb-10"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="font-bold text-[#1E293B] dark:text-[#F8FAFC] text-center mb-4">
                {longPressItem.name}
              </p>
              <button
                onClick={() => handlePickAgain(longPressItem)}
                className="w-full py-3 bg-[#FF8C42] text-white font-semibold rounded-2xl shadow-md"
              >
                Pick this again 🔄
              </button>
              <button
                onClick={() => setLongPressItem(null)}
                className="w-full py-3 mt-2 text-[#1E293B]/60 dark:text-[#F8FAFC]/60 text-sm"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
