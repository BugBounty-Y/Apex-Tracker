import { useMemo, useRef, useState } from 'react';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import Drawer from '../components/ui/Drawer';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../components/ui/ToastProvider';
import { useConfirm } from '../components/ui/ConfirmDialogProvider';
import { formatHoursMins, formatTimestampInTimeZone } from '../utils/helpers';

/* ─── Inline Quick-Add Task Component ─── */
function QuickAddTask({ subjectName, onAdd }) {
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const inputRef = useRef(null);

  const handleSubmit = (event) => {
    event?.preventDefault?.();
    const trimmed = title.trim();
    if (!trimmed) return;

    onAdd(subjectName, trimmed, Number.parseInt(estimatedMinutes, 10) || 45);
    setTitle('');
    setEstimatedMinutes(45);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSubmit();
    }
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 items-end">
      <div className="flex-1 min-w-0">
        <span className="app-label" style={{ fontSize: '0.6rem' }}>اسم المهمة</span>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="الفصل الأول، التمارين..."
          className="app-control"
          style={inputStyle}
        />
      </div>
      <div className="w-[90px] shrink-0">
        <span className="app-label" style={{ fontSize: '0.6rem' }}>الدقائق</span>
        <input
          type="number"
          min="5"
          max="600"
          value={estimatedMinutes}
          onChange={(event) => setEstimatedMinutes(event.target.value)}
          onKeyDown={handleKeyDown}
          className="app-control text-center"
          style={inputStyle}
        />
      </div>
      <button
        type="submit"
        disabled={!title.trim()}
        className="app-btn-primary shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ minHeight: '44px' }}
      >
        <Icons.Plus />
        إضافة
      </button>
    </form>
  );
}

/* ─── Task Item ─── */
function TaskItem({ task, subjectName, onToggle, onDelete }) {
  const isDone = task.done;

  return (
    <div
      className="group flex items-center gap-3 rounded-[var(--radius-md)] border p-3 transition-all duration-200 hover:bg-[var(--c-surface-hover)]"
      style={{
        backgroundColor: isDone ? 'transparent' : 'var(--c-surface-alt)',
        borderColor: isDone ? 'var(--c-border)' : 'var(--c-border)',
        opacity: isDone ? 0.65 : 1,
      }}
    >
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => onToggle(subjectName, task.id)}
        className="flex items-center justify-center h-7 w-7 rounded-full shrink-0 transition-all duration-200"
        style={{
          backgroundColor: isDone ? 'var(--c-success-soft)' : 'var(--c-elevated)',
          color: isDone ? 'var(--c-success)' : 'var(--c-text-faint)',
          border: isDone ? '1px solid rgba(52, 211, 153, 0.25)' : '1px solid var(--c-border)',
        }}
        title={isDone ? 'إلغاء الإكمال' : 'إكمال المهمة'}
      >
        {isDone ? <Icons.Check /> : null}
      </button>

      {/* Task info */}
      <div className="flex-1 min-w-0 text-right">
        <div
          className="text-[13px] font-semibold truncate"
          style={{
            textDecoration: isDone ? 'line-through' : 'none',
            color: isDone ? 'var(--c-text-faint)' : 'var(--c-text)',
          }}
        >
          {task.title}
        </div>
        <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-faint)' }}>
          {task.estimatedMinutes} دقيقة تقديرية
        </div>
      </div>

      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={() => onDelete(subjectName, task.id)}
        className="flex items-center justify-center h-7 w-7 rounded-[var(--radius-sm)] shrink-0 opacity-0 group-hover:opacity-100 transition-all duration-200"
        style={{ color: 'var(--c-danger)', backgroundColor: 'var(--c-danger-soft)' }}
        title="حذف المهمة"
      >
        <Icons.Trash />
      </button>
    </div>
  );
}

