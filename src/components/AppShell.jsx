import { useEffect, useMemo, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Icons } from './Icons';
import { useTheme } from '../contexts/ThemeContext';
import { useAppData } from '../contexts/AppDataContext';
import { useAuth } from '../contexts/AuthContext';
import StatusBadge from './ui/StatusBadge';
import { trackEvent } from '../utils/telemetry';

const primaryNavigation = [
  { to: '/dashboard', label: 'لوحة التحكم', icon: <Icons.LayoutGrid /> },
  { to: '/subjects', label: 'المواد', icon: <Icons.Book /> },
  { to: '/timer', label: 'المؤقت', icon: <Icons.Timer /> },
  { to: '/insights', label: 'التحليلات', icon: <Icons.BarChart3 /> },
];

const secondaryNavigation = [
  { to: '/history', label: 'السجل', icon: <Icons.History /> },
  { to: '/help', label: 'المساعدة', icon: <Icons.HelpCircle /> },
  { to: '/settings', label: 'الإعدادات', icon: <Icons.Settings /> },
];

const utilityNavigation = [
  { to: '/privacy', label: 'الخصوصية' },
  { to: '/terms', label: 'الشروط' },
];

function NavItem({ item, compact = false, onClick }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => `group flex items-center gap-2.5 rounded-[12px] px-3.5 py-2 transition-all duration-200 ${
        compact ? 'justify-center px-2 py-2' : ''
      } ${isActive ? 'shadow-sm' : 'hover:bg-white/[0.03]'}`}
      style={({ isActive }) => ({
        backgroundColor: isActive ? 'var(--c-sidebar-active)' : 'transparent',
        color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)',
      })}
    >
      {({ isActive }) => (
        <>
          <span className="shrink-0 transition-colors duration-200" style={{ color: isActive ? 'var(--c-nav-active)' : 'var(--c-text-faint)' }}>{item.icon}</span>
          {!compact && <span className="text-[12px] font-semibold">{item.label}</span>}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { appData, syncStatus, activeSubject, todaySeconds } = useAppData();
  const location = useLocation();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const studentName = appData.userProfile.name || user?.displayName || 'طالب';

  const activeSection = useMemo(() => {
    const allItems = [...primaryNavigation, ...secondaryNavigation, ...utilityNavigation];
    return allItems.find((item) => location.pathname.startsWith(item.to));
  }, [location.pathname]);

  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  const formatTodayTime = () => {
    const mins = Math.round(todaySeconds / 60);
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  return (
    <div
      dir="rtl"
      className={`min-h-screen font-sans ${theme === 'light' ? 'light' : ''}`}
      style={{
        backgroundColor: 'var(--c-bg)',
        color: 'var(--c-text)',
        backgroundImage: 'radial-gradient(circle at top right, var(--c-glow-violet), transparent 28%), radial-gradient(circle at 20% 18%, var(--c-glow-cyan), transparent 24%)',
      }}
    >
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="fixed inset-y-0 right-0 z-40 hidden w-[280px] border-l px-4 py-5 lg:flex lg:flex-col"
        style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}
      >
        {/* Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-600 to-violet-500 text-base font-black text-white shadow-lg shadow-violet-600/20">
            A
          </div>
          <div className="text-right">
            <div className="text-[14px] font-bold tracking-tight">Apex Tracker</div>
            <div className="text-[10px] font-medium" style={{ color: 'var(--c-text-faint)' }}>
              مساحة دراسة منظمة
            </div>
          </div>
        </div>

        {/* Student card */}
        <div className="app-panel p-3.5">
          <div className="flex items-center justify-between gap-3">
            <div className="text-right min-w-0">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                style={{ color: 'var(--c-text-faint)' }}
              >
                الطالب الحالي
              </div>
              <div className="mt-1 text-sm font-bold truncate">{studentName}</div>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-violet-500/15 text-sm font-bold text-violet-300">
              {studentName.slice(0, 1)}
            </div>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            <StatusBadge status={syncStatus} />
            {activeSubject && (
              <div
                className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
                style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}
              >
                {activeSubject}
              </div>
            )}
          </div>
        </div>

        {/* Primary nav */}
        <nav className="mt-6 space-y-1">
          <div
            className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--c-text-faint)' }}
          >
            التنقل الرئيسي
          </div>
          {primaryNavigation.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>

        {/* Secondary nav */}
        <nav className="mt-6 space-y-1">
          <div
            className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.22em]"
            style={{ color: 'var(--c-text-faint)' }}
          >
            صفحات مساندة
          </div>
          {secondaryNavigation.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>

        {/* Today stat card at bottom */}
        <div className="app-panel mt-auto p-3.5">
          <div
            className="text-[10px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: 'var(--c-text-faint)' }}
          >
            إنجاز اليوم
          </div>
          <div className="mt-2 text-[26px] font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>{formatTodayTime()}</div>
          <div className="mt-1.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
            حفظ محلي وسحابي مع متابعة مباشرة.
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <div className="lg:pr-[280px]">
        {/* Header */}
        <header
          className="sticky top-0 z-30 border-b backdrop-blur-xl"
          style={{
            backgroundColor: theme === 'light' ? 'rgba(245, 245, 247, 0.92)' : 'rgba(10, 10, 13, 0.92)',
            borderColor: 'var(--c-border)',
          }}
        >
          <div className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 px-4 py-3.5 md:px-5 lg:px-6">
            <div className="text-right">
              <div
                className="text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: 'var(--c-text-faint)' }}
              >
                Apex Workspace
              </div>
              <div className="mt-0.5 text-[14px] font-bold md:text-[15px]">
                {activeSection?.label || 'لوحة التحكم'}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:block">
                <StatusBadge status={syncStatus} />
              </div>
              <button
                type="button"
                onClick={toggleTheme}
                className="rounded-xl border p-2 transition-all duration-200 hover:bg-white/[0.04]"
                style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                aria-label={theme === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
              >
                {theme === 'light' ? <Icons.Moon /> : <Icons.Sun />}
              </button>
              <button
                type="button"
                className="rounded-xl border p-2 transition-all duration-200 lg:hidden"
                style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                onClick={() => setMobileMoreOpen(true)}
                aria-label="فتح الصفحات الثانوية"
              >
                <Icons.MoreHorizontal />
              </button>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="px-4 pb-28 pt-5 md:px-5 lg:px-6 lg:pb-10">
          <div className="mx-auto max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t px-1 py-1 lg:hidden"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(245, 245, 247, 0.96)' : 'rgba(10, 10, 13, 0.96)',
          borderColor: 'var(--c-border)',
          paddingBottom: 'calc(0.25rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="grid grid-cols-5 gap-1">
          {primaryNavigation.map((item) => (
            <NavItem key={item.to} item={item} compact />
          ))}
          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className="flex items-center justify-center rounded-[12px] px-2 py-2 transition-colors"
            style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-text-muted)' }}
            aria-label="فتح المزيد"
          >
            <Icons.MoreHorizontal />
          </button>
        </div>
      </nav>

      {/* ===== MOBILE MORE SHEET ===== */}
      {mobileMoreOpen && (
        <div
          className="fixed inset-0 z-[91] bg-black/55 backdrop-blur-sm lg:hidden animate-fade-in"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileMoreOpen(false);
            }
          }}
          role="presentation"
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-3xl border-t px-5 pb-8 pt-5 animate-slide-in-bottom"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: 'var(--c-border)' }} />
            <div className="mb-3 text-center text-[13px] font-bold" style={{ color: 'var(--c-text)' }}>
              صفحات إضافية
            </div>
            <div className="space-y-1">
              {secondaryNavigation.map((item) => (
                <NavItem key={item.to} item={item} onClick={() => setMobileMoreOpen(false)} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
