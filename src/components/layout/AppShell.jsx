import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../store/AppContext';

export default function AppShell({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleDarkMode, setCategory } = useApp();

  const handleCategoryNav = (category) => {
    setCategory(category);
    navigate('/', { state: { quickPick: true } });
  };

  const navTabs = [
    { label: 'Food', emoji: '🍔', action: () => handleCategoryNav('food') },
    { label: 'Activity', emoji: '🎯', action: () => handleCategoryNav('activity') },
    { label: 'Group', emoji: '🎲', action: () => navigate('/group') },
  ];

  const activeTab = (() => {
    if (location.pathname === '/group') return 'Group';
    const { state } = location;
    if (state?.quickPick) return null;
    return null;
  })();

  return (
    <div className="flex flex-col h-screen bg-[#FFF9F0] dark:bg-[#0F172A] text-[#1E293B] dark:text-[#F8FAFC]">
      {/* Top Bar */}
      <header className="flex items-center justify-between px-4 py-3 bg-[#FFF9F0] dark:bg-[#0F172A] border-b border-gray-200 dark:border-gray-700 shrink-0">
        <span className="text-xl font-bold text-[#FF8C42]">JustPick</span>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/stats')}
            className="text-xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Stats"
          >
            📊
          </button>
          <button
            onClick={toggleDarkMode}
            className="text-xl p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-2">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="shrink-0 flex items-center justify-around bg-[#FFFFFF] dark:bg-[#1E293B] border-t border-gray-200 dark:border-gray-700 px-4 py-2 safe-area-bottom">
        {navTabs.map((tab) => {
          const isActive =
            tab.label === 'Group'
              ? location.pathname === '/group'
              : location.pathname === '/' && location.state?.activeTab === tab.label;

          return (
            <button
              key={tab.label}
              onClick={tab.action}
              className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-colors ${
                isActive
                  ? 'text-[#FF8C42] bg-orange-50 dark:bg-orange-900/20'
                  : 'text-gray-500 dark:text-gray-400 hover:text-[#FF8C42]'
              }`}
            >
              <span className="text-2xl">{tab.emoji}</span>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