/* ─── Task List with open/done separation ─── */
function TaskList({ tasks, subjectName, onToggle, onDelete }) {
  const openTasks = tasks.filter((task) => !task.done);
  const doneTasks = tasks.filter((task) => task.done);

  return (
    <div className="space-y-2">
      {openTasks.map((task) => (
        <TaskItem key={task.id} task={task} subjectName={subjectName} onToggle={onToggle} onDelete={onDelete} />
      ))}

      {openTasks.length > 0 && doneTasks.length > 0 && (
        <div className="flex items-center gap-2 py-1.5">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
          <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-faint)' }}>
            مكتملة ({doneTasks.length})
          </span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
        </div>
      )}

      {doneTasks.map((task) => (
        <TaskItem key={task.id} task={task} subjectName={subjectName} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </div>
  );
}

/* ─── Subject Card with inline task preview ─── */
function SubjectCard({ subject, appData, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(subject.name)}
      className="rounded-[var(--radius-card)] border p-4 text-right transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] w-full"
      style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="text-[14px] font-bold truncate">{subject.name}</div>
          <div className="mt-1 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
            {formatHoursMins(subject.studiedSeconds)} من {subject.goalHours}h
          </div>
        </div>
        <div
          className="app-chip"
          style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}
        >
          {subject.progressPercent.toFixed(0)}%
        </div>
      </div>

      <div className="mt-3 app-progress">
        <div className="app-progress-bar" style={{ width: `${subject.progressPercent}%` }} />
      </div>

      <div className="mt-3 grid gap-2 grid-cols-2">
        <div>
          <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>المهام المفتوحة</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <span className="text-[13px] font-bold">{subject.openTasks}</span>
            {subject.openTasks > 0 && (
              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--c-warning)' }} />
            )}
          </div>
        </div>
        <div>
          <div className="app-label mb-0" style={{ fontSize: '0.625rem' }}>آخر جلسة</div>
          <div className="mt-0.5 text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
            {subject.lastSessionAt
              ? formatTimestampInTimeZone(subject.lastSessionAt, appData.userProfile.timezone, 'ar', { month: 'short', day: 'numeric' })
              : 'لا توجد'}
          </div>
        </div>
      </div>

      {subject.openTasks > 0 && (
        <div className="mt-3 border-t pt-3" style={{ borderColor: 'var(--c-border)' }}>
          <div className="space-y-1">
            {subject.tasks
              .filter((task) => !task.done)
              .slice(0, 2)
              .map((task) => (
                <div key={task.id} className="flex items-center gap-2 text-[11px]">
                  <span
                    className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: 'var(--c-border)' }}
                  />
                  <span className="truncate" style={{ color: 'var(--c-text-muted)' }}>
                    {task.title}
                  </span>
                </div>
              ))}
            {subject.openTasks > 2 && (
              <div className="text-[10px] font-semibold" style={{ color: 'var(--c-text-faint)' }}>
                +{subject.openTasks - 2} مهام أخرى
              </div>
            )}
          </div>
        </div>
      )}
    </button>
  );
}

