import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';

function formatHours(seconds) {
  return (seconds / 3600).toFixed(1);
}

export default function InsightsPage() {
  const { weeklyStats, monthlyStats, subjectBreakdown, heatmapData } = useAppData();

  if (subjectBreakdown.length === 0) {
    return (
      <div className="app-page">
        <PageHeader
          eyebrow="Insights"
          title="Insights"
          description="تحليلات بسيطة وواضحة تفهمها بسرعة بدل رسوم معقدة لا تخبرك بماذا تفعل."
        />
        <EmptyState
          icon={<Icons.BarChart3 />}
          title="لا توجد بيانات كافية بعد"
          description="أكمل بعض الجلسات أولًا لتبدأ لوحة التحليلات في إظهار الأنماط والمقارنات."
        />
      </div>
    );
  }

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Insights"
        title="لوحة التحليلات"
        description="الأسبوع، الشهر، توزيع المواد، والالتزام الفعلي بالأهداف في مكان واحد."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={<Icons.Zap />} label="الأسبوع" value={`${weeklyStats.weeklyHours.toFixed(1)}h`} hint={`${weeklyStats.weeklyCompletion.toFixed(0)}% من الهدف الأسبوعي`} accent="#22d3ee" />
        <StatCard icon={<Icons.Orbit />} label="الشهر" value={`${monthlyStats.monthlyHours.toFixed(1)}h`} hint={`${monthlyStats.monthlyCompletion.toFixed(0)}% من الهدف الشهري`} accent="#34d399" />
        <StatCard icon={<Icons.Brain />} label="متوسط الجلسة" value={`${weeklyStats.averageSessionMinutes}m`} hint="متوسط الدقائق لكل جلسة محفوظة." accent="#a78bfa" />
        <StatCard icon={<Icons.Medal />} label="جلسات مكتملة" value={monthlyStats.completedSessions} hint="عدد الجلسات المكتملة في السجل الحالي." accent="#fbbf24" />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <SectionCard title="آخر 7 أيام" subtitle="نمط الدراسة اليومي دون مبالغة بصرية.">
          <div className="space-y-3">
            {weeklyStats.last7Days.map((entry) => (
              <div key={entry.dateKey} className="grid gap-3 md:grid-cols-[100px_1fr_70px] md:items-center">
                <div className="text-[13px] font-semibold">{entry.dateKey}</div>
                <div className="app-progress">
                  <div
                    className="app-progress-bar"
                    style={{ width: `${Math.min(100, (entry.seconds / Math.max(1, weeklyStats.weeklyGoal * 360)) * 100)}%` }}
                  />
                </div>
                <div className="text-left text-[13px] font-semibold tabular-nums">{formatHours(entry.seconds)}h</div>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="مقارنة الأهداف" subtitle="هل أنت على المسار الصحيح هذا الأسبوع والشهر؟">
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">الأسبوع</span>
                <span className="tabular-nums" style={{ color: 'var(--c-text-muted)' }}>
                  {weeklyStats.weeklyHours.toFixed(1)}h / {weeklyStats.weeklyGoal}h
                </span>
              </div>
              <div className="app-progress">
                <div className="app-progress-bar" style={{ width: `${weeklyStats.weeklyCompletion}%`, background: 'linear-gradient(90deg, #22d3ee, #34d399)' }} />
              </div>
            </div>
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="font-semibold">الشهر</span>
                <span className="tabular-nums" style={{ color: 'var(--c-text-muted)' }}>
                  {monthlyStats.monthlyHours.toFixed(1)}h / {monthlyStats.monthlyGoal}h
                </span>
              </div>
              <div className="app-progress">
                <div className="app-progress-bar" style={{ width: `${monthlyStats.monthlyCompletion}%`, background: 'linear-gradient(90deg, var(--c-accent), #c084fc)' }} />
              </div>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="توزيع المواد" subtitle="أي المواد تأخذ معظم الوقت الفعلي؟">
          <div className="space-y-3">
            {subjectBreakdown.map((subject) => {
              const width = subjectBreakdown[0]?.studiedSeconds
                ? (subject.studiedSeconds / subjectBreakdown[0].studiedSeconds) * 100
                : 0;

              return (
                <div key={subject.name} className="grid gap-3 md:grid-cols-[160px_1fr_60px] md:items-center">
                  <div className="text-[13px] font-semibold">{subject.name}</div>
                  <div className="app-progress">
                    <div className="app-progress-bar" style={{ width: `${width}%` }} />
                  </div>
                  <div className="text-left text-[13px] font-semibold tabular-nums">{formatHours(subject.studiedSeconds)}h</div>
                </div>
              );
            })}
          </div>
        </SectionCard>

        <SectionCard title="Heatmap" subtitle="نظرة سريعة على كثافة الأيام الأخيرة.">
          <div className="grid grid-cols-7 gap-1.5">
            {heatmapData.map((entry) => (
              <div
                key={entry.dateKey}
                className="flex aspect-square items-center justify-center rounded-[var(--radius-sm)] text-[10px] font-semibold transition-colors"
                style={{
                  backgroundColor: entry.intensity === 0
                    ? 'var(--c-elevated)'
                    : `rgba(139, 92, 246, ${0.15 + (entry.intensity * 0.15)})`,
                  color: entry.intensity === 0 ? 'var(--c-text-faint)' : '#fff',
                }}
                title={`${entry.dateKey} · ${formatHours(entry.seconds)}h`}
              >
                {entry.dateKey.slice(-2)}
              </div>
            ))}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
