import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Icons } from './components/Icons';
import Sidebar from './components/Sidebar';
import DashboardPage from './components/DashboardPage';
import TimerPage from './components/TimerPage';
import SettingsPage from './components/SettingsPage';
import AuthPage from './components/AuthPage';
import Modal from './components/Modal';
import { useTimer, DEFAULT_POMODORO_SETTINGS } from './hooks/useTimer';
import { COLOR_KEYS, colorStringForKey } from './utils/constants';
import { getTodayKey } from './utils/helpers';
import { saveData, saveUserData, loadOrMigrateUserData, calculateStreak } from './utils/storage';
import { incrementDailyLogEntry, incrementSubjectSessions, incrementSubjectStudyTime } from './utils/studyData';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// ==========================================
// INNER APP (needs ThemeProvider + AuthProvider as parents)
// ==========================================
function AppInner() {
  const { theme } = useTheme();
  const { user, loading: authLoading, logout, deleteAccount } = useAuth();

  // --- Data loading state ---
  const [dataLoaded, setDataLoaded] = useState(false);

  const [subjects, setSubjects] = useState({});
  const [dailyLog, setDailyLog] = useState({});
  const [dailyGoal, setDailyGoal] = useState(3);
  const [userProfile, setUserProfile] = useState({ name: '', examDate: '', timezone: 'auto' });
  const [pomodoroSettings, setPomodoroSettings] = useState({ ...DEFAULT_POMODORO_SETTINGS });

  const [activeSubject, setActiveSubject] = useState(null);
  const [currentView, setCurrentView] = useState('dashboard');

  useEffect(() => {
    window.isClearingData = false;
  }, []);

  // --- Load data from Firestore when user logs in ---
  useEffect(() => {
    if (!user) {
      // Reset state when logged out
      setDataLoaded(false);
      return;
    }

    let cancelled = false;
    const load = async () => {
      const data = await loadOrMigrateUserData(user.uid);
      if (cancelled) return;

      if (data) {
        setSubjects(data.subjects || {});
        setDailyLog(data.dailyLog || {});
        setDailyGoal(data.dailyGoal || 3);
        setUserProfile({
          name: user.displayName || '',
          examDate: '',
          timezone: 'auto',
          ...(data.userProfile || {}),
        });
        setPomodoroSettings({ ...DEFAULT_POMODORO_SETTINGS, ...(data.pomodoroSettings || {}) });
      } else {
        // New user — empty state
        setSubjects({});
        setDailyLog({});
        setDailyGoal(3);
        setUserProfile({
          name: user.displayName || '',
          examDate: '',
          timezone: 'auto',
        });
        setPomodoroSettings({ ...DEFAULT_POMODORO_SETTINGS });
      }
      setDataLoaded(true);
    };
    load();
    return () => { cancelled = true; };
  }, [user]);

  // --- Today tracking (using user's timezone from the start) ---
  const [todayKey, setTodayKey] = useState(() => getTodayKey());
  const todayStudiedSeconds = dailyLog[todayKey] || 0;

  // Update todayKey when userProfile timezone changes
  useEffect(() => {
    setTodayKey(getTodayKey(userProfile?.timezone));
  }, [userProfile?.timezone]);

  // --- Dynamic page title ---
  useEffect(() => {
    document.title = `Apex Tracker — ${userProfile?.name || 'طالب'}`;
  }, [userProfile?.name]);

  // --- Redirect new users to settings to fill their profile ---
  useEffect(() => {
    if (dataLoaded && (!userProfile?.name || !userProfile?.examDate)) {
      setCurrentView('settings');
    }
  }, [dataLoaded, userProfile?.name, userProfile?.examDate]);

  // --- Streak (computed from daily log) ---
  const streak = useMemo(() => calculateStreak(dailyLog, userProfile?.timezone), [dailyLog, userProfile?.timezone]);

  // --- Modals State ---
  const [editingSubject, setEditingSubject] = useState(null);
  const [editFormData, setEditFormData] = useState({ goalHours: 0, studiedH: 0, studiedM: 0 });
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [tempGoal, setTempGoal] = useState(dailyGoal);
  const [newSubjectData, setNewSubjectData] = useState({ name: '', goalHours: 50 });

  // --- Ref for latest state (used in background flushes / beforeunload) ---
  const latestStateRef = useRef({ subjects, dailyLog, dailyGoal, userProfile, pomodoroSettings });
  const latestSnapshotRef = useRef(null);
  const firestoreSaveTimeoutRef = useRef(null);
  const firestoreSaveInFlightRef = useRef(false);
  const firestoreSaveQueuedRef = useRef(false);

  // Update refs without triggering render cycle
  useEffect(() => {
    latestStateRef.current = { subjects, dailyLog, dailyGoal, userProfile, pomodoroSettings };
  });

  const onTickFocus = useCallback((elapsed = 1) => {
    if (!elapsed || elapsed <= 0 || !activeSubject) return;
    const studyKey = getTodayKey(userProfile?.timezone);

    setSubjects((prev) => incrementSubjectStudyTime(prev, activeSubject, elapsed));
    setDailyLog((prev) => incrementDailyLogEntry(prev, studyKey, elapsed));
  }, [activeSubject, userProfile?.timezone]);

  const onSessionComplete = useCallback(() => {
    if (!activeSubject) return;
    setSubjects((prev) => incrementSubjectSessions(prev, activeSubject));
  }, [activeSubject]);

  // --- Timer Hook ---
  const timer = useTimer({ activeSubject, onTickFocus, onSessionComplete, pomodoroSettings });

  const clearScheduledCloudSave = useCallback(() => {
    if (firestoreSaveTimeoutRef.current) {
      clearTimeout(firestoreSaveTimeoutRef.current);
      firestoreSaveTimeoutRef.current = null;
    }
  }, []);

  const flushCloudSave = useCallback(async () => {
    clearScheduledCloudSave();

    if (!user?.uid || window.isClearingData || !latestSnapshotRef.current) {
      return;
    }

    if (firestoreSaveInFlightRef.current) {
      firestoreSaveQueuedRef.current = true;
      return;
    }

    firestoreSaveInFlightRef.current = true;
    firestoreSaveQueuedRef.current = false;

    const snapshot = latestSnapshotRef.current;
    const snapshotVersion = snapshot.updatedAt;

    try {
      await saveUserData(user.uid, snapshot);
    } finally {
      firestoreSaveInFlightRef.current = false;

      const hasNewerSnapshot = latestSnapshotRef.current
        && latestSnapshotRef.current.updatedAt > snapshotVersion;

      if (firestoreSaveQueuedRef.current || hasNewerSnapshot) {
        firestoreSaveQueuedRef.current = false;
        flushCloudSave();
      }
    }
  }, [clearScheduledCloudSave, user?.uid]);

  const scheduleCloudSave = useCallback((delayMs, resetDelay = true) => {
    if (!user?.uid || window.isClearingData || !latestSnapshotRef.current) {
      return;
    }

    if (firestoreSaveInFlightRef.current) {
      firestoreSaveQueuedRef.current = true;
      return;
    }

    if (firestoreSaveTimeoutRef.current && !resetDelay) {
      return;
    }

    clearScheduledCloudSave();
    firestoreSaveTimeoutRef.current = setTimeout(() => {
      firestoreSaveTimeoutRef.current = null;
      flushCloudSave();
    }, delayMs);
  }, [clearScheduledCloudSave, flushCloudSave, user?.uid]);

  useEffect(() => {
    if (!dataLoaded) return;

    const data = { subjects, dailyLog, dailyGoal, userProfile, pomodoroSettings };
    latestSnapshotRef.current = saveData(data, user?.uid);

    if (!user?.uid) return;

    if (timer.isRunning) {
      scheduleCloudSave(5000, false);
      return;
    }

    scheduleCloudSave(1500, true);
  }, [
    subjects,
    dailyLog,
    dailyGoal,
    userProfile,
    pomodoroSettings,
    dataLoaded,
    user?.uid,
    timer.isRunning,
    scheduleCloudSave,
  ]);

  useEffect(() => () => {
    clearScheduledCloudSave();
  }, [clearScheduledCloudSave, user?.uid]);

  // --- Save immediately on tab close or hide to prevent data loss ---
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !window.isClearingData) {
        latestSnapshotRef.current = saveData(latestStateRef.current, user?.uid);
        flushCloudSave();
      }
    };

    const handleBeforeUnload = () => {
      if (window.isClearingData) return;

      latestSnapshotRef.current = saveData(latestStateRef.current, user?.uid);
      flushCloudSave();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [flushCloudSave, user?.uid]);

  // --- Day change detection ---
  useEffect(() => {
    const interval = setInterval(() => {
      const currentKey = getTodayKey(userProfile?.timezone);
      setTodayKey((prev) => (prev === currentKey ? prev : currentKey));
    }, 1000);
    return () => clearInterval(interval);
  }, [userProfile?.timezone]);

  // --- Notification permission ---
  // Requested interactively inside useTimer to improve UX


  // ==========================================
  // AUTH GUARD — show auth page or loading
  // ==========================================
  if (authLoading) {
    return (
      <div dir="rtl" className={`h-screen flex items-center justify-center font-sans ${theme === 'light' ? 'light' : ''}`}
        style={{ backgroundColor: 'var(--c-bg)' }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <div className="w-8 h-8 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  if (!dataLoaded) {
    return (
      <div dir="rtl" className={`h-screen flex items-center justify-center font-sans ${theme === 'light' ? 'light' : ''}`}
        style={{ backgroundColor: 'var(--c-bg)' }}
      >
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-violet-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-600/20">
            <span className="text-white font-black text-lg">A</span>
          </div>
          <div className="w-8 h-8 border-3 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
          <p className="text-sm font-medium" style={{ color: 'var(--c-text-muted)' }}>جارٍ تحميل بياناتك...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ACTIONS
  // ==========================================

  const handleSelectSubject = (subj, navigateToTimer = false) => {
    const wasRunningOrPaused = timer.isRunning || timer.isPaused;
    if (wasRunningOrPaused && activeSubject && activeSubject !== subj) {
      if (!window.confirm(`المؤقت يعمل حالياً على "${activeSubject}". هل تريد التبديل إلى "${subj}"؟`)) {
        return;
      }
    }
    const isNewSubject = activeSubject !== subj;
    if (isNewSubject) {
      setActiveSubject(subj);
      timer.resetCycle();
    }
    if (navigateToTimer) setCurrentView('timer');
  };

  const handleSubjectClick = (subj) => handleSelectSubject(subj, true);
  const handleSelectSubjectFromTimer = (subj) => handleSelectSubject(subj, false);

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
    const hours = Math.max(0, parseInt(editFormData.studiedH) || 0);
    const minutes = Math.max(0, Math.min(59, parseInt(editFormData.studiedM) || 0));
    
    // Preserve leftover seconds from current time to not lose them during edits
    const prevSeconds = subjects[editingSubject]?.studiedSeconds || 0;
    const remainderSeconds = prevSeconds % 60;
    
    const totalStudiedSeconds = hours * 3600 + minutes * 60 + remainderSeconds;
    
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
              pomodoroSettings={pomodoroSettings}
              setPomodoroSettings={setPomodoroSettings}
            />
          )}

          {currentView === 'settings' && (
            <SettingsPage
              userProfile={userProfile}
              setUserProfile={setUserProfile}
              dailyGoal={dailyGoal}
              setDailyGoal={setDailyGoal}
              user={user}
              onLogout={logout}
              onDeleteAccount={deleteAccount}
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
// MAIN EXPORT — wraps with ThemeProvider + AuthProvider
// ==========================================
export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppInner />
      </AuthProvider>
    </ThemeProvider>
  );
}
