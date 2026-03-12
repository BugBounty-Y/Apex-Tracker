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
  { to: '/tasks', label: 'المهام', icon: <Icons.ListTodo /> },
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

function NavItem({ item, compact = false, onClick, badge }) {
  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) => `group flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 transition-all duration-200 ${
        compact ? 'flex-col justify-center gap-1 px-1 py-2' : ''
      } ${isActive ? '' : 'hover:bg-[var(--c-surface-hover)]'}`}
      style={({ isActive }) => ({
        backgroundColor: isActive ? 'var(--c-sidebar-active)' : 'transparent',
        color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)',
      })}
    >
      {({ isActive }) => (
        <>
          <span
            className="shrink-0 transition-colors duration-200"
            style={{ color: isActive ? 'var(--c-nav-active)' : 'var(--c-text-faint)' }}
          >
            {item.icon}
          </span>
          {!compact && (
            <span className="text-[13px] font-semibold flex-1">{item.label}</span>
          )}
          {compact && (
            <span className="text-[10px] font-semibold leading-none">{item.label}</span>
          )}
          {/* Badge — desktop only */}
          {!compact && badge > 0 && (
            <span
              className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
              style={{ backgroundColor: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}
            >
              {badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function AppShell() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { appData, syncStatus, activeSubject, todaySeconds } = useAppData();
  const location = useLocation();
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);

  const studentName = appData.userProfile.name || user?.displayName || 'طالب';

  // Count total open tasks for the badge
  const totalOpenTasks = useMemo(() => {
    let count = 0;
    for (const subject of Object.values(appData.subjects)) {
      for (const task of subject.tasks) {
        if (!task.done) count += 1;
      }
    }
    return count;
  }, [appData.subjects]);

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
      }}
    >
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className="fixed inset-y-0 right-0 z-40 hidden w-[260px] border-l lg:flex lg:flex-col overflow-y-auto"
        style={{
          backgroundColor: 'var(--c-bg)',
          borderColor: 'var(--c-border)',
        }}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-gradient-to-br from-violet-600 to-violet-500 text-sm font-black text-white shadow-lg shadow-violet-600/20">
              A
            </div>
            <div className="text-right">
              <div className="text-[14px] font-bold tracking-tight">Apex Tracker</div>
              <div className="text-[10px] font-medium" style={{ color: 'var(--c-text-faint)' }}>
                مساحة دراسة منظمة
              </div>
            </div>
          </div>
        </div>

        {/* Student card */}
        <div className="mx-4 rounded-[var(--radius-lg)] border p-3" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
          <div className="flex items-center justify-between gap-3">
            <div className="text-right min-w-0">
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>الطالب الحالي</div>
              <div className="mt-0.5 text-[13px] font-bold truncate">{studentName}</div>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px]" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
              <span className="text-xs font-bold">{studentName.slice(0, 1)}</span>
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <StatusBadge status={syncStatus} />
            {activeSubject && (
              <div
                className="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}
              >
                {activeSubject}
              </div>
            )}
          </div>
        </div>

        {/* Primary nav */}
        <nav className="mt-5 px-3 space-y-0.5">
          <div className="app-label mb-1.5 px-3" style={{ fontSize: '0.625rem' }}>
            التنقل الرئيسي
          </div>
          {primaryNavigation.map((item) => (
            <NavItem
              key={item.to}
              item={item}
              badge={item.to === '/tasks' ? totalOpenTasks : 0}
            />
          ))}
        </nav>

        {/* Secondary nav */}
        <nav className="mt-5 px-3 space-y-0.5">
          <div className="app-label mb-1.5 px-3" style={{ fontSize: '0.625rem' }}>
            صفحات مساندة
          </div>
          {secondaryNavigation.map((item) => <NavItem key={item.to} item={item} />)}
        </nav>

        {/* Today stat card at bottom */}
        <div className="mt-auto mx-4 mb-4 rounded-[var(--radius-lg)] border p-3.5" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
          <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>إنجاز اليوم</div>
          <div className="mt-1.5 text-[24px] font-bold tabular-nums" style={{ color: 'var(--c-text)', letterSpacing: '-0.02em' }}>{formatTodayTime()}</div>
          <div className="mt-1 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
            حفظ محلي وسحابي مع متابعة مباشرة.
          </div>
        </div>
      </aside>

      {/* ===== MAIN CONTENT (no header) ===== */}
      <div className="lg:pr-[260px]">
        <main className="px-4 pb-28 pt-6 md:px-5 lg:px-6 lg:pb-10">
          <div className="mx-auto max-w-[1320px]">
            <Outlet />
          </div>
        </main>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t lg:hidden"
        style={{
          backgroundColor: theme === 'light' ? 'rgba(248, 248, 250, 0.95)' : 'rgba(9, 9, 11, 0.95)',
          borderColor: 'var(--c-border)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        <div className="grid grid-cols-6 gap-0.5 px-1 py-1">
          {primaryNavigation.map((item) => (
            <NavItem key={item.to} item={item} compact />
          ))}
          <button
            type="button"
            onClick={() => setMobileMoreOpen(true)}
            className="flex flex-col items-center justify-center gap-1 rounded-[var(--radius-md)] px-1 py-2 transition-colors"
            style={{ color: 'var(--c-text-muted)' }}
            aria-label="فتح المزيد"
          >
            <Icons.MoreHorizontal />
            <span className="text-[10px] font-semibold leading-none">المزيد</span>
          </button>
        </div>
      </nav>

      {/* ===== MOBILE MORE SHEET ===== */}
      {mobileMoreOpen && (
        <div
          className="fixed inset-0 z-[91] lg:hidden animate-fade-in"
          style={{ backgroundColor: 'var(--c-overlay)', backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)' }}
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setMobileMoreOpen(false);
            }
          }}
          role="presentation"
        >
          <div
            className="absolute inset-x-0 bottom-0 rounded-t-[24px] border-t px-5 pt-4 animate-slide-in-bottom"
            style={{
              backgroundColor: 'var(--c-bg)',
              borderColor: 'var(--c-border)',
              paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))',
            }}
          >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full" style={{ backgroundColor: 'var(--c-border-strong)' }} />
            <div className="mb-3 text-center text-[13px] font-bold" style={{ color: 'var(--c-text)' }}>
              صفحات إضافية
            </div>
            <div className="space-y-0.5 pb-2">
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
