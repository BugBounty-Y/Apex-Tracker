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
          <Link to="/timer" className="app-btn-primary">
            <Icons.PlaySmall />
            ابدأ جلسة
          </Link>
        )}
      />

      {/* Stats Grid */}
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Icons.ClockBurst />} label="وقت اليوم" value={formatHoursMins(dashboardSummary.todaySeconds)} hint="المسجل حتى هذه اللحظة." accent="#22d3ee" />
        <StatCard icon={<Icons.Crown />} label="الاستمرارية" value={`${streak} يوم`} hint="كل يوم يحتوي 25 دقيقة فأكثر." accent="#f97316" />
        <StatCard icon={<Icons.Rocket />} label="المطلوب اليوم" value={`${Math.max(1, Math.ceil((weeklyStats.weeklyGoal - weeklyStats.weeklyHours) / Math.max(1, 7 - dashboardSummary.weeklyStats.last7Days.filter((entry) => entry.seconds > 0).length)))}h`} hint="تقريب سريع لإغلاق الفجوة الأسبوعية." accent="#a78bfa" />
        <StatCard icon={<Icons.Sparkles />} label="الهدف الأسبوعي" value={`${weeklyStats.weeklyCompletion.toFixed(0)}%`} hint={`${weeklyStats.weeklyHours.toFixed(1)}h من ${weeklyStats.weeklyGoal}h`} accent="#34d399" />
      </section>

      {/* Mission & Countdown */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        {/* Overall mission */}
        <SectionCard
          title="المهمة العامة"
          subtitle={`${dashboardSummary.overallProgress.toFixed(0)}% من خطتك العامة مكتمل — معك ${dashboardSummary.openTasks} مهمة مفتوحة.`}
        >
          <div className="space-y-4">
            {/* Main progress bar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[12px] font-semibold" style={{ color: 'var(--c-text-muted)' }}>التقدم الإجمالي</span>
                <span className="text-[13px] font-bold tabular-nums">{dashboardSummary.overallProgress.toFixed(0)}%</span>
              </div>
              <div className="app-progress">
                <div
                  className="app-progress-bar"
                  style={{ width: `${dashboardSummary.overallProgress}%` }}
                />
              </div>
            </div>

            {/* Inline stats */}
            <div className="grid gap-2.5 sm:grid-cols-3">
              <div className="rounded-[var(--radius-md)] p-3" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>Today</div>
                <div className="mt-1 text-base font-bold tabular-nums">{formatHoursMins(dashboardSummary.todaySeconds)}</div>
              </div>
              <div className="rounded-[var(--radius-md)] p-3" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>Weekly goal</div>
                <div className="mt-1 text-base font-bold tabular-nums">{weeklyStats.weeklyHours.toFixed(1)}h</div>
              </div>
              <div className="rounded-[var(--radius-md)] p-3" style={{ backgroundColor: 'var(--c-surface-alt)' }}>
                <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>Streak</div>
                <div className="mt-1 text-base font-bold tabular-nums">{streak} يوم</div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Countdown */}
        <div className="space-y-4">
          <div
            className="app-panel p-5"
            style={{
              borderColor: 'rgba(251, 191, 36, 0.15)',
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="text-right">
                <div className="app-label mb-0" style={{ fontSize: '0.625rem', color: 'var(--c-warning)' }}>
                  الأيام المتبقية
                </div>
                <div className="mt-1 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                  {hasExamDate ? examDateLabel : 'لم يتم تحديد تاريخ الامتحان بعد'}
                </div>
              </div>
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                style={{ backgroundColor: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}
              >
                <Icons.Calendar />
              </div>
            </div>

            <div className="mt-4 flex items-end justify-between gap-3">
              <div className="text-right">
                <div className="text-[36px] font-bold leading-none tabular-nums md:text-[42px]" style={{ color: 'var(--c-warning)', letterSpacing: '-0.03em' }}>
                  {remainingDaysValue}
                </div>
                <div className="mt-1 text-[12px] font-semibold" style={{ color: 'var(--c-text)' }}>
                  {remainingDaysTitle}
                </div>
              </div>
              <div className="app-chip" style={{ backgroundColor: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}>
                Countdown
              </div>
            </div>

            <div className="mt-3 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
              {remainingDaysHint}
            </div>
          </div>

          {/* Quick next step */}
          <SectionCard title="الخطوة التالية">
            {todayPlan[0] ? (
              <>
                <div className="text-[15px] font-bold">{todayPlan[0].name}</div>
                <div className="mt-1.5 text-[12px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                  {todayPlan[0].tasksOpen > 0
                    ? `${todayPlan[0].tasksOpen} مهام مفتوحة تحتاج تركيزك الآن.`
                    : `لا توجد مهام مفتوحة، لكن ما زال لديك ${todayPlan[0].remainingHours.toFixed(1)} ساعة متبقية.`}
                </div>
                <Link to="/timer" className="app-btn-secondary mt-3">
                  افتح المؤقت
                  <Icons.ArrowUpRight />
                </Link>
              </>
            ) : (
              <div className="text-[13px] leading-6" style={{ color: 'var(--c-text-muted)' }}>
                أضف أول مادة لتبدأ الخطة اليومية تلقائيًا.
              </div>
            )}
          </SectionCard>
        </div>
      </section>

      {/* Today Plan & Recent Sessions */}
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          title="خطة اليوم"
          subtitle="المواد التالية هي الأفضل لتبدأ بها الآن حسب المهام المفتوحة والتقدّم المتبقي."
        >
          {todayPlan.length === 0 ? (
            <EmptyState
              icon={<Icons.Book />}
              title="لا توجد مواد بعد"
              description="أضف مادة واحدة على الأقل من صفحة المواد ليظهر لك ترتيب واضح لليوم."
              action={(
                <Link to="/subjects" className="app-btn-primary">
                  <Icons.Plus />
                  أضف مادة
                </Link>
              )}
            />
          ) : (
            <div className="space-y-2">
              {todayPlan.map((subject, index) => (
                <div
                  key={subject.name}
                  className="grid gap-3 rounded-[var(--radius-lg)] border p-3.5 md:grid-cols-[48px_1fr_110px] items-center"
                  style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
                >
                  <div
                    className="rounded-[var(--radius-md)] px-2.5 py-2 text-center text-[12px] font-bold tabular-nums"
                    style={{
                      backgroundColor: index === 0 ? 'var(--c-accent-soft)' : 'var(--c-elevated)',
                      color: index === 0 ? 'var(--c-nav-active)' : 'var(--c-text-muted)',
                    }}
                  >
                    #{index + 1}
                  </div>
                  <div className="text-right">
                    <div className="text-[13px] font-bold">{subject.name}</div>
                    <div className="mt-0.5 text-[11px] leading-5" style={{ color: 'var(--c-text-muted)' }}>
                      {subject.tasksOpen > 0 ? `${subject.tasksOpen} مهام مفتوحة` : 'لا توجد مهام مفتوحة'} ·
                      {' '}متبقٍ {subject.remainingHours.toFixed(1)} ساعة
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>آخر جلسة</div>
                    <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
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
                  <div
                    key={session.id}
                    className="rounded-[var(--radius-lg)] border p-3"
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
                    className="app-chip"
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
