import { useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icons } from '../components/Icons';
import PageHeader from '../components/ui/PageHeader';
import SectionCard from '../components/ui/SectionCard';
import EmptyState from '../components/ui/EmptyState';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../components/ui/ToastProvider';
import { useConfirm } from '../components/ui/ConfirmDialogProvider';

/* ─── Quick-Add Task Form ─── */
function TaskAddForm({ subjects, onAdd }) {
  const [selectedSubject, setSelectedSubject] = useState('');
  const [title, setTitle] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(45);
  const inputRef = useRef(null);

  const subjectNames = Object.keys(subjects);

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed || !selectedSubject) return;

    onAdd(selectedSubject, trimmed, Number.parseInt(estimatedMinutes, 10) || 45);
    setTitle('');
    setEstimatedMinutes(45);
    inputRef.current?.focus();
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 md:grid-cols-[1fr_1fr_100px_auto]">
      <div>
        <span className="app-label" style={{ fontSize: '0.6rem' }}>المادة</span>
        <select
          value={selectedSubject}
          onChange={(event) => setSelectedSubject(event.target.value)}
          className="app-control"
          style={inputStyle}
        >
          <option value="">اختر المادة...</option>
          {subjectNames.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div>
        <span className="app-label" style={{ fontSize: '0.6rem' }}>اسم المهمة</span>
        <input
          ref={inputRef}
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="الفصل الأول، التمارين..."
          className="app-control"
          style={inputStyle}
        />
      </div>
      <div>
        <span className="app-label" style={{ fontSize: '0.6rem' }}>الدقائق</span>
        <input
          type="number"
          min="5"
          max="600"
          value={estimatedMinutes}
          onChange={(event) => setEstimatedMinutes(event.target.value)}
          className="app-control text-center"
          style={inputStyle}
        />
      </div>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={!title.trim() || !selectedSubject}
          className="app-btn-primary w-full disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ minHeight: '44px' }}
        >
          <Icons.Plus />
          إضافة مهمة
        </button>
      </div>
    </form>
  );
}

