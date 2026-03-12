import { useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { formatHoursMins, formatTime } from '../utils/helpers';

const timerPresets = [
  { id: 'pomodoro', label: 'Pomodoro', description: 'جلسات تركيز مع فترات راحة تلقائية.' },
  { id: 'custom', label: 'Custom Focus', description: 'جلسة تركيز ثابتة بدون break cycle.' },
  { id: 'stopwatch', label: 'Stopwatch', description: 'عدّ تصاعدي مفتوح عندما لا تريد مدة مسبقة.' },
];

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
    updatePomodoroSettings,
  } = useAppData();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const displayValue = timerState.isCountUp ? formatTime(timerState.displaySeconds) : formatTime(timerState.timeLeft);
  const presetDescription = timerPresets.find((preset) => preset.id === timerPreset)?.description || '';

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Timer"
        title="Focus Mode"
        description="صفحة واحدة لهدف واحد: اختيار ما ستذاكره الآن ثم الدخول في جلسة تركيز نظيفة."
      />

      {!activeSubject ? (
        <EmptyState
          icon={<Icons.Timer />}
          title="اختر مادة لتبدأ"
          description="من الأفضل تحديد المادة والمهمة أولًا حتى تُسجَّل الجلسات بشكل واضح في History وInsights."
        />
      ) : (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_336px]">
          {/* Timer display section */}
          <section className="app-panel rounded-[24px] p-4 md:p-6">
            <div className="text-center">
              {/* Active subject badge */}
              <div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[12px] font-bold"
                style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}
              >
                <Icons.Book />
                {activeSubject}
              </div>
              <div className="mt-1.5 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                {currentTask ? currentTask.title : 'بدون مهمة محددة'}
              </div>

              {/* Timer circle */}
              <div className="mx-auto mt-5 flex items-center justify-center rounded-full border"
                style={{
                  height: 'min(70vw, 280px)',
                  width: 'min(70vw, 280px)',
                  borderColor: timerState.isRunning ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.15)',
                  background: timerState.isRunning
                    ? 'radial-gradient(circle, rgba(139, 92, 246, 0.15), transparent 65%)'
                    : 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 60%)',
                  transition: 'all 0.5s ease',
                }}
              >
                <div>
                  <div className="text-[46px] font-bold tracking-tight tabular-nums md:text-[60px] leading-none">{displayValue}</div>
                  <div className="mt-2 text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--c-text-faint)' }}>
                    {timerPreset === 'stopwatch'
                      ? 'Count up'
                      : timerState.timerMode === 'focus'
                        ? 'Focus'
                        : timerState.timerMode === 'shortBreak'
                          ? 'Short break'
                          : 'Long break'}
                  </div>
                </div>
              </div>

              {/* Completion message */}
              {timerState.timerComplete && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-bold"
                  style={{ backgroundColor: 'var(--c-success-soft)', color: 'var(--c-success)' }}
                >
                  <Icons.CheckCircle />
                  الجلسة اكتملت ويمكنك بدء التالية مباشرة.
                </div>
              )}

              {/* Action buttons */}
              <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={timerState.toggleTimer}
                  className="app-btn-primary px-5"
                >
                  {timerState.isRunning ? <Icons.Pause /> : <Icons.PlaySmall />}
                  {timerState.isRunning ? 'Pause' : timerState.isPaused ? 'Resume' : 'Start'}
                </button>
                <button
                  type="button"
                  onClick={timerState.resetTimer}
                  className="app-btn-secondary px-4"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={timerState.skipToNextPhase}
                  className="app-btn-secondary px-4"
                >
                  Skip
                </button>
              </div>

              {/* Quick stats */}
              <div className="mt-5 grid gap-2.5 md:grid-cols-3">
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>النمط</div>
                  <div className="mt-1 text-[14px] font-bold">{timerPresets.find((preset) => preset.id === timerPreset)?.label}</div>
                </div>
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>المنجز</div>
                  <div className="mt-1 text-[14px] font-bold">{formatHoursMins(currentSubject?.studiedSeconds || 0)}</div>
                </div>
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>الجلسات</div>
                  <div className="mt-1 text-[14px] font-bold tabular-nums">{currentSubject?.sessions || 0}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Sidebar controls */}
          <div className="space-y-4">
            <SectionCard title="المادة الحالية" subtitle="غيّر المادة أو اختر المهمة الحالية.">
              <div className="space-y-3">
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
            </SectionCard>

            <SectionCard title="أنماط الجلسات" subtitle={presetDescription}>
              <div className="space-y-2">
                {timerPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => changeTimerPreset(preset.id)}
                    className="w-full rounded-[18px] border p-3.5 text-right transition-all duration-200"
                    style={{
                      backgroundColor: preset.id === timerPreset ? 'var(--c-accent-soft)' : 'var(--c-surface-alt)',
                      borderColor: preset.id === timerPreset ? 'rgba(139, 92, 246, 0.25)' : 'var(--c-border)',
                    }}
                  >
                    <div className="text-[13px] font-bold">{preset.label}</div>
                    <div className="mt-1 text-[10px] leading-5" style={{ color: 'var(--c-text-muted)' }}>{preset.description}</div>
                  </button>
                ))}
              </div>
            </SectionCard>

            <SectionCard
              title="إعدادات الجلسة"
              subtitle="تبقى مخفية حتى لا تشتت التركيز."
              action={(
                <button
                  type="button"
                  onClick={() => setSettingsOpen((value) => !value)}
                  className="app-btn-secondary min-h-0 px-3 py-1.5 text-[11px]"
                >
                  {settingsOpen ? 'إخفاء' : 'إظهار'}
                </button>
              )}
            >
              {settingsOpen ? (
                <div className="space-y-3">
                  <div className="grid gap-2.5 grid-cols-2">
                    <label className="text-right">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>Focus</span>
                      <input
                        type="number"
                        min="1"
                        value={appData.pomodoroSettings.focusMinutes}
                        onChange={(event) => updatePomodoroSettings({ focusMinutes: Number.parseInt(event.target.value, 10) || 25 })}
                        className="w-full rounded-xl border px-3 py-2 text-[12px]"
                        style={inputStyle}
                      />
                    </label>
                    <label className="text-right">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>Custom focus</span>
                      <input
                        type="number"
                        min="5"
                        value={appData.pomodoroSettings.customFocusMinutes}
                        onChange={(event) => updatePomodoroSettings({ customFocusMinutes: Number.parseInt(event.target.value, 10) || 45 })}
                        className="w-full rounded-xl border px-3 py-2 text-[12px]"
                        style={inputStyle}
                      />
                    </label>
                    <label className="text-right">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>Short break</span>
                      <input
                        type="number"
                        min="1"
                        value={appData.pomodoroSettings.shortBreakMinutes}
                        onChange={(event) => updatePomodoroSettings({ shortBreakMinutes: Number.parseInt(event.target.value, 10) || 5 })}
                        className="w-full rounded-xl border px-3 py-2 text-[12px]"
                        style={inputStyle}
                      />
                    </label>
                    <label className="text-right">
                      <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>Long break</span>
                      <input
                        type="number"
                        min="1"
                        value={appData.pomodoroSettings.longBreakMinutes}
                        onChange={(event) => updatePomodoroSettings({ longBreakMinutes: Number.parseInt(event.target.value, 10) || 15 })}
                        className="w-full rounded-xl border px-3 py-2 text-[12px]"
                        style={inputStyle}
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                  الإعدادات مخفية الآن حتى تبقى الصفحة في وضع تركيز حقيقي. افتحها فقط عند الحاجة.
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      )}
    </div>
  );
}
