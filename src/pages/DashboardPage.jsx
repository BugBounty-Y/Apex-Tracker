import { Link } from 'react-router-dom';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { formatDateKeyForDisplay, formatHoursMins, formatTimestampInTimeZone } from '../utils/helpers';

function formatSessionTime(timestamp, userTimezone) {
  if (!timestamp) return 'بدون جلسات';
  return formatTimestampInTimeZone(timestamp, userTimezone, 'ar', {
    hour: 'numeric',
    minute: '2-digit',
    month: 'short',
    day: 'numeric',
  });
}

function formatExamDate(dateKey) {
  return formatDateKeyForDisplay(dateKey, 'ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function DashboardPage() {
  const {
    appData,
    dashboardSummary,
    weeklyStats,
    streak,
  } = useAppData();

  const todayPlan = dashboardSummary.subjectBreakdown
    .map((subject) => ({
      ...subject,
      remainingHours: Math.max(0, subject.goalHours - (subject.studiedSeconds / 3600)),
      priorityScore: (subject.tasksOpen * 3) + Math.max(0, subject.goalHours - (subject.studiedSeconds / 3600)),
    }))
    .sort((left, right) => right.priorityScore - left.priorityScore)
    .slice(0, 4);

  const examDateLabel = formatExamDate(appData.userProfile.examDate);
  const hasExamDate = Boolean(examDateLabel);
  const remainingDaysValue = hasExamDate ? dashboardSummary.remainingDays : '—';
  const remainingDaysTitle = hasExamDate ? 'يوم متبقٍ حتى الامتحان' : 'حدد موعد الامتحان';
  const remainingDaysHint = hasExamDate
    ? dashboardSummary.remainingDays === 0
      ? 'موعد الامتحان اليوم، ركز على الأولويات النهائية.'
      : `حتى ${examDateLabel}`
    : 'أضف تاريخ الامتحان من الإعدادات ليظهر العد التنازلي هنا.';

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Dashboard"
        title={`مرحبًا ${appData.userProfile.name || 'طالب'}، ماذا ستفعل الآن؟`}
        description="هذه الصفحة تختصر عليك المشهد كله: أين وصلت، ماذا يتبقى عليك اليوم، وما أفضل خطوة تالية الآن."
        actions={(
          <Link
            to="/timer"
            className="app-btn-primary"
          >
            <Icons.PlaySmall />
            ابدأ جلسة
          </Link>
        )}
      />

      {/* Hero Section */}
      <section className="grid gap-5 xl:grid-cols-[1.45fr_0.9fr]">
        <div className="app-panel p-5 md:p-7"
          style={{ background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(34, 211, 238, 0.06))', borderColor: 'rgba(139, 92, 246, 0.18)' }}
        >
          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="text-right">
              <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--c-text-faint)' }}>
                Overall mission
              </div>
              <h2 className="mt-2 text-xl font-bold tracking-tight md:text-[28px] leading-tight" style={{ color: 'var(--c-text)' }}>
                {dashboardSummary.overallProgress.toFixed(0)}% من خطتك العامة مكتمل
              </h2>
              <p className="mt-2.5 max-w-2xl text-[12px] leading-6 md:text-[13px]" style={{ color: 'var(--c-text-muted)' }}>
                معك {dashboardSummary.openTasks} مهمة مفتوحة تحتاج ترتيبًا واضحًا اليوم، ويمكنك البدء الآن بالمادة الأقرب لتحقيق تقدم واضح.
              </p>

              <div className="mt-4 h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(15, 23, 42, 0.18)' }}>
                <div
                  className="h-full rounded-full bg-gradient-to-l from-violet-500 to-cyan-400 transition-all duration-700 ease-out"
                  style={{ width: `${dashboardSummary.overallProgress}%` }}
                />
              </div>

              <div className="mt-4 grid gap-2.5 sm:grid-cols-3">
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'rgba(17, 24, 39, 0.16)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--c-text-faint)' }}>Today</div>
                  <div className="mt-1 text-[18px] font-bold tabular-nums">{formatHoursMins(dashboardSummary.todaySeconds)}</div>
                </div>
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'rgba(17, 24, 39, 0.16)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--c-text-faint)' }}>Weekly goal</div>
                  <div className="mt-1 text-[18px] font-bold tabular-nums">{weeklyStats.weeklyHours.toFixed(1)}h</div>
                </div>
                <div className="rounded-[18px] border p-3" style={{ backgroundColor: 'rgba(17, 24, 39, 0.16)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.2em]" style={{ color: 'var(--c-text-faint)' }}>Streak</div>
                  <div className="mt-1 text-[18px] font-bold tabular-nums">{streak} يوم</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div
                className="app-panel p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(245, 158, 11, 0.05))',
                  borderColor: 'rgba(245, 158, 11, 0.22)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: '#fbbf24' }}>
                      الأيام المتبقية
                    </div>
                    <div className="mt-1.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                      {hasExamDate ? examDateLabel : 'لم يتم تحديد تاريخ الامتحان بعد'}
                    </div>
                  </div>
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.14)', color: '#fbbf24' }}
                  >
                    <Icons.Calendar />
                  </div>
                </div>

                <div className="mt-4 flex items-end justify-between gap-3">
                  <div className="text-right">
                    <div className="text-[40px] font-bold leading-none tabular-nums md:text-[46px]" style={{ color: '#fbbf24' }}>
                      {remainingDaysValue}
                    </div>
                    <div className="mt-1 text-[12px] font-semibold" style={{ color: 'var(--c-text)' }}>
                      {remainingDaysTitle}
                    </div>
                  </div>
                  <div
                    className="rounded-full px-3 py-1 text-[10px] font-semibold"
                    style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', color: '#fbbf24' }}
                  >
                    Countdown
                  </div>
                </div>

                <div className="mt-3 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                  {remainingDaysHint}
                </div>
              </div>

              <div className="app-panel-muted p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{ color: 'var(--c-text-faint)' }}>
                  Quick next step
                </div>
                {todayPlan[0] ? (
                  <>
                    <div className="mt-2.5 text-[16px] font-bold">{todayPlan[0].name}</div>
                    <div className="mt-1.5 text-[12px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                      {todayPlan[0].tasksOpen > 0
                        ? `${todayPlan[0].tasksOpen} مهام مفتوحة تحتاج تركيزك الآن.`
                        : `لا توجد مهام مفتوحة، لكن ما زال لديك ${todayPlan[0].remainingHours.toFixed(1)} ساعة متبقية.`}
                    </div>
                    <Link
                      to="/timer"
                      className="app-btn-secondary mt-3.5"
                    >
                      افتح المؤقت
                      <Icons.ArrowUpRight />
                    </Link>
                  </>
                ) : (
                  <div className="mt-3 text-[13px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                    أضف أول مادة لتبدأ الخطة اليومية تلقائيًا.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-1">
          <StatCard icon={<Icons.ClockBurst />} label="وقت اليوم" value={formatHoursMins(dashboardSummary.todaySeconds)} hint="المسجل حتى هذه اللحظة." accent="#22d3ee" />
          <StatCard icon={<Icons.Crown />} label="الاستمرارية" value={`${streak} يوم`} hint="كل يوم يحتوي 25 دقيقة فأكثر." accent="#f97316" />
          <StatCard icon={<Icons.Rocket />} label="المطلوب اليوم" value={`${Math.max(1, Math.ceil((weeklyStats.weeklyGoal - weeklyStats.weeklyHours) / Math.max(1, 7 - dashboardSummary.weeklyStats.last7Days.filter((entry) => entry.seconds > 0).length)))}h`} hint="تقريب سريع لإغلاق الفجوة الأسبوعية." accent="#a78bfa" />
          <StatCard icon={<Icons.Sparkles />} label="الهدف الأسبوعي" value={`${weeklyStats.weeklyCompletion.toFixed(0)}%`} hint={`${weeklyStats.weeklyHours.toFixed(1)}h من ${weeklyStats.weeklyGoal}h`} accent="#34d399" />
        </div>
      </section>

      {/* Today Plan & Recent Sessions */}
      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.95fr]">
        <SectionCard
          title="خطة اليوم"
          subtitle="المواد التالية هي الأفضل لتبدأ بها الآن حسب المهام المفتوحة والتقدّم المتبقي."
        >
          {todayPlan.length === 0 ? (
            <EmptyState
              icon={<Icons.Book />}
              title="لا توجد مواد بعد"
              description="أضف مادة واحدة على الأقل من صفحة Subjects ليظهر لك ترتيب واضح لليوم."
              action={(
                <Link
                  to="/subjects"
                  className="app-btn-primary"
                >
                  <Icons.Plus />
                  أضف مادة
                </Link>
              )}
            />
          ) : (
            <div className="space-y-2.5">
              {todayPlan.map((subject, index) => (
                <div
                  key={subject.name}
                  className="grid gap-3 rounded-[18px] border p-3.5 md:grid-cols-[54px_1fr_120px] items-center"
                  style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
                >
                  <div className="rounded-xl px-3 py-2.5 text-center text-[12px] font-bold tabular-nums"
                    style={{ backgroundColor: index === 0 ? 'rgba(139, 92, 246, 0.16)' : 'var(--c-elevated)', color: index === 0 ? 'var(--c-nav-active)' : 'var(--c-text-muted)' }}
                  >
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{subject.name}</div>
                    <div className="mt-1 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                      {subject.tasksOpen > 0 ? `${subject.tasksOpen} مهام مفتوحة` : 'لا توجد مهام مفتوحة'} ·
                      {' '}
                      متبقٍ {subject.remainingHours.toFixed(1)} ساعة
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>
                      آخر جلسة
                    </div>
                    <div className="mt-1 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                      {formatSessionTime(subject.lastSessionAt, appData.userProfile.timezone)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <div className="space-y-4">
          <SectionCard title="آخر الجلسات" subtitle="ما الذي حدث مؤخرًا؟">
            {dashboardSummary.recentSessions.length === 0 ? (
              <EmptyState
                icon={<Icons.History />}
                title="السجل ما زال فارغًا"
                description="ابدأ أول جلسة وستظهر هنا آخر الأنشطة مباشرة."
              />
            ) : (
              <div className="space-y-2">
                {dashboardSummary.recentSessions.map((session) => (
                  <div key={session.id} className="rounded-[18px] border p-3"
                    style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-right min-w-0 flex-1">
                        <div className="text-[13px] font-bold truncate">{session.subject}</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-faint)' }}>
                          {session.taskTitle || 'جلسة بدون مهمة محددة'}
                        </div>
                      </div>
                      <div className="text-left shrink-0">
                        <div className="text-[13px] font-bold tabular-nums">{Math.round(session.durationSeconds / 60)}m</div>
                        <div className="mt-0.5 text-[11px]" style={{ color: session.completed ? 'var(--c-success)' : 'var(--c-warning)' }}>
                          {session.completed ? 'مكتملة' : 'متوقفة'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>

          <SectionCard title="إنجازات خفيفة" subtitle="شارات بسيطة بدون ضجيج.">
            {appData.userProfile.badges.length === 0 ? (
              <div className="text-[13px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                ستظهر هنا أولى شاراتك عند إنهاء جلساتك الأولى أو بناء streak جيد.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {appData.userProfile.badges.map((badge) => (
                  <div
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] font-semibold"
                    style={{ backgroundColor: 'var(--c-success-soft)', color: 'var(--c-success)' }}
                  >
                    <Icons.Trophy />
                    {badge}
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </section>
    </div>
  );
}
