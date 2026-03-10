import { useState } from 'react';
import { Icons } from './Icons';
import { formatHoursMins } from '../utils/helpers';
import { getRemainingDays } from '../utils/constants';

export default function Sidebar({
  currentView,
  onNavigate,
  streak,
  todayStudiedSeconds,
  isTimerRunning,
  activeSubject,
}) {
  const remainingDays = getRemainingDays();

  const navItems = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: <Icons.Home />, desc: 'نظرة عامة' },
    { id: 'timer', label: 'المؤقت', icon: <Icons.Timer />, desc: 'بومودورو' },
  ];

  return (
    <>
      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside className="hidden md:flex flex-col w-[270px] bg-[#09090b] text-white shrink-0 relative z-30 border-l border-zinc-800/60">
        
        {/* Decorative glow */}
        <div className="absolute top-24 right-0 w-48 h-48 bg-violet-600/[0.04] rounded-full blur-[100px] pointer-events-none" />

        {/* Logo */}
        <div className="p-6 pb-3">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
              <span className="text-white font-black text-base">A</span>
            </div>
            <div>
              <h1 className="text-[15px] font-bold tracking-tight text-white">Apex Tracker</h1>
              <p className="text-[11px] font-medium text-zinc-500 mt-0.5">غرفة عمليات يحيى</p>
            </div>
          </div>
        </div>

        {/* Countdown */}
        <div className="mx-4 my-3 p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-amber-500/10 rounded-xl text-amber-500">
              <Icons.Target />
            </div>
            <div>
              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">العد التنازلي للامتحان</div>
              <div className="text-lg font-black text-white mt-0.5 tabular-nums">
                {remainingDays} <span className="text-xs font-semibold text-zinc-500">يوم متبقي</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 mt-3 flex-1">
          <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-3 mb-3">التنقل</div>
          <div className="space-y-1">
            {navItems.map(item => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${
                    isActive
                      ? 'bg-violet-600/10 text-white'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                  }`}
                >
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-violet-500 rounded-l-full" />
                  )}
                  <div className={`transition-colors ${isActive ? 'text-violet-400' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                    {item.icon}
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${isActive ? 'text-white' : ''}`}>{item.label}</div>
                    <div className="text-[10px] text-zinc-600">{item.desc}</div>
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
                <div className="text-sm font-bold text-white truncate">{activeSubject}</div>
              </div>
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            </button>
          </div>
        )}

        {/* Bottom Stats */}
        <div className="p-3 border-t border-zinc-800/60 space-y-2 mt-auto">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/50">
            <div className="p-2 bg-orange-500/10 rounded-xl text-orange-400">
              <Icons.Fire />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">الاستمرارية</div>
              <div className="text-base font-bold text-white tabular-nums">
                {streak} <span className="text-xs font-medium text-zinc-500">{streak === 1 ? 'يوم' : 'أيام'}</span>
              </div>
            </div>
            {streak >= 3 && <span className="text-lg">🔥</span>}
          </div>

          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-zinc-900/50">
            <div className="p-2 bg-violet-500/10 rounded-xl text-violet-400">
              <Icons.Activity />
            </div>
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">إنجاز اليوم</div>
              <div className="text-base font-bold text-white tabular-nums">
                {todayStudiedSeconds === 0 ? '0m' : formatHoursMins(todayStudiedSeconds)}
              </div>
            </div>
            {todayStudiedSeconds >= 3600 && <span className="text-lg">⚡</span>}
          </div>
        </div>
      </aside>

      {/* ===== MOBILE TOP BAR ===== */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-xl border-b border-zinc-800/60 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-violet-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <span className="text-white font-black text-sm">A</span>
          </div>
          <div className="text-sm font-bold text-white">Apex Tracker</div>
        </div>
        <div className="flex items-center gap-2">
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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/95 backdrop-blur-xl border-t border-zinc-800/60">
        <div className="flex">
          {navItems.map(item => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-all relative ${
                  isActive ? 'text-violet-400' : 'text-zinc-500'
                }`}
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
