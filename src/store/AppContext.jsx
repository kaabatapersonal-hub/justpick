import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const getSystemDarkMode = () =>
  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;

const loadFromStorage = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

const initialState = {
  currentUser: null,
  selectedMood: null,
  selectedCategory: null,
  selectedBudget: null,
  selectedTime: null,
  currentResult: null,
  shufflesLeft: 3,
  noExcuseMode: false,
  streak: loadFromStorage('streak', { current: 0, longest: 0, lastPickDate: null }),
  history: loadFromStorage('history', []),
  stats: loadFromStorage('stats', { totalPicks: 0, moodFrequency: {}, topSuggestions: {} }),
  isDarkMode: loadFromStorage('isDarkMode', getSystemDarkMode()),
  isFirstTime: loadFromStorage('isFirstTime', true),
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, currentUser: action.payload };
    case 'SET_MOOD':
      return { ...state, selectedMood: action.payload };
    case 'SET_CATEGORY':
      return { ...state, selectedCategory: action.payload };
    case 'SET_BUDGET':
      return { ...state, selectedBudget: action.payload };
    case 'SET_TIME':
      return { ...state, selectedTime: action.payload };
    case 'SET_RESULT':
      return { ...state, currentResult: action.payload };
    case 'DECREMENT_SHUFFLES':
      return { ...state, shufflesLeft: Math.max(0, state.shufflesLeft - 1) };
    case 'RESET_SHUFFLES':
      return { ...state, shufflesLeft: 3 };
    case 'TOGGLE_NO_EXCUSE':
      return { ...state, noExcuseMode: !state.noExcuseMode };
    case 'TOGGLE_DARK_MODE':
      return { ...state, isDarkMode: !state.isDarkMode };
    case 'ADD_TO_HISTORY': {
      const updated = [action.payload, ...state.history].slice(0, 10);
      return { ...state, history: updated };
    }
    case 'UPDATE_STATS':
      return { ...state, stats: { ...state.stats, ...action.payload } };
    case 'UPDATE_STREAK':
      return { ...state, streak: { ...state.streak, ...action.payload } };
    case 'SET_FIRST_TIME_DONE':
      return { ...state, isFirstTime: false };
    case 'RESET_ALL':
      return {
        ...state,
        stats: { totalPicks: 0, moodFrequency: {}, topSuggestions: {} },
        history: [],
        streak: { current: 0, longest: 0, lastPickDate: null },
      };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem('isDarkMode', JSON.stringify(state.isDarkMode));
  }, [state.isDarkMode]);

  useEffect(() => {
    localStorage.setItem('isFirstTime', JSON.stringify(state.isFirstTime));
  }, [state.isFirstTime]);

  useEffect(() => {
    localStorage.setItem('streak', JSON.stringify(state.streak));
  }, [state.streak]);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(state.history));
  }, [state.history]);

  useEffect(() => {
    localStorage.setItem('stats', JSON.stringify(state.stats));
  }, [state.stats]);

  // Apply dark mode class to html element
  useEffect(() => {
    if (state.isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.isDarkMode]);

  const actions = {
    setUser: (user) => dispatch({ type: 'SET_USER', payload: user }),
    setMood: (mood) => dispatch({ type: 'SET_MOOD', payload: mood }),
    setCategory: (category) => dispatch({ type: 'SET_CATEGORY', payload: category }),
    setBudget: (budget) => dispatch({ type: 'SET_BUDGET', payload: budget }),
    setTime: (time) => dispatch({ type: 'SET_TIME', payload: time }),
    setResult: (result) => dispatch({ type: 'SET_RESULT', payload: result }),
    decrementShuffles: () => dispatch({ type: 'DECREMENT_SHUFFLES' }),
    resetShuffles: () => dispatch({ type: 'RESET_SHUFFLES' }),
    toggleNoExcuseMode: () => dispatch({ type: 'TOGGLE_NO_EXCUSE' }),
    toggleDarkMode: () => dispatch({ type: 'TOGGLE_DARK_MODE' }),
    addToHistory: (item) => dispatch({ type: 'ADD_TO_HISTORY', payload: item }),
    updateStats: (data) => dispatch({ type: 'UPDATE_STATS', payload: data }),
    updateStreak: (data) => dispatch({ type: 'UPDATE_STREAK', payload: data }),
    setFirstTimeDone: () => dispatch({ type: 'SET_FIRST_TIME_DONE' }),
    resetAll: () => dispatch({ type: 'RESET_ALL' }),
  };

  return (
    <AppContext.Provider value={{ ...state, ...actions }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
