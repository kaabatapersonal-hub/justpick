import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './store/AppContext';
import { useAuth } from './hooks/useAuth';
import AppShell from './components/layout/AppShell';
import LoadingSpinner from './components/ui/LoadingSpinner';
import { useAppUpdate } from './hooks/useAppUpdate';
import UpdateBanner from './components/ui/UpdateBanner';

const HomeScreen     = lazy(() => import('./screens/HomeScreen'));
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen'));
const ResultScreen   = lazy(() => import('./screens/ResultScreen'));
const StatsScreen    = lazy(() => import('./screens/StatsScreen'));
const GroupScreen    = lazy(() => import('./screens/GroupScreen'));
const HistoryScreen  = lazy(() => import('./screens/HistoryScreen'));

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
      <Route path="/swipe" element={<OnboardingScreen isSwipeMode={true} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  const { needRefresh, updateNow } = useAppUpdate();

  return (
    <>
      {needRefresh && <UpdateBanner onUpdate={updateNow} />}
      <Suspense fallback={<LoadingSpinner />}>
        <AppRoutes />
      </Suspense>
    </>
  );
}
