import { motion, AnimatePresence } from 'framer-motion';

export default function UpdateBanner({ onUpdate }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        style={{
          position: 'fixed',
          top: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: '430px',
          zIndex: 100,
          padding: '0 16px',
          paddingTop: 'env(safe-area-inset-top, 8px)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, #FF8C42, #FFD166)',
          borderRadius: '0 0 16px 16px',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(255,140,66,0.4)',
        }}>
          <div>
            <p style={{
              color: 'white',
              fontWeight: 'bold',
              fontSize: '13px',
              margin: 0,
            }}>
              ✨ New version available!
            </p>
            <p style={{
              color: 'rgba(255,255,255,0.8)',
              fontSize: '11px',
              margin: '2px 0 0 0',
            }}>
              Tap to get the latest JustPick
            </p>
          </div>
          <button
            onClick={onUpdate}
            style={{
              background: 'white',
              color: '#FF8C42',
              border: 'none',
              borderRadius: '20px',
              padding: '6px 16px',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            Update
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
