import { Suspense, lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ConfirmDialogProvider } from './components/ui/ConfirmDialogProvider';
import { Icons } from './components/Icons';
import AuthPage from './components/AuthPage';
import AppShell from './components/AppShell';

/* ─── Global Theme Toggle — always visible on every page ─── */
function GlobalThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="fixed top-4 left-4 z-[50] flex items-center justify-center h-10 w-10 rounded-full border backdrop-blur-xl transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        backgroundColor: theme === 'light' ? 'rgba(255,255,255,0.8)' : 'rgba(23,23,26,0.8)',
        borderColor: 'var(--c-border)',
        color: 'var(--c-text-muted)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.15)',
      }}
      aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
    >
      {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
    </button>
  );
}

const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const SubjectsPage = lazy(() => import('./pages/SubjectsPage'));
const TasksPage = lazy(() => import('./pages/TasksPage'));
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
          <Route path="/tasks" element={<PageLoader><TasksPage /></PageLoader>} />
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
      <GlobalThemeToggle />
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
