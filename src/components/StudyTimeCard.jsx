import { useTheme } from '../contexts/ThemeContext';

export default function StudyTimeCard({ todayStudiedSeconds, dailyGoalHours, onEditGoal }) {
  const { isDark } = useTheme();
  const goalSec = dailyGoalHours * 3600;
  const h = Math.floor(todayStudiedSeconds / 3600);
  const m = Math.floor((todayStudiedSeconds % 3600) / 60);

  const percent = Math.min(100, (todayStudiedSeconds / goalSec) * 100);
  const isGoalMet = percent >= 100;

  const remainSec = Math.max(0, goalSec - todayStudiedSeconds);
  const remainH = Math.floor(remainSec / 3600);
  const remainM = Math.floor((remainSec % 3600) / 60);

  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (percent / 100) * circumference);

  // Dynamic accent based on progress
  const getAccentColor = () => {
    if (percent >= 100) return { main: '#10b981', glow: 'rgba(16,185,129,', light: '#d1fae5', gradStart: '#10b981', gradEnd: '#34d399' };
    if (percent >= 60) return { main: '#8b5cf6', glow: 'rgba(139,92,246,', light: '#ede9fe', gradStart: '#8b5cf6', gradEnd: '#a78bfa' };
    return { main: '#8b5cf6', glow: 'rgba(139,92,246,', light: '#ede9fe', gradStart: '#8b5cf6', gradEnd: '#c4b5fd' };
  };
  const accent = getAccentColor();

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 flex flex-col h-full font-sans border group transition-all duration-300"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      {/* Animated background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-[80px] pointer-events-none transition-all duration-1000"
        style={{ backgroundColor: `${accent.glow}${isDark ? '0.06' : '0.08'})` }}
      />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-[60px] pointer-events-none"
        style={{ backgroundColor: isDark ? 'rgba(6,182,212,0.04)' : 'rgba(6,182,212,0.06)' }}
      />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-xl transition-colors" style={{ backgroundColor: `${accent.glow}0.1)`, color: accent.main }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--c-text)' }}>
            وقت الدراسة <span className="font-normal" style={{ color: 'var(--c-text-muted)' }}>اليوم</span>
          </h3>
        </div>
        <button onClick={onEditGoal} className="transition-all p-2 rounded-xl hover:scale-105 active:scale-95"
          style={{ color: 'var(--c-text-faint)', backgroundColor: 'var(--c-elevated)' }}
          aria-label="تعديل الهدف اليومي"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>

      {/* Main Stats Area */}
      <div className="relative z-10 flex items-center justify-between mt-auto mb-3">
        <div>
          <div className="text-4xl font-black tracking-tighter mb-1 select-none flex items-baseline gap-0.5" dir="ltr" style={{ color: 'var(--c-text)' }}>
            {h > 0 && <span>{h}<span className="text-lg font-medium ml-0.5" style={{ color: 'var(--c-text-faint)' }}>h</span></span>}
            <span>{m}<span className="text-lg font-medium ml-0.5" style={{ color: 'var(--c-text-faint)' }}>m</span></span>
          </div>
          <div className="text-sm font-medium mt-2" style={{ color: 'var(--c-text-muted)' }}>
            الهدف: {dailyGoalHours} {dailyGoalHours === 1 ? 'ساعة' : 'ساعات'}
          </div>
        </div>

        {/* Ring progress */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg width="86" height="86" viewBox="0 0 86 86" className="transform -rotate-90">
            <circle cx="43" cy="43" r={radius} fill="none" stroke={isDark ? '#27272a' : '#e4e4e7'} strokeWidth="5.5" />
            <circle
              cx="43" cy="43" r={radius} fill="none" strokeWidth="5.5" strokeLinecap="round"
              stroke={`url(#studyRingGrad)`}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
              style={{ filter: isGoalMet ? `drop-shadow(0 0 6px ${accent.main})` : 'none' }}
            />
            <defs>
              <linearGradient id="studyRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={accent.gradStart} />
                <stop offset="100%" stopColor={accent.gradEnd} />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className="text-base font-bold tabular-nums" style={{ color: accent.main }}>{Math.min(100, Math.round(percent))}%</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-2 mt-2 pt-4 border-t text-sm font-medium"
        style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
      >
        {isGoalMet ? (
          <>
            <span className="text-emerald-500 text-base">✨</span>
            <span className="text-emerald-500 font-semibold">تم إنجاز الهدف! عمل رائع!</span>
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" style={{ color: accent.main }}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>متبقي <span className="font-bold" dir="ltr" style={{ color: 'var(--c-text)' }}>{remainH > 0 ? `${remainH}h ` : ''}{remainM}m</span> للوصول للهدف</span>
          </>
        )}
      </div>
    </div>
  );
}
