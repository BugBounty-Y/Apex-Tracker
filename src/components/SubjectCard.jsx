import { Icons } from './Icons';
import { formatHoursMins } from '../utils/helpers';
import { getColorTheme, getRemainingDays } from '../utils/constants';

export default function SubjectCard({ name, data, isActive, isTimerRunning, onSubjectClick, onEdit }) {
  const goalSec = Math.max(1, data.goalHours * 3600);
  const remainSec = Math.max(0, goalSec - data.studiedSeconds);
  const progPercent = Math.min(100, (data.studiedSeconds / goalSec) * 100);

  const remainingDays = getRemainingDays();
  const dailySec = remainSec / remainingDays;
  const dReqH = Math.floor(dailySec / 3600);
  const dReqM = Math.floor((dailySec % 3600) / 60);

  const theme = getColorTheme(data.color);
  const isCompleted = progPercent >= 100;

  return (
    <div
      onClick={() => onSubjectClick(name)}
      className={`cursor-pointer rounded-2xl p-5 transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${
        isActive
          ? 'bg-zinc-800/80 text-white ring-1 ring-violet-500/60 shadow-lg shadow-violet-500/5'
          : 'bg-zinc-900/50 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-900/80 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/20'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${progPercent.toFixed(0)}% مكتمل`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubjectClick(name); }}}
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-4 z-10 relative">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <div className={`w-1.5 h-7 rounded-full shrink-0 ${isActive ? 'bg-violet-400' : theme.fill} ${isActive && isTimerRunning ? 'animate-pulse' : ''}`} />
          <h3 className="font-semibold text-[14px] leading-tight truncate text-white">{name}</h3>
        </div>
        <button
          onClick={(e) => onEdit(name, e)}
          className={`p-1.5 rounded-lg transition-all duration-200 shrink-0 z-30 ${
            isActive
              ? 'bg-white/10 text-white hover:bg-white/15'
              : 'bg-transparent text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300'
          }`}
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
            <div className="text-[10px] font-medium mb-0.5 uppercase tracking-wider text-zinc-500">المنجز / الهدف</div>
            <div className="font-semibold text-base tracking-tight text-zinc-200">
              {formatHoursMins(data.studiedSeconds)} <span className="text-xs font-normal text-zinc-500">/ {data.goalHours}h</span>
            </div>
          </div>
          <div className={`text-lg font-bold tracking-tighter ${
            isCompleted ? 'text-emerald-400' : 'text-violet-400'
          }`}>
            {progPercent.toFixed(1)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full overflow-hidden bg-zinc-800">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${
              isCompleted
                ? 'bg-emerald-400'
                : 'bg-gradient-to-l from-violet-500 to-violet-400'
            }`}
            style={{ width: `${progPercent}%` }}
            role="progressbar"
            aria-valuenow={progPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <Icons.Wrench />
            <span className="font-medium">يومياً:</span>
            <span className="font-semibold text-zinc-300">
              {isCompleted ? '✅' : `${dReqH}h ${dReqM}m`}
            </span>
          </div>
          <div className={`text-[11px] font-semibold transition-all duration-200 ${
            isActive
              ? 'text-violet-400'
              : 'text-zinc-600 group-hover:text-violet-400'
          }`}>
            {isActive ? '⏱️ نشط' : 'ابدأ ←'}
          </div>
        </div>
      </div>
    </div>
  );
}
