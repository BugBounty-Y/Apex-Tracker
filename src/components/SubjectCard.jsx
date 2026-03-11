import { Icons } from './Icons';
import { formatHoursMins } from '../utils/helpers';
import { getColorTheme, getRemainingDays } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';

export default function SubjectCard({ name, data, isActive, isTimerRunning, onSubjectClick, onEdit, userProfile }) {
  const { isDark } = useTheme();
  const goalSec = Math.max(1, data.goalHours * 3600);
  const remainSec = Math.max(0, goalSec - data.studiedSeconds);
  const progPercent = Math.min(100, (data.studiedSeconds / goalSec) * 100);

  const remainingDays = getRemainingDays(userProfile?.examDate);
  const safeDays = Math.max(1, remainingDays);
  const dailySec = remainSec / safeDays;
  const dReqH = Math.floor(dailySec / 3600);
  const dReqM = Math.floor((dailySec % 3600) / 60);

  const theme = getColorTheme(data.color);
  const isCompleted = progPercent >= 100;

  return (
    <div
      onClick={() => onSubjectClick(name)}
      className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden border ${
        isActive ? 'ring-1 ring-violet-500/60 shadow-lg shadow-violet-500/5' : 'hover:-translate-y-0.5 hover:shadow-xl'
      }`}
      style={{
        backgroundColor: isActive
          ? (isDark ? 'rgba(39,39,42,0.6)' : 'rgba(139,92,246,0.06)')
          : 'var(--c-surface)',
        borderColor: isActive ? 'rgba(139,92,246,0.3)' : 'var(--c-border)',
      }}
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${progPercent.toFixed(0)}% مكتمل`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubjectClick(name); }}}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-1.5 h-7 rounded-full shrink-0 ${isActive ? 'bg-violet-400' : theme.fill} ${isActive && isTimerRunning ? 'animate-pulse' : ''}`} />
          <h3 className="font-semibold text-[14px] leading-tight truncate" style={{ color: 'var(--c-text)' }}>{name}</h3>
        </div>
        <button
          onClick={(e) => onEdit(name, e)}
          className="p-1.5 rounded-lg transition-all duration-200 shrink-0 z-30"
          style={{
            backgroundColor: isActive ? 'rgba(255,255,255,0.1)' : 'transparent',
            color: 'var(--c-text-muted)',
          }}
          title="تعديل الإعدادات"
          aria-label={`تعديل ${name}`}
        >
          <Icons.Edit />
        </button>
      </div>

      {/* Stats Row */}
      <div className="mt-auto z-10 relative space-y-3">
        <div className="flex justify-between items-end">
          <div>
            <div className="text-[10px] font-medium mb-0.5 uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>المنجز / الهدف</div>
            <div className="font-semibold text-base tracking-tight" style={{ color: 'var(--c-text-sub)' }}>
              {formatHoursMins(data.studiedSeconds)} <span className="text-xs font-normal" style={{ color: 'var(--c-text-faint)' }}>/ {data.goalHours}h</span>
            </div>
          </div>
          <div className={`text-lg font-bold tracking-tighter ${isCompleted ? 'text-emerald-500' : 'text-violet-500'}`}>
            {progPercent.toFixed(1)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#27272a' : '#e4e4e7' }}>
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${isCompleted ? 'bg-emerald-400' : 'bg-gradient-to-l from-violet-500 to-violet-400'}`}
            style={{ width: `${progPercent}%` }}
            role="progressbar"
            aria-valuenow={progPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--c-text-muted)' }}>
            <Icons.Target />
            <span className="font-medium">يومياً:</span>
            <span className="font-semibold" style={{ color: 'var(--c-text-sub)' }}>
              {isCompleted ? '✅' : remainingDays <= 0 ? '⏰' : `${dReqH}h ${dReqM}m`}
            </span>
          </div>
          <div className={`text-[11px] font-semibold transition-all duration-200 ${isActive ? 'text-violet-500' : ''}`}
            style={{ color: isActive ? undefined : 'var(--c-text-faint)' }}
          >
            {isActive ? '⏱️ نشط' : 'ابدأ ←'}
          </div>
        </div>
      </div>
    </div>
  );
}
