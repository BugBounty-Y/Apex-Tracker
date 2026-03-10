import { useState } from 'react';
import { Icons } from './Icons';
import { formatHoursMins } from '../utils/helpers';
import { getRemainingDays } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

export default function Sidebar({
  currentView,
  onNavigate,
  streak,
  todayStudiedSeconds,
  isTimerRunning,
  activeSubject,
  userProfile,
}) {
  const { isDark, toggleTheme } = useTheme();
  const remainingDays = getRemainingDays(userProfile?.examDate);

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <Icons.Home />, desc: 'نظرة عامة' },
    { id: 'timer', label: 'المؤقت', icon: <Icons.Timer />, desc: 'بومودورو' },
    { id: 'settings', label: 'الإعدادات', icon: <Icons.Settings />, desc: 'إعدادات الحساب' },
  ];

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-[270px] shrink-0 relative z-30 border-l"
        style={{ backgroundColor: 'var(--c-bg)', borderColor: 'var(--c-border)' }}
      >
        {/* Decorative glow */}
        <div className="absolute top-24 right-0 w-48 h-48 rounded-full blur-[100px] pointer-events-none"
          style={{ backgroundColor: 'var(--c-glow-violet)' }}
        />

        {/* Logo + Theme Toggle */}
        <div className="p-6 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
                <span className="text-white font-black text-base">A</span>
              </div>
              <div>
                <h1 className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--c-text)' }}>Apex Tracker</h1>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: 'var(--c-text-faint)' }}>غرفة عمليات {userProfile?.name || 'يحيى'}</p>
              </div>
            </div>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
              className="p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95"
              style={{
                backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(250,204,21,0.12)',
                color: isDark ? '#a78bfa' : '#eab308',
              }}
            >
              {isDark ? <Icons.Sun /> : <Icons.Moon />}
            </button>
          </div>
        </div>

        {/* Countdown */}
        <div className="mx-4 my-3 p-3.5 rounded-2xl border"
          style={{ backgroundColor: isDark ? 'rgba(24,24,27,0.8)' : 'rgba(245,158,11,0.06)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Icons.Target />
            </div>
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>العد التنازلي للامتحان</div>
              <div className="text-lg font-black mt-0.5 tabular-nums" style={{ color: 'var(--c-text)' }}>
                {remainingDays} <span className="text-xs font-semibold" style={{ color: 'var(--c-text-faint)' }}>يوم متبقي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-3 flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'var(--c-text-faint)' }}>التنقل</div>
          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative`}
                  style={{
                    backgroundColor: isActive ? 'var(--c-sidebar-active)' : 'transparent',
                    color: isActive ? 'var(--c-text)' : 'var(--c-text-muted)',
                  }}
                >
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-violet-500 rounded-l-full" />
                  )}
                  <div style={{ color: isActive ? 'var(--c-nav-active)' : 'var(--c-text-faint)' }}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: isActive ? 'var(--c-text)' : undefined }}>{item.label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--c-text-faint)' }}>{item.desc}</div>
                  </div>
                  {item.id === 'timer' && isTimerRunning && (
                    <div className="mr-auto w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Active timer indicator */}
        {isTimerRunning && activeSubject && (
          <div className="mx-3 mb-3">
            <button
              onClick={() => onNavigate('timer')}
              className="w-full p-3 rounded-2xl bg-emerald-500/8 border border-emerald-500/15 flex items-center gap-3 hover:bg-emerald-500/12 transition-all group"
            >
              <div className="p-2 bg-emerald-500/15 rounded-xl text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                <Icons.PlaySmall />
              </div>
              <div className="text-right flex-1 min-w-0">
                <div className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">يعمل الآن</div>
                <div className="text-sm font-bold truncate" style={{ color: 'var(--c-text)' }}>{activeSubject}</div>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </button>
          </div>
        )}

        {/* Bottom Stats */}
        <div className="p-3 border-t space-y-2 mt-auto" style={{ borderColor: 'var(--c-border)' }}>
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--c-elevated)' }}>
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
              <Icons.Fire />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>الاستمرارية</div>
              <div className="text-base font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>
                {streak} <span className="text-xs font-medium" style={{ color: 'var(--c-text-faint)' }}>{streak === 1 ? 'يوم' : 'أيام'}</span>
              </div>
            </div>
            {streak >= 3 && <span className="text-lg">🔥</span>}
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl" style={{ backgroundColor: 'var(--c-elevated)' }}>
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Icons.Activity />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>إنجاز اليوم</div>
              <div className="text-base font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>
                {todayStudiedSeconds === 0 ? '0m' : formatHoursMins(todayStudiedSeconds)}
              </div>
            </div>
            {todayStudiedSeconds >= 3600 && <span className="text-lg">⚡</span>}
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 backdrop-blur-xl border-b px-4 py-3 flex items-center justify-between"
        style={{ backgroundColor: isDark ? 'rgba(9,9,11,0.95)' : 'rgba(245,245,247,0.95)', borderColor: 'var(--c-border)' }}
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div className="text-sm font-bold" style={{ color: 'var(--c-text)' }}>Apex Tracker</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            aria-label={isDark ? 'تفعيل الوضع الفاتح' : 'تفعيل الوضع الداكن'}
            className="p-1.5 rounded-lg transition-all"
            style={{
              backgroundColor: isDark ? 'rgba(139,92,246,0.1)' : 'rgba(250,204,21,0.12)',
              color: isDark ? '#a78bfa' : '#eab308',
            }}
          >
            {isDark ? <Icons.Sun /> : <Icons.Moon />}
          </button>
          {isTimerRunning && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg border border-emerald-500/15">
              <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400">يعمل</span>
            </div>
          )}
          <div className="flex items-center gap-1 px-2.5 py-1 bg-orange-500/8 rounded-lg">
            <span className="text-xs">🔥</span>
            <span className="text-xs font-bold text-orange-400">{streak}</span>
          </div>
        </div>
      </div>

      {/* ===== MOBILE BOTTOM NAV ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl border-t"
        style={{ backgroundColor: isDark ? 'rgba(9,9,11,0.95)' : 'rgba(245,245,247,0.95)', borderColor: 'var(--c-border)' }}
      >
        <div className="flex">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative`}
                style={{ color: isActive ? 'var(--c-nav-active)' : 'var(--c-text-faint)' }}
              >
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-violet-500 rounded-b-full" />
                )}
                {item.icon}
                <span className="text-[10px] font-bold">{item.label}</span>
                {item.id === 'timer' && isTimerRunning && (
                  <div className="absolute top-2 right-1/4 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
