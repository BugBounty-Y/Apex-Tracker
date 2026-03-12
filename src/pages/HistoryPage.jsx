import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { formatTimestampInTimeZone, getDateKeyInTimeZone } from '../utils/helpers';

function formatDateTime(value, userTimezone) {
  return formatTimestampInTimeZone(value, userTimezone, 'ar', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function HistoryPage() {
  const { appData } = useAppData();
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const sessions = useMemo(() => appData.studySessions.filter((session) => {
    const matchesSubject = subjectFilter === 'all' || session.subject === subjectFilter;
    const matchesType = typeFilter === 'all' || session.mode === typeFilter || session.type === typeFilter;
    const matchesStatus = statusFilter === 'all'
      || (statusFilter === 'completed' && session.completed)
      || (statusFilter === 'stopped' && !session.completed);
    const sessionDateKey = getDateKeyInTimeZone(new Date(session.startedAt), appData.userProfile.timezone);
    const matchesFrom = !fromDate || sessionDateKey >= fromDate;
    const matchesTo = !toDate || sessionDateKey <= toDate;

    return matchesSubject && matchesType && matchesStatus && matchesFrom && matchesTo;
  }), [
    appData.studySessions,
    appData.userProfile.timezone,
    fromDate,
    statusFilter,
    subjectFilter,
    toDate,
    typeFilter,
  ]);

  return (
    <div className="app-page">
      <PageHeader
        eyebrow="History"
        title="سجل جلسات الدراسة"
        description="جدول نظيف يوضح المادة والبداية والنهاية والمدة والنمط والحالة، مع فلاتر واضحة."
      />

      <SectionCard title="الفلاتر">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="rounded-[12px] border px-4 py-3"
            style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          >
            <option value="all">كل المواد</option>
            {Object.keys(appData.subjects).map((subjectName) => (
              <option key={subjectName} value={subjectName}>{subjectName}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="rounded-[12px] border px-4 py-3"
            style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          >
            <option value="all">كل الأنماط</option>
            <option value="pomodoro">Pomodoro</option>
            <option value="custom">Custom Focus</option>
            <option value="stopwatch">Stopwatch</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-[12px] border px-4 py-3"
            style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          >
            <option value="all">كل الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="stopped">متوقفة</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="rounded-[12px] border px-4 py-3"
            style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="rounded-[12px] border px-4 py-3"
            style={{ backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' }}
          />
        </div>
      </SectionCard>

      <SectionCard title="الجلسات">
        {sessions.length === 0 ? (
          <EmptyState
            icon={<Icons.History />}
            title="لا توجد جلسات مطابقة"
            description="جرّب تغيير الفلاتر أو ابدأ جلسة جديدة ليظهر السجل هنا مباشرة."
          />
        ) : (
          <div className="overflow-hidden rounded-[20px] border" style={{ borderColor: 'var(--c-border)' }}>
            <div
              className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b px-5 py-4 text-xs font-semibold uppercase tracking-[0.24em] md:grid"
              style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)', color: 'var(--c-text-faint)' }}
            >
              <div>المادة</div>
              <div>البداية</div>
              <div>النهاية</div>
              <div>المدة</div>
              <div>الحالة</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {sessions.map((session) => (
                <div key={session.id} className="grid gap-3 px-5 py-4 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center">
                  <div className="text-right">
                    <div className="font-semibold">{session.subject}</div>
                    <div className="mt-1 text-xs" style={{ color: 'var(--c-text-faint)' }}>
                      {session.taskTitle || session.mode}
                    </div>
                  </div>
                  <div className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{formatDateTime(session.startedAt, appData.userProfile.timezone)}</div>
                  <div className="text-sm" style={{ color: 'var(--c-text-muted)' }}>{formatDateTime(session.endedAt, appData.userProfile.timezone)}</div>
                  <div className="font-semibold tabular-nums">{Math.round(session.durationSeconds / 60)}m</div>
                  <div>
                    <span
                      className="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        backgroundColor: session.completed ? 'rgba(52, 211, 153, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: session.completed ? '#34d399' : '#f59e0b',
                      }}
                    >
                      {session.completed ? 'مكتملة' : 'متوقفة'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
