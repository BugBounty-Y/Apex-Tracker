import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { formatHoursMins, formatTime } from '../utils/helpers';

const timerPresets = [
  {
    id: 'pomodoro',
    label: 'Pomodoro',
    description: 'جلسات تركيز مع فترات راحة تلقائية.',
    icon: <Icons.Zap />,
    gradient: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
  },
  {
    id: 'custom',
    label: 'Custom Focus',
    description: 'جلسة تركيز ثابتة بدون break cycle.',
    icon: <Icons.Target />,
    gradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
  },
  {
    id: 'stopwatch',
    label: 'Stopwatch',
    description: 'عدّ تصاعدي مفتوح عندما لا تريد مدة مسبقة.',
    icon: <Icons.Timer />,
    gradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
  },
];

/* Motivational phrases that cycle */
const motivationalPhrases = [
  'ركّز الآن، واحصد لاحقاً. 🔥',
  'كل دقيقة تُحدث فرقاً.',
  'أنت أقرب مما تظن!',
  'ابدأ صغيراً، لكن ابدأ الآن.',
  'التركيز هو القوة الخارقة.',
];

function getMotivationalPhrase() {
  const index = Math.floor(Date.now() / 60000) % motivationalPhrases.length;
  return motivationalPhrases[index];
}

/* ─── SVG Ring Progress ─── */
function TimerRing({ progress, isRunning, isPaused, timerMode, children }) {
  const size = 280;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress * circumference);

  // Color based on mode
  const getStrokeColor = () => {
    if (timerMode === 'shortBreak') return '#34d399';
    if (timerMode === 'longBreak') return '#22d3ee';
    return '#8b5cf6';
  };

  const getGlowColor = () => {
    if (timerMode === 'shortBreak') return 'rgba(52, 211, 153, 0.3)';
    if (timerMode === 'longBreak') return 'rgba(34, 211, 238, 0.3)';
    return 'rgba(139, 92, 246, 0.3)';
  };

  return (
    <div className="relative mx-auto" style={{ width: size, height: size }}>
      {/* Glow effect when running */}
      {isRunning && (
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${getGlowColor()}, transparent 70%)`,
            animation: 'pulse 2s ease-in-out infinite',
          }}
        />
      )}

      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: isRunning ? `drop-shadow(0 0 12px ${getGlowColor()})` : 'none' }}
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--c-border)"
          strokeWidth={strokeWidth}
          strokeOpacity="0.4"
        />
        {/* Progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={getStrokeColor()}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1), stroke 0.4s ease',
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}

/* ─── Pomodoro Session Dots ─── */
function SessionDots({ completed, total }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className="h-2.5 w-2.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: i < completed ? 'var(--c-accent)' : 'var(--c-border)',
            boxShadow: i < completed ? '0 0 8px rgba(139, 92, 246, 0.4)' : 'none',
            transform: i < completed ? 'scale(1.15)' : 'scale(1)',
          }}
        />
      ))}
    </div>
  );
}

export default function TimerPage() {
  const {
    appData,
    activeSubject,
    setActiveSubject,
    activeTaskId,
    setActiveTaskId,
    timerPreset,
    changeTimerPreset,
    timerState,
    currentSubject,
    currentTask,
    todaySeconds,
    updatePomodoroSettings,
  } = useAppData();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displayValue = timerState.isCountUp ? formatTime(timerState.displaySeconds) : formatTime(timerState.timeLeft);

  // Ring progress (0 to 1)
  const ringProgress = useMemo(() => {
    if (timerState.isCountUp) {
      // For stopwatch: fill based on minutes (full at 60min)
      return Math.min(1, timerState.displaySeconds / 3600);
    }
    if (timerState.totalTimerSeconds <= 0) return 0;
    return 1 - (timerState.timeLeft / timerState.totalTimerSeconds);
  }, [timerState.displaySeconds, timerState.isCountUp, timerState.timeLeft, timerState.totalTimerSeconds]);

  const modeLabel = timerPreset === 'stopwatch'
    ? 'Stopwatch'
    : timerState.timerMode === 'focus'
      ? '🔥 Focus'
      : timerState.timerMode === 'shortBreak'
        ? '☕ Short Break'
        : '🌿 Long Break';

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  const getModeBackground = () => {
    if (!timerState.isRunning && !timerState.isPaused) return 'transparent';
    if (timerState.timerMode === 'shortBreak') return 'rgba(52, 211, 153, 0.03)';
    if (timerState.timerMode === 'longBreak') return 'rgba(34, 211, 238, 0.03)';
    return 'rgba(139, 92, 246, 0.03)';
  };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Timer"
        title="Focus Mode"
        description="اختر ما ستذاكره الآن ثم ادخل في جلسة تركيز عميقة. كل ثانية تُسجّل تلقائياً."
      />

      {!activeSubject ? (
        <EmptyState
          icon={<Icons.Timer />}
          title="اختر مادة لتبدأ"
          description="من الأفضل تحديد المادة والمهمة أولًا حتى تُسجَّل الجلسات بشكل واضح في History وInsights."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          {/* ═══════ MAIN TIMER AREA ═══════ */}
          <section
            className="app-panel rounded-[var(--radius-card)] p-6 md:p-8 relative overflow-hidden"
            style={{ backgroundColor: getModeBackground() }}
          >
            {/* Ambient background orbs */}
            {timerState.isRunning && (
              <>
                <div
                  className="absolute top-[-60px] right-[-60px] w-[200px] h-[200px] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)',
                    animation: 'pulse 4s ease-in-out infinite',
                  }}
                />
                <div
                  className="absolute bottom-[-40px] left-[-40px] w-[160px] h-[160px] rounded-full pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle, rgba(34, 211, 238, 0.05), transparent 70%)',
                    animation: 'pulse 5s ease-in-out infinite 1s',
                  }}
                />
              </>
            )}

            <div className="relative z-10 text-center">
              {/* Active subject & task */}
              <div className="flex flex-wrap items-center justify-center gap-2">
                <div
                  className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[12px] font-bold"
                  style={{
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(99, 102, 241, 0.15))',
                    color: 'var(--c-nav-active)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}
                >
                  <Icons.Book />
                  {activeSubject}
                </div>
                {currentTask && (
                  <div
                    className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold"
                    style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}
                  >
                    <Icons.Target />
                    {currentTask.title}
                  </div>
                )}
              </div>

              {/* Mode label with animation */}
              <div
                className="mt-3 text-[13px] font-bold tracking-wide"
                style={{
                  color: timerState.isRunning ? 'var(--c-nav-active)' : 'var(--c-text-muted)',
                  transition: 'color 0.3s ease',
                }}
              >
                {modeLabel}
              </div>

              {/* ─── TIMER RING ─── */}
              <div className="mt-6 mb-4">
                <TimerRing
                  progress={ringProgress}
                  isRunning={timerState.isRunning}
                  isPaused={timerState.isPaused}
                  timerMode={timerState.timerMode}
                >
                  <div
                    className="text-[48px] font-black tracking-tight tabular-nums md:text-[60px] leading-none"
                    style={{
                      letterSpacing: '-0.04em',
                      color: 'var(--c-text)',
                      textShadow: timerState.isRunning ? '0 0 30px rgba(139, 92, 246, 0.15)' : 'none',
                    }}
                  >
                    {displayValue}
                  </div>
                  {/* Motivational text inside ring */}
                  <div
                    className="mt-2 max-w-[180px] text-[11px] font-medium leading-4 text-center"
                    style={{ color: 'var(--c-text-faint)' }}
                  >
                    {timerState.isRunning
                      ? getMotivationalPhrase()
                      : timerState.isPaused
                        ? 'متوقف مؤقتاً...'
                        : 'جاهز للبدء'}
                  </div>
                </TimerRing>
              </div>

              {/* Pomodoro session dots */}
              {timerPreset === 'pomodoro' && (
                <div className="mb-5">
                  <SessionDots
                    completed={timerState.completedSessions || 0}
                    total={timerState.sessionsBeforeLongBreak || 4}
                  />
                  <div className="mt-1.5 text-[10px] font-semibold" style={{ color: 'var(--c-text-faint)' }}>
                    الجلسة {(timerState.completedSessions || 0) + 1} من {timerState.sessionsBeforeLongBreak || 4}
                  </div>
                </div>
              )}

              {/* Completion message */}
              {timerState.timerComplete && (
                <div
                  className="mb-5 mx-auto inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-bold animate-fade-in"
                  style={{
                    background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15))',
                    color: 'var(--c-success)',
                    border: '1px solid rgba(52, 211, 153, 0.2)',
                    boxShadow: '0 0 20px rgba(52, 211, 153, 0.1)',
                  }}
                >
                  <Icons.CheckCircle />
                  🎉 الجلسة اكتملت! يمكنك بدء التالية مباشرة.
                </div>
              )}

              {/* ─── ACTION BUTTONS ─── */}
              <div className="flex flex-wrap items-center justify-center gap-3">
                {/* Main play/pause button — hero button */}
                <button
                  type="button"
                  onClick={timerState.toggleTimer}
                  className="relative overflow-hidden rounded-full px-8 py-3.5 text-[14px] font-bold text-white transition-all duration-300 active:scale-95"
                  style={{
                    background: timerState.isRunning
                      ? 'linear-gradient(135deg, #ef4444, #dc2626)'
                      : 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    boxShadow: timerState.isRunning
                      ? '0 4px 20px rgba(239, 68, 68, 0.3), 0 0 40px rgba(239, 68, 68, 0.1)'
                      : '0 4px 20px rgba(139, 92, 246, 0.3), 0 0 40px rgba(139, 92, 246, 0.1)',
                    minWidth: '160px',
                  }}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {timerState.isRunning ? <Icons.Pause /> : <Icons.Play />}
                    {timerState.isRunning ? 'إيقاف مؤقت' : timerState.isPaused ? 'استكمال' : 'ابدأ الآن'}
                  </span>
                </button>

                {/* Secondary buttons */}
                <button
                  type="button"
                  onClick={timerState.resetTimer}
                  className="flex items-center justify-center h-11 w-11 rounded-full border transition-all duration-200 hover:bg-[var(--c-surface-hover)] active:scale-95"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                  title="Reset"
                >
                  <Icons.RotateCcw />
                </button>
                <button
                  type="button"
                  onClick={timerState.skipToNextPhase}
                  className="flex items-center justify-center h-11 w-11 rounded-full border transition-all duration-200 hover:bg-[var(--c-surface-hover)] active:scale-95"
                  style={{ borderColor: 'var(--c-border)', color: 'var(--c-text-muted)' }}
                  title="Skip"
                >
                  <Icons.SkipForward />
                </button>
              </div>

              {/* ─── LIVE STATS BAR ─── */}
              <div
                className="mt-7 grid gap-px grid-cols-3 rounded-[var(--radius-lg)] overflow-hidden border"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <div className="p-3.5 text-center" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>
                    <Icons.Zap />
                    اليوم
                  </div>
                  <div className="mt-1 text-[15px] font-bold tabular-nums">{formatHoursMins(todaySeconds)}</div>
                </div>
                <div className="p-3.5 text-center" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>
                    <Icons.Trophy />
                    المادة
                  </div>
                  <div className="mt-1 text-[15px] font-bold tabular-nums">{formatHoursMins(currentSubject?.studiedSeconds || 0)}</div>
                </div>
                <div className="p-3.5 text-center" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider" style={{ color: 'var(--c-text-faint)' }}>
                    <Icons.Activity />
                    الجلسات
                  </div>
                  <div className="mt-1 text-[15px] font-bold tabular-nums">{currentSubject?.sessions || 0}</div>
                </div>
              </div>
            </div>
          </section>

          {/* ═══════ SIDEBAR CONTROLS ═══════ */}
          <div className="space-y-4">
            {/* Subject & Task selector */}
            <SectionCard title="المادة والمهمة" subtitle="غيّر المادة أو اختر المهمة الحالية.">
              <div className="space-y-3">
                <div>
                  <span className="app-label" style={{ fontSize: '0.6rem' }}>المادة</span>
                  <select
                    value={activeSubject || ''}
                    onChange={(event) => setActiveSubject(event.target.value)}
                    className="app-control"
                    style={inputStyle}
                  >
                    {Object.keys(appData.subjects).map((subjectName) => (
                      <option key={subjectName} value={subjectName}>{subjectName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <span className="app-label" style={{ fontSize: '0.6rem' }}>المهمة</span>
                  <select
                    value={activeTaskId}
                    onChange={(event) => setActiveTaskId(event.target.value)}
                    className="app-control"
                    style={inputStyle}
                  >
                    <option value="">بدون مهمة محددة</option>
                    {(currentSubject?.tasks || []).map((task) => (
                      <option key={task.id} value={task.id}>{task.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </SectionCard>

            {/* Timer presets — card style */}
            <SectionCard title="نمط الجلسة" subtitle="اختر النمط المناسب لأسلوبك الآن.">
              <div className="space-y-2">
                {timerPresets.map((preset) => {
                  const isActive = preset.id === timerPreset;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => changeTimerPreset(preset.id)}
                      className="w-full rounded-[var(--radius-lg)] border p-3.5 text-right transition-all duration-200 hover:-translate-y-px"
                      style={{
                        backgroundColor: isActive ? 'var(--c-accent-soft)' : 'var(--c-surface-alt)',
                        borderColor: isActive ? 'rgba(139, 92, 246, 0.25)' : 'var(--c-border)',
                        boxShadow: isActive ? '0 0 16px rgba(139, 92, 246, 0.08)' : 'none',
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] text-white"
                          style={{
                            background: isActive ? preset.gradient : 'var(--c-elevated)',
                            color: isActive ? '#fff' : 'var(--c-text-faint)',
                          }}
                        >
                          {preset.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-bold">{preset.label}</div>
                          <div className="mt-0.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>{preset.description}</div>
                        </div>
                        {isActive && (
                          <span style={{ color: 'var(--c-success)' }}>
                            <Icons.CheckCircle />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </SectionCard>

            {/* Session settings — collapsible */}
            <SectionCard
              title="إعدادات متقدمة"
              subtitle="تبقى مخفية حتى لا تشتت التركيز."
              action={(
                <button
                  type="button"
                  onClick={() => setSettingsOpen((value) => !value)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold transition-colors hover:bg-[var(--c-surface-hover)]"
                  style={{
                    color: settingsOpen ? 'var(--c-nav-active)' : 'var(--c-text-muted)',
                    backgroundColor: settingsOpen ? 'var(--c-accent-soft)' : 'transparent',
                  }}
                >
                  <Icons.Sliders />
                  {settingsOpen ? 'إخفاء' : 'إظهار'}
                </button>
              )}
            >
              {settingsOpen ? (
                <div className="grid gap-3 grid-cols-2 animate-fade-in">
                  <label className="text-right">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>Focus (min)</span>
                    <input
                      type="number"
                      min="1"
                      value={appData.pomodoroSettings.focusMinutes}
                      onChange={(event) => updatePomodoroSettings({ focusMinutes: Number.parseInt(event.target.value, 10) || 25 })}
                      className="app-control"
                      style={inputStyle}
                    />
                  </label>
                  <label className="text-right">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>Custom (min)</span>
                    <input
                      type="number"
                      min="5"
                      value={appData.pomodoroSettings.customFocusMinutes}
                      onChange={(event) => updatePomodoroSettings({ customFocusMinutes: Number.parseInt(event.target.value, 10) || 45 })}
                      className="app-control"
                      style={inputStyle}
                    />
                  </label>
                  <label className="text-right">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>Short Break (min)</span>
                    <input
                      type="number"
                      min="1"
                      value={appData.pomodoroSettings.shortBreakMinutes}
                      onChange={(event) => updatePomodoroSettings({ shortBreakMinutes: Number.parseInt(event.target.value, 10) || 5 })}
                      className="app-control"
                      style={inputStyle}
                    />
                  </label>
                  <label className="text-right">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>Long Break (min)</span>
                    <input
                      type="number"
                      min="1"
                      value={appData.pomodoroSettings.longBreakMinutes}
                      onChange={(event) => updatePomodoroSettings({ longBreakMinutes: Number.parseInt(event.target.value, 10) || 15 })}
                      className="app-control"
                      style={inputStyle}
                    />
                  </label>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-[12px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                  <Icons.Info />
                  <span>الإعدادات مخفية الآن حتى تبقى الصفحة في وضع تركيز حقيقي.</span>
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
