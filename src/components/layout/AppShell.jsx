import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useApp();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navTabs = [
    {
      label: 'Pick',
      emoji: '🎲',
      action: () => navigate('/'),
      isActive: () => location.pathname === '/' || location.pathname === '/result',
    },
    {
      label: 'Group',
      emoji: '👥',
      action: () => navigate('/group'),
      isActive: () => location.pathname === '/group',
    },
    {
      label: 'Stats',
      emoji: '📊',
      action: () => navigate('/stats'),
      isActive: () => location.pathname === '/stats' || location.pathname === '/history',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#FFF9F0] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC]">
      {/* Top Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-[#FFF9F0]/95 dark:bg-[#0F172A]/95 backdrop-blur-sm border-b border-[#FF8C42]/15 dark:border-[#FF8C42]/10 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-black"
          style={{ background: 'linear-gradient(90deg, #FF8C42, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          JustPick
        </button>
        <button
          onClick={toggleDarkMode}
          className="text-xl p-2 rounded-xl hover:bg-[#FF8C42]/10 transition-colors"
          aria-label="Toggle dark mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Main Content */}
      <main
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 20px))' }}
      >
        {children}
      </main>

      {/* Fixed Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-20 flex items-center justify-around bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 px-4 pt-2"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 20px)' }}
      >
        {navTabs.map((tab) => {
          const isActive = tab.isActive();
          return (
            <button
              key={tab.label}
              onClick={tab.action}
              className={`relative flex flex-col items-center gap-0.5 px-6 py-2 rounded-2xl transition-colors min-h-[44px] ${
                isActive
                  ? 'text-[#FF8C42]'
                  : 'text-gray-400 dark:text-gray-500 hover:text-[#FF8C42]'
              }`}
            >
              {isActive && (
                <span className="absolute top-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF8C42]" />
              )}
              <span className="text-2xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
