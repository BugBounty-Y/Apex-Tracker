import { Icons } from './Icons';
import { formatTime, formatHoursMins } from '../utils/helpers';

/**
 * TimerView — Immersive full-screen Pomodoro timer.
 *
 * Fixes from original:
 * - Uses CSS gradient background instead of external Unsplash image
 * - Proper accessibility: aria-labels, roles, keyboard support
 * - Shows visual notification when timer completes
 */
export default function TimerView({
  activeSubject,
  studiedSeconds,
  timer,
  onClose,
}) {
  const { timerMode, timeLeft, isRunning, timerComplete, toggleTimer, resetTimer, changeMode, timerTheme, ringCircumference, ringOffset } = timer;

  return (
    <div dir="rtl" className="h-screen w-screen bg-[#0f172a] text-slate-200 font-sans flex flex-col relative overflow-hidden">
      {/* Gradient background instead of external image dependency */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-[#0c1425] to-[#0a1628]" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/15 rounded-full blur-[120px]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-slate-950/90 pointer-events-none" />

      <button
        onClick={onClose}
        aria-label="العودة للوحة التحكم"
        className="absolute top-4 right-4 md:top-8 md:right-8 z-50 w-12 h-12 flex items-center justify-center bg-slate-900/40 hover:bg-slate-800 backdrop-blur-md rounded-full text-slate-400 hover:text-white transition-all border border-slate-700/50 shadow-lg"
      >
        <Icons.X />
      </button>

      {/* Timer Complete Banner */}
      {timerComplete && (
        <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-600 to-teal-500 text-white text-center py-4 px-6 font-bold text-base animate-fade-in flex items-center justify-center gap-3">
          <Icons.Bell />
          {timerMode === 'focus' ? '🎉 أحسنت! انتهت جلسة التركيز' : '☕ انتهت فترة الراحة — عد للدراسة!'}
        </div>
      )}

      <div className="relative z-10 flex flex-col-reverse md:flex-row h-full p-4 md:p-8 items-center justify-center gap-6 md:gap-16 w-full max-w-7xl mx-auto overflow-y-auto overflow-x-hidden md:overflow-hidden">
        {/* Controls Sidebar */}
        <div className="w-full max-w-sm md:w-80 flex flex-col gap-4 md:gap-6 shrink-0 pb-8 md:pb-0">
          <div className="flex flex-col gap-3" role="radiogroup" aria-label="وضع المؤقت">
            {[
              { mode: 'focus', label: 'جلسة تركيز', desc: '25 دقيقة دراسة', icon: <Icons.Book />, activeColor: 'border-blue-500/50 shadow-blue-500/10', activeBg: 'bg-blue-500/20 text-blue-400', dotColor: 'bg-blue-500' },
              { mode: 'shortBreak', label: 'راحة قصيرة', desc: '5 دقائق شحن', icon: <Icons.Coffee />, activeColor: 'border-emerald-500/50 shadow-emerald-500/10', activeBg: 'bg-emerald-500/20 text-emerald-400', dotColor: 'bg-emerald-500' },
              { mode: 'longBreak', label: 'راحة طويلة', desc: '15 دقيقة فصل', icon: <Icons.Coffee />, activeColor: 'border-purple-500/50 shadow-purple-500/10', activeBg: 'bg-purple-500/20 text-purple-400', dotColor: 'bg-purple-500' },
            ].map(({ mode, label, desc, icon, activeColor, activeBg, dotColor }) => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                role="radio"
                aria-checked={timerMode === mode}
                aria-label={label}
                className={`p-3.5 md:p-4 rounded-2xl flex items-center justify-between border transition-all ${timerMode === mode ? `bg-slate-800/80 ${activeColor} shadow-lg` : 'bg-slate-900/40 border-slate-800/50 hover:bg-slate-800/60'}`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${timerMode === mode ? activeBg : 'bg-slate-800 text-slate-400'}`}>{icon}</div>
                  <div className="text-right">
                    <div className={`text-sm font-bold ${timerMode === mode ? 'text-white' : 'text-slate-300'}`}>{label}</div>
                    <div className="text-[11px] text-slate-500">{desc}</div>
                  </div>
                </div>
                {timerMode === mode && <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />}
              </button>
            ))}
          </div>

          {/* Active Subject Info */}
          {activeSubject && (
            <div className="mt-2 md:mt-4 p-4 md:p-5 bg-slate-900/60 backdrop-blur-sm border border-slate-800 rounded-2xl">
              <div className="text-[11px] font-bold text-slate-500 mb-1 uppercase tracking-wider">يدرس الآن</div>
              <div className="flex items-center justify-between">
                <div className="font-black text-white text-base md:text-lg">{activeSubject}</div>
                <div className="px-2 py-1 bg-slate-800 rounded text-xs font-bold text-slate-400">{formatHoursMins(studiedSeconds)}</div>
              </div>
            </div>
          )}
        </div>

        {/* Central Timer */}
        <div className="flex-1 flex flex-col items-center justify-center relative w-full max-w-xl mt-8 md:mt-0">
          <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-700/50 rounded-[2rem] p-6 md:p-10 shadow-2xl flex flex-col items-center relative z-10 w-full max-w-[400px] mx-auto">
            <div className="relative flex items-center justify-center mb-6 md:mb-8">
              <svg className="w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 transform -rotate-90 drop-shadow-2xl" viewBox="0 0 100 100" aria-hidden="true">
                <circle cx="50" cy="50" r="46" fill="none" className="stroke-slate-800/60" strokeWidth="2" />
                <circle cx="50" cy="50" r="46" fill="none" className={`${timerTheme.stroke} transition-all duration-1000 ease-linear`} strokeWidth="3.5" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} />
              </svg>
              <div className="absolute flex flex-col items-center justify-center" role="timer" aria-live="polite" aria-label={`الوقت المتبقي: ${formatTime(timeLeft)}`}>
                <div
                  className={`text-[3.5rem] sm:text-[4.5rem] lg:text-[5rem] font-black tracking-tighter tabular-nums leading-none bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400 ${isRunning ? 'animate-pulse' : ''}`}
                >
                  {formatTime(timeLeft)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 md:gap-5 w-full justify-center">
              <button
                onClick={resetTimer}
                aria-label="إعادة تعيين المؤقت"
                className="w-12 h-12 md:w-14 md:h-14 shrink-0 flex items-center justify-center rounded-xl bg-slate-800/80 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700 transition-all hover:-rotate-180 duration-500"
              >
                <Icons.RotateCcw />
              </button>
              <button
                onClick={toggleTimer}
                aria-label={isRunning ? 'إيقاف المؤقت' : 'بدء المؤقت'}
                className={`px-6 py-3.5 md:px-8 md:py-4 flex-1 max-w-[180px] flex items-center justify-center gap-2 md:gap-3 rounded-full text-white text-sm md:text-base font-bold transition-all duration-300 hover:scale-105 active:scale-95 border-b-4 ${isRunning ? 'bg-slate-800 border-slate-900 hover:bg-slate-700 text-red-400 shadow-xl' : `${timerTheme.bg} border-black/20 ${timerTheme.glow} shadow-lg`}`}
              >
                {isRunning ? <Icons.Pause /> : <Icons.Play />} {isRunning ? 'إيقاف' : 'بدء التركيز'}
              </button>
            </div>
          </div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] md:w-[350px] md:h-[350px] bg-gradient-to-br ${timerTheme.from} ${timerTheme.to} opacity-[0.07] blur-[80px] md:blur-[100px] pointer-events-none rounded-full transition-colors duration-1000 z-0`} />
        </div>
      </div>
    </div>
  );
}