/* ─── Drawer Stat Mini-Card ─── */
function DrawerStatCard({ icon, label, value, accentBg, accentColor }) {
  return (
    <div className="rounded-[var(--radius-lg)] border p-3.5" style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}>
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: accentBg || 'var(--c-accent-soft)', color: accentColor || 'var(--c-nav-active)' }}
        >
          {icon}
        </div>
        <div className="text-right min-w-0">
          <div className="app-label mb-0" style={{ fontSize: '0.6rem' }}>{label}</div>
          <div className="mt-0.5 text-[16px] font-bold tabular-nums">{value}</div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Page ─── */
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

  const handleAddSubject = (event) => {
    event?.preventDefault?.();
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

  const handleAddTask = (subjectName, title, estimatedMinutes) => {
    addTask(subjectName, title, estimatedMinutes);
    showToast({
      tone: 'success',
      title: 'تمت إضافة المهمة',
      description: `"${title}" أُضيفت إلى ${subjectName} بنجاح.`,
      duration: 2500,
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

  const openSubjectDrawer = (subjectName) => {
    setSelectedSubjectName(subjectName);
    setActiveSubject(subjectName);
    const subject = appData.subjects[subjectName];
    if (subject?.tasks?.[0]) {
      setActiveTaskId(subject.tasks[0].id);
    }
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  // Computed stats for the selected subject
  const selectedOpenTasks = selectedSubject ? selectedSubject.tasks.filter((t) => !t.done).length : 0;
  const selectedDoneTasks = selectedSubject ? selectedSubject.tasks.filter((t) => t.done).length : 0;
  const selectedProgress = selectedSubject && selectedSubject.goalHours > 0
    ? Math.min(100, ((selectedSubject.studiedSeconds / 3600) / selectedSubject.goalHours) * 100) : 0;

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Subjects"
        title="مركز المواد"
        description="كل مادة في مكان واحد: التقدم، الوقت المنجز، المهام المفتوحة، وآخر جلسة. اضغط على أي مادة لفتح تفاصيلها وإدارة المهام."
      />

      {/* Add subject form */}
      <SectionCard title="إضافة مادة جديدة" subtitle="ابدأ ببساطة: اسم واضح وهدف تقريبي بالساعات.">
        <form onSubmit={handleAddSubject} className="grid gap-3 md:grid-cols-[1fr_140px_130px]">
          <div>
            <span className="app-label" style={{ fontSize: '0.6rem' }}>اسم المادة</span>
            <input
              type="text"
              value={draftSubject.name}
              onChange={(event) => setDraftSubject((currentValue) => ({ ...currentValue, name: event.target.value }))}
              placeholder="مثال: الرياضيات"
              className="app-control"
              style={inputStyle}
            />
          </div>
          <div>
            <span className="app-label" style={{ fontSize: '0.6rem' }}>الساعات المطلوبة</span>
            <input
              type="number"
              min="1"
              value={draftSubject.goalHours}
              onChange={(event) => setDraftSubject((currentValue) => ({ ...currentValue, goalHours: event.target.value }))}
              className="app-control"
              style={inputStyle}
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={!draftSubject.name.trim()}
              className="app-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ minHeight: '44px' }}
            >
              <Icons.Plus />
              إضافة مادة
            </button>
          </div>
        </form>
      </SectionCard>

      {/* Subjects list */}
      <SectionCard
        title="المواد"
        subtitle="ابحث، صفِّ، واضغط على مادة لفتح التفاصيل وإدارة المهام."
        action={(
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[200px] flex-1 sm:flex-none">
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
              className="app-control sm:w-[160px]"
              style={inputStyle}
            >
              <option value="all">كل المواد</option>
              <option value="active">بها مهام مفتوحة</option>
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
              <SubjectCard
                key={subject.name}
                subject={subject}
                appData={appData}
                onSelect={openSubjectDrawer}
              />
            ))}
          </div>
        )}
      </SectionCard>

      {/* ─── Subject Detail Drawer (Improved) ─── */}
      <Drawer
        open={Boolean(selectedSubject)}
        onClose={() => setSelectedSubjectName('')}
        title={selectedSubjectName}
        subtitle="إدارة المهام وتعديل إعدادات المادة."
      >
        {selectedSubject && (
          <>
            {/* ══════ Progress Hero ══════ */}
            <div
              className="rounded-[var(--radius-card)] border p-5"
              style={{
                backgroundColor: 'var(--c-surface-alt)',
                borderColor: 'var(--c-border)',
                background: `linear-gradient(135deg, var(--c-surface-alt) 0%, var(--c-surface) 100%)`,
              }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[var(--radius-lg)]"
                  style={{
                    background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
                  }}
                >
                  <Icons.Book />
                </div>
                <div className="flex-1 min-w-0 text-right">
                  <div className="text-[16px] font-bold truncate">{selectedSubjectName}</div>
                  <div className="text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                    {selectedProgress.toFixed(0)}% من الهدف · {formatHoursMins(selectedSubject.studiedSeconds)} منجزة
                  </div>
                </div>
              </div>
              <div className="app-progress" style={{ height: '8px' }}>
                <div className="app-progress-bar" style={{ width: `${selectedProgress}%` }} />
              </div>
            </div>

            {/* ══════ Quick Stats with icons ══════ */}
            <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
              <DrawerStatCard
                icon={<Icons.Timer />}
                label="المنجز"
                value={formatHoursMins(selectedSubject.studiedSeconds)}
                accentBg="var(--c-info-soft)"
                accentColor="var(--c-info)"
              />
              <DrawerStatCard
                icon={<Icons.Activity />}
                label="الجلسات"
                value={selectedSubject.sessions}
                accentBg="var(--c-success-soft)"
                accentColor="var(--c-success)"
              />
              <DrawerStatCard
                icon={<Icons.Target />}
                label="الهدف"
                value={`${selectedSubject.goalHours}h`}
                accentBg="var(--c-accent-soft)"
                accentColor="var(--c-nav-active)"
              />
              <DrawerStatCard
                icon={<Icons.ListTodo />}
                label="مهام مفتوحة"
                value={selectedOpenTasks}
                accentBg="var(--c-warning-soft)"
                accentColor="var(--c-warning)"
              />
            </div>

            {/* ══════ TASKS — the main feature ══════ */}
            <SectionCard
              title="المهام / Topics"
              subtitle={
                selectedSubject.tasks.length === 0
                  ? 'أضف أول مهمة حتى تتحول المادة إلى خطة قابلة للتنفيذ.'
                  : `${selectedOpenTasks} مفتوحة · ${selectedDoneTasks} مكتملة`
              }
            >
              {/* Quick-add form */}
              <div
                className="rounded-[var(--radius-lg)] border p-4 mb-4"
                style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
              >
                <QuickAddTask
                  subjectName={selectedSubjectName}
                  onAdd={handleAddTask}
                />
              </div>

              {/* Task list */}
              {selectedSubject.tasks.length === 0 ? (
                <div
                  className="rounded-[var(--radius-lg)] border p-6 text-center"
                  style={{ backgroundColor: 'var(--c-elevated)', borderColor: 'var(--c-border)', borderStyle: 'dashed' }}
                >
                  <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
                    <Icons.ListTodo />
                  </div>
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--c-text)' }}>
                    لا توجد مهام بعد
                  </div>
                  <div className="mt-1 text-[12px]" style={{ color: 'var(--c-text-muted)' }}>
                    أضف Topic أو Chapter باستخدام النموذج أعلاه.
                  </div>
                </div>
              ) : (
                <TaskList
                  tasks={selectedSubject.tasks}
                  subjectName={selectedSubjectName}
                  onToggle={toggleTask}
                  onDelete={deleteTask}
                />
              )}
            </SectionCard>

            {/* ══════ Subject Settings — with icons ══════ */}
            <SectionCard title="تعديل المادة" subtitle="تخصيص الهدف والملاحظات.">
              <div className="space-y-4">
                {/* Goal hours row */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] mt-5"
                    style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}
                  >
                    <Icons.Target />
                  </div>
                  <div className="flex-1">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>الساعات المطلوبة</span>
                    <input
                      type="number"
                      min="1"
                      value={selectedSubject.goalHours}
                      onChange={(event) => updateSubject(selectedSubjectName, {
                        goalHours: Number.parseInt(event.target.value, 10) || 1,
                      })}
                      className="app-control"
                      style={inputStyle}
                    />
                  </div>
                </div>

                {/* Notes row */}
                <div className="flex items-start gap-3">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)] mt-5"
                    style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}
                  >
                    <Icons.Edit />
                  </div>
                  <div className="flex-1">
                    <span className="app-label" style={{ fontSize: '0.6rem' }}>ملاحظات</span>
                    <textarea
                      rows="3"
                      value={selectedSubject.notes}
                      onChange={(event) => updateSubject(selectedSubjectName, { notes: event.target.value })}
                      placeholder="ملاحظات سريعة عن المادة أو الخطة القادمة"
                      className="app-control min-h-[80px]"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            </SectionCard>

            {/* ══════ Danger zone ══════ */}
            <div
              className="rounded-[var(--radius-card)] border p-4 flex items-center justify-between gap-3"
              style={{ borderColor: 'rgba(248, 113, 113, 0.15)', backgroundColor: 'var(--c-danger-soft)' }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
                  style={{ backgroundColor: 'rgba(248, 113, 113, 0.15)', color: 'var(--c-danger)' }}
                >
                  <Icons.Trash />
                </div>
                <div className="text-right min-w-0">
                  <div className="text-[13px] font-semibold" style={{ color: 'var(--c-danger)' }}>حذف المادة</div>
                  <div className="text-[11px]" style={{ color: 'var(--c-text-muted)' }}>
                    سيتم حذف المادة ومهامها وجلساتها.
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeleteSubject}
                className="app-btn-danger-soft shrink-0"
              >
                حذف
              </button>
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
