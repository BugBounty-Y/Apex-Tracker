import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { formatTimestampInTimeZone, getDateKeyInTimeZone } from '../utils/helpers';
import { getStudySessionEndTimestamp, getStudySessionStartTimestamp } from '../utils/studyData';

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
    const sessionStartMs = getStudySessionStartTimestamp(session);
    const sessionEndMs = getStudySessionEndTimestamp(session);
    if (!Number.isFinite(sessionStartMs)) return false;
    const sessionStartKey = getDateKeyInTimeZone(new Date(sessionStartMs), appData.userProfile.timezone);
    const sessionEndKey = getDateKeyInTimeZone(
      new Date(Number.isFinite(sessionEndMs) ? sessionEndMs : sessionStartMs),
      appData.userProfile.timezone,
    );
    const matchesFrom = !fromDate || sessionEndKey >= fromDate;
    const matchesTo = !toDate || sessionStartKey <= toDate;

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

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="History"
        title="سجل جلسات الدراسة"
        description="جدول نظيف يوضح المادة والبداية والنهاية والمدة والنمط والحالة، مع فلاتر واضحة."
      />

      <SectionCard title="الفلاتر">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="app-control"
            style={inputStyle}
          >
            <option value="all">كل المواد</option>
            {Object.keys(appData.subjects).map((subjectName) => (
              <option key={subjectName} value={subjectName}>{subjectName}</option>
            ))}
          </select>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value)}
            className="app-control"
            style={inputStyle}
          >
            <option value="all">كل الأنماط</option>
            <option value="pomodoro">Pomodoro</option>
            <option value="custom">Custom Focus</option>
            <option value="stopwatch">Stopwatch</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="app-control"
            style={inputStyle}
          >
            <option value="all">كل الحالات</option>
            <option value="completed">مكتملة</option>
            <option value="stopped">متوقفة</option>
          </select>

          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
            className="app-control"
            style={inputStyle}
          />

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
            className="app-control"
            style={inputStyle}
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
          <div className="overflow-hidden rounded-[var(--radius-lg)] border" style={{ borderColor: 'var(--c-border)' }}>
            <div
              className="hidden grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b px-5 py-3 md:grid"
              style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
            >
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>المادة</div>
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>البداية</div>
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>النهاية</div>
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>المدة</div>
              <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>الحالة</div>
            </div>

            <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
              {sessions.map((session) => (
                <div key={session.id} className="grid gap-2 px-5 py-3.5 md:grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] md:items-center">
                  <div className="text-right">
                    <div className="text-[13px] font-semibold">{session.subject}</div>
                    <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-faint)' }}>
                      {session.taskTitle || session.mode}
                    </div>
                  </div>
                  <div className="text-[13px]" style={{ color: 'var(--c-text-muted)' }}>{formatDateTime(session.startedAt, appData.userProfile.timezone)}</div>
                  <div className="text-[13px]" style={{ color: 'var(--c-text-muted)' }}>{formatDateTime(session.endedAt, appData.userProfile.timezone)}</div>
                  <div className="text-[13px] font-semibold tabular-nums">{Math.round(session.durationSeconds / 60)}m</div>
                  <div>
                    <span
                      className="app-chip"
                      style={{
                        backgroundColor: session.completed ? 'var(--c-success-soft)' : 'var(--c-warning-soft)',
                        color: session.completed ? 'var(--c-success)' : 'var(--c-warning)',
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
