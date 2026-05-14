import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode, setCategory } = useApp();

  // Scroll to top whenever the route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const handleCategoryNav = (category) => {
    setCategory(category);
    navigate('/', { state: { quickPick: true } });
  };

  const navTabs = [
    { label: 'Food',     emoji: '🍔', action: () => handleCategoryNav('food') },
    { label: 'Activity', emoji: '🎯', action: () => handleCategoryNav('activity') },
    { label: 'Group',    emoji: '🎲', action: () => navigate('/group') },
  ];

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#FFF9F0] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#FFF9F0]/95 dark:bg-[#0F172A]/95 backdrop-blur-sm border-b border-[#FF8C42]/15 dark:border-[#FF8C42]/10 shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-xl font-black"
          style={{ background: 'linear-gradient(90deg, #FF8C42, #FFD166)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        >
          JustPick
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={() => navigate('/stats')}
            className="text-xl p-2 rounded-xl hover:bg-[#FF8C42]/10 transition-colors"
            aria-label="Stats"
          >
            📊
          </button>
          <button
            onClick={toggleDarkMode}
            className="text-xl p-2 rounded-xl hover:bg-[#FF8C42]/10 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-4">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="shrink-0 flex items-center justify-around bg-white/95 dark:bg-[#1E293B]/95 backdrop-blur-sm border-t border-gray-100 dark:border-gray-800 px-4 pt-2"
        style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}
      >
        {navTabs.map((tab) => {
          const isActive = tab.label === 'Group'
            ? location.pathname === '/group'
            : false;

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
              <span className="text-2xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#FF8C42]" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
