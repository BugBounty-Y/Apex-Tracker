import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ConfirmDialogProvider } from './components/ui/ConfirmDialogProvider';
import AuthPage from './components/AuthPage';
import AppShell from './components/AppShell';

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const TimerPage = lazy(() => import('./pages/TimerPage'));
const InsightsPage = lazy(() => import('./pages/InsightsPage'));
const HistoryPage = lazy(() => import('./pages/HistoryPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const HelpPage = lazy(() => import('./pages/HelpPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage'));
const TermsPage = lazy(() => import('./pages/TermsPage'));

function AppLoadingScreen({ label }) {
  const { theme } = useTheme();

  return (
    <div
      dir="rtl"
      className={`min-h-screen flex items-center justify-center font-sans ${theme === 'light' ? 'light' : ''}`}
      style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)' }}
    >
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-violet-600 text-xl font-black text-white shadow-lg shadow-violet-600/20">
          A
        </div>
        <div className="h-9 w-9 rounded-full border-[3px] border-violet-500/25 border-t-violet-500 animate-spin" />
        <div className="text-sm font-medium" style={{ color: 'var(--c-text-muted)' }}>
          {label}
        </div>
      </div>
    </div>
  );
}

function PageLoader({ children }) {
  return (
    <Suspense fallback={<AppLoadingScreen label="جارٍ تحميل الصفحة..." />}>
      {children}
    </Suspense>
  );
}

function OnboardingRoute() {
  const { loading, appData } = useAppData();

  if (loading) {
    return <AppLoadingScreen label="جارٍ تجهيز بياناتك..." />;
  }

  if (appData.userProfile.hasCompletedOnboarding) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <PageLoader>
      <OnboardingPage />
    </PageLoader>
  );
}

function ProtectedShellRoute() {
  const { loading, appData } = useAppData();

  if (loading) {
    return <AppLoadingScreen label="جارٍ تحميل مساحة العمل..." />;
  }

  if (!appData.userProfile.hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <AppShell />;
}

function AuthenticatedApp() {
  const { user } = useAuth();

  return (
    <AppDataProvider key={user?.uid || 'guest'}>
      <Routes>
        <Route path="/onboarding" element={<OnboardingRoute />} />

        <Route element={<ProtectedShellRoute />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<PageLoader><DashboardPage /></PageLoader>} />
          <Route path="/subjects" element={<PageLoader><SubjectsPage /></PageLoader>} />
          <Route path="/timer" element={<PageLoader><TimerPage /></PageLoader>} />
          <Route path="/insights" element={<PageLoader><InsightsPage /></PageLoader>} />
          <Route path="/history" element={<PageLoader><HistoryPage /></PageLoader>} />
          <Route path="/settings" element={<PageLoader><SettingsPage /></PageLoader>} />
          <Route path="/help" element={<PageLoader><HelpPage /></PageLoader>} />
          <Route path="/privacy" element={<PageLoader><PrivacyPage /></PageLoader>} />
          <Route path="/terms" element={<PageLoader><TermsPage /></PageLoader>} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AppDataProvider>
  );
}

function AppRouter() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AppLoadingScreen label="جارٍ التحقق من الحساب..." />;
  }

  if (!user) {
    return <AuthPage />;
  }

  return <AuthenticatedApp />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <BrowserRouter>
              <AppRouter />
            </BrowserRouter>
          </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
