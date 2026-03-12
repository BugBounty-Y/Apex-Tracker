import { useState } from 'react';
import { Icons } from './Icons';
import { formatTime, formatHoursMins } from '../utils/helpers';
import { getColorTheme } from '../utils/constants';
import { useTheme } from '../contexts/ThemeContext';
import { DEFAULT_POMODORO_SETTINGS } from '../hooks/useTimer';

export default function TimerPage({
  subjects,
  activeSubject,
  onSelectSubject,
  timer,
  pomodoroSettings,
  setPomodoroSettings,
}) {
  const { isDark } = useTheme();
  const [selectorOpen, setSelectorOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [localSettings, setLocalSettings] = useState({ ...DEFAULT_POMODORO_SETTINGS, ...pomodoroSettings });

  const {
    timerMode, timeLeft, isRunning, isPaused, timerComplete, toggleTimer, resetTimer,
    changeMode, skipToNextPhase, timerTheme, ringCircumference, ringOffset,
    completedSessions, sessionsBeforeLongBreak,
  } = timer;

  // Determine button text based on timer state
  const getButtonText = () => {
    if (isRunning) return 'إيقاف مؤقت';
    if (isPaused) return 'استئناف';
    return 'بدء المؤقت';
  };

  const studiedSeconds = subjects[activeSubject]?.studiedSeconds || 0;

  // Handle opening settings panel: sync localSettings from current pomodoroSettings
  const handleOpenSettings = () => {
    setLocalSettings({ ...DEFAULT_POMODORO_SETTINGS, ...pomodoroSettings });
    setSettingsOpen(true);
  };

  const handleSaveSettings = () => {
    const validated = {
      focusMinutes: Math.max(1, Math.min(120, parseInt(localSettings.focusMinutes) || 25)),
      shortBreakMinutes: Math.max(1, Math.min(60, parseInt(localSettings.shortBreakMinutes) || 5)),
      longBreakMinutes: Math.max(1, Math.min(60, parseInt(localSettings.longBreakMinutes) || 15)),
      sessionsBeforeLongBreak: Math.max(1, Math.min(12, parseInt(localSettings.sessionsBeforeLongBreak) || 4)),
    };
    setPomodoroSettings(validated);
    setSettingsOpen(false);
  };

  // Determine the complete banner message
  const getCompleteBannerMessage = () => {
    if (timerMode === 'focus') {
      // Timer just completed focus, see what comes next
      return '🎉 أحسنت! انتهت جلسة التركيز — جهّز نفسك للراحة';
    }
    if (timerMode === 'shortBreak') {
      return '☕ انتهت الراحة القصيرة — عد للدراسة!';
    }
    return '🌟 انتهت الراحة الطويلة — دورة جديدة!';
  };

  // Session dots display
  const renderSessionDots = () => {
    const dots = [];
    for (let i = 0; i < sessionsBeforeLongBreak; i++) {
      const isCompleted = i < completedSessions;
      const isCurrent = i === completedSessions && timerMode === 'focus';
      dots.push(
        <div
          key={i}
          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
            isCompleted
              ? 'bg-violet-500 scale-100'
              : isCurrent
                ? 'bg-violet-400/50 animate-pulse scale-110 ring-2 ring-violet-400/30'
                : ''
          }`}
          style={!isCompleted && !isCurrent ? { backgroundColor: isDark ? '#3f3f46' : '#d4d4d8' } : {}}
          title={`جلسة ${i + 1}: ${isCompleted ? 'مكتملة' : isCurrent ? 'جارية' : 'قادمة'}`}
        />
      );
    }
    return dots;
  };

  return (
    <div className="min-h-full flex flex-col animate-fade-in">
      {/* Timer Complete Banner */}
      {timerComplete && (
        <div className="bg-gradient-to-l from-emerald-600 to-teal-500 text-white text-center py-4 px-6 font-semibold text-base rounded-2xl mb-6 animate-fade-in flex items-center justify-center gap-3 shadow-lg shadow-emerald-500/15">
          <Icons.Bell />
          {getCompleteBannerMessage()}
        </div>
      )}

      <div className="flex flex-col xl:flex-row gap-6 flex-1">
        {/* ===== RIGHT PANEL ===== */}
        <div className="w-full xl:w-72 shrink-0 space-y-4 order-2 xl:order-1">

          {/* Subject Selector */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
          >
            <button
              onClick={() => setSelectorOpen(!selectorOpen)}
              className="w-full flex items-center justify-between p-4 transition-colors"
              style={{ color: 'var(--c-text)' }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${activeSubject ? getColorTheme(subjects[activeSubject]?.color || '').fill : ''}`}
                  style={!activeSubject ? { backgroundColor: 'var(--c-text-faint)' } : {}}
                />
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>المادة المختارة</div>
                  <div className="text-sm font-bold mt-0.5" style={{ color: 'var(--c-text)' }}>
                    {activeSubject || 'اختر مادة للبدء'}
                  </div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${selectorOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--c-text-muted)' }}>
                <Icons.ChevronDown />
              </div>
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${selectorOpen ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t max-h-[350px] overflow-y-auto" style={{ borderColor: 'var(--c-border)' }}>
                {Object.entries(subjects).map(([name, data]) => {
                  const theme = getColorTheme(data.color);
                  const isSelected = name === activeSubject;
                  const goalSec = Math.max(1, data.goalHours * 3600);
                  const progress = Math.min(100, (data.studiedSeconds / goalSec) * 100);

                  return (
                    <button
                      key={name}
                      onClick={() => { onSelectSubject(name); setSelectorOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 transition-all border-b last:border-0"
                      style={{
                        borderColor: 'var(--c-border)',
                        backgroundColor: isSelected ? 'rgba(139,92,246,0.08)' : 'transparent',
                        color: 'var(--c-text)',
                      }}
                    >
                      <div className={`w-2 h-2 rounded-full ${theme.fill} shrink-0`} />
                      <div className="flex-1 text-right min-w-0">
                        <div className="text-sm font-semibold truncate">{name}</div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? '#27272a' : '#e4e4e7' }}>
                            <div className={`h-full rounded-full ${theme.fill}`} style={{ width: `${progress}%` }} />
                          </div>
                          <span className="text-[10px] font-medium tabular-nums" style={{ color: 'var(--c-text-faint)' }}>{progress.toFixed(0)}%</span>
                        </div>
                      </div>
                      {isSelected && <div className="text-violet-500 shrink-0"><Icons.Check /></div>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Timer Mode Buttons */}
          <div className="rounded-2xl border p-4 space-y-1.5"
            style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
          >
            <div className="flex items-center justify-between px-1 mb-3">
              <div className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-faint)' }}>وضع الجلسة</div>
            </div>
            {[
              { mode: 'focus', label: 'جلسة تركيز', desc: `${pomodoroSettings?.focusMinutes || 25} دقيقة دراسة مركّزة`, icon: <Icons.Book />, activeBg: 'bg-violet-500/15 text-violet-500', dotColor: 'bg-violet-500' },
              { mode: 'shortBreak', label: 'راحة قصيرة', desc: `${pomodoroSettings?.shortBreakMinutes || 5} دقائق شحن الطاقة`, icon: <Icons.Coffee />, activeBg: 'bg-emerald-500/15 text-emerald-500', dotColor: 'bg-emerald-500' },
              { mode: 'longBreak', label: 'راحة طويلة', desc: `${pomodoroSettings?.longBreakMinutes || 15} دقيقة فصل كامل`, icon: <Icons.Coffee />, activeBg: 'bg-purple-500/15 text-purple-500', dotColor: 'bg-purple-500' },
            ].map(({ mode, label, desc, icon, activeBg, dotColor }) => (
              <button
                key={mode}
                onClick={() => changeMode(mode)}
                aria-label={label}
                className={`w-full p-3 rounded-xl flex items-center justify-between transition-all ${timerMode === mode ? 'ring-1 ring-violet-500/30' : ''
                  }`}
                style={{
                  backgroundColor: timerMode === mode ? 'var(--c-elevated)' : 'transparent',
                }}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${timerMode === mode ? activeBg : ''}`}
                    style={timerMode !== mode ? { backgroundColor: 'var(--c-elevated)', color: 'var(--c-text-muted)' } : {}}
                  >{icon}</div>
                  <div className="text-right">
                    <div className="text-sm font-semibold" style={{ color: timerMode === mode ? 'var(--c-text)' : 'var(--c-text-sub)' }}>{label}</div>
                    <div className="text-[10px]" style={{ color: 'var(--c-text-faint)' }}>{desc}</div>
                  </div>
                </div>
                {timerMode === mode && <div className={`w-2 h-2 rounded-full ${dotColor} animate-pulse`} />}
              </button>
            ))}
          </div>

          {/* Pomodoro Settings Panel */}
          <div className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
          >
            <button
              onClick={settingsOpen ? () => setSettingsOpen(false) : handleOpenSettings}
              className="w-full flex items-center justify-between p-4 transition-colors"
              style={{ color: 'var(--c-text)' }}
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-500">
                  <Icons.Sliders />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>إعدادات المؤقت</div>
                  <div className="text-[10px]" style={{ color: 'var(--c-text-faint)' }}>تخصيص أوقات الجلسات</div>
                </div>
              </div>
              <div className={`transition-transform duration-200 ${settingsOpen ? 'rotate-180' : ''}`} style={{ color: 'var(--c-text-muted)' }}>
                <Icons.ChevronDown />
              </div>
            </button>

            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${settingsOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="border-t px-4 py-4 space-y-4" style={{ borderColor: 'var(--c-border)' }}>
                {/* Focus Duration */}
                <div>
                  <label htmlFor="pomodoro-focus" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-sub)' }}>
                    مدة التركيز (دقيقة)
                  </label>
                  <input
                    id="pomodoro-focus"
                    type="number"
                    min="1"
                    max="120"
                    value={localSettings.focusMinutes}
                    onChange={(e) => setLocalSettings({ ...localSettings, focusMinutes: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-violet-500/40 outline-none transition-all border"
                    style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                </div>

                {/* Short Break Duration */}
                <div>
                  <label htmlFor="pomodoro-short" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-sub)' }}>
                    مدة الراحة القصيرة (دقيقة)
                  </label>
                  <input
                    id="pomodoro-short"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.shortBreakMinutes}
                    onChange={(e) => setLocalSettings({ ...localSettings, shortBreakMinutes: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-violet-500/40 outline-none transition-all border"
                    style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                </div>

                {/* Long Break Duration */}
                <div>
                  <label htmlFor="pomodoro-long" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-sub)' }}>
                    مدة الراحة الطويلة (دقيقة)
                  </label>
                  <input
                    id="pomodoro-long"
                    type="number"
                    min="1"
                    max="60"
                    value={localSettings.longBreakMinutes}
                    onChange={(e) => setLocalSettings({ ...localSettings, longBreakMinutes: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-violet-500/40 outline-none transition-all border"
                    style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                </div>

                {/* Sessions Before Long Break */}
                <div>
                  <label htmlFor="pomodoro-sessions" className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--c-text-sub)' }}>
                    جلسات التركيز قبل الراحة الطويلة
                  </label>
                  <input
                    id="pomodoro-sessions"
                    type="number"
                    min="1"
                    max="12"
                    value={localSettings.sessionsBeforeLongBreak}
                    onChange={(e) => setLocalSettings({ ...localSettings, sessionsBeforeLongBreak: e.target.value })}
                    className="w-full rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-violet-500/40 outline-none transition-all border"
                    style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
                  />
                </div>

                {/* Save & Reset Buttons */}
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={handleSaveSettings}
                    className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/15 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Icons.Check />
                    حفظ
                  </button>
                  <button
                    onClick={() => {
                      setLocalSettings({ ...DEFAULT_POMODORO_SETTINGS });
                    }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:opacity-80 flex items-center gap-2"
                    style={{ color: 'var(--c-text-muted)' }}
                  >
                    <Icons.RotateCcw />
                    إفتراضي
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Active Subject Stats */}
          {activeSubject && subjects[activeSubject] && (
            <div className="rounded-2xl border p-5"
              style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)' }}
            >
              <div className="text-[10px] font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--c-text-faint)' }}>إحصائيات المادة</div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--c-elevated)' }}>
                  <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>{formatHoursMins(studiedSeconds)}</div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--c-text-faint)' }}>تم دراسته</div>
                </div>
                <div className="rounded-xl p-3 text-center" style={{ backgroundColor: 'var(--c-elevated)' }}>
                  <div className="text-lg font-bold tabular-nums" style={{ color: 'var(--c-text)' }}>{subjects[activeSubject].sessions}</div>
                  <div className="text-[10px] font-medium mt-0.5" style={{ color: 'var(--c-text-faint)' }}>جلسات مكتملة</div>
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
            <div className="relative rounded-[2rem] p-8 md:p-10 shadow-2xl border flex flex-col items-center"
              style={{ backgroundColor: 'var(--c-surface)', borderColor: 'var(--c-border)', boxShadow: isDark ? '0 25px 50px -12px rgba(0,0,0,0.2)' : '0 25px 50px -12px rgba(0,0,0,0.08)' }}
            >
              <div className="absolute inset-0 rounded-[2rem] pointer-events-none" style={{ background: isDark ? 'linear-gradient(to bottom, rgba(255,255,255,0.01), transparent)' : 'none' }} />

              {!activeSubject ? (
                <div className="py-14 text-center relative z-10">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5"
                    style={{ backgroundColor: 'var(--c-surface-alt)', color: 'var(--c-text-faint)' }}
                  >
                    <Icons.Timer />
                  </div>
                  <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--c-text)' }}>اختر مادة للبدء</h3>
                  <p className="text-sm font-medium max-w-xs mx-auto" style={{ color: 'var(--c-text-muted)' }}>
                    اضغط على "المادة المختارة" في الأعلى واختر المادة التي تريد دراستها
                  </p>
                </div>
              ) : (
                <>
                  {/* Subject badge */}
                  <div className="relative z-10 mb-4 md:mb-5 flex items-center gap-2 px-4 py-2 rounded-full border"
                    style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)' }}
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorTheme(subjects[activeSubject]?.color || '').fill} ${isRunning ? 'animate-pulse' : ''}`} />
                    <span className="text-sm font-semibold" style={{ color: 'var(--c-text)' }}>{activeSubject}</span>
                  </div>

                  {/* Session progress dots */}
                  <div className="relative z-10 mb-4 flex items-center gap-2">
                    <div className="flex items-center gap-1.5">
                      {renderSessionDots()}
                    </div>
                    <span className="text-[10px] font-semibold tabular-nums mr-2" style={{ color: 'var(--c-text-faint)' }}>
                      {completedSessions}/{sessionsBeforeLongBreak}
                    </span>
                  </div>

                  {/* Timer ring */}
                  <div className="relative flex items-center justify-center mb-8 md:mb-10">
                    <svg className="w-52 h-52 sm:w-60 sm:h-60 lg:w-68 lg:h-68 transform -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
                      <circle cx="50" cy="50" r="46" fill="none" stroke={isDark ? 'rgba(39,39,42,0.5)' : 'rgba(228,228,231,0.8)'} strokeWidth="2" />
                      <circle cx="50" cy="50" r="46" fill="none" className={`${timerTheme.stroke} transition-all duration-1000 ease-linear`} strokeWidth="3" strokeLinecap="round" strokeDasharray={ringCircumference} strokeDashoffset={ringOffset} />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center" role="timer" aria-live="polite">
                      <div className={`text-[3rem] sm:text-[4rem] lg:text-[4.5rem] font-bold tracking-tighter tabular-nums leading-none transition-opacity duration-500 ${isPaused ? 'animate-pulse' : ''}`} style={{ color: 'var(--c-text)' }}>
                        {formatTime(timeLeft)}
                      </div>
                      <div className="text-[11px] font-semibold mt-2 uppercase tracking-wider" style={{ color: 'var(--c-text-muted)' }}>
                        {isPaused
                          ? '⏸ متوقف مؤقتاً'
                          : timerMode === 'focus' ? 'تركيز عميق' : timerMode === 'shortBreak' ? 'راحة قصيرة' : 'راحة طويلة'
                        }
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="relative z-10 flex items-center gap-3 w-full justify-center">
                    <button
                      onClick={resetTimer}
                      aria-label="إعادة تعيين المؤقت"
                      className="w-12 h-12 md:w-13 md:h-13 shrink-0 flex items-center justify-center rounded-xl border transition-all hover:-rotate-180 duration-500"
                      style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                    >
                      <Icons.RotateCcw />
                    </button>
                    <button
                      onClick={toggleTimer}
                      aria-label={getButtonText()}
                      className={`px-8 py-3.5 flex-1 max-w-[220px] flex items-center justify-center gap-3 rounded-full text-white text-base font-semibold transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg ${isRunning
                          ? 'bg-zinc-700 hover:bg-zinc-600 text-red-400 shadow-black/20'
                          : isPaused
                            ? 'bg-amber-500 hover:bg-amber-400 shadow-amber-500/30'
                            : `${timerTheme.bg} ${timerTheme.glow}`
                        }`}
                    >
                      {isRunning ? <Icons.Pause /> : <Icons.Play />}
                      {getButtonText()}
                    </button>
                    <button
                      onClick={skipToNextPhase}
                      aria-label="تخطي إلى المرحلة التالية"
                      title="تخطي إلى المرحلة التالية"
                      className="w-12 h-12 md:w-13 md:h-13 shrink-0 flex items-center justify-center rounded-xl border transition-all hover:scale-110 duration-300"
                      style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                    >
                      <Icons.SkipForward />
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
