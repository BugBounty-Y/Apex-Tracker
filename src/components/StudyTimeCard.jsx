import { useTheme } from '../contexts/ThemeContext';

export default function StudyTimeCard({ todayStudiedSeconds, dailyGoalHours, onEditGoal }) {
  const { isDark } = useTheme();
  const goalSec = dailyGoalHours * 3600;
  const h = Math.floor(todayStudiedSeconds / 3600);
  const m = Math.floor((todayStudiedSeconds % 3600) / 60);

  const percent = Math.min(100, (todayStudiedSeconds / goalSec) * 100);

  const remainSec = Math.max(0, goalSec - todayStudiedSeconds);
  const remainH = Math.floor(remainSec / 3600);
  const remainM = Math.floor((remainSec % 3600) / 60);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = Math.max(0, circumference - (percent / 100) * circumference);

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 flex flex-col h-full font-sans border group transition-all duration-300"
      style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
    >
      {/* Subtle gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%] pointer-events-none" style={{ background: `linear-gradient(to top, ${isDark ? 'rgba(139,92,246,0.03)' : 'rgba(139,92,246,0.04)'}, transparent)` }} />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-violet-500 p-2 bg-violet-500/10 rounded-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="font-bold text-base leading-none tracking-tight" style={{ color: 'var(--c-text)' }}>
            وقت الدراسة <span className="font-normal" style={{ color: 'var(--c-text-muted)' }}>اليوم</span>
          </h3>
        </div>
        <button onClick={onEditGoal} className="transition-colors p-2 rounded-xl"
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
          <div className="text-4xl font-bold tracking-tighter mb-1 select-none flex items-baseline gap-1" dir="ltr" style={{ color: 'var(--c-text)' }}>
            {h > 0 && <span>{h}<span className="text-lg font-normal ml-0.5" style={{ color: 'var(--c-text-faint)' }}>h</span></span>}
            <span>{m}<span className="text-lg font-normal ml-0.5" style={{ color: 'var(--c-text-faint)' }}>m</span></span>
          </div>
          <div className="text-sm font-medium mt-1.5" style={{ color: 'var(--c-text-muted)' }}>
            الهدف: {dailyGoalHours} ساعات
          </div>
        </div>

        <div className="relative flex items-center justify-center shrink-0">
          <svg width="78" height="78" className="transform -rotate-90">
            <circle cx="39" cy="39" r={radius} fill="none" stroke={isDark ? '#27272a' : '#e4e4e7'} strokeWidth="5" />
            <circle
              cx="39" cy="39" r={radius} fill="none" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute text-sm font-bold tabular-nums" style={{ color: 'var(--c-text-sub)' }}>{Math.min(100, Math.round(percent))}%</div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-2 mt-2 pt-4 border-t text-sm font-medium"
        style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-500 shrink-0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        {remainSec > 0 ? (
          <span>متبقي <span className="font-bold" dir="ltr" style={{ color: 'var(--c-text)' }}>{remainH > 0 ? `${remainH}h ` : ''}{remainM}m</span> للوصول للهدف</span>
        ) : (
          <span className="text-emerald-500 font-semibold">تم إنجاز الهدف! عمل رائع!</span>
        )}
      </div>
    </div>
  );
}
