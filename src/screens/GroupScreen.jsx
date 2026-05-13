import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../store/AppContext';
import { getPickResult } from '../utils/pickEngine';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOODS = [
  { id: 'lazy', emoji: '😴', label: 'Lazy' },
  { id: 'broke', emoji: '💸', label: 'Broke' },
  { id: 'adventurous', emoji: '🗺️', label: 'Adventurous' },
  { id: 'productive', emoji: '💪', label: 'Productive' },
  { id: 'hungry', emoji: '🍽️', label: 'Hungry' },
];

// ─── Session helpers ──────────────────────────────────────────────────────────
// TODO: Replace localStorage with Firestore real-time listeners for production multi-device sync

function generateSessionCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

function saveSession(session) {
  localStorage.setItem(`session_${session.code}`, JSON.stringify(session));
}

function loadSession(code) {
  try {
    const raw = localStorage.getItem(`session_${code.toUpperCase()}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function getVoteTally(votes) {
  const tally = {};
  Object.values(votes).forEach((mood) => {
    tally[mood] = (tally[mood] || 0) + 1;
  });
  return tally;
}

function getWinningMood(tally) {
  const entries = Object.entries(tally);
  if (!entries.length) return 'hungry';
  return entries.sort((a, b) => b[1] - a[1])[0][0];
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function Toast({ message, visible }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] bg-[#1E293B] dark:bg-white text-white dark:text-[#1E293B] px-5 py-2.5 rounded-2xl text-sm font-medium shadow-xl pointer-events-none whitespace-nowrap"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PulseDots() {
  return (
    <div className="flex gap-1.5 justify-center">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          animate={{ opacity: [0.25, 1, 0.25] }}
          transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.22 }}
          className="text-[#FF8C42] text-lg leading-none"
        >
          ●
        </motion.span>
      ))}
    </div>
  );
}

// ─── Landing View ─────────────────────────────────────────────────────────────

function LandingView({ onCreate, onJoin, showHowItWorks, toggleHowItWorks }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-8 pb-10 max-w-lg mx-auto space-y-5"
    >
      <div className="text-center space-y-2 pb-2">
        <motion.p
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 11, stiffness: 180 }}
          className="text-6xl"
        >
          🎲
        </motion.p>
        <h1 className="text-3xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">Decide Together</h1>
        <p className="text-[#1E293B]/55 dark:text-[#F8FAFC]/55 text-sm">
          Let JustPick settle the group chat
        </p>
      </div>

      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        whileTap={{ scale: 0.97 }}
        onClick={onCreate}
        className="w-full rounded-2xl p-5 text-left shadow-md active:shadow-sm"
        style={{ background: 'linear-gradient(135deg, #FF8C42, #FFD166)' }}
      >
        <p className="text-2xl mb-1">➕</p>
        <p className="text-white font-bold text-lg">Start a session</p>
        <p className="text-white/75 text-sm mt-0.5">Create a code for your group</p>
      </motion.button>

      <motion.button
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
        whileTap={{ scale: 0.97 }}
        onClick={onJoin}
        className="w-full rounded-2xl p-5 text-left border-2 border-[#FF8C42] bg-white dark:bg-[#1E293B] shadow-sm"
      >
        <p className="text-2xl mb-1">🔗</p>
        <p className="font-bold text-lg text-[#1E293B] dark:text-[#F8FAFC]">Join a session</p>
        <p className="text-[#1E293B]/55 dark:text-[#F8FAFC]/55 text-sm mt-0.5">
          Enter a code from your friend
        </p>
      </motion.button>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.24 }}
        className="text-center"
      >
        <button
          onClick={toggleHowItWorks}
          className="text-sm text-[#FF8C42] font-medium"
        >
          How it works {showHowItWorks ? '▲' : '→'}
        </button>
        <AnimatePresence>
          {showHowItWorks && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div className="mt-3 bg-white dark:bg-[#1E293B] rounded-2xl p-4 text-left space-y-2 border border-[#1E293B]/5 dark:border-[#F8FAFC]/5">
                {[
                  'Someone creates a session',
                  'Everyone picks their mood secretly',
                  'JustPick reveals the group pick',
                ].map((text, i) => (
                  <p key={i} className="text-sm text-[#1E293B]/70 dark:text-[#F8FAFC]/70">
                    <span className="font-bold text-[#FF8C42]">{i + 1}. </span>
                    {text}
                  </p>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

// ─── Create View ──────────────────────────────────────────────────────────────

function CreateView({
  session,
  hostCategory,
  setHostCategory,
  memberCount,
  onCopyCode,
  onShareWhatsApp,
  onSimulateMember,
  onReveal,
  onBack,
}) {
  const canReveal = memberCount >= 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-10 max-w-lg mx-auto space-y-5"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors"
      >
        ← Back
      </button>

      <div className="text-center space-y-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/45 dark:text-[#F8FAFC]/45">
          Your session code
        </p>
        <motion.button
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 12, stiffness: 200 }}
          whileTap={{ scale: 0.96 }}
          onClick={onCopyCode}
          className="mx-auto block px-8 py-4 border-2 border-dashed border-[#FF8C42]/45 rounded-2xl"
        >
          <p className="text-5xl font-mono font-bold text-[#FF8C42] tracking-[0.18em]">
            {session.code}
          </p>
        </motion.button>
        <p className="text-xs text-[#1E293B]/35 dark:text-[#F8FAFC]/35">Tap to copy</p>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40 text-center">
          Share with your group:
        </p>
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onShareWhatsApp}
          className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 text-white shadow-sm"
          style={{ backgroundColor: '#25D366' }}
        >
          <span>📤</span> Share code via WhatsApp
        </motion.button>
        <button
          onClick={onCopyCode}
          className="w-full py-2.5 rounded-2xl border border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors"
        >
          Copy link instead
        </button>
      </div>

      <div className="bg-white dark:bg-[#1E293B] rounded-2xl p-4 text-center space-y-3 border border-[#1E293B]/5 dark:border-[#F8FAFC]/5">
        <p className="text-sm font-medium text-[#1E293B]/65 dark:text-[#F8FAFC]/65">
          Waiting for your group...
        </p>
        <PulseDots />
        <p className="text-2xl font-bold text-[#FF8C42]">
          {memberCount} {memberCount === 1 ? 'person' : 'people'} ready
        </p>
        {memberCount < 4 ? (
          <button
            onClick={onSimulateMember}
            className="text-xs text-[#1E293B]/40 dark:text-[#F8FAFC]/40 border border-[#1E293B]/10 dark:border-[#F8FAFC]/10 px-3 py-1.5 rounded-xl hover:text-[#FF8C42] hover:border-[#FF8C42]/30 transition-colors"
          >
            + Simulate member joining
          </button>
        ) : (
          <p className="text-xs text-[#1E293B]/35 dark:text-[#F8FAFC]/35">Group is full (4/4)</p>
        )}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#1E293B]/40 dark:text-[#F8FAFC]/40">
          What are we deciding?
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { id: 'food', emoji: '🍔', label: 'Food' },
            { id: 'activity', emoji: '🎯', label: 'Activity' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setHostCategory(cat.id)}
              className={`flex items-center justify-center gap-2 py-3 rounded-2xl border font-semibold text-sm transition-colors ${
                hostCategory === cat.id
                  ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                  : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
              }`}
            >
              <span className="text-lg">{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1">
        <motion.button
          whileTap={canReveal ? { scale: 0.97 } : {}}
          onClick={canReveal ? onReveal : undefined}
          disabled={!canReveal}
          className={`w-full py-4 rounded-3xl text-lg font-bold transition-all ${
            canReveal
              ? 'bg-[#FF8C42] text-white shadow-lg'
              : 'bg-[#1E293B]/10 dark:bg-[#F8FAFC]/10 text-[#1E293B]/30 dark:text-[#F8FAFC]/30 cursor-not-allowed'
          }`}
        >
          Reveal the pick 🎲 ({memberCount} ready)
        </motion.button>
        {!canReveal && (
          <p className="text-center text-xs text-[#1E293B]/35 dark:text-[#F8FAFC]/35">
            Need at least 2 people to reveal
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Join View ────────────────────────────────────────────────────────────────

function JoinView({ codeInput, setCodeInput, codeError, onJoin, onBack }) {
  const canJoin = codeInput.trim().length === 6;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-10 max-w-lg mx-auto space-y-6"
    >
      <button
        onClick={onBack}
        className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors"
      >
        ← Back
      </button>

      <div className="text-center space-y-1 pt-2">
        <p className="text-4xl">🔗</p>
        <p className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">Join a session</p>
        <p className="text-sm text-[#1E293B]/55 dark:text-[#F8FAFC]/55">
          Enter the 6-character code
        </p>
      </div>

      <motion.div
        animate={codeError ? { x: [-10, 10, -10, 10, -6, 6, 0] } : { x: 0 }}
        transition={{ duration: 0.45 }}
      >
        <input
          type="text"
          value={codeInput}
          onChange={(e) =>
            setCodeInput(
              e.target.value
                .toUpperCase()
                .replace(/[^A-Z0-9]/g, '')
                .slice(0, 6)
            )
          }
          placeholder="ABC123"
          maxLength={6}
          autoCapitalize="characters"
          className={`w-full text-center text-3xl font-mono font-bold tracking-[0.3em] py-4 rounded-2xl border-2 bg-white dark:bg-[#1E293B] text-[#1E293B] dark:text-[#F8FAFC] outline-none transition-colors placeholder:text-[#1E293B]/20 dark:placeholder:text-[#F8FAFC]/20 ${
            codeError
              ? 'border-red-400 dark:border-red-500'
              : 'border-[#1E293B]/10 dark:border-[#F8FAFC]/10 focus:border-[#FF8C42]'
          }`}
        />
      </motion.div>

      <motion.button
        whileTap={canJoin ? { scale: 0.97 } : {}}
        onClick={canJoin ? onJoin : undefined}
        disabled={!canJoin}
        className={`w-full py-4 rounded-3xl text-lg font-bold transition-all ${
          canJoin
            ? 'bg-[#FF8C42] text-white shadow-md'
            : 'bg-[#1E293B]/10 dark:bg-[#F8FAFC]/10 text-[#1E293B]/30 dark:text-[#F8FAFC]/30 cursor-not-allowed'
        }`}
      >
        Join Session
      </motion.button>
    </motion.div>
  );
}

// ─── Vote View ────────────────────────────────────────────────────────────────

function VoteView({ session, voteMood, setVoteMood, voteLocked, onLockVote, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="px-4 pt-4 pb-10 max-w-lg mx-auto space-y-5"
    >
      {!voteLocked && (
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-[#1E293B]/60 dark:text-[#F8FAFC]/60 hover:text-[#FF8C42] transition-colors"
        >
          ← Back
        </button>
      )}

      <AnimatePresence mode="wait">
        {!voteLocked ? (
          <motion.div
            key="voting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-5"
          >
            <div className="text-center space-y-1 pt-2">
              <p className="text-4xl">🤫</p>
              <p className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">
                Pick your mood secretly
              </p>
              <p className="text-sm text-[#1E293B]/55 dark:text-[#F8FAFC]/55">
                No one sees your vote until the reveal
              </p>
              <p className="text-xs text-[#FF8C42] font-medium mt-0.5">
                Session: {session.code}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {MOODS.map((m) => (
                <motion.button
                  key={m.id}
                  whileTap={{ scale: 0.93 }}
                  onClick={() => setVoteMood(m.id)}
                  className={`flex flex-col items-center gap-1.5 py-4 rounded-2xl border font-medium text-sm transition-colors ${
                    voteMood === m.id
                      ? 'bg-[#FF8C42] border-[#FF8C42] text-white'
                      : 'bg-white dark:bg-[#1E293B] border-[#1E293B]/10 dark:border-[#F8FAFC]/10 text-[#1E293B] dark:text-[#F8FAFC]'
                  }`}
                >
                  <span className="text-2xl">{m.emoji}</span>
                  <span>{m.label}</span>
                </motion.button>
              ))}
            </div>

            <motion.button
              whileTap={voteMood ? { scale: 0.97 } : {}}
              onClick={voteMood ? onLockVote : undefined}
              disabled={!voteMood}
              className={`w-full py-4 rounded-3xl text-lg font-bold transition-all ${
                voteMood
                  ? 'bg-[#FF8C42] text-white shadow-md'
                  : 'bg-[#1E293B]/10 dark:bg-[#F8FAFC]/10 text-[#1E293B]/30 dark:text-[#F8FAFC]/30 cursor-not-allowed'
              }`}
            >
              Lock in vote 🔒
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            key="locked"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-4 pt-10"
          >
            <motion.p
              animate={{ scale: [1, 1.18, 1] }}
              transition={{ duration: 0.45 }}
              className="text-6xl"
            >
              ✅
            </motion.p>
            <p className="text-2xl font-bold text-[#1E293B] dark:text-[#F8FAFC]">Vote locked in!</p>
            <p className="text-[#1E293B]/60 dark:text-[#F8FAFC]/60">
              Waiting for the host to reveal...
            </p>
            <PulseDots />
            <p className="text-xs text-[#1E293B]/35 dark:text-[#F8FAFC]/35 pt-2">
              The host will trigger the reveal on their device
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Reveal View ──────────────────────────────────────────────────────────────

function RevealView({ step, data, tallyVisible, category, onPlayAgain, onDone, onShare }) {
  const { winningMood, tally, result } = data;
  const totalVotes = Object.values(tally).reduce((a, b) => a + b, 0);
  const winningMoodData = MOODS.find((m) => m.id === winningMood);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-[#0A0F1E] flex flex-col items-center justify-center px-6 text-center overflow-y-auto py-10"
    >
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
            className="text-5xl"
          >
            ⚙️
          </motion.div>
          <p className="text-2xl font-bold text-white">Counting votes...</p>
        </motion.div>
      )}

      {(step === 2 || step === 3) && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-sm space-y-5"
        >
          <p className="text-white/45 text-xs uppercase tracking-widest">Vote tally</p>
          <div className="space-y-3">
            {MOODS.map((mood) => {
              const count = tally[mood.id] ?? 0;
              const pct = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
              const isWinner = step === 3 && mood.id === winningMood;
              return (
                <motion.div
                  key={mood.id}
                  animate={isWinner ? { scale: 1.06 } : { scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="flex items-center gap-3"
                >
                  <span
                    className={`w-28 text-sm text-left flex-shrink-0 ${
                      isWinner ? 'text-[#FF8C42] font-bold' : 'text-white/65'
                    }`}
                  >
                    {mood.emoji} {mood.label}
                  </span>
                  <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: tallyVisible ? `${Math.max(pct, 0)}%` : '0%' }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className={`h-full rounded-full ${isWinner ? 'bg-[#FF8C42]' : 'bg-white/30'}`}
                    />
                  </div>
                  <span
                    className={`text-sm w-5 text-right flex-shrink-0 ${
                      isWinner ? 'text-[#FF8C42] font-bold' : 'text-white/55'
                    }`}
                  >
                    {count}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="pt-3 space-y-1"
            >
              <p className="text-white/55 text-sm">The group mood is...</p>
              <motion.p
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 1.4 }}
                className="text-3xl font-bold text-[#FF8C42]"
              >
                {winningMoodData?.emoji} {winningMoodData?.label}! 🎉
              </motion.p>
            </motion.div>
          )}
        </motion.div>
      )}

      {step === 4 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ duration: 0.65, times: [0, 0.15, 0.7, 1] }}
          className="fixed inset-0 bg-white"
        />
      )}

      {step >= 5 && (
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-sm space-y-5"
        >
          <div>
            <p className="text-white/45 text-xs uppercase tracking-widest">Group mood</p>
            <p className="text-5xl mt-2">{winningMoodData?.emoji}</p>
            <p className="text-white font-bold text-xl mt-1">{winningMoodData?.label}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-5 text-left space-y-2">
            <p className="text-white/45 text-xs uppercase tracking-widest">Your group pick</p>
            <p className="text-3xl font-bold text-white mt-1">{result?.name ?? 'Something fun!'}</p>
            <p className="text-white/50 text-sm capitalize">
              {category === 'food' ? '🍔' : '🎯'} {category}
              {result?.budget_level ? ` · ${result.budget_level}` : ''}
            </p>
            {result?.fun_message && (
              <p className="text-white/65 text-sm italic pt-1">
                &ldquo;{result.fun_message}&rdquo;
              </p>
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={onShare}
            className="w-full py-4 bg-[#FF8C42] text-white font-bold rounded-3xl shadow-lg text-base"
          >
            Share group result 📤
          </motion.button>

          <div className="flex gap-3">
            <button
              onClick={onPlayAgain}
              className="flex-1 py-3 rounded-2xl border border-white/20 text-white/80 text-sm font-medium active:bg-white/5"
            >
              Play again 🔄
            </button>
            <button
              onClick={onDone}
              className="flex-1 py-3 rounded-2xl bg-white/10 text-white text-sm font-medium active:bg-white/20"
            >
              Done ✓
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function GroupScreen() {
  const navigate = useNavigate();
  const { currentUser } = useApp();

  const uid = useMemo(() => {
    if (currentUser?.uid) return currentUser.uid;
    const stored = localStorage.getItem('anonUid');
    if (stored) return stored;
    const id = 'anon_' + Math.random().toString(36).slice(2, 10);
    localStorage.setItem('anonUid', id);
    return id;
  }, [currentUser?.uid]);

  const [view, setView] = useState('landing');
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Create flow
  const [session, setSession] = useState(null);
  const [hostCategory, setHostCategory] = useState('food');
  const [memberCount, setMemberCount] = useState(1);
  const [simVotes, setSimVotes] = useState({});

  // Join flow
  const [codeInput, setCodeInput] = useState('');
  const [codeError, setCodeError] = useState(false);
  const [joinedSession, setJoinedSession] = useState(null);
  const [voteMood, setVoteMood] = useState(null);
  const [voteLocked, setVoteLocked] = useState(false);

  // Reveal flow
  const [revealStep, setRevealStep] = useState(0);
  const [revealData, setRevealData] = useState(null);
  const [tallyVisible, setTallyVisible] = useState(false);

  const showToast = (msg) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2500);
  };

  const startCreateSession = () => {
    const code = generateSessionCode();
    const newSession = {
      code,
      hostUid: uid,
      category: 'food',
      votes: {},
      memberCount: 1,
      status: 'waiting',
      result: null,
      createdAt: Date.now(),
    };
    saveSession(newSession);
    setSession(newSession);
    setHostCategory('food');
    setMemberCount(1);
    setSimVotes({});
    setRevealStep(0);
    setRevealData(null);
    setTallyVisible(false);
    setView('create');
  };

  const handleCopyCode = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.code);
      showToast('Copied! 📋');
    } catch {
      showToast('Code: ' + session.code);
    }
  };

  const handleShareWhatsApp = () => {
    if (!session) return;
    const text = `Join my JustPick session! Code: ${session.code} — open justpick-app.netlify.app`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleSimulateMember = () => {
    if (memberCount >= 4) return;
    const mood = MOODS[Math.floor(Math.random() * MOODS.length)].id;
    const simUid = `sim_${memberCount}`;
    const newVotes = { ...simVotes, [simUid]: mood };
    const newCount = memberCount + 1;
    setSimVotes(newVotes);
    setMemberCount(newCount);
    if (session) {
      const updated = { ...session, votes: newVotes, memberCount: newCount };
      saveSession(updated);
      setSession(updated);
    }
  };

  const handleReveal = () => {
    const tally = getVoteTally(simVotes);
    const winningMood = getWinningMood(tally);
    const result = getPickResult({
      mood: winningMood,
      category: hostCategory,
      budget: null,
      time: null,
      history: [],
    }) ?? {
      name: 'Something fun!',
      fun_message: 'Trust the process 🎲',
      budget_level: 'free',
      category: hostCategory,
    };

    const data = { result, winningMood, tally };
    setRevealData(data);

    if (session) {
      const finalSession = {
        ...session,
        category: hostCategory,
        votes: simVotes,
        memberCount,
        status: 'revealed',
        result,
      };
      saveSession(finalSession);
      setSession(finalSession);
    }

    setRevealStep(1);
    setView('reveal');
  };

  useEffect(() => {
    if (view !== 'reveal' || revealStep === 0 || revealStep >= 5) return;

    const delays = { 1: 1300, 2: 1800, 3: 1200, 4: 650 };
    const delay = delays[revealStep];
    if (!delay) return;

    const t = setTimeout(() => {
      if (revealStep === 1) {
        setRevealStep(2);
        setTimeout(() => setTallyVisible(true), 160);
      } else {
        setRevealStep((s) => s + 1);
      }
    }, delay);

    return () => clearTimeout(t);
  }, [revealStep, view]);

  const handleJoin = () => {
    const code = codeInput.trim().toUpperCase();
    if (code.length !== 6) return;
    const found = loadSession(code);
    if (!found) {
      setCodeError(true);
      showToast("Session not found. Check the code 🤔");
      setTimeout(() => setCodeError(false), 700);
      return;
    }
    setJoinedSession(found);
    setVoteMood(null);
    setVoteLocked(false);
    setView('vote');
  };

  const handleLockVote = () => {
    if (!voteMood || !joinedSession) return;
    const updated = {
      ...joinedSession,
      votes: { ...joinedSession.votes, [uid]: voteMood },
    };
    saveSession(updated);
    setJoinedSession(updated);
    setVoteLocked(true);
  };

  const handleShareGroupResult = () => {
    if (!revealData?.result) return;
    const text = `Our group used JustPick and got: ${revealData.result.name} 🎲 — justpick-app.netlify.app`;
    if (navigator.share) {
      navigator.share({ text }).catch(() => {});
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => showToast('Copied to clipboard! 📋'))
        .catch(() => {});
    }
  };

  return (
    <div className="relative min-h-full">
      <Toast message={toastMsg} visible={toastVisible} />

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <LandingView
            key="landing"
            onCreate={startCreateSession}
            onJoin={() => {
              setCodeInput('');
              setView('join');
            }}
            showHowItWorks={showHowItWorks}
            toggleHowItWorks={() => setShowHowItWorks((p) => !p)}
          />
        )}

        {view === 'create' && session && (
          <CreateView
            key="create"
            session={session}
            hostCategory={hostCategory}
            setHostCategory={setHostCategory}
            memberCount={memberCount}
            onCopyCode={handleCopyCode}
            onShareWhatsApp={handleShareWhatsApp}
            onSimulateMember={handleSimulateMember}
            onReveal={handleReveal}
            onBack={() => setView('landing')}
          />
        )}

        {view === 'join' && (
          <JoinView
            key="join"
            codeInput={codeInput}
            setCodeInput={setCodeInput}
            codeError={codeError}
            onJoin={handleJoin}
            onBack={() => setView('landing')}
          />
        )}

        {view === 'vote' && joinedSession && (
          <VoteView
            key="vote"
            session={joinedSession}
            voteMood={voteMood}
            setVoteMood={setVoteMood}
            voteLocked={voteLocked}
            onLockVote={handleLockVote}
            onBack={() => setView('join')}
          />
        )}

        {view === 'reveal' && revealData && (
          <RevealView
            key="reveal"
            step={revealStep}
            data={revealData}
            tallyVisible={tallyVisible}
            category={hostCategory}
            onPlayAgain={() => startCreateSession()}
            onDone={() => navigate('/')}
            onShare={handleShareGroupResult}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