/* ─── Filter Chips ─── */
function FilterChip({ label, active, count, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition-all duration-200"
      style={{
        backgroundColor: active ? 'var(--c-accent-soft)' : 'var(--c-elevated)',
        color: active ? 'var(--c-nav-active)' : 'var(--c-text-muted)',
        border: `1px solid ${active ? 'rgba(139, 92, 246, 0.2)' : 'var(--c-border)'}`,
      }}
    >
      {label}
      {count !== undefined && (
        <span
          className="flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold"
          style={{
            backgroundColor: active ? 'var(--c-nav-active)' : 'var(--c-border)',
            color: active ? '#fff' : 'var(--c-text-muted)',
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ─── Single Task Row ─── */
function TaskRow({ task, subjectName, onToggle, onDelete }) {
  const isDone = task.done;

  return (
    <div
      className="group flex items-center gap-3 rounded-[var(--radius-md)] border p-3.5 transition-all duration-200 hover:bg-[var(--c-surface-hover)]"
      style={{
        backgroundColor: isDone ? 'transparent' : 'var(--c-surface-alt)',
        borderColor: 'var(--c-border)',
        opacity: isDone ? 0.6 : 1,
      }}
    >
      {/* Toggle checkbox */}
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
        {isDone && <Icons.Check />}
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
        <div className="mt-0.5 flex items-center gap-2 text-[11px]" style={{ color: 'var(--c-text-faint)' }}>
          <span className="flex items-center gap-1">
            <Icons.Timer />
            {task.estimatedMinutes}m
          </span>
        </div>
      </div>

      {/* Subject badge */}
      <div
        className="app-chip shrink-0 hidden sm:inline-flex"
        style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}
      >
        {subjectName}
      </div>

      {/* Delete */}
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

/* ─── Subject Group Header ─── */
function SubjectGroupHeader({ subjectName, openCount, progressPercent }) {
  return (
    <div className="flex items-center justify-between gap-3 mb-2">
      <div className="flex items-center gap-2.5">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-md)]"
          style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}
        >
          <Icons.Book />
        </div>
        <div className="text-[14px] font-bold">{subjectName}</div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className="app-chip"
          style={{
            backgroundColor: openCount > 0 ? 'var(--c-warning-soft)' : 'var(--c-success-soft)',
            color: openCount > 0 ? 'var(--c-warning)' : 'var(--c-success)',
          }}
        >
          {openCount > 0 ? `${openCount} مفتوحة` : 'مكتملة'}
        </span>
        <span className="app-chip" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
          {progressPercent.toFixed(0)}%
        </span>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════ */
/* ─── MAIN TASKS PAGE ─── */
/* ═══════════════════════════════════════ */
export default function TasksPage() {
  const navigate = useNavigate();
  const { appData, addTask, toggleTask, deleteTask } = useAppData();
  const { showToast } = useToast();
  const { confirm } = useConfirm();

  const [filter, setFilter] = useState('all'); // all | open | done
  const [subjectFilter, setSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Gather all tasks across subjects
  const { allTasks, totalOpen, totalDone, totalAll, subjectNames } = useMemo(() => {
    const tasks = [];
    let openCount = 0;
    let doneCount = 0;
    const names = [];

    for (const [subjectName, subject] of Object.entries(appData.subjects)) {
      names.push(subjectName);
      const openTasks = subject.tasks.filter((t) => !t.done).length;
      const doneTasks = subject.tasks.filter((t) => t.done).length;
      const progressPercent = subject.goalHours > 0
        ? Math.min(100, ((subject.studiedSeconds / 3600) / subject.goalHours) * 100)
        : 0;

      for (const task of subject.tasks) {
        tasks.push({
          ...task,
          subjectName,
          subjectOpenTasks: openTasks,
          subjectDoneTasks: doneTasks,
          subjectProgress: progressPercent,
        });
      }

      openCount += openTasks;
      doneCount += doneTasks;
    }

    return {
      allTasks: tasks,
      totalOpen: openCount,
      totalDone: doneCount,
      totalAll: openCount + doneCount,
      subjectNames: names,
    };
  }, [appData.subjects]);

  // Apply filters
  const filteredTasks = useMemo(() => {
    return allTasks.filter((task) => {
      const matchesStatus = filter === 'all'
        || (filter === 'open' && !task.done)
        || (filter === 'done' && task.done);

      const matchesSubject = subjectFilter === 'all' || task.subjectName === subjectFilter;

      const matchesSearch = !searchQuery.trim()
        || task.title.toLowerCase().includes(searchQuery.trim().toLowerCase());

      return matchesStatus && matchesSubject && matchesSearch;
    });
  }, [allTasks, filter, subjectFilter, searchQuery]);

  // Group by subject
  const groupedTasks = useMemo(() => {
    const groups = {};
    for (const task of filteredTasks) {
      if (!groups[task.subjectName]) {
        groups[task.subjectName] = {
          subjectName: task.subjectName,
          openCount: task.subjectOpenTasks,
          doneCount: task.subjectDoneTasks,
          progressPercent: task.subjectProgress,
          tasks: [],
        };
      }
      groups[task.subjectName].tasks.push(task);
    }

    // Sort: subjects with open tasks first, then by count
    return Object.values(groups).sort((a, b) => {
      const aOpen = a.tasks.filter((t) => !t.done).length;
      const bOpen = b.tasks.filter((t) => !t.done).length;
      return bOpen - aOpen;
    });
  }, [filteredTasks]);

  const handleAddTask = (subjectName, title, estimatedMinutes) => {
    addTask(subjectName, title, estimatedMinutes);
    showToast({
      tone: 'success',
      title: 'تمت إضافة المهمة',
      description: `"${title}" أُضيفت إلى ${subjectName} بنجاح.`,
      duration: 2500,
    });
  };

  const handleDeleteTask = async (subjectName, taskId) => {
    const task = appData.subjects[subjectName]?.tasks?.find((t) => t.id === taskId);

    const approved = await confirm({
      title: 'حذف المهمة',
      description: `هل تريد حذف "${task?.title || ''}" من ${subjectName}؟`,
      confirmLabel: 'نعم، احذف',
      cancelLabel: 'إلغاء',
      tone: 'danger',
    });

    if (!approved) return;

    deleteTask(subjectName, taskId);
    showToast({
      tone: 'success',
      title: 'تم حذف المهمة',
      description: 'المهمة أُزيلت بنجاح.',
      duration: 2000,
    });
  };

  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };

  return (
    <div className="app-page animate-fade-in">
      <PageHeader
        eyebrow="Tasks"
        title="مركز المهام"
        description="جميع مهامك من كل المواد في مكان واحد. أضف، عدّل، أكمل، أو احذف أي مهمة مباشرة."
        actions={
          subjectNames.length === 0 ? (
            <button
              type="button"
              onClick={() => navigate('/subjects')}
              className="app-btn-primary"
            >
              <Icons.Plus />
              أضف مادة أولًا
            </button>
          ) : null
        }
      />

      {/* ══════ Stats Overview ══════ */}
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        <div
          className="rounded-[var(--radius-card)] border p-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--c-accent-soft)', color: 'var(--c-nav-active)' }}>
            <Icons.ListTodo />
          </div>
          <div className="text-right">
            <div className="app-label mb-0" style={{ fontSize: '0.6rem' }}>الكل</div>
            <div className="text-[18px] font-bold tabular-nums">{totalAll}</div>
          </div>
        </div>
        <div
          className="rounded-[var(--radius-card)] border p-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--c-warning-soft)', color: 'var(--c-warning)' }}>
            <Icons.Target />
          </div>
          <div className="text-right">
            <div className="app-label mb-0" style={{ fontSize: '0.6rem' }}>مفتوحة</div>
            <div className="text-[18px] font-bold tabular-nums">{totalOpen}</div>
          </div>
        </div>
        <div
          className="rounded-[var(--radius-card)] border p-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--c-success-soft)', color: 'var(--c-success)' }}>
            <Icons.CheckCircle />
          </div>
          <div className="text-right">
            <div className="app-label mb-0" style={{ fontSize: '0.6rem' }}>مكتملة</div>
            <div className="text-[18px] font-bold tabular-nums">{totalDone}</div>
          </div>
        </div>
        <div
          className="rounded-[var(--radius-card)] border p-4 flex items-center gap-3"
          style={{ backgroundColor: 'var(--c-surface-alt)', borderColor: 'var(--c-border)' }}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--radius-lg)]" style={{ backgroundColor: 'var(--c-info-soft)', color: 'var(--c-info)' }}>
            <Icons.Book />
          </div>
          <div className="text-right">
            <div className="app-label mb-0" style={{ fontSize: '0.6rem' }}>المواد</div>
            <div className="text-[18px] font-bold tabular-nums">{subjectNames.length}</div>
          </div>
        </div>
      </div>

      {/* ══════ Add Task Form ══════ */}
      {subjectNames.length > 0 && (
        <SectionCard
          title="إضافة مهمة جديدة"
          subtitle="اختر المادة وأدخل اسم المهمة والوقت التقديري بالدقائق."
        >
          <TaskAddForm subjects={appData.subjects} onAdd={handleAddTask} />
        </SectionCard>
      )}

      {/* ══════ Filters & Search ══════ */}
      {totalAll > 0 && (
        <div className="flex flex-wrap items-center gap-3">
          {/* Status filter chips */}
          <div className="flex items-center gap-2">
            <FilterChip label="الكل" count={totalAll} active={filter === 'all'} onClick={() => setFilter('all')} />
            <FilterChip label="مفتوحة" count={totalOpen} active={filter === 'open'} onClick={() => setFilter('open')} />
            <FilterChip label="مكتملة" count={totalDone} active={filter === 'done'} onClick={() => setFilter('done')} />
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Subject filter */}
          <select
            value={subjectFilter}
            onChange={(event) => setSubjectFilter(event.target.value)}
            className="app-control w-[160px]"
            style={inputStyle}
          >
            <option value="all">كل المواد</option>
            {subjectNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative w-[220px]">
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--c-text-faint)' }}>
              <Icons.Search />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="ابحث في المهام..."
              className="app-control pr-10"
              style={inputStyle}
            />
          </div>
        </div>
      )}

      {/* ══════ Tasks Grouped by Subject ══════ */}
      {subjectNames.length === 0 ? (
        <EmptyState
          icon={<Icons.Book />}
          title="لا توجد مواد بعد"
          description="أضف مادة جديدة من صفحة المواد لتبدأ بإضافة مهام ومتابعة تقدمك."
        />
      ) : totalAll === 0 ? (
        <EmptyState
          icon={<Icons.ListTodo />}
          title="لا توجد مهام بعد"
          description="أضف أول مهمة باستخدام النموذج أعلاه لتبدأ تنظيم خطتك الدراسية."
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Icons.Search />}
          title="لا توجد مهام مطابقة"
          description="جرّب تغيير الفلاتر أو مسح البحث لعرض المهام."
        />
      ) : (
        <div className="space-y-5">
          {groupedTasks.map((group) => (
            <SectionCard key={group.subjectName}>
              <SubjectGroupHeader
                subjectName={group.subjectName}
                openCount={group.tasks.filter((t) => !t.done).length}
                  progressPercent={group.progressPercent}
                />
              <div className="space-y-2">
                {/* Open tasks first */}
                {group.tasks
                  .filter((t) => !t.done)
                  .map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      subjectName={task.subjectName}
                      onToggle={toggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}

                {/* Separator */}
                {group.tasks.some((t) => !t.done) && group.tasks.some((t) => t.done) && (
                  <div className="flex items-center gap-2 py-1">
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
                    <span className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--c-text-faint)' }}>
                      مكتملة
                    </span>
                    <div className="flex-1 h-px" style={{ backgroundColor: 'var(--c-border)' }} />
                  </div>
                )}

                {/* Done tasks */}
                {group.tasks
                  .filter((t) => t.done)
                  .map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      subjectName={task.subjectName}
                      onToggle={toggleTask}
                      onDelete={handleDeleteTask}
                    />
                  ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  );
}
