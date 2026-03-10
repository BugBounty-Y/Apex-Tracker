import { Icons } from './Icons';
import { formatHoursMins } from '../utils/helpers';
import { getColorTheme, getRemainingDays } from '../utils/constants';

/**
 * SubjectCard — individual subject card for the dashboard grid.
 *
 * Fixes from original:
 * - Uses pre-built Tailwind classes from theme lookup (no dynamic string construction)
 * - Uses dynamic remaining days instead of static TOTAL_DAYS
 * - Safe division (avoids goalSec = 0)
 */
export default function SubjectCard({ name, data, isActive, isTimerRunning, onSubjectClick, onEdit }) {
  const goalSec = Math.max(1, data.goalHours * 3600); // prevent division by zero
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
      className={`cursor-pointer bg-white rounded-[1.5rem] p-5 border-2 transition-all duration-300 group flex flex-col h-full relative overflow-hidden ${
        isActive
          ? `${theme.border} shadow-lg ${theme.shadow} scale-[1.02] ring-4 ${theme.ring} ${theme.light}`
          : `border-slate-100 ${theme.hoverBorder} hover:shadow-xl hover:-translate-y-1`
      }`}
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${progPercent.toFixed(0)}% مكتمل`}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSubjectClick(name); }}}
    >
      {/* Glow effect */}
      <div className={`absolute -top-12 -left-12 w-32 h-32 rounded-full blur-3xl pointer-events-none transition-transform group-hover:scale-150 duration-700 ${theme.glow}`} />
      
      {/* Arrow indicator */}
      <div className="absolute top-4 left-4 p-2 rounded-full bg-slate-900 text-white opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-2 group-hover:translate-x-0 shadow-lg z-20">
        <Icons.ArrowRight />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div className="flex items-center gap-3 w-5/6">
          <div className={`w-1.5 h-10 rounded-full ${theme.fill} shadow-sm ${isActive && isTimerRunning ? 'animate-pulse' : ''}`} />
          <h3 className={`font-black text-lg leading-tight transition-colors ${isActive ? theme.text : `text-slate-800 ${theme.groupHoverText}`}`}>{name}</h3>
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button
            onClick={(e) => onEdit(name, e)}
            className={`p-2 rounded-xl transition-all duration-200 ${isActive ? `bg-white ${theme.text} shadow-sm` : `bg-slate-50 text-slate-400 ${theme.hoverLight} ${theme.hoverText}`}`}
            title="تعديل الإعدادات"
            aria-label={`تعديل ${name}`}
          >
            <Icons.Edit />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-auto z-10 relative">
        <div className="flex justify-between items-end mb-3">
          <div>
            <div className="text-[10px] text-slate-400 font-black mb-1 uppercase tracking-wider">المنجز / الهدف</div>
            <div className="font-black text-slate-900 text-xl tracking-tight">
              {formatHoursMins(data.studiedSeconds)} <span className="text-sm font-bold text-slate-400">/ {data.goalHours}h</span>
            </div>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-black mb-1 tracking-tighter ${isCompleted ? 'text-emerald-500' : theme.text}`}>
              {progPercent.toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-3.5 bg-slate-100 rounded-full mb-5 overflow-hidden shadow-inner relative">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isCompleted ? 'bg-emerald-500' : theme.fill}`}
            style={{ width: `${progPercent}%` }}
            role="progressbar"
            aria-valuenow={progPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className="absolute top-0 left-0 w-full h-full bg-white/20 animate-pulse-glow" />
          </div>
        </div>

        {/* Daily requirement */}
        <div className={`flex items-start gap-3 p-3.5 rounded-xl border-r-4 transition-colors ${
          isActive
            ? `bg-white ${theme.border} shadow-sm`
            : `${theme.light} border-transparent ${theme.groupHoverBorder}`
        }`}>
          <div className={`mt-0.5 ${isActive ? theme.icon : `text-slate-400 ${theme.groupHoverIcon}`}`}>
            <Icons.Wrench />
          </div>
          <div className="flex flex-col">
            <span className={`text-[11px] font-bold mb-0.5 ${isActive ? 'text-slate-600' : 'text-slate-500'}`}>الجرعة اليومية للإنهاء:</span>
            <strong className={`text-base font-black ${isActive ? theme.text : 'text-slate-800'}`}>
              {isCompleted ? '✅ مكتمل' : `${dReqH}h ${dReqM}m`}
            </strong>
          </div>
        </div>
      </div>
    </div>
  );
}
