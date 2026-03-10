import { useState } from 'react';
import { Icons } from './Icons';
import { formatTime, formatHoursMins } from '../utils/helpers';
import { getColorTheme } from '../utils/constants';

export default function TimerPage({
  subjects,
  activeSubject,
  onSelectSubject,
  timer,
}) {
  const [selectorOpen, setSelectorOpen] = useState(false);
  const { timerMode, timeLeft, isRunning, timerComplete, toggleTimer, resetTimer, changeMode, timerTheme, ringCircumference, ringOffset } = timer;
  const studiedSeconds = subjects[activeSubject]?.studiedSeconds || 0;

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      {/* Timer Complete Banner */}
      {timerComplete && (
        <div className="bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-center py-4 px-6 font-semibold text-base rounded-2xl mb-6 animate-fade-in flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/15">
          <Icons.Bell />
          {timerMode === 'focus' ? '🎉 أحسنت! انتهت جلسة التركيز' : '☕ انتهت فترة الراحة — عد للدراسة!'}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* ===== RIGHT PANEL ===== */}
        <div className="w-full xl:w-72 shrink-0 space-y-4 order-2 xl:order-1">
          
          {/* Subject Selector */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 overflow-hidden">
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${activeSubject ? getColorTheme(subjects[activeSubject]?.color || '').fill : 'bg-zinc-600'}`} />
                <div className="text-right">
                  <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">المادة المختارة</div>
                  <div className="text-sm font-bold text-white mt-0.5">
                    {activeSubject || 'اختر مادة للبدء'}
                  </div>
                </div>
              </div>
              <div className={`text-zinc-500 transition-transform duration-200 ${selectorOpen ? 'rotate-180' : ''}`}>
                <Icons.ChevronDown />
              </div>
            </button>
            
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${selectorOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t border-zinc-800/60 max-h-[350px] overflow-y-auto">
                {Object.entries(subjects).map(([name, data]) => {
                  const theme = getColorTheme(data.color);
                  const isSelected = name === activeSubject;
                  const goalSec = Math.max(1, data.goalHours * 3600);
                  const progress = Math.min(100, (data.studiedSeconds / goalSec) * 100);

                  return (
                    <button
                      key={name}
                      onClick={() => {
                        onSelectSubject(name);
                        setSelectorOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 transition-all border-b border-zinc-800/30 last:border-0 ${
                        isSelected
                          ? 'bg-violet-500/8 text-white'
                          : 'text-zinc-300 hover:bg-zinc-800/40 hover:text-white'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full ${theme.fill} shrink-0`} />
                      <div className="flex-1 text-right min-w-0">
                        <div className="text-sm font-semibold truncate">{name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${theme.fill}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] font-medium text-zinc-500 tabular-nums">{progress.toFixed(0)}%</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="text-violet-400 shrink-0"><Icons.Check /></div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timer Mode Buttons */}
          <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-4 space-y-1.5">
            <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest px-1 mb-3">وضع الجلسة</div>
            {[
              { mode: 'focus', label: 'جلسة تركيز', desc: '25 دقيقة دراسة مركّزة', icon: <Icons.Book />, activeColor: 'ring-violet-500/40', activeBg: 'bg-violet-500/15 text-violet-400', dotColor: 'bg-violet-500' },
              { mode: 'shortBreak', label: 'راحة قصيرة', desc: '5 دقائق شحن الطاقة', icon: <Icons.Coffee />, activeColor: 'ring-emerald-500/40', activeBg: 'bg-emerald-500/15 text-emerald-400', dotColor: 'bg-emerald-500' },
              { mode: 'longBreak', label: 'راحة طويلة', desc: '15 دقيقة فصل كامل', icon: <Icons.Coffee />, activeColor: 'ring-purple-500/40', activeBg: 'bg-purple-500/15 text-purple-400', dotColor: 'bg-purple-500' },
            ].map(({ mode, label, desc, icon, activeColor, activeBg, dotColor }) => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                aria-label={label}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${
                  timerMode === mode
                    ? `bg-zinc-800/60 ring-1 ${activeColor}`
                    : 'hover:bg-zinc-800/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${timerMode === mode ? activeBg : 'bg-zinc-800/50 text-zinc-500'}`}>{icon}</div>
                  <div className="text-right">
                    <div className={`text-sm font-semibold ${timerMode === mode ? 'text-white' : 'text-zinc-300'}`}>{label}</div>
                    <div className="text-[10px] text-zinc-600">{desc}</div>
                  </div>
                </div>
                {timerMode === mode && <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />}
              </button>
            ))}
          </div>

          {/* Active Subject Stats */}
          {activeSubject && subjects[activeSubject] && (
            <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800/60 p-5">
              <div className="text-[10px] font-semibold text-zinc-600 uppercase tracking-widest mb-3">إحصائيات المادة</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-zinc-800/40 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white tabular-nums">{formatHoursMins(studiedSeconds)}</div>
                  <div className="text-[10px] font-medium text-zinc-500 mt-0.5">تم دراسته</div>
                </div>
                <div className="bg-zinc-800/40 rounded-xl p-3 text-center">
                  <div className="text-lg font-bold text-white tabular-nums">{subjects[activeSubject].sessions}</div>
                  <div className="text-[10px] font-medium text-zinc-500 mt-0.5">جلسات مكتملة</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ===== CENTER: Timer ===== */}
        <div className="flex-1 flex flex-col items-center justify-center order-1 xl:order-2">
          <div className="relative w-full max-w-lg mx-auto">
            {/* Background glow */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] h-[280px] md:w-[350px] md:h-[350px] bg-gradient-to-br ${timerTheme.from} ${timerTheme.to} opacity-[0.04] blur-[80px] pointer-events-none rounded-full transition-colors duration-1000`} />
            
            {/* Timer card */}
            <div className="relative bg-[#111113] rounded-[2rem] p-8 md:p-10 shadow-2xl shadow-black/20 border border-zinc-800/60 flex flex-col items-center">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-b from-white/[0.01] to-transparent pointer-events-none" />
              
              {!activeSubject ? (
                <div className="py-14 text-center relative z-10">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-5 text-zinc-600">
                    <Icons.Timer />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">اختر مادة للبدء</h3>
                  <p className="text-zinc-500 text-sm font-medium max-w-xs mx-auto">
                    اضغط على "المادة المختارة" في الأعلى واختر المادة التي تريد دراستها
                  </p>
                </div>
              ) : (
                <>
                  {/* Subject badge */}
                  <div className="relative z-10 mb-6 md:mb-8 flex items-center gap-2 px-4 py-2 bg-zinc-800/50 rounded-full border border-zinc-700/50">
                    <div className={`w-2 h-2 rounded-full ${getColorTheme(subjects[activeSubject]?.color || '').fill} ${isRunning ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-semibold text-white">{activeSubject}</span>
                  </div>

                  {/* Timer ring */}
                  <div className="relative flex items-center justify-center mb-8 md:mb-10">
                    <svg className="w-52 h-52 sm:w-60 sm:h-60 lg:w-68 lg:h-68 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="46" fill="none" className="stroke-zinc-800/50" strokeWidth="2" />
                      <circle cx="50" cy="50" r="46" fill="none" className={`${timerTheme.stroke} transition-all duration-1000 ease-linear`} strokeWidth="3" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center" role="timer" aria-live="polite">
                      <div className={`text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-bold tracking-tighter tabular-nums leading-none text-white ${isRunning ? '' : ''}`}>
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-[11px] font-semibold text-zinc-500 mt-2 uppercase tracking-wider">
                        {timerMode === 'focus' ? 'تركيز عميق' : timerMode === 'shortBreak' ? 'راحة قصيرة' : 'راحة طويلة'}
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="relative z-10 flex items-center gap-4 w-full justify-center">
                    <button
                      onClick={resetTimer}
                      aria-label="إعادة تعيين المؤقت"
                      className="w-12 h-12 md:w-13 md:h-13 shrink-0 flex items-center justify-center rounded-xl bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-700/50 transition-all hover:-rotate-180 duration-500"
                    >
                      <Icons.RotateCcw />
                    </button>
                    <button
                      onClick={toggleTimer}
                      aria-label={isRunning ? 'إيقاف المؤقت' : 'بدء المؤقت'}
                      className={`px-8 py-3.5 flex-1 max-w-[200px] flex items-center justify-center gap-3 rounded-full text-white text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${
                        isRunning
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-red-400 shadow-black/20'
                          : `${timerTheme.bg} ${timerTheme.glow}`
                      }`}
                    >
                      {isRunning ? <Icons.Pause /> : <Icons.Play />}
                      {isRunning ? 'إيقاف' : 'بدء التركيز'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
