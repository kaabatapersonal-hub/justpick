import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './store/AppContext';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/layout/AppShell';
import HomeScreen from './screens/HomeScreen';
import OnboardingScreen from './screens/OnboardingScreen';
import ResultScreen from './screens/ResultScreen';
import StatsScreen from './screens/StatsScreen';
import GroupScreen from './screens/GroupScreen';
import HistoryScreen from './screens/HistoryScreen';

function AppRoutes() {
  useAuth();
  const { isFirstTime } = useApp();

  return (
    <Routes>
      <Route
        path="/onboarding"
        element={isFirstTime ? <OnboardingScreen /> : <Navigate to="/" replace />}
      />
      <Route
        path="/"
        element={
          isFirstTime ? (
            <Navigate to="/onboarding" replace />
          ) : (
            <AppShell>
              <HomeScreen />
            </AppShell>
          )
        }
      />
      <Route
        path="/result"
        element={
          <AppShell>
            <ResultScreen />
          </AppShell>
        }
      />
      <Route
        path="/stats"
        element={
          <AppShell>
            <StatsScreen />
          </AppShell>
        }
      />
      <Route
        path="/group"
        element={
          <AppShell>
            <GroupScreen />
          </AppShell>
        }
      />
      <Route
        path="/history"
        element={
          <AppShell>
            <HistoryScreen />
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return <AppRoutes />;
}
