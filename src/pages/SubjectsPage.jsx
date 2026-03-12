import { useMemo, useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import Drawer from '../components/ui/Drawer';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../components/ui/ToastProvider';
import { useConfirm } from '../components/ui/ConfirmDialogProvider';
import { formatHoursMins, formatTimestampInTimeZone } from '../utils/helpers';

export default function SubjectsPage() {
  const {
    appData,
    addSubject,
    updateSubject,
    removeSubject,
    addTask,
    toggleTask,
    deleteTask,
    setActiveSubject,
    setActiveTaskId,
  } = useAppData();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [draftSubject, setDraftSubject] = useState({ name: '', goalHours: 50 });
  const [selectedSubjectName, setSelectedSubjectName] = useState('');
  const [taskDraft, setTaskDraft] = useState({ title: '', estimatedMinutes: 45 });

  const subjects = useMemo(() => {
    return Object.entries(appData.subjects)
      .map(([name, subject]) => ({
        ...subject,
        name,
        progressPercent: subject.goalHours > 0 ? Math.min(100, ((subject.studiedSeconds / 3600) / subject.goalHours) * 100) : 0,
        openTasks: subject.tasks.filter((task) => !task.done).length,
      }))
      .filter((subject) => {
        const matchesSearch = subject.name.toLowerCase().includes(search.trim().toLowerCase());
        const matchesStatus = statusFilter === 'all'
          || (statusFilter === 'active' && subject.openTasks > 0)
          || (statusFilter === 'done' && subject.progressPercent >= 100);

        return matchesSearch && matchesStatus;
      })
      .sort((left, right) => right.studiedSeconds - left.studiedSeconds);
  }, [appData.subjects, search, statusFilter]);

  const selectedSubject = selectedSubjectName ? appData.subjects[selectedSubjectName] : null;

  const handleAddSubject = () => {
    const wasCreated = addSubject(draftSubject.name, Number.parseInt(draftSubject.goalHours, 10) || 50);

    if (!wasCreated) {
      showToast({
        tone: 'warning',
        title: 'تعذر إضافة المادة',
        description: 'تأكد أن الاسم غير فارغ وغير مكرر.',
      });
      return;
    }

    setDraftSubject({ name: '', goalHours: 50 });
    showToast({
      tone: 'success',
      title: 'تمت إضافة المادة',
      description: 'يمكنك الآن إضافة مهام وبدء الجلسات عليها.',
    });
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubjectName) return;

    const approved = await confirm({
      title: 'حذف المادة',
      description: `سيتم حذف ${selectedSubjectName} مع مهامها وسجل جلساتها المرتبط بها.`,
      confirmLabel: 'نعم، احذف',
      cancelLabel: 'إلغاء',
      tone: 'danger',
    });

    if (!approved) return;

    removeSubject(selectedSubjectName);
    setSelectedSubjectName('');
    showToast({
      tone: 'success',
      title: 'تم حذف المادة',
      description: 'أزلنا المادة وكل البيانات المرتبطة بها بأمان.',
    });
  };

  const handleAddTask = () => {
    if (!selectedSubjectName || !taskDraft.title.trim()) return;

    addTask(selectedSubjectName, taskDraft.title, Number.parseInt(taskDraft.estimatedMinutes, 10) || 45);
    setTaskDraft({ title: '', estimatedMinutes: 45 });
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Subjects"
        title="مركز المواد"
        description="كل مادة في مكان واحد: التقدم، الوقت المنجز، المهام المفتوحة، وآخر جلسة."
      />

      <SectionCard title="إضافة مادة جديدة" subtitle="ابدأ ببساطة: اسم واضح وهدف تقريبي بالساعات.">
        <div className="grid gap-3 md:grid-cols-[1fr_160px_140px]">
          <input
            type="text"
            value={draftSubject.name}
            onChange={(event) => setDraftSubject((currentValue) => ({ ...currentValue, name: event.target.value }))}
            placeholder="اسم المادة"
            className="app-control"
            style={inputStyle}
          />
          <input
            type="number"
            min="1"
            value={draftSubject.goalHours}
            onChange={(event) => setDraftSubject((currentValue) => ({ ...currentValue, goalHours: event.target.value }))}
            className="app-control"
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleAddSubject}
            className="app-btn-primary"
          >
            إضافة مادة
          </button>
        </div>
      </SectionCard>

      <SectionCard
        title="المواد"
        subtitle="ابحث، صفِّ، وافتح التفاصيل من Drawer منظم."
        action={(
          <div className="flex flex-wrap gap-2.5">
            <div className="relative min-w-[220px] flex-1 sm:flex-none">
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-faint)' }}>
                <Icons.Search />
              </div>
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="ابحث باسم المادة"
                className="app-control pr-10"
                style={inputStyle}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="app-control sm:w-[170px]"
              style={inputStyle}
            >
              <option value="all">كل المواد</option>
              <option value="active">بها مهام</option>
              <option value="done">مكتملة</option>
            </select>
          </div>
        )}
      >
        {subjects.length === 0 ? (
          <EmptyState
            icon={<Icons.Book />}
            title="لا توجد مواد مطابقة"
            description="جرّب تغيير الفلاتر أو أضف مادة جديدة لتبدأ بناء الخطة."
          />
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject) => (
              <button
                key={subject.name}
                type="button"
                onClick={() => {
                  setSelectedSubjectName(subject.name);
                  setActiveSubject(subject.name);
                  if (subject.tasks[0]) {
                    setActiveTaskId(subject.tasks[0].id);
                  }
                }}
                className="rounded-2xl border p-5 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5"
                style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-[15px] font-bold truncate">{subject.name}</div>
                    <div className="mt-1.5 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                      {formatHoursMins(subject.studiedSeconds)} من {subject.goalHours}h
                    </div>
                  </div>
                  <div className="rounded-full px-2.5 py-1 text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}
                  >
                    {subject.progressPercent.toFixed(0)}%
                  </div>
                </div>

                <div className="mt-3.5 h-1.5 overflow-hidden rounded-full" style={{ backgroundColor: 'var(--c-elevated)' }}>
                  <div className="h-full rounded-full bg-gradient-to-l from-violet-500 to-cyan-400 transition-all duration-500" style={{ width: `${subject.progressPercent}%` }} />
                </div>

                <div className="mt-3.5 grid gap-2 grid-cols-2">
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>المهام المفتوحة</div>
                    <div className="mt-1 text-sm font-bold">{subject.openTasks}</div>
                  </div>
                  <div>
                    <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>آخر جلسة</div>
                    <div className="mt-1 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                      {subject.lastSessionAt
                        ? formatTimestampInTimeZone(subject.lastSessionAt, appData.userProfile.timezone, 'ar', { month: 'short', day: 'numeric' })
                        : 'لا توجد'}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <Drawer
        open={Boolean(selectedSubject)}
        onClose={() => setSelectedSubjectName('')}
        title={selectedSubjectName}
        subtitle="تعديل الهدف، تنظيم المهام، ومراجعة أداء المادة."
      >
        {selectedSubject && (
          <>
            <SectionCard title="ملخص سريع">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border p-3.5" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>المنجز</div>
                  <div className="mt-1.5 text-lg font-bold">{formatHoursMins(selectedSubject.studiedSeconds)}</div>
                </div>
                <div className="rounded-2xl border p-3.5" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>الجلسات</div>
                  <div className="mt-1.5 text-lg font-bold tabular-nums">{selectedSubject.sessions}</div>
                </div>
                <div className="rounded-2xl border p-3.5" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em]" style={{ color: 'var(--c-text-faint)' }}>الهدف</div>
                  <div className="mt-1.5 text-lg font-bold tabular-nums">{selectedSubject.goalHours}h</div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="تعديل المادة">
              <div className="grid gap-3 md:grid-cols-2">
                <input
                  type="number"
                  min="1"
                  value={selectedSubject.goalHours}
                  onChange={(event) => updateSubject(selectedSubjectName, {
                    goalHours: Number.parseInt(event.target.value, 10) || 1,
                  })}
                  className="rounded-xl border px-4 py-2.5 text-[13px]"
                  style={inputStyle}
                />
                <textarea
                  rows="3"
                  value={selectedSubject.notes}
                  onChange={(event) => updateSubject(selectedSubjectName, { notes: event.target.value })}
                  placeholder="ملاحظات سريعة عن المادة أو الخطة القادمة"
                  className="rounded-xl border px-4 py-2.5 text-[13px]"
                  style={inputStyle}
                />
              </div>
            </SectionCard>

            <SectionCard title="المهام / Topics">
              <div className="grid gap-3 md:grid-cols-[1fr_150px_100px]">
                <input
                  type="text"
                  value={taskDraft.title}
                  onChange={(event) => setTaskDraft((currentValue) => ({ ...currentValue, title: event.target.value }))}
                  placeholder="اسم المهمة أو الفصل"
                  className="rounded-xl border px-4 py-2.5 text-[13px]"
                  style={inputStyle}
                />
                <input
                  type="number"
                  min="5"
                  value={taskDraft.estimatedMinutes}
                  onChange={(event) => setTaskDraft((currentValue) => ({ ...currentValue, estimatedMinutes: event.target.value }))}
                  className="rounded-xl border px-4 py-2.5 text-[13px]"
                  style={inputStyle}
                />
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="rounded-xl bg-violet-600 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-violet-500"
                >
                  إضافة
                </button>
              </div>

              <div className="mt-4 space-y-2.5">
                {selectedSubject.tasks.length === 0 ? (
                  <div className="text-[13px]" style={{ color: 'var(--c-text-muted)' }}>
                    لا توجد مهام بعد. أضف Topic أو Chapter لتتحول المادة من ساعات عامة إلى خطة قابلة للتنفيذ.
                  </div>
                ) : (
                  selectedSubject.tasks.map((task) => (
                    <div key={task.id} className="flex items-center justify-between gap-3 rounded-2xl border p-3.5"
                      style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleTask(selectedSubjectName, task.id)}
                          className="rounded-full p-1 shrink-0 transition-colors"
                          style={{ color: task.done ? 'var(--c-success)' : 'var(--c-text-faint)' }}
                        >
                          {task.done ? <Icons.CheckCircle /> : <Icons.ListTodo />}
                        </button>
                        <div className="text-right min-w-0">
                          <div className="text-[13px] font-bold truncate" style={{ textDecoration: task.done ? 'line-through' : 'none', opacity: task.done ? 0.6 : 1 }}>
                            {task.title}
                          </div>
                          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-faint)' }}>
                            تقدير: {task.estimatedMinutes} دقيقة
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => deleteTask(selectedSubjectName, task.id)}
                        className="rounded-xl border px-3 py-1.5 text-[12px] font-semibold shrink-0 transition-colors hover:bg-red-500/10"
                        style={{ borderColor: 'var(--c-border)', color: 'var(--c-danger)' }}
                      >
                        حذف
                      </button>
                    </div>
                  ))
                )}
              </div>
            </SectionCard>

            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={handleDeleteSubject}
                className="rounded-xl bg-red-500/12 px-4 py-2.5 text-[13px] font-bold transition-colors hover:bg-red-500/18"
                style={{ color: 'var(--c-danger)' }}
              >
                حذف المادة
              </button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
