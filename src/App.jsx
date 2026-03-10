import { useState, useEffect, useCallback, useMemo } from 'react';
import { Icons } from './components/Icons';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import TimerPage from './components/TimerPage';
import SettingsPage from './components/SettingsPage';
import Modal from './components/Modal';
import { useTimer } from './hooks/useTimer';
import { initialSubjects, COLOR_KEYS, colorStringForKey } from './utils/constants';
import { getTodayKey } from './utils/helpers';
import { loadData, saveData, calculateStreak } from './utils/storage';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';

// ==========================================
// INNER APP (needs ThemeProvider as parent)
// ==========================================
function AppInner() {
  const { theme, isDark } = useTheme();

  // --- Data State (loaded from localStorage) ---
  const [subjects, setSubjects] = useState(() => {
    const saved = loadData();
    return saved?.subjects || initialSubjects;
  });

  const [dailyLog, setDailyLog] = useState(() => {
    const saved = loadData();
    return saved?.dailyLog || {};
  });

  const [dailyGoal, setDailyGoal] = useState(() => {
    const saved = loadData();
    return saved?.dailyGoal || 3;
  });

  const [userProfile, setUserProfile] = useState(() => {
    const saved = loadData();
    return saved?.userProfile || { name: 'يحيى', examDate: '2026-06-06' };
  });

  const [activeSubject, setActiveSubject] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  // --- Today tracking ---
  const [todayKey, setTodayKey] = useState(getTodayKey());
  const todayStudiedSeconds = dailyLog[todayKey] || 0;

  // --- Streak (computed from daily log) ---
  const streak = useMemo(() => calculateStreak(dailyLog, userProfile?.timezone), [dailyLog, userProfile?.timezone]);

  // --- Modals State ---
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFormData, setEditFormData] = useState({ goalHours: 0, studiedH: 0, studiedM: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [newSubjectData, setNewSubjectData] = useState({ name: '', goalHours: 50 });

  // --- Timer callbacks ---
  const onTickFocus = useCallback((elapsed = 1) => {
    if (!elapsed || elapsed <= 0 || !activeSubject) return;
    setSubjects(prev => {
      if (!prev[activeSubject]) return prev;
      return {
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          studiedSeconds: prev[activeSubject].studiedSeconds + elapsed,
        },
      };
    });
    setDailyLog(prev => {
      const key = getTodayKey(userProfile?.timezone);
      return { ...prev, [key]: (prev[key] || 0) + elapsed };
    });
  }, [activeSubject, userProfile?.timezone]);

  const onSessionComplete = useCallback(() => {
    if (!activeSubject) return;
    setSubjects(prev => {
      if (!prev[activeSubject]) return prev;
      return {
        ...prev,
        [activeSubject]: {
          ...prev[activeSubject],
          sessions: prev[activeSubject].sessions + 1,
        },
      };
    });
  }, [activeSubject]);

  // --- Timer Hook ---
  const timer = useTimer({ activeSubject, onTickFocus, onSessionComplete });

  // --- Persist to localStorage ---
  useEffect(() => {
    const timeout = setTimeout(() => {
      saveData({ subjects, dailyLog, dailyGoal, userProfile });
    }, 1000); // Debounce save to reduce IO blocking
    return () => clearTimeout(timeout);
  }, [subjects, dailyLog, dailyGoal, userProfile]);

  // --- Day change detection ---
  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getTodayKey(userProfile?.timezone);
      if (currentKey !== todayKey) setTodayKey(currentKey);
    }, 30000);
    return () => clearInterval(interval);
  }, [todayKey, userProfile?.timezone]);

  // --- Notification permission ---
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // ==========================================
  // ACTIONS
  // ==========================================
  const handleSubjectClick = (subj) => {
    if (timer.isRunning && activeSubject && activeSubject !== subj) {
      if (!window.confirm(`المؤقت يعمل حالياً على "${activeSubject}". هل تريد الانتقال إلى "${subj}"؟`)) {
        return;
      }
      timer.resetTimer();
    }
    setActiveSubject(subj);
    if (!timer.isRunning) timer.changeMode('focus');
    setCurrentView('timer');
  };

  const handleSelectSubjectFromTimer = (subj) => {
    if (timer.isRunning && activeSubject && activeSubject !== subj) {
      if (!window.confirm(`المؤقت يعمل حالياً على "${activeSubject}". هل تريد التبديل إلى "${subj}"؟`)) {
        return;
      }
      timer.resetTimer();
    }
    setActiveSubject(subj);
    if (!timer.isRunning) timer.changeMode('focus');
  };

  // --- CRUD ---
  const openEditModal = (subjName, e) => {
    e.stopPropagation();
    const data = subjects[subjName];
    if (!data) return;
    setEditingSubject(subjName);
    setEditFormData({
      goalHours: data.goalHours,
      studiedH: Math.floor(data.studiedSeconds / 3600),
      studiedM: Math.floor((data.studiedSeconds % 3600) / 60),
    });
  };

  const saveSubjectSettings = () => {
    const totalStudiedSeconds =
      (parseInt(editFormData.studiedH) || 0) * 3600 +
      (parseInt(editFormData.studiedM) || 0) * 60;
    setSubjects(prev => ({
      ...prev,
      [editingSubject]: {
        ...prev[editingSubject],
        goalHours: Math.max(1, parseInt(editFormData.goalHours) || 1),
        studiedSeconds: totalStudiedSeconds,
      },
    }));
    setEditingSubject(null);
  };

  const deleteSubject = () => {
    if (!window.confirm(`تحذير: سيتم حذف "${editingSubject}" وبياناتها الزمنية نهائياً.`)) return;
    const updatedSubjects = { ...subjects };
    delete updatedSubjects[editingSubject];
    setSubjects(updatedSubjects);
    if (activeSubject === editingSubject) {
      timer.resetTimer();
      setActiveSubject(null);
      setCurrentView('dashboard');
    }
    setEditingSubject(null);
  };

  const addNewSubject = () => {
    const name = newSubjectData.name.trim();
    if (!name || subjects[name]) {
      if (subjects[name]) alert('هذه المادة موجودة بالفعل!');
      return;
    }
    const randomKey = COLOR_KEYS[Math.floor(Math.random() * COLOR_KEYS.length)];
    setSubjects(prev => ({
      ...prev,
      [name]: {
        goalHours: Math.max(1, parseInt(newSubjectData.goalHours) || 50),
        studiedSeconds: 0,
        sessions: 0,
        color: colorStringForKey(randomKey),
      },
    }));
    setNewSubjectData({ name: '', goalHours: 50 });
    setIsAddModalOpen(false);
  };

  // Input/label/button style helpers for modals (theme-aware)
  const inputCls = "w-full rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/40 outline-none transition-all border";
  const inputStyle = { backgroundColor: 'var(--c-input)', borderColor: 'var(--c-border)', color: 'var(--c-text)' };
  const labelCls = "block text-sm font-semibold mb-2";
  const labelStyle = { color: 'var(--c-text-sub)' };
  const cancelBtnStyle = { color: 'var(--c-text-muted)' };

  // ==========================================
  // RENDER — Sidebar Layout
  // ==========================================
  return (
    <div
      dir="rtl"
      className={`h-screen flex font-sans overflow-hidden ${theme === 'light' ? 'light' : ''}`}
      style={{ backgroundColor: 'var(--c-bg)', color: 'var(--c-text)', '--selection-color': 'var(--c-selection)' }}
    >
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        streak={streak}
        todayStudiedSeconds={todayStudiedSeconds}
        isTimerRunning={timer.isRunning}
        activeSubject={activeSubject}
        userProfile={userProfile}
      />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden pt-16 pb-20 md:pt-0 md:pb-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto min-h-full">
          {currentView === 'dashboard' && (
            <DashboardPage
              subjects={subjects}
              activeSubject={activeSubject}
              isTimerRunning={timer.isRunning}
              onSubjectClick={handleSubjectClick}
              onEdit={openEditModal}
              onAddSubject={() => setIsAddModalOpen(true)}
              todayStudiedSeconds={todayStudiedSeconds}
              dailyGoal={dailyGoal}
              dailyLog={dailyLog}
              streak={streak}
              onEditGoal={() => { setTempGoal(dailyGoal); setIsGoalModalOpen(true); }}
              userProfile={userProfile}
            />
          )}

          {currentView === 'timer' && (
            <TimerPage
              subjects={subjects}
              activeSubject={activeSubject}
              onSelectSubject={handleSelectSubjectFromTimer}
              timer={timer}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              dailyGoal={dailyGoal}
              setDailyGoal={setDailyGoal}
            />
          )}
        </div>
      </main>

      {/* ===== MODALS ===== */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="إضافة مادة دراسية جديدة"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsAddModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
              style={cancelBtnStyle}
            >إلغاء</button>
            <button onClick={addNewSubject}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/15 transition-all"
            >إضافة المادة</button>
          </div>
        }
      >
        <div>
          <label htmlFor="add-subject-name" className={labelCls} style={labelStyle}>اسم المادة</label>
          <input id="add-subject-name" type="text" value={newSubjectData.name}
            onChange={(e) => setNewSubjectData({ ...newSubjectData, name: e.target.value })}
            className={inputCls} style={inputStyle} placeholder="مثال: الفيزياء"
          />
        </div>
        <div>
          <label htmlFor="add-subject-hours" className={labelCls} style={labelStyle}>الهدف الإجمالي (ساعات)</label>
          <input id="add-subject-hours" type="number" min="1" value={newSubjectData.goalHours}
            onChange={(e) => setNewSubjectData({ ...newSubjectData, goalHours: e.target.value })}
            className={inputCls} style={inputStyle}
          />
        </div>
      </Modal>

      {/* Goal Edit Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="تعديل الهدف اليومي"
        footer={
          <div className="flex justify-end gap-3">
            <button onClick={() => setIsGoalModalOpen(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
              style={cancelBtnStyle}
            >إلغاء</button>
            <button onClick={() => { setDailyGoal(Math.max(1, parseInt(tempGoal) || 1)); setIsGoalModalOpen(false); }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/15 transition-all"
            >حفظ</button>
          </div>
        }
      >
        <div>
          <label htmlFor="edit-daily-goal" className={labelCls} style={labelStyle}>الهدف اليومي (ساعات)</label>
          <input id="edit-daily-goal" type="number" min="1" value={tempGoal}
            onChange={(e) => setTempGoal(e.target.value)}
            className={inputCls} style={inputStyle}
          />
        </div>
      </Modal>

      <Modal
        isOpen={!!editingSubject}
        onClose={() => setEditingSubject(null)}
        title={`إعدادات: ${editingSubject || ''}`}
        footer={
          <div className="flex justify-between gap-3">
            <button onClick={deleteSubject}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-500/8 hover:text-red-400 transition-colors flex items-center gap-2"
            ><Icons.Trash /> حذف المادة</button>
            <div className="flex gap-3">
              <button onClick={() => setEditingSubject(null)}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors hover:opacity-80"
                style={cancelBtnStyle}
              >إلغاء</button>
              <button onClick={saveSubjectSettings}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-500 shadow-sm shadow-violet-600/15 transition-all"
              >حفظ</button>
            </div>
          </div>
        }
      >
        <div>
          <label htmlFor="edit-goal-hours" className={labelCls} style={labelStyle}>الهدف الإجمالي (ساعات)</label>
          <input id="edit-goal-hours" type="number" min="1" value={editFormData.goalHours}
            onChange={(e) => setEditFormData({ ...editFormData, goalHours: e.target.value })}
            className={inputCls} style={inputStyle}
          />
        </div>
        <div>
          <label className={labelCls} style={labelStyle}>ما تم إنجازه مسبقاً (إدخال يدوي)</label>
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <input id="edit-studied-h" type="number" min="0" value={editFormData.studiedH}
                onChange={(e) => setEditFormData({ ...editFormData, studiedH: e.target.value })}
                className={`${inputCls} pr-4 pl-12`} style={inputStyle}
                aria-label="ساعات الدراسة المنجزة"
              />
              <span className="absolute left-4 top-3 text-sm font-medium" style={{ color: 'var(--c-text-faint)' }}>ساعة</span>
            </div>
            <div className="flex-1 relative">
              <input id="edit-studied-m" type="number" min="0" max="59" value={editFormData.studiedM}
                onChange={(e) => setEditFormData({ ...editFormData, studiedM: e.target.value })}
                className={`${inputCls} pr-4 pl-12`} style={inputStyle}
                aria-label="دقائق الدراسة المنجزة"
              />
              <span className="absolute left-4 top-3 text-sm font-medium" style={{ color: 'var(--c-text-faint)' }}>دقيقة</span>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// ==========================================
// MAIN EXPORT — wraps with ThemeProvider
// ==========================================
export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}
