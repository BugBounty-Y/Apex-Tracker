export default function StudyTimeCard({ todayStudiedSeconds, dailyGoalHours, onEditGoal }) {
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
    <div className="relative overflow-hidden bg-zinc-900/50 rounded-2xl p-6 text-white flex flex-col h-full font-sans border border-zinc-800/60 group transition-all duration-300 hover:border-zinc-700/80">
      {/* Subtle gradient overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-violet-600/[0.03] to-transparent pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 flex justify-between items-center mb-5">
        <div className="flex items-center gap-2.5">
          <div className="text-violet-400 p-2 bg-violet-500/10 rounded-xl">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h3 className="font-bold text-base leading-none tracking-tight">
            وقت الدراسة <span className="font-normal text-zinc-500">اليوم</span>
          </h3>
        </div>
        <button onClick={onEditGoal} className="text-zinc-600 hover:text-zinc-300 transition-colors bg-zinc-800/50 hover:bg-zinc-800 p-2 rounded-xl" aria-label="تعديل الهدف اليومي">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle>
          </svg>
        </button>
      </div>

      {/* Main Stats Area */}
      <div className="relative z-10 flex items-center justify-between mt-auto mb-3">
        <div>
          <div className="text-4xl font-bold tracking-tighter mb-1 select-none flex items-baseline gap-1" dir="ltr">
            {h > 0 && <span>{h}<span className="text-lg font-normal ml-0.5 text-zinc-500">h</span></span>}
            <span>{m}<span className="text-lg font-normal ml-0.5 text-zinc-500">m</span></span>
          </div>
          <div className="text-sm font-medium text-zinc-500 mt-1.5">
            الهدف: {dailyGoalHours} ساعات
          </div>
        </div>

        <div className="relative flex items-center justify-center shrink-0">
          <svg width="78" height="78" className="transform -rotate-90">
            <circle cx="39" cy="39" r={radius} fill="none" stroke="#27272a" strokeWidth="5" />
            <circle
              cx="39" cy="39" r={radius} fill="none" stroke="#8b5cf6" strokeWidth="5" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute text-sm font-bold tabular-nums text-zinc-200">{Math.min(100, Math.round(percent))}%</div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center gap-2 mt-2 pt-4 border-t border-zinc-800/60 text-sm font-medium text-zinc-400">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400 shrink-0">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
        {remainSec > 0 ? (
          <span>متبقي <span className="font-bold text-zinc-200" dir="ltr">{remainH > 0 ? `${remainH}h ` : ''}{remainM}m</span> للوصول للهدف</span>
        ) : (
          <span className="text-emerald-400 font-semibold">تم إنجاز الهدف! عمل رائع!</span>
        )}
      </div>
    </div>
  );
}
